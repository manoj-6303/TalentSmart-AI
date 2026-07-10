import React from 'react';

export default function Dashboard({ jobs, candidates, onNavigate }) {
  // Compute some mock stats
  const totalJobs = jobs.length;
  const totalCandidates = candidates.length;
  const avgFitScore = '84%'; // Mock for now
  const shortlisted = Math.floor(candidates.length * 0.4); // Mock

  return (
    <div className="dashboard-view" style={{ padding: '1rem', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div className="stat-card" onClick={() => onNavigate('candidates')} style={{ cursor: 'pointer', padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Candidates</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{totalCandidates}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>View Candidate Directory →</div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('jobs')} style={{ cursor: 'pointer', padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Active Jobs</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{totalJobs}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Manage Job Descriptions →</div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('candidates')} style={{ cursor: 'pointer', padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Shortlisted</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{shortlisted}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Filter Shortlisted →</div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('analysis')} style={{ cursor: 'pointer', padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Average Fit Score</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6366f1' }}>{avgFitScore}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>View AI Analytics →</div>
        </div>

      </div>

      <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Recent Activity</h3>
        {candidates.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {candidates.slice(0, 3).map((c, i) => (
              <div key={i} style={{ padding: '0.75rem', borderLeft: '3px solid var(--color-primary)', backgroundColor: 'var(--bg-main)', borderRadius: '0 4px 4px 0', color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.name}</span> was parsed and added to the directory.
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No recent activity.</p>
        )}
      </div>
    </div>
  );
}
