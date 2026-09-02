import React from 'react';
import { Database, AlertTriangle, ShieldCheck, ShieldAlert, Sparkles, TrendingUp, Flame } from 'lucide-react';

export default function MetricsGrid({
  totalEvents = 18492,
  anomaliesFlagged = 14,
  threatLevel = 'HIGH',
  llmProcessed = 14,
  parsingRate = '420 ev/s'
}) {
  const threatConfig = {
    LOW: {
      label: 'LOW RISK',
      color: 'text-sand-300',
      bg: 'bg-sand-500/10',
      border: 'border-sand-500/30',
      badge: 'badge-sand',
      description: 'Heuristic baseline nominal. No active attack bursts.',
      icon: ShieldCheck
    },
    MEDIUM: {
      label: 'ELEVATED',
      color: 'text-sand-400',
      bg: 'bg-sand-500/15',
      border: 'border-sand-500/40 shadow-sand-glow-sm',
      badge: 'badge-sand',
      description: 'Velocity & credential stuffing alerts flagged.',
      icon: AlertTriangle
    },
    HIGH: {
      label: 'HIGH THREAT',
      color: 'text-crimson-400',
      bg: 'bg-crimson-700/15',
      border: 'border-crimson-600/50 shadow-crimson-glow-sm',
      badge: 'badge-crimson',
      description: 'Active brute force spike detected on auth endpoints.',
      icon: Flame
    },
    CRITICAL: {
      label: 'CRITICAL',
      color: 'text-crimson-glow',
      bg: 'bg-crimson-900/40',
      border: 'border-crimson-500 shadow-crimson-glow animate-pulse',
      badge: 'badge-crimson',
      description: 'Account takeover & impossible travel underway.',
      icon: ShieldAlert
    }
  };

  const activeThreat = threatConfig[threatLevel] || threatConfig.HIGH;
  const ThreatIcon = activeThreat.icon;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Total Events Parsed */}
      <div className="cyber-panel p-5 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-pearl-400 uppercase tracking-wider">
            Total Events Parsed
          </span>
          <div className="p-2 rounded-lg bg-obsidian-800 text-sand-400 border border-obsidian-700 group-hover:border-sand-500/40 transition-colors">
            <Database className="w-4 h-4" />
          </div>
        </div>
        
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-pearl-100 tracking-tight">
            {totalEvents.toLocaleString()}
          </span>
          <span className="text-xs font-mono text-sand-400 flex items-center font-medium">
            <TrendingUp className="w-3 h-3 mr-0.5" /> +14.8%
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-pearl-400 border-t border-obsidian-750 pt-2.5">
          <span>Ingest Speed:</span>
          <span className="text-pearl-200 font-medium">{parsingRate}</span>
        </div>
      </div>

      {/* 2. Anomalies Flagged */}
      <div className="cyber-panel p-5 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-pearl-400 uppercase tracking-wider">
            Anomalies Flagged
          </span>
          <div className="p-2 rounded-lg bg-crimson-900/40 text-crimson-400 border border-crimson-700/50 group-hover:border-crimson-500 transition-colors">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-crimson-400 tracking-tight">
            {anomaliesFlagged}
          </span>
          <span className="text-xs font-mono text-pearl-400">
            events intercepted
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-pearl-400 border-t border-obsidian-750 pt-2.5">
          <span>Rule Heuristics:</span>
          <span className="text-sand-400 font-medium">Sliding Window & Geo</span>
        </div>
      </div>

      {/* 3. System Threat Level Indicator */}
      <div className={`cyber-panel p-5 relative overflow-hidden transition-all duration-300 ${activeThreat.border}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-pearl-400 uppercase tracking-wider">
            System Threat Level
          </span>
          <div className={`p-2 rounded-lg ${activeThreat.bg} ${activeThreat.color} border border-current/30`}>
            <ThreatIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${activeThreat.color}`}>
            {activeThreat.label}
          </span>
        </div>

        <p className="mt-2 text-[11px] text-pearl-400 line-clamp-1 border-t border-obsidian-750 pt-2">
          {activeThreat.description}
        </p>
      </div>

      {/* 4. LLM Zero-Jargon Delivery */}
      <div className="cyber-panel p-5 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-pearl-400 uppercase tracking-wider">
            AI Zero-Jargon Output
          </span>
          <div className="p-2 rounded-lg bg-obsidian-800 text-sand-300 border border-obsidian-700 group-hover:border-sand-500/40 transition-colors">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-pearl-100 tracking-tight">
            100%
          </span>
          <span className="text-xs font-mono text-sand-400">
            translated ({llmProcessed}/{anomaliesFlagged})
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-pearl-400 border-t border-obsidian-750 pt-2.5">
          <span>Avg LLM Latency:</span>
          <span className="text-sand-300 font-medium">0.82s</span>
        </div>
      </div>

    </div>
  );
}
