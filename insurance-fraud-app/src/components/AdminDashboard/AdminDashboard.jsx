import React from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-value">1,234</div>
          <div className="stat-change positive">+12%</div>
        </div>

        <div className="stat-card">
          <h3>Active Claims</h3>
          <div className="stat-value">567</div>
          <div className="stat-change positive">+5.3%</div>
        </div>

        <div className="stat-card">
          <h3>System Alerts</h3>
          <div className="stat-value">3</div>
          <div className="stat-change negative">-2</div>
        </div>

        <div className="stat-card">
          <h3>System Health</h3>
          <div className="stat-value">98.5%</div>
          <div className="stat-change positive">+0.5%</div>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <span className="user-icon">👤</span>
            </div>
            <div className="activity-content">
              <h4>New user registered</h4>
              <span className="activity-time">2 minutes ago</span>
            </div>
            <div className="activity-status">
              <span className="status completed">Completed</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">
              <span className="user-icon">👤</span>
            </div>
            <div className="activity-content">
              <h4>New user registered</h4>
              <span className="activity-time">2 minutes ago</span>
            </div>
            <div className="activity-status">
              <span className="status completed">Completed</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">
              <span className="user-icon">👤</span>
            </div>
            <div className="activity-content">
              <h4>New user registered</h4>
              <span className="activity-time">2 minutes ago</span>
            </div>
            <div className="activity-status">
              <span className="status completed">Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 