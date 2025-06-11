import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Plot from "react-plotly.js";
import "./topcitybar.css"; // Import the new CSS file

export default function TopCityPremiumBar() {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/data-given.xlsx")
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        const cityTotals = {};

        json.forEach(row => {
          const city = row["CORRESPONDENCECITY"];
          const premium = parseFloat(row["Premium"]?.toString().replace(/[^\d.]/g, "")) || 0;
          if (!city) return;
          cityTotals[city] = (cityTotals[city] || 0) + premium;
        });

        const sorted = Object.entries(cityTotals)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);

        setChartData({
          x: sorted.map(([city]) => city),
          y: sorted.map(([_, total]) => total)
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading or processing data:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="top-city-bar-container">
      <div className="top-city-bar-header">
        <h2>Top 10 Cities by Premium (Bar Chart)</h2>
        <p className="top-city-bar-subtitle">Visualizing the cities with the highest premium amounts</p>
      </div>
      {loading ? (
        <div className="top-city-bar-loading">
          <div className="loading-spinner"></div>
          <p>Loading bar chart...</p>
        </div>
      ) : chartData.x && chartData.x.length > 0 ? (
        <div className="top-city-bar-chart-wrapper">
          <Plot
            data={[
              {
                type: "bar",
                x: chartData.x,
                y: chartData.y,
                marker: { 
                  color: "#1976d2", // Blue color for bars
                  line: { width: 1, color: "#e3f2fd" } // Light border for bars
                },
                hovertemplate:
                  "City: <b>%{x}</b><br>" +
                  "Total Premium: <b>₹%{y:,.0f}</b><extra></extra>"
              }
            ]}
            layout={{
              xaxis: { 
                title: "City",
                showgrid: true, 
                zeroline: false,
                tickangle: 45,
                automargin: true
              },
              yaxis: { 
                title: "Total Premium",
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
                filename: 'top_cities_premium',
                height: 450,
                width: 800,
                scale: 2
              }
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      ) : (
        <div className="top-city-bar-error">
          <p>No city premium data available or error loading the bar chart.</p>
        </div>
      )}
    </div>
  );
}
