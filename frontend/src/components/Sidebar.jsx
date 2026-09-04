import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  TrendingUp,
  Smartphone,
  Zap,
  FileText,
  Settings,
  HelpCircle,
  Activity
} from 'lucide-react';
import CyberLogo from './CyberLogo';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({
  activeTab = 'dashboard',
  onSelectTab = () => {},
  onOpenSimulator = () => {},
  onOpenWhatsApp = () => {},
  onOpenAuditLogs = () => {},
  onOpenSettings = () => {},
  alertCount = 3
}) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('navDashboard', 'Live Threat Radar (Overview)') },
    { id: 'alerts', icon: ShieldAlert, label: t('navThreatAlerts', 'Threat Alerts & Incidents Feed'), badge: alertCount },
    { id: 'traffic', icon: TrendingUp, label: t('navTraffic', 'Telemetry & Traffic Analysis') },
    { id: 'whatsapp', icon: Smartphone, label: t('navWhatsApp', 'WhatsApp Dispatch Pipeline'), action: onOpenWhatsApp, hasDot: true },
    { id: 'simulator', icon: Zap, label: t('navSimulator', 'Attack Simulator (Judge Demo)'), action: onOpenSimulator, isSpecial: true },
  ];

  const bottomItems = [
    { id: 'logs', icon: FileText, label: t('navAuditLogs', 'Security Telemetry Audit Logs'), action: onOpenAuditLogs },
    { id: 'settings', icon: Settings, label: t('navSettings', 'Engine & Profile Settings'), action: onOpenSettings },
  ];

  return (
    <aside className="hidden md:flex flex-col items-center justify-between w-[72px] bg-[#0e0a17] border-r border-[#1e192f]/60 py-5 shrink-0 z-40 h-screen sticky top-0">
      
      {/* Top Brand Logo Icon */}
      <div className="flex flex-col items-center gap-6">
        <div
          onClick={() => onSelectTab('dashboard')}
          className="group relative flex items-center justify-center cursor-pointer p-1.5 rounded-2xl transition-transform hover:scale-105"
          title="NeuroLock Home"
        >
          <CyberLogo className="w-8 h-8" />
        </div>

        {/* Navigation Icon Stack */}
        <nav className="flex flex-col items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  type="button"
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      onSelectTab(item.id);
                    }
                  }}
                  className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-tr from-purple-600 to-violet-500 text-white shadow-[0_0_18px_rgba(139,92,246,0.6)]'
                      : item.isSpecial
                      ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#1a1528]'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className="w-5 h-5" />
                  
                  {/* Badge Counter */}
                  {item.badge > 0 && !isActive && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold shadow-sm animate-pulse">
                      {item.badge}
                    </span>
                  )}

                  {/* Connected Status Dot */}
                  {item.hasDot && (
                    <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0e0a17]" />
                  )}
                </button>

                {/* Tooltip on hover */}
                <div className="absolute left-[78px] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#1c182d] text-slate-100 text-xs font-medium rounded-lg shadow-xl border border-purple-500/20 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                  {item.label}
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1c182d] border-l border-b border-purple-500/20 rotate-45" />
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Icons (Settings & Audit Logs) */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-px bg-[#1f1a33]" />
        
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="relative group">
              <button
                type="button"
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    onSelectTab(item.id);
                  }
                }}
                className="flex items-center justify-center w-11 h-11 rounded-2xl text-slate-400 hover:text-slate-100 hover:bg-[#1a1528] transition-colors"
                aria-label={item.label}
              >
                <Icon className="w-5 h-5" />
              </button>

              <div className="absolute left-[78px] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#1c182d] text-slate-100 text-xs font-medium rounded-lg shadow-xl border border-purple-500/20 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                {item.label}
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1c182d] border-l border-b border-purple-500/20 rotate-45" />
              </div>
            </div>
          );
        })}
      </div>

    </aside>
  );
}

