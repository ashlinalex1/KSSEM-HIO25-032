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

interface SentimentTimelineProps {
  data: StockData[];
}

export function SentimentTimeline({ data }: SentimentTimelineProps) {
  const categories = Array.from(new Set(data.map(stock => stock.category)));
  
  const chartData = {
    labels: data[0].sentimentHistory.map(h => h.date),
    datasets: categories.map(category => ({
      label: category,
      data: data[0].sentimentHistory.map((_, i) => {
        const categoryStocks = data.filter(stock => stock.category === category);
        const avgSentiment = categoryStocks.reduce((acc, stock) => 
          acc + stock.sentimentHistory[i].score, 0
        ) / categoryStocks.length;
        return avgSentiment;
      }),
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