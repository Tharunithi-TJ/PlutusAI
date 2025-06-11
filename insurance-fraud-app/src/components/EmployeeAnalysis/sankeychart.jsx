import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Plot from "react-plotly.js";
import "./sankeychart.css";

export default function SankeyChart() {
  const [sankeyData, setSankeyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/data-given.xlsx")
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        const flows = {};
        const labelsSet = new Set();

        json.forEach(row => {
          const channel = row["CHANNEL"];
          const product = row["Product Type"];
          const fraud = row["Fraud Category"];
          const premium = parseFloat(row["Premium"]?.toString().replace(/[^\d.]/g, "")) || 0;

          if (!channel || !product || !fraud) return;

          labelsSet.add(channel);
          labelsSet.add(product);
          labelsSet.add(fraud);

          const step1 = `${channel}|${product}`;
          const step2 = `${product}|${fraud}`;

          flows[step1] = (flows[step1] || 0) + premium;
          flows[step2] = (flows[step2] || 0) + premium;
        });

        const labels = Array.from(labelsSet);
        const labelIndex = label => labels.indexOf(label);

        const source = [];
        const target = [];
        const values = [];

        Object.entries(flows).forEach(([key, val]) => {
          const [src, tgt] = key.split("|");
          source.push(labelIndex(src));
          target.push(labelIndex(tgt));
          values.push(val);
        });

        // Generate colors for nodes
        const nodeColors = labels.map((label, index) => {
          // Determine which category the label belongs to based on the current data structure
          // For a more robust solution, consider adding a category property to your data or a mapping
          if (labels.indexOf(label) < labels.length / 3) {
            // Channel nodes
            return '#42a5f5'; // A vibrant but professional blue
          } else if (labels.indexOf(label) < (labels.length * 2) / 3) {
            // Product nodes
            return '#66bb6a'; // A clear, professional green
          } else {
            // Fraud nodes
            return '#ef5350'; // A distinct, warning red
          }
        });

        // Generate colors for links with a subtle gradient effect
        const linkColors = source.map((src, index) => {
          const srcColor = nodeColors[src];
          const tgtColor = nodeColors[target[index]];

          // Create a subtle gradient for links, blending source and target colors
          // Using a slight transparency for better flow visualization
          return `rgba(${parseInt(srcColor.slice(1, 3), 16)}, ${parseInt(srcColor.slice(3, 5), 16)}, ${parseInt(srcColor.slice(5, 7), 16)}, 0.4)`;
        });

        setSankeyData({
          type: "sankey",
          orientation: "h",
          node: {
            pad: 20,
            thickness: 30,
            line: { color: "rgba(0,0,0,0.3)", width: 1.5 }, // Slightly thicker, darker border
            label: labels,
            color: nodeColors,
            hoverlabel: {
              bgcolor: "#eceff1", // Light grey background for hover
              bordercolor: "#90a4ae", // Subtle border color
              font: { size: 14, color: "#263238" } // Darker text for readability
            }
          },
          link: {
            source,
            target,
            value: values,
            color: linkColors,
            hovertemplate:
              "<b>%{source.label}</b> → <b>%{target.label}</b><br>" +
              "Premium: <b>₹%{value:,.0f}</b><extra></extra>",
            hoverlabel: {
              bgcolor: "#eceff1",
              bordercolor: "#90a4ae",
              font: { size: 14, color: "#263238" }
            }
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
    <div className="sankey-container">
      <div className="sankey-header">
        <h2>
          <span className="sankey-part-1">Sankey: Channel</span>
          <span className="sankey-arrow"> → </span>
          <span className="sankey-part-2">Product Type</span>
          <span className="sankey-arrow"> → </span>
          <span className="sankey-part-3">Fraud Category</span>
        </h2>
        <p className="sankey-subtitle">Visualizing the relationship between channels, products, and fraud categories</p>
      </div>
      
      {loading ? (
        <div className="sankey-loading">
          <div className="loading-spinner"></div>
          <p>Loading Sankey diagram...</p>
        </div>
      ) : sankeyData ? (
        <div className="sankey-chart">
          <Plot
            data={[sankeyData]}
            layout={{
              width: null,
              height: 600,
              font: { 
                family: 'Inter, sans-serif',
                size: 14,
                color: '#2c3e50'
              },
              margin: { t: 40, b: 20, l: 20, r: 20 },
              hovermode: "closest",
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              autosize: true,
              showlegend: false
            }}
            config={{ 
              responsive: true,
              displayModeBar: true,
              displaylogo: false,
              modeBarButtonsToRemove: ['lasso2d', 'select2d'],
              toImageButtonOptions: {
                format: 'png',
                filename: 'sankey_diagram',
                height: 600,
                width: 1000,
                scale: 2
              }
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      ) : (
        <div className="sankey-error">
          <p>Error loading the Sankey diagram. Please try again later.</p>
        </div>
      )}
    </div>
  );
}
