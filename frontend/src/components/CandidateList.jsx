import React from 'react';

export default function CandidateList({ candidates, selectedCandidate, onSelectCandidate, onRefreshCandidates }) {
  
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this candidate profile?')) return;

    try {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        onRefreshCandidates();
      }
    } catch (err) {
      console.error('Error deleting candidate:', err);
    }
  };

  return (
    <div className="panel-col glass-panel" style={{ height: '100%' }}>
      <div className="panel-header">
        <h2>👥 Talent Directory</h2>
        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
          {candidates.length} Profiles
        </span>
      </div>

      <div className="panel-content">
        {candidates.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2rem' }}>
            No candidate profiles found. Drag and drop a resume above to parse it!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {candidates.map(candidate => {
              const isSelected = selectedCandidate?._id === candidate._id;
              return (
                <div 
                  key={candidate._id}
                  className={`candidate-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectCandidate(candidate)}
                >
                  <button 
                    onClick={(e) => handleDelete(candidate._id, e)}
                    style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                    title="Delete Candidate"
                  >
                    🗑
                  </button>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{candidate.name}</h3>
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span>💼 {candidate.experienceYears} Years Exp</span>
                  </div>

                  <div className="candidate-skills-list" style={{ marginTop: '0.5rem' }}>
                    {candidate.skills?.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill}</span>
                    ))}
                    {candidate.skills?.length > 3 && (
                      <span className="skill-tag" style={{ color: 'var(--color-primary)' }}>+{candidate.skills.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
