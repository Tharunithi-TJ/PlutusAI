import React, { useState } from 'react';
import './UploadDocuments.css';

const UploadDocuments = () => {
  const [formData, setFormData] = useState({
    claimType: 'Medical Claim',
    description: '',
    files: []
  });

  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState([]);

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
    
    const files = [...e.dataTransfer.files];
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = [...e.target.files];
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024;
    });

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles]
    }));

    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(prev => [...prev, { name: file.name, url: e.target.result }]);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(prev => [...prev, { name: file.name, type: 'pdf' }]);
      }
    });
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
    setPreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const data = new FormData();
    data.append('claimType', formData.claimType);
    data.append('description', formData.description);
    formData.files.forEach(file => {
      data.append('files', file);
    });
  
    try {
      const res = await fetch('http://localhost:5000/submit-claim', {
        method: 'POST',
        body: data
      });
  
      const result = await res.json();
      console.log('Server response:', result);
      alert('Claim submitted successfully!');
    } catch (err) {
      console.error('Error submitting claim:', err);
      alert('Failed to submit claim.');
    }
  };
  

  return (
    <div className="upload-container">
      <h1>Upload Claim Documents</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Claim Type</label>
          <select
            value={formData.claimType}
            onChange={(e) => setFormData(prev => ({ ...prev, claimType: e.target.value }))}
            className="form-control"
          >
            <option value="Medical Claim">Medical Claim</option>
            <option value="Auto Insurance">Auto Insurance</option>
            <option value="Property Damage">Property Damage</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of the claim"
            className="form-control"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Upload Documents</label>
          <div 
            className={`upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-input"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileInput}
              className="file-input"
            />
            <div className="upload-prompt">
              <div className="upload-icon">📄</div>
              <p>Click to upload or drag and drop</p>
              <p className="upload-hint">PDF, PNG, JPG (MAX. 10MB)</p>
            </div>
          </div>
        </div>

        {preview.length > 0 && (
          <div className="preview-area">
            {preview.map((file, index) => (
              <div key={index} className="preview-item">
                {file.type === 'pdf' ? (
                  <div className="pdf-preview">PDF</div>
                ) : (
                  <img src={file.url} alt={file.name} className="image-preview" />
                )}
                <p className="file-name">{file.name}</p>
                <button 
                  type="button" 
                  className="remove-file"
                  onClick={() => removeFile(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="submit-button" disabled={formData.files.length === 0}>
          Submit Claim
        </button>
      </form>
    </div>
  );
};

export default UploadDocuments; 