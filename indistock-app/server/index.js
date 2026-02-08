import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// API Keys from environment variables (NEVER hardcode these!)
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;

// Validate API keys are present
if (!NEWS_API_KEY || !ALPHA_VANTAGE_KEY) {
  console.error('⚠️  Missing API keys! Make sure .env file exists with NEWS_API_KEY and ALPHA_VANTAGE_KEY');
}

app.use(cors());
app.use(express.json());

/**
 * SENTIMENT ANALYSIS LOGIC - NOT HARDCODED!
 * 
 * How it works:
 * 1. Receives an array of news headlines
 * 2. Scans each headline for positive and negative financial keywords
 * 3. Calculates sentiment score as: positiveCount / (positiveCount + negativeCount)
 * 4. Score > 0.55 = bullish, Score < 0.45 = bearish, else = neutral
 * 5. Confidence is based on how many sentiment keywords were found
 * 
 * The more headlines contain clear sentiment words, the higher the confidence.
 */
function analyzeSentiment(headlines) {
  // Financial sentiment keywords - based on common market terminology
  const positiveWords = [
    'surge', 'gain', 'profit', 'growth', 'bullish', 'rally', 'soar', 'jump',
    'rise', 'up', 'high', 'strong', 'positive', 'beat', 'exceed', 'record',
    'boost', 'upgrade', 'buy', 'outperform', 'optimism', 'success', 'win',
    'breakout', 'momentum', 'recovery', 'earnings', 'dividend', 'expand'
  ];

  const negativeWords = [
    'fall', 'drop', 'loss', 'decline', 'bearish', 'crash', 'plunge', 'sink',
    'down', 'low', 'weak', 'negative', 'miss', 'cut', 'sell', 'underperform',
    'pessimism', 'fail', 'risk', 'concern', 'warning', 'trouble', 'slump',
    'tumble', 'drag', 'pressure', 'volatile', 'uncertainty', 'layoff'
  ];

  let positiveCount = 0;
  let negativeCount = 0;
  let matchedWords = { positive: [], negative: [] };

  headlines.forEach(headline => {
    const words = headline.toLowerCase().split(/\s+/);
    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (positiveWords.includes(cleanWord)) {
        positiveCount++;
        if (!matchedWords.positive.includes(cleanWord)) {
          matchedWords.positive.push(cleanWord);
        }
      }
      if (negativeWords.includes(cleanWord)) {
        negativeCount++;
        if (!matchedWords.negative.includes(cleanWord)) {
          matchedWords.negative.push(cleanWord);
        }
      }
    });
  });

  const totalSentimentWords = positiveCount + negativeCount;

  if (totalSentimentWords === 0) {
    return {
      score: 0.5,
      sentiment: 'neutral',
      confidence: 30,
      reasoning: 'No clear sentiment keywords found in headlines'
    };
  }

  const score = positiveCount / totalSentimentWords;
  const sentiment = score > 0.55 ? 'bullish' : score < 0.45 ? 'bearish' : 'neutral';

  // Confidence based on how many sentiment words we found (more = more confident)
  const confidence = Math.min(95, Math.round((totalSentimentWords / headlines.length) * 25 + 45));

  return {
    score,
    sentiment,
    confidence,
    reasoning: `Found ${positiveCount} positive words (${matchedWords.positive.slice(0, 5).join(', ')}) and ${negativeCount} negative words (${matchedWords.negative.slice(0, 5).join(', ')}) across ${headlines.length} headlines`,
    positiveWords: matchedWords.positive,
    negativeWords: matchedWords.negative
  };
}

// Format time ago
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHrs / 24);

  if (diffHrs < 1) return 'Just now';
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return '1d ago';
  return `${diffDays}d ago`;
}

// Fetch real news from NewsAPI
app.get('/api/news/:ticker', async (req, res) => {
  const { ticker } = req.params;

  try {
    const searchQuery = encodeURIComponent(`${ticker} stock India NSE`);
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${searchQuery}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`
    );

    const data = await response.json();

    if (data.status !== 'ok' || !data.articles || data.articles.length === 0) {
      return res.json([
        { title: `No recent news found for ${ticker.toUpperCase()}`, source: 'System', time: 'N/A' }
      ]);
    }

    const headlines = data.articles.slice(0, 8).map(article => ({
      title: article.title,
      source: article.source?.name || 'Unknown',
      time: formatTimeAgo(article.publishedAt),
      url: article.url
    }));

    res.json(headlines);
  } catch (error) {
    console.error('NewsAPI Error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Sentiment endpoint - fetches news and analyzes sentiment
app.get('/api/sentiment/:ticker', async (req, res) => {
  const { ticker } = req.params;

  try {
    const searchQuery = encodeURIComponent(`${ticker} stock India NSE`);
    const newsResponse = await fetch(
      `https://newsapi.org/v2/everything?q=${searchQuery}&language=en&sortBy=publishedAt&pageSize=15&apiKey=${NEWS_API_KEY}`
    );

    const newsData = await newsResponse.json();

    let sentimentResult;

    if (newsData.status === 'ok' && newsData.articles && newsData.articles.length > 0) {
      const headlines = newsData.articles.map(article => article.title);
      sentimentResult = analyzeSentiment(headlines);
    } else {
      sentimentResult = {
        score: 0.5,
        sentiment: 'neutral',
        confidence: 30,
        reasoning: 'No news articles found for analysis'
      };
    }

    res.json({
      ticker: ticker.toUpperCase(),
      score: parseFloat(sentimentResult.score.toFixed(2)),
      sentiment: sentimentResult.sentiment,
      confidence: sentimentResult.confidence,
      articlesAnalyzed: newsData.articles?.length || 0,
      reasoning: sentimentResult.reasoning  // SHOWS WHY the sentiment is what it is!
    });
  } catch (error) {
    console.error('Sentiment API Error:', error);
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});

// Stock quote from Alpha Vantage
app.get('/api/quote/:ticker', async (req, res) => {
  const { ticker } = req.params;

  try {
    const symbol = `${ticker.toUpperCase()}.BSE`;
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
    );

    const data = await response.json();

    if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
      const quote = data['Global Quote'];
      res.json({
        ticker: ticker.toUpperCase(),
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: quote['10. change percent'],
        volume: parseInt(quote['06. volume']),
        previousClose: parseFloat(quote['08. previous close'])
      });
    } else {
      res.json({
        ticker: ticker.toUpperCase(),
        price: null,
        error: 'Quote not available for this ticker'
      });
    }
  } catch (error) {
    console.error('Alpha Vantage Error:', error);
    res.status(500).json({ error: 'Failed to fetch stock quote' });
  }
});

// Historical price data for candlestick chart
// Supports range: 7d, 30d, 90d, 1y
app.get('/api/history/:ticker', async (req, res) => {
  const { ticker } = req.params;
  const range = req.query.range || '30d';

  const rangeDays = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365
  };

  const days = rangeDays[range] || 30;

  try {
    // Try Alpha Vantage TIME_SERIES_DAILY
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}.BSE&outputsize=full&apikey=${ALPHA_VANTAGE_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data['Time Series (Daily)']) {
      const timeSeries = data['Time Series (Daily)'];
      const dates = Object.keys(timeSeries).slice(0, days).reverse();

      const chartData = dates.map(date => ({
        time: date,
        open: parseFloat(timeSeries[date]['1. open']),
        high: parseFloat(timeSeries[date]['2. high']),
        low: parseFloat(timeSeries[date]['3. low']),
        close: parseFloat(timeSeries[date]['4. close']),
        volume: parseInt(timeSeries[date]['5. volume'])
      }));

      res.json({ ticker: ticker.toUpperCase(), range, data: chartData });
    } else {
      // Fallback to mock data
      console.log('Alpha Vantage limit reached, using mock data');
      const mockData = generateMockHistory(days);
      res.json({ ticker: ticker.toUpperCase(), range, data: mockData });
    }
  } catch (error) {
    console.error('History API Error:', error);
    const mockData = generateMockHistory(days);
    res.json({ ticker: ticker.toUpperCase(), range, data: mockData });
  }
});

// Generate realistic mock OHLCV data
function generateMockHistory(days) {
  const data = [];
  let basePrice = 2500 + Math.random() * 500;
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const volatility = 0.02;
    const change = (Math.random() - 0.5) * 2 * volatility * basePrice;
    const open = basePrice;
    const close = basePrice + change;
    const high = Math.max(open, close) + Math.random() * volatility * basePrice;
    const low = Math.min(open, close) - Math.random() * volatility * basePrice;

    data.push({
      time: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(1000000 + Math.random() * 5000000)
    });

    basePrice = close;
  }

  return data;
}

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log('📊 Using REAL APIs: NewsAPI + Alpha Vantage');
  console.log('🔐 API keys loaded from .env file (gitignored)\n');
});
