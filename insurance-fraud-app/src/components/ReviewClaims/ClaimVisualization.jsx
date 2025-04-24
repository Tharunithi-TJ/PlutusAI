import React from 'react';
import './ClaimVisualization.css';

const ClaimVisualization = ({ claim, onClose, anomalyResults }) => {
  if (!claim) return null;

  // Use actual anomaly results or fallback to static values
  const analyticsData = {
    // Use actual risk score or fallback to static value
    isolationScore: anomalyResults?.[claim.id]?.risk_score 
      ? anomalyResults[claim.id].risk_score / 100 
      : 0.142, // static fallback value of 14.2%
    
    // Outlier Analysis
    outlierMetrics: {
      zScore: ((claim.amount - 5000) / 2000).toFixed(2),
      percentile: 28, // static value
      thresholdDeviation: 2.13 // static value
    },

    // Temporal Patterns (static values)
    temporalPatterns: [
      { month: 'Jan', frequency: 12 },
      { month: 'Feb', frequency: 15 },
      { month: 'Mar', frequency: 10 },
      { month: 'Apr', frequency: 18 },
      { month: 'May', frequency: 22 },
      { month: 'Jun', frequency: 16 }
    ],

    // Feature Analysis (static values)
    featureImportance: [
      { feature: 'Amount', score: 0.85 },
      { feature: 'Frequency', score: 0.72 },
      { feature: 'Time Pattern', score: 0.68 },
      { feature: 'Documentation', score: 0.63 },
      { feature: 'Location', score: 0.58 }
    ],

    // User Behavior (use actual data or fallback)
    userBehaviorMetrics: {
      claimFrequency: anomalyResults?.[claim.id]?.anomaly_details?.risk_level?.level || 'High',
      patternMatch: 0.76,
      riskIndicators: anomalyResults?.[claim.id]?.anomaly_details?.risk_factors?.map(f => f.factor) || 
        ['Frequent Claims', 'Amount Variation', 'Time Pattern']
    }
  };

  return (
    <div className="visualization-overlay">
      <div className="visualization-modal">
        <div className="visualization-header">
          <h3>Advanced Analytics - Claim ID: {claim.id}</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="visualization-content">
          {/* Statistical Analysis & Isolation Forest */}
          <div className="chart-container">
            <h4>Anomaly Detection Score</h4>
            <div className="isolation-forest-gauge">
              <svg viewBox="0 0 200 120">
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y1="0%">
                    <stop offset="0%" style={{ stopColor: '#4CAF50' }} />
                    <stop offset="50%" style={{ stopColor: '#FFC107' }} />
                    <stop offset="100%" style={{ stopColor: '#F44336' }} />
                  </linearGradient>
                </defs>
                <path
                  d="M20,100 A80,80 0 0,1 180,100"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="20"
                />
                <path
                  d="M20,100 A80,80 0 0,1 180,100"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="20"
                  strokeDasharray={`${analyticsData.isolationScore * 251.2}, 251.2`}
                />
                <text x="100" y="85" textAnchor="middle" className="score-value">
                  {(analyticsData.isolationScore * 100).toFixed(1)}%
                </text>
                <text x="100" y="105" textAnchor="middle" className="score-label">
                  Anomaly Score
                </text>
              </svg>
            </div>
          </div>

          {/* Outlier Detection */}
          <div className="chart-container">
            <h4>Outlier Analysis</h4>
            <div className="outlier-metrics">
              <div className="metric-item">
                <span className="metric-label">Z-Score:</span>
                <span className="metric-value" style={{
                  color: Math.abs(analyticsData.outlierMetrics.zScore) > 2 ? '#F44336' : '#4CAF50'
                }}>
                  {analyticsData.outlierMetrics.zScore}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Percentile:</span>
                <span className="metric-value">
                  {analyticsData.outlierMetrics.percentile}th
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Threshold Deviation:</span>
                <span className="metric-value">
                  {analyticsData.outlierMetrics.thresholdDeviation.toFixed(2)}σ
                </span>
              </div>
            </div>
          </div>

          {/* Temporal Pattern Analysis */}
          <div className="chart-container">
            <h4>Temporal Pattern Analysis</h4>
            <div className="temporal-chart">
              <svg viewBox="0 0 300 150">
                <g transform="translate(40, 10)">
                  {/* Y-axis */}
                  <line x1="0" y1="0" x2="0" y2="100" stroke="#ccc" />
                  {/* X-axis */}
                  <line x1="0" y1="100" x2="240" y2="100" stroke="#ccc" />
                  
                  {/* Plot points and lines */}
                  {analyticsData.temporalPatterns.map((point, index, arr) => {
                    const x = index * 40;
                    const y = 100 - (point.frequency / 25 * 100);
                    const nextPoint = arr[index + 1];
                    
                    return (
                      <g key={point.month}>
                        <circle cx={x} cy={y} r="4" fill="#3498db" />
                        {nextPoint && (
                          <line 
                            x1={x} 
                            y1={y} 
                            x2={x + 40} 
                            y2={100 - (nextPoint.frequency / 25 * 100)}
                            stroke="#3498db"
                            strokeWidth="2"
                          />
                        )}
                        <text x={x} y="120" textAnchor="middle" fontSize="12">
                          {point.month}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>

          {/* Feature Engineering */}
          <div className="chart-container">
            <h4>Feature Importance Analysis</h4>
            <div className="feature-bars">
              {analyticsData.featureImportance.map((feature, index) => (
                <div key={feature.feature} className="feature-bar-container">
                  <div className="feature-label">{feature.feature}</div>
                  <div className="feature-bar-wrapper">
                    <div 
                      className="feature-bar"
                      style={{ width: `${feature.score * 100}%` }}
                    >
                      {(feature.score * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Behavior Analysis */}
          <div className="chart-container">
            <h4>User Behavior Analysis</h4>
            <div className="behavior-analysis">
              <div className="behavior-metric">
                <span className="metric-label">Claim Frequency:</span>
                <span className={`metric-value ${analyticsData.userBehaviorMetrics.claimFrequency.toLowerCase()}`}>
                  {analyticsData.userBehaviorMetrics.claimFrequency}
                </span>
              </div>
              <div className="behavior-metric">
                <span className="metric-label">Pattern Match:</span>
                <div className="pattern-match-bar">
                  <div 
                    className="pattern-match-fill"
                    style={{ width: `${analyticsData.userBehaviorMetrics.patternMatch * 100}%` }}
                  />
                </div>
              </div>
              <div className="risk-indicators">
                <span className="metric-label">Risk Indicators:</span>
                <div className="indicator-tags">
                  {analyticsData.userBehaviorMetrics.riskIndicators.map((indicator, index) => (
                    <span key={index} className="risk-tag">
                      {indicator}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimVisualization; 