import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Plot from "react-plotly.js";

export default function PremiumMaritalFraudParallel() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
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
            values: filtered.map(r => modeMap[r.mode])
          },
          {
            label: "Marital Status",
            tickvals: Object.values(maritalMap),
            ticktext: Object.keys(maritalMap),
            values: filtered.map(r => maritalMap[r.marital])
          },
          {
            label: "Fraud Category",
            tickvals: Object.values(fraudMap),
            ticktext: Object.keys(fraudMap),
            values: filtered.map(r => fraudMap[r.fraud])
          }
        ];

        setChartData([
          {
            type: "parcats",
            dimensions,
            line: {
              color: "blue"
            },
            hoveron: "color",
            labelfont: { size: 12 },
            tickfont: { size: 10 },
            arrangement: "freeform"
          }
        ]);
      });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        🪢 Parallel Categories: Payment Mode → Marital → Fraud
      </h2>
      {chartData.length > 0 ? (
        <Plot
          data={chartData}
          layout={{
            margin: { t: 30, l: 50, r: 50, b: 30 },
            width: 850,
            height: 500
          }}
        />
      ) : (
        <p>Loading parallel categories...</p>
      )}
    </div>
  );
}
