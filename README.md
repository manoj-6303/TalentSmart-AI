# HireSmart – AI-Powered Intelligent Recruitment Dashboard

HireSmart is a modern AI-powered Applicant Tracking System (ATS) built using the MERN Stack, Google Gemini AI, and Pinecone Vector Database. It helps recruiters intelligently screen resumes, perform semantic candidate searches, generate AI-driven hiring insights, and automate recruitment workflows.

---

# Project Overview

Traditional ATS platforms rely on keyword matching, which often misses qualified candidates. HireSmart uses Semantic Search and Retrieval-Augmented Generation (RAG) to understand the meaning of resumes and job descriptions, enabling more accurate candidate evaluation.

---

# Features

- AI Resume Parsing & Structured Data Extraction
- Semantic Candidate Search using Pinecone
- RAG-Based Candidate Fit Analysis
- AI Fit Score (0–100)
- AI Interview Question Generator
- Automated Email Assistant
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
- Tailwind CSS / CSS

## Backend

- Node.js
- Express.js
- Multer
- REST APIs
- JWT Authentication

## Database

- MongoDB Atlas

## Vector Database

- Pinecone

## AI Services

- Google Gemini API
- Gemini Embedding Model

## Deployment

- Render (Backend)
- Vercel / Render Static Site (Frontend)

---

# Project Architecture

```
React Frontend
       │
       ▼
Axios API Calls
       │
       ▼
Node.js + Express Backend
       │
 ┌─────┼───────────────┐
 │                     │
 ▼                     ▼
MongoDB Atlas      Google Gemini
 │                     │
 ▼                     ▼
Candidate Data     AI Analysis
                     │
                     ▼
              Pinecone Vector DB
                     │
                     ▼
             Semantic Search
```

---

# Workflow

1. Recruiter logs in
2. Uploads Candidate Resume
3. Resume text is extracted
4. Gemini parses the resume into structured JSON
5. Candidate data is stored in MongoDB
6. Resume embeddings are generated
7. Embeddings are stored in Pinecone
8. Candidate appears in the dashboard
9. Recruiter performs Semantic Search
10. AI generates Fit Analysis
11. AI creates Interview Questions
12. AI drafts personalized emails

---

# AI Features

## Resume Parsing

Extracts:

- Name
- Email
- Phone
- Skills
- Experience
- Education
- Projects
- Certifications

## Semantic Search

Example search:

> Find a Backend Developer with scalable API experience.

Instead of keyword matching, HireSmart searches based on meaning.

## RAG-Based Fit Analysis

Compares:

- Resume
- Job Description

Generates:

- Fit Score
- Strengths
- Weaknesses
- Missing Skills
- Hiring Recommendation

## Interview Question Generator

Creates personalized:

- Technical Questions
- Behavioral Questions
- Project-Based Questions

## Email Assistant

Generates:

- Interview Invitation
- Offer Letter
- Rejection Email

---

# Folder Structure

```
HireSmart
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├
