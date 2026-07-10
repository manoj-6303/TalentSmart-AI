import { Pinecone } from '@pinecone-database/pinecone';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MOCK_VECTORS_PATH = path.join(__dirname, '..', 'mock_data', 'vectors.json');

// Ensure vectors file exists in mock mode
const initMockVectorStore = () => {
  if (!fs.existsSync(MOCK_VECTORS_PATH)) {
    fs.writeFileSync(MOCK_VECTORS_PATH, JSON.stringify([], null, 2));
  }
};

const isMockMode = () => {
  return process.env.USE_MOCK_MODE === 'true' || 
         !process.env.PINECONE_API_KEY || 
         !process.env.PINECONE_INDEX;
};

// Simple cosine similarity computation
const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0.0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// -------------------------------------------------------------
// PINECONE / MOCK INTEGRATION
// -------------------------------------------------------------
let pineconeClient = null;
let pineconeIndex = null;

const getPineconeIndex = () => {
  if (isMockMode()) return null;
  if (!pineconeClient) {
    try {
      pineconeClient = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });
      pineconeIndex = pineconeClient.index(process.env.PINECONE_INDEX);
    } catch (e) {
      console.error('❌ Failed to initialize Pinecone Client:', e.message);
      return null;
    }
  }
  return pineconeIndex;
};

export const upsertCandidateEmbedding = async (candidateId, embedding, metadata = {}) => {
  if (isMockMode()) {
    initMockVectorStore();
    try {
      const data = fs.readFileSync(MOCK_VECTORS_PATH, 'utf8');
      let vectors = JSON.parse(data);
      
      // Update or insert
      const index = vectors.findIndex(v => v.id === candidateId);
      const vecObj = { id: candidateId, values: embedding, metadata };
      
      if (index !== -1) {
        vectors[index] = vecObj;
      } else {
        vectors.push(vecObj);
      }
      
      fs.writeFileSync(MOCK_VECTORS_PATH, JSON.stringify(vectors, null, 2));
      console.log(`🤖 Mock Vector DB: Upserted embedding for candidate ${candidateId}`);
      return true;
    } catch (e) {
      console.error('❌ Mock Vector DB upsert error:', e);
      return false;
    }
  }

  // Live Pinecone mode
  try {
    const idx = getPineconeIndex();
    if (!idx) throw new Error('Pinecone index not available');
    
    // Pinecone requires string keys and metadata values to be strings, numbers, booleans or arrays of strings
    const pineconeMetadata = {
      name: metadata.name || '',
      email: metadata.email || '',
      skills: Array.isArray(metadata.skills) ? metadata.skills.slice(0, 50) : []
    };

    await idx.upsert([{
      id: candidateId,
      values: embedding,
      metadata: pineconeMetadata
    }]);
    
    console.log(`🚀 Live Pinecone: Upserted embedding for candidate ${candidateId}`);
    return true;
  } catch (error) {
    console.error('❌ Pinecone upsert failed. Falling back to Mock Vector store.', error.message);
    // Silent failover to local vector store
    process.env.USE_MOCK_MODE = 'true';
    return upsertCandidateEmbedding(candidateId, embedding, metadata);
  }
};

export const querySimilarCandidates = async (queryEmbedding, topK = 5) => {
  if (isMockMode()) {
    initMockVectorStore();
    try {
      const data = fs.readFileSync(MOCK_VECTORS_PATH, 'utf8');
      const vectors = JSON.parse(data);
      
      const scored = vectors.map(v => {
        const score = cosineSimilarity(queryEmbedding, v.values);
        return {
          id: v.id,
          score,
          metadata: v.metadata
        };
      });
      
      // Sort and get top-K
      scored.sort((a, b) => b.score - a.score);
      const matches = scored.slice(0, topK);
      console.log(`🤖 Mock Vector DB Query: Found ${matches.length} matches`);
      return matches;
    } catch (e) {
      console.error('❌ Mock Vector DB query error:', e);
      return [];
    }
  }

  // Live Pinecone mode
  try {
    const idx = getPineconeIndex();
    if (!idx) throw new Error('Pinecone index not available');
    
    const response = await idx.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true
    });
    
    console.log(`🚀 Live Pinecone Query: Retrieved ${response.matches.length} matches`);
    return response.matches.map(match => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata
    }));
  } catch (error) {
    console.error('❌ Pinecone query failed. Falling back to Mock Vector store.', error.message);
    // Silent failover to local vector store
    process.env.USE_MOCK_MODE = 'true';
    return querySimilarCandidates(queryEmbedding, topK);
  }
};

export const deleteCandidateVector = async (candidateId) => {
  if (isMockMode()) {
    initMockVectorStore();
    try {
      const data = fs.readFileSync(MOCK_VECTORS_PATH, 'utf8');
      let vectors = JSON.parse(data);
      vectors = vectors.filter(v => v.id !== candidateId);
      fs.writeFileSync(MOCK_VECTORS_PATH, JSON.stringify(vectors, null, 2));
      console.log(`🤖 Mock Vector DB: Deleted vector for candidate ${candidateId}`);
      return true;
    } catch (e) {
      console.error('❌ Mock Vector DB delete error:', e);
      return false;
    }
  }

  // Live Pinecone mode
  try {
    const idx = getPineconeIndex();
    if (!idx) throw new Error('Pinecone index not available');
    
    await idx.deleteOne(candidateId);
    console.log(`🚀 Live Pinecone: Deleted vector for candidate ${candidateId}`);
    return true;
  } catch (error) {
    console.error('❌ Pinecone delete failed. Falling back to Mock Vector store.', error.message);
    return deleteCandidateVector(candidateId);
  }
};
