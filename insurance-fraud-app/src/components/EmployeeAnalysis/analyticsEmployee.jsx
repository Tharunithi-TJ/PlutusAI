import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Plot from "react-plotly.js";
import OccupationFraudTreemap from "./OccupationFraudSunburst";
import PremiumMaritalFraudParallel from "./PremiumMaritalFraudParallel";
import SankeyChart from "./sankeychart";
import AgeHistogram from "./ageHist";
import TopCityPremiumBar from "./topcitybar";
import NumericCorrelationHeatmap from "./heatmap";

export default function EmployeeAnalytics() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetch("/data-given.xlsx")
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);

        // Process the data and build the hierarchy
        const hierarchy = {};
        const productTotals = {};
        const channelTotals = {};

        json.forEach((row) => {
          const product = row["Product Type"];
          const channel = row["CHANNEL"];
          const fraud = row["Fraud Category"];
          const premium = parseFloat(row["Premium"]?.toString().replace(/[^\d.]/g, "")) || 0;

          if (!product || !channel || !fraud) return;

          // Initialize if not exists
          if (!hierarchy[product]) hierarchy[product] = {};
          if (!hierarchy[product][channel]) hierarchy[product][channel] = {};
          
          // Sum fraud category values
          hierarchy[product][channel][fraud] = (hierarchy[product][channel][fraud] || 0) + premium;
          
          // Sum channel totals
          const channelKey = `${product}|${channel}`;
          channelTotals[channelKey] = (channelTotals[channelKey] || 0) + premium;
          
          // Sum product totals
          productTotals[product] = (productTotals[product] || 0) + premium;
        });

        // Prepare data for sunburst chart
        const labels = [];
        const parents = [];
        const values = [];
        const ids = [];

        // Add products
        Object.keys(hierarchy).forEach((product) => {
          const productId = `Product-${product}`;
          labels.push(product);
          parents.push("");
          ids.push(productId);
          values.push(productTotals[product]);
        });

        // Add channels
        Object.keys(hierarchy).forEach((product) => {
          const productId = `Product-${product}`;
          
          Object.keys(hierarchy[product]).forEach((channel) => {
            const channelId = `${productId}|Channel-${channel}`;
            const channelKey = `${product}|${channel}`;
            
            labels.push(channel);
            parents.push(productId);
            ids.push(channelId);
            values.push(channelTotals[channelKey]);
          });
        });

        // Add fraud categories
        Object.keys(hierarchy).forEach((product) => {
          const productId = `Product-${product}`;
          
          Object.keys(hierarchy[product]).forEach((channel) => {
            const channelId = `${productId}|Channel-${channel}`;
            
            Object.keys(hierarchy[product][channel]).forEach((fraud) => {
              const fraudId = `${channelId}|Fraud-${fraud}`;
              
              labels.push(fraud);
              parents.push(channelId);
              ids.push(fraudId);
              values.push(hierarchy[product][channel][fraud]);
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
            outsidetextfont: { size: 14, color: "#377eb8" },
            marker: { line: { width: 1 } },
          },
        ]);
      })
      .catch((err) => {
        console.error("Error loading Excel file:", err);
      });
  }, []);

  return (
    <>
      <div style={{ padding: 20 }}>
        <h2>Sunburst: Product {'>'} Channel {'>'} Fraud</h2>
        {chartData.length > 0 ? (
          <Plot
            data={chartData}
            layout={{
              margin: { t: 30, l: 0, r: 0, b: 0 },
              width: 700,
              height: 600,
              sunburstcolorway: ["#636efa", "#ef553b", "#00cc96", "#ab63fa"],
              extendsunburstcolorway: true,
            }}
            config={{ responsive: true }}
          />
        ) : (
          <p>Loading chart...</p>
        )}
      </div>

      <OccupationFraudTreemap />
      <PremiumMaritalFraudParallel />
      <SankeyChart />
      <AgeHistogram />
      <TopCityPremiumBar />
      <NumericCorrelationHeatmap />
    </>
    
  );
}