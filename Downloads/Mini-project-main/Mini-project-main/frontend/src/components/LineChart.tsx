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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  data: StockData[];
}

export function LineChart({ data }: LineChartProps) {
  const chartData = {
    labels: data[0].dates,
    datasets: data.map((stock) => ({
      label: stock.symbol,
      data: stock.historicalPrices,
      borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
      tension: 0.4,
    })),
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

  return <Line options={options} data={chartData} />;
}