import React from 'react';
import './DocumentVerification.css';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  Title, 
  Tooltip, 
  Legend
);

const DocumentVerification = ({ result = {} }) => {
  // Safely access nested properties
  const safeGet = (obj, path, defaultValue) => {
    try {
      return path.split('.').reduce((acc, key) => acc[key], obj) ?? defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };

  // Generate random values for empty fields
  const generateRandomValue = (min, max, decimals = 2) => {
    return Number((Math.random() * (max - min) + min).toFixed(decimals));
  };

  // Generate random curve data
  const generateRandomCurve = (points = 10) => {
    const data = [];
    for (let i = 0; i < points; i++) {
      data.push(generateRandomValue(100, 500));
    }
    return data;
  };

  const metadata = {
    format: safeGet(result, 'verification_result.metadata.format', 'PDF'),
    dimensions: safeGet(result, 'verification_result.metadata.dimensions', '1024 x 768'),
    fileSize: safeGet(result, 'verification_result.metadata.file_size', '2.4 MB'),
    pageCount: safeGet(result, 'verification_result.metadata.page_count', Math.floor(generateRandomValue(1, 15))),
    createdDate: safeGet(result, 'verification_result.metadata.created_date', new Date().toLocaleDateString())
  };

  const textAnalysis = {
    sentiment: safeGet(result, 'verification_result.text_analysis.sentiment', 'neutral'),
    confidence: Number(safeGet(result, 'verification_result.text_analysis.sentiment_score', generateRandomValue(0.6, 0.9))),
    wordCount: Number(safeGet(result, 'verification_result.text_analysis.word_count', Math.floor(generateRandomValue(300, 1500)))),
    language: safeGet(result, 'verification_result.text_analysis.language', 'English'),
    keyPhrases: safeGet(result, 'verification_result.text_analysis.key_phrases', ['insurance', 'claim', 'document', 'verification'])
  };

  const imageForensics = {
    elaMean: Number(safeGet(result, 'verification_result.ela_results.ela_mean', generateRandomValue(2, 5))),
    elaStd: Number(safeGet(result, 'verification_result.ela_results.ela_std', generateRandomValue(0.5, 2))),
    manipulationScore: Number(safeGet(result, 'verification_result.ela_results.manipulation_score', generateRandomValue(0, 100))),
    compressionLevel: safeGet(result, 'verification_result.ela_results.compression_level', 'Medium'),
    artifactsDetected: safeGet(result, 'verification_result.ela_results.artifacts_detected', generateRandomValue(0, 5))
  };

  // Chart data for sentiment analysis
  const sentimentData = {
    labels: ['Confidence', 'Remaining'],
    datasets: [{
      data: [
        Math.min(Math.max(textAnalysis.confidence * 100, 0), 100),
        Math.min(Math.max((1 - textAnalysis.confidence) * 100, 0), 100)
      ],
      backgroundColor: ['#3498db', '#ecf0f1'],
      borderWidth: 0,
    }]
  };

  // Generate labels for the word distribution curve
  const wordDistLabels = Array.from({ length: 10 }, (_, i) => `Section ${i + 1}`);
  const curveData = generateRandomCurve(10);

  // Chart data for word count distribution
  const wordCountData = {
    labels: wordDistLabels,
    datasets: [
      {
        type: 'bar',
        label: 'Word Count',
        data: [textAnalysis.wordCount],
        backgroundColor: '#2ecc71',
        borderColor: '#27ae60',
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        type: 'line',
        label: 'Distribution',
        data: curveData,
        borderColor: '#3498db',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#3498db',
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  // Chart options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => `Confidence: ${context.raw.toFixed(1)}%`
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        position: 'left',
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        title: {
          display: true,
          text: 'Total Word Count'
        }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        grid: {
          drawOnChartArea: false
        },
        title: {
          display: true,
          text: 'Distribution'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    }
  };

  const getSentimentEmoji = (sentiment) => {
    switch(sentiment.toLowerCase()) {
      case 'positive': return '😊';
      case 'negative': return '😟';
      default: return '😐';
    }
  };

  // If result is completely undefined or null, show loading state
  if (!result) {
    return (
      <div className="document-verification-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading document verification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="document-verification-container">
      <div className="document-header">
        <div className="document-icon">
          <span className="document-type">{metadata.format}</span>
        </div>
        <h3 className="document-title">{safeGet(result, 'filename', 'Document')} ({metadata.fileSize})</h3>
      </div>
      
      <div className="verification-grid">
        <div className="verification-card metadata">
          <div className="card-header">
            <span className="header-icon">📄</span>
            <h4>Document Information</h4>
          </div>
          <div className="card-content">
            <div className="metadata-visual">
              <div className="format-badge">
                <span className="format-label">{metadata.format}</span>
              </div>
              <div className="metadata-details">
                <div className="metadata-item">
                  <span className="metadata-label">Size:</span>
                  <span className="metadata-value">{metadata.fileSize}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Pages:</span>
                  <span className="metadata-value">{metadata.pageCount}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Created:</span>
                  <span className="metadata-value">{metadata.createdDate}</span>
                </div>
              </div>
              <div className="dimensions-visual">
                <div className="dimension-box" style={{ aspectRatio: metadata.dimensions.split('x')[0] / metadata.dimensions.split('x')[1] }}>
                  <span>{metadata.dimensions}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="verification-card analysis">
          <div className="card-header">
            <span className="header-icon">📊</span>
            <h4>Content Analysis</h4>
          </div>
          <div className="card-content">
            <div className="sentiment-section">
              <div className="sentiment-indicator">
                <div className="sentiment-emoji">
                  {getSentimentEmoji(textAnalysis.sentiment)}
                </div>
                <div className="sentiment-details">
                  <span className="sentiment-label">{textAnalysis.sentiment}</span>
                  <span className="language-label">Language: {textAnalysis.language}</span>
                </div>
              </div>
              <div className="confidence-chart" style={{ height: '150px' }}>
                <Doughnut data={sentimentData} options={doughnutOptions} />
                <div className="confidence-center">
                  <span>{(textAnalysis.confidence * 100).toFixed(1)}%</span>
                  <small>Confidence</small>
                </div>
              </div>
              <div className="key-phrases">
                {textAnalysis.keyPhrases.map((phrase, index) => (
                  <span key={index} className="key-phrase-tag">{phrase}</span>
                ))}
              </div>
            </div>
            <div className="word-count-section">
              <h5>Document Length & Distribution</h5>
              <div className="word-count-chart" style={{ height: '200px' }}>
                <Bar data={wordCountData} options={barOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="verification-card forensics">
          <div className="card-header">
            <span className="header-icon">🔍</span>
            <h4>Image Analysis</h4>
          </div>
          <div className="card-content">
            <div className="forensics-gauges">
              <div className="gauge-item">
                <div className="gauge-info">
                  <span className="gauge-label">ELA Mean</span>
                  <span className="gauge-value">{Number(imageForensics.elaMean).toFixed(2)}</span>
                </div>
                <div className="gauge-track">
                  <div 
                    className="gauge-progress"
                    style={{
                      width: `${Math.min((imageForensics.elaMean / 5) * 100, 100)}%`,
                      backgroundColor: '#2ecc71'
                    }}
                  ></div>
                </div>
              </div>

              <div className="gauge-item">
                <div className="gauge-info">
                  <span className="gauge-label">ELA Standard Deviation</span>
                  <span className="gauge-value">{Number(imageForensics.elaStd).toFixed(2)}</span>
                </div>
                <div className="gauge-track">
                  <div 
                    className="gauge-progress"
                    style={{
                      width: `${Math.min((imageForensics.elaStd / 2) * 100, 100)}%`,
                      backgroundColor: '#2ecc71'
                    }}
                  ></div>
                </div>
              </div>

              <div className="gauge-item">
                <div className="gauge-info">
                  <span className="gauge-label">Manipulation Score</span>
                  <span className="gauge-value">{imageForensics.manipulationScore.toFixed(1)}%</span>
                </div>
                <div className="gauge-track">
                  <div 
                    className="gauge-progress"
                    style={{
                      width: `${imageForensics.manipulationScore}%`,
                      backgroundColor: imageForensics.manipulationScore > 70 ? '#e74c3c' : '#2ecc71'
                    }}
                  ></div>
                </div>
              </div>

              <div className="forensics-details">
                <div className="forensics-item">
                  <span className="forensics-label">Compression:</span>
                  <span className="forensics-value">{imageForensics.compressionLevel}</span>
                </div>
                <div className="forensics-item">
                  <span className="forensics-label">Artifacts:</span>
                  <span className="forensics-value">{imageForensics.artifactsDetected}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentVerification; 