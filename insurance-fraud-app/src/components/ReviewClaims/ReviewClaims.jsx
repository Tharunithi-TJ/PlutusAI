import React, { useState, useEffect } from 'react';
import './ReviewClaims.css';
import ClaimAnalysis from '../ClaimAnalysis';
import ClaimVisualization from './ClaimVisualization';

const ReviewClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    claimType: ''
  });
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [visualizationClaim, setVisualizationClaim] = useState(null);
  const [reviewData, setReviewData] = useState({
    claimId: null,
    notes: '',
    showModal: false
  });
  const [anomalyResults, setAnomalyResults] = useState({});
  const [analyzing, setAnalyzing] = useState({});

  useEffect(() => {
    fetchClaims();
  }, [filters]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = 'http://localhost:5000/claims';
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.claimType) params.append('claim_type', filters.claimType);
      if (params.toString()) url += `?${params.toString()}`;

      console.log('Fetching claims from:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('Response:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.status === 'success') {
        setClaims(data.data.claims || []);
      } else {
        throw new Error(data.message || 'Failed to fetch claims');
      }
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDateTime = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  const renderVerificationDetails = (result) => {
    if (!result.verification_result) return null;
    const vr = result.verification_result;

    return (
      <div className="verification-details">
        <div className="verification-status">
          <span className={`status-indicator ${vr.valid ? 'valid' : 'invalid'}`}>
            {vr.valid ? 'Valid' : 'Invalid'}
          </span>
        </div>
        
        {vr.metadata && (
          <div className="metadata-section">
            <h5>Document Info</h5>
            <p>Format: {vr.metadata.format}</p>
            {vr.metadata.width && (
              <p>Dimensions: {vr.metadata.width} x {vr.metadata.height}</p>
            )}
          </div>
        )}

        {vr.text_analysis && (
          <div className="analysis-section">
            <h5>Text Analysis</h5>
            <p>Words: {vr.text_analysis.word_count}</p>
            <p>Sentiment: {vr.text_analysis.sentiment}</p>
            <p>Confidence: {(vr.text_analysis.sentiment_score * 100).toFixed(1)}%</p>
          </div>
        )}

        {vr.ela_results && (
          <div className="forensics-section">
            <h5>Image Analysis</h5>
            <p>ELA Score: {vr.ela_results.ela_mean.toFixed(2)}</p>
            <p>Variation: {vr.ela_results.ela_std.toFixed(2)}</p>
          </div>
        )}
      </div>
    );
  };

  const handleVerify = (id) => {
    console.log('Verifying claim:', id);
  };

  const handleMarkSuspicious = (id) => {
    console.log('Marking claim as suspicious:', id);
  };

  const handleReject = (id) => {
    console.log('Rejecting claim:', id);
  };

  const handleViewDocument = (document) => {
    console.log('Viewing document:', document);
  };

  const handleAnalyzeClaim = (claimId) => {
    setSelectedClaim(claimId);
    setShowAnalysis(true);
  };

  const handleStatusUpdate = async (claimId, newStatus) => {
    try {
      const response = await fetch('http://localhost:5000/update-claim-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claimId: claimId,
          status: newStatus,
          notes: reviewData.notes
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Update local state
        setClaims(claims.map(claim => 
          claim.id === claimId ? { ...claim, status: newStatus } : claim
        ));
        setReviewData({ claimId: null, notes: '', showModal: false });
        // Show success message
        alert(`Claim ${claimId} has been ${newStatus}`);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(`Failed to update claim status: ${err.message}`);
    }
  };

  const checkAnomalies = async (claimId) => {
    try {
      setAnalyzing(prev => ({ ...prev, [claimId]: true }));
      setError(null);

      const response = await fetch('http://localhost:5000/check-claim-anomalies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ claimId })
      });

      const data = await response.json();
      console.log('Anomaly detection response:', data); // Debug log

      if (data.status === 'success') {
        setAnomalyResults(prev => ({
          ...prev,
          [claimId]: data.data
        }));
      } else {
        throw new Error(data.message || 'Failed to analyze claim');
      }
    } catch (err) {
      console.error('Anomaly detection error:', err);
      setError(`Failed to check anomalies: ${err.message}`);
    } finally {
      setAnalyzing(prev => ({ ...prev, [claimId]: false }));
    }
  };

  const handleShowVisualization = (claim) => {
    setVisualizationClaim(claim);
    setShowVisualization(true);
  };

  const handleCloseVisualization = () => {
    setShowVisualization(false);
    setVisualizationClaim(null);
  };

  const ReviewModal = ({ claim, onClose }) => (
    <div className="review-modal-overlay">
      <div className="review-modal">
        <h3>Review Claim #{claim.id}</h3>
        <div className="modal-content">
          <div className="review-summary">
            <p><strong>Type:</strong> {claim.claim_type}</p>
            <p><strong>Submitted:</strong> {formatDateTime(claim.submitted_at)}</p>
            <p><strong>Documents:</strong> {claim.verification_results?.length || 0} files</p>
          </div>
          <div className="review-notes">
            <label htmlFor="review-notes">Review Notes:</label>
            <textarea
              id="review-notes"
              value={reviewData.notes}
              onChange={(e) => setReviewData({
                ...reviewData,
                notes: e.target.value
              })}
              placeholder="Enter your review notes..."
            />
          </div>
          <div className="review-actions">
            <button 
              className="approve-btn"
              onClick={() => handleStatusUpdate(claim.id, 'approved')}
            >
              Approve Claim
            </button>
            <button 
              className="reject-btn"
              onClick={() => handleStatusUpdate(claim.id, 'rejected')}
            >
              Reject Claim
            </button>
            <button 
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const AnomalyResults = ({ results }) => {
    if (!results) return null;

    const riskLevel = results.anomaly_details?.risk_level || {
      level: 'Unknown',
      color: '#6c757d'
    };

    return (
      <div className="anomaly-results">
        <h4>Risk Analysis Results</h4>
        <div className="risk-score" style={{ 
          color: riskLevel.color 
        }}>
          <span className="score">
            Risk Score: {results.risk_score || 0}%
          </span>
          <span className="level">
            ({riskLevel.level || 'Unknown'})
          </span>
        </div>

        {results.anomaly_details?.document_anomalies?.length > 0 ? (
          <div className="document-anomalies">
            <h5>Document Anomalies Found:</h5>
            {results.anomaly_details.document_anomalies.map((doc, index) => (
              <div key={index} className="document-anomaly">
                <h6>{doc.filename}</h6>
                {doc.anomalies?.length > 0 ? (
                  <ul>
                    {doc.anomalies.map((anomaly, i) => (
                      <li key={i} className={`severity-${anomaly.severity || 'low'}`}>
                        {anomaly.details || 'Unknown anomaly'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-anomalies">No anomalies detected</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-anomalies">No document anomalies detected</p>
        )}

        {results.anomaly_details?.risk_factors?.length > 0 && (
          <div className="risk-factors">
            <h5>Risk Factors:</h5>
            <ul>
              {results.anomaly_details.risk_factors.map((factor, index) => (
                <li key={index} className={`severity-${factor.severity || 'low'}`}>
                  <strong>{factor.factor}:</strong> {factor.details}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="loading">Loading claims...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="review-claims-container">
      <div className="review-claims-header">
        <h2>Claims Review Dashboard</h2>
        <div className="header-actions">
          {/* Add any header actions here */}
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-item">
            <label htmlFor="status-filter">Status</label>
            <select 
              id="status-filter"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="filter-item">
            <label htmlFor="type-filter">Claim Type</label>
            <select 
              id="type-filter"
              value={filters.claimType}
              onChange={(e) => setFilters({...filters, claimType: e.target.value})}
            >
              <option value="">All Types</option>
              <option value="Medical Claim">Medical</option>
              <option value="Auto Claim">Auto</option>
              <option value="Property Claim">Property</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="claims-list">
        {claims.map(claim => (
          <div key={claim.id} className="claim-card">
            <div className="claim-header">
              <div className="claim-title">
                <h3>Claim #{claim.id}</h3>
                <span className={`status-badge ${claim.status}`}>
                  {claim.status}
                </span>
              </div>
              <div className="claim-date">
                {formatDateTime(claim.submitted_at)}
              </div>
            </div>

            <div className="claim-details">
              <div className="detail-item">
                <span className="detail-label">Type</span>
                <span className="detail-value">{claim.claim_type}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Description</span>
                <span className="detail-value">{claim.description}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Documents</span>
                <span className="detail-value">
                  {claim.verification_results?.length || 0} files
                </span>
              </div>
            </div>

            {claim.verification_results?.length > 0 && (
              <div className="documents-section">
                <h4>Uploaded Documents</h4>
                <div className="documents-grid">
                  {renderVerificationDetails(claim.verification_results[0])}
                </div>
              </div>
            )}

            <div className="claim-actions">
              {claim.status === 'pending' && (
                <>
                  <button 
                    className="review-btn"
                    onClick={() => setReviewData({
                      claimId: claim.id,
                      notes: '',
                      showModal: true
                    })}
                  >
                    Review Claim
                  </button>
                  <button 
                    className={`anomaly-btn ${analyzing[claim.id] ? 'analyzing' : ''}`}
                    onClick={() => checkAnomalies(claim.id)}
                    disabled={analyzing[claim.id]}
                  >
                    {analyzing[claim.id] ? 'Analyzing...' : 'Check Anomalies'}
                  </button>
                  <button
                    className="action-button visualize"
                    onClick={() => handleShowVisualization(claim)}
                  >
                    Show Visualization
                  </button>
                </>
              )}
            </div>

            {anomalyResults[claim.id] && (
              <AnomalyResults results={anomalyResults[claim.id]} />
            )}
          </div>
        ))}
      </div>

      {showAnalysis && selectedClaim && (
        <div className="analysis-modal">
          <div className="analysis-content">
            <button 
              className="close-button"
              onClick={() => setShowAnalysis(false)}
            >
              ×
            </button>
            <ClaimAnalysis claimId={selectedClaim} />
          </div>
        </div>
      )}

      {reviewData.showModal && (
        <ReviewModal 
          claim={claims.find(c => c.id === reviewData.claimId)}
          onClose={() => setReviewData({ claimId: null, notes: '', showModal: false })}
        />
      )}

      {showVisualization && visualizationClaim && (
        <ClaimVisualization
          claim={visualizationClaim}
          onClose={handleCloseVisualization}
          anomalyResults={anomalyResults}
        />
      )}
    </div>
  );
};

export default ReviewClaims; 