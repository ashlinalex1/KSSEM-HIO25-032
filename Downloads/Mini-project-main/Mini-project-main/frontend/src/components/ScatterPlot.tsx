import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { StockData } from '../data/stockData';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface ScatterPlotProps {
  data: StockData[];
}

export function ScatterPlot({ data }: ScatterPlotProps) {
  const chartData = {
    datasets: [{
      label: 'Sentiment vs Price Change',
      data: data.map((stock) => ({
        x: stock.sentiment,
        y: stock.priceChange,
      })),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }],
  };

  const options: ChartOptions<'scatter'> = {
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
        title: {
          display: true,
          text: 'Price Change (%)',
          color: '#fff',
        },
        grid: {
          color: '#2d374850',
        },
        ticks: {
          color: '#fff',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Sentiment Score',
          color: '#fff',
        },
        grid: {
          color: '#2d374850',
        },
        ticks: {
          color: '#fff',
        },
      },
    },
  };

  return <Scatter options={options} data={chartData} />;
}