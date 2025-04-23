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

    try {
      // First upload all documents
      const uploadPromises = formData.files.map(file => documentService.uploadDocument(file));
      const uploadResults = await Promise.all(uploadPromises);
      
      // Create the claim with document references
      const claimData = {
        claim_type: formData.claimType,
        description: formData.description,
        documents: uploadResults.map(result => result.data.file_path),
        claim_date: new Date().toISOString().split('T')[0],
        amount: 0, // This would typically come from a form field
        policy_id: 1 // This would typically come from the user's active policy
      };

      const claimResponse = await claimService.createClaim(claimData);
      
      setSuccess('Claim submitted successfully!');
      setFormData({
        claimType: 'Medical Claim',
        description: '',
        files: []
      });
      setPreview([]);
    } catch (err) {
      console.error('Error submitting claim:', err);
      setError(err.response?.data?.message || 'Failed to submit claim. Please try again.');
    }
  };

  return (
    <div className="upload-container">
      <h1>Upload Claim Documents</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

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
            required
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