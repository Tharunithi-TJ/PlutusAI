import React from 'react';
import '../Dashboard/Dashboard.css';

const AnalystDashboard = () => {
  const stats = [
    {
      title: 'Reports Generated',
      value: '42',
      description: 'Analysis reports created this month'
    },
    {
      title: 'Suspicious Patterns Found',
      value: '17',
      description: 'Potential fraud patterns detected'
    },
    {
      title: 'Data Sources Linked',
      value: '8',
      description: 'External data sources integrated'
    },
    {
      title: 'Insights Shared',
      value: '29',
      description: 'Insights shared with team'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'approved',
      title: 'Report #2024-07 Published',
      description: 'Monthly fraud trend report published',
      time: '1 hour ago'
    },
    {
      id: 2,
      type: 'pending',
      title: 'New Data Source Linked',
      description: 'Integrated new claims database',
      time: '3 hours ago'
    },
    {
      id: 3,
      type: 'warning',
      title: 'Anomaly Detected',
      description: 'Unusual spike in claim frequency',
      time: '5 hours ago'
    }
  ];

  return (
    <div className="dashboard">
      <h1>Analyst Dashboard</h1>
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

export default AnalystDashboard; 