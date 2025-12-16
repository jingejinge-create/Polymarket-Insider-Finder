'use client';

import { AnalyzedTrade } from '@/lib/types';
import { ScoreBadge } from './ScoreBadge';

interface TradeTableProps {
  trades: AnalyzedTrade[];
  selectedId: string | null;
  onSelect: (trade: AnalyzedTrade | null) => void;
}

export function TradeTable({ trades, selectedId, onSelect }: TradeTableProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };
  
  const formatSize = (size: number) => {
    if (size >= 1000000) return `$${(size / 1000000).toFixed(2)}M`;
    if (size >= 1000) return `$${(size / 1000).toFixed(1)}K`;
    return `$${size.toFixed(0)}`;
  };
  
  const truncateMarket = (market: string, maxLen: number = 40) => {
    if (market.length <= maxLen) return market;
    return market.slice(0, maxLen) + '...';
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-900/80">
            <th className="py-3 px-4 text-left text-xs font-mono text-gray-500 uppercase tracking-wider">
              Time
            </th>
            <th className="py-3 px-4 text-left text-xs font-mono text-gray-500 uppercase tracking-wider">
              Market
            </th>
            <th className="py-3 px-4 text-left text-xs font-mono text-gray-500 uppercase tracking-wider">
              Side
            </th>
            <th className="py-3 px-4 text-left text-xs font-mono text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th className="py-3 px-4 text-left text-xs font-mono text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="py-3 px-4 text-left text-xs font-mono text-gray-500 uppercase tracking-wider">
              Wallet
            </th>
            <th className="py-3 px-4 text-right text-xs font-mono text-gray-500 uppercase tracking-wider">
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr 
              key={trade.id}
              onClick={() => onSelect(selectedId === trade.id ? null : trade)}
              className={`
                trade-row border-b border-gray-800/50 cursor-pointer
                ${selectedId === trade.id ? 'bg-cyan-900/20' : ''}
              `}
            >
              <td className="py-3 px-4 font-mono text-xs text-gray-500">
                {formatTime(trade.timestamp)}
              </td>
              <td className="py-3 px-4">
                <span className="text-gray-200 text-sm" title={trade.market}>
                  {truncateMarket(trade.market)}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`
                  px-2 py-0.5 rounded text-xs font-bold
                  ${trade.side === 'YES' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/20 text-rose-400'
                  }
                `}>
                  {trade.side}
                </span>
              </td>
              <td className="py-3 px-4 font-mono text-sm text-gray-300">
                {formatSize(trade.size)}
              </td>
              <td className="py-3 px-4 font-mono text-sm text-gray-400">
                {(trade.price * 100).toFixed(1)}¢
              </td>
              <td className="py-3 px-4 font-mono text-xs text-cyan-400 hover:text-cyan-300">
                {trade.wallet}
              </td>
              <td className="py-3 px-4 text-right">
                <ScoreBadge score={trade.insiderScore} size="sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {trades.length === 0 && (
        <div className="py-12 text-center text-gray-600">
          <p className="font-mono">No trades match your filters</p>
        </div>
      )}
    </div>
  );
}
