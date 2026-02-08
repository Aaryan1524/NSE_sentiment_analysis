import { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Newspaper, Activity, BarChart3, Clock, ExternalLink, Zap } from 'lucide-react';
import StockChart from './components/StockChart';

function App() {
  const [ticker, setTicker] = useState('');
  const [sentimentData, setSentimentData] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [chartRange, setChartRange] = useState('30d');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!ticker.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const [sentimentRes, newsRes, historyRes] = await Promise.all([
        fetch(`http://localhost:3001/api/sentiment/${ticker}`),
        fetch(`http://localhost:3001/api/news/${ticker}`),
        fetch(`http://localhost:3001/api/history/${ticker}?range=${chartRange}`)
      ]);

      if (!sentimentRes.ok || !newsRes.ok || !historyRes.ok) {
        throw new Error('API request failed');
      }

      const sentiment = await sentimentRes.json();
      const news = await newsRes.json();
      const history = await historyRes.json();

      setSentimentData(sentiment);
      setNewsData(news);
      setHistoryData(history.data || []);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleRangeChange = async (range) => {
    setChartRange(range);
    if (sentimentData?.ticker) {
      try {
        const res = await fetch(`http://localhost:3001/api/history/${sentimentData.ticker}?range=${range}`);
        const data = await res.json();
        setHistoryData(data.data || []);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      }
    }
  };

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Header */}
      <header className="glass-strong sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white tracking-tight">IndiStock</h1>
                <p className="text-xs text-zinc-500">NSE Sentiment Analysis</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-2 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700 transition-all">
                <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  placeholder="Search NSE ticker..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg btn-premium disabled:opacity-50 flex-shrink-0"
                >
                  {loading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="data-badge text-emerald-400">LIVE</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {!sentimentData && !loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
              <BarChart3 className="w-10 h-10 text-zinc-600" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Search for a Stock</h2>
            <p className="text-zinc-500 text-center max-w-md">
              Enter an NSE ticker symbol like <span className="text-zinc-300 font-medium">RELIANCE</span>, <span className="text-zinc-300 font-medium">TCS</span>, or <span className="text-zinc-300 font-medium">INFY</span> to analyze market sentiment.
            </p>
          </div>
        )}

        {loading && <SkeletonLoader />}

        {sentimentData && !loading && (
          <>
            {/* Ticker Header */}
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-3xl font-bold text-white font-mono-numbers">{sentimentData.ticker}</h2>
              <span className={`data-badge ${sentimentData.sentiment === 'bullish' ? 'text-emerald-400 bg-emerald-500/10' : sentimentData.sentiment === 'bearish' ? 'text-red-400 bg-red-500/10' : 'text-zinc-400 bg-zinc-500/10'}`}>
                {sentimentData.sentiment.toUpperCase()}
              </span>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-12 gap-4">

              {/* Sentiment Score - Large */}
              <div className={`col-span-12 md:col-span-4 bento-card p-6 ${sentimentData.sentiment === 'bullish' ? 'glow-success' : sentimentData.sentiment === 'bearish' ? 'glow-danger' : ''}`}>
                <div className="flex items-center gap-2 mb-6">
                  <Zap className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Sentiment Score</span>
                </div>

                <div className="flex items-center justify-center mb-6">
                  <SentimentGauge score={sentimentData.score} sentiment={sentimentData.sentiment} />
                </div>

                <div className="flex items-center justify-center gap-2">
                  {sentimentData.sentiment === 'bullish' ? (
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  ) : sentimentData.sentiment === 'bearish' ? (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  ) : (
                    <Activity className="w-5 h-5 text-zinc-500" />
                  )}
                  <span className={`text-lg font-semibold ${sentimentData.sentiment === 'bullish' ? 'text-emerald-400' : sentimentData.sentiment === 'bearish' ? 'text-red-400' : 'text-zinc-400'}`}>
                    {sentimentData.sentiment.charAt(0).toUpperCase() + sentimentData.sentiment.slice(1)}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="col-span-12 md:col-span-4 grid grid-rows-2 gap-4">
                {/* Confidence */}
                <div className="bento-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Confidence</span>
                    <Activity className="w-4 h-4 text-zinc-600" />
                  </div>
                  <div className="text-3xl font-bold text-white font-mono-numbers">{sentimentData.confidence}%</div>
                  <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                      style={{ width: `${sentimentData.confidence}%` }}
                    ></div>
                  </div>
                </div>

                {/* Articles Analyzed */}
                <div className="bento-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Sources Analyzed</span>
                    <Newspaper className="w-4 h-4 text-zinc-600" />
                  </div>
                  <div className="text-3xl font-bold text-white font-mono-numbers">{sentimentData.articlesAnalyzed}</div>
                  <p className="text-xs text-zinc-500 mt-1">News articles processed</p>
                </div>
              </div>

              {/* Reasoning */}
              <div className="col-span-12 md:col-span-4 bento-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Analysis Reasoning</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {sentimentData.reasoning || 'Sentiment calculated based on keyword analysis of news headlines.'}
                </p>
              </div>

              {/* Stock Price Chart - Full Width */}
              <div className="col-span-12">
                <StockChart
                  ticker={sentimentData.ticker}
                  data={historyData}
                  selectedRange={chartRange}
                  onRangeChange={handleRangeChange}
                />
              </div>

              {/* News Feed - Full Width */}
              <div className="col-span-12 bento-card overflow-hidden">
                <div className="p-5 border-b border-zinc-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm font-medium text-white">Latest News</span>
                  </div>
                  <span className="text-xs text-zinc-500">{newsData.length} articles</span>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {newsData.map((item, index) => (
                    <a
                      key={index}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="news-item block p-4 border-b border-zinc-800/30 last:border-0"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm text-zinc-200 font-medium leading-snug mb-2 line-clamp-2 group-hover:text-white">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-zinc-500">
                            <span className="px-2 py-0.5 bg-zinc-800/50 rounded text-zinc-400">{item.source}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.time}
                            </span>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-1" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <p className="text-xs text-zinc-600">© 2026 IndiStock. Real-time NSE sentiment analysis.</p>
          <p className="text-xs text-zinc-600">Powered by NewsAPI + Alpha Vantage</p>
        </div>
      </footer>
    </div>
  );
}

// Premium Sentiment Gauge Component
function SentimentGauge({ score, sentiment }) {
  const percentage = Math.round(score * 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score * circumference);

  const getColor = () => {
    if (sentiment === 'bullish') return '#10b981';
    if (sentiment === 'bearish') return '#ef4444';
    return '#71717a';
  };

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background arc */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#27272a"
          strokeWidth="8"
        />
        {/* Progress arc */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="gauge-arc"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white font-mono-numbers">{percentage}%</span>
        <span className="text-xs text-zinc-500 uppercase tracking-wider">Score</span>
      </div>
    </div>
  );
}

// Skeleton Loader Component
function SkeletonLoader() {
  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Large card skeleton */}
      <div className="col-span-12 md:col-span-4 bento-card p-6">
        <div className="skeleton h-4 w-24 mb-6"></div>
        <div className="flex justify-center mb-6">
          <div className="skeleton w-32 h-32 rounded-full"></div>
        </div>
        <div className="skeleton h-6 w-20 mx-auto"></div>
      </div>

      {/* Stats skeleton */}
      <div className="col-span-12 md:col-span-4 grid grid-rows-2 gap-4">
        <div className="bento-card p-5">
          <div className="skeleton h-3 w-20 mb-4"></div>
          <div className="skeleton h-8 w-16 mb-3"></div>
          <div className="skeleton h-2 w-full"></div>
        </div>
        <div className="bento-card p-5">
          <div className="skeleton h-3 w-24 mb-4"></div>
          <div className="skeleton h-8 w-12 mb-2"></div>
          <div className="skeleton h-3 w-32"></div>
        </div>
      </div>

      {/* Reasoning skeleton */}
      <div className="col-span-12 md:col-span-4 bento-card p-5">
        <div className="skeleton h-3 w-28 mb-4"></div>
        <div className="skeleton h-4 w-full mb-2"></div>
        <div className="skeleton h-4 w-3/4 mb-2"></div>
        <div className="skeleton h-4 w-5/6"></div>
      </div>

      {/* News skeleton */}
      <div className="col-span-12 bento-card">
        <div className="p-5 border-b border-zinc-800/50">
          <div className="skeleton h-4 w-24"></div>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 border-b border-zinc-800/30">
            <div className="skeleton h-4 w-full mb-2"></div>
            <div className="skeleton h-4 w-2/3 mb-3"></div>
            <div className="flex gap-3">
              <div className="skeleton h-5 w-20"></div>
              <div className="skeleton h-5 w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;