import React, { useState } from 'react';
import { documentService, claimService } from '../../services/api';
import './UploadDocuments.css';
import DocumentVerification from './DocumentVerification';

const UploadDocuments = () => {
  const [formData, setFormData] = useState({
    claimType: 'Medical Claim',
    description: '',
    files: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState([]);
  const [verificationResults, setVerificationResults] = useState([]);

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
    setError('');
    setSuccess('');
    setVerificationResults([]);

    try {
      const formDataObj = new FormData();
      formDataObj.append('claimType', formData.claimType);
      formDataObj.append('description', formData.description);
      
      // Append each file to the FormData
      formData.files.forEach(file => {
        formDataObj.append('files', file);
      });

      // Add error handling for the response
      const response = await fetch('http://localhost:5000/submit-claim', {
        method: 'POST',
        body: formDataObj,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Server response:', result); // Add this for debugging

      if (result.status === 'success') {
        setSuccess(result.message);
        if (result.data.verification_results) {
          setVerificationResults(result.data.verification_results);
        }
        
        // Reset form
        setFormData({
          claimType: 'Medical Claim',
          description: '',
          files: []
        });
        setPreview([]);
      } else {
        setError(result.message || 'Error submitting claim');
      }
    } catch (err) {
      console.error('Error details:', err); // Add this for debugging
      setError('Error submitting claim: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Claim Documents</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="claimType">Claim Type</label>
          <select
            id="claimType"
            name="claimType"
            value={formData.claimType}
            onChange={(e) => setFormData(prev => ({ ...prev, claimType: e.target.value }))}
          >
            <option value="Medical Claim">Medical Claim</option>
            <option value="Property Claim">Property Claim</option>
            <option value="Liability Claim">Liability Claim</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your claim..."
          />
        </div>

        <div 
          className={`drop-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="fileInput"
            multiple
            onChange={handleFileInput}
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
          />
          <label htmlFor="fileInput" className="drop-zone-label">
            <div className="upload-icon">
              <i className="fas fa-cloud-upload-alt"></i>
            </div>
            <div className="upload-text">
              Drag & drop files here or click to browse
              <div className="upload-hint">
                Supported formats: PDF, JPG, PNG (max 10MB each)
              </div>
            </div>
          </label>
        </div>

        {preview.length > 0 && (
          <div className="preview-container">
            <h3>Selected Files</h3>
            <div className="preview-list">
              {preview.map((file, index) => (
                <div key={index} className="preview-item">
                  {file.type === 'pdf' ? (
                    <div className="pdf-preview">
                      <span>📄</span>
                      <span>{file.name}</span>
                    </div>
                  ) : (
                    <div className="image-preview">
                      <img src={file.url} alt={file.name} />
                      <span>{file.name}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => removeFile(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="submit-button" disabled={formData.files.length === 0}>
          Submit Claim
        </button>
      </form>

      {verificationResults.length > 0 && (
        <div className="verification-results-container">
          <h3>Document Verification Results</h3>
          {verificationResults.map((result, index) => (
            <DocumentVerification key={index} result={result} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadDocuments; 