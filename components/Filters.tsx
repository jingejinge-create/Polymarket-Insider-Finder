'use client';

import { FilterState } from '@/lib/types';

interface FiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  isLive: boolean;
  onToggleLive: () => void;
  lastUpdate: Date;
}

export function Filters({ filters, onChange, isLive, onToggleLive, lastUpdate }: FiltersProps) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4 lg:gap-6">
        {/* Min Size Filter */}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-mono uppercase tracking-wider">
            Min Size
          </label>
          <select 
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm font-mono text-gray-300 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 min-w-[120px]"
            value={filters.minSize}
            onChange={(e) => onChange({ ...filters, minSize: Number(e.target.value) })}
          >
            <option value={0}>Any</option>
            <option value={1000}>$1,000+</option>
            <option value={5000}>$5,000+</option>
            <option value={10000}>$10,000+</option>
            <option value={25000}>$25,000+</option>
            <option value={50000}>$50,000+</option>
            <option value={100000}>$100,000+</option>
          </select>
        </div>
        
        {/* Min Score Filter */}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-mono uppercase tracking-wider">
            Min Score
          </label>
          <select
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm font-mono text-gray-300 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 min-w-[150px]"
            value={filters.minScore}
            onChange={(e) => onChange({ ...filters, minScore: Number(e.target.value) })}
          >
            <option value={0}>Any</option>
            <option value={40}>40%+ Medium</option>
            <option value={60}>60%+ High</option>
            <option value={70}>70%+ Suspicious</option>
            <option value={80}>80%+ Critical</option>
          </select>
        </div>

        {/* Time Range Filter */}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-mono uppercase tracking-wider">
            Time Range
          </label>
          <select
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm font-mono text-gray-300 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 min-w-[120px]"
            value={filters.timeRange}
            onChange={(e) => onChange({ ...filters, timeRange: e.target.value as FilterState['timeRange'] })}
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
        
        {/* Side Filter */}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-mono uppercase tracking-wider">
            Side
          </label>
          <select
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm font-mono text-gray-300 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 min-w-[100px]"
            value={filters.side || ''}
            onChange={(e) => onChange({ 
              ...filters, 
              side: e.target.value ? e.target.value as 'YES' | 'NO' : undefined 
            })}
          >
            <option value="">All</option>
            <option value="YES">YES</option>
            <option value="NO">NO</option>
          </select>
        </div>

        {/* Spacer */}
        <div className="flex-1" />
        
        {/* Live Toggle & Last Update */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleLive}
            className={`
              flex items-center gap-2 px-4 py-2 rounded font-mono text-sm transition
              ${isLive 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
              }
            `}
          >
            <span className={`
              w-2 h-2 rounded-full
              ${isLive ? 'bg-cyan-400 animate-pulse' : 'bg-gray-600'}
            `} />
            {isLive ? 'LIVE' : 'PAUSED'}
          </button>
          <span className="text-xs text-gray-600 font-mono hidden sm:inline">
            {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}
