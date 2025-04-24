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
      
      // Use the claim response to show success message with claim ID
      setSuccess(`Claim #${claimResponse.data.claim_number} submitted successfully!`);
      setFormData({
        claimType: 'Medical Claim',
        description: '',
        files: []
      });
      setPreview([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting claim');
    }
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
    </div>
  );
};

export default UploadDocuments; 