import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import useStockStore from "../stores/useStockStore";

const StockGraph = () => {
  const [graphData, setGraphData] = useState<{ date: string; close: number }[]>([]);
  const { stockData } = useStockStore();
  useEffect(() => {
    setGraphData(stockData || []);
  }, [stockData]);
// 
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={graphData}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
        <Tooltip />
        { console.log(graphData) }
        <Line type="monotone" dataKey="close" stroke="#8884d8" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default StockGraph;

