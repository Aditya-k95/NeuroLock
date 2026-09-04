import React from 'react';
import { Database, AlertTriangle, ShieldCheck, ShieldAlert, Sparkles, TrendingUp, Flame, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function MetricsGrid({
  totalEvents = 18492,
  anomaliesFlagged = 3,
  threatLevel = 'HIGH',
  llmProcessed = 3,
  parsingRate = '480 ev/s'
}) {
  const { t } = useLanguage();

  const threatConfig = {
    LOW: {
      label: t('statusNominal', 'LOW RISK'),
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      description: t('metricThreatLevelSub', 'Heuristic baseline nominal. No active attack bursts.'),
      icon: ShieldCheck
    },
    MEDIUM: {
      label: 'ELEVATED',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      badgeBg: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
      description: t('metricAnomaliesSub', 'Velocity & credential stuffing alerts flagged.'),
      icon: AlertTriangle
    },
    HIGH: {
      label: 'HIGH THREAT',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      description: t('statusStrict', 'Active brute force spike detected on auth endpoints.'),
      icon: Flame
    },
    CRITICAL: {
      label: t('statusIncidents', 'CRITICAL'),
      color: 'text-rose-400',
      bg: 'bg-rose-500/15',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
      description: 'Account takeover & impossible travel underway.',
      icon: ShieldAlert
    }
  };

  const activeThreat = threatConfig[threatLevel] || threatConfig.HIGH;
  const ThreatIcon = activeThreat.icon;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Total Events Parsed */}
      <div className="saas-card p-5 relative overflow-hidden group hover:bg-[#1a1628]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t('metricTotalEvents', 'Total Ingestion Events')}
          </span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-all">
            <Database className="w-4 h-4" />
          </div>
        </div>
        
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {totalEvents.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-purple-400 flex items-center bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
            <TrendingUp className="w-3 h-3 mr-0.5" /> +14.8%
          </span>
        </div>

        <div className="mt-3.5 flex items-center justify-between text-xs text-slate-400 border-t border-[#231d38]/80 pt-2.5">
          <span>{t('statPeakRate', 'Ingest Speed')}:</span>
          <span className="text-slate-200 font-semibold">{parsingRate}</span>
        </div>
      </div>

      {/* 2. Anomalies Flagged */}
      <div className="saas-card p-5 relative overflow-hidden group hover:bg-[#1a1628]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t('metricAnomalies', 'Anomalies Flagged')}
          </span>
          <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 group-hover:scale-105 transition-all">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-yellow-400 tracking-tight">
            {anomaliesFlagged}
          </span>
          <span className="text-xs text-slate-400">
            {t('metricAnomaliesSub', 'events intercepted')}
          </span>
        </div>

        <div className="mt-3.5 flex items-center justify-between text-xs text-slate-400 border-t border-[#231d38]/80 pt-2.5">
          <span>{t('statBaseline', 'Rule Heuristics')}:</span>
          <span className="text-yellow-400 font-semibold">Sliding Window & Geo</span>
        </div>
      </div>

      {/* 3. System Threat Level Indicator */}
      <div className="saas-card p-5 relative overflow-hidden group hover:bg-[#1a1628]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t('metricThreatLevel', 'System Threat Level')}
          </span>
          <div className={`p-2 rounded-xl ${activeThreat.bg} ${activeThreat.color} border border-current/20 group-hover:scale-105 transition-all`}>
            <ThreatIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className={`text-xl sm:text-2xl font-extrabold tracking-tight ${activeThreat.color}`}>
            {activeThreat.label}
          </span>
        </div>

        <p className="mt-3.5 text-xs text-slate-400 line-clamp-1 border-t border-[#231d38]/80 pt-2.5">
          {activeThreat.description}
        </p>
      </div>

      {/* 4. AI Zero-Jargon Delivery */}
      <div className="saas-card p-5 relative overflow-hidden group hover:bg-[#1a1628]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t('metricWhatsApp', 'Autonomous WhatsApp Output')}
          </span>
          <div className="p-2 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 group-hover:scale-105 transition-all">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            100%
          </span>
          <span className="text-xs text-purple-300">
            {t('statusDispatched', 'translated')} ({llmProcessed}/{anomaliesFlagged})
          </span>
        </div>

        <div className="mt-3.5 flex items-center justify-between text-xs text-slate-400 border-t border-[#231d38]/80 pt-2.5">
          <span>Avg LLM Latency:</span>
          <span className="text-purple-300 font-semibold">0.82s</span>
        </div>
      </div>

    </div>
  );
}


