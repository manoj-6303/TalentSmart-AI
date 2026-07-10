import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateEmbedding } from '../services/gemini.js';
import { upsertCandidateEmbedding } from '../services/vectorDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'mock_data', 'db.json');

async function run() {
  console.log('Seeding mock vector store...');
  try {
    if (!fs.existsSync(dbPath)) {
      console.error('db.json not found!');
      return;
    }
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const candidates = data.candidates || [];
    
    for (const cand of candidates) {
      const textToEmbed = `Name: ${cand.name}. Skills: ${cand.skills.join(', ')}. Experience: ${cand.experienceYears} years. Summary: ${cand.summary}`;
      const embedding = await generateEmbedding(textToEmbed);
      await upsertCandidateEmbedding(cand._id, embedding, {
        name: cand.name,
        email: cand.email,
        skills: cand.skills
      });
    }
    console.log('Vector store seeded successfully.');
  } catch (error) {
    console.error('Seeding vectors failed:', error);
  }
}

run();
