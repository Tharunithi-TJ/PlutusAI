import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Card,
    Typography,
    Grid,
    Button,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Alert
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const RLMonitor = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [simulationResults, setSimulationResults] = useState([]);
    const [trainingStatus, setTrainingStatus] = useState(null);

    useEffect(() => {
        fetchMetrics();
        fetchSimulationResults();
    }, []);

    const fetchMetrics = async () => {
        try {
            const response = await axios.get('/api/rl-metrics');
            setMetrics(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const fetchSimulationResults = async () => {
        try {
            const response = await axios.get('/api/rl-simulation');
            setSimulationResults(response.data.results);
        } catch (err) {
            console.error('Error fetching simulation results:', err);
        }
    };

    const startTraining = async () => {
        try {
            setTrainingStatus('training');
            await axios.post('/api/rl-train');
            setTrainingStatus('completed');
            fetchMetrics(); // Refresh metrics after training
        } catch (err) {
            setTrainingStatus('error');
            setError(err.message);
        }
    };

    const runSimulation = async () => {
        try {
            setLoading(true);
            await axios.post('/api/rl-simulate');
            await fetchSimulationResults();
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                RL Model Monitor
            </Typography>

            <Grid container spacing={3}>
                {/* Metrics Overview */}
                <Grid item xs={12} md={6}>
                    <Card style={{ padding: '20px' }}>
                        <Typography variant="h6" gutterBottom>
                            Model Metrics
                        </Typography>
                        {metrics && (
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Replay Buffer Size</TableCell>
                                            <TableCell>{metrics.replay_buffer_size}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Last Training Loss</TableCell>
                                            <TableCell>{metrics.last_training_loss?.toFixed(4)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Adaptation Score</TableCell>
                                            <TableCell>{metrics.adaptation_score?.toFixed(2)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Card>
                </Grid>

                {/* Training Controls */}
                <Grid item xs={12} md={6}>
                    <Card style={{ padding: '20px' }}>
                        <Typography variant="h6" gutterBottom>
                            Training Controls
                        </Typography>
                        <Box display="flex" gap={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={startTraining}
                                disabled={trainingStatus === 'training'}
                            >
                                {trainingStatus === 'training' ? 'Training...' : 'Start Training'}
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={runSimulation}
                                disabled={loading}
                            >
                                Run Simulation
                            </Button>
                        </Box>
                        {trainingStatus === 'completed' && (
                            <Alert severity="success" style={{ marginTop: '10px' }}>
                                Training completed successfully!
                            </Alert>
                        )}
                    </Card>
                </Grid>

                {/* Simulation Results */}
                <Grid item xs={12}>
                    <Card style={{ padding: '20px' }}>
                        <Typography variant="h6" gutterBottom>
                            Simulation Results
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Claim ID</TableCell>
                                        <TableCell>Traditional Decision</TableCell>
                                        <TableCell>RL Decision</TableCell>
                                        <TableCell>Confidence</TableCell>
                                        <TableCell>Final Decision</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {simulationResults.map((result, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{result.claim_id}</TableCell>
                                            <TableCell>{result.traditional_decision}</TableCell>
                                            <TableCell>{result.rl_decision}</TableCell>
                                            <TableCell>{(result.confidence * 100).toFixed(2)}%</TableCell>
                                            <TableCell>{result.final_decision}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
};

export default RLMonitor; 