import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, PolarArea, Radar } from 'react-chartjs-2';
import './Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

// Vibrant color palette
const COLORS = {
  primary: 'rgba(41, 128, 185, 0.95)',      // Bright Blue
  secondary: 'rgba(231, 76, 60, 0.95)',      // Vibrant Red
  tertiary: 'rgba(241, 196, 15, 0.95)',      // Golden Yellow
  quaternary: 'rgba(46, 204, 113, 0.95)',    // Emerald Green
  quinary: 'rgba(155, 89, 182, 0.95)',       // Rich Purple
  senary: 'rgba(243, 156, 18, 0.95)',        // Bright Orange
  gradient: [
    'rgba(46, 204, 113, 0.95)',    // Emerald Green
    'rgba(41, 128, 185, 0.95)',    // Bright Blue
    'rgba(231, 76, 60, 0.95)',     // Vibrant Red
    'rgba(241, 196, 15, 0.95)',    // Golden Yellow
    'rgba(155, 89, 182, 0.95)'     // Rich Purple
  ]
};

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    leadGeneration: [],
    claimProcessing: [],
    riskAssessment: [],
    customerSatisfaction: {},
    marketMetrics: [],
    fraudMetrics: [],
    bankingMetrics: []
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const simulatedData = {
        leadGeneration: [
          { stage: 'Total Visits', count: 75000 },
          { stage: 'Form Submissions', count: 45000 },
          { stage: 'Qualified Leads', count: 22000 },
          { stage: 'Proposals Sent', count: 6500 },
          { stage: 'Converted', count: 1800 }
        ],
        claimProcessing: [
          { stage: 'Documentation', completion: 85 },
          { stage: 'Verification', completion: 72 },
          { stage: 'Assessment', completion: 65 },
          { stage: 'Processing', completion: 58 },
          { stage: 'Settlement', completion: 45 }
        ],
        riskAssessment: [
          { category: 'Documentation Risk', score: 75 },
          { category: 'Identity Verification', score: 85 },
          { category: 'Claims History', score: 65 },
          { category: 'Policy Compliance', score: 90 },
          { category: 'Payment History', score: 80 }
        ],
        customerSatisfaction: {
          current: 62,
          target: 80,
          previous: 58,
          breakdown: {
            service: 65,
            speed: 58,
            communication: 70,
            resolution: 55
          }
        },
        marketMetrics: [
          { category: 'Market Share', value: 28, target: 35 },
          { category: 'Customer Retention', value: 85, target: 90 },
          { category: 'New Policies', value: 1200, target: 1500 },
          { category: 'Premium Growth', value: 15, target: 20 },
          { category: 'Claims Ratio', value: 65, target: 60 }
        ],
        fraudMetrics: [
          { 
            category: 'ML-Based Fraud Detection',
            current: 75,
            projected: 95,
            industry: 70,
            description: 'Machine learning algorithms for detecting fraudulent patterns'
          },
          { 
            category: 'Real-time Transaction Monitoring',
            current: 80,
            projected: 98,
            industry: 75,
            description: 'Live monitoring of claims and transactions'
          },
          { 
            category: 'Document Verification',
            current: 85,
            projected: 92,
            industry: 78,
            description: 'Advanced OCR and document authenticity checks'
          },
          { 
            category: 'Behavioral Analytics',
            current: 70,
            projected: 90,
            industry: 65,
            description: 'Analysis of customer behavior patterns'
          },
          { 
            category: 'Cross-claim Analysis',
            current: 65,
            projected: 88,
            industry: 60,
            description: 'Detection of related fraudulent claims across policies'
          }
        ],
        bankingMetrics: [
          {
            category: 'Digital Banking Integration',
            current: 85,
            industry: 70,
            description: 'Level of integration with digital banking systems'
          },
          {
            category: 'Payment Processing',
            current: 92,
            industry: 80,
            description: 'Efficiency of payment processing systems'
          },
          {
            category: 'Regulatory Compliance',
            current: 95,
            industry: 90,
            description: 'Adherence to banking regulations and compliance'
          },
          {
            category: 'Transaction Security',
            current: 88,
            industry: 85,
            description: 'Security measures for banking transactions'
          },
          {
            category: 'API Integration',
            current: 78,
            industry: 65,
            description: 'Integration with banking APIs and services'
          },
          {
            category: 'Cross-Border Operations',
            current: 82,
            industry: 75,
            description: 'Capability to handle international banking operations'
          }
        ]
      };
      
      setAnalyticsData({ ...simulatedData });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetVisualizations = () => {
    setLoading(true);
    setAnalyticsData({
      leadGeneration: [],
      claimProcessing: [],
      riskAssessment: [],
      customerSatisfaction: {},
      marketMetrics: [],
      fraudMetrics: [],
      bankingMetrics: []
    });
    setTimeout(() => {
      fetchData();
    }, 500);
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            family: "'Roboto', sans-serif"
          },
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 12,
        cornerRadius: 4
      }
    }
  };

  // Funnel Chart Data
  const funnelData = {
    labels: analyticsData.leadGeneration.map(item => item.stage),
    datasets: [{
      data: analyticsData.leadGeneration.map(item => item.count),
      backgroundColor: COLORS.gradient,
      borderWidth: 0
    }]
  };

  // Risk Assessment Data
  const riskData = {
    labels: analyticsData.riskAssessment.map(item => item.category),
    datasets: [{
      label: 'Risk Score',
      data: analyticsData.riskAssessment.map(item => item.score),
      backgroundColor: COLORS.gradient,
      borderWidth: 1
    }]
  };

  // Customer Satisfaction Data with Multiple Metrics
  const satisfactionData = {
    labels: ['Overall', 'Service', 'Speed', 'Communication', 'Resolution'],
    datasets: [{
      data: [
        analyticsData.customerSatisfaction.current,
        analyticsData.customerSatisfaction.breakdown.service,
        analyticsData.customerSatisfaction.breakdown.speed,
        analyticsData.customerSatisfaction.breakdown.communication,
        analyticsData.customerSatisfaction.breakdown.resolution
      ],
      backgroundColor: [
        COLORS.primary,
        COLORS.secondary,
        COLORS.tertiary,
        COLORS.quaternary,
        COLORS.quinary
      ],
      circumference: 180,
      rotation: 270,
      borderWidth: 2
    }]
  };

  // Market Metrics (Cone Chart using Bar)
  const marketData = {
    labels: analyticsData.marketMetrics.map(item => item.category),
    datasets: [
      {
        label: 'Current',
        data: analyticsData.marketMetrics.map(item => item.value),
        backgroundColor: COLORS.primary,
        borderWidth: 0
      },
      {
        label: 'Target',
        data: analyticsData.marketMetrics.map(item => item.target),
        backgroundColor: COLORS.quaternary,
        borderWidth: 0
      }
    ]
  };

  // Claims Processing Data
  const processingData = {
    labels: analyticsData.claimProcessing.map(item => item.stage),
    datasets: [{
      label: 'Completion Rate',
      data: analyticsData.claimProcessing.map(item => item.completion),
      backgroundColor: analyticsData.claimProcessing.map(item => 
        item.completion >= 70 ? COLORS.primary :
        item.completion >= 50 ? COLORS.tertiary :
        COLORS.secondary
      ),
      borderWidth: 1
    }]
  };

  // Update Cone Chart Data
  const coneChartData = {
    labels: analyticsData.fraudMetrics.map(item => item.category),
    datasets: [
      {
        label: 'Current Implementation',
        data: analyticsData.fraudMetrics.map(item => item.current),
        backgroundColor: COLORS.primary,
        borderWidth: 0,
        order: 3
      },
      {
        label: 'Industry Benchmark',
        data: analyticsData.fraudMetrics.map(item => item.industry),
        backgroundColor: COLORS.tertiary,
        borderWidth: 0,
        order: 2
      },
      {
        label: 'Target Coverage',
        data: analyticsData.fraudMetrics.map(item => item.projected),
        backgroundColor: COLORS.quaternary,
        borderWidth: 0,
        order: 1
      }
    ]
  };

  // Banking Sector Radar Chart Data
  const bankingData = {
    labels: analyticsData.bankingMetrics.map(item => item.category),
    datasets: [
      {
        label: 'Our Performance',
        data: analyticsData.bankingMetrics.map(item => item.current),
        backgroundColor: `${COLORS.primary}40`,
        borderColor: COLORS.primary,
        borderWidth: 2,
        fill: true,
        pointBackgroundColor: COLORS.primary,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: COLORS.primary,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Industry Average',
        data: analyticsData.bankingMetrics.map(item => item.industry),
        backgroundColor: `${COLORS.tertiary}40`,
        borderColor: COLORS.tertiary,
        borderWidth: 2,
        fill: true,
        pointBackgroundColor: COLORS.tertiary,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: COLORS.tertiary,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  return (
    <div className="analytics-container">
      <h1>Insurance Analytics Dashboard</h1>
      
      {/* <button className="reset-button" onClick={resetVisualizations}>
        Reset Visualizations
      </button> */}
      
      <div className="charts-grid">
        <div className="chart-container">
          <h2>Lead Generation Funnel</h2>
          <div className="chart-wrapper">
            <Bar
              data={funnelData}
              options={{
                ...commonOptions,
                indexAxis: 'y',
                plugins: {
                  ...commonOptions.plugins,
                  title: {
                    display: true,
                    text: 'Lead Generation Pipeline'
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-container">
          <h2>Risk Assessment Matrix</h2>
          <div className="chart-wrapper">
            <PolarArea
              data={riskData}
              options={{
                ...commonOptions,
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      stepSize: 20
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-container">
          <h2>Customer Satisfaction Metrics</h2>
          <div className="chart-wrapper">
            <Pie
              data={satisfactionData}
              options={{
                ...commonOptions,
                plugins: {
                  ...commonOptions.plugins,
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.label}: ${context.raw}%`
                    }
                  }
                },
                rotation: 270,
                circumference: 180,
                cutout: '60%'
              }}
            />
            <div className="gauge-label">
              <div className="current">{analyticsData.customerSatisfaction.current}%</div>
              <div className="target">Target: {analyticsData.customerSatisfaction.target}%</div>
              <div className="previous">Previous: {analyticsData.customerSatisfaction.previous}%</div>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <h2>Market Performance Metrics</h2>
          <div className="chart-wrapper">
            <Bar
              data={marketData}
              options={{
                ...commonOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Value'
                    }
                  }
                },
                plugins: {
                  ...commonOptions.plugins,
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const label = context.dataset.label || '';
                        const value = context.raw;
                        const metric = analyticsData.marketMetrics[context.dataIndex];
                        return `${label}: ${value}${metric.category.includes('Growth') ? '%' : ''}`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-container cone-chart">
          <h2>Fraud Detection Capabilities</h2>
          <div className="chart-wrapper">
            <Bar
              data={coneChartData}
              options={{
                ...commonOptions,
                indexAxis: 'y',
                plugins: {
                  ...commonOptions.plugins,
                  title: {
                    display: true,
                    text: 'Fraud Prevention System Coverage'
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const label = context.dataset.label;
                        const value = context.raw;
                        const metric = analyticsData.fraudMetrics[context.dataIndex];
                        return [
                          `${label}: ${value}%`,
                          `Description: ${metric.description}`
                        ];
                      }
                    }
                  },
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 12,
                      padding: 15
                    }
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)'
                    }
                  },
                  y: {
                    grid: {
                      display: false
                    }
                  }
                },
                maintainAspectRatio: false
              }}
            />
          </div>
        </div>

        <div className="chart-container banking-radar">
          <h2>Banking Sector Integration</h2>
          <div className="chart-wrapper">
            <Radar
              data={bankingData}
              options={{
                ...commonOptions,
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      stepSize: 20,
                      display: false
                    },
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)'
                    },
                    angleLines: {
                      color: 'rgba(0, 0, 0, 0.1)'
                    },
                    pointLabels: {
                      font: {
                        size: 11
                      }
                    }
                  }
                },
                plugins: {
                  ...commonOptions.plugins,
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 12,
                      padding: 15
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const label = context.dataset.label;
                        const value = context.raw;
                        const metric = analyticsData.bankingMetrics[context.dataIndex];
                        return [
                          `${label}: ${value}%`,
                          `Description: ${metric.description}`
                        ];
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 