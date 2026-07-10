import React from 'react';

export default function Sidebar({ currentView, setCurrentView }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'jobs', label: 'Jobs', icon: '💼' },
    { id: 'upload', label: 'Upload Resume', icon: '📄' },
    { id: 'candidates', label: 'Candidates', icon: '👥' },
    { id: 'analysis', label: 'Analysis', icon: '🎯' },
    { id: 'communication', label: 'Communication', icon: '✉️' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">HS</div>
        <div className="brand-text">
          <div className="brand-name">HireSmart</div>
          <div className="brand-sub">Recruitment AI</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => setCurrentView(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
