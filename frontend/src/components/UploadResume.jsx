import React, { useState, useRef } from 'react';

export default function UploadResume({ onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null); 
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);



  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setErrorMessage(null); // Clear errors on new file select
  };

  const [uploadStep, setUploadStep] = useState(0);

  const steps = [
    'Uploading Resume...',
    'Extracting Text...',
    'Parsing Resume...',
    'Extracting Skills...',
    'Generating Summary...',
    'Generating Embeddings...',
    'Saving Candidate...',
    'Creating AI Insights...',
    'Completed'
  ];

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setErrorMessage(null);
    setUploadStep(0);

    const formData = new FormData();
    formData.append('resume', selectedFile);

    // Simulate progress steps
    const progressInterval = setInterval(() => {
      setUploadStep((prev) => {
        if (prev < steps.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    try {
      const response = await fetch('/api/candidates/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      clearInterval(progressInterval);
      setUploadStep(steps.length - 1); // Completed

      setTimeout(() => {
        if (response.ok) {
          onUploadSuccess({ name: selectedFile.name, ...data });
          setSelectedFile(null);
          setLoading(false);
          setUploadStep(0);
        } else {
          setErrorMessage(data.error || 'API failed');
          setLoading(false);
        }
      }, 1000);
    } catch (err) {
      clearInterval(progressInterval);
      setErrorMessage('Network error occurred. Please try again.');
      setLoading(false);
      setUploadStep(0);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <h2 className="upload-resume-title">Upload Candidate Resume</h2>

      <div 
        className={`upload-zone-light ${dragActive ? 'dragging' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          style={{ display: 'none' }} 
          accept=".pdf,.txt,.doc,.docx"
          onChange={handleChange}
        />
        <div className="upload-icon-light">↑</div>
        <div className="upload-text-light">
          Upload a file <span>or drag and drop</span>
        </div>
        <div className="upload-subtext-light">
          PDF, DOCX, DOC, or TXT files up to 10MB
        </div>
      </div>

      {/* Selected File Indicator */}
      {selectedFile && !loading && (
        <div className="selected-file-box">
          <span style={{ fontSize: '1.25rem', color: '#6366f1' }}>📄</span>
          <span className="selected-file-name">{selectedFile.name}</span>
        </div>
      )}

      {/* Progress Indicator */}
      {loading && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: '#334155' }}>{steps[uploadStep]}</span>
            <span style={{ color: '#64748b' }}>{Math.round(((uploadStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div style={{ height: '8px', width: '100%', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              background: '#4f46e5', 
              width: `${((uploadStep + 1) / steps.length) * 100}%`,
              transition: 'width 0.5s ease-in-out'
            }}></div>
          </div>
        </div>
      )}

      {/* Network Error Box */}
      {errorMessage && (
        <div className="network-error-box">
          {errorMessage}
        </div>
      )}

      {/* Upload Button */}
      {!loading && (
        <button 
          className="btn btn-upload-large" 
          style={{ marginTop: '20px' }}
          onClick={handleUploadSubmit}
          disabled={!selectedFile}
        >
          Upload & Parse Resume
        </button>
      )}
    </div>
  );
}
