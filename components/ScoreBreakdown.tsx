'use client';

import { InsiderScores } from '@/lib/types';

interface ScoreBarProps {
  label: string;
  value: number;
  description: string;
}

function ScoreBar({ label, value, description }: ScoreBarProps) {
  const getGradient = (val: number) => {
    if (val >= 70) return 'linear-gradient(90deg, #ef4444, #f97316)';
    if (val >= 40) return 'linear-gradient(90deg, #f59e0b, #eab308)';
    return 'linear-gradient(90deg, #10b981, #22d3ee)';
  };
  
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">
          {label}
        </span>
        <span className="text-xs text-cyan-400 font-mono font-bold">
          {value}
        </span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${value}%`,
            background: getGradient(value),
          }}
        />
      </div>
      <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

interface ScoreBreakdownProps {
  scores: InsiderScores;
  walletAge: number;
  marketsTraded: number;
  wallet: string;
}

export function ScoreBreakdown({ scores, walletAge, marketsTraded, wallet }: ScoreBreakdownProps) {
  const truncatedWallet = wallet.length > 20 
    ? `${wallet.slice(0, 10)}...${wallet.slice(-6)}`
    : wallet;
  
  return (
    <div>
      {/* Wallet Info Card */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-cyan-400 font-mono text-sm">
            {truncatedWallet}
          </span>
          <button 
            onClick={() => navigator.clipboard.writeText(wallet)}
            className="text-xs text-gray-500 hover:text-gray-300 transition"
          >
            Copy
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-gray-500 block">Wallet Age</span>
            <p className="text-gray-200 font-mono text-sm">
              {walletAge} days
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Markets Traded</span>
            <p className="text-gray-200 font-mono text-sm">
              {marketsTraded}
            </p>
          </div>
        </div>
      </div>
      
      {/* Score Bars */}
      <ScoreBar 
        label="Wallet Newness" 
        value={scores.newness}
        description="Fresh wallets often indicate intentional separation from main accounts"
      />
      <ScoreBar 
        label="Bet Concentration" 
        value={scores.concentration}
        description="High portfolio concentration suggests strong conviction or inside info"
      />
      <ScoreBar 
        label="Timing" 
        value={scores.timing}
        description="Trading close to resolution suggests advance knowledge of outcome"
      />
      <ScoreBar 
        label="Size vs Liquidity" 
        value={scores.sizeVsLiquidity}
        description="Large trades relative to market size indicate high confidence"
      />
      <ScoreBar 
        label="Historical Win Rate" 
        value={scores.winRate}
        description="Consistently correct predictions on resolved markets"
      />
      <ScoreBar 
        label="Category Specialization" 
        value={scores.specialization}
        description="Trading in narrow category suggests domain-specific knowledge"
      />
    </div>
  );
}
