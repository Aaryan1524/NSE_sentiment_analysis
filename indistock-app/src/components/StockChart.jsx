import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';

const TIME_RANGES = [
    { label: '7D', value: '7d' },
    { label: '1M', value: '30d' },
    { label: '3M', value: '90d' },
    { label: '1Y', value: '1y' }
];

export default function StockChart({ ticker, data, onRangeChange, selectedRange = '30d' }) {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);

    // Initialize chart once
    useEffect(() => {
        if (!chartContainerRef.current) return;

        try {
            // Create chart with dark theme (v5 API)
            const chart = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: 'solid', color: '#09090b' },
                    textColor: '#a1a1aa',
                },
                grid: {
                    vertLines: { color: '#27272a' },
                    horzLines: { color: '#27272a' },
                },
                crosshair: {
                    mode: 1,
                    vertLine: {
                        color: '#71717a',
                        width: 1,
                        style: 2,
                    },
                    horzLine: {
                        color: '#71717a',
                        width: 1,
                        style: 2,
                    },
                },
                rightPriceScale: {
                    borderColor: '#27272a',
                },
                timeScale: {
                    borderColor: '#27272a',
                    timeVisible: true,
                    secondsVisible: false,
                },
                width: chartContainerRef.current.clientWidth || 600,
                height: 300,
            });

            chartRef.current = chart;

            // Add candlestick series (v5 API uses addSeries with type)
            const candlestickSeries = chart.addSeries(CandlestickSeries, {
                upColor: '#10b981',
                downColor: '#ef4444',
                borderDownColor: '#ef4444',
                borderUpColor: '#10b981',
                wickDownColor: '#ef4444',
                wickUpColor: '#10b981',
            });

            seriesRef.current = candlestickSeries;

            // Handle resize
            const handleResize = () => {
                if (chartContainerRef.current && chartRef.current) {
                    chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
                }
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                if (chartRef.current) {
                    chartRef.current.remove();
                    chartRef.current = null;
                    seriesRef.current = null;
                }
            };
        } catch (error) {
            console.error('Chart initialization error:', error);
        }
    }, []);

    // Update data when it changes
    useEffect(() => {
        if (seriesRef.current && data && Array.isArray(data) && data.length > 0) {
            try {
                seriesRef.current.setData(data);
                if (chartRef.current) {
                    chartRef.current.timeScale().fitContent();
                }
            } catch (error) {
                console.error('Chart data update error:', error);
            }
        }
    }, [data]);

    // Show loading state if no data
    if (!data || data.length === 0) {
        return (
            <div className="bento-card p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Price Chart</span>
                    </div>
                    <div className="flex gap-1">
                        {TIME_RANGES.map((range) => (
                            <button
                                key={range.value}
                                onClick={() => onRangeChange?.(range.value)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${selectedRange === range.value
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-300'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-[300px] flex items-center justify-center">
                    <div className="skeleton w-full h-full"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bento-card p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Price Chart</span>
                </div>

                {/* Time Range Selector */}
                <div className="flex gap-1">
                    {TIME_RANGES.map((range) => (
                        <button
                            key={range.value}
                            onClick={() => onRangeChange?.(range.value)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${selectedRange === range.value
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-300'
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            <div ref={chartContainerRef} className="w-full" style={{ minHeight: '300px' }} />
        </div>
    );
}
