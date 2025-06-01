import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import Chatbot from '../Chatbot';
import './AdvancedAnalytics.css';

const metrics = [
  {
    key: 'velocity',
    label: 'Transaction Velocity Monitoring',
    description: 'Monitors the speed of transaction flow to detect unusual spikes.',
    diagram: 'Line/Area Chart'
  },
  {
    key: 'geo',
    label: 'Geographic Anomaly Detection',
    description: 'Analyzes transaction locations and scores regions for anomalies.',
    diagram: 'Choropleth Map'
  },
  {
    key: 'benford',
    label: "Benford's Law Analysis",
    description: "Checks numerical distributions in claim amounts or IDs to uncover manipulation.",
    diagram: 'Pyramid Chart'
  },
  {
    key: 'behavior',
    label: 'Behavioral Analytics',
    description: 'Observes user activity patterns such as claim timing, login frequency, or navigation.',
    diagram: 'Radar Chart'
  }
];

const velocityLineData = [{
  x: Array.from({length: 24}, (_, i) => `${i}:00`),
  y: [5, 7, 6, 8, 12, 20, 35, 50, 60, 80, 120, 150, 130, 110, 90, 70, 60, 55, 50, 40, 30, 20, 10, 6],
  type: 'scatter',
  mode: 'lines+markers',
  fill: 'tozeroy',
  line: { color: '#2980b9', width: 4, shape: 'spline' },
  marker: { color: '#6dd5fa', size: 8 },
  name: 'Transactions per Hour',
  hoverinfo: 'x+y',
}];

const velocityLineLayout = {
  margin: { t: 40, l: 40, r: 20, b: 40 },
  width: 600,
  height: 400,
  plot_bgcolor: 'rgba(255,255,255,0.95)',
  paper_bgcolor: 'rgba(255,255,255,0.95)',
  title: 'Transaction Velocity (per hour)',
  font: { family: 'Roboto', size: 16 },
  xaxis: { title: 'Hour', showgrid: true, zeroline: false },
  yaxis: { title: 'Transactions', showgrid: true, zeroline: false },
  showlegend: false,
  transition: { duration: 800, easing: 'cubic-in-out' },
  autosize: false
};

const geoChoroplethData = [{
  type: 'choropleth',
  locationmode: 'ISO-3',
  locations: ['USA', 'CAN', 'MEX', 'BRA', 'ARG'],
  z: [12, 45, 8, 30, 60],
  text: ['USA', 'Canada', 'Mexico', 'Brazil', 'Argentina'],
  colorscale: 'Viridis',
  autocolorscale: false,
  reversescale: false,
  marker: { line: { color: 'rgb(180,180,180)', width: 1 } },
  colorbar: { title: 'Anomaly Score' },
  zmin: 0,
  zmax: 70,
}];

const geoChoroplethLayout = {
  margin: { t: 40, l: 0, r: 0, b: 0 },
  width: 600,
  height: 400,
  geo: {
    scope: 'world',
    projection: { type: 'natural earth' },
    showland: true,
    landcolor: 'rgb(240, 240, 240)',
    showcountries: true,
    countrycolor: 'rgb(200, 200, 200)',
  },
  plot_bgcolor: 'rgba(255,255,255,0.95)',
  paper_bgcolor: 'rgba(255,255,255,0.95)',
  title: 'Geographic Anomaly Map',
  font: { family: 'Roboto', size: 16 },
  showlegend: false,
  transition: { duration: 800, easing: 'cubic-in-out' },
  autosize: false
};

const pyramidData = [{
  type: 'bar',
  y: ['1','2','3','4','5','6','7','8','9'],
  x: [30, 18, 13, 10, 8, 7, 6, 5, 3],
  orientation: 'h',
  marker: { color: '#00b894' },
  name: 'Observed',
  width: 0.7
}, {
  type: 'bar',
  y: ['1','2','3','4','5','6','7','8','9'],
  x: [30, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6],
  orientation: 'h',
  marker: { color: '#e17055' },
  name: 'Expected (Benford)',
  width: 0.4
}];

const radarData = [{
  type: 'scatterpolar',
  r: [120, 45, 200, 110, 120],
  theta: ['Login', 'Claim Submit', 'Navigation', 'Logout', 'Login'],
  fill: 'toself',
  name: 'Events per User',
  marker: { color: '#636efa' },
  line: { color: '#636efa', width: 3 }
}];

const chartLayouts = {
  velocity: velocityLineLayout,
  geo: geoChoroplethLayout,
  benford: {
    margin: { t: 40, l: 0, r: 0, b: 0 },
    width: 600,
    height: 400,
    barmode: 'overlay',
    plot_bgcolor: 'rgba(255,255,255,0.95)',
    paper_bgcolor: 'rgba(255,255,255,0.95)',
    title: "Benford's Law Pyramid",
    font: { family: 'Roboto', size: 16 },
    showlegend: true,
    legend: { orientation: 'h', y: -0.2 },
    transition: { duration: 800, easing: 'cubic-in-out' },
    autosize: false
  },
  behavior: {
    margin: { t: 40, l: 0, r: 0, b: 0 },
    width: 600,
    height: 400,
    polar: { radialaxis: { visible: true, range: [0, 220] } },
    plot_bgcolor: 'rgba(255,255,255,0.95)',
    paper_bgcolor: 'rgba(255,255,255,0.95)',
    title: 'Behavioral Analytics Radar',
    font: { family: 'Roboto', size: 16 },
    showlegend: false,
    transition: { duration: 800, easing: 'cubic-in-out' },
    autosize: false
  }
};

const AdvancedAnalytics = () => {
  const [selected, setSelected] = useState('velocity');
  const currentMetric = metrics.find(m => m.key === selected);

  const renderChart = () => {
    switch(selected) {
      case 'velocity':
        return <Plot data={velocityLineData} layout={chartLayouts.velocity} config={{ responsive: true, displayModeBar: false, scrollZoom: false }} style={{ margin: '0 auto' }} />;
      case 'geo':
        return <Plot data={geoChoroplethData} layout={chartLayouts.geo} config={{ responsive: true, displayModeBar: false, scrollZoom: false }} style={{ margin: '0 auto' }} />;
      case 'benford':
        return <Plot data={pyramidData} layout={chartLayouts.benford} config={{ responsive: true, displayModeBar: false, scrollZoom: false }} style={{ margin: '0 auto' }} />;
      case 'behavior':
        return <Plot data={radarData} layout={chartLayouts.behavior} config={{ responsive: true, displayModeBar: false, scrollZoom: false }} style={{ margin: '0 auto' }} />;
      default:
        return null;
    }
  };

  return (
    <div className="advanced-analytics-container">
      <aside className="advanced-sidebar">
        <h2>Advanced Analytics</h2>
        <nav>
          {metrics.map(metric => (
            <button
              key={metric.key}
              className={`sidebar-btn${selected === metric.key ? ' active' : ''}`}
              onClick={() => setSelected(metric.key)}
            >
              {metric.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="advanced-main">
        <h3>{currentMetric.label}</h3>
        <p className="metric-desc">{currentMetric.description}</p>
        <div className="chart-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {renderChart()}
        </div>
        <Chatbot sectionLabel={currentMetric.label} diagramLabels={[currentMetric.diagram]} />
      </main>
    </div>
  );
};

export default AdvancedAnalytics; 