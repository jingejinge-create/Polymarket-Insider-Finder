'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Filters } from '@/components/Filters';
import { TradeTable } from '@/components/TradeTable';
import { ScoreBreakdown } from '@/components/ScoreBreakdown';
import { ScoreBadge } from '@/components/ScoreBadge';
import { AnalyzedTrade, FilterState, Stats } from '@/lib/types';
import { generateMockTrades, calculateStats, filterTrades } from '@/lib/mock-data';

export default function Home() {
  const [allTrades, setAllTrades] = useState<AnalyzedTrade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<AnalyzedTrade | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  
  const [filters, setFilters] = useState<FilterState>({
    minSize: 0,
    minScore: 0,
    timeRange: '24h',
  });

  // Fetch/generate trades
  const fetchTrades = useCallback(async () => {
    try {
      // In production, this would fetch from the API
      // For now, we generate realistic mock data
      const trades = generateMockTrades(75);
      setAllTrades(trades);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Live updates
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      fetchTrades();
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [isLive, fetchTrades]);

  // Filter trades
  const filteredTrades = useMemo(() => {
    return filterTrades(allTrades, filters);
  }, [allTrades, filters]);

  // Calculate stats
  const stats: Stats = useMemo(() => {
    return calculateStats(allTrades);
  }, [allTrades]);

  // Handle trade selection
  const handleSelectTrade = (trade: AnalyzedTrade | null) => {
    setSelectedTrade(trade);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Header stats={stats} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Filters 
          filters={filters}
          onChange={setFilters}
          isLive={isLive}
          onToggleLive={() => setIsLive(!isLive)}
          lastUpdate={lastUpdate}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trade Table */}
          <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="py-20 text-center">
                <div className="inline-block w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-mono text-sm">Loading trades...</p>
              </div>
            ) : (
              <TradeTable 
                trades={filteredTrades.slice(0, 25)}
                selectedId={selectedTrade?.id || null}
                onSelect={handleSelectTrade}
              />
            )}
            
            {/* Pagination hint */}
            {filteredTrades.length > 25 && (
              <div className="px-4 py-3 border-t border-gray-800 text-center">
                <span className="text-xs text-gray-500 font-mono">
                  Showing 25 of {filteredTrades.length} trades
                </span>
              </div>
            )}
          </div>

          {/* Score Breakdown Panel */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
            {selectedTrade ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider">
                    Score Breakdown
                  </h3>
                  <ScoreBadge score={selectedTrade.insiderScore} size="md" />
                </div>
                
                <ScoreBreakdown 
                  scores={selectedTrade.scores}
                  walletAge={selectedTrade.walletAge}
                  marketsTraded={selectedTrade.marketsTraded}
                  wallet={selectedTrade.wallet}
                />
                
                <div className="mt-6 pt-4 border-t border-gray-800 space-y-3">
                  <button className="w-full py-2 bg-cyan-500/20 text-cyan-400 rounded font-mono text-sm hover:bg-cyan-500/30 transition border border-cyan-500/30">
                    View Full Wallet Profile →
                  </button>
                  <button className="w-full py-2 bg-gray-800 text-gray-400 rounded font-mono text-sm hover:bg-gray-700 transition border border-gray-700">
                    View on PolygonScan ↗
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 py-16">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <p className="font-mono text-sm">Select a trade to view</p>
                <p className="font-mono text-xs text-gray-700 mt-1">score breakdown</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-900/30 border border-gray-800/50 rounded-lg">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono">
            <span className="text-gray-500">SCORE LEGEND:</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-400">80%+ Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-gray-400">60-79% High</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-gray-400">40-59% Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-gray-400">0-39% Normal</span>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800/50 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-gray-600 font-mono leading-relaxed">
            Disclaimer: This tool identifies patterns that MAY indicate insider activity.
            High scores do not guarantee insider trading. Use for research purposes only.
          </p>
          <p className="text-xs text-gray-700 font-mono mt-2">
            Built for Polymarket intelligence • Not affiliated with Polymarket
          </p>
        </div>
      </footer>
    </div>
  );
}
