// GraphRack.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Plot from "react-plotly.js";

function GraphRack() {
  const [navData, setNavData] = useState([]);
  const [sentimentData, setSentimentData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/graphdata").then((res) => {
      setNavData(res.data.nav_data);
      setSentimentData(res.data.sentiment_data);
    });
  }, []);

  return (
    <div>
      <h2>📈 Fund NAV Over Time</h2>
      <Plot
        data={[
          {
            x: navData.map(d => d.date),
            y: navData.map(d => d.nav),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'NAV'
          }
        ]}
        layout={{ width: 800, height: 400, title: 'Fund NAV' }}
      />

      <h2>🔴 Negative News Volume</h2>
      <Plot
        data={[
          {
            x: navData.map(d => d.date),
            y: navData.map(d => d.negative_count),
            type: 'bar',
            name: 'Negative News'
          }
        ]}
        layout={{ width: 800, height: 400, title: 'Negative News Count' }}
      />
    </div>
  );
}

export default GraphRack;