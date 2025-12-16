// Polymarket API Client - Real Data
// Uses the public Data API (no authentication required)

const DATA_API = 'https://data-api.polymarket.com';
const GAMMA_API = 'https://gamma-api.polymarket.com';

export interface PolymarketTrade {
  proxyWallet: string;
  side: 'BUY' | 'SELL';
  asset: string;
  conditionId: string;
  size: number;
  price: number;
  timestamp: number;
  title: string;
  slug: string;
  icon?: string;
  eventSlug: string;
  outcome: string;
  outcomeIndex: number;
  name?: string;
  pseudonym?: string;
  transactionHash?: string;
}

export interface GammaMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  outcomes: string;
  outcomePrices: string;
  volume: number;
  liquidity: number;
  endDate: string;
  active: boolean;
  closed: boolean;
  category?: string;
}

/**
 * Fetch recent trades from Polymarket Data API
 * No authentication required!
 */
export async function fetchRealTrades(options?: {
  limit?: number;
  minSize?: number;
}): Promise<PolymarketTrade[]> {
  const limit = options?.limit || 100;
  const minSize = options?.minSize || 0;
  
  try {
    // Build URL with query params
    let url = `${DATA_API}/trades?limit=${limit}&takerOnly=true`;
    
    // Filter by minimum USDC size if specified
    if (minSize > 0) {
      url += `&filterType=CASH&filterAmount=${minSize}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      // Next.js caching - revalidate every 30 seconds
      next: { revalidate: 30 },
    });
    
    if (!response.ok) {
      console.error(`Data API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching trades:', error);
    return [];
  }
}

/**
 * Fetch trades for a specific wallet
 */
export async function fetchWalletTrades(walletAddress: string, limit: number = 50): Promise<PolymarketTrade[]> {
  try {
    const url = `${DATA_API}/trades?user=${walletAddress}&limit=${limit}`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 },
    });
    
    if (!response.ok) return [];
    
    return await response.json() || [];
  } catch (error) {
    console.error('Error fetching wallet trades:', error);
    return [];
  }
}

/**
 * Fetch trades for a specific market
 */
export async function fetchMarketTrades(conditionId: string, limit: number = 100): Promise<PolymarketTrade[]> {
  try {
    const url = `${DATA_API}/trades?market=${conditionId}&limit=${limit}`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 30 },
    });
    
    if (!response.ok) return [];
    
    return await response.json() || [];
  } catch (error) {
    console.error('Error fetching market trades:', error);
    return [];
  }
}

/**
 * Fetch active markets from Gamma API
 */
export async function fetchMarkets(limit: number = 100): Promise<GammaMarket[]> {
  try {
    const response = await fetch(
      `${GAMMA_API}/markets?limit=${limit}&active=true&closed=false`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 120 },
      }
    );
    
    if (!response.ok) return [];
    
    return await response.json() || [];
  } catch (error) {
    console.error('Error fetching markets:', error);
    return [];
  }
}

/**
 * Fetch market by condition ID
 */
export async function fetchMarketByConditionId(conditionId: string): Promise<GammaMarket | null> {
  try {
    const response = await fetch(
      `${GAMMA_API}/markets?condition_id=${conditionId}`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 120 },
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data?.[0] || null;
  } catch (error) {
    console.error('Error fetching market:', error);
    return null;
  }
}
