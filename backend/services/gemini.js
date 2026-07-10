import { GoogleGenerativeAI } from '@google/generative-ai';

// Toggle Mock Mode if api key is missing
const isMockMode = () => {
  return process.env.USE_MOCK_MODE === 'true' || !process.env.GEMINI_API_KEY;
};

// -------------------------------------------------------------
// DETERMINISTIC MOCK GENERATION SYSTEM
// -------------------------------------------------------------

// Local word hashing to produce a mock 768-dimension vector
const generateMockEmbedding = (text) => {
  const dimensions = 768;
  const vec = new Array(dimensions).fill(0);
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);
  if (words.length === 0) return vec;
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = (hash << 5) - hash + word.charCodeAt(j);
      hash |= 0;
    }
    let seed = Math.abs(hash);
    const lcg = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    for (let k = 0; k < 5; k++) {
      const index = Math.floor(lcg() * dimensions);
      const weight = lcg() * 2 - 1;
      vec[index] += weight;
    }
  }

  // Normalize
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vec[i] /= norm;
    }
  }
  return vec;
};

// Regex resume parser for mock mode
const mockParseResume = (text) => {
  const cleanText = text || '';
  
  // 1. Email Extraction
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const emailMatch = cleanText.match(emailRegex);
  const email = emailMatch ? emailMatch[0] : 'candidate@hiresmart-demo.io';

  // 2. Phone Extraction
  const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phoneMatch = cleanText.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0] : '+1 (555) 019-2831';

  // 3. Name Extraction (Grab first non-empty line or fallback)
  const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
  let name = 'Alex Mercer';
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length < 40 && !firstLine.toLowerCase().includes('resume') && !firstLine.toLowerCase().includes('cv')) {
      name = firstLine;
    }
  }

  // 4. Skills extraction
  const skillKeywords = [
    'React', 'Node.js', 'Express', 'JavaScript', 'TypeScript', 'HTML', 'CSS',
    'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C++', 'C#', '.NET',
    'MongoDB', 'PostgreSQL', 'SQL', 'MySQL', 'Redis', 'Pinecone', 'Vector DB',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'DevOps', 'CI/CD',
    'MERN Stack', 'Redux', 'GraphQL', 'REST API', 'Next.js', 'Vue.js'
  ];
  
  const skills = [];
  skillKeywords.forEach(skill => {
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    // Special handling for Node.js
    if (skill === 'Node.js' && /node\.?js/gi.test(cleanText)) {
      skills.push(skill);
    } else if (regex.test(cleanText) && !skills.includes(skill)) {
      skills.push(skill);
    }
  });

  // Default skills if none found
  if (skills.length === 0) {
    skills.push('JavaScript', 'REST APIs', 'SQL', 'Git');
  }

  // 5. Experience Years
  let experienceYears = 2;
  const expMatch = cleanText.match(/(\d+)\+?\s*years?\s*of?\s*(?:work\s*)?experience/i);
  if (expMatch) {
    experienceYears = parseInt(expMatch[1], 10);
  } else {
    // Try to guess from text length
    experienceYears = Math.min(10, Math.max(1, Math.floor(cleanText.length / 800)));
  }

  // 6. Education
  const education = [];
  if (/bachelor/i.test(cleanText) || /b\.s/i.test(cleanText) || /degree/i.test(cleanText)) {
    education.push('B.S. in Computer Science');
  }
  if (/master/i.test(cleanText) || /m\.s/i.test(cleanText)) {
    education.push('M.S. in Software Engineering');
  }
  if (education.length === 0) {
    education.push('Self-taught / Professional Certification');
  }

  // 7. Work Experience items
  const experienceList = [];
  if (/developer|engineer/i.test(cleanText)) {
    experienceList.push({
      role: 'Senior Software Engineer',
      company: 'Tech Solutions Inc.',
      years: '2023 - Present',
      description: 'Led development of React-based analytics dashboards and Node.js microservices. Integrated databases and optimized page load performance.'
    });
    experienceList.push({
      role: 'Full Stack Developer',
      company: 'Innovative Web Apps Corp',
      years: '2021 - 2023',
      description: 'Maintained RESTful APIs using Express.js and built responsive front-end views in React. Collaborated with UX team on design enhancements.'
    });
  } else {
    experienceList.push({
      role: 'Technical Associate',
      company: 'Digital Solutions LLC',
      years: '2022 - Present',
      description: 'Assisted in building custom client features, managing relational databases, and testing web applications for responsive design compatibility.'
    });
  }

  // 8. Summary
  const summary = `Results-oriented software professional with ${experienceYears}+ years of hands-on experience. Proven track record in designing and maintaining applications using ${skills.slice(0, 4).join(', ')}. Strong problem-solving skills and a collaborative team player.`;

  return {
    name,
    email,
    phone,
    skills,
    experienceYears,
    summary,
    education,
    experience: experienceList
  };
};

// -------------------------------------------------------------
// LIVE GEMINI API CONNECTIVITY
// -------------------------------------------------------------
let genAI = null;

const getGenAIClient = () => {
  if (isMockMode()) return null;
  if (!genAI) {
    try {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    } catch (e) {
      console.error('❌ Failed to initialize Gemini API Client:', e.message);
      return null;
    }
  }
  return genAI;
};

// -------------------------------------------------------------
// SERVICE METHODS
// -------------------------------------------------------------

export const generateEmbedding = async (text) => {
  if (isMockMode()) {
    return generateMockEmbedding(text);
  }

  try {
    const client = getGenAIClient();
    if (!client) throw new Error('Gemini API client not initialized');
    
    const model = client.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('❌ Gemini embedding failed, falling back to mock vector:', error.message);
    return generateMockEmbedding(text);
  }
};

export const parseResumeText = async (text) => {
  if (isMockMode()) {
    // Artificial 1 second delay to simulate API latency
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockParseResume(text);
  }

  try {
    const client = getGenAIClient();
    if (!client) throw new Error('Gemini API client not initialized');

    // Define JSON schema for the output
    const responseSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        location: { type: "string" },
        linkedIn: { type: "string" },
        github: { type: "string" },
        portfolio: { type: "string" },
        summary: { type: "string" },
        experienceYears: { type: "number" },
        currentCompany: { type: "string" },
        currentDesignation: { type: "string" },
        expectedSalary: { type: "string" },
        noticePeriod: { type: "string" },
        skills: {
          type: "object",
          properties: {
            programmingLanguages: { type: "array", items: { type: "string" } },
            frontend: { type: "array", items: { type: "string" } },
            backend: { type: "array", items: { type: "string" } },
            databases: { type: "array", items: { type: "string" } },
            cloud: { type: "array", items: { type: "string" } },
            devops: { type: "array", items: { type: "string" } },
            ai: { type: "array", items: { type: "string" } },
            softSkills: { type: "array", items: { type: "string" } }
          }
        },
        communicationInsights: { type: "string" },
        projects: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              technologies: { type: "array", items: { type: "string" } },
              responsibilities: { type: "array", items: { type: "string" } },
              duration: { type: "string" },
              role: { type: "string" },
              businessDomain: { type: "string" }
            }
          }
        },
        education: {
          type: "array",
          items: {
            type: "object",
            properties: {
              degree: { type: "string" },
              university: { type: "string" },
              year: { type: "string" },
              cgpa: { type: "string" }
            }
          }
        },
        experience: {
          type: "array",
          items: {
            type: "object",
            properties: {
              company: { type: "string" },
              designation: { type: "string" },
              duration: { type: "string" },
              responsibilities: { type: "array", items: { type: "string" } },
              achievements: { type: "array", items: { type: "string" } }
            }
          }
        },
        certificates: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              organization: { type: "string" },
              issuedDate: { type: "string" },
              credentialLink: { type: "string" }
            }
          }
        }
      },
      required: ["name", "email"]
    };

    const model = client.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const prompt = `
      You are an expert AI Resume Parser and Tech Recruiter. You will extract and parse candidate details from the provided raw resume text into the requested JSON format perfectly and accurately.
      
      CRITICAL INSTRUCTIONS:
      1. Accurately determine the total years of professional experience, core skills (specifically including technical skills and keywords), educational accomplishments, and prior roles.
      2. Extract education and skills fields with extreme precision and depth.
      3. Communication Insights: Evaluate the candidate's communication skills based on the resume (e.g., leadership roles, cross-functional collaboration, presentation skills) and provide a deep insight into their communication abilities in the 'communicationInsights' field.
      4. Use the candidate's actual name in the output whenever referring to them, NEVER use generic terms like "the talent" or "the candidate".
      
      Here is the raw resume text:
      ---
      ${text}
      ---
    `;

    const result = await model.generateContent(prompt);
    const parsedText = result.response.text();
    return JSON.parse(parsedText);
  } catch (error) {
    console.error('❌ Gemini Resume Parsing failed. Falling back to Mock parser.', error.message);
    return mockParseResume(text);
  }
};

export const generateAIInsights = async (candidateData) => {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      candidateSummary: `A driven professional with a solid background.`,
      careerLevel: "Mid-Level",
      strengths: ["Fast learner", "Adaptable"],
      weaknesses: ["Missing deep cloud knowledge"],
      recommendedRoles: ["Software Engineer", "Full Stack Developer"],
      missingSkills: ["Kubernetes", "AWS"],
      hiringReadiness: "High",
      confidenceScore: 85
    };
  }

  try {
    const client = getGenAIClient();
    if (!client) throw new Error('Gemini API client not initialized');

    const responseSchema = {
      type: "object",
      properties: {
        candidateSummary: { type: "string" },
        careerLevel: { type: "string" },
        strengths: { type: "array", items: { type: "string" } },
        weaknesses: { type: "array", items: { type: "string" } },
        recommendedRoles: { type: "array", items: { type: "string" } },
        missingSkills: { type: "array", items: { type: "string" } },
        hiringReadiness: { type: "string" },
        confidenceScore: { type: "number" }
      }
    };

    const model = client.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const prompt = `
      You are an expert HR Analyst and AI Recruiter. Generate a comprehensive insight summary for this candidate.
      
      Candidate Data:
      ---
      ${JSON.stringify(candidateData)}
      ---
      
      CRITICAL INSTRUCTIONS:
      1. Analyze the candidate and return the insights matching the JSON schema.
      2. Estimate their career level (e.g. Junior, Mid-Level, Senior, Staff), strengths, weaknesses, and hiring readiness (Low, Medium, High, Exceptional).
      3. ALWAYS refer to the candidate by their actual name (${candidateData.name}) in your sentences. NEVER use the word "talent" or generic terms like "the candidate". Make the insights real and actionable.
    `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('❌ Gemini Insights Parsing failed.', error.message);
    return null;
  }
};

export const analyzeFit = async (jobDescription, candidateData) => {
  const resumeText = candidateData.rawText || 
                     `Name: ${candidateData.name}\nSkills: ${candidateData.skills.join(', ')}\nSummary: ${candidateData.summary}`;

  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Parse JD requirements or keywords
    const jdKeywords = jobDescription.description.toLowerCase().split(/\W+/).filter(Boolean);
    const candidateSkills = candidateData.skills.map(s => s.toLowerCase());
    
    // Find overlaps
    const matches = candidateData.skills.filter(skill => {
      return jobDescription.description.toLowerCase().includes(skill.toLowerCase()) || 
             (jobDescription.requirements && jobDescription.requirements.some(req => req.toLowerCase().includes(skill.toLowerCase())));
    });

    // Calculate overlap ratio
    const scoreVal = Math.min(98, Math.max(30, 45 + (matches.length * 10) + Math.min(candidateData.experienceYears * 4, 30)));
    
    const pros = [];
    const cons = [];
    const questions = [];

    // Add pros
    if (matches.length > 0) {
      pros.push(`Strong overlap in tech stack: matches job requirements for ${matches.slice(0, 3).join(', ')}.`);
    }
    if (candidateData.experienceYears >= 5) {
      pros.push(`Senior candidate profile with ${candidateData.experienceYears} years of experience.`);
    } else {
      pros.push(`Solid foundational knowledge with ${candidateData.experienceYears} years of hands-on experience.`);
    }
    
    // Check specific resume sections to generate real-sounding pros
    if (candidateData.experience && candidateData.experience.length > 0) {
      pros.push(`Demonstrated hands-on experience in leadership or product delivery at prior companies like ${candidateData.experience[0].company || 'previous employer'}.`);
    }

    // Add cons
    const jdSkills = ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'TypeScript', 'Pinecone', 'MongoDB'];
    const missingSkills = jdSkills.filter(skill => {
      // Is skill mentioned in JD but missing in candidate resume?
      const mentionedInJd = jobDescription.description.toLowerCase().includes(skill.toLowerCase());
      const hasSkill = candidateSkills.includes(skill.toLowerCase());
      return mentionedInJd && !hasSkill;
    });

    if (missingSkills.length > 0) {
      cons.push(`Missing direct exposure to standard stack components mentioned in the JD: ${missingSkills.slice(0, 3).join(', ')}.`);
    }
    if (candidateData.experienceYears < 3 && jobDescription.description.toLowerCase().includes('senior')) {
      cons.push(`Years of experience (${candidateData.experienceYears} yrs) may fall slightly short of the Senior expectation listed in the role.`);
    }
    if (cons.length === 0) {
      cons.push(`No critical gaps identified; potential to evaluate specialized cloud or microservice design patterns.`);
    }

    // Questions (5 unique)
    const techName = candidateData.skills[0] || 'JavaScript';
    const secondTech = candidateData.skills[1] || 'REST APIs';
    
    questions.push(`I see you used ${techName} extensively in your profile. How do you manage scalability and module structures when building larger codebases?`);
    questions.push(`In your role at ${candidateData.experience?.[0]?.company || 'your previous company'}, what was the most complex technical challenge you faced, and how did you resolve it?`);
    if (missingSkills.length > 0) {
      questions.push(`The role lists experience with ${missingSkills[0]} as a preference. Although it's not explicitly in your history, have you worked with similar paradigms or how would you ramp up?`);
    } else {
      questions.push(`How do you approach database performance optimization when dealing with heavy search filters or large query sizes?`);
    }
    questions.push(`Can you walk us through a project where you had to integrate multiple services (like ${techName} with database services) under a strict deadline?`);
    questions.push(`How do you keep your technical skills sharp? What is a recent framework or tool you've experimented with outside of work?`);

    return {
      fitScore: Math.round(scoreVal),
      pros,
      cons,
      interviewQuestions: questions.slice(0, 5)
    };
  }

  try {
    const client = getGenAIClient();
    if (!client) throw new Error('Gemini API client not initialized');

    const responseSchema = {
      type: "object",
      properties: {
        fitScore: { type: "number" },
        pros: { type: "array", items: { type: "string" } },
        cons: { type: "array", items: { type: "string" } },
        interviewQuestions: { type: "array", items: { type: "string" } }
      },
      required: ["fitScore", "pros", "cons", "interviewQuestions"]
    };

    const model = client.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const prompt = `
      You are an expert technical interviewer and HR analyst. Perform a context-aware RAG (Retrieval-Augmented Generation) fit analysis.
      
      Compare this Job Description against the Candidate's Resume details:
      
      JOB DESCRIPTION:
      ---
      Title: ${jobDescription.title}
      Details: ${jobDescription.description}
      Requirements: ${JSON.stringify(jobDescription.requirements)}
      ---
      
      CANDIDATE PROFILE:
      ---
      Name: ${candidateData.name}
      Summary: ${candidateData.summary}
      Skills: ${JSON.stringify(candidateData.skills)}
      Experience: ${candidateData.experienceYears} Years
      Detailed History: ${JSON.stringify(candidateData.experience)}
      Resume Raw Content: ${resumeText}
      ---

      Generate:
      1. A fit score (0 to 100) representing how well the candidate's profile meets the job description.
      2. A bulleted list of 2-4 "Pros" (strengths, matching skills, experience highlights).
      3. A bulleted list of 2-4 "Cons" (gaps, missing skills, minor alignment mismatch).
      4. Exactly 5 custom technical and behavioral interview questions tailored to the candidate's resume (specifically addressing their claimed achievements, used technologies, or potential experience gaps).
      
      IMPORTANT: When generating Pros, Cons, and questions, ALWAYS use the candidate's actual name (${candidateData.name}). NEVER use the word "talent", "the candidate", or "they".
    `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('❌ Gemini RAG analysis failed. Falling back to Mock analysis.', error.message);
    // Mock run
    process.env.USE_MOCK_MODE = 'true';
    const res = await analyzeFit(jobDescription, candidateData);
    process.env.USE_MOCK_MODE = 'false'; // Reset if needed, or keep mock
    return res;
  }
};

export const generateEmail = async (candidateName, jobTitle, analysis, emailType) => {
  const prosText = analysis.pros.join('; ');
  const consText = analysis.cons.join('; ');

  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (emailType === 'interview') {
      return `Subject: Interview Invitation: ${jobTitle} - HireSmart

Dear ${candidateName},

Thank you for your application for the ${jobTitle} position at our company.

Our team has completed an evaluation of your resume. We were highly impressed with your experience, particularly your expertise in:
- ${analysis.pros[0] || 'the required technologies'}
- Your ${analysis.pros[1] || 'strong background and project contributions'}

We would love to invite you for a 45-minute technical and behavioral video interview to discuss your experience further and learn more about your career goals. 

Please let us know your availability over the next few days by replying to this email, or schedule a slot directly using our recruitment team calendar.

We look forward to speaking with you!

Best regards,

Recruitment Team
HireSmart AI Solutions
`;
    } else {
      return `Subject: Application Update: ${jobTitle} - HireSmart

Dear ${candidateName},

Thank you for taking the time to apply for the ${jobTitle} position and for sharing your resume with us. 

We have carefully reviewed your experience and qualifications. While your background is impressive, we have decided to move forward with other candidates whose skill sets are currently a closer match for this specific opening. 

Specifically, this role has a heavy emphasis on requirements such as:
- ${analysis.cons[0] || 'specialized system architectures'}

We will keep your resume on file for future opportunities that align with your skillset. We wish you the very best in your search and career journey, and we appreciate your interest in our team.

Sincerely,

Recruitment Team
HireSmart AI Solutions
`;
    }
  }

  try {
    const client = getGenAIClient();
    if (!client) throw new Error('Gemini API client not initialized');

    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are an automated HR Assistant. Draft a professional, personalized email to a candidate.
      
      Details:
      - Candidate Name: ${candidateName}
      - Applied Position: ${jobTitle}
      - Fit Analysis Highlights (Pros): ${prosText}
      - Fit Analysis Gaps (Cons): ${consText}
      - Fit Score: ${analysis.fitScore}/100
      - Email Type: ${emailType} (either 'interview' for invitation, or 'rejection' for rejection)

      Guidelines:
      - Make the email feel extremely respectful, warm, and personalized.
      - Refrain from using generic boilerplate templates. Mention specific items from the analysis (e.g. if interview invite, mention 1-2 pros. If rejection, mention 1 key area of strength and politely frame the gap as a primary focal requirement for this particular opening).
      - Include a clear Subject line at the start of the draft.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('❌ Gemini Email Assistant failed. Falling back to Mock templates.', error.message);
    process.env.USE_MOCK_MODE = 'true';
    const res = await generateEmail(candidateName, jobTitle, analysis, emailType);
    process.env.USE_MOCK_MODE = 'false';
    return res;
  }
};
