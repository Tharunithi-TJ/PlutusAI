import React from 'react';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const stats = [
    {
      title: 'Claims Pending Review',
      value: '12',
      description: 'Claims awaiting verification'
    },
    {
      title: 'Claims Verified Today',
      value: '8',
      description: 'Claims processed today'
    },
    {
      title: 'Suspicious Claims',
      value: '3',
      description: 'Flagged for investigation'
    },
    {
      title: 'Average Review Time',
      value: '15m',
      description: 'Per claim'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      title: 'Verified claim #1234',
      time: '10 minutes ago'
    },
    {
      id: 2,
      title: 'Marked claim #5678 as suspicious',
      time: '1 hour ago'
    },
    {
      id: 3,
      title: 'Completed KYC verification for John Doe',
      time: '2 hours ago'
    },
    {
      id: 4,
      title: 'Updated profile information',
      time: '3 hours ago'
    }
  ];

  return (
    <div className="employee-dashboard">
      <div className="stats-container">
        {stats.map((stat, index) => (
          <div key={index} className="stat-box">
            <div className="stat-title">{stat.title}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-description">{stat.description}</div>
          </div>
        ))}
      </div>

      <div className="ai-recommendations">
        <h2>AI Recommendations</h2>
        <p>Coming soon: AI-powered insights to help you identify potentially fraudulent claims more efficiently.</p>
      </div>

      <div className="activity-section">
        <div className="activity-header">
          <span className="activity-icon">📋</span>
          <h2>Recent Activity</h2>
        </div>
        <div className="activity-list">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-time">
                <span className="time-icon">🕒</span>
                {activity.time}
              </div>
              <div className="activity-content">
                {activity.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard; 