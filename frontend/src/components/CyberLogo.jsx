import React from 'react';

export default function CyberLogo({ className = "w-6 h-6", glow = true }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_10px_rgba(113,0,20,0.7)] transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Crimson & Warm Sand Gradients */}
          <linearGradient id="crimsonShieldGrad" x1="4" y1="2" x2="32" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B38F6F" />
            <stop offset="45%" stopColor="#8C0019" />
            <stop offset="100%" stopColor="#710014" />
          </linearGradient>

          <linearGradient id="sandCoreGrad" x1="12" y1="12" x2="24" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F2F1ED" />
            <stop offset="50%" stopColor="#B38F6F" />
            <stop offset="100%" stopColor="#8A6C52" />
          </linearGradient>

          <radialGradient id="crimsonGlowCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#710014" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#161616" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Crimson Aura */}
        {glow && <circle cx="18" cy="18" r="16" fill="url(#crimsonGlowCenter)" />}

        {/* Outer Obsidian Shield with Crimson/Sand Border */}
        <path
          d="M18 2L5 7.5V17.5C5 25.5 10.8 31.5 18 34C25.2 31.5 31 25.5 31 17.5V7.5L18 2Z"
          stroke="url(#crimsonShieldGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="#161616"
          fillOpacity="0.95"
        />

        {/* Tech Corner Cuts & Sand Accents */}
        <path
          d="M9 11L18 6.5L27 11"
          stroke="#B38F6F"
          strokeWidth="1.2"
          strokeOpacity="0.75"
          strokeLinecap="round"
        />
        <path
          d="M18 30V26"
          stroke="#B38F6F"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Circuit Nodes in Warm Sand */}
        <line x1="8" y1="17" x2="11" y2="17" stroke="#B38F6F" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="8" cy="17" r="1" fill="#B38F6F" />

        <line x1="28" y1="17" x2="25" y2="17" stroke="#B38F6F" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="28" cy="17" r="1" fill="#B38F6F" />

        {/* Central Padlock / Neural Core */}
        <path
          d="M13.5 15.5V12C13.5 9.51472 15.5147 7.5 18 7.5C20.4853 7.5 22.5 9.51472 22.5 12V15.5"
          stroke="url(#sandCoreGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Lock Body in Deep Crimson */}
        <rect
          x="10.5"
          y="15"
          width="15"
          height="11"
          rx="2.5"
          fill="#710014"
          stroke="#B38F6F"
          strokeWidth="1.4"
        />

        {/* Soft Pearl Core Diode */}
        <circle cx="18" cy="19.5" r="1.6" fill="#F2F1ED" />
        <path
          d="M18 20.5V23"
          stroke="#F2F1ED"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Soft Pearl Status Micro-Nodes */}
        <circle cx="12.5" cy="17" r="0.6" fill="#F2F1ED" />
        <circle cx="23.5" cy="17" r="0.6" fill="#F2F1ED" />
      </svg>
    </div>
  );
}
