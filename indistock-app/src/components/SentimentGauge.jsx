import React from 'react';

const SentimentGauge = ({ score = 0.5, sentiment = 'Neutral', confidence = 0 }) => {
  // score is 0-1 from API. Convert to 0-100 for display
  const scorePercent = Math.round(score * 100);
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * Math.PI;
  const strokeDashoffset = circumference - scorePercent / 100 * circumference;

  const getSentimentColor = () => {
    if (scorePercent >= 60) return '#00ff88'; // Bullish
    if (scorePercent <= 40) return '#ff4444'; // Bearish
    return '#ffbb33'; // Neutral
  };

  return (
    <div className="flex flex-col items-center p-6 bg-[#161b22] border border-[#30363d] rounded-xl shadow-lg w-full max-w-sm">
      <h3 className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">Market Sentiment</h3>

      <div className="relative flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="#30363d"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset: 0, strokeLinecap: 'round' }}
          />
          {/* Progress circle */}
          <circle
            stroke={getSentimentColor()}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out', strokeLinecap: 'round' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{scorePercent}%</span>
          <span className="text-xs text-gray-400 uppercase tracking-tighter">Score</span>
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className={`text-2xl font-bold mb-1 ${scorePercent >= 60 ? 'text-[#00ff88]' : scorePercent <= 40 ? 'text-[#ff4444]' : 'text-[#ffbb33]'}`}>
          {sentiment}
        </div>
        <div className="text-gray-400 text-xs">
          Confidence: <span className="text-white">{confidence.toFixed(0)}%</span>
        </div>
      </div>

      <div className="w-full mt-6 flex justify-between text-[10px] text-gray-500 uppercase font-bold px-2">
        <span>Bearish</span>
        <span>Bullish</span>
      </div>
      <div className="w-full h-1.5 bg-[#30363d] rounded-full mt-1 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#ff4444] via-[#ffbb33] to-[#00ff88]"
          style={{ width: '100%' }}
        ></div>
      </div>
    </div>
  );
};

export default SentimentGauge;
