import { create } from 'zustand';

interface StockState {
  stockData: { date: string; close: number }[] | null;
  stockSymbol: string;
  isLoading: boolean;
  error: string | null;
  setStockData: (data: { date: string; close: number }[] | null) => void;
  setStockSymbol: (symbol: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getData: (symbol: string) => Promise<void>;
}

const useStockStore = create<StockState>((set) => ({
    stockData: null,
    stockSymbol: '',
    isLoading: false,
    error: null,
    setStockData: (data: { date: string; close: number }[] | null) => set({ stockData: data }),
    setStockSymbol: (symbol: string) => set({ stockSymbol: symbol }),
    setLoading: (loading: boolean) => set({ isLoading: loading }),
    setError: (error: string | null) => set({ error }),
    getData: async (symbol: string) => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=NYTPCL8QWA3CXNBC`);
            const data: any = await response.json();
            console.log(symbol);
            console.log(data);
            
            if (data['Error Message']) {
                throw new Error(data['Error Message']);
            }
            
            const timeSeriesData = data['Time Series (Daily)'];
            if (!timeSeriesData) {
                throw new Error('No data available for this symbol');
            }

            const formattedData = Object.entries(timeSeriesData)
                .map(([date, values]: [string, any]) => ({
                    date,
                    close: parseFloat(values['4. close']),
                }))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                
            set({ stockData: formattedData, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    }
}));

export default useStockStore;
