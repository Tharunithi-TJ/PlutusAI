import React from 'react';
import './SystemCheck.css';

const SystemCheck = () => {
  const services = [
    {
      name: 'API Server',
      status: 'OK',
      latency: '45ms',
      lastCheck: '1 minute ago',
      details: 'All endpoints responding normally'
    },
    {
      name: 'AI Model Service',
      status: 'WARNING',
      latency: '120ms',
      lastCheck: '2 minutes ago',
      details: 'Higher than normal latency detected'
    },
    {
      name: 'Database',
      status: 'OK',
      latency: '25ms',
      lastCheck: '1 minute ago',
      details: 'Connection pool stable'
    },
    {
      name: 'Authentication Service',
      status: 'OK',
      latency: '35ms',
      lastCheck: '1 minute ago',
      details: 'Token validation working normally'
    },
    {
      name: 'Storage Service',
      status: 'ERROR',
      latency: '500ms',
      lastCheck: '3 minutes ago',
      details: 'High latency and intermittent timeouts'
    }
  ];

  const metrics = [
    {
      name: 'CPU Usage',
      value: '45%'
    },
    {
      name: 'Memory Usage',
      value: '2.4GB'
    },
    {
      name: 'Storage Usage',
      value: '68%'
    }
  ];

  return (
    <div className="system-check">
      <h1>System Status</h1>

      <div className="services-grid">
        {services.map((service, index) => (
          <div key={index} className="service-card">
            <div className="service-header">
              <h3>{service.name}</h3>
              <span className={`status-badge ${service.status.toLowerCase()}`}>
                {service.status}
              </span>
            </div>
            <div className="service-details">
              <p className="latency">
                Latency: {service.latency} • Last Check: {service.lastCheck}
              </p>
              <p className="details">{service.details}</p>
            </div>
          </div>
        ))}
      </div>

      <h2>System Metrics</h2>
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <h3>{metric.name}</h3>
            <div className="metric-value">{metric.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemCheck; 