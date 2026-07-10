import React, { useState } from 'react';

export default function Communication() {
  const [activeTab, setActiveTab] = useState('compose');
  const [isSending, setIsSending] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    to: '',
    templateType: '',
    subject: '',
    body: ''
  });

  const templates = {
    'interview': { subject: 'Interview Invitation: HireSmart', body: 'Hi there,\n\nWe would like to invite you for an interview for the open position.\n\nBest,\nTeam' },
    'shortlist': { subject: 'Application Update: Shortlisted', body: 'Hi there,\n\nCongratulations, your profile has been shortlisted for the next round!\n\nBest,\nTeam' },
    'reject': { subject: 'Application Status Update', body: 'Hi there,\n\nThank you for applying. Unfortunately, we will not be moving forward with your application at this time.\n\nBest,\nTeam' },
    'offer': { subject: 'Job Offer: Welcome to the Team!', body: 'Hi there,\n\nWe are thrilled to offer you the position!\n\nBest,\nTeam' }
  };

  const handleTemplateChange = (e) => {
    const type = e.target.value;
    if (type && templates[type]) {
      setFormData({
        ...formData,
        templateType: type,
        subject: templates[type].subject,
        body: templates[type].body
      });
    } else {
      setFormData({ ...formData, templateType: type });
    }
  };

  const [history, setHistory] = useState([
    { id: 1, to: 'jane.doe@example.com', subject: 'Interview Invitation: Frontend Engineer', date: '2026-07-09' },
    { id: 2, to: 'sreehithakarneedi@gmail.com', subject: 'Application Update: HireSmart', date: '2026-07-08' }
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!formData.to || !formData.subject || !formData.body) return;

    setIsSending(true);

    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      setShowToast(true);
      
      // Add to history
      setHistory(prev => [
        {
          id: Date.now(),
          to: formData.to,
          subject: formData.subject,
          date: new Date().toISOString().split('T')[0]
        },
        ...prev
      ]);

      // Reset form
      setFormData({ to: '', templateType: '', subject: '', body: '' });

      setTimeout(() => setShowToast(false), 3000);
    }, 1500);
  };

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: 'var(--shadow-md)', minHeight: '600px', position: 'relative' }}>
      
      {/* Dynamic Toast for this component */}
      {showToast && (
        <div style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: '#10b981', color: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', animation: 'slideIn 0.3s ease-out', zIndex: 50 }}>
          Email sent successfully!
        </div>
      )}

      <div className="tabs-header" style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-light)' }}>
        <button 
          className={`tab-btn ${activeTab === 'compose' ? 'active' : ''}`}
          onClick={() => setActiveTab('compose')}
        >
          ✉ Compose Email
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          🕒 History
        </button>
      </div>

      {activeTab === 'compose' && (
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
          <div className="input-group">
            <label style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>To</label>
            <input 
              type="email" 
              placeholder="candidate@example.com" 
              value={formData.to}
              onChange={(e) => setFormData({...formData, to: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              required
            />
          </div>

          <div className="input-group">
            <label style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Template</label>
            <select 
              value={formData.templateType}
              onChange={handleTemplateChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
            >
              <option value="">-- Select a Template --</option>
              <option value="interview">Interview Invitation</option>
              <option value="shortlist">Shortlist Notification</option>
              <option value="reject">Rejection</option>
              <option value="offer">Job Offer</option>
            </select>
          </div>
          
          <div className="input-group">
            <label style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Subject</label>
            <input 
              type="text" 
              placeholder="Interview Invitation..." 
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              required
            />
          </div>

          <div className="input-group">
            <label style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Message</label>
            <textarea 
              rows={8}
              placeholder="Type your message here..." 
              value={formData.body}
              onChange={(e) => setFormData({...formData, body: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', resize: 'vertical' }}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <div className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.3)', borderLeftColor: 'white' }}></div>
                Sending...
              </>
            ) : 'Send Email'}
          </button>
        </form>
      )}

      {activeTab === 'history' && (
        <div>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Recent Communications</h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem 0.5rem' }}>Date</th>
                <th style={{ padding: '1rem 0.5rem' }}>Recipient</th>
                <th style={{ padding: '1rem 0.5rem' }}>Subject</th>
                <th style={{ padding: '1rem 0.5rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.date}</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{item.to}</td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{item.subject}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>Sent</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
