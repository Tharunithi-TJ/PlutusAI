import React, { useState } from "react";
import OccupationFraudTreemap from "./OccupationFraudSunburst";
import PremiumMaritalFraudParallel from "./PremiumMaritalFraudParallel";
import SankeyChart from "./sankeychart";
import AgeHistogram from "./ageHist";
import TopCityPremiumBar from "./topcitybar";
import NumericCorrelationHeatmap from "./heatmap";
import SunburstChart from "./SunburstChart"; 
import Chatbot from "../Chatbot";
import '../Analytics.css';


const chartOptions = [
  { key: "sunburst", label: "Product > Channel > Fraud Sunburst" },
  { key: "occupation", label: "Occupation vs Fraud Treemap" },
  { key: "parallel", label: "Premium & Marital vs Fraud Parallel" },
  { key: "sankey", label: "Sankey: Flow of Fraud" },
  { key: "age", label: "Age Distribution Histogram" },
  { key: "topcity", label: "Top Cities by Premium Bar" },
  { key: "heatmap", label: "Numeric Correlation Heatmap" },
];

export default function EmployeeAnalytics() {
  const [selectedChart, setSelectedChart] = useState("sunburst");

  const renderChart = () => {
    switch (selectedChart) {
      case "sunburst":
        return <SunburstChart />;
      case "occupation":
        return <OccupationFraudTreemap />;
      case "parallel":
        return <PremiumMaritalFraudParallel />;
      case "sankey":
        return <SankeyChart />;
      case "age":
        return <AgeHistogram />;
      case "topcity":
        return <TopCityPremiumBar />;
      case "heatmap":
        return <NumericCorrelationHeatmap />;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Side Menu */}
      <div className="linked-sidebar">
        <h2>Charts</h2>
        {chartOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => setSelectedChart(option.key)}
            className={`linked-sidebar-btn${selectedChart === option.key ? " active" : ""}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Chart Display Area */}
      <div style={{ flex: 1, padding: 20 }}>{renderChart()}</div>

      <Chatbot />
    </div>
  );
}
