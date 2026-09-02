import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Terminal,
  Clock,
  Smartphone
} from 'lucide-react';

export default function LiveAlertFeed({ alerts = [], onResolveAlert, isLoading = false }) {
  const [filter, setFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'ALL') return true;
    return alert.riskLevel === filter;
  });

  const getRiskBadge = (level) => {
    switch (level) {
      case 'CRITICAL':
        return <span className="badge-crimson">CRITICAL RISK</span>;
      case 'HIGH':
        return <span className="badge-crimson">HIGH THREAT</span>;
      case 'MEDIUM':
        return <span className="badge-sand">ELEVATED</span>;
      case 'LOW':
        return <span className="badge-sand">LOW RISK</span>;
      default:
        return <span className="badge-sand">{level}</span>;
    }
  };

  return (
    <div className="cyber-panel p-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sand-400" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-pearl-100">
              Zero-Jargon Threat Feed (LLM Translated)
            </h2>
          </div>
          <p className="text-xs text-pearl-400 font-mono mt-0.5">
            Real-time plain-English incident narratives with 1-click mitigation controls & WhatsApp dispatches
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-obsidian-900 border border-obsidian-700 text-xs font-mono">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(level => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-2.5 py-1 rounded transition-all ${
                filter === level
                  ? 'bg-obsidian-750 text-pearl-100 font-semibold'
                  : 'text-pearl-400 hover:text-pearl-100'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-3.5">
        {isLoading && filteredAlerts.length === 0 ? (
          <div className="py-12 text-center text-pearl-400 font-mono text-xs border border-dashed border-obsidian-700 rounded-xl">
            <div className="w-6 h-6 border-2 border-sand-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p>Fetching real-time incident telemetry from backend...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="py-12 text-center text-pearl-400 font-mono text-xs border border-dashed border-obsidian-700 rounded-xl">
            <ShieldCheck className="w-8 h-8 mx-auto text-sand-400 mb-2 opacity-80" />
            <p>No active anomalies found matching filter criteria.</p>
            <p className="text-[11px] text-pearl-500 mt-1">Telemetry stream running normally.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isExpanded = expandedId === alert.id;
            return (
              <div
                key={alert.id}
                className={`relative rounded-xl transition-all duration-200 border ${
                  alert.isResolved
                    ? 'bg-obsidian-900/40 border-obsidian-800 opacity-60'
                    : alert.riskLevel === 'CRITICAL'
                    ? 'bg-obsidian-900/90 border-crimson-600/70 hover:border-crimson-500 shadow-crimson-glow-sm/30'
                    : alert.riskLevel === 'HIGH'
                    ? 'bg-obsidian-900/90 border-crimson-700/50 hover:border-crimson-500 shadow-crimson-glow-sm/20'
                    : 'bg-obsidian-900/80 border-obsidian-700 hover:border-sand-500/40'
                } p-4 sm:p-5`}
              >
                {/* Top Row: Badges, Target User, Timestamp */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {getRiskBadge(alert.riskLevel)}
                    <span className="text-xs font-mono font-semibold text-pearl-100 bg-obsidian-800 px-2 py-0.5 rounded border border-obsidian-700">
                      {alert.userEmail}
                    </span>
                    <span className="text-[11px] font-mono text-pearl-400 hidden sm:inline">
                      ID: {alert.id}
                    </span>
                    {alert.dispatchedToWhatsApp && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-700/50">
                        <Smartphone className="w-3 h-3" />
                        <span>WHATSAPP DISPATCHED</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono text-pearl-400">
                    <Clock className="w-3.5 h-3.5 text-pearl-500" />
                    <span>{alert.timeAgo || 'Just now'}</span>
                  </div>
                </div>

                {/* Plain English LLM Output */}
                <div className="bg-obsidian-950/90 rounded-lg p-3.5 border border-obsidian-700/60 mb-3">
                  <div className="flex items-center gap-2 mb-1.5 text-[11px] font-mono font-semibold text-sand-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>PLAIN-ENGLISH TRANSLATION:</span>
                  </div>
                  <p className="text-sm text-pearl-100 leading-relaxed font-sans">
                    {alert.plainEnglishSummary}
                  </p>
                </div>

                {/* Recommended Actions / 1-Click Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-pearl-400">
                      Suggested Action:
                    </span>
                    <span className="text-xs font-mono font-medium text-sand-300">
                      {alert.recommendedAction}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Expand Raw Telemetry Button */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                      className="flex items-center gap-1 text-xs font-mono text-pearl-300 hover:text-pearl-100 px-2.5 py-1.5 rounded bg-obsidian-800 hover:bg-obsidian-750 transition-colors"
                    >
                      <Terminal className="w-3 h-3" />
                      <span>{isExpanded ? 'Hide Raw' : 'Inspect Raw'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {/* 1-Click Action Button */}
                    {!alert.isResolved ? (
                      <button
                        onClick={() => onResolveAlert(alert.id, 'LOCK_ACCOUNT')}
                        className="flex items-center gap-1.5 text-xs font-mono font-bold px-3.5 py-1.5 rounded bg-crimson-700 text-pearl-50 border border-crimson-500 hover:bg-crimson-600 hover:shadow-crimson-glow transition-all"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Lock Account</span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-mono text-sand-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Remediated
                      </span>
                    )}
                  </div>
                </div>

                {/* Expandable Technical Log Drawer */}
                {isExpanded && (
                  <div className="mt-3.5 pt-3 border-t border-obsidian-750 font-mono text-xs text-pearl-300 bg-obsidian-950 p-3 rounded-lg overflow-x-auto border border-obsidian-800">
                    <div className="text-[11px] text-sand-400 font-semibold mb-1">
                      // RAW TELEMETRY JSON (PRE-LLM SYNTHESIS):
                    </div>
                    <pre className="text-[11px] text-pearl-200 leading-tight">
                      {JSON.stringify(alert.rawTelemetry, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
