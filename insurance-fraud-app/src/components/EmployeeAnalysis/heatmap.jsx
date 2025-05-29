import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Plot from "react-plotly.js";
import * as math from "mathjs";

export default function NumericCorrelationHeatmap() {
  const [plotData, setPlotData] = useState(null);
  const [annotations, setAnnotations] = useState([]);

  useEffect(() => {
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
            const meanX = math.mean(xi);
            const meanY = math.mean(xj);
            const cov = math.mean(xi.map((x, k) => (x - meanX) * (xj[k] - meanY)));
            const stdX = math.std(xi);
            const stdY = math.std(xj);
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
                color: Math.abs(corrMatrix[i][j]) > 0.5 ? "white" : "black",
                size: 14,
                family: "Arial"
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
          colorscale: "YlGnBu",
          zmin: -1,
          zmax: 1,
          colorbar: { title: "Correlation" }
        });
      });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🔥 Correlation Heatmap with Annotations</h2>
      {plotData ? (
        <Plot
          data={[plotData]}
          layout={{
            width: 800,
            height: 800,
            margin: { t: 80, b: 80, l: 80, r: 80 },
            annotations,
            xaxis: {
              title: "Fields",
              side: "top",
              
              tickfont: { size: 14 }
            },
            yaxis: {
              title: "Fields",
              autorange: "reversed",
              tickangle: -90,
              tickfont: { size: 14 }
            },
            font: { family: "Arial", size: 14 }
          }}
          config={{ responsive: true }}
        />
      ) : (
        <p>Loading heatmap...</p>
      )}
    </div>
  );
}
