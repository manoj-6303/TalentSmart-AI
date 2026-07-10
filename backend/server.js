import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './services/db.js';
import candidateRouter from './routes/candidates.js';
import jobRouter from './routes/jobs.js';
import analysisRouter from './routes/analysis.js';
import authRouter from './routes/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environmental variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all domains during development
app.use(cors());
app.use(express.json());

// Boot databases
await connectDB();

// Config Status Endpoint for Frontend Status Pill
app.get('/api/config-status', (req, res) => {
  const mockMode = process.env.USE_MOCK_MODE === 'true' || 
                   !process.env.GEMINI_API_KEY || 
                   !process.env.MONGODB_URI || 
                   !process.env.PINECONE_API_KEY;

  res.json({
    mockMode,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    hasMongoUri: !!process.env.MONGODB_URI,
    hasPineconeKey: !!process.env.PINECONE_API_KEY,
    pineconeIndex: process.env.PINECONE_INDEX || 'N/A'
  });
});

// Update Config Endpoint (so UI Settings can dynamically update backend credentials)
app.post('/api/config-update', async (req, res) => {
  const { geminiKey, mongoUri, pineconeKey, pineconeIndex, pineconeHost, useMockMode } = req.body;

  try {
    if (geminiKey !== undefined) process.env.GEMINI_API_KEY = geminiKey;
    if (mongoUri !== undefined) process.env.MONGODB_URI = mongoUri;
    if (pineconeKey !== undefined) process.env.PINECONE_API_KEY = pineconeKey;
    if (pineconeIndex !== undefined) process.env.PINECONE_INDEX = pineconeIndex;
    if (pineconeHost !== undefined) process.env.PINECONE_HOST = pineconeHost;
    if (useMockMode !== undefined) process.env.USE_MOCK_MODE = String(useMockMode);

    // Re-trigger DB connection checks
    const dbConnected = await connectDB();

    res.json({
      success: true,
      message: 'Configuration updated successfully.',
      mockMode: process.env.USE_MOCK_MODE === 'true',
      dbConnected
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Register routers
app.use('/api/candidates', candidateRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/auth', authRouter);

// Basic Health Check Route (API)
app.get('/api/health', (req, res) => {
  res.json({ name: 'HireSmart AI API', status: 'healthy', version: '1.0.0' });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all route to serve index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error occurred: ' + err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 HireSmart Backend server running on port http://localhost:${PORT}`);
});
