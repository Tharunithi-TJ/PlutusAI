import React, { useState } from 'react';
import './ReviewClaims.css';
import ClaimAnalysis from '../ClaimAnalysis';

const ReviewClaims = () => {
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const claims = [
    {
      id: 'CLM-001',
      policyHolder: 'John Doe',
      type: 'Auto Insurance',
      amount: '$5,000',
      status: 'Pending',
      documents: [
        { name: 'accident_report.pdf', type: 'pdf' },
        { name: 'repair_estimate.pdf', type: 'pdf' }
      ]
    },
    {
      id: 'CLM-002',
      policyHolder: 'Jane Smith',
      type: 'Home Insurance',
      amount: '$12,000',
      status: 'Pending',
      documents: [
        { name: 'damage_photos.pdf', type: 'pdf' },
        { name: 'contractor_quote.pdf', type: 'pdf' }
      ]
    }
  ];

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

  return (
    <div className="review-claims">
      <h1>Review Claims</h1>

      <div className="claims-table-container">
        <table className="claims-table">
          <thead>
            <tr>
              <th>CLAIM ID</th>
              <th>POLICY HOLDER</th>
              <th>TYPE</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th>DOCUMENTS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id}>
                <td>{claim.id}</td>
                <td>{claim.policyHolder}</td>
                <td>{claim.type}</td>
                <td>{claim.amount}</td>
                <td>
                  <span className="status-badge status-pending">
                    {claim.status}
                  </span>
                </td>
                <td className="documents-cell">
                  {claim.documents.map((doc, index) => (
                    <button
                      key={index}
                      className="document-link"
                      onClick={() => handleViewDocument(doc)}
                    >
                      📄 {doc.name}
                    </button>
                  ))}
                </td>
                <td className="actions-cell">
                  <button
                    className="action-button analyze"
                    onClick={() => handleAnalyzeClaim(claim.id)}
                  >
                    🔍 Analyze
                  </button>
                  <button
                    className="action-button verify"
                    onClick={() => handleVerify(claim.id)}
                  >
                    ✓ Verify
                  </button>
                  <button
                    className="action-button suspicious"
                    onClick={() => handleMarkSuspicious(claim.id)}
                  >
                    ⚠ Mark Suspicious
                  </button>
                  <button
                    className="action-button reject"
                    onClick={() => handleReject(claim.id)}
                  >
                    × Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
  );
};

export default ReviewClaims; 