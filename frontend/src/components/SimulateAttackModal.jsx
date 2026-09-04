import React, { useState } from 'react';
import { X, Zap, ShieldAlert, Globe, Flame, Terminal, CheckCircle2, Smartphone, Sparkles } from 'lucide-react';

export default function SimulateAttackModal({
  isOpen,
  onClose,
  onTriggerAttack,
  whatsAppNumber = '+91 98765 43210'
}) {
  const [selectedScenario, setSelectedScenario] = useState('BRUTE_FORCE');
  const [isSimulating, setIsSimulating] = useState(false);
  const [dispatchToWhatsApp, setDispatchToWhatsApp] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'BRUTE_FORCE',
      title: 'Credential Stuffing Burst',
      icon: Flame,
      color: 'text-rose-400',
      badge: 'HIGH FREQUENCY',
      description: 'Simulate 12 failed authentication attempts against an account within 8 seconds.',
      rawPayload: {
        eventType: 'AUTH_BURST_FAILURE',
        targetUser: 'alex.williams@enterprise.in',
        attempts: 12,
        timeDeltaSeconds: 8,
        ipAddress: '194.26.29.112',
        asn: 'AS44050 (Anonymous Proxy)'
      }
    },
    {
      id: 'IMPOSSIBLE_TRAVEL',
      title: 'Geo-Velocity / Impossible Travel',
      icon: Globe,
      color: 'text-purple-400',
      badge: 'PHYSICS ANOMALY',
      description: 'Simulate simultaneous logins from Bengaluru and Frankfurt within 4 minutes (calculated speed: ~11,000 km/h).',
      rawPayload: {
        eventType: 'GEO_IMPOSSIBLE_TRAVEL',
        targetUser: 'priya.sharma@fintech.in',
        origin: 'Bengaluru, India (103.21.244.1)',
        destination: 'Frankfurt, Germany (185.220.101.5)',
        distanceKm: 7350,
        timeDeltaMinutes: 4,
        calculatedSpeedKmH: 11025
      }
    },
    {
      id: 'DEVICE_FINGERPRINT',
      title: 'New Device + Suspicious ASN',
      icon: ShieldAlert,
      color: 'text-yellow-400',
      badge: 'BEHAVIOR ANOMALY',
      description: 'Simulate an off-hours login from an unrecognized Linux headless agent masquerading as an iPhone.',
      rawPayload: {
        eventType: 'DEVICE_DEVIATION',
        targetUser: 'ceo@defensecorp.in',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64; HeadlessChrome)',
        expectedBaseline: 'Apple iPhone 15 Pro / iOS 17.4',
        timeOfDay: '03:42 AM IST'
      }
    }
  ];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    const scenario = scenarios.find(s => s.id === selectedScenario);
    
    setTimeout(() => {
      onTriggerAttack(scenario, dispatchToWhatsApp);
      setIsSimulating(false);
      setSuccessMessage(
        dispatchToWhatsApp
          ? `Injected "${scenario.title}" and dispatched WhatsApp alert to ${whatsAppNumber}!`
          : `Injected "${scenario.title}" vector to Threat Engine!`
      );
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d0a14]/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#151220] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#231d38] bg-[#110d1c]">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Attack Vector Simulator (Judge Demo)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Trigger synthetic anomaly telemetry to test real-time LLM synthesis & WhatsApp dispatch
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

        {/* Modal Body: Scenario Selector */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {scenarios.map(sc => {
              const Icon = sc.icon;
              const isSelected = selectedScenario === sc.id;
              return (
                <div
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc.id)}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                    isSelected
                      ? 'bg-[#221a38] border-purple-500 shadow-[0_0_18px_rgba(139,92,246,0.3)]'
                      : 'bg-[#110d1c] border-[#231d38] hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2.5 rounded-xl bg-[#171226] border border-white/5 ${sc.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {sc.title}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {sc.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1b152d] text-purple-300 border border-purple-500/20 whitespace-nowrap">
                      {sc.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* WhatsApp Auto-Dispatch Option */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0e0a17] border border-[#231d38]">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-200 select-none">
              <input
                type="checkbox"
                checked={dispatchToWhatsApp}
                onChange={(e) => setDispatchToWhatsApp(e.target.checked)}
                className="w-4 h-4 rounded bg-[#151220] border-[#231d38] text-purple-600 focus:ring-0 focus:outline-none cursor-pointer"
              />
              <span className="flex items-center gap-1.5 font-medium">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Simultaneously transmit zero-jargon alert to WhatsApp</span>
              </span>
            </label>
            <span className="text-xs font-bold text-purple-300 bg-[#171226] px-2.5 py-1 rounded-full border border-purple-500/20">
              {whatsAppNumber}
            </span>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#110d1c] border-t border-[#231d38]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 text-white hover:from-purple-500 hover:to-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>{isSimulating ? 'Injecting Telemetry...' : 'Fire Anomaly Vector'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

