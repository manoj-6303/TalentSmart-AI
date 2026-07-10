import express from 'express';
import { Candidate, Job, Analysis } from '../services/db.js';
import { analyzeFit, generateEmail } from '../services/gemini.js';

const router = express.Router();

// GET /api/analysis - Retrieve analysis record
router.get('/', async (req, res) => {
  const { jobId, candidateId } = req.query;
  try {
    if (jobId && candidateId) {
      const analysis = await Analysis.findOne({ jobId: jobId.toString(), candidateId: candidateId.toString() });
      return res.json(analysis || null);
    }
    const analyses = await Analysis.find();
    res.json(analyses);
  } catch (error) {
    console.error('Fetch analysis error:', error);
    res.status(500).json({ error: 'Failed to retrieve analysis records' });
  }
});

// POST /api/analysis - Run/Trigger RAG-based Fit Analysis
router.post('/', async (req, res) => {
  const { jobId, candidateId } = req.body;

  if (!jobId || !candidateId) {
    return res.status(400).json({ error: 'jobId and candidateId are required fields' });
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job Description not found' });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate profile not found' });
    }

    console.log(`Running RAG Analysis for ${candidate.name} -> Job: ${job.title}`);
    
    // Run Gemini fit analysis
    const fitData = await analyzeFit(job, candidate);

    // Save or update analysis record
    // Mongoose findOneAndUpdate, Mock model findOneAndUpdate
    const analysis = await Analysis.findOneAndUpdate(
      { jobId: jobId.toString(), candidateId: candidateId.toString() },
      {
        fitScore: fitData.fitScore,
        pros: fitData.pros || [],
        cons: fitData.cons || [],
        interviewQuestions: fitData.interviewQuestions || [],
        // Reset draft on re-analysis
        emailDraft: '',
        updatedAt: new Date().toISOString()
      },
      { upsert: true, new: true }
    );

    res.json(analysis);
  } catch (error) {
    console.error('Analysis runtime error:', error);
    res.status(500).json({ error: 'Failed to perform fit analysis processing' });
  }
});

// POST /api/analysis/email - Generate automated draft response
router.post('/email', async (req, res) => {
  const { jobId, candidateId, emailType } = req.body; // emailType: 'interview' or 'rejection'

  if (!jobId || !candidateId || !emailType) {
    return res.status(400).json({ error: 'jobId, candidateId and emailType are required fields' });
  }

  try {
    const job = await Job.findById(jobId);
    const candidate = await Candidate.findById(candidateId);
    if (!job || !candidate) {
      return res.status(404).json({ error: 'Job or Candidate record not found' });
    }

    const analysis = await Analysis.findOne({ jobId: jobId.toString(), candidateId: candidateId.toString() });
    if (!analysis) {
      return res.status(400).json({ error: 'You must run the Fit Analysis first before drafting communication.' });
    }

    console.log(`Generating ${emailType} email draft for candidate ${candidate.name}...`);
    const draft = await generateEmail(candidate.name, job.title, analysis, emailType);

    // Update status in db
    const nextStatus = emailType === 'interview' ? 'Interviewing' : 'Rejected';
    const updatedAnalysis = await Analysis.findOneAndUpdate(
      { jobId: jobId.toString(), candidateId: candidateId.toString() },
      { emailDraft: draft, status: nextStatus },
      { new: true }
    );

    res.json(updatedAnalysis);
  } catch (error) {
    console.error('Email generation runtime error:', error);
    res.status(500).json({ error: 'Failed to generate personalized email draft' });
  }
});

// POST /api/analysis/status - Manually update application status (Applied, Shortlisted, etc.)
router.post('/status', async (req, res) => {
  const { jobId, candidateId, status } = req.body;
  if (!jobId || !candidateId || !status) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const updatedAnalysis = await Analysis.findOneAndUpdate(
      { jobId: jobId.toString(), candidateId: candidateId.toString() },
      { status },
      { upsert: true, new: true }
    );
    res.json(updatedAnalysis);
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
