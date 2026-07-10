import React from 'react';

export default function Analytics() {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: 'var(--shadow-md)', minHeight: '600px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Platform Analytics</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Hiring funnel and talent pool distribution.</p>
        </div>
        <button className="btn btn-secondary">Download Report</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Hiring Funnel Mock */}
        <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Hiring Funnel</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ width: '100%', backgroundColor: '#e0e7ff', padding: '1rem', textAlign: 'center', borderRadius: '4px', fontWeight: 'bold', color: '#3730a3' }}>
              Sourced (1,240)
            </div>
            <div style={{ width: '80%', backgroundColor: '#dbeafe', padding: '1rem', textAlign: 'center', borderRadius: '4px', fontWeight: 'bold', color: '#1e40af' }}>
              Applied (450)
            </div>
            <div style={{ width: '60%', backgroundColor: '#bfdbfe', padding: '1rem', textAlign: 'center', borderRadius: '4px', fontWeight: 'bold', color: '#1d4ed8' }}>
              Screened (120)
            </div>
            <div style={{ width: '40%', backgroundColor: '#93c5fd', padding: '1rem', textAlign: 'center', borderRadius: '4px', fontWeight: 'bold', color: '#2563eb' }}>
              Interviewed (45)
            </div>
            <div style={{ width: '20%', backgroundColor: '#3b82f6', padding: '1rem', textAlign: 'center', borderRadius: '4px', fontWeight: 'bold', color: '#eff6ff' }}>
              Hired (12)
            </div>
          </div>
        </div>

        {/* Top Skills Mock */}
        <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Top Skills in Talent Pool</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { skill: 'React.js', percent: 85, color: '#61dafb' },
              { skill: 'Node.js', percent: 70, color: '#339933' },
              { skill: 'Python', percent: 65, color: '#3776ab' },
              { skill: 'AWS', percent: 50, color: '#ff9900' },
              { skill: 'TypeScript', percent: 45, color: '#3178c6' },
            ].map(item => (
              <div key={item.skill}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 500 }}>
                  <span>{item.skill}</span>
                  <span>{item.percent}%</span>
                </div>
                <div style={{ width: '100%', backgroundColor: 'var(--bg-main)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.percent}%`, backgroundColor: item.color, height: '100%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
