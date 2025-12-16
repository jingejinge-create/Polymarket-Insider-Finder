import { PolymarketTrade, GammaMarket, MarketInfo } from './types';

const CLOB_API = 'https://clob.polymarket.com';
const GAMMA_API = 'https://gamma-api.polymarket.com';

// Fetch recent trades from Polymarket CLOB
export async function fetchRecentTrades(limit: number = 100): Promise<PolymarketTrade[]> {
  try {
    const response = await fetch(`${CLOB_API}/trades?limit=${limit}`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 30 }, // Cache for 30 seconds
    });
    
    if (!response.ok) {
      throw new Error(`CLOB API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching trades:', error);
    return [];
  }
}

// Fetch market information
export async function fetchMarkets(limit: number = 100, active: boolean = true): Promise<GammaMarket[]> {
  try {
    const response = await fetch(
      `${GAMMA_API}/markets?limit=${limit}&active=${active}&closed=false`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );
    
    if (!response.ok) {
      throw new Error(`Gamma API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching markets:', error);
    return [];
  }
}

// Fetch specific market by condition ID
export async function fetchMarketByConditionId(conditionId: string): Promise<GammaMarket | null> {
  try {
    const response = await fetch(
      `${GAMMA_API}/markets?condition_id=${conditionId}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 },
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data?.[0] || null;
  } catch (error) {
    console.error('Error fetching market:', error);
    return null;
  }
}

// Fetch trades for a specific market
export async function fetchMarketTrades(assetId: string, limit: number = 50): Promise<PolymarketTrade[]> {
  try {
    const response = await fetch(
      `${CLOB_API}/trades?asset_id=${assetId}&limit=${limit}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 30 },
      }
    );
    
    if (!response.ok) {
      throw new Error(`CLOB API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching market trades:', error);
    return [];
  }
}

// Get orderbook for price context
export async function fetchOrderbook(tokenId: string) {
  try {
    const response = await fetch(`${CLOB_API}/book?token_id=${tokenId}`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 10 },
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching orderbook:', error);
    return null;
  }
}

// Parse market info from Gamma API response
export function parseMarketInfo(market: GammaMarket): MarketInfo {
  return {
    id: market.id,
    question: market.question,
    slug: market.slug,
    outcomes: market.outcomes || ['Yes', 'No'],
    outcomePrices: (market.outcomePrices || []).map(p => parseFloat(String(p))),
    volume: market.volume || 0,
    liquidity: market.liquidity || 0,
    endDate: market.endDate,
    resolved: market.closed,
    category: market.category,
  };
}

// Build market lookup from condition ID to market info
export async function buildMarketLookup(): Promise<Map<string, MarketInfo>> {
  const markets = await fetchMarkets(500, true);
  const lookup = new Map<string, MarketInfo>();
  
  for (const market of markets) {
    if (market.conditionId) {
      lookup.set(market.conditionId, parseMarketInfo(market));
    }
  }
  
  return lookup;
}
