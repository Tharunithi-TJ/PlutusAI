import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Plot from "react-plotly.js";
import "./PremiumMaritalFraudParallel.css";

export default function PremiumMaritalFraudParallel() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/data-given.xlsx")
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        const filtered = json
          .map(row => ({
            mode: row["PREMIUMPAYMENTMODE"],
            marital: row["HOLDERMARITALSTATUS"],
            fraud: row["Fraud Category"]
          }))
          .filter(r => r.mode && r.marital && r.fraud);

        const modes = [...new Set(filtered.map(r => r.mode))];
        const maritals = [...new Set(filtered.map(r => r.marital))];
        const frauds = [...new Set(filtered.map(r => r.fraud))];

        const labelMap = (arr) =>
          arr.reduce((acc, label, idx) => {
            acc[label] = idx;
            return acc;
          }, {});

        const modeMap = labelMap(modes);
        const maritalMap = labelMap(maritals);
        const fraudMap = labelMap(frauds);

        const dimensions = [
          {
            label: "Payment Mode",
            tickvals: Object.values(modeMap),
            ticktext: Object.keys(modeMap),
            values: filtered.map(r => modeMap[r.mode]),
            categoryorder: "category ascending"
          },
          {
            label: "Marital Status",
            tickvals: Object.values(maritalMap),
            ticktext: Object.keys(maritalMap),
            values: filtered.map(r => maritalMap[r.marital]),
            categoryorder: "category ascending"
          },
          {
            label: "Fraud Category",
            tickvals: Object.values(fraudMap),
            ticktext: Object.keys(fraudMap),
            values: filtered.map(r => fraudMap[r.fraud]),
            categoryorder: "category ascending"
          }
        ];

        setChartData([
          {
            type: "parcats",
            dimensions,
            line: {
              colorscale: [[0, '#1976d2'], [0.5, '#2ecc71'], [1, '#e74c3c']], // Blue to Green to Red for fraud
              cmin: 0,
              cmax: frauds.length - 1,
              color: filtered.map(r => fraudMap[r.fraud]),
              shape: 'hspline',
              showscale: false
            },
            hoveron: "color",
            labelfont: { 
              size: 14,
              color: '#2c3e50',
              family: 'Inter, sans-serif'
            },
            tickfont: { 
              size: 12,
              color: '#2c3e50',
              family: 'Inter, sans-serif'
            },
            arrangement: "perpendicular",
            bundlecolors: true,
            sortpaths: "forward"
          }
        ]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading or processing data:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="parallel-container">
      <div className="parallel-header">
        <h2>Parallel Categories: Payment Mode → Marital Status → Fraud Category</h2>
        <p className="parallel-subtitle">Exploring relationships between payment modes, marital statuses, and fraud outcomes</p>
      </div>
      {loading ? (
        <div className="parallel-loading">
          <div className="loading-spinner"></div>
          <p>Loading Parallel Categories diagram...</p>
        </div>
      ) : chartData.length > 0 ? (
        <div className="parallel-chart-wrapper">
          <Plot
            data={chartData}
            layout={{
              margin: { t: 40, l: 50, r: 50, b: 40 },
              width: null, // Allow responsiveness
              height: 500,
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { 
                family: 'Inter, sans-serif',
                size: 14,
                color: '#2c3e50'
              },
              hovermode: "closest",
              autosize: true,
              hoverlabel: {
                bgcolor: "#eceff1",
                bordercolor: "#90a4ae",
                font: { size: 14, color: "#263238" }
              }
            }}
            config={{ 
              responsive: true,
              displayModeBar: true,
              displaylogo: false,
              modeBarButtonsToRemove: ['lasso2d', 'select2d'],
              toImageButtonOptions: {
                format: 'png',
                filename: 'parallel_categories_diagram',
                height: 500,
                width: 850,
                scale: 2
              }
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      ) : (
        <div className="parallel-error">
          <p>Error loading the Parallel Categories diagram. Please try again later.</p>
        </div>
      )}
    </div>
  );
}
