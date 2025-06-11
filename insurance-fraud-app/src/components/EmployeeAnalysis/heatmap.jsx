import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Plot from "react-plotly.js";
import * as math from "mathjs";
import "./heatmap.css"; // Import the new CSS file

export default function NumericCorrelationHeatmap() {
  const [plotData, setPlotData] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/data-given.xlsx")
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        const fields = ["Premium", "POLICY SUMASSURED", "Annual Income", "ASSURED_AGE"];
        const cleanedData = json.map(row =>
          fields.map(f =>
            parseFloat(row[f]?.toString().replace(/[^\d.]/g, "")) || 0
          )
        );

        const matrix = math.transpose(cleanedData);
        const corrMatrix = fields.map((_, i) =>
          fields.map((_, j) => {
            const xi = matrix[i];
            const xj = matrix[j];
            // Handle cases where std is zero to avoid NaN correlation
            const stdX = math.std(xi) || 1e-10; // Add small epsilon to avoid division by zero
            const stdY = math.std(xj) || 1e-10;
            const meanX = math.mean(xi);
            const meanY = math.mean(xj);
            let cov = 0;
            if (xi.length > 0) {
              cov = math.mean(xi.map((x, k) => (x - meanX) * (xj[k] - meanY)));
            }

            if (stdX === 0 || stdY === 0) return 0; // If no variance, correlation is 0
            return cov / (stdX * stdY);
          })
        );

        // Prepare annotations for each cell
        const annots = [];
        for (let i = 0; i < fields.length; i++) {
          for (let j = 0; j < fields.length; j++) {
            annots.push({
              x: fields[j],
              y: fields[i],
              text: corrMatrix[i][j].toFixed(2),
              showarrow: false,
              font: {
                // Dynamic text color for annotations based on correlation value
                color: Math.abs(corrMatrix[i][j]) > 0.6 ? "white" : "#263238",
                size: 14,
                family: "Inter, sans-serif"
              }
            });
          }
        }

        setAnnotations(annots);

        setPlotData({
          z: corrMatrix,
          x: fields,
          y: fields,
          type: "heatmap",
          colorscale: [
            [0, '#e74c3c'],   // Red for strong negative correlation
            [0.5, '#fbc02d'],  // Yellow for low/no correlation
            [1, '#2ecc71']    // Green for strong positive correlation
          ],
          zmin: -1,
          zmax: 1,
          colorbar: {
            title: "Correlation",
            titleside: "right",
            thickness: 20,
            len: 0.8,
            x: 1.02,
            y: 0.5,
            tickfont: { size: 12, color: '#2c3e50' }
          }
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading or processing data:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <h2>Numeric Correlation Heatmap</h2>
        <p className="heatmap-subtitle">Visualizing correlations between key numerical features</p>
      </div>
      {loading ? (
        <div className="heatmap-loading">
          <div className="loading-spinner"></div>
          <p>Loading heatmap...</p>
        </div>
      ) : plotData ? (
        <div className="heatmap-chart-wrapper">
          <Plot
            data={[plotData]}
            layout={{
              width: null,
              height: 700,
              margin: { t: 80, b: 80, l: 80, r: 80 },
              annotations,
              xaxis: {
                title: "Fields",
                side: "top",
                tickangle: -45,
                automargin: true,
                tickfont: { size: 12, color: '#2c3e50' }
              },
              yaxis: {
                title: "Fields",
                autorange: "reversed",
                tickangle: -45,
                automargin: true,
                tickfont: { size: 12, color: '#2c3e50' }
              },
              font: { 
                family: "Inter, sans-serif", 
                size: 14,
                color: '#2c3e50'
              },
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              hovermode: "closest",
              autosize: true,
            }}
            config={{
              responsive: true,
              displayModeBar: true,
              displaylogo: false,
              modeBarButtonsToRemove: ['lasso2d', 'select2d'],
              toImageButtonOptions: {
                format: 'png',
                filename: 'correlation_heatmap',
                height: 700,
                width: 800,
                scale: 2
              }
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      ) : (
        <div className="heatmap-error">
          <p>No data available or error loading the heatmap.</p>
        </div>
      )}
    </div>
  );
}
