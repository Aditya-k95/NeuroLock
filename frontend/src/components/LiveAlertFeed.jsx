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
  Smartphone,
  Flame,
  Globe,
  User
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LiveAlertFeed({ alerts = [], onResolveAlert }) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'ALL') return true;
    return alert.riskLevel === filter;
  });

  const getThreatIcon = (alert) => {
    if (alert.rawTelemetry?.anomaly === 'AUTH_BURST_ATTACK' || alert.rawTelemetry?.eventType === 'AUTH_BURST_FAILURE') {
      return <Flame className="w-4 h-4 text-rose-400" />;
    }
    if (alert.rawTelemetry?.anomaly === 'IMPOSSIBLE_TRAVEL_VELOCITY' || alert.rawTelemetry?.eventType === 'GEO_IMPOSSIBLE_TRAVEL') {
      return <Globe className="w-4 h-4 text-purple-400" />;
    }
    return <ShieldAlert className="w-4 h-4 text-yellow-400" />;
  };

  const getThreatAvatarBg = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/15 border-rose-500/30';
      case 'HIGH':
        return 'bg-purple-500/15 border-purple-500/30';
      case 'MEDIUM':
        return 'bg-yellow-400/15 border-yellow-400/30';
      default:
        return 'bg-slate-800 border-slate-700';
    }
  };

  const getRiskBadge = (alert) => {
    if (alert.isResolved) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" /> {t('filterResolved', 'Resolved')}
        </span>
      );
    }
    switch (alert.riskLevel) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            {t('filterCritical', 'Critical')}
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            {t('metricThreatLevel', 'High Threat')}
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
            {t('filterActive', 'Active')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            {alert.riskLevel}
          </span>
        );
    }
  };

  return (
    <div className="saas-card p-6 relative">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {t('feedTitle', 'Zero-Jargon Threat Feed')}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('feedSub', 'Real-time plain-English incident narratives with instant 1-click remediation')}
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#0d0a14] border border-[#231d38] text-xs">
          {[
            { id: 'ALL', label: t('filterAllAlerts', 'ALL') },
            { id: 'CRITICAL', label: t('filterCritical', 'CRITICAL') },
            { id: 'HIGH', label: 'HIGH' },
            { id: 'MEDIUM', label: 'MEDIUM' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1 rounded-xl font-medium transition-all ${
                filter === item.id
                  ? 'bg-[#251e3b] text-purple-300 shadow-sm border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed List Items */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-[#231d38] rounded-2xl">
            <ShieldCheck className="w-8 h-8 mx-auto text-emerald-400 mb-2 opacity-80" />
            <p className="font-semibold text-slate-300">{t('noAlertsFound', 'No active incidents matching filter criteria.')}</p>
            <p className="text-slate-500 mt-1">{t('statusNominal', 'Telemetry stream running nominally.')}</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isExpanded = expandedId === alert.id;
            return (
              <div
                key={alert.id}
                className={`relative rounded-2xl transition-all duration-200 p-4 sm:p-5 ${
                  alert.isResolved
                    ? 'bg-[#100d1a]/50 opacity-60'
                    : 'bg-[#120e1f] hover:bg-[#181329] border border-purple-500/10 hover:border-purple-500/30'
                }`}
              >
                {/* Main Row: Avatar + Title/Subtitle + Status Badge & Timestamp */}
                <div className="flex items-start sm:items-center justify-between gap-3.5">
                  
                  {/* Left: Circular Avatar & Stacked Details */}
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    
                    {/* Circular Avatar Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${getThreatAvatarBg(alert.riskLevel)}`}>
                      {getThreatIcon(alert)}
                    </div>

                    {/* Stacked Bold Title & Muted Subtitle */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">
                          {alert.userEmail}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 bg-[#1a152b] px-2 py-0.5 rounded-md">
                          {alert.id}
                        </span>
                        {alert.dispatchedToWhatsApp && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <Smartphone className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {alert.plainEnglishSummary}
                      </p>
                    </div>
                  </div>

                  {/* Right: Status Badge & Timestamp Pill */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {getRiskBadge(alert)}
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{alert.timeAgo || 'Just now'}</span>
                    </div>
                  </div>

                </div>

                {/* Bottom Actions Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#231d38]/60 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-slate-500">{t('takeRemediation', 'Suggested Action')}:</span>
                    <span className="text-purple-300 font-semibold">{alert.recommendedAction}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-xl bg-[#1c182d] hover:bg-[#251e3b] transition-colors"
                    >
                      <Terminal className="w-3 h-3 text-purple-400" />
                      <span>{isExpanded ? t('hideTelemetry', 'Hide Raw') : t('showTelemetry', 'Inspect Raw')}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {!alert.isResolved ? (
                      <button
                        onClick={() => onResolveAlert(alert.id, 'LOCK_ACCOUNT')}
                        className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.35)] transition-all active:scale-95"
                      >
                        <Lock className="w-3.5 h-3.5 text-yellow-300" />
                        <span>{t('takeRemediation', 'Lock Account')}</span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t('actionCompleted', 'Remediated')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expandable Technical Log Drawer */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#231d38] font-mono text-xs text-slate-300 bg-[#0d0a14] p-3.5 rounded-xl border border-purple-500/20">
                    <div className="text-[11px] text-purple-400 font-semibold mb-1 flex items-center gap-1">
                      <span>// RAW TELEMETRY JSON (PRE-LLM SYNTHESIS):</span>
                    </div>
                    <pre className="text-[11px] text-slate-300 leading-relaxed overflow-x-auto">
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


