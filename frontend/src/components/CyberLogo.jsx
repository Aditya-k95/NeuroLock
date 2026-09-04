import React from 'react';

export default function CyberLogo({ className = "w-7 h-7", glow = true }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_12px_rgba(139,92,246,0.65)] transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Vibrant Purple to Violet Gradient */}
          <linearGradient id="purpleShieldGrad" x1="4" y1="2" x2="32" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>

          {/* Warm Yellow/Gold Core Gradient */}
          <linearGradient id="goldCoreGrad" x1="12" y1="12" x2="24" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>

          {/* Ambient Purple Radial Glow */}
          <radialGradient id="purpleGlowCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0d0a14" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Glow */}
        {glow && <circle cx="18" cy="18" r="16" fill="url(#purpleGlowCenter)" />}

        {/* Outer Shield with Purple Gradient Border */}
        <path
          d="M18 2L5 7.5V17.5C5 25.5 10.8 31.5 18 34C25.2 31.5 31 25.5 31 17.5V7.5L18 2Z"
          stroke="url(#purpleShieldGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="#151220"
          fillOpacity="0.95"
        />

        {/* Tech Corner Cuts */}
        <path
          d="M9 11L18 6.5L27 11"
          stroke="#facc15"
          strokeWidth="1.3"
          strokeOpacity="0.85"
          strokeLinecap="round"
        />
        <path
          d="M18 30V26"
          stroke="#facc15"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Circuit Nodes in Warm Gold */}
        <line x1="8" y1="17" x2="11" y2="17" stroke="#facc15" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="8" cy="17" r="1" fill="#facc15" />

        <line x1="28" y1="17" x2="25" y2="17" stroke="#facc15" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="28" cy="17" r="1" fill="#facc15" />

        {/* Central Padlock / Neural Core Arch in Warm Gold */}
        <path
          d="M13.5 15.5V12C13.5 9.51472 15.5147 7.5 18 7.5C20.4853 7.5 22.5 9.51472 22.5 12V15.5"
          stroke="url(#goldCoreGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Lock Body in Deep Violet */}
        <rect
          x="10.5"
          y="15"
          width="15"
          height="11"
          rx="2.5"
          fill="#6d28d9"
          stroke="#facc15"
          strokeWidth="1.4"
        />

        {/* White Diode / Neural Core */}
        <circle cx="18" cy="19.5" r="1.6" fill="#ffffff" />
        <path
          d="M18 20.5V23"
          stroke="#ffffff"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Micro-nodes */}
        <circle cx="12.5" cy="17" r="0.6" fill="#facc15" />
        <circle cx="23.5" cy="17" r="0.6" fill="#facc15" />
      </svg>
    </div>
  );
}

