import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Plot from "react-plotly.js";

export default function AgeHistogram() {
  const [ages, setAges] = useState([]);

  useEffect(() => {
    fetch("/data-given.xlsx")
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        const ageData = json.map(row => parseInt(row["ASSURED_AGE"])).filter(Boolean);
        setAges(ageData);
      });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">📊 Assured Age Distribution</h2>
      <Plot
        data={[{ type: "histogram", x: ages, marker: { color: "#636EFA" } }]}
        layout={{ bargap: 0.05, xaxis: { title: "Age" }, yaxis: { title: "Count" }, width: 700, height: 400 }}
      />
    </div>
  );
}
