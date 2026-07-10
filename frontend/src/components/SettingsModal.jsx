import React, { useState, useEffect } from 'react';

export default function SettingsModal({ isOpen, onClose, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    geminiKey: '',
    mongoUri: '',
    pineconeKey: '',
    pineconeIndex: 'hiresmart',
    pineconeHost: '',
    useMockMode: true,
    userName: 'Jane Admin',
    email: 'admin@hiresmart.co',
    emailNotifications: true,
    slackNotifications: false
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('api');

  useEffect(() => {
    if (isOpen) {
      // Fetch backend configuration status
      fetch('/api/config-status')
        .then(res => res.json())
        .then(data => {
          setFormData({
            geminiKey: data.hasGeminiKey ? '●●●●●●●●●●●●●●●●' : '',
            mongoUri: data.hasMongoUri ? '●●●●●●●●●●●●●●●●' : '',
            pineconeKey: data.hasPineconeKey ? '●●●●●●●●●●●●●●●●' : '',
            pineconeIndex: data.pineconeIndex || 'hiresmart',
            pineconeHost: data.pineconeHost || '',
            useMockMode: data.mockMode
          });
        })
        .catch(err => console.error('Error fetching settings:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    // Prepare body: only send keys if they are not the placeholder circles
    const body = {};
    if (formData.geminiKey && !formData.geminiKey.includes('●')) body.geminiKey = formData.geminiKey;
    if (formData.mongoUri && !formData.mongoUri.includes('●')) body.mongoUri = formData.mongoUri;
    if (formData.pineconeKey && !formData.pineconeKey.includes('●')) body.pineconeKey = formData.pineconeKey;
    body.pineconeIndex = formData.pineconeIndex;
    body.pineconeHost = formData.pineconeHost;
    body.useMockMode = formData.useMockMode;

    try {
      const response = await fetch('/api/config-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const result = await response.json();
      
      if (result.success) {
        setStatusMessage({ type: 'success', text: 'Settings updated successfully! DB Status: ' + (result.dbConnected ? 'Connected' : 'Fallback (Mock)') });
        onSaveSuccess();
        setTimeout(() => {
          onClose();
          setStatusMessage(null);
        }, 1500);
      } else {
        setStatusMessage({ type: 'error', text: result.error || 'Failed to update settings.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error connecting to backend API.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>⚙ Integration Settings</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="tabs-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex' }}>
              <button 
                type="button"
                className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >Profile</button>
              <button 
                type="button"
                className={`tab-btn ${activeTab === 'api' ? 'active' : ''}`}
                onClick={() => setActiveTab('api')}
              >API Keys</button>
              <button 
                type="button"
                className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >Notifications</button>
            </div>

            {activeTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" name="userName" value={formData.userName} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Work Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} />
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <input type="checkbox" id="emailNotif" name="emailNotifications" checked={formData.emailNotifications} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
                  <label htmlFor="emailNotif">Enable Email Notifications for new candidates</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <input type="checkbox" id="slackNotif" name="slackNotifications" checked={formData.slackNotifications} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
                  <label htmlFor="slackNotif">Enable Slack Integrations (Enterprise)</label>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <input 
                    type="checkbox" 
                    id="useMockMode" 
                    name="useMockMode" 
                    checked={formData.useMockMode} 
                    onChange={handleChange}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <label htmlFor="useMockMode" style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    Enable Sandbox / Mock Mode (Bypass live credentials)
                  </label>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                  When Sandbox Mode is active, HireSmart will run on internal simulated databases and rule-based AI processing. Deselect to connect to live production clouds.
                </p>

                <div className="input-group">
                  <label>Google Gemini API Key</label>
                  <input 
                    type="password" 
                    name="geminiKey" 
                    value={formData.geminiKey} 
                    onChange={handleChange} 
                    placeholder="AI Studio API Key"
                    disabled={formData.useMockMode}
                  />
                </div>

                <div className="input-group">
                  <label>MongoDB Connection URI</label>
                  <input 
                    type="text" 
                    name="mongoUri" 
                    value={formData.mongoUri} 
                    onChange={handleChange} 
                    placeholder="mongodb+srv://<username>:<password>@cluster.mongodb.net/hiresmart"
                    disabled={formData.useMockMode}
                  />
                </div>

                <div className="input-group">
                  <label>Pinecone API Key</label>
                  <input 
                    type="password" 
                    name="pineconeKey" 
                    value={formData.pineconeKey} 
                    onChange={handleChange} 
                    placeholder="Pinecone API Key"
                    disabled={formData.useMockMode}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="input-group">
                    <label>Pinecone Index</label>
                    <input 
                      type="text" 
                      name="pineconeIndex" 
                      value={formData.pineconeIndex} 
                      onChange={handleChange} 
                      placeholder="hiresmart"
                      disabled={formData.useMockMode}
                    />
                  </div>
                  <div className="input-group">
                    <label>Pinecone Host URL</label>
                    <input 
                      type="text" 
                      name="pineconeHost" 
                      value={formData.pineconeHost} 
                      onChange={handleChange} 
                      placeholder="https://hiresmart-xx.svc.apw5..."
                      disabled={formData.useMockMode}
                    />
                  </div>
                </div>
              </div>
            )}

            {statusMessage && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '500',
                color: 'white',
                backgroundColor: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: `1px solid ${statusMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`
              }}>
                {statusMessage.text}
              </div>
            )}

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
