import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Plot from "react-plotly.js";

export default function OccupationFraudTreemap() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetch("/data-given.xlsx")
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        const hierarchy = {};
        const occupationTotals = {};

        json.forEach(row => {
          const occupation = row["OCCUPATION"];
          const fraud = row["Fraud Category"];
          const premium = parseFloat(
            row["Premium"]?.toString().replace(/[^\d.]/g, "")
          ) || 0;

          if (!occupation || !fraud) return;

          if (!hierarchy[occupation]) hierarchy[occupation] = {};
          hierarchy[occupation][fraud] = (hierarchy[occupation][fraud] || 0) + premium;
          occupationTotals[occupation] = (occupationTotals[occupation] || 0) + premium;
        });

        const labels = ["Total"];
        const parents = [""];
        const values = [Object.values(occupationTotals).reduce((a, b) => a + b, 0)];

        Object.entries(hierarchy).forEach(([occupation, frauds]) => {
          labels.push(occupation);
          parents.push("Total");
          values.push(occupationTotals[occupation]);

          Object.entries(frauds).forEach(([fraud, premium]) => {
            labels.push(fraud);
            parents.push(occupation);
            values.push(premium);
          });
        });

        setChartData([
          {
            type: "treemap",
            labels,
            parents,
            values,
            textinfo: "label+value",
            hovertemplate: "<b>%{label}</b><br>Premium: %{value:,.0f}<br>Percentage: %{percentParent:.1%}<extra></extra>",
            marker: {
              colorscale: [
                [0, '#1976d2'],    // Dark blue for total
                [0.2, '#2196f3'],  // Blue for occupations
                [0.4, '#42a5f5'],  // Medium blue
                [0.6, '#2ecc71'],  // Teal
                [0.8, '#43a047'],  // Dark teal
                [1, '#66bb6a']     // Green for fraud categories
              ],
              line: { width: 2, color: '#eceff1' } // Light border
            },
            textfont: {
              size: 14,
              color: '#2c3e50',
              family: 'Inter, sans-serif'
            },
            textposition: "middle center",
            hoverlabel: {
              bgcolor: '#eceff1',
              bordercolor: '#90a4ae',
              font: { size: 14, color: '#263238', family: 'Inter, sans-serif' }
            },
            hoveron: "all",
            hovermode: "closest",
            hoverdistance: 100,
            hoverongaps: false,
            texttemplate: "%{label}<br>%{value:,.0f}"
          }
        ]);
      })
      .catch(err => {
        console.error("Error loading or processing data:", err);
      });
  }, []);

  return (
    <div className="treemap-container">
      <div className="treemap-header">
        <h2>Occupation → Fraud Category (Treemap)</h2>
        <p className="treemap-subtitle">Analyzing fraud distribution across different occupations</p>
      </div>
      {chartData.length > 0 ? (
        <div className="treemap-chart-wrapper">
          <Plot
            data={chartData}
            layout={{
              width: null, // Make responsive
              height: 700,
              margin: { t: 40, l: 0, r: 0, b: 0 },
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              hovermode: "closest",
              hoverdistance: 100,
              autosize: true,
              font: {
                family: 'Inter, sans-serif',
                size: 14,
                color: '#2c3e50'
              }
            }}
            config={{ 
              responsive: true,
              displayModeBar: true,
              displaylogo: false,
              modeBarButtonsToRemove: ['lasso2d', 'select2d'],
              toImageButtonOptions: {
                format: 'png',
                filename: 'treemap_diagram',
                height: 700,
                width: 850,
                scale: 2
              }
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      ) : (
        <p>Loading interactive chart...</p>
      )}
    </div>
  );
}
