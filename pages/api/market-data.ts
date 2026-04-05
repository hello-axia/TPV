// pages/api/market-data.ts
import type { NextApiRequest, NextApiResponse } from "next";

export type MarketTicker = {
  symbol: string;
  label: string;
  price: string;
  change: string;
  changePercent: string;
  direction: "up" | "down" | "flat";
};

type CacheEntry = {
  data: MarketTicker[];
  fetchedAt: number;
};

// Server-side cache — 15 min TTL
let cache: CacheEntry | null = null;
const CACHE_TTL = 15 * 60 * 1000;

// Yahoo Finance symbols
const MARKET_TICKERS = [
  { symbol: "%5EGSPC", label: "S&P 500" },
  { symbol: "%5EIXIC", label: "NASDAQ" },
  { symbol: "%5ETNX", label: "10-YR Treasury" }, // replaces Brent Crude
  { symbol: "BTC-USD", label: "Bitcoin" },
  { symbol: "%5EVIX", label: "VIX" },
];

// Gas price is fetched separately from EIA
const GAS_LABEL = "Gas / gal";

function formatPrice(price: number, symbol: string): string {
  if (symbol.includes("BTC")) {
    return "$" + price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  if (symbol.includes("TNX")) {
    // 10-year treasury yields are displayed as percentages
    return price.toFixed(2) + "%";
  }
  if (symbol.includes("VIX") || symbol.includes("GSPC") || symbol.includes("IXIC")) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return "$" + price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function fetchYahooTicker(symbol: string, label: string): Promise<MarketTicker> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!res.ok) throw new Error(`Failed to fetch ${symbol}`);
  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error(`No meta for ${symbol}`);

  const price = meta.regularMarketPrice ?? 0;
  const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? price;
  const change = price - prevClose;
  const pct = prevClose !== 0 ? (change / prevClose) * 100 : 0;

  return {
    symbol,
    label,
    price: formatPrice(price, symbol),
    change: (change >= 0 ? "+" : "") + change.toFixed(2),
    changePercent: (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%",
    direction: change > 0.005 ? "up" : change < -0.005 ? "down" : "flat",
  };
}

// EIA weekly gas price (US regular unleaded, national average)
// Falls back to a static recent value if the API is unavailable
async function fetchGasPrice(): Promise<MarketTicker> {
  try {
    // EIA open data — no API key required for this endpoint
    const url = "https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=DEMO_KEY&frequency=weekly&data[0]=value&facets[series][]=EMM_EPMRU_PTE_NUS_DPG&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=2";
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });

    if (res.ok) {
      const json = await res.json();
      const rows = json?.response?.data ?? [];
      if (rows.length >= 1) {
        const current = parseFloat(rows[0]?.value ?? "0");
        const prev = rows.length >= 2 ? parseFloat(rows[1]?.value ?? String(current)) : current;
        const change = current - prev;
        const pct = prev !== 0 ? (change / prev) * 100 : 0;
        return {
          symbol: "GAS",
          label: GAS_LABEL,
          price: "$" + current.toFixed(2),
          change: (change >= 0 ? "+" : "") + change.toFixed(2),
          changePercent: (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%",
          direction: change > 0.005 ? "up" : change < -0.005 ? "down" : "flat",
        };
      }
    }
  } catch {
    // fall through to static fallback
  }

  // Static fallback — last known value (update periodically)
  return {
    symbol: "GAS",
    label: GAS_LABEL,
    price: "$4.49",
    change: "+0.12",
    changePercent: "+2.7%",
    direction: "up",
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Serve cache if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return res.status(200).json({ tickers: cache.data, cached: true });
  }

  try {
    const [yahooResults, gasTicker] = await Promise.all([
      Promise.allSettled(
        MARKET_TICKERS.map((t) => fetchYahooTicker(t.symbol, t.label))
      ),
      fetchGasPrice(),
    ]);

    const yahooTickers: MarketTicker[] = yahooResults.map((r, i) => {
      if (r.status === "fulfilled") return r.value;
      return {
        symbol: MARKET_TICKERS[i].symbol,
        label: MARKET_TICKERS[i].label,
        price: "—",
        change: "—",
        changePercent: "—",
        direction: "flat" as const,
      };
    });

    // Order: S&P, NASDAQ, 10-YR, Bitcoin, Gas, VIX
    const tickers: MarketTicker[] = [
      yahooTickers[0], // S&P 500
      yahooTickers[1], // NASDAQ
      yahooTickers[2], // 10-YR Treasury
      yahooTickers[3], // Bitcoin
      gasTicker,       // Gas price
      yahooTickers[4], // VIX
    ];

    cache = { data: tickers, fetchedAt: Date.now() };
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate");
    return res.status(200).json({ tickers, cached: false });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch market data" });
  }
}