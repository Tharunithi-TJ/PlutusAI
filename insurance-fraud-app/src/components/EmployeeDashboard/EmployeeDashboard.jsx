import React from 'react';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  return (
    <div className="employee-dashboard">
      <h1>Welcome back, employee@demo.com</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Claims Pending Review</h3>
          <div className="stat-value">12</div>
          <p className="stat-description">Claims awaiting verification</p>
        </div>

        <div className="stat-card">
          <h3>Claims Verified Today</h3>
          <div className="stat-value">8</div>
          <p className="stat-description">Claims processed today</p>
        </div>

        <div className="stat-card">
          <h3>Suspicious Claims</h3>
          <div className="stat-value">3</div>
          <p className="stat-description">Flagged for investigation</p>
        </div>

        <div className="stat-card">
          <h3>Average Review Time</h3>
          <div className="stat-value">15m</div>
          <p className="stat-description">Per claim</p>
        </div>
      </div>

      <div className="ai-recommendations">
        <h2>AI Recommendations</h2>
        <p>Coming soon: AI-powered insights to help you identify potentially fraudulent claims more efficiently.</p>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-content">
              <h4>Verified claim #1234</h4>
              <span className="activity-date">10 minutes ago</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-content">
              <h4>Marked claim #5678 as suspicious</h4>
              <span className="activity-date">1 hour ago</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-content">
              <h4>Completed KYC verification for John Doe</h4>
              <span className="activity-date">2 hours ago</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-content">
              <h4>Updated profile information</h4>
              <span className="activity-date">3 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard; 