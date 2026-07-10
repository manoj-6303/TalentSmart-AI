import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import JobList from './components/JobList';
import UploadResume from './components/UploadResume';
import CandidateList from './components/CandidateList';
import CandidateProfile from './components/CandidateProfile';
import SemanticSearch from './components/SemanticSearch';
import FitAnalysis from './components/FitAnalysis';
import Dashboard from './components/Dashboard';
import Communication from './components/Communication';
import Analytics from './components/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [authScreen, setAuthScreen] = useState('login'); // 'login' or 'register'
  const [authLoading, setAuthLoading] = useState(true);

  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [viewingCandidateProfile, setViewingCandidateProfile] = useState(false);
  const [configStatus, setConfigStatus] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [middleTab, setMiddleTab] = useState('directory'); // 'directory' or 'search'
  const [toastMessage, setToastMessage] = useState(null);
  const [currentView, setCurrentView] = useState('upload'); // Default to upload to show screenshot 2

  // Session verification on mount
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (err) {
          console.error('Session verification failed, falling back to cached session', err);
          setUser(JSON.parse(savedUser));
        }
      }
      setAuthLoading(false);
    };

    verifySession();
  }, []);

  // Initial fetches when user becomes authenticated
  useEffect(() => {
    if (user) {
      refreshJobs();
      refreshCandidates();
      refreshConfigStatus();
    }
  }, [user]);

  const refreshJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
        if (data.length > 0 && !selectedJob) {
          setSelectedJob(data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const refreshCandidates = async () => {
    try {
      const response = await fetch('/api/candidates');
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
        if (data.length > 0 && !selectedCandidate) {
          setSelectedCandidate(data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
    }
  };

  const refreshConfigStatus = async () => {
    try {
      const response = await fetch('/api/config-status');
      if (response.ok) {
        const data = await response.json();
        setConfigStatus(data);
      }
    } catch (err) {
      console.error('Error fetching config status:', err);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUploadSuccess = (candidateData) => {
    // candidateData contains the actual parsed data from backend + { name: filename }
    // Add it to the candidates list if it has an _id (real upload succeeded)
    if (candidateData._id) {
      setCandidates(prev => [candidateData, ...prev]);
    }
    
    setSelectedCandidate(candidateData);
    setViewingCandidateProfile(true);
    setCurrentView('candidates');
    showToast(`${candidateData.name} uploaded successfully and parsed!`);
  };

  const handleSettingsSaved = () => {
    refreshConfigStatus();
    refreshCandidates();
    refreshJobs();
    showToast('Integration configuration updated.');
  };

  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setViewingCandidateProfile(true);
    showToast(`Viewing profile: ${candidate.name}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAuthScreen('login');
    showToast('Logged out successfully.');
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-main)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="loading-spinner"></div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Loading HireSmart AI...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authScreen === 'register') {
      return (
        <Register 
          onRegisterSuccess={(usr) => setUser(usr)} 
          onSwitchToLogin={() => setAuthScreen('login')} 
        />
      );
    }
    return (
      <Login 
        onLoginSuccess={(usr) => setUser(usr)} 
        onSwitchToRegister={() => setAuthScreen('register')} 
      />
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="page-container">
            <h2 className="page-title">Dashboard</h2>
            <Dashboard jobs={jobs} candidates={candidates} onNavigate={setCurrentView} />
          </div>
        );
      case 'jobs':
        return (
          <div className="page-container">
            <h2 className="page-title">Job Descriptions</h2>
            <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              <JobList 
                jobs={jobs} 
                selectedJob={selectedJob} 
                onSelectJob={setSelectedJob} 
                onRefreshJobs={refreshJobs} 
              />
            </div>
          </div>
        );
      case 'candidates':
        if (viewingCandidateProfile && selectedCandidate) {
          return (
            <div className="page-container">
              <CandidateProfile 
                candidate={selectedCandidate} 
                jobs={jobs}
                onBack={() => setViewingCandidateProfile(false)}
                onReject={async (id) => {
                  try {
                    await fetch(`/api/candidates/${id}`, { method: 'DELETE' });
                    setCandidates(prev => prev.filter(c => c._id !== id));
                    setViewingCandidateProfile(false);
                    showToast('Candidate rejected and removed from directory.');
                  } catch (err) {
                    console.error('Failed to reject candidate:', err);
                  }
                }}
                onActionComplete={(message) => {
                  setViewingCandidateProfile(false);
                  setCurrentView('communication');
                  showToast(message);
                }}
              />
            </div>
          );
        }
        return (
          <div className="page-container">
            <h2 className="page-title">Talent Directory</h2>
            <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              <div className="tabs-header" style={{ marginBottom: '1rem' }}>
                <button 
                  className={`tab-btn ${middleTab === 'directory' ? 'active' : ''}`}
                  onClick={() => setMiddleTab('directory')}
                >👥 All Talents</button>
                <button 
                  className={`tab-btn ${middleTab === 'search' ? 'active' : ''}`}
                  onClick={() => setMiddleTab('search')}
                >🔍 Vector Search</button>
              </div>
              {middleTab === 'directory' ? (
                <CandidateList 
                  candidates={candidates} 
                  selectedCandidate={selectedCandidate} 
                  onSelectCandidate={handleSelectCandidate} 
                  onRefreshCandidates={refreshCandidates} 
                />
              ) : (
                <SemanticSearch onSelectCandidate={handleSelectCandidate} />
              )}
            </div>
          </div>
        );
      case 'analysis':
        return (
          <div className="page-container">
            <h2 className="page-title">Fit Analysis</h2>
            <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
              <FitAnalysis selectedJob={selectedJob} selectedCandidate={selectedCandidate} />
            </div>
          </div>
        );
      case 'communication':
        return (
          <div className="page-container">
            <h2 className="page-title">Communication Dashboard</h2>
            <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
              <Communication />
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="page-container">
            <h2 className="page-title">Analytics</h2>
            <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
              <Analytics />
            </div>
          </div>
        );
      case 'upload':
      default:
        return (
          <div className="page-container">
            <div className="upload-resume-card">
              <UploadResume onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>
        );
    }
  };

  const isMock = configStatus?.mockMode !== false;

  return (
    <div className="app-container">
      {/* Dynamic Toast notifications */}
      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-bar">
          <div className={`status-pill ${isMock ? 'sandbox' : 'live'}`}>
            <span className="status-indicator"></span>
            <span>{isMock ? 'Sandbox Mode' : 'Live API Mode'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</span>
             <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
               Logout
             </button>
          </div>
          <button className="btn btn-secondary" onClick={() => setIsSettingsOpen(true)}>
            ⚙ Settings
          </button>
        </header>

        {renderContent()}
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSaveSuccess={handleSettingsSaved} 
      />
    </div>
  );
}
