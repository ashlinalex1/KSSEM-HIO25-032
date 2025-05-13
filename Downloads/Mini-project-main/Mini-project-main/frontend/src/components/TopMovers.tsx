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

interface TopMoversProps {
  data: StockData[];
}

export function TopMovers({ data }: TopMoversProps) {
  const sortedStocks = [...data].sort((a, b) => b.priceChange - a.priceChange);
  const gainers = sortedStocks.slice(0, 5);
  const losers = sortedStocks.slice(-5).reverse();

  const chartData = {
    labels: [...gainers, ...losers].map(stock => stock.symbol),
    datasets: [{
      label: 'Price Change (%)',
      data: [...gainers, ...losers].map(stock => stock.priceChange),
      backgroundColor: [...gainers, ...losers].map(stock => 
        stock.priceChange >= 0 ? 'rgba(75, 192, 192, 0.8)' : 'rgba(255, 99, 132, 0.8)'
      ),
    }],
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
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