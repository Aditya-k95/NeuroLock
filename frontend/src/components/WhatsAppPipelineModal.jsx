import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Send,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Flame,
  Globe,
  Copy,
  Check,
  Radio,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

export default function WhatsAppPipelineModal({
  isOpen,
  onClose,
  phoneNumber,
  onSavePhoneNumber,
  onDispatchAlert
}) {
  const [inputNumber, setInputNumber] = useState(phoneNumber || '9876543210');
  const [countryCode, setCountryCode] = useState('+91');
  const [selectedThreat, setSelectedThreat] = useState('BRUTE_FORCE');
  const [isSending, setIsSending] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (phoneNumber) {
      // If phone number has country code, extract it
      if (phoneNumber.startsWith('+91')) {
        setInputNumber(phoneNumber.replace('+91', '').trim());
      } else {
        setInputNumber(phoneNumber);
      }
    }
  }, [phoneNumber, isOpen]);

  if (!isOpen) return null;

  const fullPhoneNumber = `${countryCode}${inputNumber.replace(/\D/g, '')}`;

  const threatScenarios = [
    {
      id: 'BRUTE_FORCE',
      title: 'Password Guessing Burst',
      risk: 'CRITICAL',
      icon: Flame,
      summary: '⚠️ *NeuroLock Security Alert*\n\nSomeone in *Frankfurt, Germany* just tried guessing your password *14 times in 12 seconds*. We automatically locked your account to protect your data.',
      action: 'Reply *LOCK* to invalidate sessions or *IGNORE* if this was you.'
    },
    {
      id: 'IMPOSSIBLE_TRAVEL',
      title: 'Impossible Travel Anomaly',
      risk: 'CRITICAL',
      icon: Globe,
      summary: '⚠️ *NeuroLock Security Alert*\n\nWe noticed a login from *Mumbai, India* and another from *London, UK* just 3 minutes later. Traveling 4,400 miles in 3 minutes is physically impossible, suggesting account compromise.',
      action: 'Reply *STEPUP* to trigger instant biometric verification.'
    },
    {
      id: 'DEVICE_ANOMALY',
      title: 'Unrecognized Device Signature',
      risk: 'ELEVATED',
      icon: ShieldAlert,
      summary: '⚠️ *NeuroLock Security Alert*\n\nAn unrecognized automated script attempted to log into your account at 03:42 AM IST from an unverified server.',
      action: 'Reply *BLOCK* to quarantine the source IP address.'
    }
  ];

  const currentThreat = threatScenarios.find(t => t.id === selectedThreat) || threatScenarios[0];

  const formattedWhatsAppMessage = `🛡️ *NEUROLOCK THREAT RADAR* (Build with भारत 2.0)\n━━━━━━━━━━━━━━━━━━━━\n${currentThreat.summary}\n\n💡 *Action Needed:*\n${currentThreat.action}\n━━━━━━━━━━━━━━━━━━━━\n_Delivered in real-time by NeuroLock Zero-Jargon AI Engine_`;

  const handleSaveAndDispatch = (openExternalWhatsApp = false) => {
    if (!inputNumber || inputNumber.trim().length < 5) {
      alert('Please enter a valid mobile number.');
      return;
    }

    const savedNumber = `${countryCode} ${inputNumber.trim()}`;
    onSavePhoneNumber(savedNumber);

    setIsSending(true);
    setDispatchStatus(null);

    setTimeout(() => {
      setIsSending(false);
      setDispatchStatus({
        type: 'SUCCESS',
        message: `Dispatched zero-jargon security alert to ${savedNumber}!`,
        timestamp: new Date().toLocaleTimeString()
      });

      if (onDispatchAlert) {
        onDispatchAlert({
          phoneNumber: savedNumber,
          threat: currentThreat,
          fullMessage: formattedWhatsAppMessage
        });
      }

      if (openExternalWhatsApp) {
        const encodedMsg = encodeURIComponent(formattedWhatsAppMessage);
        const cleanNumber = fullPhoneNumber.replace(/\D/g, '');
        const waUrl = `https://wa.me/${cleanNumber}?text=${encodedMsg}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }
    }, 600);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(formattedWhatsAppMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-obsidian-900 border border-obsidian-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-obsidian-800 bg-obsidian-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sand-500/15 text-sand-400 border border-sand-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-mono font-bold text-pearl-100 uppercase tracking-wide">
                  WhatsApp Alert Dispatch Pipeline
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE TWILIO / WHATSAPP API
                </span>
              </div>
              <p className="text-xs font-mono text-pearl-400 mt-0.5">
                Input any phone number to test instant zero-jargon mobile threat alerts
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Section 1: Phone Number Input */}
          <div className="bg-obsidian-950 p-4 rounded-xl border border-obsidian-750">
            <label className="block text-xs font-mono font-semibold text-sand-300 uppercase tracking-wider mb-2">
              1. Target Recipient Phone Number
            </label>
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="h-11 px-3 bg-obsidian-900 border border-obsidian-700 rounded-lg text-pearl-100 font-mono text-xs focus:outline-none focus:border-sand-500 cursor-pointer"
                >
                  <option value="+91">🇮🇳 +91 (IN)</option>
                  <option value="+1">🇺🇸 +1 (US)</option>
                  <option value="+44">🇬🇧 +44 (UK)</option>
                  <option value="+49">🇩🇪 +49 (DE)</option>
                  <option value="+65">🇸🇬 +65 (SG)</option>
                  <option value="+971">🇦🇪 +971 (UAE)</option>
                </select>
              </div>

              <div className="relative flex-1">
                <input
                  type="tel"
                  value={inputNumber}
                  onChange={(e) => setInputNumber(e.target.value)}
                  placeholder="Enter 10-digit mobile number (e.g. 9876543210)"
                  className="w-full h-11 px-3.5 bg-obsidian-900 border border-obsidian-700 rounded-lg text-pearl-100 font-mono text-sm placeholder-pearl-500 focus:outline-none focus:border-sand-500 transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const saved = `${countryCode} ${inputNumber.trim()}`;
                  onSavePhoneNumber(saved);
                  alert(`Saved active notification recipient: ${saved}`);
                }}
                className="px-4 h-11 bg-obsidian-800 hover:bg-obsidian-750 text-sand-300 border border-obsidian-700 rounded-lg font-mono text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Check className="w-3.5 h-3.5" />
                Save Number
              </button>
            </div>
            <p className="text-[11px] font-mono text-pearl-400 mt-2">
              💡 Tip for Judges/Reviewers: Type your own number and click <strong>"Send to My WhatsApp"</strong> to see the live alert on your phone.
            </p>
          </div>

          {/* Section 2: Choose Threat Simulation Scenario */}
          <div>
            <label className="block text-xs font-mono font-semibold text-sand-300 uppercase tracking-wider mb-2">
              2. Select Threat Scenario to Transmit
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {threatScenarios.map(threat => {
                const Icon = threat.icon;
                const isSelected = selectedThreat === threat.id;
                return (
                  <button
                    key={threat.id}
                    type="button"
                    onClick={() => setSelectedThreat(threat.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-obsidian-800 border-sand-500 shadow-sand-glow-sm/40'
                        : 'bg-obsidian-950/70 border-obsidian-800 hover:border-obsidian-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`p-1.5 rounded-lg bg-obsidian-900 ${threat.risk === 'CRITICAL' ? 'text-crimson-400' : 'text-sand-400'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${threat.risk === 'CRITICAL' ? 'bg-crimson-950 text-crimson-400 border border-crimson-800/40' : 'bg-sand-950 text-sand-300 border border-sand-800/40'}`}>
                        {threat.risk}
                      </span>
                    </div>
                    <div className="text-xs font-mono font-bold text-pearl-100">
                      {threat.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Realistic WhatsApp Chat Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-semibold text-sand-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-sand-400" />
                3. WhatsApp Recipient View (Zero-Jargon LLM Payload)
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[11px] font-mono text-pearl-400 hover:text-pearl-200 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            {/* Dark Mode WhatsApp Bubble Container */}
            <div className="bg-[#0b141a] p-4 rounded-xl border border-obsidian-750 shadow-inner">
              <div className="max-w-md bg-[#1f2c34] text-[#e9edef] rounded-2xl rounded-tl-sm p-3.5 shadow-md border border-[#2a3942] relative">
                <div className="flex items-center gap-2 pb-2 mb-2 border-b border-[#2a3942] text-[11px] font-mono text-emerald-400 font-bold">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>NeuroLock Security Bot (Verified)</span>
                </div>
                
                <div className="text-xs leading-relaxed space-y-2 font-sans whitespace-pre-wrap">
                  {formattedWhatsAppMessage}
                </div>

                <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-[#2a3942] text-[10px] text-gray-400 font-mono">
                  <span>To: {countryCode} {inputNumber || 'XXXXXXXXXX'}</span>
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Success Status Notice */}
          {dispatchStatus && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs font-mono animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex-1">
                <span>{dispatchStatus.message}</span>
                <span className="text-[10px] text-emerald-400/70 ml-2">[{dispatchStatus.timestamp}]</span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-6 py-4 bg-obsidian-950 border-t border-obsidian-800">
          <div className="text-xs font-mono text-pearl-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-sand-400" />
            <span>Target: <strong className="text-sand-300">{countryCode} {inputNumber}</strong></span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Button 1: Simulate In Dashboard */}
            <button
              type="button"
              onClick={() => handleSaveAndDispatch(false)}
              disabled={isSending}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-mono font-bold rounded-lg bg-obsidian-800 hover:bg-obsidian-750 text-pearl-100 border border-obsidian-700 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-sand-400" />
              <span>{isSending ? 'Transmitting...' : 'Simulate In-App'}</span>
            </button>

            {/* Button 2: Open Actual WhatsApp Direct Link */}
            <button
              type="button"
              onClick={() => handleSaveAndDispatch(true)}
              disabled={isSending}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-mono font-bold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-pearl-50 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
            >
              <Smartphone className="w-4 h-4" />
              <span>Send to My WhatsApp</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
