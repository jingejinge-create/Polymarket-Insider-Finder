import { Trade, AnalyzedTrade, InsiderScores, WalletProfile } from './types';

// Scoring weights - can be adjusted
const WEIGHTS = {
  newness: 0.20,
  concentration: 0.25,
  timing: 0.15,
  sizeVsLiquidity: 0.15,
  winRate: 0.15,
  specialization: 0.10,
};

/**
 * Calculate Wallet Newness Score (0-100)
 * Fresh wallets with quick Polymarket activity are suspicious
 */
export function calculateNewnessScore(walletAgeDays: number): number {
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
 * High concentration in single market suggests conviction/inside info
 */
export function calculateConcentrationScore(
  tradeSize: number,
  walletTotalVolume: number
): number {
  if (walletTotalVolume === 0) return 100; // First trade ever
  
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
 * Trades close to market resolution are more suspicious
 */
export function calculateTimingScore(
  tradeTimestamp: Date,
  marketEndDate: Date | null
): number {
  if (!marketEndDate) return 30; // Unknown end date, moderate score
  
  const hoursUntilEnd = (marketEndDate.getTime() - tradeTimestamp.getTime()) / (1000 * 60 * 60);
  
  if (hoursUntilEnd < 0) return 10; // Trade after resolution
  if (hoursUntilEnd <= 6) return 100;
  if (hoursUntilEnd <= 24) return 90;
  if (hoursUntilEnd <= 48) return 75;
  if (hoursUntilEnd <= 72) return 60;
  if (hoursUntilEnd <= 168) return 40; // 1 week
  if (hoursUntilEnd <= 720) return 20; // 1 month
  return 10;
}

/**
 * Calculate Size vs Liquidity Score (0-100)
 * Large trades relative to market liquidity show confidence
 */
export function calculateSizeVsLiquidityScore(
  tradeSize: number,
  marketLiquidity: number,
  market24hVolume: number
): number {
  // Use the smaller of liquidity and 24h volume for reference
  const referenceSize = Math.min(
    marketLiquidity || Infinity,
    market24hVolume || Infinity
  );
  
  if (referenceSize === Infinity || referenceSize === 0) {
    // No market data, score based on absolute size
    if (tradeSize >= 50000) return 90;
    if (tradeSize >= 25000) return 70;
    if (tradeSize >= 10000) return 50;
    if (tradeSize >= 5000) return 30;
    return 15;
  }
  
  const ratio = tradeSize / referenceSize;
  
  if (ratio >= 0.20) return 100; // 20%+ of liquidity
  if (ratio >= 0.10) return 85;
  if (ratio >= 0.05) return 65;
  if (ratio >= 0.02) return 45;
  if (ratio >= 0.01) return 30;
  return 15;
}

/**
 * Calculate Win Rate Score (0-100)
 * Consistently correct predictions indicate possible inside info
 */
export function calculateWinRateScore(
  wins: number,
  totalResolved: number
): number {
  if (totalResolved < 3) return 50; // Not enough data
  
  const winRate = wins / totalResolved;
  
  if (winRate >= 0.95 && totalResolved >= 5) return 100;
  if (winRate >= 0.85) return 85;
  if (winRate >= 0.75) return 70;
  if (winRate >= 0.65) return 55;
  if (winRate >= 0.55) return 40;
  return 25;
}

/**
 * Calculate Specialization Score (0-100)
 * Trading only in specific category suggests domain knowledge
 */
export function calculateSpecializationScore(
  categoriesTraded: string[],
  totalMarkets: number
): number {
  if (totalMarkets <= 1) return 80; // Single market = high specialization
  if (categoriesTraded.length === 0) return 50;
  
  const uniqueCategories = new Set(categoriesTraded).size;
  const categoryRatio = uniqueCategories / totalMarkets;
  
  if (uniqueCategories === 1 && totalMarkets >= 3) return 90;
  if (categoryRatio <= 0.2) return 75;
  if (categoryRatio <= 0.4) return 50;
  if (categoryRatio <= 0.6) return 30;
  return 15;
}

/**
 * Calculate composite insider score from all metrics
 */
export function calculateInsiderScores(params: {
  walletAgeDays: number;
  tradeSize: number;
  walletTotalVolume: number;
  tradeTimestamp: Date;
  marketEndDate: Date | null;
  marketLiquidity: number;
  market24hVolume: number;
  wins: number;
  totalResolved: number;
  categoriesTraded: string[];
  totalMarkets: number;
}): InsiderScores {
  const newness = calculateNewnessScore(params.walletAgeDays);
  const concentration = calculateConcentrationScore(params.tradeSize, params.walletTotalVolume);
  const timing = calculateTimingScore(params.tradeTimestamp, params.marketEndDate);
  const sizeVsLiquidity = calculateSizeVsLiquidityScore(
    params.tradeSize,
    params.marketLiquidity,
    params.market24hVolume
  );
  const winRate = calculateWinRateScore(params.wins, params.totalResolved);
  const specialization = calculateSpecializationScore(
    params.categoriesTraded,
    params.totalMarkets
  );
  
  const composite = Math.round(
    newness * WEIGHTS.newness +
    concentration * WEIGHTS.concentration +
    timing * WEIGHTS.timing +
    sizeVsLiquidity * WEIGHTS.sizeVsLiquidity +
    winRate * WEIGHTS.winRate +
    specialization * WEIGHTS.specialization
  );
  
  return {
    newness,
    concentration,
    timing,
    sizeVsLiquidity,
    winRate,
    specialization,
    composite: Math.min(100, Math.max(0, composite)),
  };
}

/**
 * Analyze a trade and calculate insider scores
 * Uses simulated wallet data when real data isn't available
 */
export function analyzeTrade(
  trade: Trade,
  marketInfo?: {
    endDate?: string;
    liquidity?: number;
    volume?: number;
    category?: string;
  }
): AnalyzedTrade {
  // Simulate wallet profile based on trade characteristics
  // In production, this would come from actual blockchain data
  const walletHash = trade.wallet.slice(2, 10);
  const walletSeed = parseInt(walletHash, 16);
  
  // Use wallet address to create deterministic but varied profiles
  const walletAgeDays = (walletSeed % 365) + 1;
  const marketsTraded = (walletSeed % 50) + 1;
  const walletVolume = trade.size * (1 + (walletSeed % 10));
  const wins = Math.floor((walletSeed % 10) * 0.7);
  const totalResolved = Math.floor(walletSeed % 10);
  
  // Determine categories (simulated)
  const categories = ['Politics', 'Crypto', 'Sports', 'Entertainment', 'Science'];
  const numCategories = (walletSeed % 3) + 1;
  const tradedCategories = categories.slice(0, numCategories);
  
  const scores = calculateInsiderScores({
    walletAgeDays,
    tradeSize: trade.size,
    walletTotalVolume: walletVolume,
    tradeTimestamp: new Date(trade.timestamp),
    marketEndDate: marketInfo?.endDate ? new Date(marketInfo.endDate) : null,
    marketLiquidity: marketInfo?.liquidity || 0,
    market24hVolume: marketInfo?.volume || 0,
    wins,
    totalResolved,
    categoriesTraded: tradedCategories,
    totalMarkets: marketsTraded,
  });
  
  return {
    ...trade,
    insiderScore: scores.composite,
    scores,
    walletAge: walletAgeDays,
    marketsTraded,
  };
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
      return {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        glow: 'shadow-red-500/30 shadow-lg',
      };
    case 'high':
      return {
        bg: 'bg-orange-500/20',
        text: 'text-orange-400',
        glow: '',
      };
    case 'medium':
      return {
        bg: 'bg-yellow-500/15',
        text: 'text-yellow-500',
        glow: '',
      };
    default:
      return {
        bg: 'bg-emerald-500/15',
        text: 'text-emerald-500',
        glow: '',
      };
  }
}
