import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';

const EnhancedGraphAnalysis = () => {
    const svgRef = useRef();
    const tooltipRef = useRef();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState('all');
    const [filterByRisk, setFilterByRisk] = useState('all');
    const [selectedCluster, setSelectedCluster] = useState(null);
    
    // Generate realistic insurance fraud network data
    const generateRealisticData = () => {
        const nodes = [];
        const edges = [];
        
        // Generate policies with realistic attributes
        const policies = [];
        for (let i = 1; i <= 50; i++) {
            const policy = {
                id: `POL_${String(i).padStart(4, '0')}`,
                type: 'policy',
                premium: Math.round(1000 + Math.random() * 5000),
                coverage_type: ['auto', 'home', 'life', 'health'][Math.floor(Math.random() * 4)],
                start_date: new Date(2020 + Math.random() * 4, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
                risk_score: Math.random() * 5,
                holder_age: 25 + Math.floor(Math.random() * 50),
                location: ['NYC', 'LA', 'Chicago', 'Houston', 'Phoenix', 'Miami'][Math.floor(Math.random() * 6)]
            };
            policies.push(policy);
            nodes.push(policy);
        }
        
        // Generate claims with realistic patterns
        const claims = [];
        for (let i = 1; i <= 120; i++) {
            const relatedPolicy = policies[Math.floor(Math.random() * policies.length)];
            const claim = {
                id: `CLM_${String(i).padStart(4, '0')}`,
                type: 'claim',
                amount: Math.round(500 + Math.random() * 25000),
                claim_type: ['collision', 'theft', 'fire', 'medical', 'liability'][Math.floor(Math.random() * 5)],
                date: new Date(2021 + Math.random() * 3, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
                status: ['approved', 'denied', 'pending', 'under_investigation'][Math.floor(Math.random() * 4)],
                risk_score: Math.random() * 5,
                policy_id: relatedPolicy.id,
                location: relatedPolicy.location
            };
            claims.push(claim);
            nodes.push(claim);
            
            // Connect claim to policy
            edges.push({
                source: relatedPolicy.id,
                target: claim.id,
                relationship: 'has_claim',
                weight: 2,
                timestamp: claim.date
            });
        }
        
        // Generate agents with realistic business patterns
        const agents = [];
        for (let i = 1; i <= 25; i++) {
            const agent = {
                id: `AGT_${String(i).padStart(3, '0')}`,
                type: 'agent',
                name: `Agent ${i}`,
                license_date: new Date(2015 + Math.random() * 8, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
                commission_rate: 0.05 + Math.random() * 0.15,
                total_policies: 0,
                total_claims_handled: 0,
                risk_score: Math.random() * 5,
                location: ['NYC', 'LA', 'Chicago', 'Houston', 'Phoenix', 'Miami'][Math.floor(Math.random() * 6)],
                specialty: ['auto', 'home', 'life', 'health', 'commercial'][Math.floor(Math.random() * 5)]
            };
            agents.push(agent);
            nodes.push(agent);
        }
        
        // Generate third parties with various roles
        const thirdParties = [];
        const tpTypes = ['repair_shop', 'medical_provider', 'attorney', 'adjuster', 'investigator', 'witness'];
        for (let i = 1; i <= 40; i++) {
            const thirdParty = {
                id: `TP_${String(i).padStart(3, '0')}`,
                type: 'third_party',
                subtype: tpTypes[Math.floor(Math.random() * tpTypes.length)],
                business_license: `LIC_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                years_in_business: 1 + Math.floor(Math.random() * 20),
                total_transactions: 0,
                average_transaction: 0,
                risk_score: Math.random() * 5,
                location: ['NYC', 'LA', 'Chicago', 'Houston', 'Phoenix', 'Miami'][Math.floor(Math.random() * 6)]
            };
            thirdParties.push(thirdParty);
            nodes.push(thirdParty);
        }
        
        // Create realistic relationships between agents and policies
        policies.forEach(policy => {
            const agent = agents[Math.floor(Math.random() * agents.length)];
            agent.total_policies++;
            edges.push({
                source: agent.id,
                target: policy.id,
                relationship: 'manages',
                weight: 1,
                timestamp: policy.start_date
            });
        });
        
        // Create claim-third party relationships with fraud patterns
        claims.forEach(claim => {
            const numThirdParties = Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3;
            const usedThirdParties = new Set();
            
            for (let i = 0; i < numThirdParties; i++) {
                let thirdParty;
                do {
                    thirdParty = thirdParties[Math.floor(Math.random() * thirdParties.length)];
                } while (usedThirdParties.has(thirdParty.id));
                
                usedThirdParties.add(thirdParty.id);
                thirdParty.total_transactions++;
                
                const relationshipWeight = Math.random() < 0.1 ? 4 : Math.random() < 0.3 ? 3 : Math.random() < 0.6 ? 2 : 1;
                
                edges.push({
                    source: claim.id,
                    target: thirdParty.id,
                    relationship: 'involves',
                    weight: relationshipWeight,
                    timestamp: claim.date,
                    transaction_amount: Math.round(claim.amount * (0.1 + Math.random() * 0.4))
                });
            }
        });
        
        // Create suspicious agent-third party networks (fraud rings)
        const suspiciousAgents = agents.slice(0, 5);
        const suspiciousThirdParties = thirdParties.slice(0, 8);
        
        suspiciousAgents.forEach(agent => {
            suspiciousThirdParties.forEach(tp => {
                if (Math.random() < 0.6) {
                    edges.push({
                        source: agent.id,
                        target: tp.id,
                        relationship: 'frequent_collaboration',
                        weight: 3 + Math.random() * 2,
                        timestamp: new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
                        flags: ['high_frequency', 'unusual_amounts']
                    });
                }
            });
        });
        
        // Calculate risk scores based on network patterns
        nodes.forEach(node => {
            const connections = edges.filter(e => e.source === node.id || e.target === node.id);
            const highRiskConnections = connections.filter(e => e.weight > 3).length;
            const totalConnections = connections.length;
            
            let riskMultiplier = 1;
            if (node.type === 'agent' && totalConnections > 15) riskMultiplier += 1;
            if (node.type === 'third_party' && highRiskConnections > 5) riskMultiplier += 2;
            if (node.type === 'claim' && node.amount > 20000) riskMultiplier += 0.5;
            
            node.risk_score = Math.min(5, node.risk_score * riskMultiplier);
            node.connection_count = totalConnections;
            node.high_risk_connections = highRiskConnections;
        });
        
        return { nodes, edges };
    };
    
    const [graphData, setGraphData] = useState(() => generateRealisticData());
    const [selectedNode, setSelectedNode] = useState(null);
    const [hoveredNode, setHoveredNode] = useState(null);

    // Advanced suspicious pattern detection
    const suspiciousPatterns = useMemo(() => {
        const patterns = {
            fraud_rings: [],
            suspicious_third_parties: [],
            agent_clusters: [],
            holder_patterns: {},
            time_based_anomalies: [],
            location_clusters: {},
            amount_anomalies: []
        };
        
        // Detect fraud rings (densely connected subgraphs)
        const agentThirdPartyConnections = {};
        graphData.edges.forEach(edge => {
            const sourceNode = graphData.nodes.find(n => n.id === edge.source);
            const targetNode = graphData.nodes.find(n => n.id === edge.target);
            
            if (sourceNode?.type === 'agent' && targetNode?.type === 'third_party') {
                if (!agentThirdPartyConnections[sourceNode.id]) {
                    agentThirdPartyConnections[sourceNode.id] = [];
                }
                agentThirdPartyConnections[sourceNode.id].push({
                    thirdParty: targetNode.id,
                    weight: edge.weight
                });
            }
        });
        
        // Find suspicious third parties
        const thirdPartyStats = {};
        graphData.nodes.filter(n => n.type === 'third_party').forEach(tp => {
            const connections = graphData.edges.filter(e => 
                e.source === tp.id || e.target === tp.id
            );
            const claimConnections = connections.filter(e => {
                const otherNode = graphData.nodes.find(n => 
                    n.id === (e.source === tp.id ? e.target : e.source)
                );
                return otherNode?.type === 'claim';
            });
            
            thirdPartyStats[tp.id] = {
                totalConnections: connections.length,
                claimConnections: claimConnections.length,
                avgWeight: connections.reduce((sum, e) => sum + e.weight, 0) / connections.length,
                riskScore: tp.risk_score
            };
            
            if (claimConnections.length > 8 || tp.risk_score > 3.5) {
                patterns.suspicious_third_parties.push({
                    id: tp.id,
                    subtype: tp.subtype,
                    claimCount: claimConnections.length,
                    riskScore: tp.risk_score,
                    location: tp.location
                });
            }
        });
        
        // Detect agent clusters
        graphData.nodes.filter(n => n.type === 'agent').forEach(agent => {
            const managedPolicies = graphData.edges.filter(e => 
                e.source === agent.id && e.relationship === 'manages'
            );
            const relatedClaims = [];
            
            managedPolicies.forEach(policyEdge => {
                const policyClaims = graphData.edges.filter(e => 
                    e.source === policyEdge.target && 
                    graphData.nodes.find(n => n.id === e.target)?.type === 'claim'
                );
                relatedClaims.push(...policyClaims);
            });
            
            if (managedPolicies.length > 8 || agent.risk_score > 3.0) {
                const avgClaimAmount = relatedClaims.reduce((sum, e) => {
                    const claim = graphData.nodes.find(n => n.id === e.target);
                    return sum + (claim?.amount || 0);
                }, 0) / Math.max(relatedClaims.length, 1);
                
                patterns.agent_clusters.push({
                    agent: agent.id,
                    policyCount: managedPolicies.length,
                    claimCount: relatedClaims.length,
                    avgClaimAmount: Math.round(avgClaimAmount),
                    riskScore: agent.risk_score,
                    location: agent.location,
                    specialty: agent.specialty
                });
            }
        });
        
        // Detect location-based clusters
        const locationStats = {};
        graphData.nodes.forEach(node => {
            if (node.location) {
                if (!locationStats[node.location]) {
                    locationStats[node.location] = {
                        agents: 0, policies: 0, claims: 0, thirdParties: 0,
                        totalRisk: 0, highRiskNodes: 0
                    };
                }
                locationStats[node.location][node.type === 'third_party' ? 'thirdParties' : node.type + 's']++;
                locationStats[node.location].totalRisk += node.risk_score;
                if (node.risk_score > 3.5) locationStats[node.location].highRiskNodes++;
            }
        });
        
        patterns.location_clusters = locationStats;
        
        // Detect amount anomalies
        const claims = graphData.nodes.filter(n => n.type === 'claim');
        const avgClaimAmount = claims.reduce((sum, c) => sum + c.amount, 0) / claims.length;
        const stdDev = Math.sqrt(
            claims.reduce((sum, c) => sum + Math.pow(c.amount - avgClaimAmount, 2), 0) / claims.length
        );
        
        claims.forEach(claim => {
            if (claim.amount > avgClaimAmount + 2 * stdDev) {
                patterns.amount_anomalies.push({
                    claimId: claim.id,
                    amount: claim.amount,
                    type: claim.claim_type,
                    zscore: (claim.amount - avgClaimAmount) / stdDev,
                    location: claim.location
                });
            }
        });
        
        return patterns;
    }, [graphData]);

    // Filter data based on selected criteria
    const filteredData = useMemo(() => {
        let nodes = [...graphData.nodes];
        let edges = [...graphData.edges];
        
        if (filterByRisk !== 'all') {
            const riskThreshold = filterByRisk === 'high' ? 3.5 : 
                                 filterByRisk === 'medium' ? 2.0 : 0;
            nodes = nodes.filter(n => n.risk_score >= riskThreshold);
            const nodeIds = new Set(nodes.map(n => n.id));
            edges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
        }
        
        return { nodes, edges };
    }, [graphData, filterByRisk]);

    // Enhanced color scheme
    const nodeColors = {
        'policy': '#2E86AB',
        'claim': '#A23B72',
        'agent': '#F18F01',
        'third_party': '#C73E1D',
        'default': '#8E9AAF'
    };
    
    const getNodeColor = (node) => {
        let baseColor = nodeColors[node.type] || nodeColors.default;
        
        // Adjust color intensity based on risk score
        if (node.risk_score > 4) {
            return d3.color(baseColor).darker(0.8);
        } else if (node.risk_score > 3) {
            return d3.color(baseColor).darker(0.4);
        }
        return baseColor;
    };

    const getNodeSize = (d) => {
        const baseSize = 6;
        const riskMultiplier = Math.sqrt(d.risk_score || 1);
        const connectionMultiplier = Math.log(Math.max(1, d.connection_count || 1));
        return Math.max(baseSize, baseSize + riskMultiplier * 3 + connectionMultiplier * 2);
    };

    const getEdgeWidth = (edge) => {
        return Math.sqrt(edge.weight || 1) * 1.5;
    };

    const getEdgeColor = (edge) => {
        if (edge.flags?.includes('high_frequency')) return '#FF6B6B';
        if (edge.weight > 3) return '#FF8E53';
        if (edge.weight > 2) return '#FF9F43';
        return '#95A5A6';
    };

    useEffect(() => {
        if (!filteredData?.nodes || !filteredData?.edges || filteredData.nodes.length === 0) return;

        const width = 1000;
        const height = 700;
        const centerX = width / 2;
        const centerY = height / 2;

        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .style('background', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
            .style('border-radius', '12px')
            .style('box-shadow', '0 8px 32px rgba(0,0,0,0.3)');

        const tooltip = d3.select(tooltipRef.current)
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .style('background', 'rgba(0, 0, 0, 0.9)')
            .style('color', 'white')
            .style('border-radius', '8px')
            .style('padding', '12px')
            .style('font-size', '12px')
            .style('font-family', 'monospace')
            .style('pointer-events', 'none')
            .style('z-index', '1000')
            .style('max-width', '300px')
            .style('border', '1px solid rgba(255,255,255,0.2)');

        const zoom = d3.zoom()
            .scaleExtent([0.3, 4])
            .on('zoom', (event) => {
                container.attr('transform', event.transform);
            });

        svg.call(zoom);
        const container = svg.append('g');

        // Create more sophisticated force simulation
        const simulation = d3.forceSimulation(filteredData.nodes)
            .force('link', d3.forceLink(filteredData.edges)
                .id(d => d.id)
                .distance(d => {
                    const sourceNode = filteredData.nodes.find(n => n.id === d.source.id || n.id === d.source);
                    const targetNode = filteredData.nodes.find(n => n.id === d.target.id || n.id === d.target);
                    if (sourceNode?.type === targetNode?.type) return 120;
                    return 80 + (d.weight * 10);
                })
                .strength(0.6))
            .force('charge', d3.forceManyBody()
                .strength(d => -300 - (d.risk_score * 50))
                .distanceMax(300))
            .force('center', d3.forceCenter(centerX, centerY))
            .force('collision', d3.forceCollide()
                .radius(d => getNodeSize(d) + 8)
                .strength(0.8))
            .force('x', d3.forceX(centerX).strength(0.05))
            .force('y', d3.forceY(centerY).strength(0.05));

        // Create gradient definitions for edges
        const defs = container.append('defs');
        const gradient = defs.append('linearGradient')
            .attr('id', 'edge-gradient')
            .attr('gradientUnits', 'userSpaceOnUse');
        
        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#FF6B6B')
            .attr('stop-opacity', 0.8);
        
        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#4ECDC4')
            .attr('stop-opacity', 0.3);

        // Create links with enhanced styling
        const link = container.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(filteredData.edges)
            .enter().append('line')
            .attr('stroke', d => getEdgeColor(d))
            .attr('stroke-opacity', d => d.flags?.includes('high_frequency') ? 0.9 : 0.6)
            .attr('stroke-width', d => getEdgeWidth(d))
            .style('cursor', 'pointer')
            .style('filter', 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))')
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('stroke-opacity', 1)
                    .attr('stroke-width', getEdgeWidth(d) * 1.5);
                
                const sourceNode = filteredData.nodes.find(n => n.id === d.source.id || n.id === d.source);
                const targetNode = filteredData.nodes.find(n => n.id === d.target.id || n.id === d.target);
                
                tooltip.style('visibility', 'visible')
                    .html(`
                        <div><strong>Connection</strong></div>
                        <div>${sourceNode?.id} → ${targetNode?.id}</div>
                        <div>Type: ${d.relationship}</div>
                        <div>Weight: ${d.weight}</div>
                        ${d.transaction_amount ? `<div>Amount: $${d.transaction_amount.toLocaleString()}</div>` : ''}
                        ${d.flags ? `<div>Flags: ${d.flags.join(', ')}</div>` : ''}
                    `);
            })
            .on('mousemove', (event) => {
                tooltip.style('top', `${event.pageY - 10}px`)
                    .style('left', `${event.pageX + 10}px`);
            })
            .on('mouseout', function(event, d) {
                d3.select(this)
                    .attr('stroke-opacity', d.flags?.includes('high_frequency') ? 0.9 : 0.6)
                    .attr('stroke-width', getEdgeWidth(d));
                tooltip.style('visibility', 'hidden');
            });

        // Create enhanced node groups
        const nodeGroups = container.append('g')
            .attr('class', 'nodes')
            .selectAll('g')
            .data(filteredData.nodes)
            .enter().append('g')
            .style('cursor', 'pointer')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        // Add enhanced circles
        const circles = nodeGroups.append('circle')
            .attr('r', d => getNodeSize(d))
            .attr('fill', d => getNodeColor(d))
            .attr('stroke', d => d.risk_score > 4 ? '#FF3838' : 
                              d.risk_score > 3 ? '#FF8C38' : '#ffffff')
            .attr('stroke-width', d => d.risk_score > 3 ? 3 : 2)
            .style('filter', 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))')
            .on('mouseover', function(event, d) {
                setHoveredNode(d);
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', getNodeSize(d) * 1.4)
                    .attr('stroke-width', 4);
                
                // Highlight connected elements
                const connectedEdges = filteredData.edges.filter(e => 
                    e.source.id === d.id || e.target.id === d.id
                );
                const connectedNodeIds = new Set();
                connectedEdges.forEach(e => {
                    connectedNodeIds.add(e.source.id || e.source);
                    connectedNodeIds.add(e.target.id || e.target);
                });
                
                circles.style('opacity', node => 
                    connectedNodeIds.has(node.id) ? 1 : 0.3
                );
                link.style('opacity', e => 
                    e.source.id === d.id || e.target.id === d.id ? 1 : 0.1
                );
                
                let tooltipContent = `
                    <div><strong>${d.id}</strong></div>
                    <div>Type: ${d.type.replace('_', ' ')}</div>
                    <div>Risk Score: ${d.risk_score.toFixed(2)}/5</div>
                    <div>Connections: ${d.connection_count || 0}</div>
                `;
                
                if (d.type === 'claim') {
                    tooltipContent += `
                        <div>Amount: $${d.amount?.toLocaleString()}</div>
                        <div>Type: ${d.claim_type}</div>
                        <div>Status: ${d.status}</div>
                    `;
                } else if (d.type === 'agent') {
                    tooltipContent += `
                        <div>Policies: ${d.total_policies || 0}</div>
                        <div>Specialty: ${d.specialty}</div>
                        <div>Location: ${d.location}</div>
                    `;
                } else if (d.type === 'third_party') {
                    tooltipContent += `
                        <div>Subtype: ${d.subtype}</div>
                        <div>Years Active: ${d.years_in_business}</div>
                        <div>Location: ${d.location}</div>
                    `;
                } else if (d.type === 'policy') {
                    tooltipContent += `
                        <div>Premium: $${d.premium?.toLocaleString()}</div>
                        <div>Coverage: ${d.coverage_type}</div>
                        <div>Location: ${d.location}</div>
                    `;
                }
                
                tooltip.style('visibility', 'visible').html(tooltipContent);
            })
            .on('mousemove', (event) => {
                tooltip.style('top', `${event.pageY - 10}px`)
                    .style('left', `${event.pageX + 10}px`);
            })
            .on('mouseout', function(event, d) {
                setHoveredNode(null);
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', getNodeSize(d))
                    .attr('stroke-width', d => d.risk_score > 3 ? 3 : 2);
                
                circles.style('opacity', 1);
                link.style('opacity', e => e.flags?.includes('high_frequency') ? 0.9 : 0.6);
                tooltip.style('visibility', 'hidden');
            })
            .on('click', (event, d) => {
                event.stopPropagation();
                setSelectedNode(selectedNode?.id === d.id ? null : d);
                
                circles.attr('stroke', node => 
                    node.id === d.id ? '#FFD700' : 
                    node.risk_score > 4 ? '#FF3838' : 
                    node.risk_score > 3 ? '#FF8C38' : '#ffffff'
                );
            });

        // Add enhanced labels
        nodeGroups.append('text')
            .attr('dx', d => getNodeSize(d) + 8)
            .attr('dy', 4)
            .text(d => {
                const parts = d.id.split('_');
                return parts.length > 1 ? `${parts[0]}_${parts[1].substring(0, 3)}` : d.id.substring(0, 8);
            })
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .attr('fill', '#ffffff')
            .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)')
            .style('pointer-events', 'none');

        // Risk indicator rings
        nodeGroups.filter(d => d.risk_score > 3.5)
            .append('circle')
            .attr('r', d => getNodeSize(d) + 8)
            .attr('fill', 'none')
            .attr('stroke', '#FF3838')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5')
            .style('animation', 'pulse 2s infinite');

        simulation.on('tick', () => {
            filteredData.nodes.forEach(d => {
                const radius = getNodeSize(d);
                d.x = Math.max(radius + 20, Math.min(width - radius - 20, d.x));
                d.y = Math.max(radius + 20, Math.min(height - radius - 20, d.y));
            });

            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            nodeGroups
                .attr('transform', d => `translate(${d.x},${d.y})`);
        });

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        svg.on('click', () => {
            setSelectedNode(null);
            circles.attr('stroke', node => 
                node.risk_score > 4 ? '#FF3838' : 
                node.risk_score > 3 ? '#FF8C38' : '#ffffff'
            );
        });

        return () => {
            simulation.stop();
        };
    }, [filteredData]);

    return (
        <div style={{ 
            padding: '24px', 
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh'
        }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '24px',
                background: 'rgba(255,255,255,0.9)',
                padding: '20px',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)'
            }}>
                <div>
                    <h1 style={{ 
                        margin: 0, 
                        fontSize: '28px',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        🔍 PlutusAI Fraud Detection Network
                    </h1>
                    <p style={{ 
                        margin: '8px 0 0 0', 
                        color: '#666',
                        fontSize: '14px'
                    }}>
                        Advanced graph analysis of insurance fraud patterns with {filteredData.nodes.length} entities and {filteredData.edges.length} relationships
                    </p>
                </div>
                
                {/* Controls */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>
                            Risk Filter
                        </label>
                        <select 
                            value={filterByRisk} 
                            onChange={(e) => setFilterByRisk(e.target.value)}
                            style={{ 
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '2px solid #e0e6ed',
                                background: 'white',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">All Risk Levels</option>
                            <option value="high">High Risk (3.5+)</option>
                            <option value="medium">Medium Risk (2.0+)</option>
                            <option value="low">Low Risk (0-2.0)</option>
                        </select>
                    </div>
                    
                    <div style={{ 
                        padding: '12px 16px', 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textAlign: 'center',
                        minWidth: '120px'
                    }}>
                        <div>Risk Score</div>
                        <div style={{ fontSize: '20px', fontWeight: '700' }}>
                            {(filteredData.nodes.reduce((sum, n) => sum + n.risk_score, 0) / filteredData.nodes.length).toFixed(1)}
                        </div>
                    </div>
                </div>
            </div>
            
            <div style={{ display: 'flex', gap: '24px' }}>
                {/* Main Graph */}
                <div style={{ flex: 2 }}>
                    <div style={{ 
                        background: 'rgba(255,255,255,0.95)', 
                        borderRadius: '16px', 
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        overflow: 'hidden',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{
                            padding: '16px 20px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span>Network Visualization</span>
                            <span style={{ fontSize: '12px', opacity: 0.9 }}>
                                🖱️ Drag • 🔍 Zoom • 👆 Click to select
                            </span>
                        </div>
                        <svg 
                            ref={svgRef} 
                            style={{ 
                                width: '100%', 
                                height: '700px',
                                display: 'block'
                            }}
                        />
                        <div ref={tooltipRef} />
                    </div>
                </div>
                
                {/* Side Panel */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Selected Node Info */}
                    {selectedNode && (
                        <div style={{ 
                            background: 'rgba(255,255,255,0.95)', 
                            borderRadius: '16px',
                            padding: '20px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            backdropFilter: 'blur(10px)',
                            border: `3px solid ${getNodeColor(selectedNode)}`
                        }}>
                            <h4 style={{ 
                                margin: '0 0 16px 0', 
                                color: '#333',
                                fontSize: '16px',
                                fontWeight: '700'
                            }}>
                                🎯 Selected Entity
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>ID:</strong> 
                                    <span style={{ fontFamily: 'monospace' }}>{selectedNode.id}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>Type:</strong> 
                                    <span style={{ textTransform: 'capitalize' }}>
                                        {selectedNode.type.replace('_', ' ')}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>Risk Score:</strong> 
                                    <span style={{ 
                                        color: selectedNode.risk_score > 4 ? '#d32f2f' : 
                                               selectedNode.risk_score > 3 ? '#f57c00' : '#388e3c',
                                        fontWeight: 'bold'
                                    }}>
                                        {selectedNode.risk_score.toFixed(2)}/5
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>Connections:</strong> 
                                    <span>{selectedNode.connection_count || 0}</span>
                                </div>
                                {selectedNode.location && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <strong>Location:</strong> 
                                        <span>{selectedNode.location}</span>
                                    </div>
                                )}
                                
                                {/* Type-specific details */}
                                {selectedNode.type === 'claim' && (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <strong>Amount:</strong> 
                                            <span>${selectedNode.amount?.toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <strong>Type:</strong> 
                                            <span style={{ textTransform: 'capitalize' }}>
                                                {selectedNode.claim_type}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <strong>Status:</strong> 
                                            <span style={{ 
                                                textTransform: 'capitalize',
                                                color: selectedNode.status === 'approved' ? '#4caf50' :
                                                       selectedNode.status === 'denied' ? '#f44336' :
                                                       selectedNode.status === 'under_investigation' ? '#ff9800' : '#666'
                                            }}>
                                                {selectedNode.status?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </>
                                )}
                                
                                {selectedNode.type === 'agent' && (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <strong>Policies:</strong> 
                                            <span>{selectedNode.total_policies || 0}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <strong>Specialty:</strong> 
                                            <span style={{ textTransform: 'capitalize' }}>
                                                {selectedNode.specialty}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <strong>Commission:</strong> 
                                            <span>{(selectedNode.commission_rate * 100).toFixed(1)}%</span>
                                        </div>
                                    </>
                                )}
                                
                                {selectedNode.type === 'third_party' && (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <strong>Subtype:</strong> 
                                            <span style={{ textTransform: 'capitalize' }}>
                                                {selectedNode.subtype?.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <strong>Experience:</strong> 
                                            <span>{selectedNode.years_in_business} years</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <strong>Transactions:</strong> 
                                            <span>{selectedNode.total_transactions || 0}</span>
                                        </div>
                                    </>
                                )}
                                
                                {selectedNode.type === 'policy' && (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <strong>Premium:</strong> 
                                            <span>${selectedNode.premium?.toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <strong>Coverage:</strong> 
                                            <span style={{ textTransform: 'capitalize' }}>
                                                {selectedNode.coverage_type}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <strong>Holder Age:</strong> 
                                            <span>{selectedNode.holder_age}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Fraud Risk Analysis */}
                    <div style={{ 
                        background: 'rgba(255,255,255,0.95)', 
                        borderRadius: '16px', 
                        padding: '20px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <h4 style={{ 
                            margin: '0 0 16px 0', 
                            color: '#333',
                            fontSize: '16px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            🚨 Fraud Risk Analysis
                        </h4>
                        
                        {/* High-Risk Third Parties */}
                        {suspiciousPatterns.suspicious_third_parties.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <h5 style={{ 
                                    color: '#d32f2f', 
                                    margin: '0 0 8px 0',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    ⚠️ High-Risk Third Parties ({suspiciousPatterns.suspicious_third_parties.length})
                                </h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {suspiciousPatterns.suspicious_third_parties.slice(0, 3).map((tp, index) => (
                                        <div key={index} style={{ 
                                            padding: '8px 12px', 
                                            background: 'linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)',
                                            borderRadius: '8px',
                                            border: '1px solid #ffcdd2',
                                            fontSize: '12px'
                                        }}>
                                            <div style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                                                {tp.id}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                                <span>{tp.subtype?.replace('_', ' ')}</span>
                                                <span style={{ color: '#d32f2f', fontWeight: '600' }}>
                                                    {tp.claimCount} claims
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                                                Risk: {tp.riskScore.toFixed(1)}/5 • {tp.location}
                                            </div>
                                        </div>
                                    ))}
                                    {suspiciousPatterns.suspicious_third_parties.length > 3 && (
                                        <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '4px' }}>
                                            +{suspiciousPatterns.suspicious_third_parties.length - 3} more...
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Agent Clusters */}
                        {suspiciousPatterns.agent_clusters.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <h5 style={{ 
                                    color: '#f57c00', 
                                    margin: '0 0 8px 0',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    🔗 Suspicious Agent Activity ({suspiciousPatterns.agent_clusters.length})
                                </h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {suspiciousPatterns.agent_clusters.slice(0, 3).map((cluster, index) => (
                                        <div key={index} style={{ 
                                            padding: '8px 12px', 
                                            background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
                                            borderRadius: '8px',
                                            border: '1px solid #ffe0b2',
                                            fontSize: '12px'
                                        }}>
                                            <div style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                                                {cluster.agent}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                                <span>{cluster.policyCount} policies</span>
                                                <span>{cluster.claimCount} claims</span>
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                                                Avg Claim: ${cluster.avgClaimAmount?.toLocaleString()} • {cluster.specialty}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Amount Anomalies */}
                        {suspiciousPatterns.amount_anomalies.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <h5 style={{ 
                                    color: '#7b1fa2', 
                                    margin: '0 0 8px 0',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    💰 Amount Anomalies ({suspiciousPatterns.amount_anomalies.length})
                                </h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {suspiciousPatterns.amount_anomalies.slice(0, 2).map((anomaly, index) => (
                                        <div key={index} style={{ 
                                            padding: '8px 12px', 
                                            background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                                            borderRadius: '8px',
                                            border: '1px solid #ce93d8',
                                            fontSize: '12px'
                                        }}>
                                            <div style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                                                {anomaly.claimId}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                                <span>${anomaly.amount.toLocaleString()}</span>
                                                <span style={{ color: '#7b1fa2', fontWeight: '600' }}>
                                                    {anomaly.zscore.toFixed(1)}σ
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                                                {anomaly.type} • {anomaly.location}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Location Analysis */}
                        <div>
                            <h5 style={{ 
                                color: '#1976d2', 
                                margin: '0 0 8px 0',
                                fontSize: '14px',
                                fontWeight: '600'
                            }}>
                                📍 Location Risk Analysis
                            </h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {Object.entries(suspiciousPatterns.location_clusters)
                                    .sort(([,a], [,b]) => (b.totalRisk / (b.agents + b.policies + b.claims + b.thirdParties)) - 
                                                          (a.totalRisk / (a.agents + a.policies + a.claims + a.thirdParties)))
                                    .slice(0, 4)
                                    .map(([location, stats], index) => {
                                        const totalEntities = stats.agents + stats.policies + stats.claims + stats.thirdParties;
                                        const avgRisk = stats.totalRisk / totalEntities;
                                        return (
                                            <div key={index} style={{ 
                                                padding: '6px 10px', 
                                                background: avgRisk > 3 ? 
                                                    'linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)' :
                                                    'linear-gradient(135deg, #e3f2fd 0%, #e1f5fe 100%)',
                                                borderRadius: '6px',
                                                border: `1px solid ${avgRisk > 3 ? '#ffcdd2' : '#b3e5fc'}`,
                                                fontSize: '11px'
                                            }}>
                                                <div style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between',
                                                    fontWeight: '600'
                                                }}>
                                                    <span>{location}</span>
                                                    <span style={{ 
                                                        color: avgRisk > 3 ? '#d32f2f' : '#1976d2'
                                                    }}>
                                                        {avgRisk.toFixed(1)}
                                                    </span>
                                                </div>
                                                <div style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between',
                                                    color: '#666',
                                                    marginTop: '2px'
                                                }}>
                                                    <span>{totalEntities} entities</span>
                                                    <span>{stats.highRiskNodes} high-risk</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div style={{ 
                        background: 'rgba(255,255,255,0.95)', 
                        borderRadius: '16px', 
                        padding: '20px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <h4 style={{ 
                            margin: '0 0 16px 0', 
                            color: '#333',
                            fontSize: '16px',
                            fontWeight: '700'
                        }}>
                            🗺️ Legend
                        </h4>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <h6 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666', fontWeight: '600' }}>
                                ENTITY TYPES
                            </h6>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {Object.entries(nodeColors).filter(([type]) => type !== 'default').map(([type, color]) => (
                                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            backgroundColor: color,
                                            borderRadius: '50%',
                                            border: '2px solid white',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }} />
                                        <span style={{ 
                                            fontSize: '12px', 
                                            textTransform: 'capitalize',
                                            fontWeight: '500'
                                        }}>
                                            {type.replace('_', ' ')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <h6 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666', fontWeight: '600' }}>
                                RISK INDICATORS
                            </h6>
                            <div style={{ fontSize: '11px', color: '#666', lineHeight: 1.4 }}>
                                <div>• Node size ∝ risk level + connections</div>
                                <div>• Red border = high risk (4.0+)</div>
                                <div>• Orange border = medium risk (3.0+)</div>
                                <div>• Pulsing ring = critical risk (3.5+)</div>
                                <div>• Edge thickness ∝ relationship strength</div>
                                <div>• Red edges = flagged relationships</div>
                            </div>
                        </div>
                        
                        <div>
                            <h6 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666', fontWeight: '600' }}>
                                INTERACTION
                            </h6>
                            <div style={{ fontSize: '11px', color: '#666', lineHeight: 1.4 }}>
                                <div>• Hover for details</div>
                                <div>• Click to select entity</div>
                                <div>• Drag to reposition</div>
                                <div>• Mouse wheel to zoom</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedGraphAnalysis;