import { useState, useEffect } from 'react';
import { StockData, calculateCorrelation } from '../data/stockData';

interface CorrelationMatrixProps {
  data: StockData[];
}

export function CorrelationMatrix({ data }: CorrelationMatrixProps) {
  const [correlations, setCorrelations] = useState<number[][]>([]);

  useEffect(() => {
    const matrix = data.map(stock1 => 
      data.map(stock2 => 
        calculateCorrelation(stock1.historicalPrices, stock2.historicalPrices)
      )
    );
    setCorrelations(matrix);
  }, [data]);

  const getColor = (value: number) => {
    const hue = ((value + 1) * 60).toString(10);
    return `hsl(${hue}, 70%, 50%)`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="p-2 text-left"></th>
            {data.map(stock => (
              <th key={stock.symbol} className="p-2 text-left">
                {stock.symbol}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {correlations.map((row, i) => (
            <tr key={i}>
              <td className="p-2">{data[i].symbol}</td>
              {row.map((value, j) => (
                <td
                  key={j}
                  className="p-2"
                  style={{
                    backgroundColor: getColor(value),
                    opacity: 0.7,
                  }}
                >
                  {value.toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}