import express from 'express';
import { Job } from '../services/db.js';

const router = express.Router();

// GET /api/jobs - List all JDs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (error) {
    console.error('Fetch jobs error:', error);
    res.status(500).json({ error: 'Failed to retrieve job descriptions' });
  }
});

// POST /api/jobs - Create a new JD
router.post('/', async (req, res) => {
  const { title, department, location, description, requirements } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and Description are required' });
  }

  try {
    // Requirements split if it is passed as a comma-separated string or array
    let processedRequirements = [];
    if (Array.isArray(requirements)) {
      processedRequirements = requirements.filter(Boolean);
    } else if (typeof requirements === 'string') {
      processedRequirements = requirements.split(',').map(r => r.trim()).filter(Boolean);
    }

    const newJob = await Job.create({
      title,
      department: department || 'General',
      location: location || 'Remote',
      description,
      requirements: processedRequirements
    });

    res.status(201).json(newJob);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job description' });
  }
});

// DELETE /api/jobs/:id - Delete a JD
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job description not found' });
    }
    res.json({ message: 'Job description deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job description' });
  }
});

export default router;
