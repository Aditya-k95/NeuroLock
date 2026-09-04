import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Sliders,
  AlertTriangle,
  Flame,
  Layers
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TrafficTrendChart() {
  const [timeRangeDays, setTimeRangeDays] = useState(7);
  const [viewMode, setViewMode] = useState('RISK_TREND'); // 'RISK_TREND' | 'SEVERITY_TIERS' | 'MULTI_VECTOR'
  const [isLoading, setIsLoading] = useState(true);
  const [historyData, setHistoryData] = useState(null);
  const [error, setError] = useState(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

  const fetchHistory = useCallback(async (days) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiBaseUrl}/alerts/history?days=${days}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch history (HTTP ${res.status})`);
      }
      const json = await res.json();
      if (json.success) {
        setHistoryData(json);
        setLastRefreshedAt(new Date());
      } else {
        throw new Error(json.error || 'Invalid API response format');
      }
    } catch (err) {
      console.warn('[TrafficTrendChart] API fetch error:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(timeRangeDays);
  }, [timeRangeDays, fetchHistory]);

  const timeline = historyData?.timeline || [];
  const summary = historyData?.summary || {
    avgRiskScore: 0,
    peakRiskScore: 0,
    totalIncidents: 0,
    criticalTotal: 0,
    highTotal: 0,
    mediumTotal: 0,
    lowTotal: 0,
    trendDelta: 0,
    trendDirection: 'STABLE'
  };

  const labels = timeline.map((item) => item.label);

  const datasets = [];

  if (viewMode === 'RISK_TREND') {
    datasets.push(
      {
        label: 'Peak Risk Score Spike',
        data: timeline.map((t) => t.maxRiskScore),
        borderColor: 'rgba(230, 26, 60, 0.4)',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 2,
        pointHoverRadius: 5,
        pointBackgroundColor: '#E61A3C',
        tension: 0.3
      },
      {
        label: 'Average Incident Risk Score (0-100)',
        data: timeline.map((t) => t.avgRiskScore),
        borderColor: '#C70F30', // Crimson Glow Accent
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(199, 15, 48, 0.15)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(199, 15, 48, 0.45)');
          gradient.addColorStop(0.5, 'rgba(179, 143, 111, 0.15)');
          gradient.addColorStop(1, 'rgba(22, 22, 22, 0.02)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#C70F30',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 1.5,
        borderWidth: 3
      }
    );
  } else if (viewMode === 'SEVERITY_TIERS') {
    datasets.push(
      {
        label: 'Critical Threats',
        data: timeline.map((t) => t.critical),
        borderColor: '#C70F30',
        backgroundColor: 'rgba(199, 15, 48, 0.25)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        borderWidth: 2
      },
      {
        label: 'High Severity Alerts',
        data: timeline.map((t) => t.high),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        borderWidth: 2
      },
      {
        label: 'Medium / Low Anomalies',
        data: timeline.map((t) => t.medium + t.low),
        borderColor: '#B38F6F',
        backgroundColor: 'rgba(179, 143, 111, 0.08)',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 1.5
      }
    );
  } else if (viewMode === 'MULTI_VECTOR') {
    datasets.push(
      {
        label: 'Deterministic Rule Score',
        data: timeline.map((t) => t.avgRuleScore),
        borderColor: '#B38F6F', // Sand Gold
        backgroundColor: 'rgba(179, 143, 111, 0.1)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        borderWidth: 2
      },
      {
        label: 'Statistical ML Anomaly Score',
        data: timeline.map((t) => t.avgAnomalyScore),
        borderColor: '#06B6D4', // Cyan ML vector
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        borderWidth: 2
      },
      {
        label: 'Fused Risk Score',
        data: timeline.map((t) => t.avgRiskScore),
        borderColor: '#C70F30', // Crimson
        backgroundColor: 'rgba(199, 15, 48, 0.2)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        borderWidth: 2.5
      }
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#161616',
        titleColor: '#F2F1ED',
        bodyColor: '#E4E2DC',
        borderColor: '#710014',
        borderWidth: 1.5,
        padding: 12,
        boxPadding: 6,
        titleFont: { family: 'JetBrains Mono', size: 12, weight: 'bold' },
        bodyFont: { family: 'JetBrains Mono', size: 11 },
        callbacks: {
          label: (context) => {
            const unit = viewMode === 'SEVERITY_TIERS' ? 'incidents' : 'pts (0-100)';
            return ` ${context.dataset.label}: ${context.parsed.y} ${unit}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(242, 241, 237, 0.04)',
          drawBorder: false
        },
        ticks: {
          color: '#A8A499',
          font: { family: 'JetBrains Mono', size: 10 }
        }
      },
      y: {
        min: 0,
        max: viewMode === 'SEVERITY_TIERS' ? undefined : 100,
        grid: {
          color: 'rgba(242, 241, 237, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#A8A499',
          font: { family: 'JetBrains Mono', size: 10 },
          stepSize: viewMode === 'SEVERITY_TIERS' ? 2 : 20,
          callback: (value) => (viewMode === 'SEVERITY_TIERS' ? value : `${value}`)
        }
      }
    },
    animation: {
      duration: 600,
      easing: 'easeInOutCubic'
    }
  };

  return (
    <div className="cyber-panel p-5 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-crimson-700/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-crimson-400" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-pearl-100">
              Threat Severity & Risk Trend ({timeRangeDays}D Historical)
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-crimson-900/50 text-crimson-300 border border-crimson-700/50">
              {timeRangeDays === 7 ? '7-Day Rolling' : '30-Day Enterprise Horizon'}
            </span>
          </div>
          <p className="text-xs text-pearl-400 font-mono mt-0.5">
            Aggregated historical risk scores, threat spikes, and multi-vector anomaly posture over time
          </p>
        </div>

        {/* View Mode & Range Selectors */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-obsidian-900 border border-obsidian-700 text-xs font-mono">
            <button
              onClick={() => setViewMode('RISK_TREND')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
                viewMode === 'RISK_TREND'
                  ? 'bg-crimson-700/30 text-crimson-300 font-semibold border border-crimson-600/40'
                  : 'text-pearl-400 hover:text-pearl-100'
              }`}
              title="Continuous composite risk score trajectory"
            >
              <Flame className="w-3 h-3" />
              <span>Risk Curve</span>
            </button>
            <button
              onClick={() => setViewMode('SEVERITY_TIERS')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
                viewMode === 'SEVERITY_TIERS'
                  ? 'bg-sand-500/20 text-sand-300 font-semibold border border-sand-500/30'
                  : 'text-pearl-400 hover:text-pearl-100'
              }`}
              title="Critical, High, Medium incident volume breakdown"
            >
              <ShieldAlert className="w-3 h-3" />
              <span>Severity Tiers</span>
            </button>
            <button
              onClick={() => setViewMode('MULTI_VECTOR')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
                viewMode === 'MULTI_VECTOR'
                  ? 'bg-obsidian-750 text-pearl-100 font-semibold border border-obsidian-600'
                  : 'text-pearl-400 hover:text-pearl-100'
              }`}
              title="Comparison of Rule Engine vs ML Anomaly Scores"
            >
              <Layers className="w-3 h-3" />
              <span>Multi-Vector</span>
            </button>
          </div>

          {/* Time Range Selector: 7D / 30D */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-obsidian-900 border border-obsidian-700 text-xs font-mono">
            <button
              onClick={() => setTimeRangeDays(7)}
              className={`px-2.5 py-1 rounded transition-colors ${
                timeRangeDays === 7
                  ? 'bg-sand-500 text-obsidian-950 font-bold'
                  : 'text-pearl-400 hover:text-pearl-100'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setTimeRangeDays(30)}
              className={`px-2.5 py-1 rounded transition-colors ${
                timeRangeDays === 30
                  ? 'bg-sand-500 text-obsidian-950 font-bold'
                  : 'text-pearl-400 hover:text-pearl-100'
              }`}
            >
              30D
            </button>
          </div>

          {/* Manual Refresh Trigger */}
          <button
            onClick={() => fetchHistory(timeRangeDays)}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-obsidian-900 border border-obsidian-700 hover:border-sand-500/60 text-pearl-400 hover:text-pearl-100 transition-colors disabled:opacity-50"
            title="Refresh historical telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sand-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="p-3 rounded-xl bg-obsidian-900/80 border border-obsidian-750">
          <div className="flex items-center justify-between text-[11px] font-mono text-pearl-400">
            <span>Period Avg Risk</span>
            <span className="text-sand-400 font-bold">{timeRangeDays}D</span>
          </div>
          <div className="text-lg font-mono font-bold text-pearl-100 mt-1 flex items-baseline gap-2">
            <span>{summary.avgRiskScore}</span>
            <span className="text-xs text-pearl-500 font-normal">/ 100</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-obsidian-900/80 border border-obsidian-750">
          <div className="flex items-center justify-between text-[11px] font-mono text-pearl-400">
            <span>Peak Threat Spike</span>
            <Flame className="w-3.5 h-3.5 text-crimson-400" />
          </div>
          <div className="text-lg font-mono font-bold text-crimson-400 mt-1 flex items-baseline gap-2">
            <span>{summary.peakRiskScore}</span>
            <span className="text-xs text-crimson-500/80 font-normal">MAX</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-obsidian-900/80 border border-obsidian-750">
          <div className="flex items-center justify-between text-[11px] font-mono text-pearl-400">
            <span>Critical Incidents</span>
            <ShieldAlert className="w-3.5 h-3.5 text-crimson-400" />
          </div>
          <div className="text-lg font-mono font-bold text-pearl-100 mt-1 flex items-baseline gap-2">
            <span>{summary.criticalTotal}</span>
            <span className="text-xs text-pearl-500 font-normal">/ {summary.totalIncidents} Total</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-obsidian-900/80 border border-obsidian-750">
          <div className="flex items-center justify-between text-[11px] font-mono text-pearl-400">
            <span>Posture Velocity</span>
            {summary.trendDelta > 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-crimson-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </div>
          <div
            className={`text-lg font-mono font-bold mt-1 ${
              summary.trendDelta > 0
                ? 'text-crimson-400'
                : summary.trendDelta < 0
                ? 'text-emerald-400'
                : 'text-pearl-200'
            }`}
          >
            {summary.trendDelta > 0 ? `+${summary.trendDelta}%` : `${summary.trendDelta}%`}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full relative">
        {isLoading && !historyData && (
          <div className="absolute inset-0 flex items-center justify-center bg-obsidian-950/70 z-20 backdrop-blur-sm rounded-xl">
            <div className="flex items-center gap-2 text-xs font-mono text-sand-300">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Synthesizing historical risk metrics...</span>
            </div>
          </div>
        )}
        <Line data={{ labels, datasets }} options={chartOptions} />
      </div>

      {/* Legend & Telemetry Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-obsidian-750 text-[11px] font-mono text-pearl-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-crimson-500"></span>
            <span className="text-pearl-200">Continuous Risk Score</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-crimson-400 border-dashed"></span>
            <span className="text-pearl-400">Peak Spike Ceiling</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sand-400"></span>
            <span className="text-sand-300">Baseline Target (0-20)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-pearl-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {lastRefreshedAt
              ? `Synced at ${lastRefreshedAt.toLocaleTimeString()}`
              : 'Streaming active'}
          </span>
        </div>
      </div>
    </div>
  );
}
