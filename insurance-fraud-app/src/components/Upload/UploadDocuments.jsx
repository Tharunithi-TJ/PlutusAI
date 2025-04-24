import React, { useState } from 'react';
import { documentService, claimService } from '../../services/api';
import './UploadDocuments.css';

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

  const renderVerificationResult = (result) => {
    const getStatusColor = (valid) => valid ? 'green' : 'red';
    
    return (
      <div className="verification-result" key={result.filename}>
        <h4 style={{ color: getStatusColor(result.verification_result.valid) }}>
          {result.filename}
        </h4>
        
        {result.verification_result.valid ? (
          <div className="verification-details">
            <div className="metadata-section">
              <h5>Document Metadata</h5>
              <p>Format: {result.verification_result.metadata.format}</p>
              <p>Dimensions: {result.verification_result.metadata.width} x {result.verification_result.metadata.height}</p>
            </div>

            <div className="analysis-section">
              <h5>Text Analysis</h5>
              <p>Sentiment: {result.verification_result.text_analysis.sentiment}</p>
              <p>Confidence: {(result.verification_result.text_analysis.sentiment_score * 100).toFixed(2)}%</p>
              <p>Word Count: {result.verification_result.text_analysis.word_count}</p>
            </div>

            {result.verification_result.ela_results && (
              <div className="forensics-section">
                <h5>Image Forensics</h5>
                <p>ELA Mean: {result.verification_result.ela_results.ela_mean.toFixed(2)}</p>
                <p>ELA Std: {result.verification_result.ela_results.ela_std.toFixed(2)}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="verification-error">
            <p>Reason: {result.verification_result.reason}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="upload-container">
      <h2>Upload Claim Documents</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="claimType">Claim Type</label>
          <select
            id="claimType"
            value={formData.claimType}
            onChange={(e) => setFormData({ ...formData, claimType: e.target.value })}
          >
            <option value="Medical Claim">Medical Claim</option>
            <option value="Auto Claim">Auto Claim</option>
            <option value="Property Claim">Property Claim</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            id="file-input"
            multiple
            onChange={handleFileInput}
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
          />
          <label htmlFor="file-input" className="drop-zone-label">
            Drag & drop files here or click to browse
          </label>
          <p className="drop-zone-info">
            Supported formats: PDF, JPG, PNG (max 10MB each)
          </p>
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
          {verificationResults.map(result => renderVerificationResult(result))}
        </div>
      )}
    </div>
  );
};

export default UploadDocuments; 