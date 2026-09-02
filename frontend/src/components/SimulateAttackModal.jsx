import React, { useState } from 'react';
import { X, Zap, ShieldAlert, Globe, Flame, Terminal, CheckCircle2, Smartphone } from 'lucide-react';

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
      color: 'text-crimson-400',
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
      color: 'text-crimson-500',
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
      color: 'text-sand-400',
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
      }, 1300);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-obsidian-900 border border-obsidian-700 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-800 bg-obsidian-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-crimson-900/40 text-sand-400 border border-crimson-700/50">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold text-pearl-100 tracking-wide">
                ATTACK VECTOR SIMULATOR (JUDGE DEMO)
              </h3>
              <p className="text-xs font-mono text-pearl-400">
                Trigger synthetic anomaly telemetry to test real-time LLM synthesis & WhatsApp dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-pearl-400 hover:text-pearl-100 rounded-lg hover:bg-obsidian-800 transition-colors"
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
                  className={`cursor-pointer rounded-xl p-4 border transition-all ${
                    isSelected
                      ? 'bg-obsidian-800/95 border-crimson-600 shadow-crimson-glow-sm'
                      : 'bg-obsidian-950/60 border-obsidian-800 hover:border-sand-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-obsidian-900 ${sc.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-mono font-bold text-pearl-100">
                          {sc.title}
                        </h4>
                        <p className="text-xs text-pearl-300 mt-1">
                          {sc.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-obsidian-900 text-sand-300 border border-obsidian-750 whitespace-nowrap">
                      {sc.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* WhatsApp Auto-Dispatch Option */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-950 border border-obsidian-750">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-mono text-pearl-200 select-none">
              <input
                type="checkbox"
                checked={dispatchToWhatsApp}
                onChange={(e) => setDispatchToWhatsApp(e.target.checked)}
                className="w-4 h-4 rounded bg-obsidian-900 border-obsidian-700 text-sand-400 focus:ring-0 focus:outline-none cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-sand-400" />
                <span>Simultaneously transmit zero-jargon alert to WhatsApp</span>
              </span>
            </label>
            <span className="text-[11px] font-mono text-sand-300 bg-obsidian-900 px-2 py-0.5 rounded border border-obsidian-700">
              {whatsAppNumber}
            </span>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-sand-500/15 border border-sand-500/40 text-sand-300 text-xs font-mono animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-obsidian-950 border-t border-obsidian-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono text-pearl-400 hover:text-pearl-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded-lg bg-crimson-700 text-pearl-50 hover:bg-crimson-600 shadow-crimson-glow transition-all disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-sand-400" />
            <span>{isSimulating ? 'Injecting Telemetry...' : 'Fire Anomaly Vector'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
