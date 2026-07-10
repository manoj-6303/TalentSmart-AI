import { connectDB, Candidate, Job, Analysis } from './services/db.js';
import { generateEmbedding, parseResumeText, analyzeFit } from './services/gemini.js';
import { querySimilarCandidates, upsertCandidateEmbedding } from './services/vectorDb.js';
import dotenv from 'dotenv';

dotenv.config();

async function runTests() {
  console.log('🧪 Starting HireSmart Backend Services Test suite...\n');

  // Test 1: Connect DB
  console.log('1. Testing Database Connection...');
  const dbConnected = await connectDB();
  if (dbConnected) {
    console.log('✅ DB Connection check successful.\n');
  } else {
    console.log('❌ DB Connection check failed.\n');
  }

  // Test 2: Fetch Mock Candidates
  console.log('2. Querying Candidates list...');
  try {
    const list = await Candidate.find();
    console.log(`✅ Found ${list.length} candidates in database.`);
    list.forEach(c => console.log(`   - Candidate ID: ${c._id}, Name: ${c.name}, Skills: ${c.skills?.slice(0, 3).join(', ')}`));
    console.log('');
  } catch (err) {
    console.log('❌ Querying candidates failed:', err.message, '\n');
  }

  // Test 3: Cosine Similarity Vector Search
  console.log('3. Testing Local Vector Match Cosine Similarity...');
  try {
    // Generate query embedding for "React Frontend"
    const query = "React Frontend Developer";
    const queryVec = await generateEmbedding(query);
    const matches = await querySimilarCandidates(queryVec, 2);
    
    console.log(`✅ Semantic search matches for "${query}":`);
    for (const match of matches) {
      const details = await Candidate.findById(match.id);
      console.log(`   - [Score: ${Math.round(match.score * 100)}%] Candidate: ${details?.name || 'Unknown'}, Skills: ${details?.skills?.slice(0, 4).join(', ')}`);
    }
    console.log('');
  } catch (err) {
    console.log('❌ Vector similarity test failed:', err.message, '\n');
  }

  // Test 4: RAG Fit Analysis Simulation
  console.log('4. Testing RAG Fit Analysis...');
  try {
    const candidate = (await Candidate.find())[0];
    const job = (await Job.find())[0];
    
    if (candidate && job) {
      console.log(`   Running fit analysis for ${candidate.name} against ${job.title}...`);
      const analysis = await analyzeFit(job, candidate);
      console.log('✅ Fit Analysis response received:');
      console.log(`   - Fit Score: ${analysis.fitScore}/100`);
      console.log(`   - Pros: ${analysis.pros?.slice(0, 2).join('; ')}`);
      console.log(`   - Cons: ${analysis.cons?.slice(0, 2).join('; ')}`);
      console.log('   - Suggested Questions:');
      analysis.interviewQuestions?.forEach((q, idx) => console.log(`     ${idx + 1}. ${q}`));
    } else {
      console.log('⚠️ Skipping RAG test: Ensure db.json is populated with candidates and jobs.');
    }
    console.log('');
  } catch (err) {
    console.log('❌ RAG fit analysis test failed:', err.message, '\n');
  }

  console.log('🧪 Tests complete.');
}

runTests();
