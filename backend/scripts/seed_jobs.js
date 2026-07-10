import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'mock_data', 'db.json');

const sampleJobs = [
  {
    _id: "job_" + Math.random().toString(36).substring(2, 9),
    title: "Senior Full Stack Engineer",
    department: "Engineering",
    location: "Remote - US",
    type: "Full-time",
    status: "Open",
    createdAt: new Date().toISOString(),
    description: "We are looking for an experienced Full Stack Engineer to lead the development of our core web applications. You will be working with React, Node.js, and MongoDB. The ideal candidate has 5+ years of experience in building scalable distributed systems.",
    requirements: [
      "5+ years of experience with React and Node.js",
      "Strong understanding of database design (MongoDB, PostgreSQL)",
      "Experience with cloud platforms (AWS or GCP)",
      "Excellent communication and leadership skills"
    ]
  },
  {
    _id: "job_" + Math.random().toString(36).substring(2, 9),
    title: "Product Marketing Manager",
    department: "Marketing",
    location: "New York, NY",
    type: "Full-time",
    status: "Open",
    createdAt: new Date().toISOString(),
    description: "Join our fast-growing marketing team to shape the voice of our product. You will create go-to-market strategies, manage product launches, and collaborate closely with product and sales teams to drive adoption.",
    requirements: [
      "3+ years in B2B product marketing",
      "Proven track record of successful product launches",
      "Strong analytical skills to measure campaign success",
      "Exceptional copywriting and storytelling ability"
    ]
  },
  {
    _id: "job_" + Math.random().toString(36).substring(2, 9),
    title: "Data Scientist",
    department: "Data",
    location: "San Francisco, CA (Hybrid)",
    type: "Full-time",
    status: "Open",
    createdAt: new Date().toISOString(),
    description: "We are seeking a Data Scientist to help us build predictive models and extract actionable insights from large datasets. You will be working with Python, SQL, and cutting-edge machine learning frameworks.",
    requirements: [
      "M.S. or Ph.D. in Computer Science, Statistics, or related field",
      "Proficiency in Python (Pandas, Scikit-learn, TensorFlow)",
      "Advanced SQL skills",
      "Experience with NLP and Large Language Models is a plus"
    ]
  }
];

try {
  let dbData = { candidates: [], jobs: [], analyses: [], users: [] };
  
  if (fs.existsSync(dbPath)) {
    const fileContent = fs.readFileSync(dbPath, 'utf8');
    dbData = JSON.parse(fileContent);
  }
  
  if (!dbData.jobs) {
    dbData.jobs = [];
  }
  
  // Clear old dummy jobs if we want, or just append
  // Let's just append
  dbData.jobs.push(...sampleJobs);
  
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
  console.log(`Successfully added ${sampleJobs.length} sample job openings!`);
} catch (error) {
  console.error("Error seeding jobs:", error);
}
