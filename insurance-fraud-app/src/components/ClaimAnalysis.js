import React, { useState, useEffect } from 'react';
import { aiService } from '../services/aiService';
import './ClaimAnalysis.css';

const ClaimAnalysis = ({ claimId }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const response = await aiService.analyzeClaim(claimId);
        setAnalysis(response.data);
      } catch (err) {
        setError(err.message || 'Error analyzing claim');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [claimId]);

  if (loading) return <div className="loading">Analyzing claim...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="claim-analysis">
      {analysis && (
        <>
          <h3>Fraud Analysis</h3>
          <div className={`risk-level ${analysis.is_high_risk ? 'high-risk' : 'low-risk'}`}>
            Risk Level: {analysis.is_high_risk ? 'High' : 'Low'}
          </div>
          <div className="metrics">
            <div className="metric">
              <span className="label">Anomaly Score:</span>
              <span className="value">{analysis.anomaly_score.toFixed(2)}</span>
            </div>
            <div className="metric">
              <span className="label">Fraud Probability:</span>
              <span className="value">{(analysis.fraud_probability * 100).toFixed(1)}%</span>
            </div>
          </div>
          {analysis.is_high_risk && (
            <div className="alert alert-warning">
              This claim has been flagged as potentially fraudulent. Please review carefully.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClaimAnalysis; 