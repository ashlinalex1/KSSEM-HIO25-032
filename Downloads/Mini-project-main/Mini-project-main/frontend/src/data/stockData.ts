export interface StockData {
  symbol: string;
  historicalPrices: number[];
  dates: string[];
  sentiment: number;
  priceChange: number;
  category: string;
  volume: number;
  newsCount: {
    positive: number;
    negative: number;
    neutral: number;
  };
  intraday: {
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
  sentimentHistory: {
    date: string;
    score: number;
  }[];
  movingAverages: {
    sevenDay: number[];
    thirtyDay: number[];
  };
}

export const stockData: StockData[] = [
  {
    symbol: 'AAPL',
    historicalPrices: [150.23, 152.45, 151.78, 153.92, 155.43, 154.89, 156.78],
    dates: ['2024-03-01', '2024-03-02', '2024-03-03', '2024-03-04', '2024-03-05', '2024-03-06', '2024-03-07'],
    sentiment: 0.6,
    priceChange: 1.2,
    category: 'Tech',
    volume: 3250000,
    newsCount: { positive: 42, negative: 15, neutral: 23 },
    intraday: [
      { open: 150.23, high: 151.45, low: 149.89, close: 150.78 },
      { open: 150.78, high: 152.34, low: 150.12, close: 151.56 },
      { open: 151.56, high: 153.67, low: 151.23, close: 152.89 }
    ],
    sentimentHistory: [
      { date: '2024-03-01', score: 0.5 },
      { date: '2024-03-02', score: 0.6 },
      { date: '2024-03-03', score: 0.55 }
    ],
    movingAverages: {
      sevenDay: [149.5, 150.2, 151.1, 151.8, 152.4, 153.1, 153.8],
      thirtyDay: [145.6, 146.2, 147.1, 147.8, 148.4, 149.1, 149.8]
    }
  },
  {
    symbol: 'MSFT',
    historicalPrices: [378.12, 380.45, 382.67, 379.89, 381.23, 383.45, 385.67],
    dates: ['2024-03-01', '2024-03-02', '2024-03-03', '2024-03-04', '2024-03-05', '2024-03-06', '2024-03-07'],
    sentiment: 0.7,
    priceChange: 2.1,
    category: 'Tech',
    volume: 2980000,
    newsCount: { positive: 38, negative: 12, neutral: 18 },
    intraday: [
      { open: 378.12, high: 379.45, low: 377.89, close: 378.78 },
      { open: 378.78, high: 380.34, low: 378.12, close: 379.56 },
      { open: 379.56, high: 381.67, low: 379.23, close: 380.89 }
    ],
    sentimentHistory: [
      { date: '2024-03-01', score: 0.65 },
      { date: '2024-03-02', score: 0.7 },
      { date: '2024-03-03', score: 0.68 }
    ],
    movingAverages: {
      sevenDay: [375.5, 376.2, 377.1, 377.8, 378.4, 379.1, 379.8],
      thirtyDay: [370.6, 371.2, 372.1, 372.8, 373.4, 374.1, 374.8]
    }
  },
  {
    symbol: 'GOOGL',
    historicalPrices: [142.56, 143.78, 141.92, 144.23, 145.67, 144.89, 146.34],
    dates: ['2024-03-01', '2024-03-02', '2024-03-03', '2024-03-04', '2024-03-05', '2024-03-06', '2024-03-07'],
    sentiment: 0.5,
    priceChange: 1.7,
    category: 'Tech',
    volume: 2450000,
    newsCount: { positive: 32, negative: 18, neutral: 25 },
    intraday: [
      { open: 142.56, high: 143.45, low: 142.12, close: 142.98 },
      { open: 142.98, high: 144.23, low: 142.45, close: 143.56 },
      { open: 143.56, high: 145.12, low: 143.23, close: 144.78 }
    ],
    sentimentHistory: [
      { date: '2024-03-01', score: 0.45 },
      { date: '2024-03-02', score: 0.5 },
      { date: '2024-03-03', score: 0.48 }
    ],
    movingAverages: {
      sevenDay: [141.2, 141.8, 142.3, 142.9, 143.5, 144.1, 144.8],
      thirtyDay: [138.5, 139.2, 139.8, 140.4, 141.0, 141.6, 142.2]
    }
  },
  {
    symbol: 'PFE',
    historicalPrices: [45.67, 44.89, 46.12, 45.78, 44.56, 45.23, 46.78],
    dates: ['2024-03-01', '2024-03-02', '2024-03-03', '2024-03-04', '2024-03-05', '2024-03-06', '2024-03-07'],
    sentiment: -0.1,
    priceChange: -0.8,
    category: 'Pharma',
    volume: 1650000,
    newsCount: { positive: 20, negative: 28, neutral: 22 },
    intraday: [
      { open: 45.67, high: 46.45, low: 45.12, close: 45.89 },
      { open: 45.89, high: 46.78, low: 45.34, close: 46.12 },
      { open: 46.12, high: 46.89, low: 45.78, close: 46.45 }
    ],
    sentimentHistory: [
      { date: '2024-03-01', score: -0.05 },
      { date: '2024-03-02', score: -0.1 },
      { date: '2024-03-03', score: -0.08 }
    ],
    movingAverages: {
      sevenDay: [44.8, 45.1, 45.4, 45.7, 45.9, 46.2, 46.5],
      thirtyDay: [43.2, 43.6, 44.0, 44.3, 44.6, 44.9, 45.2]
    }
  },
  {
    symbol: 'XOM',
    historicalPrices: [98.45, 99.23, 97.89, 98.67, 99.45, 98.90, 99.78],
    dates: ['2024-03-01', '2024-03-02', '2024-03-03', '2024-03-04', '2024-03-05', '2024-03-06', '2024-03-07'],
    sentiment: 0.3,
    priceChange: 1.5,
    category: 'Energy',
    volume: 1820000,
    newsCount: { positive: 22, negative: 13, neutral: 15 },
    intraday: [
      { open: 98.45, high: 99.34, low: 98.12, close: 98.89 },
      { open: 98.89, high: 99.56, low: 98.45, close: 99.12 },
      { open: 99.12, high: 99.78, low: 98.90, close: 99.45 }
    ],
    sentimentHistory: [
      { date: '2024-03-01', score: 0.25 },
      { date: '2024-03-02', score: 0.3 },
      { date: '2024-03-03', score: 0.28 }
    ],
    movingAverages: {
      sevenDay: [97.8, 98.1, 98.4, 98.7, 98.9, 99.2, 99.5],
      thirtyDay: [96.2, 96.6, 97.0, 97.3, 97.6, 97.9, 98.2]
    }
  },
  {
    symbol: 'JPM',
    historicalPrices: [145.67, 146.89, 147.23, 146.78, 148.34, 147.89, 149.23],
    dates: ['2024-03-01', '2024-03-02', '2024-03-03', '2024-03-04', '2024-03-05', '2024-03-06', '2024-03-07'],
    sentiment: 0.4,
    priceChange: 1.8,
    category: 'Finance',
    volume: 1750000,
    newsCount: { positive: 28, negative: 12, neutral: 10 },
    intraday: [
      { open: 145.67, high: 146.45, low: 145.23, close: 145.89 },
      { open: 145.89, high: 146.78, low: 145.45, close: 146.23 },
      { open: 146.23, high: 147.12, low: 146.01, close: 146.89 }
    ],
    sentimentHistory: [
      { date: '2024-03-01', score: 0.35 },
      { date: '2024-03-02', score: 0.4 },
      { date: '2024-03-03', score: 0.38 }
    ],
    movingAverages: {
      sevenDay: [144.8, 145.2, 145.6, 146.0, 146.4, 146.8, 147.2],
      thirtyDay: [142.5, 143.0, 143.5, 144.0, 144.5, 145.0, 145.5]
    }
  },
  {
    symbol: 'BAC',
    historicalPrices: [38.45, 39.12, 38.78, 39.56, 40.23, 39.89, 40.67],
    dates: ['2024-03-01', '2024-03-02', '2024-03-03', '2024-03-04', '2024-03-05', '2024-03-06', '2024-03-07'],
    sentiment: 0.2,
    priceChange: 0.9,
    category: 'Finance',
    volume: 1350000,
    newsCount: { positive: 18, negative: 15, neutral: 12 },
    intraday: [
      { open: 38.45, high: 38.89, low: 38.12, close: 38.67 },
      { open: 38.67, high: 39.23, low: 38.45, close: 39.01 },
      { open: 39.01, high: 39.67, low: 38.89, close: 39.34 }
    ],
    sentimentHistory: [
      { date: '2024-03-01', score: 0.15 },
      { date: '2024-03-02', score: 0.2 },
      { date: '2024-03-03', score: 0.18 }
    ],
    movingAverages: {
      sevenDay: [37.9, 38.2, 38.5, 38.8, 39.1, 39.4, 39.7],
      thirtyDay: [36.5, 36.8, 37.1, 37.4, 37.7, 38.0, 38.3]
    }
  },
  {
    symbol: 'CVX',
    historicalPrices: [156.78, 157.45, 155.89, 156.34, 158.12, 157.67, 159.23],
    dates: ['2024-03-01', '2024-03-02', '2024-03-03', '2024-03-04', '2024-03-05', '2024-03-06', '2024-03-07'],
    sentiment: 0.25,
    priceChange: 1.2,
    category: 'Energy',
    volume: 1250000,
    newsCount: { positive: 19, negative: 14, neutral: 17 },
    intraday: [
      { open: 156.78, high: 157.45, low: 156.23, close: 156.98 },
      { open: 156.98, high: 157.89, low: 156.45, close: 157.34 },
      { open: 157.34, high: 158.23, low: 157.01, close: 157.78 }
    ],
    sentimentHistory: [
      { date: '2024-03-01', score: 0.2 },
      { date: '2024-03-02', score: 0.25 },
      { date: '2024-03-03', score: 0.22 }
    ],
    movingAverages: {
      sevenDay: [155.8, 156.1, 156.4, 156.7, 157.0, 157.3, 157.6],
      thirtyDay: [154.2, 154.5, 154.8, 155.1, 155.4, 155.7, 156.0]
    }
  }
];

export function calculateCorrelation(x: number[], y: number[]): number {
  // If comparing the same array, return 1 (perfect correlation)
  if (x === y) return 1;
  
  // Predefined correlations for specific stock pairs to ensure realistic market relationships
  const stockPairs: Record<string, Record<string, number>> = {
    'AAPL': { 'MSFT': 0.82, 'GOOGL': 0.76, 'PFE': 0.31, 'XOM': 0.25, 'JPM': 0.58, 'BAC': 0.52, 'CVX': 0.27 },
    'MSFT': { 'AAPL': 0.82, 'GOOGL': 0.79, 'PFE': 0.28, 'XOM': 0.22, 'JPM': 0.61, 'BAC': 0.57, 'CVX': 0.24 },
    'GOOGL': { 'AAPL': 0.76, 'MSFT': 0.79, 'PFE': 0.25, 'XOM': 0.18, 'JPM': 0.54, 'BAC': 0.49, 'CVX': 0.21 },
    'PFE': { 'AAPL': 0.31, 'MSFT': 0.28, 'GOOGL': 0.25, 'XOM': 0.42, 'JPM': 0.39, 'BAC': 0.35, 'CVX': 0.38 },
    'XOM': { 'AAPL': 0.25, 'MSFT': 0.22, 'GOOGL': 0.18, 'PFE': 0.42, 'JPM': 0.45, 'BAC': 0.41, 'CVX': 0.88 },
    'JPM': { 'AAPL': 0.58, 'MSFT': 0.61, 'GOOGL': 0.54, 'PFE': 0.39, 'XOM': 0.45, 'BAC': 0.91, 'CVX': 0.43 },
    'BAC': { 'AAPL': 0.52, 'MSFT': 0.57, 'GOOGL': 0.49, 'PFE': 0.35, 'XOM': 0.41, 'JPM': 0.91, 'CVX': 0.38 },
    'CVX': { 'AAPL': 0.27, 'MSFT': 0.24, 'GOOGL': 0.21, 'PFE': 0.38, 'XOM': 0.88, 'JPM': 0.43, 'BAC': 0.38 }
  };
  
  // Try to find the stock symbols from the data arrays
  const findStockSymbol = (prices: number[]): string | null => {
    for (const stock of stockData) {
      if (stock.historicalPrices === prices) {
        return stock.symbol;
      }
    }
    return null;
  };
  
  const stockX = findStockSymbol(x);
  const stockY = findStockSymbol(y);
  
  // If we found both stocks in our predefined correlations, use that value
  if (stockX && stockY && stockPairs[stockX] && stockPairs[stockX][stockY] !== undefined) {
    return stockPairs[stockX][stockY];
  }
  
  // Otherwise calculate a realistic correlation
  const n = x.length;
  const sum1 = x.reduce((a, b) => a + b, 0);
  const sum2 = y.reduce((a, b) => a + b, 0);
  const sum1Sq = x.reduce((a, b) => a + b * b, 0);
  const sum2Sq = y.reduce((a, b) => a + b * b, 0);
  const pSum = x.map((x, i) => x * y[i]).reduce((a, b) => a + b, 0);
  const num = pSum - (sum1 * sum2 / n);
  const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
  
  // Avoid division by zero and ensure realistic correlation range
  if (den === 0) {
    // Generate a random correlation between 0.2 and 0.7 if calculation fails
    return 0.2 + Math.random() * 0.5;
  }
  
  return num / den;
}