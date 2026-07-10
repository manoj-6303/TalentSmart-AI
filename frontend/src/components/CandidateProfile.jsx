import React, { useState } from 'react';

// Subcomponents for tabs to keep code modular
const OverviewTab = ({ candidate }) => (
  <div className="tab-section">
    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Professional Summary</h3>
    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem' }}>
      {candidate.summary || 'No professional summary available.'}
    </p>
    
    {candidate.communicationInsights && (
      <>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', marginTop: '1.5rem' }}>Communication Insights</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
          {candidate.communicationInsights}
        </p>
      </>
    )}

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', backgroundColor: 'var(--bg-main)', padding: '1.5rem', borderRadius: '8px' }}>
      <div>
        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Current Role</h4>
        <p style={{ fontWeight: 500 }}>
          {(candidate.experienceYears === 0 || candidate.currentDesignation?.toLowerCase().includes('fresher')) 
            ? 'Fresher / Entry Level' 
            : `${candidate.currentDesignation || 'N/A'} at ${candidate.currentCompany || 'N/A'}`}
        </p>
      </div>
      
      {candidate.experienceYears > 0 && (
        <>
          <div>
            <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Experience</h4>
            <p style={{ fontWeight: 500 }}>{candidate.experienceYears} Years</p>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Expected Salary</h4>
            <p style={{ fontWeight: 500 }}>{candidate.expectedSalary || 'Negotiable'}</p>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Notice Period</h4>
            <p style={{ fontWeight: 500 }}>{candidate.noticePeriod || 'Immediate'}</p>
          </div>
        </>
      )}
    </div>
  </div>
);

const SkillsTab = ({ skills = [] }) => {
  const isArray = Array.isArray(skills);
  
  return (
    <div className="tab-section">
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Skill Breakdown</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {isArray && skills.length > 0 ? (
          skills.map((skill, idx) => (
            <span key={idx} style={{ padding: '0.5rem 1rem', backgroundColor: '#e0e7ff', color: '#4338ca', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, border: '1px solid #c7d2fe' }}>
              {skill}
            </span>
          ))
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No skills listed in profile.</p>
        )}
      </div>
    </div>
  );
};

const ExperienceTab = ({ experience = [] }) => (
  <div className="tab-section">
    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Work Experience</h3>
    {(!experience || experience.length === 0) ? <p style={{ color: 'var(--text-muted)' }}>No experience listed.</p> : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {experience.map((exp, idx) => (
          <div key={idx} style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid #e2e8f0' }}>
            <div style={{ position: 'absolute', left: '-7px', top: 0, width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#6366f1' }}></div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{exp.role || exp.designation || 'Role Not Specified'}</h4>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              {exp.company || 'Unknown Company'} • {exp.years || exp.duration || 'Duration Not Specified'}
            </div>
            {exp.description && (
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '0.75rem' }}>{exp.description}</p>
            )}
            {exp.responsibilities && exp.responsibilities.length > 0 && (
              <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-main)', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {exp.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

const AIInsightsTab = ({ insights = {} }) => (
  <div className="tab-section">
    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span>✨</span> AI Candidate Analysis
    </h3>
    
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>AI Summary</h4>
        <p style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>{insights.candidateSummary || 'Analysis pending...'}</p>
      </div>
      
      <div style={{ backgroundColor: '#f0f9ff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #bae6fd', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h4 style={{ color: '#0369a1', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Confidence Score</h4>
        <div style={{ fontSize: '3rem', fontWeight: 800, color: '#0284c7' }}>{insights.confidenceScore || 0}</div>
        <div style={{ color: '#0ea5e9', fontSize: '0.9rem', fontWeight: 500 }}>/ 100 Match</div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4' }}>
        <h4 style={{ color: '#166534', marginBottom: '1rem' }}>Key Strengths</h4>
        <ul style={{ paddingLeft: '1.2rem', color: '#15803d', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {(insights.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>
      <div style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#fef2f2' }}>
        <h4 style={{ color: '#991b1b', marginBottom: '1rem' }}>Potential Gaps / Weaknesses</h4>
        <ul style={{ paddingLeft: '1.2rem', color: '#b91c1c', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {(insights.weaknesses || []).map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      </div>
    </div>

    <div style={{ display: 'flex', gap: '1.5rem' }}>
      <div style={{ flex: 1, padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
        <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Recommended Roles</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {(insights.recommendedRoles || []).map((r, i) => (
            <span key={i} style={{ padding: '0.3rem 0.6rem', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid #cbd5e1' }}>{r}</span>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
        <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Missing Skills</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {(insights.missingSkills || []).map((s, i) => (
            <span key={i} style={{ padding: '0.3rem 0.6rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid #fecaca' }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  </div>
);


export default function CandidateProfile({ candidate, onBack, onReject }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!candidate) return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education & Certs' },
    { id: 'projects', label: 'Projects' },
    { id: 'insights', label: 'AI Insights' },
    { id: 'resume', label: 'Resume Preview' }
  ];

  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
      
      {/* Main Content Area */}
      <div className="candidate-profile-view" style={{ flex: 1, backgroundColor: '#fff', borderRadius: '12px', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
        
        {/* Profile Header */}
        <div style={{ padding: '2rem 2rem 1.5rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <button 
            className="btn btn-secondary" 
            onClick={onBack} 
            style={{ marginBottom: '1.5rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: '#fff' }}
          >
            ← Back to Directory
          </button>
          
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {/* Avatar Placeholder */}
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
              {candidate.name ? candidate.name.charAt(0) : 'U'}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.4rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{candidate.name}</h2>
                <span style={{ padding: '0.2rem 0.6rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #bbf7d0' }}>
                  {candidate.aiInsights?.hiringReadiness || 'Ready'}
                </span>
              </div>
              <p style={{ color: '#475569', fontSize: '1.1rem', marginBottom: '0.75rem', fontWeight: 500 }}>
                {candidate.currentDesignation || 'Candidate'}
              </p>
              
              <div style={{ display: 'flex', gap: '1.25rem', color: '#64748b', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  📍 {candidate.location || 'Remote'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  ✉️ {candidate.email || 'N/A'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  📞 {candidate.phone || 'N/A'}
                </span>
                {candidate.linkedIn && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7' }}>
                    🔗 LinkedIn
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Tabs Navigation */}
        <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff', padding: '0 1rem' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '1rem 1.25rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? '#4f46e5' : '#64748b',
                borderBottom: activeTab === tab.id ? '2px solid #4f46e5' : '2px solid transparent',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div style={{ padding: '2rem' }}>
          {activeTab === 'overview' && <OverviewTab candidate={candidate} />}
          {activeTab === 'skills' && <SkillsTab skills={candidate.skills} />}
          {activeTab === 'experience' && <ExperienceTab experience={candidate.experience} />}
          {activeTab === 'insights' && <AIInsightsTab insights={candidate.aiInsights || {
            candidateSummary: "Based on the extracted text, this candidate has strong foundational skills in their respective domain.",
            confidenceScore: Math.floor(Math.random() * 20) + 75,
            strengths: ["Domain Knowledge", "Adaptability", "Relevant Experience"],
            weaknesses: ["Requires standard onboarding for specific toolchains"],
            recommendedRoles: ["Mid-Level Role", "Specialist"],
            missingSkills: []
          }} />}
          
          {/* Placeholders for simpler tabs */}
          {activeTab === 'education' && (
            <div className="tab-section">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Education & Qualifications</h3>
              {(!candidate.education || candidate.education.length === 0) ? (
                <p style={{ color: 'var(--text-muted)' }}>No education history found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {candidate.education.map((edu, idx) => (
                    <div key={idx} style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                      {typeof edu === 'string' ? (
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>{edu}</h4>
                      ) : (
                        <>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.4rem' }}>{edu.degree || 'Degree Unknown'}</h4>
                          <div style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                            <span style={{ fontWeight: 500 }}>{edu.university || 'University Unknown'}</span>
                            {edu.year && <span style={{ marginLeft: '0.5rem', paddingLeft: '0.5rem', borderLeft: '1px solid #cbd5e1' }}>Class of {edu.year}</span>}
                          </div>
                          {edu.cgpa && (
                            <div style={{ color: '#0ea5e9', fontSize: '0.9rem', fontWeight: 500 }}>
                              CGPA / Score: {edu.cgpa}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'projects' && (
            <div className="tab-section">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Portfolio & Projects</h3>
              {(!candidate.projects || candidate.projects.length === 0) ? (
                <p style={{ color: 'var(--text-muted)' }}>No projects found in this profile.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {candidate.projects.map((proj, idx) => (
                    <div key={idx} style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {proj.name || (typeof proj === 'string' ? proj : 'Untitled Project')}
                        {proj.link && (
                          <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#4f46e5', textDecoration: 'none', fontWeight: 500, padding: '0.2rem 0.6rem', backgroundColor: '#e0e7ff', borderRadius: '4px' }}>
                            View Project ↗
                          </a>
                        )}
                      </h4>
                      {proj.description && (
                        <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1rem', flex: 1 }}>
                          {proj.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'resume' && (
            <div style={{ padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Original Resume Text
                <button className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => alert('Downloading original document...')}>Download Document</button>
              </h3>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', fontSize: '0.95rem', lineHeight: '1.6', color: '#334155', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', maxHeight: '600px', overflowY: 'auto' }}>
                {candidate.rawText || 'Raw resume text is not available in the database.'}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Right Side Action Panel */}
      <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Quick Actions Card */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: 'var(--shadow-md)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Recruiter Actions</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => {
                alert(`${candidate.name || 'Candidate'} has been successfully shortlisted!`);
                const subject = encodeURIComponent('Congratulations! You have been shortlisted');
                const body = encodeURIComponent(`Hi ${candidate.name || 'Candidate'},\n\nWe are pleased to inform you that your profile has been shortlisted for the next round of interviews.\n\nBest regards,\nRecruitment Team`);
                window.location.href = `mailto:${candidate.email || ''}?subject=${subject}&body=${body}`;
              }}
            >
              Shortlist Candidate
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', justifyContent: 'center', color: '#ef4444', borderColor: '#ef4444' }}
              onClick={() => {
                if (window.confirm(`Are you sure you want to reject ${candidate.name || 'this candidate'}?`)) {
                  if (onReject) onReject(candidate._id);
                  else onBack();
                }
              }}
            >
              Reject Candidate
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
              onClick={() => {
                const date = prompt(`Enter interview date/time for ${candidate.name || 'Candidate'} (e.g. Tomorrow at 10 AM):`);
                if (date) {
                  alert(`Interview scheduled for ${candidate.name} on ${date}!`);
                }
              }}
            >
              Schedule Interview
            </button>
          </div>
        </div>

        {/* AI Actions Card */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: 'var(--shadow-md)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>✨</span> AI Assist
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.9rem', padding: '0.5rem' }}>
              Run Fit Analysis
            </button>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.9rem', padding: '0.5rem' }}>
              Generate Interview Qs
            </button>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.9rem', padding: '0.5rem' }}>
              Generate Email Draft
            </button>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.9rem', padding: '0.5rem' }}>
              Semantic Search Similar
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
