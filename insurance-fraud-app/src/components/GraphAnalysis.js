import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import { Card, Typography, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';

const GraphAnalysis = () => {
    const svgRef = useRef();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
    const [suspiciousPatterns, setSuspiciousPatterns] = useState({
        suspicious_third_parties: [],
        agent_clusters: [],
        holder_patterns: {}
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get('http://localhost:5000/graph-analysis');
                
                if (response.data?.success) {
                    setGraphData({
                        nodes: response.data.graph_data?.nodes || [],
                        edges: response.data.graph_data?.edges || []
                    });
                    setSuspiciousPatterns({
                        suspicious_third_parties: response.data.suspicious_patterns?.suspicious_third_parties || [],
                        agent_clusters: response.data.suspicious_patterns?.agent_clusters || [],
                        holder_patterns: response.data.suspicious_patterns?.holder_patterns || {}
                    });
                } else {
                    setError(response.data?.error || 'Failed to fetch graph data');
                }
            } catch (err) {
                setError(err.response?.data?.error || err.message || 'Network error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!graphData?.nodes || !graphData?.edges) return;

        const width = 800;
        const height = 600;

        // Clear previous SVG
        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        // Create simulation
        const simulation = d3.forceSimulation(graphData.nodes)
            .force('link', d3.forceLink(graphData.edges).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2));

        // Create links
        const link = svg.append('g')
            .selectAll('line')
            .data(graphData.edges)
            .enter()
            .append('line')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', 1);

        // Create nodes
        const node = svg.append('g')
            .selectAll('circle')
            .data(graphData.nodes)
            .enter()
            .append('circle')
            .attr('r', 5)
            .attr('fill', d => {
                switch(d?.type) {
                    case 'policy': return '#1f77b4';
                    case 'claim': return '#2ca02c';
                    case 'agent': return '#ff7f0e';
                    case 'third_party': return '#d62728';
                    default: return '#7f7f7f';
                }
            })
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        // Add labels
        const label = svg.append('g')
            .selectAll('text')
            .data(graphData.nodes)
            .enter()
            .append('text')
            .text(d => d?.id || '')
            .attr('font-size', 10)
            .attr('dx', 12)
            .attr('dy', 4);

        // Update positions on simulation tick
        simulation.on('tick', () => {
            link
                .attr('x1', d => d?.source?.x || 0)
                .attr('y1', d => d?.source?.y || 0)
                .attr('x2', d => d?.target?.x || 0)
                .attr('y2', d => d?.target?.y || 0);

            node
                .attr('cx', d => d?.x || 0)
                .attr('cy', d => d?.y || 0);

            label
                .attr('x', d => d?.x || 0)
                .attr('y', d => d?.y || 0);
        });

        // Drag functions
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d?.x || 0;
            d.fy = d?.y || 0;
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

        return () => {
            simulation.stop();
        };

    }, [graphData]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return (
            <Alert severity="error" style={{ margin: '20px' }}>
                {error}
            </Alert>
        );
    }

    // Safely get patterns with defaults
    const { 
        suspicious_third_parties = [], 
        agent_clusters = [], 
        holder_patterns = {} 
    } = suspiciousPatterns || {};

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Insurance Fraud Graph Analysis
            </Typography>
            
            <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
                <Card style={{ padding: '20px', marginBottom: '20px' }}>
                    <svg ref={svgRef} style={{ width: '100%', height: '600px' }}></svg>
                </Card>
                
                <Card style={{ padding: '20px' }}>
                    <Typography variant="h6" gutterBottom>
                        Suspicious Patterns
                    </Typography>
                    
                    {Array.isArray(suspicious_third_parties) && suspicious_third_parties.length > 0 && (
                        <>
                            <Typography variant="subtitle1" gutterBottom>
                                Suspicious Third Parties
                            </Typography>
                            <List dense>
                                {suspicious_third_parties.map((tp, index) => (
                                    <ListItem key={index}>
                                        <ListItemText primary={tp || 'Unknown'} />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}

                    {Array.isArray(agent_clusters) && agent_clusters.length > 0 && (
                        <>
                            <Typography variant="subtitle1" gutterBottom>
                                Agent Clusters
                            </Typography>
                            <List dense>
                                {agent_clusters.map((cluster, index) => (
                                    <ListItem key={index}>
                                        <ListItemText 
                                            primary={`Agent ${cluster?.agent || 'Unknown'}`}
                                            secondary={`Claims: ${cluster?.claim_count || 0}, Avg Amount: $${(cluster?.avg_claim_amount || 0).toFixed(2)}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}

                    {holder_patterns && Object.keys(holder_patterns).length > 0 && (
                        <>
                            <Typography variant="subtitle1" gutterBottom>
                                Policy Holder Patterns
                            </Typography>
                            <List dense>
                                {Object.entries(holder_patterns).map(([holder, data], index) => (
                                    <ListItem key={index}>
                                        <ListItemText 
                                            primary={`Policy ${holder || 'Unknown'}`}
                                            secondary={`Claims: ${data?.claim_count || 0}, Total: $${(data?.total_claimed || 0).toFixed(2)}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}

                    {(!Array.isArray(suspicious_third_parties) || suspicious_third_parties.length === 0) && 
                     (!Array.isArray(agent_clusters) || agent_clusters.length === 0) && 
                     (!holder_patterns || Object.keys(holder_patterns).length === 0) && (
                        <Typography variant="body2" color="textSecondary">
                            No suspicious patterns detected
                        </Typography>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default GraphAnalysis;