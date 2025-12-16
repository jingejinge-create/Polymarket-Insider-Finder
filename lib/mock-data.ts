import { AnalyzedTrade, InsiderScores, Stats } from './types';
import { calculateInsiderScores, getScoreSeverity } from './scoring';

// Real market questions from Polymarket
const SAMPLE_MARKETS = [
  'Will Bitcoin exceed $150,000 by Dec 31?',
  'Fed rate cut in January 2026?',
  'Trump cabinet fully confirmed by Jan 20?',
  'Ethereum spot ETF approval Q1 2026?',
  'SpaceX Starship reaches orbit in 2025?',
  'OpenAI IPO announcement 2025?',
  'Apple Vision Pro 2 announcement?',
  'US inflation below 2.5% by Q2 2026?',
  'TikTok ban upheld by Supreme Court?',
  'Tesla Robotaxi launch in 2025?',
  'ChatGPT-5 release before July 2025?',
  'Disney CEO change in 2025?',
  'Amazon stock split in 2025?',
  'Meta Threads reaches 500M users?',
  'NFL Super Bowl LIX winner?',
];

const CATEGORIES = ['Politics', 'Crypto', 'Tech', 'Sports', 'Business', 'Science'];

// Generate a deterministic but random-looking hex string
function generateWallet(seed: number): string {
  const hex = seed.toString(16).padStart(8, '0');
  return `0x${hex}${(seed * 7).toString(16).padStart(8, '0')}...${(seed * 13).toString(16).slice(0, 4)}`;
}

function generateFullWallet(seed: number): string {
  let result = '0x';
  for (let i = 0; i < 40; i++) {
    result += ((seed * (i + 1)) % 16).toString(16);
  }
  return result;
}

// Generate mock trades with realistic insider scores
export function generateMockTrades(count: number = 50): AnalyzedTrade[] {
  const trades: AnalyzedTrade[] = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const seed = (now + i * 12345) % 1000000;
    
    // Vary trade characteristics
    const isLikelyInsider = seed % 5 === 0; // 20% of trades look suspicious
    
    // Wallet age: insiders tend to have newer wallets
    const walletAgeDays = isLikelyInsider 
      ? Math.floor((seed % 14) + 1) 
      : Math.floor((seed % 300) + 30);
    
    // Trade size: insiders often make larger bets
    const baseSize = isLikelyInsider 
      ? 15000 + (seed % 85000) 
      : 500 + (seed % 20000);
    const tradeSize = Math.round(baseSize);
    
    // Markets traded: insiders focus on fewer markets
    const marketsTraded = isLikelyInsider 
      ? 1 + (seed % 5) 
      : 5 + (seed % 40);
    
    // Categories: insiders specialize
    const numCategories = isLikelyInsider ? 1 : 1 + (seed % 4);
    const categoriesTraded = CATEGORIES.slice(0, numCategories);
    
    // Win rate: insiders win more
    const totalResolved = 3 + (seed % 15);
    const wins = isLikelyInsider 
      ? Math.floor(totalResolved * (0.75 + (seed % 25) / 100))
      : Math.floor(totalResolved * (0.4 + (seed % 30) / 100));
    
    // Volume context
    const walletTotalVolume = tradeSize * (1 + (seed % 5));
    
    // Market info
    const marketEndDate = new Date(now + (seed % 30) * 24 * 60 * 60 * 1000);
    const marketLiquidity = 50000 + (seed % 500000);
    const market24hVolume = 10000 + (seed % 200000);
    
    // Calculate scores
    const scores = calculateInsiderScores({
      walletAgeDays,
      tradeSize,
      walletTotalVolume,
      tradeTimestamp: new Date(now - (i * 180000) - (seed % 3600000)),
      marketEndDate,
      marketLiquidity,
      market24hVolume,
      wins,
      totalResolved,
      categoriesTraded,
      totalMarkets: marketsTraded,
    });
    
    const trade: AnalyzedTrade = {
      id: `mock-${seed.toString(16)}`,
      timestamp: new Date(now - (i * 180000) - (seed % 3600000)).toISOString(),
      market: SAMPLE_MARKETS[seed % SAMPLE_MARKETS.length],
      marketSlug: SAMPLE_MARKETS[seed % SAMPLE_MARKETS.length].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      conditionId: `0x${seed.toString(16).padStart(64, '0')}`,
      side: seed % 2 === 0 ? 'YES' : 'NO',
      size: tradeSize,
      price: 0.15 + (seed % 70) / 100,
      wallet: generateWallet(seed),
      txHash: `0x${seed.toString(16).padStart(64, 'a')}`,
      insiderScore: scores.composite,
      scores,
      walletAge: walletAgeDays,
      marketsTraded,
    };
    
    trades.push(trade);
  }
  
  // Sort by insider score descending
  return trades.sort((a, b) => b.insiderScore - a.insiderScore);
}

// Generate stats from trades
export function calculateStats(trades: AnalyzedTrade[]): Stats {
  return {
    totalAnalyzed: trades.length,
    highScoreCount: trades.filter(t => t.insiderScore >= 70).length,
    totalVolume: trades.reduce((sum, t) => sum + t.size, 0),
    marketsTracked: new Set(trades.map(t => t.market)).size,
  };
}

// Filter trades based on criteria
export function filterTrades(
  trades: AnalyzedTrade[],
  filters: {
    minSize?: number;
    minScore?: number;
    timeRange?: string;
    side?: 'YES' | 'NO';
  }
): AnalyzedTrade[] {
  const now = Date.now();
  
  const timeRangeMs: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };
  
  return trades.filter(trade => {
    if (filters.minSize && trade.size < filters.minSize) return false;
    if (filters.minScore && trade.insiderScore < filters.minScore) return false;
    if (filters.side && trade.side !== filters.side) return false;
    
    if (filters.timeRange && timeRangeMs[filters.timeRange]) {
      const tradeTime = new Date(trade.timestamp).getTime();
      if (now - tradeTime > timeRangeMs[filters.timeRange]) return false;
    }
    
    return true;
  });
}
