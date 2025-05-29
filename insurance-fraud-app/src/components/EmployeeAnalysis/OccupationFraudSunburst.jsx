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
            textinfo: "label+value+percent parent",
            hovertemplate: "<b>%{label}</b><br>Premium: %{value}<extra></extra>",
            marker: {
              colorscale: "YlGnBu"
            }
          }
        ]);
      })
      .catch(err => {
        console.error("Error loading or processing data:", err);
      });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        🧩 Occupation → Fraud Category (Treemap)
      </h2>
      {chartData.length > 0 ? (
        <Plot
          data={chartData}
          layout={{
            width: 850,
            height: 700,
            margin: { t: 40, l: 0, r: 0, b: 0 }
          }}
          config={{ responsive: true }}
        />
      ) : (
        <p>Loading interactive chart...</p>
      )}
    </div>
  );
}
