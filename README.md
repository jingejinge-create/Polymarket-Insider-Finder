# 🔍 Insider Radar - Polymarket Intelligence

A real-time insider activity tracker for Polymarket prediction markets.

![Insider Radar Screenshot](screenshot.png)

## Features

- **Real-time Trade Monitoring**: Track trades as they happen on Polymarket
- **6-Metric Insider Scoring**: Advanced algorithm analyzing wallet behavior
- **Filterable Dashboard**: Filter by size, score, time range, and bet side
- **Score Breakdown**: Detailed analysis of why a trade looks suspicious
- **Dark Terminal Aesthetic**: Professional, hacker-style UI

## Insider Scoring Metrics

| Metric | Weight | What It Measures |
|--------|--------|------------------|
| Wallet Newness | 20% | Days since wallet creation |
| Bet Concentration | 25% | % of portfolio in single bet |
| Timing | 15% | Hours until market resolution |
| Size vs Liquidity | 15% | Trade size relative to market |
| Historical Win Rate | 15% | Accuracy on resolved markets |
| Specialization | 10% | Category focus |

## Quick Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/insider-finder)

### Option 2: Manual Deploy

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/insider-finder.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

That's it! Vercel auto-detects Next.js and handles everything.

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
insider-finder/
├── app/
│   ├── api/trades/     # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main dashboard
├── components/
│   ├── Filters.tsx     # Filter controls
│   ├── Header.tsx      # Header with stats
│   ├── ScoreBadge.tsx  # Score display badge
│   ├── ScoreBreakdown.tsx # Detailed scores
│   └── TradeTable.tsx  # Trade list table
├── lib/
│   ├── mock-data.ts    # Mock data generator
│   ├── polymarket.ts   # Polymarket API client
│   ├── scoring.ts      # Insider scoring algorithm
│   └── types.ts        # TypeScript types
└── package.json
```

## Connecting Real Data

The app currently uses realistic mock data. To connect real Polymarket data:

1. **Edit `lib/polymarket.ts`** - API client is ready, just needs to be called
2. **Update `app/page.tsx`** - Replace `generateMockTrades()` with API calls
3. **Add environment variables** (if needed):
   ```env
   POLYGON_RPC_URL=https://polygon-rpc.com
   ```

## Future Enhancements

- [ ] Real Polymarket API integration
- [ ] Wallet detail pages
- [ ] Market-specific insider views
- [ ] Alert system (email/Telegram)
- [ ] Historical backtesting
- [ ] Wallet clustering detection
- [ ] Database persistence (Supabase)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Fonts**: JetBrains Mono
- **Deployment**: Vercel

## Disclaimer

This tool identifies patterns that MAY indicate insider activity. High scores do not guarantee insider trading. Use for research and educational purposes only.

## License

MIT License - feel free to use and modify.

---

Built with ❤️ for the Polymarket community
