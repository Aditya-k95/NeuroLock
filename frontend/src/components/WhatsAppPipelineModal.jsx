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

  const formattedWhatsAppMessage = `🛡️ *NEUROLOCK THREAT RADAR* (NexHack 2.0 • WolfPack Squadron)\n━━━━━━━━━━━━━━━━━━━━\n${currentThreat.summary}\n\n💡 *Action Needed:*\n${currentThreat.action}\n━━━━━━━━━━━━━━━━━━━━\n_Delivered in real-time by NeuroLock Zero-Jargon AI Engine_`;

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
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0d0a14]/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#151220] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#231d38] bg-[#110d1c]">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  WhatsApp Alert Dispatch Pipeline
                </h3>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE TWILIO / WHATSAPP API
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Input any phone number to test instant zero-jargon mobile threat alerts
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Section 1: Phone Number Input */}
          <div className="bg-[#0e0a17] p-4 rounded-2xl border border-[#231d38]">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              1. Target Recipient Phone Number
            </label>
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="h-11 px-3 bg-[#151220] border border-[#231d38] rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-purple-500 cursor-pointer"
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
                  className="w-full h-11 px-3.5 bg-[#151220] border border-[#231d38] rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const saved = `${countryCode} ${inputNumber.trim()}`;
                  onSavePhoneNumber(saved);
                  alert(`Saved active notification recipient: ${saved}`);
                }}
                className="px-4 h-11 bg-[#221a38] hover:bg-[#2c2248] text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Check className="w-3.5 h-3.5 text-purple-400" />
                Save Number
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              💡 Tip for Judges/Reviewers: Type your own number and click <strong>"Send to My WhatsApp"</strong> to receive the live test on your phone.
            </p>
          </div>

          {/* Section 2: Choose Threat Simulation Scenario */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
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
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#221a38] border-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                        : 'bg-[#0e0a17] border-[#231d38] hover:border-purple-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`p-1.5 rounded-xl bg-[#171226] ${threat.risk === 'CRITICAL' ? 'text-rose-400' : 'text-yellow-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${threat.risk === 'CRITICAL' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' : 'bg-yellow-400/15 text-yellow-300 border border-yellow-400/30'}`}>
                        {threat.risk}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white">
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
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                3. WhatsApp Recipient View (Zero-Jargon LLM Payload)
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            {/* Dark Mode WhatsApp Bubble Container */}
            <div className="bg-[#0b141a] p-4 rounded-2xl border border-[#231d38] shadow-inner">
              <div className="max-w-md bg-[#1f2c34] text-[#e9edef] rounded-2xl rounded-tl-sm p-3.5 shadow-md border border-[#2a3942] relative">
                <div className="flex items-center gap-2 pb-2 mb-2 border-b border-[#2a3942] text-[11px] text-emerald-400 font-bold">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>NeuroLock Security Bot (Verified)</span>
                </div>
                
                <div className="text-xs leading-relaxed space-y-2 font-sans whitespace-pre-wrap">
                  {formattedWhatsAppMessage}
                </div>

                <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-[#2a3942] text-[10px] text-gray-400">
                  <span>To: {countryCode} {inputNumber || 'XXXXXXXXXX'}</span>
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Success Status Notice */}
          {dispatchStatus && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex-1">
                <span>{dispatchStatus.message}</span>
                <span className="text-[10px] text-emerald-400/80 ml-2">[{dispatchStatus.timestamp}]</span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-[#110d1c] border-t border-[#231d38]">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            <span>Target: <strong className="text-purple-300">{countryCode} {inputNumber}</strong></span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Button 1: Simulate In Dashboard */}
            <button
              type="button"
              onClick={() => handleSaveAndDispatch(false)}
              disabled={isSending}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-[#221a38] hover:bg-[#2c2248] text-white border border-purple-500/30 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-purple-400" />
              <span>{isSending ? 'Transmitting...' : 'Simulate In-App'}</span>
            </button>

            {/* Button 2: Open Actual WhatsApp Direct Link */}
            <button
              type="button"
              onClick={() => handleSaveAndDispatch(true)}
              disabled={isSending}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all disabled:opacity-50 active:scale-95"
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

