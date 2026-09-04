import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Activity, Radio, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TrafficChart({ anomalyEventCount = 0 }) {
  const { t } = useLanguage();
  const [timePeriod, setTimePeriod] = useState('Live');
  const [filterView, setFilterView] = useState('ALL');

  const [chartData, setChartData] = useState({
    labels: ['18:10', '18:12', '18:14', '18:16', '18:18', '18:20', '18:22', '18:24', '18:26', '18:28'],
    normalTraffic: [128, 145, 132, 168, 142, 175, 155, 185, 162, 178],
    anomalousSpikes: [12, 15, 18, 14, 42, 16, 15, 68, 22, 38],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        const newLabels = [...prev.labels.slice(1), timeStr];
        const newNormal = [...prev.normalTraffic.slice(1), Math.floor(135 + Math.random() * 45)];
        const randomSpike = Math.random() > 0.7 ? Math.floor(25 + Math.random() * 35) : Math.floor(10 + Math.random() * 8);
        const newAnomalies = [...prev.anomalousSpikes.slice(1), randomSpike];

        return {
          labels: newLabels,
          normalTraffic: newNormal,
          anomalousSpikes: newAnomalies
        };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (anomalyEventCount > 0) {
      setChartData(prev => {
        const updatedAnomalies = [...prev.anomalousSpikes];
        updatedAnomalies[updatedAnomalies.length - 1] = Math.floor(65 + Math.random() * 25);
        return {
          ...prev,
          anomalousSpikes: updatedAnomalies
        };
      });
    }
  }, [anomalyEventCount]);

  const datasets = [];

  if (filterView === 'ALL' || filterView === 'NORMAL') {
    datasets.push({
      label: t('chartLegendIngestion', 'Normal Telemetry (Req/s)'),
      data: chartData.normalTraffic,
      borderColor: '#8b5cf6', // Vibrant Purple
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 280);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.35)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.00)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#a855f7',
      pointBorderColor: '#151220',
      pointBorderWidth: 2,
      borderWidth: 2.5,
    });
  }

  if (filterView === 'ALL' || filterView === 'ANOMALIES') {
    datasets.push({
      label: t('chartLegendAnomalies', 'Anomalous Spikes (Comparison)'),
      data: chartData.anomalousSpikes,
      borderColor: '#facc15', // Warm Yellow/Gold
      backgroundColor: 'transparent',
      borderDash: [5, 5], // Dashed Line
      fill: false,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointBackgroundColor: '#facc15',
      pointBorderColor: '#151220',
      pointBorderWidth: 2,
      borderWidth: 2.5,
    });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#151220',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: '#8b5cf6',
        borderWidth: 1.5,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: '700' },
        bodyFont: { family: 'Plus Jakarta Sans', size: 11 },
        callbacks: {
          label: function(context) {
            return ` ${context.dataset.label}: ${context.parsed.y} events/s`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.025)',
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', size: 10 }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.025)',
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', size: 10 }
        }
      }
    },
    animation: {
      duration: 650,
      easing: 'easeInOutQuad'
    }
  };

  return (
    <div className="saas-card p-6 relative">
      
      {/* Header: Title & Time Period Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {t('chartTitle', 'Real-Time Traffic & Anomaly Pulse')}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('chartSub', 'Streaming sliding-window authentication volume vs. anomaly threshold triggers')}
          </p>
        </div>

        {/* Time Period Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0d0a14] border border-[#231d38]">
          {[
            { id: 'Live', label: 'Live' },
            { id: '15M', label: t('tab15m', '15 Mins') },
            { id: '1H', label: t('tab1h', '1 Hour') },
            { id: '24H', label: t('tab24h', '24 Hours') }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTimePeriod(item.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                timePeriod === item.id
                  ? 'bg-[#251e3b] text-purple-300 shadow-sm border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Series Indicator Legend & Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-[#231d38]/50">
        <div className="flex items-center gap-5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]"></span>
            <span className="text-slate-200 font-medium">{t('chartLegendIngestion', 'Normal Telemetry (Solid Purple)')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-b-2 border-dashed border-yellow-400"></span>
            <span className="text-yellow-300 font-medium">{t('chartLegendAnomalies', 'Anomalous Bursts (Dashed Gold)')}</span>
          </div>
        </div>

        {/* View Mode Filters */}
        <div className="flex items-center gap-1 text-[11px]">
          <button
            onClick={() => setFilterView('ALL')}
            className={`px-2 py-0.5 rounded-lg transition-colors ${filterView === 'ALL' ? 'text-purple-300 font-bold bg-purple-500/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {t('filterAll', 'Combined')}
          </button>
          <span className="text-slate-600">•</span>
          <button
            onClick={() => setFilterView('ANOMALIES')}
            className={`px-2 py-0.5 rounded-lg transition-colors ${filterView === 'ANOMALIES' ? 'text-yellow-300 font-bold bg-yellow-400/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {t('filterAnomalies', 'Spikes Only')}
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        <Line data={{ labels: chartData.labels, datasets }} options={options} />
      </div>

      {/* Telemetry Status Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3.5 border-t border-[#231d38]/80 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">{t('statPeakRate', 'Peak Rate')}:</span>
          <span className="text-yellow-400 font-bold">54 req/s</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">{t('statWindow', 'Heuristic Window')}:</span>
          <span className="text-slate-200 font-semibold">{t('baselineStable', '30s Sliding')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">{t('statBaseline', 'Baseline')}:</span>
          <span className="text-purple-300 font-semibold">{t('baselineStable', 'STABLE (12s)')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">{t('statusDispatched', 'LLM Queue')}:</span>
          <span className="text-emerald-400 font-semibold">0 Pending</span>
        </div>
      </div>

    </div>
  );
}


