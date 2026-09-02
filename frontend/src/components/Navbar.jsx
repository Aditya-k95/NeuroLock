import React, { useState, useEffect } from 'react';
import { Activity, Wifi, Radio, Zap, Clock, Terminal } from 'lucide-react';
import CyberLogo from './CyberLogo';

export default function Navbar({ onOpenSimulator, isLive = true }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [latency, setLatency] = useState(24);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
      setLatency(prev => Math.max(18, Math.min(32, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-obsidian-950/85 backdrop-blur-xl border-b border-obsidian-700/80 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Hackathon Title */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-obsidian-900 border border-crimson-700/60 shadow-crimson-glow-sm">
            <CyberLogo className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-crimson-600"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-pearl-100 font-mono flex items-center gap-1.5">
                NEURO<span className="text-crimson-500">LOCK</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded bg-obsidian-800 text-sand-300 border border-obsidian-700">
                v1.0 MVP
              </span>
            </div>
            <p className="text-xs text-pearl-400 font-mono flex items-center gap-1.5">
              <span>TEAM</span>
              <span className="text-sand-400 font-bold font-mono">PARADOX</span>
              <span className="text-obsidian-600">•</span>
              <span className="text-pearl-400 hidden sm:inline">Build with भारत 2.0</span>
            </p>
          </div>
        </div>

        {/* Center: System Status Beacon */}
        <div className="hidden md:flex items-center gap-6 px-4 py-1.5 rounded-full bg-obsidian-900/90 border border-obsidian-700">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-radar-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? 'bg-sand-400' : 'bg-crimson-500'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-sand-500' : 'bg-crimson-500'}`}></span>
            </span>
            <span className="text-xs font-mono text-pearl-200 font-medium tracking-wide">
              {isLive ? 'RADAR ACTIVE' : 'RECONNECTING'}
            </span>
          </div>

          <div className="h-3 w-px bg-obsidian-700" />

          <div className="flex items-center gap-1.5 text-xs font-mono text-pearl-300">
            <Wifi className="w-3.5 h-3.5 text-sand-400" />
            <span>{latency}ms</span>
          </div>

          <div className="h-3 w-px bg-obsidian-700" />

          <div className="flex items-center gap-1.5 text-xs font-mono text-pearl-400">
            <Clock className="w-3.5 h-3.5 text-pearl-500" />
            <span>{time}</span>
          </div>
        </div>

        {/* Right Actions: Attack Simulator Trigger */}
        <div className="flex items-center gap-3">
          <button
            id="simulate-attack-btn"
            onClick={onOpenSimulator}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-semibold rounded-lg bg-crimson-900/60 text-sand-300 border border-crimson-600/60 hover:bg-crimson-700 hover:text-pearl-50 hover:shadow-crimson-glow transition-all duration-200"
          >
            <Zap className="w-3.5 h-3.5 text-sand-400" />
            <span className="hidden sm:inline">SIMULATE ATTACK</span>
            <span className="sm:hidden">SIMULATE</span>
          </button>
        </div>

      </div>
    </header>
  );
}
