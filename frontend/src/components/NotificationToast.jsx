import React, { useEffect, useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldAlert,
  User,
  X,
  ExternalLink,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function NotificationToast({
  notification,
  onClose,
  onAction
}) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!notification) return;

    setProgress(100);
    const duration = 6000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev <= step) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev - step;
        });
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [notification, isPaused]);

  if (!notification) return null;

  const getToastTheme = () => {
    if (notification.isWhatsApp) {
      return {
        badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        badgeText: 'WHATSAPP AI DISPATCH',
        icon: Smartphone,
        iconColor: 'text-emerald-400',
        iconBg: 'bg-emerald-500/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
        glow: 'border-emerald-500/30 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8),0_0_25px_rgba(16,185,129,0.2)]',
        bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
        actionLabel: 'Open WhatsApp Modal',
      };
    }
    if (notification.type === 'ATTACK' || notification.title.includes('Threat') || notification.title.includes('Alert')) {
      return {
        badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        badgeText: 'REAL-TIME THREAT DETECTED',
        icon: Flame,
        iconColor: 'text-rose-400',
        iconBg: 'bg-rose-500/20 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
        glow: 'border-rose-500/30 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8),0_0_25px_rgba(244,63,94,0.2)]',
        bar: 'bg-gradient-to-r from-rose-500 to-pink-500',
        actionLabel: 'Review Anomaly',
      };
    }
    return {
      badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      badgeText: 'SECURITY OPERATION',
      icon: CheckCircle2,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20 border-purple-500/40 shadow-[0_0_15px_rgba(139,92,246,0.3)]',
      glow: 'border-purple-500/30 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8),0_0_25px_rgba(139,92,246,0.2)]',
      bar: 'bg-gradient-to-r from-purple-600 to-violet-400',
      actionLabel: 'Acknowledge',
    };
  };

  const theme = getToastTheme();
  const Icon = theme.icon;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed bottom-6 right-6 z-50 max-w-md w-full bg-[#161126]/95 backdrop-blur-2xl border ${theme.glow} rounded-3xl p-5 transition-all duration-300 animate-fadeIn overflow-hidden`}
    >
      {/* Top Header inside Toast */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider border ${theme.badge}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {theme.badgeText}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {notification.timestamp}
          </span>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Toast Content Body */}
      <div className="flex items-start gap-3.5">
        {/* Glowing Icon Avatar */}
        <div className={`p-2.5 rounded-2xl border shrink-0 ${theme.iconBg}`}>
          <Icon className={`w-5 h-5 ${theme.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
            {notification.title}
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {notification.message}
          </p>

          {/* Optional Action Button */}
          {notification.isWhatsApp && onAction && (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => {
                  onAction();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold transition-all"
              >
                <span>View WhatsApp Payload</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Animated Bottom Timer Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#100c1d]">
        <div
          className={`h-full ${theme.bar} transition-all duration-75`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
