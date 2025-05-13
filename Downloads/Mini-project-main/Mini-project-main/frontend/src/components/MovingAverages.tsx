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
import { useState } from 'react';
import { StockData } from '../data/stockData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MovingAveragesProps {
  data: StockData[];
}

export function MovingAverages({ data }: MovingAveragesProps) {
  const [selectedStock, setSelectedStock] = useState(data[0].symbol);

  const stock = data.find(s => s.symbol === selectedStock)!;
  const chartData = {
    labels: stock.dates,
    datasets: [
      {
        label: 'Price',
        data: stock.historicalPrices,
        borderColor: 'rgba(255, 255, 255, 1)',
        tension: 0.4,
      },
      {
        label: '7-Day MA',
        data: stock.movingAverages.sevenDay,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
      },
      {
        label: '30-Day MA',
        data: stock.movingAverages.thirtyDay,
        borderColor: 'rgba(255, 99, 132, 1)',
        tension: 0.4,
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