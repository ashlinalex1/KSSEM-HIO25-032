import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { StockData } from '../data/stockData';
import { useState } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface IntradayChartProps {
  data: StockData[];
}

export function IntradayChart({ data }: IntradayChartProps) {
  const [selectedStock, setSelectedStock] = useState(data[0].symbol);

  const stock = data.find(s => s.symbol === selectedStock)!;
  const chartData = {
    labels: stock.intraday.map((_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: 'High',
        data: stock.intraday.map(d => d.high),
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
      },
      {
        label: 'Low',
        data: stock.intraday.map(d => d.low),
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: false,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#fff',
        },
      },
    },
    scales: {
      y: {
        grid: {
          color: '#2d374850',
        },
        ticks: {
          color: '#fff',
        },
      },
      x: {
        grid: {
          color: '#2d374850',
        },
        ticks: {
          color: '#fff',
        },
      },
    },
  };

  return (
    <div>
      <select
        value={selectedStock}
        onChange={(e) => setSelectedStock(e.target.value)}
        className="mb-4 bg-gray-700 text-white rounded px-3 py-2"
      >
        {data.map(stock => (
          <option key={stock.symbol} value={stock.symbol}>
            {stock.symbol}
          </option>
        ))}
      </select>
      <Line options={options} data={chartData} />
    </div>
  );
}