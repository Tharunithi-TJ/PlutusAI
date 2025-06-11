import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Plot from "react-plotly.js";
import "./SunburstChart.css";

export default function SunburstChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/data-given.xlsx")
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);

        const hierarchy = {};
        const productTotals = {};
        const channelTotals = {};

        json.forEach((row) => {
          const product = row["Product Type"];
          const channel = row["CHANNEL"];
          const fraud = row["Fraud Category"];
          const premium = parseFloat(row["Premium"]?.toString().replace(/[^\d.]/g, "")) || 0;

          if (!product || !channel || !fraud) return;

          if (!hierarchy[product]) hierarchy[product] = {};
          if (!hierarchy[product][channel]) hierarchy[product][channel] = {};
          hierarchy[product][channel][fraud] = (hierarchy[product][channel][fraud] || 0) + premium;

          const channelKey = `${product}|${channel}`;
          channelTotals[channelKey] = (channelTotals[channelKey] || 0) + premium;
          productTotals[product] = (productTotals[product] || 0) + premium;
        });

        const labels = [];
        const parents = [];
        const values = [];
        const ids = [];
        const colors = []; // To store specific colors for each slice

        const productColors = ['#b71c1c', '#d32f2f', '#f44336']; // Elegant Reds
        const channelColors = ['#fbc02d', '#fdd835', '#ffeb3b']; // Elegant Yellows
        const fraudColors = ['#1a237e', '#283593', '#3949ab']; // Elegant Blues (formerly Browns)

        const assignColor = (level, index, totalChildren) => {
          let colorPalette;
          if (level === 0) colorPalette = productColors; // Products
          else if (level === 1) colorPalette = channelColors; // Channels
          else colorPalette = fraudColors; // Frauds
          
          // Distribute colors across the children for a gradient effect
          const colorIndex = Math.min(index, colorPalette.length - 1);
          return colorPalette[colorIndex];
        };

        let productIndex = 0;
        Object.keys(hierarchy).forEach((product) => {
          const productId = `Product-${product}`;
          labels.push(product);
          parents.push("");
          ids.push(productId);
          values.push(productTotals[product]);
          colors.push(assignColor(0, productIndex, Object.keys(hierarchy).length));
          productIndex++;

          let channelIndex = 0;
          Object.keys(hierarchy[product]).forEach((channel) => {
            const channelId = `${productId}|Channel-${channel}`;
            const channelKey = `${product}|${channel}`;

            labels.push(channel);
            parents.push(productId);
            ids.push(channelId);
            values.push(channelTotals[channelKey]);
            colors.push(assignColor(1, channelIndex, Object.keys(hierarchy[product]).length));
            channelIndex++;

            let fraudIndex = 0;
            Object.keys(hierarchy[product][channel]).forEach((fraud) => {
              const fraudId = `${channelId}|Fraud-${fraud}`;
              labels.push(fraud);
              parents.push(channelId);
              ids.push(fraudId);
              values.push(hierarchy[product][channel][fraud]);
              colors.push(assignColor(2, fraudIndex, Object.keys(hierarchy[product][channel]).length));
              fraudIndex++;
            });
          });
        });

        setChartData([
          {
            type: "sunburst",
            ids,
            labels,
            parents,
            values,
            branchvalues: "total",
            maxdepth: 3,
            outsidetextfont: { size: 12, color: "#424242" }, // Darker grey for readability
            marker: {
              colors: colors, // Use the dynamically assigned colors
              line: { width: 1.5, color: "#eceff1" } // Thicker, light border between segments
            },
            hoverinfo: "label+value+percentParent",
            hovertemplate:
              "<b>%{label}</b><br>" +
              "Premium: <b>₹%{value:,.0f}</b><br>" +
              "Percentage: <b>%{percentParent:.1%}</b><extra></extra>"
          },
        ]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading Excel file:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="sunburst-container">
      <div className="sunburst-header">
        <h2>Sunburst: <span className="sunburst-product-text">Product</span> &gt; <span className="sunburst-channel-text">Channel</span> &gt; <span className="sunburst-fraud-text">Fraud</span></h2>
        <p className="sunburst-subtitle">Hierarchical visualization of fraud data across product and channel types</p>
      </div>
      {loading ? (
        <div className="sunburst-loading">
          <div className="loading-spinner"></div>
          <p>Loading Sunburst chart...</p>
        </div>
      ) : chartData.length > 0 ? (
        <div className="sunburst-chart-wrapper">
          <Plot
            data={chartData}
            layout={{
              margin: { t: 40, l: 0, r: 0, b: 0 },
              width: null, // Allow responsiveness
              height: 600,
              // sunburstcolorway is replaced by dynamic `marker.colors`
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { 
                family: 'Inter, sans-serif',
                size: 14,
                color: '#424242' // Darker grey for overall text
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
                filename: 'sunburst_diagram',
                height: 600,
                width: 700,
                scale: 2
              }
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      ) : (
        <div className="sunburst-error">
          <p>Error loading the Sunburst chart. Please try again later.</p>
        </div>
      )}
    </div>
  );
}
