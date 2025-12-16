'use client';

import { Stats } from '@/lib/types';

interface HeaderProps {
  stats: Stats;
}

export function Header({ stats }: HeaderProps) {
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(0)}K`;
    return `$${volume.toFixed(0)}`;
  };
  
  return (
    <header className="border-b border-cyan-900/30 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-cyan-500 flex items-center justify-center">
                <div className="absolute w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-cyan-400 animate-ping opacity-20" />
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                <span className="text-cyan-400">INSIDER</span>
                <span className="text-gray-400">RADAR</span>
              </h1>
              <p className="text-xs text-gray-600 font-mono hidden sm:block">
                Polymarket Intelligence
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-4 sm:gap-8 text-sm">
            <div className="text-center hidden sm:block">
              <div className="text-xl sm:text-2xl font-bold text-cyan-400 font-mono">
                {stats.totalAnalyzed}
              </div>
              <div className="text-xs text-gray-500">Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-400 font-mono">
                {stats.highScoreCount}
              </div>
              <div className="text-xs text-gray-500">Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
                {formatVolume(stats.totalVolume)}
              </div>
              <div className="text-xs text-gray-500">Volume</div>
            </div>
            <div className="text-center hidden md:block">
              <div className="text-xl sm:text-2xl font-bold text-purple-400 font-mono">
                {stats.marketsTracked}
              </div>
              <div className="text-xs text-gray-500">Markets</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
