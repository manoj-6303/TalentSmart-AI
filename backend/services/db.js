import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path for local mock database
const MOCK_DB_DIR = path.join(__dirname, '..', 'mock_data');
const MOCK_DB_PATH = path.join(MOCK_DB_DIR, 'db.json');

// Ensure mock directory exists
if (!fs.existsSync(MOCK_DB_DIR)) {
  fs.mkdirSync(MOCK_DB_DIR, { recursive: true });
}

// Ensure mock file exists
if (!fs.existsSync(MOCK_DB_PATH)) {
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify({ candidates: [], jobs: [], analyses: [] }, null, 2));
}

// Generate random ID for mocks
const generateId = () => Math.random().toString(36).substr(2, 9);

// Environment variables
const isMockMode = () => {
  return process.env.USE_MOCK_MODE === 'true' || !process.env.MONGODB_URI;
};

// -------------------------------------------------------------
// 1. MONGOOSE SCHEMA & MODELS
// -------------------------------------------------------------
const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  linkedIn: { type: String, default: '' },
  github: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  summary: { type: String, default: '' },
  experienceYears: { type: Number, default: 0 },
  currentCompany: { type: String, default: '' },
  currentDesignation: { type: String, default: '' },
  expectedSalary: { type: String, default: '' },
  noticePeriod: { type: String, default: '' },
  
  skills: {
    programmingLanguages: [{ type: String }],
    frontend: [{ type: String }],
    backend: [{ type: String }],
    databases: [{ type: String }],
    cloud: [{ type: String }],
    devops: [{ type: String }],
    ai: [{ type: String }],
    softSkills: [{ type: String }]
  },

  communicationInsights: { type: String, default: '' },

  projects: [{
    name: String,
    description: String,
    technologies: [String],
    responsibilities: [String],
    duration: String,
    role: String,
    businessDomain: String
  }],

  education: [{
    degree: String,
    university: String,
    year: String,
    cgpa: String
  }],
  
  experience: [{
    company: String,
    designation: String,
    duration: String,
    responsibilities: [String],
    achievements: [String]
  }],

  certificates: [{
    name: String,
    organization: String,
    issuedDate: String,
    credentialLink: String
  }],

  aiInsights: {
    candidateSummary: String,
    careerLevel: String,
    strengths: [String],
    weaknesses: [String],
    recommendedRoles: [String],
    missingSkills: [String],
    hiringReadiness: String,
    confidenceScore: Number
  },

  rawText: { type: String, default: '' },
  pineconeId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, default: '' },
  location: { type: String, default: '' },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const AnalysisSchema = new mongoose.Schema({
  candidateId: { type: String, required: true },
  jobId: { type: String, required: true },
  fitScore: { type: Number, required: true },
  pros: [{ type: String }],
  cons: [{ type: String }],
  interviewQuestions: [{ type: String }],
  emailDraft: { type: String, default: '' },
  status: { type: String, default: 'Applied' },
  updatedAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

let MongoCandidate = null;
let MongoJob = null;
let MongoAnalysis = null;
let MongoUser = null;

try {
  MongoCandidate = mongoose.model('Candidate', CandidateSchema);
  MongoJob = mongoose.model('Job', JobSchema);
  MongoAnalysis = mongoose.model('Analysis', AnalysisSchema);
  MongoUser = mongoose.model('User', UserSchema);
} catch (e) {
  MongoCandidate = mongoose.models.Candidate;
  MongoJob = mongoose.models.Job;
  MongoAnalysis = mongoose.models.Analysis;
  MongoUser = mongoose.models.User;
}

// -------------------------------------------------------------
// 2. FILE-BASED MOCK DATABASE API
// -------------------------------------------------------------
class MockModel {
  constructor(collectionName) {
    this.collectionName = collectionName; // 'candidates', 'jobs', or 'analyses'
  }

  read() {
    try {
      const data = fs.readFileSync(MOCK_DB_PATH, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      return { candidates: [], jobs: [], analyses: [] };
    }
  }

  write(data) {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2));
  }

  async find(query = {}) {
    const data = this.read();
    let list = data[this.collectionName] || [];
    
    // Simple filter
    return list.filter(item => {
      for (let key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async findById(id) {
    const data = this.read();
    const list = data[this.collectionName] || [];
    const found = list.find(item => item._id === id);
    return found || null;
  }

  async findOne(query = {}) {
    const results = await this.find(query);
    return results[0] || null;
  }

  async create(doc) {
    const data = this.read();
    if (!data[this.collectionName]) {
      data[this.collectionName] = [];
    }
    const newDoc = {
      _id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    data[this.collectionName].push(newDoc);
    this.write(data);
    return newDoc;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const data = this.read();
    const list = data[this.collectionName] || [];
    const index = list.findIndex(item => item._id === id);
    if (index === -1) return null;

    const updatedDoc = {
      ...list[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    list[index] = updatedDoc;
    data[this.collectionName] = list;
    this.write(data);
    return updatedDoc;
  }

  async findOneAndUpdate(query, update, options = {}) {
    const data = this.read();
    const list = data[this.collectionName] || [];
    const found = list.find(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    if (!found) {
      if (options.upsert) {
        return this.create({ ...query, ...update });
      }
      return null;
    }
    return this.findByIdAndUpdate(found._id, update, options);
  }

  async findByIdAndDelete(id) {
    const data = this.read();
    const list = data[this.collectionName] || [];
    const index = list.findIndex(item => item._id === id);
    if (index === -1) return null;

    const deleted = list.splice(index, 1)[0];
    data[this.collectionName] = list;
    this.write(data);
    return deleted;
  }

  async deleteOne(query = {}) {
    const data = this.read();
    const list = data[this.collectionName] || [];
    const index = list.findIndex(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    if (index === -1) return { deletedCount: 0 };
    list.splice(index, 1);
    data[this.collectionName] = list;
    this.write(data);
    return { deletedCount: 1 };
  }
}

const MockCandidate = new MockModel('candidates');
const MockJob = new MockModel('jobs');
const MockAnalysis = new MockModel('analyses');
const MockUser = new MockModel('users');

// -------------------------------------------------------------
// 3. UNIFIED EXPORTS
// -------------------------------------------------------------
export const connectDB = async () => {
  if (isMockMode()) {
    console.log('🤖 Running in SANDBOX / MOCK Database Mode (using mock_data/db.json)');
    return true;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🚀 Connected to MongoDB Atlas successfully.');
    return true;
  } catch (error) {
    console.error('❌ Mongoose connection failed. Falling back to MOCK mode.');
    console.error(error.message);
    process.env.USE_MOCK_MODE = 'true';
    return false;
  }
};

// Proxy models based on running mode
export const Candidate = {
  find: (q) => isMockMode() ? MockCandidate.find(q) : MongoCandidate.find(q),
  findById: (id) => isMockMode() ? MockCandidate.findById(id) : MongoCandidate.findById(id),
  findOne: (q) => isMockMode() ? MockCandidate.findOne(q) : MongoCandidate.findOne(q),
  create: (doc) => isMockMode() ? MockCandidate.create(doc) : MongoCandidate.create(doc),
  findByIdAndUpdate: (id, update, opts) => isMockMode() ? MockCandidate.findByIdAndUpdate(id, update, opts) : MongoCandidate.findByIdAndUpdate(id, update, opts),
  findOneAndUpdate: (q, update, opts) => isMockMode() ? MockCandidate.findOneAndUpdate(q, update, opts) : MongoCandidate.findOneAndUpdate(q, update, opts),
  findByIdAndDelete: (id) => isMockMode() ? MockCandidate.findByIdAndDelete(id) : MongoCandidate.findByIdAndDelete(id),
  deleteOne: (q) => isMockMode() ? MockCandidate.deleteOne(q) : MongoCandidate.deleteOne(q)
};

export const Job = {
  find: (q) => isMockMode() ? MockJob.find(q) : MongoJob.find(q),
  findById: (id) => isMockMode() ? MockJob.findById(id) : MongoJob.findById(id),
  findOne: (q) => isMockMode() ? MockJob.findOne(q) : MongoJob.findOne(q),
  create: (doc) => isMockMode() ? MockJob.create(doc) : MongoJob.create(doc),
  findByIdAndUpdate: (id, update, opts) => isMockMode() ? MockJob.findByIdAndUpdate(id, update, opts) : MongoJob.findByIdAndUpdate(id, update, opts),
  findOneAndUpdate: (q, update, opts) => isMockMode() ? MockJob.findOneAndUpdate(q, update, opts) : MongoJob.findOneAndUpdate(q, update, opts),
  findByIdAndDelete: (id) => isMockMode() ? MockJob.findByIdAndDelete(id) : MongoJob.findByIdAndDelete(id)
};

export const Analysis = {
  find: (q) => isMockMode() ? MockAnalysis.find(q) : MongoAnalysis.find(q),
  findById: (id) => isMockMode() ? MockAnalysis.findById(id) : MongoAnalysis.findById(id),
  findOne: (q) => isMockMode() ? MockAnalysis.findOne(q) : MongoAnalysis.findOne(q),
  create: (doc) => isMockMode() ? MockAnalysis.create(doc) : MongoAnalysis.create(doc),
  findByIdAndUpdate: (id, update, opts) => isMockMode() ? MockAnalysis.findByIdAndUpdate(id, update, opts) : MongoAnalysis.findByIdAndUpdate(id, update, opts),
  findOneAndUpdate: (q, update, opts) => isMockMode() ? MockAnalysis.findOneAndUpdate(q, update, opts) : MongoAnalysis.findOneAndUpdate(q, update, opts),
  findByIdAndDelete: (id) => isMockMode() ? MockAnalysis.findByIdAndDelete(id) : MongoAnalysis.findByIdAndDelete(id),
  deleteOne: (q) => isMockMode() ? MockAnalysis.deleteOne(q) : MongoAnalysis.deleteOne(q)
};

export const User = {
  find: (q) => isMockMode() ? MockUser.find(q) : MongoUser.find(q),
  findById: (id) => isMockMode() ? MockUser.findById(id) : MongoUser.findById(id),
  findOne: (q) => isMockMode() ? MockUser.findOne(q) : MongoUser.findOne(q),
  create: (doc) => isMockMode() ? MockUser.create(doc) : MongoUser.create(doc),
  findByIdAndUpdate: (id, update, opts) => isMockMode() ? MockUser.findByIdAndUpdate(id, update, opts) : MongoUser.findByIdAndUpdate(id, update, opts),
  findOneAndUpdate: (q, update, opts) => isMockMode() ? MockUser.findOneAndUpdate(q, update, opts) : MongoUser.findOneAndUpdate(q, update, opts),
  findByIdAndDelete: (id) => isMockMode() ? MockUser.findByIdAndDelete(id) : MongoUser.findByIdAndDelete(id),
  deleteOne: (q) => isMockMode() ? MockUser.deleteOne(q) : MongoUser.deleteOne(q)
};
