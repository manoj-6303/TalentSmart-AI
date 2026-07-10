import React, { useState } from 'react';

export default function JobList({ jobs, selectedJob, onSelectJob, onRefreshJobs }) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'Remote',
    description: '',
    requirements: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    setLoading(true);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setFormData({
          title: '',
          department: 'Engineering',
          location: 'Remote',
          description: '',
          requirements: ''
        });
        setIsAdding(false);
        onRefreshJobs();
      }
    } catch (err) {
      console.error('Error creating job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this job description?')) return;
    try {
      const response = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (response.ok) {
        onRefreshJobs();
      }
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  return (
    <div className="panel-col glass-panel" style={{ height: '100%' }}>
      <div className="panel-header">
        <h2>💼 Job Descriptions</h2>
        {!isAdding ? (
          <button className="btn btn-primary" onClick={() => setIsAdding(true)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
            + Create
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={() => setIsAdding(false)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
            Close
          </button>
        )}
      </div>

      <div className="panel-content">
        {isAdding ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="input-group">
              <label>Job Title *</label>
              <input 
                type="text" 
                placeholder="e.g. Full Stack Developer" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="input-group">
                <label>Department</label>
                <input 
                  type="text" 
                  value={formData.department} 
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Location</label>
                <input 
                  type="text" 
                  value={formData.location} 
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Description *</label>
              <textarea 
                placeholder="Describe responsibilities, goals..." 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                required
              />
            </div>

            <div className="input-group">
              <label>Requirements (comma-separated)</label>
              <input 
                type="text" 
                placeholder="React, Node.js, AWS" 
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.25rem' }} disabled={loading}>
              {loading ? 'Saving...' : 'Post Job Description'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {jobs.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2rem' }}>
                No job descriptions available. Create one to analyze candidates.
              </p>
            ) : (
              jobs.map(job => (
                <div 
                  key={job._id} 
                  className={`job-card ${selectedJob?._id === job._id ? 'active' : ''}`}
                  onClick={() => onSelectJob(job)}
                >
                  <button 
                    onClick={(e) => handleDelete(job._id, e)}
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
                    title="Delete Job"
                  >
                    🗑
                  </button>
                  <h3>{job.title}</h3>
                  <div className="job-meta">
                    <span>🏢 {job.department}</span>
                    <span>📍 {job.location}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
