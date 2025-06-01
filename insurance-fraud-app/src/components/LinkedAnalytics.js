import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './LinkedAnalytics.css';
import Chatbot from './Chatbot';

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

// Helper function to generate random data
const generateRandomData = (count, min, max) => {
  return Array.from({ length: count }, () => Math.random() * (max - min) + min);
};

// Sparkline
const createSparklineChart = (container, data) => {
  const width = 300, height = 140, titleGap = 32, margin = { top: 32, right: 20, bottom: 20, left: 20 };
  const svg = container
    .attr('width', width)
    .attr('height', height);
  const xScale = d3.scaleLinear().domain([0, data.length - 1]).range([margin.left, width - margin.right]);
  const yScale = d3.scaleLinear().domain([0, d3.max(data)]).range([height - margin.bottom, margin.top + titleGap]);
  const line = d3.line().x((d, i) => xScale(i)).y(d => yScale(d));
  // Threshold
  const threshold = d3.mean(data) + d3.deviation(data);
  svg.append('line')
    .attr('x1', margin.left)
    .attr('x2', width - margin.right)
    .attr('y1', yScale(threshold))
    .attr('y2', yScale(threshold))
    .attr('stroke', COLORS.secondary)
    .attr('stroke-dasharray', '4,4');
  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', COLORS.primary)
    .attr('stroke-width', 2.5)
    .attr('d', line)
    .style('filter', 'drop-shadow(0 2px 4px #2980b955)')
    .style('transition', 'stroke 0.3s');
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 28)
    .attr('text-anchor', 'middle')
    .attr('class', 'chart-title')
    .text('Claim Frequency Trend');
};

// Bullet Graph
const createBulletGraph = (container, value, target) => {
  const width = 300, height = 90, titleGap = 32, margin = { top: 32, right: 20, bottom: 10, left: 20 };
  const svg = container
    .attr('width', width)
    .attr('height', height);
  const xScale = d3.scaleLinear().domain([0, 100]).range([margin.left, width - margin.right]);
  // Bands
  const bands = [20, 40, 60, 80, 100];
  bands.forEach((band, i) => {
    svg.append('rect')
      .attr('x', xScale(i === 0 ? 0 : bands[i - 1]))
      .attr('y', margin.top + titleGap)
      .attr('width', xScale(band) - xScale(i === 0 ? 0 : bands[i - 1]))
      .attr('height', height - margin.top - margin.bottom - titleGap)
      .attr('fill', d3.interpolateRdYlGn(1 - i / bands.length))
      .attr('rx', 6);
  });
  svg.append('rect')
    .attr('x', margin.left)
    .attr('y', margin.top + titleGap)
    .attr('width', xScale(value))
    .attr('height', height - margin.top - margin.bottom - titleGap)
    .attr('fill', COLORS.primary)
    .attr('rx', 6)
    .style('filter', 'drop-shadow(0 2px 4px #2980b955)')
    .style('transition', 'fill 0.3s');
  svg.append('line')
    .attr('x1', xScale(target))
    .attr('x2', xScale(target))
    .attr('y1', margin.top + titleGap - 5)
    .attr('y2', height - margin.bottom + 5)
    .attr('stroke', COLORS.secondary)
    .attr('stroke-width', 2);
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 28)
    .attr('text-anchor', 'middle')
    .attr('class', 'chart-title')
    .text('Claim Severity Deviation');
};

// Radar Chart
const createRadarChart = (container, data) => {
  const width = 300, height = 260, titleGap = 38, radius = 80;
  const svg = container
    .attr('width', width)
    .attr('height', height);
  // Add gradient for radar fill
  svg.append('defs').append('radialGradient')
    .attr('id', 'radarGradient')
    .selectAll('stop')
    .data([
      { offset: '0%', color: '#85c1e9' },
      { offset: '100%', color: '#2980b9' }
    ])
    .enter()
    .append('stop')
    .attr('offset', d => d.offset)
    .attr('stop-color', d => d.color);
  const points = data.length;
  const angleStep = (Math.PI * 2) / points;
  const centerX = width / 2, centerY = height / 2 + 20 + titleGap / 2;
  // Background
  const polygon = d3.range(points).map(i => {
    const angle = i * angleStep - Math.PI/2;
    return [centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)];
  });
  svg.append('polygon')
    .attr('points', polygon.join(' '))
    .attr('class', 'radar-background');
  // Data
  const valuePolygon = data.map((d, i) => {
    const angle = i * angleStep - Math.PI/2;
    return [centerX + radius * d * Math.cos(angle), centerY + radius * d * Math.sin(angle)];
  });
  svg.append('polygon')
    .attr('points', valuePolygon.join(' '))
    .attr('class', 'radar')
    .attr('fill', 'url(#radarGradient)')
    .style('filter', 'drop-shadow(0 2px 4px #2980b955)')
    .style('transition', 'fill 0.3s');
  // Labels
  data.forEach((d, i) => {
    const angle = i * angleStep - Math.PI/2;
    const labelRadius = radius + 20;
    svg.append('text')
      .attr('x', centerX + labelRadius * Math.cos(angle))
      .attr('y', centerY + labelRadius * Math.sin(angle))
      .attr('text-anchor', 'middle')
      .attr('class', 'metric-label')
      .text(`Attribute ${i + 1}`);
  });
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 38)
    .attr('text-anchor', 'middle')
    .attr('class', 'chart-title')
    .text('Behavioral Consistency');
};

// Force-Directed Graph
const createForceGraph = (container, nodes, links) => {
  const width = 350, height = 260, titleGap = 38;
  const svg = container
    .attr('width', width)
    .attr('height', height);
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id))
    .force('charge', d3.forceManyBody().strength(-100))
    .force('center', d3.forceCenter(width / 2, height / 2 + titleGap / 2));
  const link = svg.append('g')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .style('filter', 'drop-shadow(0 1px 2px #34495e33)');
  const node = svg.append('g')
    .selectAll('circle')
    .data(nodes)
    .enter()
    .append('circle')
    .attr('r', 7)
    .attr('fill', d => d.risk > 0.7 ? COLORS.secondary : COLORS.primary)
    .style('filter', 'drop-shadow(0 2px 4px #2980b955)')
    .style('transition', 'fill 0.3s');
  node.append('title').text(d => `Risk: ${(d.risk * 100).toFixed(1)}%`);
  node.on('mouseover', function() { d3.select(this).attr('r', 11); })
      .on('mouseout', function() { d3.select(this).attr('r', 7); });
  node.call(d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended));
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y + titleGap)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y + titleGap);
    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y + titleGap);
  });
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 38)
      .attr('text-anchor', 'middle')
      .attr('class', 'chart-title')
    .text('Beneficiary Network');
};

// Timeline
const createTimeline = (container, events) => {
  const width = 500, height = 160, titleGap = 32, margin = { top: 32, right: 20, bottom: 40, left: 40 };
  const svg = container
    .attr('width', width)
    .attr('height', height);
  const xScale = d3.scaleTime()
    .domain(d3.extent(events, d => d.date))
    .range([margin.left, width - margin.right]);
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(events, d => d.value)])
    .range([height - margin.bottom, margin.top + titleGap]);
  const line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value));
  svg.append('path')
    .datum(events)
    .attr('fill', 'none')
    .attr('stroke', COLORS.primary)
    .attr('stroke-width', 2.5)
    .attr('d', line)
    .style('filter', 'drop-shadow(0 2px 4px #2980b955)')
    .style('transition', 'stroke 0.3s');
  svg.selectAll('circle')
    .data(events)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.date))
    .attr('cy', d => yScale(d.value))
    .attr('r', 6)
    .attr('fill', d => d.flag ? COLORS.secondary : COLORS.primary)
    .style('filter', 'drop-shadow(0 2px 4px #2980b955)')
    .style('transition', 'fill 0.3s');
  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 32)
      .attr('text-anchor', 'middle')
    .attr('class', 'chart-title')
    .text('Policy Revival Timeline');
};

// Gauge Meter
const createGaugeMeter = (container, value) => {
  const width = 300, height = 180, titleGap = 38;
  const svg = container.attr('width', width).attr('height', height);
    const arc = d3.arc()
    .innerRadius(60)
      .outerRadius(80)
    .startAngle(-Math.PI/2)
    .endAngle(Math.PI/2);
  svg.append('path')
    .attr('d', arc())
    .attr('transform', `translate(${width/2},${height/2 + 10})`)
    .attr('fill', '#eaf1fb');
  svg.append('path')
    .datum({ endAngle: -Math.PI/2 + (Math.PI * value / 100) })
    .attr('d', d3.arc()
      .innerRadius(60)
      .outerRadius(80)
      .startAngle(-Math.PI/2))
    .attr('transform', `translate(${width/2},${height/2 + 10})`)
    .attr('fill', d3.interpolateRdYlGn(value / 100))
    .attr('stroke', '#2980b9')
    .attr('stroke-width', 2)
    .style('filter', 'drop-shadow(0 2px 4px #2980b955)');
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 38)
    .attr('text-anchor', 'middle')
    .attr('class', 'chart-title')
    .text('Fraud Detection Rate');
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height / 2 + 10)
    .attr('text-anchor', 'middle')
    .attr('font-size', '1.3rem')
    .attr('font-weight', 'bold')
    .attr('fill', '#2c3e50')
    .text(`${value.toFixed(1)}%`);
};

// Stacked Bar Chart
const createStackedBarChart = (container, data) => {
  const width = 300, height = 220, titleGap = 38, margin = { top: 38, right: 20, bottom: 40, left: 40 };
  const svg = container.attr('width', width).attr('height', height);
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.category))
    .range([margin.left, width - margin.right])
    .padding(0.2);
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([height - margin.bottom, margin.top + titleGap]);
  svg.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', d => xScale(d.category))
    .attr('y', d => yScale(d.value))
    .attr('width', xScale.bandwidth())
    .attr('height', d => height - margin.bottom - yScale(d.value))
    .attr('fill', (d, i) => d3.schemeCategory10[i % 10])
    .attr('rx', 6)
    .style('filter', 'drop-shadow(0 2px 4px #2980b955)');
  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));
  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 38)
    .attr('text-anchor', 'middle')
    .attr('class', 'chart-title')
    .text('False Positive Rate by Category');
};

// Heatmap
const createHeatmap = (container, data) => {
  const width = 300, height = 220, titleGap = 38, margin = { top: 38, right: 20, bottom: 40, left: 40 };
  const svg = container.attr('width', width).attr('height', height);
  const xScale = d3.scaleBand()
    .domain(data[0].map((_, i) => i))
    .range([margin.left, width - margin.right])
    .padding(0.1);
  const yScale = d3.scaleBand()
    .domain(data.map((_, i) => i))
    .range([margin.top + titleGap, height - margin.bottom])
    .padding(0.1);
  const colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
    .domain([0, 100]);
  data.forEach((row, i) => {
    row.forEach((value, j) => {
      svg.append('rect')
        .attr('x', xScale(j))
        .attr('y', yScale(i))
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('fill', colorScale(value))
        .attr('rx', 4)
        .style('filter', 'drop-shadow(0 1px 2px #34495e22)');
    });
  });
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 38)
    .attr('text-anchor', 'middle')
    .attr('class', 'chart-title')
    .text('Document Forgery Confidence');
};

// Choropleth Map (grid demo)
const createChoroplethMap = (container, data) => {
  const width = 300, height = 220, titleGap = 38, margin = { top: 38, right: 20, bottom: 40, left: 40 };
  const svg = container.attr('width', width).attr('height', height);
  const colorScale = d3.scaleSequential(d3.interpolateRdYlGn).domain([0, 100]);
  data.forEach((d, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    svg.append('rect')
      .attr('x', margin.left + col * 50)
      .attr('y', margin.top + titleGap + row * 50)
      .attr('width', 45)
      .attr('height', 45)
      .attr('fill', colorScale(d.value))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('rx', 6)
      .style('filter', 'drop-shadow(0 1px 2px #34495e22)');
  });
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 38)
      .attr('text-anchor', 'middle')
      .attr('class', 'chart-title')
    .text('Geospatial Fraud Density');
};

// Waterfall Chart
const createWaterfallChart = (container, data) => {
  const width = 300, height = 220, titleGap = 38, margin = { top: 38, right: 20, bottom: 40, left: 40 };
  const svg = container.attr('width', width).attr('height', height);
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.stage))
    .range([margin.left, width - margin.right])
    .padding(0.2);
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([height - margin.bottom, margin.top + titleGap]);
  svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
    .attr('x', d => xScale(d.stage))
    .attr('y', d => yScale(d.value))
    .attr('width', xScale.bandwidth())
    .attr('height', d => height - margin.bottom - yScale(d.value))
    .attr('fill', (d, i) => d3.schemeCategory10[i % 10])
    .attr('rx', 6)
    .style('filter', 'drop-shadow(0 2px 4px #2980b955)');
  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));
  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 38)
    .attr('text-anchor', 'middle')
    .attr('class', 'chart-title')
    .text('Resolution Time by Stage');
};

// Precision-Recall Curve
const createPRCurve = (container, data) => {
  const width = 300, height = 220, titleGap = 38, margin = { top: 38, right: 20, bottom: 40, left: 40 };
  const svg = container.attr('width', width).attr('height', height);
  const xScale = d3.scaleLinear().domain([0, 1]).range([margin.left, width - margin.right]);
  const yScale = d3.scaleLinear().domain([0, 1]).range([height - margin.bottom, margin.top + titleGap]);
  const line = d3.line()
    .x(d => xScale(d.recall))
    .y(d => yScale(d.precision));
  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', COLORS.primary)
    .attr('stroke-width', 2.5)
    .attr('d', line)
    .style('filter', 'drop-shadow(0 2px 4px #2980b955)');
  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.format('.1f')));
  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format('.1f')));
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 38)
      .attr('text-anchor', 'middle')
    .attr('class', 'chart-title')
    .text('Precision-Recall Curve');
};

// Bubble Chart
const createBubbleChart = (container, data) => {
  const width = 350, height = 240, titleGap = 38, margin = { top: 38, right: 20, bottom: 40, left: 40 };
  const svg = container.attr('width', width).attr('height', height);
  const xMax = d3.max(data, d => d.claimAmount) || 1;
  const yMax = d3.max(data, d => d.fraudProbability) || 1;
  const rMax = d3.max(data, d => d.racv) || 1;
  const xScale = d3.scaleLinear()
    .domain([0, xMax])
    .range([margin.left, width - margin.right]);
  const yScale = d3.scaleLinear()
    .domain([0, yMax])
    .range([height - margin.bottom, margin.top + titleGap]);
  const rScale = d3.scaleLinear()
    .domain([0, rMax])
    .range([5, 20]);

  // Tooltip
  let tooltip = d3.select('.chart-tooltip');
  if (tooltip.empty()) {
    tooltip = d3.select('body').append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('background', '#fff')
      .style('border', '1px solid #2980b9')
      .style('border-radius', '8px')
      .style('padding', '8px 12px')
      .style('font-size', '0.95rem')
      .style('color', '#222')
      .style('box-shadow', '0 2px 8px #2980b933')
      .style('opacity', 0);
  }

  svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.claimAmount))
    .attr('cy', d => yScale(d.fraudProbability))
    .attr('r', 0)
    .attr('fill', COLORS.primary)
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .attr('opacity', 0.7)
    .style('filter', 'drop-shadow(0 2px 8px #2980b955)')
    .transition()
    .duration(900)
    .attr('r', d => rScale(d.racv));

  svg.selectAll('circle')
    .on('mouseover', function(event, d) {
      d3.select(this)
        .attr('stroke', COLORS.secondary)
        .attr('stroke-width', 3)
        .attr('opacity', 1);
      tooltip.transition().duration(200).style('opacity', 1);
      tooltip.html(
        `<b>Claim Amount:</b> $${d.claimAmount.toFixed(2)}<br/>` +
        `<b>Fraud Probability:</b> ${(d.fraudProbability * 100).toFixed(1)}%<br/>` +
        `<b>RACV:</b> $${d.racv.toFixed(2)}`
      )
      .style('left', (event.pageX + 16) + 'px')
      .style('top', (event.pageY - 28) + 'px');
    })
    .on('mousemove', function(event) {
      tooltip.style('left', (event.pageX + 16) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function() {
      d3.select(this)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.7);
      tooltip.transition().duration(300).style('opacity', 0);
    });

  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));
  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 38)
      .attr('text-anchor', 'middle')
      .attr('class', 'chart-title')
    .text('Risk-Adjusted Claim Value');
};

// Sankey Diagram (animated, interactive)
const createSankeyDiagram = (container, data) => {
  const width = 350, height = 240, titleGap = 38, margin = { top: 38, right: 20, bottom: 40, left: 40 };
  const svg = container.attr('width', width).attr('height', height);
  // Place nodes in two columns, two rows
  const nodePositions = [
    { x: margin.left, y: margin.top + titleGap },
    { x: width / 2 + 10, y: margin.top + titleGap },
    { x: margin.left, y: height / 2 },
    { x: width / 2 + 10, y: height / 2 }
  ];
  // Tooltip
  let tooltip = d3.select('.chart-tooltip');
  if (tooltip.empty()) {
    tooltip = d3.select('body').append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('background', '#fff')
      .style('border', '1px solid #2980b9')
      .style('border-radius', '8px')
      .style('padding', '8px 12px')
      .style('font-size', '0.95rem')
      .style('color', '#222')
      .style('box-shadow', '0 2px 8px #2980b933')
      .style('opacity', 0);
  }
  // Draw links as lines between node centers (with gradient)
  const defs = svg.append('defs');
  defs.append('linearGradient')
    .attr('id', 'sankey-link-gradient')
    .attr('x1', '0%').attr('x2', '100%').attr('y1', '0%').attr('y2', '0%')
    .selectAll('stop')
    .data([
      { offset: '0%', color: COLORS.primary },
      { offset: '100%', color: COLORS.secondary }
    ])
    .enter().append('stop')
    .attr('offset', d => d.offset)
    .attr('stop-color', d => d.color);
  const links = [
    { source: 0, target: 1, width: 5 },
    { source: 2, target: 3, width: 3 }
  ];
  svg.selectAll('.sankey-link')
    .data(links)
    .enter()
    .append('line')
    .attr('class', 'sankey-link')
    .attr('x1', d => nodePositions[d.source].x + 80)
    .attr('y1', d => nodePositions[d.source].y + 15)
    .attr('x2', d => nodePositions[d.source].x + 80)
    .attr('y2', d => nodePositions[d.source].y + 15)
    .attr('stroke', 'url(#sankey-link-gradient)')
    .attr('stroke-width', d => d.width)
    .attr('opacity', 0)
    .transition()
    .duration(700)
    .attr('x2', d => nodePositions[d.target].x)
    .attr('y2', d => nodePositions[d.target].y + 15)
    .attr('opacity', 0.5);
  // Draw nodes
  svg.selectAll('.sankey-node')
    .data(nodePositions)
    .enter()
    .append('rect')
    .attr('class', 'sankey-node')
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('width', 80)
    .attr('height', 30)
    .attr('fill', COLORS.primary)
    .attr('opacity', 0)
    .attr('rx', 12)
    .style('filter', 'drop-shadow(0 2px 8px #2980b955)')
    .transition()
    .duration(700)
    .attr('opacity', 0.7);
  svg.selectAll('.sankey-node')
    .on('mouseover', function(event, d, i) {
      d3.select(this)
        .attr('fill', COLORS.secondary)
        .attr('opacity', 1);
      svg.selectAll('.sankey-link')
        .filter(link => link.source === nodePositions.indexOf(d) || link.target === nodePositions.indexOf(d))
        .attr('opacity', 1)
        .attr('stroke-width', link => link.width + 2);
      tooltip.transition().duration(200).style('opacity', 1);
      tooltip.html(`<b>Node ${nodePositions.indexOf(d) + 1}</b>`)
        .style('left', (event.pageX + 16) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mousemove', function(event) {
      tooltip.style('left', (event.pageX + 16) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function(event, d) {
      d3.select(this)
        .attr('fill', COLORS.primary)
        .attr('opacity', 0.7);
      svg.selectAll('.sankey-link')
        .attr('opacity', 0.5)
        .attr('stroke-width', link => link.width);
      tooltip.transition().duration(300).style('opacity', 0);
    });
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 38)
      .attr('text-anchor', 'middle')
    .attr('class', 'chart-title')
    .text('Provider-Claimant Network');
};

// Histogram
const createHistogram = (container, data) => {
  const width = 350, height = 240, titleGap = 38, margin = { top: 38, right: 20, bottom: 40, left: 40 };
  const svg = container.attr('width', width).attr('height', height);
  // Tooltip
  let tooltip = d3.select('.chart-tooltip');
  if (tooltip.empty()) {
    tooltip = d3.select('body').append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('background', '#fff')
      .style('border', '1px solid #2980b9')
      .style('border-radius', '8px')
      .style('padding', '8px 12px')
      .style('font-size', '0.95rem')
      .style('color', '#222')
      .style('box-shadow', '0 2px 8px #2980b933')
      .style('opacity', 0);
  }
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.range))
    .range([margin.left, width - margin.right])
    .padding(0.1);
  const yMax = d3.max(data, d => d.count) || 1;
  const yScale = d3.scaleLinear()
    .domain([0, yMax])
    .range([height - margin.bottom, margin.top + titleGap]);
  svg.selectAll('rect')
    .data(data)
      .enter()
    .append('rect')
    .attr('x', d => xScale(d.range))
    .attr('y', height - margin.bottom)
    .attr('width', xScale.bandwidth())
    .attr('height', 0)
    .attr('fill', d => {
      const value = parseInt(d.range.split('-')[0]);
      return d3.interpolateRdYlGn(value / 100);
    })
    .attr('rx', 8)
    .style('filter', 'drop-shadow(0 2px 8px #2980b955)')
    .transition()
    .duration(900)
    .attr('y', d => yScale(d.count))
    .attr('height', d => height - margin.bottom - yScale(d.count));
  svg.selectAll('rect')
    .on('mouseover', function(event, d) {
      d3.select(this)
        .attr('fill', COLORS.secondary)
        .attr('opacity', 1);
      tooltip.transition().duration(200).style('opacity', 1);
      tooltip.html(`<b>Range:</b> ${d.range}<br/><b>Count:</b> ${d.count.toFixed(0)}`)
        .style('left', (event.pageX + 16) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mousemove', function(event) {
      tooltip.style('left', (event.pageX + 16) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function(event, d) {
      d3.select(this)
        .attr('fill', () => {
          const value = parseInt(d.range.split('-')[0]);
          return d3.interpolateRdYlGn(value / 100);
        })
        .attr('opacity', 0.9);
      tooltip.transition().duration(300).style('opacity', 0);
    });
  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));
  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 38)
    .attr('text-anchor', 'middle')
    .attr('class', 'chart-title')
    .text('Lifetime Fraud Risk Distribution');
};

const METRIC_SECTIONS = [
  {
    key: 'user',
    label: 'User-Specific Metrics',
    diagrams: [
      { key: 'sparkline', label: 'Claim Frequency Trend' },
      { key: 'bullet', label: 'Claim Severity Deviation' },
      { key: 'radar', label: 'Behavioral Consistency' },
      { key: 'force', label: 'Beneficiary Network' },
      { key: 'timeline', label: 'Policy Revival Timeline' },
    ],
  },
  {
    key: 'general',
    label: 'General-Purpose Metrics',
    diagrams: [
      { key: 'gauge', label: 'Fraud Detection Rate' },
      { key: 'stackedBar', label: 'False Positive Rate by Category' },
      { key: 'heatmap', label: 'Document Forgery Confidence' },
      { key: 'choropleth', label: 'Geospatial Fraud Density' },
      { key: 'waterfall', label: 'Resolution Time by Stage' },
      { key: 'prCurve', label: 'Precision-Recall Curve' },
    ],
  },
  {
    key: 'hybrid',
    label: 'Advanced Hybrid Metrics',
    diagrams: [
      { key: 'bubble', label: 'Risk-Adjusted Claim Value' },
      { key: 'sankey', label: 'Provider-Claimant Network' },
      { key: 'hist', label: 'Lifetime Fraud Risk Distribution' },
    ],
  },
];

const LinkedAnalytics = () => {
  // State for User-Specific Metrics
  const [userMetrics, setUserMetrics] = useState({
    userId: '',
    claimHistory: [],
    policyDetails: {},
    beneficiaryRelationships: []
  });

  // State for General-Purpose Metrics
  const [generalMetrics, setGeneralMetrics] = useState({
    claimType: 'all',
    geographicRegion: 'all',
    timePeriod: 'last30days',
    providerNetwork: 'all'
  });

  // State for Advanced Hybrid Metrics
  const [hybridMetrics, setHybridMetrics] = useState({
    userId: '',
    claimHistory: [],
    providerNetwork: 'all',
    fraudProbabilityScores: []
  });

  // Chart refs for User-Specific Metrics (one per diagram)
  const sparklineRef = useRef(null);
  const bulletRef = useRef(null);
  const radarRef = useRef(null);
  const forceRef = useRef(null);
  const timelineRef = useRef(null);

  // Chart refs
  const userMetricsChartRef = useRef(null);
  const generalMetricsChartRef = useRef(null);
  const hybridMetricsChartRef = useRef(null);

  // Chart refs for General-Purpose Metrics (one per diagram)
  const gaugeRef = useRef(null);
  const stackedBarRef = useRef(null);
  const heatmapRef = useRef(null);
  const choroplethRef = useRef(null);
  const waterfallRef = useRef(null);
  const prCurveRef = useRef(null);

  // Chart refs for Hybrid Metrics (one per diagram)
  const bubbleRef = useRef(null);
  const sankeyRef = useRef(null);
  const histRef = useRef(null);

  // Inside LinkedAnalytics component, after useState declarations
  const [selectedSection, setSelectedSection] = useState('user');
  const [selectedDiagram, setSelectedDiagram] = useState('sparkline');

  // Effect to update charts when parameters change
  useEffect(() => {
    createUserMetricsChart();
  }, [userMetrics]);

  // User-Specific Metrics: Render each chart in its own SVG
  useEffect(() => {
    // Generate sample data
    const sparklineData = generateRandomData(30, 0, 100);
    const bulletData = { value: 65, target: 80 };
    const radarData = generateRandomData(5, 0.3, 0.9);
    const forceData = {
      nodes: Array.from({ length: 10 }, (_, i) => ({
        id: `node${i}`,
        risk: Math.random()
      })),
      links: Array.from({ length: 15 }, () => ({
        source: `node${Math.floor(Math.random() * 10)}`,
        target: `node${Math.floor(Math.random() * 10)}`
      }))
    };
    const timelineData = Array.from({ length: 20 }, (_, i) => ({
      date: new Date(2024, 0, i * 2),
      value: Math.random() * 100,
      flag: Math.random() > 0.8
    }));

    // Clear and render each chart in its own SVG
    d3.select(sparklineRef.current).selectAll('*').remove();
    d3.select(bulletRef.current).selectAll('*').remove();
    d3.select(radarRef.current).selectAll('*').remove();
    d3.select(forceRef.current).selectAll('*').remove();
    d3.select(timelineRef.current).selectAll('*').remove();

    // 1.1 Claim Frequency Anomaly Score - Sparkline Trend Chart
    createSparklineChart(d3.select(sparklineRef.current), sparklineData);
    // 1.2 Claim Severity Deviation - Bullet Graph
    createBulletGraph(d3.select(bulletRef.current), bulletData.value, bulletData.target);
    // 1.3 Behavioral Consistency Index - Radar Chart
    createRadarChart(d3.select(radarRef.current), radarData);
    // 1.4 Beneficiary Linkage Risk - Force-Directed Graph
    createForceGraph(d3.select(forceRef.current), forceData.nodes, forceData.links);
    // 1.5 Policy Revival Tampering Score - Timeline
    createTimeline(d3.select(timelineRef.current), timelineData);
  }, [userMetrics]);

  const createUserMetricsChart = () => {
    const svg = d3.select(userMetricsChartRef.current)
      .selectAll('svg').data([null]);
    
    const svgEnter = svg.enter()
      .append('svg')
      .attr('width', '100%')
      .attr('height', '800')
      .attr('viewBox', '0 0 800 800')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const container = svgEnter.merge(svg);
    container.selectAll('*').remove();

    // 1.1 Claim Frequency Anomaly Score - Sparkline Trend Chart
    const createSparklineChart = (container, data) => {
      const width = 350, height = 100, margin = { top: 20, right: 20, bottom: 20, left: 20 };
      const svg = container
        .attr('width', width)
        .attr('height', height);
      const xScale = d3.scaleLinear().domain([0, data.length - 1]).range([margin.left, width - margin.right]);
      const yScale = d3.scaleLinear().domain([0, d3.max(data)]).range([height - margin.bottom, margin.top]);
      const line = d3.line().x((d, i) => xScale(i)).y(d => yScale(d));
      // Threshold
      const threshold = d3.mean(data) + d3.deviation(data);
      svg.append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', yScale(threshold))
        .attr('y2', yScale(threshold))
        .attr('stroke', COLORS.secondary)
        .attr('stroke-dasharray', '4,4');
      svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', COLORS.primary)
        .attr('stroke-width', 2)
        .attr('d', line);
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .attr('class', 'chart-title')
        .text('Claim Frequency Trend');
    };

    // 1.2 Claim Severity Deviation - Bullet Graph
    const createBulletGraph = (container, value, target) => {
      const width = 350, height = 50, margin = { top: 10, right: 20, bottom: 10, left: 20 };
      const svg = container
        .attr('width', width)
        .attr('height', height);
      const xScale = d3.scaleLinear().domain([0, 100]).range([margin.left, width - margin.right]);
      // Bands
      const bands = [20, 40, 60, 80, 100];
      bands.forEach((band, i) => {
        svg.append('rect')
          .attr('x', xScale(i === 0 ? 0 : bands[i - 1]))
          .attr('y', margin.top)
          .attr('width', xScale(band) - xScale(i === 0 ? 0 : bands[i - 1]))
          .attr('height', height - margin.top - margin.bottom)
          .attr('fill', d3.interpolateRdYlGn(1 - i / bands.length));
      });
      svg.append('rect')
        .attr('x', margin.left)
        .attr('y', margin.top)
        .attr('width', xScale(value))
        .attr('height', height - margin.top - margin.bottom)
        .attr('fill', COLORS.primary);
      svg.append('line')
        .attr('x1', xScale(target))
        .attr('x2', xScale(target))
        .attr('y1', margin.top - 5)
        .attr('y2', height - margin.bottom + 5)
        .attr('stroke', COLORS.secondary)
        .attr('stroke-width', 2);
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('class', 'chart-title')
        .text('Claim Severity Deviation');
    };

    // 1.3 Behavioral Consistency Index - Radar Chart
    const createRadarChart = (container, data) => {
      const width = 350, height = 220, radius = 80;
      const svg = container
        .attr('width', width)
        .attr('height', height);
      const points = data.length;
      const angleStep = (Math.PI * 2) / points;
      const centerX = width / 2, centerY = height / 2 + 20;
      // Background
      const polygon = d3.range(points).map(i => {
        const angle = i * angleStep - Math.PI/2;
        return [centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)];
      });
      svg.append('polygon')
        .attr('points', polygon.join(' '))
        .attr('class', 'radar-background');
      // Data
      const valuePolygon = data.map((d, i) => {
        const angle = i * angleStep - Math.PI/2;
        return [centerX + radius * d * Math.cos(angle), centerY + radius * d * Math.sin(angle)];
      });
      svg.append('polygon')
        .attr('points', valuePolygon.join(' '))
        .attr('class', 'radar')
        .attr('fill', COLORS.primary);
      // Labels
      data.forEach((d, i) => {
        const angle = i * angleStep - Math.PI/2;
        const labelRadius = radius + 20;
        svg.append('text')
          .attr('x', centerX + labelRadius * Math.cos(angle))
          .attr('y', centerY + labelRadius * Math.sin(angle))
      .attr('text-anchor', 'middle')
          .attr('class', 'metric-label')
          .text(`Attribute ${i + 1}`);
      });
      svg.append('text')
        .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('class', 'chart-title')
        .text('Behavioral Consistency');
    };

    // 1.4 Beneficiary Linkage Risk - Force-Directed Graph
    const createForceGraph = (container, nodes, links) => {
      const width = 350, height = 220;
      const svg = container
        .attr('width', width)
        .attr('height', height);
      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id))
        .force('charge', d3.forceManyBody().strength(-100))
        .force('center', d3.forceCenter(width / 2, height / 2));
      const link = svg.append('g')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6);
      const node = svg.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('r', 5)
        .attr('fill', d => d.risk > 0.7 ? COLORS.secondary : COLORS.primary)
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));
      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);
        node
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
      });
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 30)
      .attr('text-anchor', 'middle')
        .attr('class', 'chart-title')
        .text('Beneficiary Network');
    };

    // 1.5 Policy Revival Tampering Score - Timeline
    const createTimeline = (container, events) => {
      const width = 600, height = 120, margin = { top: 20, right: 20, bottom: 40, left: 40 };
      const svg = container
        .attr('width', width)
        .attr('height', height);
      const xScale = d3.scaleTime()
        .domain(d3.extent(events, d => d.date))
        .range([margin.left, width - margin.right]);
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(events, d => d.value)])
        .range([height - margin.bottom, margin.top]);
      const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value));
      svg.append('path')
        .datum(events)
        .attr('fill', 'none')
        .attr('stroke', COLORS.primary)
        .attr('stroke-width', 2)
        .attr('d', line);
      svg.selectAll('circle')
        .data(events)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.value))
        .attr('r', 4)
        .attr('fill', d => d.flag ? COLORS.secondary : COLORS.primary);
      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .attr('class', 'chart-title')
        .text('Policy Revival Timeline');
    };

    // Generate sample data
    const sparklineData = generateRandomData(30, 0, 100);
    const bulletData = { value: 65, target: 80 };
    const radarData = generateRandomData(5, 0.3, 0.9);
    const forceData = {
      nodes: Array.from({ length: 10 }, (_, i) => ({
        id: `node${i}`,
        risk: Math.random()
      })),
      links: Array.from({ length: 15 }, () => ({
        source: `node${Math.floor(Math.random() * 10)}`,
        target: `node${Math.floor(Math.random() * 10)}`
      }))
    };
    const timelineData = Array.from({ length: 20 }, (_, i) => ({
      date: new Date(2024, 0, i * 2),
      value: Math.random() * 100,
      flag: Math.random() > 0.8
    }));

    // Create all charts
    createSparklineChart(container, sparklineData);
    createBulletGraph(container, bulletData.value, bulletData.target);
    createRadarChart(container, radarData);
    createForceGraph(container, forceData.nodes, forceData.links);
    createTimeline(container, timelineData);
  };

  // Hybrid Metrics: Render each chart in its own SVG
  useEffect(() => {
    // Generate sample data
    const bubbleData = Array.from({ length: 20 }, () => ({
      claimAmount: Math.random() * 1000,
      fraudProbability: Math.random(),
      racv: Math.random() * 500
    }));
    // For Sankey, just need 4 nodes for the demo
    const sankeyData = {
      nodes: [{}, {}, {}, {}],
      links: []
    };
    const histogramData = [
      { range: '0-30', count: Math.random() * 50 },
      { range: '30-70', count: Math.random() * 100 },
      { range: '70-100', count: Math.random() * 30 }
    ];
    d3.select(bubbleRef.current).selectAll('*').remove();
    d3.select(sankeyRef.current).selectAll('*').remove();
    d3.select(histRef.current).selectAll('*').remove();
    createBubbleChart(d3.select(bubbleRef.current), bubbleData);
    createSankeyDiagram(d3.select(sankeyRef.current), sankeyData);
    createHistogram(d3.select(histRef.current), histogramData);
  }, [hybridMetrics]);

  useEffect(() => {
    // Generate sample data
    const gaugeValue = Math.random() * 100;
    const stackedBarData = [
      { category: 'Health', value: Math.random() * 30 },
      { category: 'Accident', value: Math.random() * 30 },
      { category: 'Death', value: Math.random() * 30 }
    ];
    const heatmapData = Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => Math.random() * 100)
    );
    const choroplethData = Array.from({ length: 16 }, () => ({
      value: Math.random() * 100
    }));
    const waterfallData = [
      { stage: 'Review', value: Math.random() * 20 },
      { stage: 'Audit', value: Math.random() * 30 },
      { stage: 'Decision', value: Math.random() * 40 },
      { stage: 'Resolution', value: Math.random() * 50 }
    ];
    const prCurveData = Array.from({ length: 20 }, (_, i) => ({
      recall: i / 19,
      precision: 1 - Math.pow(i / 19, 1.5) + Math.random() * 0.1
    }));

    d3.select(gaugeRef.current).selectAll('*').remove();
    d3.select(stackedBarRef.current).selectAll('*').remove();
    d3.select(heatmapRef.current).selectAll('*').remove();
    d3.select(choroplethRef.current).selectAll('*').remove();
    d3.select(waterfallRef.current).selectAll('*').remove();
    d3.select(prCurveRef.current).selectAll('*').remove();

    createGaugeMeter(d3.select(gaugeRef.current), gaugeValue);
    createStackedBarChart(d3.select(stackedBarRef.current), stackedBarData);
    createHeatmap(d3.select(heatmapRef.current), heatmapData);
    createChoroplethMap(d3.select(choroplethRef.current), choroplethData);
    createWaterfallChart(d3.select(waterfallRef.current), waterfallData);
    createPRCurve(d3.select(prCurveRef.current), prCurveData);
  }, [generalMetrics]);

  return (
    <div className="linked-analytics" style={{ display: 'flex', minHeight: '90vh' }}>
      {/* Sidebar: Section Tabs */}
      <div style={{ width: 220, background: '#fff', borderRight: '1px solid #eee', padding: '2rem 1rem' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 700, marginBottom: '2rem', fontSize: '1.5rem' }}>Metrics</h2>
        {METRIC_SECTIONS.map(section => (
          <button
            key={section.key}
            onClick={() => setSelectedSection(section.key)}
            style={{
              width: '100%',
              padding: '1rem',
              marginBottom: '1rem',
              background: selectedSection === section.key ? '#2980b9' : '#f0f2f5',
              color: selectedSection === section.key ? '#fff' : '#2c3e50',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Main Diagram Area */}
      <div style={{ flex: 1, padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Render parameters for the selected section */}
        {selectedSection === 'user' && (
          <div className="parameters" style={{ marginBottom: '2rem', width: '100%', maxWidth: 700 }}>
            <div className="parameter">
              <label>User ID:</label>
              <input
                type="text"
                value={userMetrics.userId}
                onChange={(e) => setUserMetrics({...userMetrics, userId: e.target.value})}
              />
            </div>
            <div className="parameter">
              <label>Policy Details:</label>
              <select
                value={userMetrics.policyDetails.type || ''}
                onChange={(e) => setUserMetrics({
                  ...userMetrics,
                  policyDetails: {...userMetrics.policyDetails, type: e.target.value}
                })}
              >
                <option value="">Select Policy Type</option>
                <option value="health">Health Insurance</option>
                <option value="auto">Auto Insurance</option>
                <option value="property">Property Insurance</option>
              </select>
            </div>
          </div>
        )}
        {selectedSection === 'general' && (
          <div className="parameters" style={{ marginBottom: '2rem', width: '100%', maxWidth: 900, display: 'flex', gap: 24 }}>
            <div className="parameter">
              <label>Claim Type:</label>
              <select
                value={generalMetrics.claimType}
                onChange={(e) => setGeneralMetrics({...generalMetrics, claimType: e.target.value})}
              >
                <option value="all">All Claims</option>
                <option value="health">Health Claims</option>
                <option value="auto">Auto Claims</option>
                <option value="property">Property Claims</option>
              </select>
            </div>
            <div className="parameter">
              <label>Time Period:</label>
              <select
                value={generalMetrics.timePeriod}
                onChange={(e) => setGeneralMetrics({...generalMetrics, timePeriod: e.target.value})}
              >
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
                <option value="lastYear">Last Year</option>
              </select>
            </div>
            <div className="parameter">
              <label>Geographic Region:</label>
              <select
                value={generalMetrics.geographicRegion}
                onChange={(e) => setGeneralMetrics({...generalMetrics, geographicRegion: e.target.value})}
              >
                <option value="all">All Regions</option>
                <option value="north">North</option>
                <option value="south">South</option>
                <option value="east">East</option>
                <option value="west">West</option>
              </select>
            </div>
          </div>
        )}
        {selectedSection === 'hybrid' && (
          <div className="parameters" style={{ marginBottom: '2rem', width: '100%', maxWidth: 700 }}>
            <div className="parameter">
              <label>User ID:</label>
              <input
                type="text"
                value={hybridMetrics.userId}
                onChange={(e) => setHybridMetrics({...hybridMetrics, userId: e.target.value})}
              />
            </div>
            <div className="parameter">
              <label>Provider Network:</label>
              <select
                value={hybridMetrics.providerNetwork}
                onChange={(e) => setHybridMetrics({...hybridMetrics, providerNetwork: e.target.value})}
              >
                <option value="all">All Networks</option>
                <option value="network1">Network 1</option>
                <option value="network2">Network 2</option>
                <option value="network3">Network 3</option>
              </select>
            </div>
          </div>
        )}
        {/* Render all diagrams for the selected section */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {selectedSection === 'user' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '32px' }}>
                <svg ref={sparklineRef} style={{ width: '350px', height: '140px' }} />
                <svg ref={bulletRef} style={{ width: '350px', height: '90px' }} />
                <svg ref={radarRef} style={{ width: '350px', height: '260px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
                <svg ref={forceRef} style={{ width: '350px', height: '260px' }} />
                <svg ref={timelineRef} style={{ width: '500px', height: '160px' }} />
              </div>
            </>
          )}
          {selectedSection === 'general' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '32px' }}>
                <svg ref={gaugeRef} style={{ width: '300px', height: '180px' }} />
                <svg ref={stackedBarRef} style={{ width: '300px', height: '220px' }} />
                <svg ref={heatmapRef} style={{ width: '300px', height: '220px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
                <svg ref={choroplethRef} style={{ width: '300px', height: '220px' }} />
                <svg ref={waterfallRef} style={{ width: '300px', height: '220px' }} />
                <svg ref={prCurveRef} style={{ width: '300px', height: '220px' }} />
              </div>
            </>
          )}
          {selectedSection === 'hybrid' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
              <svg ref={bubbleRef} style={{ width: '350px', height: '240px' }} />
              <svg ref={sankeyRef} style={{ width: '350px', height: '240px' }} />
              <svg ref={histRef} style={{ width: '350px', height: '240px' }} />
            </div>
          )}
        </div>
      </div>
      {/* Chatbot floating button and chat window */}
      <Chatbot
        sectionLabel={METRIC_SECTIONS.find(s => s.key === selectedSection).label}
        diagramLabels={METRIC_SECTIONS.find(s => s.key === selectedSection).diagrams.map(d => d.label)}
      />
    </div>
  );
};

export default LinkedAnalytics; 