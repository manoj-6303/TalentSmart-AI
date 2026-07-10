import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';
import { Candidate } from '../services/db.js';
import { parseResumeText, generateEmbedding } from '../services/gemini.js';
import { upsertCandidateEmbedding } from '../services/vectorDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pointing to the folder you added in mock_data
// If the folder is named something else like "resumes", change this variable
const RESUMES_DIR = path.join(__dirname, '..', 'mock_data', 'Resumes.csv'); 

async function processResumes() {
  console.log(`Looking for Word documents in: ${RESUMES_DIR}`);
  if (!fs.existsSync(RESUMES_DIR)) {
    console.error(`ERROR: Directory not found. Please make sure the folder is placed at ${RESUMES_DIR}`);
    return;
  }

  const files = fs.readdirSync(RESUMES_DIR).filter(f => f.endsWith('.docx') || f.endsWith('.doc'));
  console.log(`Found ${files.length} Word document(s) to process.`);

  for (const file of files) {
    const filePath = path.join(RESUMES_DIR, file);
    console.log(`\n---------------------------------`);
    console.log(`Processing: ${file}`);
    
    try {
      // 1. Read Word Document
      const result = await mammoth.extractRawText({ path: filePath });
      const text = result.value;
      
      console.log(`Extracted text successfully. Parsing with Gemini AI...`);
      
      // 2. Parse text with Gemini
      const parsedData = await parseResumeText(text);
      
      // 3. Save to database
      const candidateId = await Candidate.create({
         name: parsedData.name || "Unknown Candidate",
         email: parsedData.email || "",
         phone: parsedData.phone || "",
         summary: parsedData.summary || "",
         experienceYears: parsedData.experienceYears || 0,
         skills: parsedData.skills || [],
         education: parsedData.education || [],
         experience: parsedData.experience || [],
         rawText: text
      });

      console.log(`Candidate saved to database with ID: ${candidateId}`);

      // 4. Generate AI Embeddings for Vector Search
      const embeddingText = `${(parsedData.skills || []).join(' ')} ${parsedData.summary || ""}`;
      if (embeddingText.trim().length > 0) {
        console.log(`Generating Pinecone embeddings...`);
        const embedding = await generateEmbedding(embeddingText);
        await upsertCandidateEmbedding(candidateId, embedding, { 
            name: parsedData.name, 
            skills: parsedData.skills 
        });
        console.log(`Embeddings saved successfully!`);
      }

    } catch (err) {
      console.error(`Failed processing ${file}:`, err);
    }
  }
  
  console.log(`\n---------------------------------`);
  console.log("Finished processing all resumes!");
}

processResumes();
