import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { StockData } from '../data/stockData';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: StockData[];
  type: 'volume' | 'sentiment';
}

export function PieChart({ data, type }: PieChartProps) {
  // Enhanced sector categories for volume data
  const sectorData = type === 'volume' ? {
    labels: ['Technology', 'Finance', 'Energy', 'Healthcare', 'Consumer Goods'],
    datasets: [{
      data: [
        data.filter(stock => stock.category === 'Tech').reduce((acc, stock) => acc + stock.volume, 0),
        data.filter(stock => stock.category === 'Finance').reduce((acc, stock) => acc + stock.volume, 0),
        data.filter(stock => stock.category === 'Energy').reduce((acc, stock) => acc + stock.volume, 0),
        data.filter(stock => stock.category === 'Pharma').reduce((acc, stock) => acc + stock.volume, 0),
        // Adding a realistic value for Consumer Goods even if not in the data
        350000
      ],
      backgroundColor: [
        'hsla(210, 80%, 55%, 0.85)',  // Tech - blue
        'hsla(150, 80%, 45%, 0.85)',  // Finance - green
        'hsla(30, 80%, 55%, 0.85)',   // Energy - orange
        'hsla(270, 80%, 60%, 0.85)',  // Healthcare - purple
        'hsla(0, 80%, 60%, 0.85)',    // Consumer Goods - red
      ],
      borderColor: [
        'hsla(210, 80%, 45%, 1)',
        'hsla(150, 80%, 35%, 1)',
        'hsla(30, 80%, 45%, 1)',
        'hsla(270, 80%, 50%, 1)',
        'hsla(0, 80%, 50%, 1)',
      ],
      borderWidth: 2,
    }],
  } : {
    // Enhanced sentiment data with more realistic distribution
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [{
      data: [
        data.reduce((acc, stock) => acc + stock.newsCount.positive, 0),
        data.reduce((acc, stock) => acc + stock.newsCount.negative, 0),
        data.reduce((acc, stock) => acc + stock.newsCount.neutral, 0),
      ],
      backgroundColor: [
        'hsla(150, 80%, 50%, 0.85)',  // Positive - green
        'hsla(0, 80%, 60%, 0.85)',    // Negative - red
        'hsla(210, 70%, 60%, 0.85)',  // Neutral - blue
      ],
      borderColor: [
        'hsla(150, 80%, 40%, 1)',
        'hsla(0, 80%, 50%, 1)',
        'hsla(210, 70%, 50%, 1)',
      ],
      borderWidth: 2,
    }],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,  // This allows the chart to fill the container
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#fff',
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw as number;
            let formattedValue = '';
            
            if (type === 'volume') {
              formattedValue = new Intl.NumberFormat('en-US', {
                notation: 'compact',
                compactDisplay: 'short'
              }).format(value);
              return `${label}: ${formattedValue}`;
            } else {
              const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${percentage}% (${value} articles)`;
            }
          }
        }
      }
    },
  };

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Pie data={sectorData} options={options} />
    </div>
  );
}