import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Zap,
  Wifi,
  Clock,
  Sparkles,
  Bell,
  ChevronDown,
  User,
  CheckCircle2,
  Smartphone,
  Flame,
  Trash2,
  UserCheck,
  Shield
} from 'lucide-react';
import CyberLogo from './CyberLogo';
import LanguageSelector from './LanguageSelector';
import RoleGuard, { useUser } from './RoleGuard';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({
  onOpenSimulator,
  onOpenWhatsApp,
  onOpenUserProfile,
  userName = 'User',
  userRole = 'SecOps Lead',
  searchQuery = '',
  onSearchChange = () => {},
  notifications = [],
  onClearNotifications = () => {},
  isLive = true
}) {
  const { t } = useLanguage();
  const { role, toggleRole, user } = useUser();
  const [time, setTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [latency, setLatency] = useState(24);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setLatency((prev) => Math.max(18, Math.min(32, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const displayName = user?.name || userName || 'User';
  const displayRole = (role === 'owner' ? 'Owner / Admin' : 'Staff Analyst') || userRole;

  return (
    <header className="sticky top-0 z-30 bg-[#0d0a14]/90 backdrop-blur-xl border-b border-[#1f1a33]/60 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-[#151220] border border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <CyberLogo className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center">
                NEURO<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-500">LOCK</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 hidden sm:inline-block">
                {t('aiRadar', 'AI SaaS Radar')}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="font-bold text-purple-400">{t('teamName', 'WolfPack Squadron')}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 hidden sm:inline">{t('hackName', 'NexHack 2.0')}</span>
            </p>
          </div>
        </div>

        {/* Center: Search Bar & Live Status Pill */}
        <div className="hidden lg:flex items-center gap-4 flex-1 max-w-xl mx-4">
          
          {/* Enhanced Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-purple-400/80 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('searchPlaceholder', 'Search incidents, anomalies, IPs, users...')}
              className="w-full h-10 pl-10 pr-12 bg-[#151220] border border-[#231d38] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-all shadow-inner"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            ) : (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#1f1a33] text-[10px] font-mono text-slate-400 border border-[#2c2445] pointer-events-none">
                ⌘K
              </div>
            )}
          </div>

          {/* System Status Pill */}
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-full bg-[#151220] border border-[#231d38] shrink-0 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-radar-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? 'bg-purple-400' : 'bg-rose-500'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-purple-500' : 'bg-rose-500'}`}></span>
              </span>
              <span className="text-xs text-slate-200 font-semibold">
                {isLive ? t('radarActive', 'Radar Active') : t('offline', 'Offline')}
              </span>
            </div>

            <div className="h-3.5 w-px bg-[#231d38]" />

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Wifi className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-mono">{latency}ms</span>
            </div>
          </div>

        </div>

        {/* Right Actions: Role Toggle + Language Selector + Notifications + Simulator + User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Role Switcher Pill (Owner / Staff) */}
          <button
            id="role-toggle-btn"
            onClick={toggleRole}
            title="Click to toggle between Owner (full view + simulator) and Staff (scoped view)"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
              role === 'owner'
                ? 'bg-purple-500/15 text-purple-300 border-purple-500/40 hover:bg-purple-500/25 shadow-sm'
                : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/25 shadow-sm'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="font-bold uppercase tracking-wider">{role === 'owner' ? '👑 OWNER' : '👤 STAFF'}</span>
          </button>

          {/* Top-Right Language Converter Dropdown */}
          <LanguageSelector />

          {/* Notification Center Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#151220] border border-[#231d38] text-slate-300 hover:text-white hover:border-purple-500/40 transition-all"
              title={t('notifications', 'Notifications')}
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[9px] font-bold shadow-md animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#161126]/98 backdrop-blur-2xl border border-purple-500/30 rounded-3xl shadow-2xl p-4 z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#231d38]">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      {t('liveNotifLog', 'Live Notification Log')}
                    </h4>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={onClearNotifications}
                      className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{t('clearAll', 'Clear all')}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      <Sparkles className="w-6 h-6 mx-auto mb-1 text-purple-400/40" />
                      <span>{t('noNotif', 'No new notifications')}</span>
                    </div>
                  ) : (
                    notifications.map((notif, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#110c1f] border border-[#231d38]/80 text-xs hover:border-purple-500/30 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                            {notif.isWhatsApp ? (
                              <Smartphone className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3 text-purple-400" />
                            )}
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{notif.timestamp}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Attack Simulator Action Button (Protected by RoleGuard for Owner) */}
          <RoleGuard allowedRoles={['owner']}>
            <button
              id="simulate-attack-btn"
              onClick={onOpenSimulator}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 text-white hover:from-purple-500 hover:to-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.35)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-200 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              <span className="hidden sm:inline">{t('simulateAttack', 'Simulate Attack')}</span>
              <span className="sm:hidden">Simulate</span>
            </button>
          </RoleGuard>

          {/* User Profile Avatar with Edit Modal Trigger */}
          <button
            onClick={onOpenUserProfile}
            className="flex items-center gap-2.5 pl-2 border-l border-[#1f1a33]/60 group text-left transition-transform hover:scale-105"
            title="Click to edit user profile name & role"
          >
            <div className="relative cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-[1.5px] shadow-sm">
                <div className="w-full h-full bg-[#151220] rounded-[10px] flex items-center justify-center overflow-hidden">
                  <span className="text-xs font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-yellow-300">
                    {getInitials(displayName)}
                  </span>
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0d0a14]" />
            </div>

            <div className="hidden xl:block">
              <div className="text-xs font-bold text-white leading-tight flex items-center gap-1 group-hover:text-purple-300 transition-colors">
                <span>{displayName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-purple-300" />
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">{displayRole}</div>
            </div>
          </button>

        </div>

      </div>
    </header>
  );
}
