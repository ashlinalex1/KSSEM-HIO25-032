import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { StockData } from '../data/stockData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: StockData[];
}

export function BarChart({ data }: BarChartProps) {
  const categories = Array.from(new Set(data.map(stock => stock.category)));
  const averagePerformance = categories.map(category => {
    const categoryStocks = data.filter(stock => stock.category === category);
    const avgChange = categoryStocks.reduce((acc, stock) => acc + stock.priceChange, 0) / categoryStocks.length;
    return avgChange;
  });

  const chartData = {
    labels: categories,
    datasets: [{
      label: 'Average Performance by Category',
      data: averagePerformance,
      backgroundColor: categories.map(() => `hsla(${Math.random() * 360}, 70%, 50%, 0.8)`),
    }],
  };

  const options: ChartOptions<'bar'> = {
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

  return <Bar options={options} data={chartData} />;
}