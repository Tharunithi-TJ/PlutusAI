import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Claims',
      value: '1,234',
      description: 'Claims processed this month'
    },
    {
      title: 'Fraud Detection Rate',
      value: '98.5%',
      description: 'Accuracy in fraud detection'
    },
    {
      title: 'Processing Time',
      value: '24h',
      description: 'Average claim processing time'
    },
    {
      title: 'Active Cases',
      value: '156',
      description: 'Currently under investigation'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'approved',
      title: 'Claim #12345 Approved',
      description: 'Auto insurance claim processed successfully',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'pending',
      title: 'New Claim Submitted',
      description: 'Home insurance claim under initial review',
      time: '4 hours ago'
    },
    {
      id: 3,
      type: 'warning',
      title: 'Potential Fraud Detected',
      description: 'Unusual pattern detected in claim #98765',
      time: '6 hours ago'
    }
  ];

  return (
    <div className="dashboard">
      <h1>Insurance Dashboard</h1>
      
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <h3>{stat.title}</h3>
            <div className="stat-value">{stat.value}</div>
            <p className="stat-description">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className={`activity-icon ${activity.type}`} />
              <div className="activity-content">
                <h4>{activity.title}</h4>
                <p>{activity.description}</p>
              </div>
              <div className="activity-date">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 