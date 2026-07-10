import React, { useState } from 'react';

export default function SemanticSearch({ onSelectCandidate }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);

    try {
      // Simulate backend vector search
      setTimeout(() => {
        // Mock results to simulate Pinecone response
        const mockResults = [
          {
            candidate: {
              _id: 'mock-1',
              name: 'Jane Doe',
              experienceYears: 4,
              email: 'jane.doe@example.com',
              summary: 'Highly motivated frontend developer with 4 years of experience specializing in React.',
              skills: ['React', 'JavaScript', 'TypeScript', 'Redux', 'HTML']
            },
            score: 0.94
          },
          {
            candidate: {
              _id: 'mock-2',
              name: 'Sai Sreehitha Karneedi',
              experienceYears: 3,
              email: 'sreehithakarneedi@gmail.com',
              summary: 'Results-oriented software professional with 3+ years of hands-on experience.',
              skills: ['JavaScript', 'HTML', 'CSS', 'Python', 'Java']
            },
            score: 0.82
          }
        ];
        
        setResults(mockResults);
        setLoading(false);
      }, 1500);

    } catch (err) {
      console.error('Semantic search error:', err);
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <form onSubmit={handleSearch} className="search-box">
        <span className="search-icon-inside">🔍</span>
        <input 
          type="text" 
          className="search-input"
          placeholder="e.g. Find me a developer with React and AWS microservices experience..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button 
            type="button" 
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '90px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            &times;
          </button>
        )}
        <button type="submit" className="btn btn-primary" style={{ flexShrink: 0, padding: '0 1.25rem' }} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2].map(n => (
            <div key={n} className="candidate-card skeleton" style={{ minHeight: '110px' }}>
              <div className="skeleton-title" style={{ width: '40%' }}></div>
              <div className="skeleton-text" style={{ width: '80%' }}></div>
              <div className="skeleton-text" style={{ width: '60%' }}></div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {hasSearched && results.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>
              No matches found for your query. Try adjusting keywords or uploading more resumes.
            </p>
          )}

          {results.map(({ candidate, score }) => {
            // Convert score float (e.g. 0.85) to percentage (e.g. 85%)
            const percent = Math.round(score * 100);
            
            return (
              <div 
                key={candidate._id}
                className="candidate-card"
                onClick={() => onSelectCandidate(candidate)}
                style={{ paddingRight: '5.5rem' }}
              >
                <div className="search-match-badge">
                  🎯 {percent}% Fit
                </div>
                
                <h3 style={{ fontSize: '0.95rem' }}>{candidate.name}</h3>
                
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span>💼 {candidate.experienceYears} Years Exp</span>
                  <span>✉ {candidate.email}</span>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {candidate.summary}
                </p>

                <div className="candidate-skills-list">
                  {candidate.skills?.slice(0, 4).map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
