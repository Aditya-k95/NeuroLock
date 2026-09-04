import React, { useState } from 'react';
import { X, Settings, Sliders, Smartphone, Shield, Check, Save } from 'lucide-react';

export default function EngineSettingsModal({
  isOpen,
  onClose,
  whatsAppNumber,
  onSavePhoneNumber,
  userName,
  userRole,
  onSaveProfile
}) {
  const [phone, setPhone] = useState(whatsAppNumber || '+91 98765 43210');
  const [name, setName] = useState(userName || 'User');
  const [role, setRole] = useState(userRole || 'SecOps Lead');
  const [windowSize, setWindowSize] = useState(30);
  const [sensitivity, setSensitivity] = useState('BALANCED');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveAll = (e) => {
    e.preventDefault();
    if (onSavePhoneNumber) onSavePhoneNumber(phone);
    if (onSaveProfile) onSaveProfile({ name, role });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d0a14]/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#151220] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#231d38] bg-[#110d1c]">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                NeuroLock Engine & Profile Settings
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure heuristic parameters, alerts, and operator details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSaveAll} className="p-6 overflow-y-auto space-y-5">
          
          {/* Section 1: Operator Identity */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              1. Operator Identity & Display
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Operator Name:</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 bg-[#0e0a17] border border-[#231d38] rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Assigned Role:</span>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-10 px-3 bg-[#0e0a17] border border-[#231d38] rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: WhatsApp Target Phone */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              2. Target WhatsApp Number for AI Alerts
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 px-3 bg-[#0e0a17] border border-[#231d38] rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          {/* Section 3: Heuristic Parameters */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              3. Sliding-Window Anomaly Heuristics
            </label>
            
            <div className="p-3.5 rounded-2xl bg-[#0e0a17] border border-[#231d38] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Sliding Window Duration:</span>
                <span className="font-bold text-purple-300">{windowSize} Seconds</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={windowSize}
                onChange={(e) => setWindowSize(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />

              <div className="flex items-center justify-between pt-2 border-t border-[#231d38] text-xs">
                <span className="text-slate-300 font-medium">Detection Sensitivity:</span>
                <div className="flex items-center gap-1">
                  {['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE'].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSensitivity(s)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        sensitivity === s ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white bg-[#151220]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {saved && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Engine settings saved and applied to live telemetry stream!</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#231d38]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 text-white hover:from-purple-500 hover:to-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Apply</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
