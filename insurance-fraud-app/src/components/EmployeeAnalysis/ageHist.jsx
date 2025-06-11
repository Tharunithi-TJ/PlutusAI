import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Plot from "react-plotly.js";
import "./ageHist.css"; // Import the new CSS file

export default function AgeHistogram() {
  const [ages, setAges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/data-given.xlsx")
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        const ageData = json.map(row => parseInt(row["ASSURED_AGE"]))
                            .filter(age => !isNaN(age)); // Filter out invalid ages
        setAges(ageData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading or processing data:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="age-histogram-container">
      <div className="age-histogram-header">
        <h2>Assured Age Distribution (Histogram)</h2>
        <p className="age-histogram-subtitle">Analyzing the distribution of assured ages in the dataset</p>
      </div>
      {loading ? (
        <div className="age-histogram-loading">
          <div className="loading-spinner"></div>
          <p>Loading age histogram...</p>
        </div>
      ) : ages.length > 0 ? (
        <div className="age-histogram-chart-wrapper">
          <Plot
            data={[
              {
                type: "histogram",
                x: ages,
                marker: { 
                  color: "#1976d2", // Blue color for bars
                  line: { width: 1, color: "#e3f2fd" } // Light border for bars
                },
                autobinx: false,
                xbins: { start: 0, end: 100, size: 5 }, // Define bins for age ranges
                hovertemplate: 
                  "Age: <b>%{x}</b><br>" +
                  "Count: <b>%{y}</b><extra></extra>"
              }
            ]}
            layout={{
              bargap: 0.05,
              xaxis: { 
                title: "Age",
                showgrid: true, 
                zeroline: false,
                tickangle: 45,
                automargin: true
              },
              yaxis: { 
                title: "Count",
                showgrid: true, 
                zeroline: false,
                automargin: true
              },
              width: null, // Make responsive
              height: 450,
              margin: { t: 40, b: 80, l: 60, r: 20 },
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { 
                family: 'Inter, sans-serif',
                size: 14,
                color: '#2c3e50'
              },
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
                filename: 'age_histogram',
                height: 450,
                width: 700,
                scale: 2
              }
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      ) : (
        <div className="age-histogram-error">
          <p>No age data available or error loading the histogram.</p>
        </div>
      )}
    </div>
  );
}
