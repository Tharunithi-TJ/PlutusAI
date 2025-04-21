import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Active Claims</h3>
          <div className="stat-value">3</div>
          <p className="stat-description">Claims currently being processed</p>
        </div>

        <div className="stat-card">
          <h3>Total Claims</h3>
          <div className="stat-value">12</div>
          <p className="stat-description">All claims submitted</p>
        </div>

        <div className="stat-card">
          <h3>Approved Claims</h3>
          <div className="stat-value">8</div>
          <p className="stat-description">Successfully processed claims</p>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon pending"></div>
            <div className="activity-content">
              <h4>New Claim Submitted</h4>
              <p>Medical claim #CLM-001 is pending review</p>
              <span className="activity-date">March 15, 2024</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon approved"></div>
            <div className="activity-content">
              <h4>Claim Approved</h4>
              <p>Auto insurance claim #CLM-002 has been approved</p>
              <span className="activity-date">March 10, 2024</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon warning"></div>
            <div className="activity-content">
              <h4>Additional Information Required</h4>
              <p>Property damage claim #CLM-003 needs additional documentation</p>
              <span className="activity-date">March 5, 2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 