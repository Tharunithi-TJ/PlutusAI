import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Plot from "react-plotly.js";

export default function TopCityPremiumBar() {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
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
      });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">🏙️ Top 10 Cities by Premium</h2>
      <Plot
        data={[
          {
            type: "bar",
            x: chartData.x,
            y: chartData.y,
            marker: { color: "#00CC96" }
          }
        ]}
        layout={{ xaxis: { title: "City" }, yaxis: { title: "Total Premium" }, width: 800, height: 400 }}
      />
    </div>
  );
}
