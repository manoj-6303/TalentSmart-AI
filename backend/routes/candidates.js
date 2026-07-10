import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { Candidate } from '../services/db.js';
import { generateEmbedding, parseResumeText, generateAIInsights } from '../services/gemini.js';
import { upsertCandidateEmbedding, deleteCandidateVector } from '../services/vectorDb.js';

const router = express.Router();

// Multipurpose storage in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, DOC, DOCX allowed.'));
    }
  }
});

// GET /api/candidates - Get all candidates
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (error) {
    console.error('Fetch candidates error:', error);
    res.status(500).json({ error: 'Failed to retrieve candidates' });
  }
});

// GET /api/candidates/search - Semantic search
router.get('/search', async (req, res) => {
  const { query, limit = 5 } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    // 1. Generate query embedding
    const queryEmbedding = await generateEmbedding(query);
    
    // 2. Query Vector DB (Pinecone or Mock)
    const matches = await querySimilarCandidates(queryEmbedding, parseInt(limit, 10));
    
    if (!matches || matches.length === 0) {
      return res.json([]);
    }

    // 3. Fetch corresponding profiles from MongoDB / Mock DB
    const results = [];
    for (const match of matches) {
      const candidate = await Candidate.findById(match.id);
      if (candidate) {
        results.push({
          candidate,
          score: match.score
        });
      }
    }

    // Ensure they are sorted by vector score descending
    results.sort((a, b) => b.score - a.score);
    res.json(results);
  } catch (error) {
    console.error('Semantic search error:', error);
    res.status(500).json({ error: 'Semantic search execution failed' });
  }
});

// GET /api/candidates/:id - Get single candidate details
router.get('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    console.error('Fetch candidate detail error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate details' });
  }
});

// DELETE /api/candidates/:id - Delete a candidate
router.delete('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    // Delete from MongoDB/Mock DB
    await Candidate.findByIdAndDelete(req.params.id);
    // Delete from Pinecone
    await deleteCandidateVector(req.params.id);
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

// POST /api/candidates/upload - Ingest and process resume
router.post('/upload', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No resume file uploaded' });
  }

  try {
    let rawText = '';
    const mimeType = req.file.mimetype;

    if (mimeType === 'application/pdf') {
      try {
        const pdfData = await pdfParse(req.file.buffer);
        rawText = pdfData.text;
      } catch (err) {
        console.error('PDF parsing error:', err);
        return res.status(400).json({ error: 'Unable to parse PDF structure. Ensure file is not corrupted.' });
      }
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || req.file.originalname.endsWith('.docx')) {
      try {
        const docxData = await mammoth.extractRawText({ buffer: req.file.buffer });
        rawText = docxData.value;
      } catch (err) {
        console.error('DOCX parsing error:', err);
        return res.status(400).json({ error: 'Unable to parse DOCX structure. Ensure file is not corrupted.' });
      }
    } else {
      // Default treat as UTF-8 plaintext (txt, md)
      rawText = req.file.buffer.toString('utf8');
    }

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ error: 'Uploaded resume content is empty' });
    }

    // Phase A: Parse text structured with Gemini
    console.log('Ingestion: Extracting fields via Gemini...');
    const parsedData = await parseResumeText(rawText);

    // Phase B: Generate AI Insights
    console.log('Ingestion: Generating AI Insights...');
    const aiInsights = await generateAIInsights(parsedData);

    // Phase C: Save to MongoDB
    console.log('Ingestion: Creating record in MongoDB...');
    const candidate = await Candidate.create({
      name: parsedData.name || 'Unknown Candidate',
      email: parsedData.email || 'unknown@example.com',
      phone: parsedData.phone || '',
      location: parsedData.location || '',
      linkedIn: parsedData.linkedIn || '',
      github: parsedData.github || '',
      portfolio: parsedData.portfolio || '',
      summary: parsedData.summary || '',
      experienceYears: parsedData.experienceYears || 0,
      currentCompany: parsedData.currentCompany || '',
      currentDesignation: parsedData.currentDesignation || '',
      expectedSalary: parsedData.expectedSalary || '',
      noticePeriod: parsedData.noticePeriod || '',
      skills: parsedData.skills || {},
      projects: parsedData.projects || [],
      education: parsedData.education || [],
      experience: parsedData.experience || [],
      certificates: parsedData.certificates || [],
      aiInsights: aiInsights || {},
      communicationInsights: parsedData.communicationInsights || '',
      rawText: rawText
    });

    // Phase D: Generate Embeddings and Upsert to Vector Store
    console.log('Ingestion: Generating vectors and saving to Pinecone...');
    const skillsList = parsedData.skills ? Object.values(parsedData.skills).flat().join(', ') : '';
    const embeddingText = `Name: ${candidate.name}. Skills: ${skillsList}. Experience: ${candidate.experienceYears} years. Summary: ${candidate.summary}`;
    
    try {
      const embedding = await generateEmbedding(embeddingText);
      await upsertCandidateEmbedding(candidate._id.toString(), embedding, {
        name: candidate.name,
        email: candidate.email,
        skills: [skillsList.substring(0, 50)] // simplified metadata
      });
      // Save pinecone ID back to mongo
      await Candidate.findByIdAndUpdate(candidate._id, { pineconeId: candidate._id.toString() });
    } catch (vectorErr) {
      console.error('Vector DB indexing failed, but candidate was saved:', vectorErr);
    }

    console.log('Ingestion: Successfully ingested candidate profile.');
    res.status(201).json(candidate);
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: 'Resume ingestion processing failed' });
  }
});

// DELETE /api/candidates/:id - Delete candidate
router.delete('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate profile not found' });
    }
    
    // Remove vectors
    await deleteCandidateVector(req.params.id);
    
    res.json({ message: 'Candidate and vector records deleted successfully' });
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

export default router;
