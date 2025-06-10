import React, { useState, useEffect } from 'react';
import './StatusTracker.css';

const StatusTracker = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClaim, setSelectedClaim] = useState(null);

    useEffect(() => {
        fetchUserClaims();
    }, []);

    const fetchUserClaims = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/claims');
            const data = await response.json();

            if (data.status === 'success') {
                setClaims(data.data.claims);
            } else {
                throw new Error(data.message || 'Failed to fetch claims');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
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

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'status-approved';
            case 'rejected':
                return 'status-rejected';
            case 'pending':
                return 'status-pending';
            default:
                return '';
        }
    };

    const getVerificationStatusIcon = (isValid) => {
        return isValid ? 
            '✅' : // Green checkmark for valid
            '❌'; // Red X for invalid
    };

    const renderDocumentDetails = (verificationResults) => {
        if (!verificationResults || verificationResults.length === 0) {
            return <p>No documents available</p>;
        }

        return (
            <div className="documents-list">
                {verificationResults.map((doc, index) => (
                    <div key={index} className="document-item">
                        <div className="document-file-summary">
                            <span className="document-icon">📄</span>
                            <span className="document-name">{doc.filename}</span>
                            <span className="verification-icon">
                                {getVerificationStatusIcon(doc.verification_result.valid)}
                            </span>
                        </div>
                        
                        {doc.verification_result.valid ? (
                            <div className="document-details-container">
                                {doc.verification_result.metadata && (
                                    <div className="detail-section">
                                        <h5>Document Info</h5>
                                        <p>Format: {doc.verification_result.metadata.format}</p>
                                        {doc.verification_result.metadata.width && (
                                            <p>Size: {doc.verification_result.metadata.width} x {doc.verification_result.metadata.height}</p>
                                        )}
                                    </div>
                                )}
                                
                                {doc.verification_result.text_analysis && (
                                    <div className="detail-section">
                                        <h5>Content Analysis</h5>
                                        <p>Words: {doc.verification_result.text_analysis.word_count}</p>
                                        <p>Sentiment: {doc.verification_result.text_analysis.sentiment}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="error-message">
                                {doc.verification_result.reason}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    if (loading) return <div className="loading">Loading your claims...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="status-tracker">
            <h1>Claim Status Tracker</h1>
            
            <div className="claims-timeline">
                {claims.length === 0 ? (
                    <p>No claims found</p>
                ) : (
                    claims.map(claim => (
                        <div 
                            key={claim.id} 
                            className={`claim-card ${selectedClaim === claim.id ? 'selected' : ''}`}
                            onClick={() => setSelectedClaim(selectedClaim === claim.id ? null : claim.id)}
                        >
                            <div className="claim-header">
                                <div className="claim-title">
                                    <h3>Claim #{claim.id}</h3>
                                    <span 
                                        className={`status-indicator ${getStatusClass(claim.status)}`}
                                    >
                                        {claim.status}
                                    </span>
                                </div>
                                <div className="claim-date">
                                    {formatDateTime(claim.submitted_at)}
                                </div>
                            </div>

                            <div className="claim-summary">
                                <p><strong>Type:</strong> {claim.claim_type}</p>
                                <p><strong>Description:</strong> {claim.description}</p>
                            </div>

                            {selectedClaim === claim.id && (
                                <div className="claim-details">
                                    <h4>Submitted Documents</h4>
                                    {renderDocumentDetails(claim.verification_results)}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StatusTracker; 