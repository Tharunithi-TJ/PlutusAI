import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './LinkedAnalytics.css';

// Vibrant color palette matching Analytics component
const COLORS = {
  primary: 'rgba(41, 128, 185, 0.95)',      // Bright Blue
  secondary: 'rgba(231, 76, 60, 0.95)',     // Vibrant Red
  tertiary: 'rgba(241, 196, 15, 0.95)',     // Golden Yellow
  quaternary: 'rgba(46, 204, 113, 0.95)',   // Emerald Green
  quinary: 'rgba(155, 89, 182, 0.95)',      // Rich Purple
  senary: 'rgba(243, 156, 18, 0.95)',       // Bright Orange
  background: 'rgba(255, 255, 255, 0.9)'    // Semi-transparent white
};

const LinkedAnalytics = () => {
  const [state, setState] = useState({
    totalTx: 500,
    sampleSize: 500,
    timeWindow: 24,
    historicalBaseline: 450,
    standardDeviation: 50,
    unusualLocations: 0.1 // 10% of transactions are from unusual locations
  });

  const velocityChartRef = useRef(null);
  const geoChartRef = useRef(null);
  const benfordChartRef = useRef(null);
  const behaviorChartRef = useRef(null);

  const createVelocityChart = () => {
    const svg = d3.select(velocityChartRef.current)
      .selectAll('svg').data([null]);
    
    const svgEnter = svg.enter()
      .append('svg')
      .attr('width', '100%')
      .attr('height', '250')
      .attr('viewBox', '0 0 400 250')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const container = svgEnter.merge(svg);
    container.selectAll('*').remove();

    // Calculate velocity score
    const velocity = state.totalTx / state.timeWindow;
    const maxVelocity = 50; // Threshold for maximum normal velocity
    const normalizedVelocity = Math.min(velocity / maxVelocity, 1);
    
    // Add title and description
    container.append('text')
      .attr('x', 200)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('class', 'chart-title')
      .text(`Transaction Velocity: ${velocity.toFixed(1)}/hour`);

    container.append('text')
      .attr('x', 200)
      .attr('y', 50)
      .attr('text-anchor', 'middle')
      .attr('class', 'chart-subtitle')
      .text('Monitors transaction frequency for suspicious spikes');

    // Create gauge
    const arc = d3.arc()
      .innerRadius(50)
      .outerRadius(80)
      .startAngle(-Math.PI/2);

    // Add background arc
    container.append('path')
      .datum({ endAngle: Math.PI/2 })
      .attr('d', arc)
      .attr('transform', 'translate(200,140)')
      .attr('class', 'gauge-background');

    // Add value arc
    container.append('path')
      .datum({ endAngle: -Math.PI/2 + (Math.PI * normalizedVelocity) })
      .attr('d', arc)
      .attr('transform', 'translate(200,140)')
      .attr('class', 'gauge')
      .style('fill', d3.interpolateRgb(COLORS.quaternary, COLORS.secondary)(normalizedVelocity));

    // Add threshold markers
    const thresholds = [0.25, 0.5, 0.75];
    thresholds.forEach(t => {
      container.append('line')
        .attr('x1', 200 + Math.cos(-Math.PI/2 + Math.PI * t) * 50)
        .attr('y1', 140 + Math.sin(-Math.PI/2 + Math.PI * t) * 50)
        .attr('x2', 200 + Math.cos(-Math.PI/2 + Math.PI * t) * 80)
        .attr('y2', 140 + Math.sin(-Math.PI/2 + Math.PI * t) * 80)
        .attr('class', 'threshold-line');
    });
  };

  const createGeoChart = () => {
    const svg = d3.select(geoChartRef.current)
      .selectAll('svg').data([null]);
    
    const svgEnter = svg.enter()
      .append('svg')
      .attr('width', '100%')
      .attr('height', '250')
      .attr('viewBox', '0 0 400 250')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const container = svgEnter.merge(svg);
    container.selectAll('*').remove();

    // Calculate geographic anomaly score
    const unusualTx = Math.round(state.totalTx * state.unusualLocations);
    const score = (unusualTx / state.totalTx) * 100;

    container.append('text')
      .attr('x', 200)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('class', 'chart-title')
      .text(`Geographic Anomaly Score: ${score.toFixed(1)}%`);

    container.append('text')
      .attr('x', 200)
      .attr('y', 50)
      .attr('text-anchor', 'middle')
      .attr('class', 'chart-subtitle')
      .text('Unusual vs. Normal Location Distribution');

    // Create stacked bar
    const data = [
      { type: 'Unusual', value: unusualTx },
      { type: 'Normal', value: state.totalTx - unusualTx }
    ];

    const x = d3.scaleLinear()
      .domain([0, state.totalTx])
      .range([50, 350]);

    // Add bars with transitions
    container.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => i === 0 ? 50 : x(unusualTx))
      .attr('y', 100)
      .attr('width', d => d.type === 'Unusual' ? x(d.value) - 50 : 350 - x(unusualTx))
      .attr('height', 40)
      .attr('class', 'bar')
      .style('fill', (d, i) => i === 0 ? COLORS.secondary : COLORS.quaternary);

    // Add labels
    container.selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', (d, i) => i === 0 ? x(unusualTx/2) : x(unusualTx + (state.totalTx - unusualTx)/2))
      .attr('y', 125)
      .attr('text-anchor', 'middle')
      .text(d => `${d.type}: ${d.value}`);
  };

  const createBenfordChart = () => {
    const svg = d3.select(benfordChartRef.current)
      .selectAll('svg').data([null]);
    
    const svgEnter = svg.enter()
      .append('svg')
      .attr('width', '100%')
      .attr('height', '250')
      .attr('viewBox', '0 0 400 250')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const container = svgEnter.merge(svg);
    container.selectAll('*').remove();

    // Calculate Benford's Law distribution
    const benford = d3.range(1, 10).map(d => ({
      digit: d,
      expected: Math.log10(1 + 1/d),
      actual: Math.log10(1 + 1/d) + (Math.random() - 0.5) * 0.1 // Simulated deviation
    }));

    const x = d3.scaleLinear().domain([1, 9]).range([50, 350]);
    const y = d3.scaleLinear().domain([0, 0.4]).range([200, 50]);

    // Add title
    container.append('text')
      .attr('x', 200)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('class', 'chart-title')
      .text("Benford's Law Compliance");

    container.append('text')
      .attr('x', 200)
      .attr('y', 50)
      .attr('text-anchor', 'middle')
      .attr('class', 'chart-subtitle')
      .text('First Digit Frequency Analysis');

    // Add grid lines
    const yTicks = y.ticks(5);
    container.selectAll('.grid-line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 50)
      .attr('x2', 350)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d));

    // Add axes
    container.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,200)`)
      .call(d3.axisBottom(x).ticks(9));

    container.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(50,0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.1f')));

    // Add lines with transitions
    const line = d3.line()
      .x(d => x(d.digit))
      .y(d => y(d.expected));

    container.append('path')
      .datum(benford)
      .attr('class', 'line expected')
      .attr('d', line)
      .style('stroke', COLORS.tertiary);

    const actualLine = d3.line()
      .x(d => x(d.digit))
      .y(d => y(d.actual));

    container.append('path')
      .datum(benford)
      .attr('class', 'line actual')
      .attr('d', actualLine)
      .style('stroke', COLORS.quinary);

    // Add legend
    const legend = container.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(280,80)');

    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 0)
      .attr('y2', 0)
      .style('stroke', COLORS.tertiary);

    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 20)
      .attr('y2', 20)
      .style('stroke', COLORS.quinary);

    legend.append('text')
      .attr('x', 25)
      .attr('y', 5)
      .text('Expected');

    legend.append('text')
      .attr('x', 25)
      .attr('y', 25)
      .text('Actual');
  };

  const createBehaviorChart = () => {
    const svg = d3.select(behaviorChartRef.current)
      .selectAll('svg').data([null]);
    
    const svgEnter = svg.enter()
      .append('svg')
      .attr('width', '100%')
      .attr('height', '250')
      .attr('viewBox', '0 0 400 250')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const container = svgEnter.merge(svg);
    container.selectAll('*').remove();

    // Calculate behavior anomaly score
    const current = state.sampleSize * 0.2;
    const baseline = state.historicalBaseline;
    const score = Math.abs(current - baseline) / state.standardDeviation;

    container.append('text')
      .attr('x', 200)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('class', 'chart-title')
      .text(`Behavior Anomaly Score: ${score.toFixed(2)}`);

    container.append('text')
      .attr('x', 200)
      .attr('y', 50)
      .attr('text-anchor', 'middle')
      .attr('class', 'chart-subtitle')
      .text('Deviation from Historical Baseline');

    // Create meter
    const arc = d3.arc()
      .innerRadius(40)
      .outerRadius(80)
      .startAngle(-Math.PI/2)
      .endAngle(Math.PI/2);

    // Add background arc
    container.append('path')
      .attr('d', arc)
      .attr('transform', 'translate(200,150)')
      .attr('class', 'meter-background');

    // Add value arc
    const valueArc = d3.arc()
      .innerRadius(40)
      .outerRadius(80)
      .startAngle(-Math.PI/2)
      .endAngle(-Math.PI/2 + Math.PI * Math.min(score/2, 1));

    container.append('path')
      .attr('d', valueArc)
      .attr('transform', 'translate(200,150)')
      .attr('class', 'meter')
      .style('fill', d3.interpolateRgb(COLORS.quaternary, COLORS.secondary)(Math.min(score/2, 1)));

    // Add threshold markers
    [0.5, 1, 1.5].forEach(threshold => {
      container.append('line')
        .attr('x1', 200 + Math.cos(-Math.PI/2 + Math.PI * threshold/2) * 40)
        .attr('y1', 150 + Math.sin(-Math.PI/2 + Math.PI * threshold/2) * 40)
        .attr('x2', 200 + Math.cos(-Math.PI/2 + Math.PI * threshold/2) * 80)
        .attr('y2', 150 + Math.sin(-Math.PI/2 + Math.PI * threshold/2) * 80)
        .attr('class', 'threshold-line');
    });
  };

  const handleTotalTxChange = (event) => {
    setState(prev => ({ 
      ...prev, 
      totalTx: +event.target.value,
      unusualLocations: Math.random() * 0.2 // Randomly vary between 0-20%
    }));
  };

  const handleSampleSizeChange = (event) => {
    setState(prev => ({ 
      ...prev, 
      sampleSize: +event.target.value,
      historicalBaseline: prev.sampleSize * 0.9,
      standardDeviation: prev.sampleSize * 0.1
    }));
  };

  useEffect(() => {
    createVelocityChart();
    createGeoChart();
    createBenfordChart();
    createBehaviorChart();
  }, [state]);

  return (
    <div className="linked-analytics-container">
      <h1>Banking Fraud Metrics Dashboard</h1>
      
      <div className="control-panel">
        <h2>Common Controls</h2>
        <div className="slider-group">
          <span className="slider-label">Total Transactions:</span>
          <div className="slider-container">
            <input
              type="range"
              min="100"
              max="1000"
              value={state.totalTx}
              onChange={handleTotalTxChange}
            />
            <span className="slider-value">{state.totalTx}</span>
          </div>
        </div>
        <div className="slider-group">
          <span className="slider-label">Data Sample Size:</span>
          <div className="slider-container">
            <input
              type="range"
              min="100"
              max="1000"
              value={state.sampleSize}
              onChange={handleSampleSizeChange}
            />
            <span className="slider-value">{state.sampleSize}</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container" ref={velocityChartRef}>
          <h3>Transaction Velocity</h3>
        </div>
        <div className="chart-container" ref={geoChartRef}>
          <h3>Geographic Anomaly</h3>
        </div>
        <div className="chart-container" ref={benfordChartRef}>
          <h3>Benford's Law Analysis</h3>
        </div>
        <div className="chart-container" ref={behaviorChartRef}>
          <h3>Behavior Anomaly</h3>
        </div>
      </div>
    </div>
  );
};

export default LinkedAnalytics; 