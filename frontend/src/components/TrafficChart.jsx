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
import { Activity } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState('ALL');

  const [chartData, setChartData] = useState({
    labels: ['18:10', '18:12', '18:14', '18:16', '18:18', '18:20', '18:22', '18:24', '18:26', '18:28'],
    normalTraffic: [120, 145, 132, 158, 140, 165, 150, 180, 160, 175],
    anomalousSpikes: [0, 0, 2, 0, 18, 2, 0, 32, 4, 12],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        const newLabels = [...prev.labels.slice(1), timeStr];
        const newNormal = [...prev.normalTraffic.slice(1), Math.floor(130 + Math.random() * 50)];
        const randomSpike = Math.random() > 0.75 ? Math.floor(10 + Math.random() * 25) : 0;
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
        updatedAnomalies[updatedAnomalies.length - 1] = Math.floor(45 + Math.random() * 20);
        return {
          ...prev,
          anomalousSpikes: updatedAnomalies
        };
      });
    }
  }, [anomalyEventCount]);

  const datasets = [];

  if (viewMode === 'ALL' || viewMode === 'NORMAL') {
    datasets.push({
      label: 'Normal Ingestion Telemetry (Req/s)',
      data: chartData.normalTraffic,
      borderColor: '#B38F6F', // Warm Sand
      backgroundColor: 'rgba(179, 143, 111, 0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#B38F6F',
      borderWidth: 2,
    });
  }

  if (viewMode === 'ALL' || viewMode === 'ANOMALIES') {
    datasets.push({
      label: 'Anomalous Auth Spikes (Failed/Burst)',
      data: chartData.anomalousSpikes,
      borderColor: '#C70F30', // Crimson Glow Accent
      backgroundColor: 'rgba(113, 0, 20, 0.4)', // Crimson Depth Fill
      fill: true,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointBackgroundColor: '#E61A3C',
      borderWidth: 2.5,
    });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#161616',
        titleColor: '#F2F1ED',
        bodyColor: '#E4E2DC',
        borderColor: '#710014',
        borderWidth: 1.5,
        padding: 12,
        boxPadding: 6,
        titleFont: { family: 'JetBrains Mono', size: 12 },
        bodyFont: { family: 'JetBrains Mono', size: 11 },
        callbacks: {
          label: function(context) {
            return ` ${context.dataset.label}: ${context.parsed.y} events`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(242, 241, 237, 0.04)',
          drawBorder: false,
        },
        ticks: {
          color: '#A8A499',
          font: { family: 'JetBrains Mono', size: 10 }
        }
      },
      y: {
        grid: {
          color: 'rgba(242, 241, 237, 0.04)',
          drawBorder: false,
        },
        ticks: {
          color: '#A8A499',
          font: { family: 'JetBrains Mono', size: 10 }
        }
      }
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuad'
    }
  };

  return (
    <div className="cyber-panel p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sand-400" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-pearl-100">
              Real-Time Traffic & Anomaly Pulse
            </h2>
          </div>
          <p className="text-xs text-pearl-400 font-mono mt-0.5">
            Streaming sliding-window authentication volume vs. anomaly threshold triggers
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-obsidian-900 border border-obsidian-700 text-xs font-mono">
          <button
            onClick={() => setViewMode('ALL')}
            className={`px-2.5 py-1 rounded transition-colors ${viewMode === 'ALL' ? 'bg-obsidian-750 text-pearl-100 font-semibold' : 'text-pearl-400 hover:text-pearl-100'}`}
          >
            Combined
          </button>
          <button
            onClick={() => setViewMode('ANOMALIES')}
            className={`px-2.5 py-1 rounded transition-colors ${viewMode === 'ANOMALIES' ? 'bg-crimson-700/30 text-crimson-400 font-semibold border border-crimson-600/40' : 'text-pearl-400 hover:text-pearl-100'}`}
          >
            Spikes Only
          </button>
          <button
            onClick={() => setViewMode('NORMAL')}
            className={`px-2.5 py-1 rounded transition-colors ${viewMode === 'NORMAL' ? 'bg-sand-500/20 text-sand-300 font-semibold border border-sand-500/30' : 'text-pearl-400 hover:text-pearl-100'}`}
          >
            Baseline
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-3 text-xs font-mono text-pearl-300">
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-sand-500 rounded-full"></span>
          <span>Normal Telemetry</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-crimson-500 rounded-full"></span>
          <span className="text-crimson-400 font-semibold">Anomalous Auth Bursts</span>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <Line data={{ labels: chartData.labels, datasets }} options={options} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-obsidian-750 text-[11px] font-mono text-pearl-400">
        <div>
          <span className="text-pearl-500">Peak Burst:</span>{' '}
          <span className="text-crimson-400 font-bold">54 req/s</span>
        </div>
        <div>
          <span className="text-pearl-500">Heuristic Window:</span>{' '}
          <span className="text-pearl-200">30s Sliding</span>
        </div>
        <div>
          <span className="text-pearl-500">Geo Distance Engine:</span>{' '}
          <span className="text-sand-300">Haversine Active</span>
        </div>
        <div>
          <span className="text-pearl-500">LLM Queue:</span>{' '}
          <span className="text-sand-400">0 Pending</span>
        </div>
      </div>
    </div>
  );
}
