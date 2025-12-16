// Core data types for Polymarket Insider Finder

export interface Trade {
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
}

export interface WalletProfile {
  address: string;
  firstSeen: string;
  totalTrades: number;
  totalVolume: number;
  uniqueMarkets: number;
  winRate: number;
  resolvedPositions: number;
  categories: string[];
}

export interface InsiderScores {
  newness: number;
  concentration: number;
  timing: number;
  sizeVsLiquidity: number;
  winRate: number;
  specialization: number;
  composite: number;
}

export interface AnalyzedTrade extends Trade {
  insiderScore: number;
  scores: InsiderScores;
  walletAge: number;
  marketsTraded: number;
  walletProfile?: WalletProfile;
}

export interface MarketInfo {
  id: string;
  question: string;
  slug: string;
  outcomes: string[];
  outcomePrices: number[];
  volume: number;
  liquidity: number;
  endDate: string;
  resolved: boolean;
  resolutionDate?: string;
  category?: string;
}

export interface FilterState {
  minSize: number;
  minScore: number;
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d';
  side?: 'YES' | 'NO';
  category?: string;
}

export interface Stats {
  totalAnalyzed: number;
  highScoreCount: number;
  totalVolume: number;
  marketsTracked: number;
}

// API Response types
export interface PolymarketTrade {
  id: string;
  taker_order_id: string;
  market: string;
  asset_id: string;
  side: string;
  size: string;
  fee_rate_bps: string;
  price: string;
  status: string;
  match_time: string;
  last_update: string;
  outcome: string;
  maker_address: string;
  trader_side: string;
  transaction_hash?: string;
}

export interface PolymarketMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  resolutionSource: string;
  endDate: string;
  liquidity: string;
  volume: string;
  outcomes: string;
  outcomePrices: string;
  active: boolean;
  closed: boolean;
  marketType: string;
  tags?: { id: string; label: string }[];
}

export interface GammaMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  outcomes: string[];
  outcomePrices: string[];
  volume: number;
  liquidity: number;
  endDate: string;
  active: boolean;
  closed: boolean;
  category?: string;
}
