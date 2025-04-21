import React from 'react';
import './StatusTracker.css';

const StatusTracker = () => {
  const claims = [
    {
      id: 'CLM-001',
      date: '2024-03-15',
      type: 'Medical Claim',
      status: 'Pending',
      riskScore: '15%'
    },
    {
      id: 'CLM-002',
      date: '2024-03-10',
      type: 'Auto Insurance',
      status: 'Approved',
      riskScore: '5%'
    },
    {
      id: 'CLM-003',
      date: '2024-03-05',
      type: 'Property Damage',
      status: 'Suspicious',
      riskScore: '75%'
    }
  ];

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'suspicious':
        return 'status-suspicious';
      default:
        return '';
    }
  };

  const getRiskClass = (score) => {
    const numericScore = parseInt(score);
    if (numericScore <= 20) return 'risk-low';
    if (numericScore <= 50) return 'risk-medium';
    return 'risk-high';
  };

  return (
    <div className="status-tracker">
      <h1>Claim Status Tracker</h1>

      <div className="table-container">
        <table className="claims-table">
          <thead>
            <tr>
              <th>CLAIM ID</th>
              <th>DATE</th>
              <th>TYPE</th>
              <th>STATUS</th>
              <th>RISK SCORE</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id}>
                <td>{claim.id}</td>
                <td>{new Date(claim.date).toLocaleDateString()}</td>
                <td>{claim.type}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(claim.status)}`}>
                    {claim.status}
                  </span>
                </td>
                <td>
                  <span className={`risk-score ${getRiskClass(claim.riskScore)}`}>
                    {claim.riskScore}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatusTracker; 