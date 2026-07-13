# TalentSmart AI – Intelligent AI-Powered Recruitment Management Platform

TalentSmart AI is a next-generation AI-powered recruitment platform built using the MERN Stack, Google Gemini AI, Pinecone Vector Database, and Retrieval-Augmented Generation (RAG). The platform is designed to streamline and modernize the hiring process by enabling recruiters to intelligently analyze resumes, perform semantic candidate searches, generate AI-driven hiring insights, and automate recruitment workflows.

Unlike traditional Applicant Tracking Systems (ATS) that depend on exact keyword matching, TalentSmart AI understands the meaning and context of resumes and job descriptions through Semantic Search and RAG. This enables recruiters to identify highly qualified candidates even when different terminology is used in resumes.

The platform automates the complete recruitment lifecycle, from resume upload and AI-powered parsing to candidate evaluation, interview preparation, and recruiter communication. Each uploaded resume is processed using Google Gemini to extract structured information including personal details, skills, education, projects, certifications, and professional experience. The extracted information is stored in MongoDB Atlas, while vector embeddings are generated and indexed in Pinecone to enable intelligent semantic search.

Using a Retrieval-Augmented Generation (RAG) pipeline, TalentSmart AI retrieves the relevant candidate resume and job description before generating AI responses. This ensures accurate, context-aware candidate analysis, fit scoring, strengths, weaknesses, missing skills, hiring recommendations, interview questions, and personalized recruitment emails.

The platform includes recruiter dashboards for managing candidates, job descriptions, AI-powered analytics, interview preparation, automated communication, and recruitment insights. Its scalable architecture allows future integration of advanced AI capabilities such as Resume Chat, Resume Anonymization, Candidate Ranking, LinkedIn Profile Import, and Predictive Hiring Analytics.

TalentSmart AI demonstrates the integration of modern web technologies, Agentic AI concepts, Large Language Models (LLMs), Vector Databases, and Retrieval-Augmented Generation to build a real-world intelligent recruitment platform capable of improving hiring efficiency, reducing manual effort, and enabling better hiring decisions.

---

# Project Overview

Recruitment teams often receive hundreds of applications for a single job opening. Traditional Applicant Tracking Systems filter resumes using exact keyword matching, which can overlook highly qualified candidates who describe their experience differently.

TalentSmart AI addresses this challenge by combining Artificial Intelligence, Semantic Search, and Retrieval-Augmented Generation to analyze resumes based on context rather than keywords. Recruiters can upload resumes, create job descriptions, search candidates naturally, evaluate candidate-job compatibility, generate interview questions, and draft professional emails using AI.

The platform significantly reduces manual recruitment effort while improving hiring accuracy and decision-making.

---

# Features

- AI Resume Parsing
- Structured Candidate Profile Generation
- Semantic Candidate Search
- AI Candidate Fit Analysis
- AI Fit Score (0–100)
- AI Skill Gap Detection
- Context-Aware Interview Question Generation
- Automated Email Draft Generator
- Candidate Management Dashboard
- Job Description Management
- Recruitment Analytics Dashboard
- Secure Authentication
- Responsive User Interface

---

# Tech Stack

## Frontend

- React.js
- React Router
- Axios
- Tailwind CSS
- React Icons

## Backend

- Node.js
- Express.js
- REST API
- Multer
- JWT Authentication

## Database

- MongoDB Atlas

## AI Services

- Google Gemini API
- Gemini Embedding Models

## Vector Database

- Pinecone

## Deployment

- Render (Backend)
- Vercel / Render Static Site (Frontend)

---

# Project Architecture

```
React Frontend
        │
        ▼
Axios API Requests
        │
        ▼
Node.js + Express Backend
        │
 ┌──────┼──────────────┐
 │                      │
 ▼                      ▼
MongoDB Atlas      Google Gemini AI
 │                      │
 ▼                      ▼
Candidate Data     AI Analysis
                       │
                       ▼
              Pinecone Vector Database
                       │
                       ▼
               Semantic Retrieval
                       │
                       ▼
                AI Generated Results
```

---

# Workflow

1. Recruiter logs into the system.
2. Creates or selects a Job Description.
3. Uploads a candidate resume (PDF/DOCX/TXT).
4. Backend extracts resume text.
5. Google Gemini parses resume into structured JSON.
6. Candidate profile is stored in MongoDB.
7. Resume embeddings are generated.
8. Embeddings are stored in Pinecone.
9. Recruiter searches candidates using natural language.
10. Semantic Search retrieves relevant candidates.
11. RAG retrieves Resume + Job Description.
12. Gemini generates:
   - Fit Score
   - Strengths
   - Weaknesses
   - Missing Skills
   - Hiring Recommendation
13. AI generates interview questions.
14. AI drafts Interview Invitation or Rejection Email.
15. Recruiter reviews and finalizes hiring decisions.

---

# AI Features

## AI Resume Parsing

Automatically extracts:

- Name
- Email
- Phone Number
- Skills
- Education
- Experience
- Projects
- Certifications
- Languages

---

## Semantic Search

Example Search:

> Find a Full Stack Developer with scalable backend experience using Node.js and MongoDB.

Instead of searching keywords, TalentSmart AI searches based on semantic meaning.

---

## Retrieval-Augmented Generation (RAG)

Inputs:

- Candidate Resume
- Job Description

Outputs:

- Candidate Fit Score
- Technical Strengths
- Missing Skills
- Improvement Suggestions
- Hiring Recommendation

---

## Interview Question Generator

Generates personalized:

- Technical Questions
- Behavioral Questions
- Project-Based Questions
- Experience Validation Questions

---

## Automated Email Assistant

Automatically drafts:

- Interview Invitation
- Rejection Email
- Offer Letter
- Follow-up Email

---

# Folder Structure

```
TalentSmart-AI
│
├── frontend
│   ├── src
│   ├── public
│   ├── components
│   ├── pages
│   └── package.json
│
├── backend
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── config
│   ├── uploads
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

# Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000

USE_MOCK_MODE=false

GEMINI_API_KEY=YOUR_GEMINI_API_KEY

MONGODB_URI=YOUR_MONGODB_URI

PINECONE_API_KEY=YOUR_PINECONE_API_KEY

PINECONE_INDEX=talentsmart

PINECONE_HOST=YOUR_PINECONE_HOST

JWT_SECRET=YOUR_SECRET_KEY
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/TalentSmart-AI.git
```

## Backend

```bash
cd backend

npm install

npm run dev
```

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# API Workflow

```
React Frontend
        │
        ▼
Axios
        │
        ▼
Express API
        │
        ▼
Controllers
        │
        ▼
Business Services
        │
        ▼
Google Gemini
        │
        ▼
MongoDB + Pinecone
        │
        ▼
AI Response
        │
        ▼
React Dashboard
```

---

# Advantages

- AI-driven recruitment automation
- Context-aware resume understanding
- Semantic candidate search
- Faster hiring process
- Personalized interview preparation
- Automated recruiter communication
- Scalable microservice-ready architecture
- Improved hiring accuracy
- Reduced manual screening effort

---

# Limitations

- Requires internet connectivity
- AI response quality depends on resume quality
- External API latency
- Pinecone free-tier limitations
- LLM API usage costs for production

---

# Future Enhancements

- Resume Chat Assistant
- Resume Anonymization
- LinkedIn Profile Import
- AI Candidate Ranking
- Video Interview Analysis
- Voice-based Interview Assistant
- Predictive Hiring Analytics
- Multi-language Resume Support
- Recruiter Collaboration
- Calendar Integration

---

# Developed By

**Manoj Satyavaraprasad Amarapu**

Full Stack Developer | AI Engineer

GitHub: https://github.com/manoj-6303

---

# License

This project is developed for educational, research, and portfolio demonstration purposes.
