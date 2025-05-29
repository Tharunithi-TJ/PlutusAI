import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Plot from "react-plotly.js";

export default function SankeyChart() {
  const [sankeyData, setSankeyData] = useState(null);

  useEffect(() => {
    fetch("/data-given.xlsx")
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        const flows = {}; // {source|target: total_value}
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

        setSankeyData({
          type: "sankey",
          orientation: "h",
          node: {
            pad: 15,
            thickness: 20,
            line: { color: "black", width: 0.5 },
            label: labels,
            color: "#8888ff"
          },
          link: {
            source,
            target,
            value: values,
            hovertemplate:
              "From %{source.label} to %{target.label}<br>Premium: %{value}<extra></extra>"
          }
        });
      })
      .catch(err => {
        console.error("Error loading or processing data:", err);
      });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        🔀 CHANNEL → Product Type → Fraud Category (Sankey)
      </h2>
      {sankeyData ? (
        <Plot
          data={[sankeyData]}
          layout={{
            width: 1000,
            height: 600,
            font: { size: 12 },
            margin: { t: 40, b: 20 },
            hovermode: "closest"
          }}
          config={{ responsive: true }}
        />
      ) : (
        <p>Loading Sankey diagram...</p>
      )}
    </div>
  );
}
