import { LineChart } from '../components/LineChart';
import { ScatterPlot } from '../components/ScatterPlot';
import { BarChart } from '../components/BarChart';
import { PieChart } from '../components/PieChart';
import { IntradayChart } from '../components/IntradayChart';
import { CorrelationMatrix } from '../components/CorrelationMatrix';
import { SentimentTimeline } from '../components/SentimentTimeline';
import { MovingAverages } from '../components/MovingAverages';
import { TopMovers } from '../components/TopMovers';
import { stockData } from '../data/stockData';
import { 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Brain,
  CandlestickChart,
  Network,
  LineChart as LineChartIcon,
  ArrowUpDown
} from 'lucide-react';
import Navbar from '../components/Navbar';

function VisualizationPage() {
  return (
    <div className="min-h-screen text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-20">
        <h1 className="text-4xl font-bold mb-2">Today's Stock Market</h1>
        <p className="text-gray-400 mb-8">Real-time insights and analysis of market performance</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Market Overview */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-semibold">Stock Market Overview</h2>
            </div>
            <p className="text-gray-400 mb-4">Historical performance of top stocks over the past week</p>
            <LineChart data={stockData} />
          </div>

          {/* Intraday Chart */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <CandlestickChart className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-semibold">Intraday Performance</h2>
            </div>
            <p className="text-gray-400 mb-4">High/Low price ranges for selected stock</p>
            <IntradayChart data={stockData} />
          </div>

          {/* Scatter Plot */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <CandlestickChart className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-semibold">Sentiment Analysis</h2>
            </div>
            <p className="text-gray-400 mb-4">High/Low price ranges for selected stock</p>
            <ScatterPlot data={stockData} />
          </div>

          {/* Correlation Matrix */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Network className="w-6 h-6 text-pink-400" />
              <h2 className="text-2xl font-semibold">Stock Correlation Matrix</h2>
            </div>
            <p className="text-gray-400 mb-4">Price correlation between different stocks</p>
            <CorrelationMatrix data={stockData} />
          </div>

          {/* Sentiment Timeline */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-semibold">Sentiment Evolution</h2>
            </div>
            <p className="text-gray-400 mb-4">Sector-wise sentiment trends over time</p>
            <SentimentTimeline data={stockData} />
          </div>

          {/* Moving Averages */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <LineChartIcon className="w-6 h-6 text-orange-400" />
              <h2 className="text-2xl font-semibold">Moving Averages</h2>
            </div>
            <p className="text-gray-400 mb-4">7-day and 30-day moving averages comparison</p>
            <MovingAverages data={stockData} />
          </div>

          {/* Top Movers */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <ArrowUpDown className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-semibold">Top Gainers & Losers</h2>
            </div>
            <p className="text-gray-400 mb-4">Best and worst performing stocks today</p>
            <TopMovers data={stockData} />
          </div>

          {/* Category Performance */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-semibold">Category Performance</h2>
            </div>
            <p className="text-gray-400 mb-4">Average performance across different market sectors</p>
            <BarChart data={stockData} />
          </div>

          {/* Market Distribution */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-semibold">Market Distribution</h2>
            </div>
            <div className="grid grid-cols-1 gap-8">
              <div>
                <p className="text-gray-400 mb-4 text-center text-lg">Volume by Sector (in millions)</p>
                <PieChart data={stockData} type="volume" />
              </div>
              <div>
                <p className="text-gray-400 mb-4 text-center text-lg">News Sentiment Distribution</p>
                <PieChart data={stockData} type="sentiment" />
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-gray-400 border-t border-gray-800 pt-4">
          <p>Data compiled from real-time stock APIs and news analysis tools</p>
          <p className="text-sm mt-2">Last updated: {new Date().toLocaleString()}</p>
        </footer>
      </div>
    </div>
  );
}

export default VisualizationPage;
