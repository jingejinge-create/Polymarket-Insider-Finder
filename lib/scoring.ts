import { PolymarketTrade } from './polymarket';

export interface InsiderScores {
  newness: number;
  concentration: number;
  timing: number;
  sizeVsLiquidity: number;
  winRate: number;
  specialization: number;
  composite: number;
}

export interface AnalyzedTrade {
  id: string;
  timestamp: string;
  market: string;
  marketSlug: string;
  conditionId: string;
  side: 'YES' | 'NO';
  size: number;
  price: number;
  wallet: string;
  txHash?: string;
  outcome: string;
  insiderScore: number;
  scores: InsiderScores;
  walletAge: number;
  marketsTraded: number;
}

// Wallet cache to simulate profile data
// In production, you'd fetch this from a database
const walletProfiles = new Map<string, {
  firstSeen: number;
  tradesCount: number;
  marketsTraded: Set<string>;
  totalVolume: number;
}>();

/**
 * Calculate Wallet Newness Score (0-100)
 */
function calculateNewnessScore(walletAgeDays: number): number {
  if (walletAgeDays <= 3) return 100;
  if (walletAgeDays <= 7) return 90;
  if (walletAgeDays <= 14) return 70;
  if (walletAgeDays <= 30) return 50;
  if (walletAgeDays <= 90) return 30;
  if (walletAgeDays <= 180) return 15;
  return 5;
}

/**
 * Calculate Bet Concentration Score (0-100)
 */
function calculateConcentrationScore(tradeSize: number, walletTotalVolume: number): number {
  if (walletTotalVolume === 0) return 100;
  const concentration = tradeSize / walletTotalVolume;
  
  if (concentration >= 0.95) return 100;
  if (concentration >= 0.80) return 85;
  if (concentration >= 0.60) return 65;
  if (concentration >= 0.40) return 45;
  if (concentration >= 0.20) return 25;
  return 10;
}

/**
 * Calculate Timing Score (0-100)
 * Without market end date, we use trade recency as a proxy
 */
function calculateTimingScore(tradeTimestamp: number): number {
  const now = Date.now();
  const hoursAgo = (now - tradeTimestamp) / (1000 * 60 * 60);
  
  // Very recent trades get higher scores (could be acting on fresh info)
  if (hoursAgo <= 1) return 80;
  if (hoursAgo <= 6) return 60;
  if (hoursAgo <= 24) return 40;
  return 25;
}

/**
 * Calculate Size vs Liquidity Score (0-100)
 */
function calculateSizeScore(tradeSize: number): number {
  // Score based on absolute trade size (USDC)
  if (tradeSize >= 100000) return 100;
  if (tradeSize >= 50000) return 90;
  if (tradeSize >= 25000) return 75;
  if (tradeSize >= 10000) return 60;
  if (tradeSize >= 5000) return 45;
  if (tradeSize >= 1000) return 30;
  return 15;
}

/**
 * Calculate Win Rate Score (0-100)
 * Simulated - in production, you'd track resolved positions
 */
function calculateWinRateScore(tradesCount: number): number {
  // Without historical data, use trade count as proxy
  // Fewer trades = more likely to be focused/insider
  if (tradesCount <= 3) return 80;
  if (tradesCount <= 10) return 60;
  if (tradesCount <= 25) return 40;
  return 25;
}

/**
 * Calculate Specialization Score (0-100)
 */
function calculateSpecializationScore(uniqueMarkets: number): number {
  if (uniqueMarkets <= 1) return 90;
  if (uniqueMarkets <= 3) return 75;
  if (uniqueMarkets <= 5) return 55;
  if (uniqueMarkets <= 10) return 35;
  return 15;
}

/**
 * Update wallet profile cache with new trade
 */
function updateWalletProfile(wallet: string, trade: PolymarketTrade) {
  const existing = walletProfiles.get(wallet) || {
    firstSeen: trade.timestamp * 1000,
    tradesCount: 0,
    marketsTraded: new Set<string>(),
    totalVolume: 0,
  };
  
  existing.tradesCount++;
  existing.marketsTraded.add(trade.conditionId);
  existing.totalVolume += trade.size * trade.price;
  
  if (trade.timestamp * 1000 < existing.firstSeen) {
    existing.firstSeen = trade.timestamp * 1000;
  }
  
  walletProfiles.set(wallet, existing);
  return existing;
}

/**
 * Analyze a real Polymarket trade and calculate insider scores
 */
export function analyzeRealTrade(trade: PolymarketTrade): AnalyzedTrade {
  const wallet = trade.proxyWallet;
  const profile = updateWalletProfile(wallet, trade);
  
  // Calculate wallet age in days
  const now = Date.now();
  const walletAgeDays = Math.max(1, Math.floor((now - profile.firstSeen) / (1000 * 60 * 60 * 24)));
  
  // Trade size in USDC
  const tradeSize = trade.size * trade.price;
  
  // Calculate all scores
  const newness = calculateNewnessScore(walletAgeDays);
  const concentration = calculateConcentrationScore(tradeSize, profile.totalVolume);
  const timing = calculateTimingScore(trade.timestamp * 1000);
  const sizeVsLiquidity = calculateSizeScore(tradeSize);
  const winRate = calculateWinRateScore(profile.tradesCount);
  const specialization = calculateSpecializationScore(profile.marketsTraded.size);
  
  // Weighted composite score
  const composite = Math.round(
    newness * 0.20 +
    concentration * 0.25 +
    timing * 0.15 +
    sizeVsLiquidity * 0.15 +
    winRate * 0.15 +
    specialization * 0.10
  );
  
  // Determine side (YES/NO) from outcome
  const side: 'YES' | 'NO' = trade.outcome?.toLowerCase().includes('yes') || 
                             trade.outcomeIndex === 0 ? 'YES' : 'NO';
  
  return {
    id: trade.transactionHash || `${trade.proxyWallet}-${trade.timestamp}`,
    timestamp: new Date(trade.timestamp * 1000).toISOString(),
    market: trade.title || 'Unknown Market',
    marketSlug: trade.slug || '',
    conditionId: trade.conditionId,
    side,
    size: tradeSize,
    price: trade.price,
    wallet: wallet,
    txHash: trade.transactionHash,
    outcome: trade.outcome || side,
    insiderScore: Math.min(100, Math.max(0, composite)),
    scores: {
      newness,
      concentration,
      timing,
      sizeVsLiquidity,
      winRate,
      specialization,
      composite: Math.min(100, Math.max(0, composite)),
    },
    walletAge: walletAgeDays,
    marketsTraded: profile.marketsTraded.size,
  };
}

/**
 * Analyze multiple trades
 */
export function analyzeRealTrades(trades: PolymarketTrade[]): AnalyzedTrade[] {
  return trades
    .map(analyzeRealTrade)
    .sort((a, b) => b.insiderScore - a.insiderScore);
}

/**
 * Get score severity level for display
 */
export function getScoreSeverity(score: number): 'critical' | 'high' | 'medium' | 'low' {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

/**
 * Get color classes for score display
 */
export function getScoreColors(score: number): { bg: string; text: string; glow: string } {
  const severity = getScoreSeverity(score);
  
  switch (severity) {
    case 'critical':
      return { bg: 'bg-red-500/20', text: 'text-red-400', glow: 'shadow-red-500/30 shadow-lg' };
    case 'high':
      return { bg: 'bg-orange-500/20', text: 'text-orange-400', glow: '' };
    case 'medium':
      return { bg: 'bg-yellow-500/15', text: 'text-yellow-500', glow: '' };
    default:
      return { bg: 'bg-emerald-500/15', text: 'text-emerald-500', glow: '' };
  }
}
