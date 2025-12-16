import { NextRequest, NextResponse } from 'next/server';
import { generateMockTrades, filterTrades } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Parse filter parameters
  const minSize = parseInt(searchParams.get('minSize') || '0');
  const minScore = parseInt(searchParams.get('minScore') || '0');
  const timeRange = searchParams.get('timeRange') || '24h';
  const side = searchParams.get('side') as 'YES' | 'NO' | undefined;
  const limit = parseInt(searchParams.get('limit') || '50');
  
  try {
    // Generate trades (in production, this would fetch from database or Polymarket API)
    const allTrades = generateMockTrades(100);
    
    // Apply filters
    const filteredTrades = filterTrades(allTrades, {
      minSize,
      minScore,
      timeRange: timeRange as any,
      side: side || undefined,
    });
    
    // Limit results
    const trades = filteredTrades.slice(0, limit);
    
    return NextResponse.json({
      success: true,
      data: trades,
      meta: {
        total: filteredTrades.length,
        returned: trades.length,
        filters: { minSize, minScore, timeRange, side },
      },
    });
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}
