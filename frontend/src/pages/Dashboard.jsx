import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MetricsGrid from '../components/MetricsGrid';
import TrafficTrendChart from '../components/TrafficTrendChart';
import TrafficChart from '../components/TrafficChart';
import LiveAlertFeed from '../components/LiveAlertFeed';
import SimulateAttackModal from '../components/SimulateAttackModal';
import WhatsAppPipelineModal from '../components/WhatsAppPipelineModal';
import RoleGuard, { useUser } from '../components/RoleGuard';
import { Sparkles, Smartphone, CheckCircle2, MessageSquare, ExternalLink, X, Shield, Lock } from 'lucide-react';

export default function Dashboard() {
  const { user, role, toggleRole } = useUser();
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  
  // Persistent or default target phone number
  const [whatsAppNumber, setWhatsAppNumber] = useState(() => {
    return localStorage.getItem('neurolock_whatsapp_number') || '+91 98765 43210';
  });

  // Floating Toast Notifications
  const [toastNotification, setToastNotification] = useState(null);

  const [totalEvents, setTotalEvents] = useState(18492);
  const [anomaliesFlagged, setAnomaliesFlagged] = useState(3);
  const [threatLevel, setThreatLevel] = useState('HIGH');
  const [spikeTriggerCount, setSpikeTriggerCount] = useState(0);

  // Initial State: Plain-English Zero-Jargon Alerts
  const [alerts, setAlerts] = useState([
    {
      id: 'ALT-9041',
      riskLevel: 'CRITICAL',
      userEmail: 'sarah.jenkins@fintech.in',
      plainEnglishSummary: 'Someone located in Frankfurt, Germany attempted to enter your password 14 times within 12 seconds. Because this fits an automated credential-guessing attack pattern, we flagged this incident for immediate isolation.',
      recommendedAction: 'Lock account and invalidate active sessions',
      timeAgo: '1 min ago',
      isResolved: false,
      dispatchedToWhatsApp: true,
      rawTelemetry: {
        timestamp: '2026-09-02T12:51:22.000Z',
        anomaly: 'AUTH_BURST_ATTACK',
        ipAddress: '185.220.101.5',
        asn: 'AS14061 (Tor Exit Node)',
        attempts: 14,
        windowSeconds: 12,
        httpCode: 401
      }
    },
    {
      id: 'ALT-9040',
      riskLevel: 'HIGH',
      userEmail: 'rohit.mehta@enterprise.in',
      plainEnglishSummary: 'We detected a successful login from Mumbai, followed 3 minutes later by another login attempt from London, UK. It is physically impossible to travel 4,400 miles in 3 minutes, suggesting someone else may possess Rohit\'s credentials.',
      recommendedAction: 'Trigger multi-factor re-authentication',
      timeAgo: '6 mins ago',
      isResolved: false,
      dispatchedToWhatsApp: true,
      rawTelemetry: {
        timestamp: '2026-09-02T12:46:10.000Z',
        anomaly: 'IMPOSSIBLE_TRAVEL_VELOCITY',
        originCity: 'Mumbai, India',
        targetCity: 'London, United Kingdom',
        distanceMiles: 4480,
        timeDeltaMinutes: 3,
        calculatedMph: 89600
      }
    },
    {
      id: 'ALT-9038',
      riskLevel: 'MEDIUM',
      userEmail: 'dev.ops@cloudcorp.in',
      plainEnglishSummary: 'A login request was made using a headless automated script on an unapproved cloud server rather than a normal web browser.',
      recommendedAction: 'Verify if scheduled CI/CD pipeline bot',
      timeAgo: '24 mins ago',
      isResolved: true,
      dispatchedToWhatsApp: false,
      rawTelemetry: {
        timestamp: '2026-09-02T12:28:44.000Z',
        anomaly: 'UNRECOGNIZED_USER_AGENT',
        userAgent: 'python-requests/2.31.0-spoofed',
        baselineDevice: 'macOS Chrome 122'
      }
    }
  ]);

  const handleSavePhoneNumber = (newNumber) => {
    setWhatsAppNumber(newNumber);
    localStorage.setItem('neurolock_whatsapp_number', newNumber);
  };

  const showToast = (title, message, isWhatsApp = true) => {
    setToastNotification({
      title,
      message,
      isWhatsApp,
      timestamp: new Date().toLocaleTimeString()
    });

    setTimeout(() => {
      setToastNotification(null);
    }, 6000);
  };

  // Handle attack injection from the Simulator
  const handleTriggerAttack = (scenario, dispatchToWA = true) => {
    setTotalEvents(prev => prev + (scenario.rawPayload.attempts || 12));
    setAnomaliesFlagged(prev => prev + 1);
    setThreatLevel('CRITICAL');
    setSpikeTriggerCount(prev => prev + 1);

    let plainEnglishText = '';
    let recAction = '';
    let risk = 'HIGH';

    if (scenario.id === 'BRUTE_FORCE') {
      risk = 'CRITICAL';
      plainEnglishText = `⚠️ Real-Time Alert: Someone at IP ${scenario.rawPayload.ipAddress} attempted ${scenario.rawPayload.attempts} rapid password guesses in ${scenario.rawPayload.timeDeltaSeconds} seconds against ${scenario.rawPayload.targetUser}. We recommend locking this account immediately.`;
      recAction = 'Lock Account & Force Password Reset';
    } else if (scenario.id === 'IMPOSSIBLE_TRAVEL') {
      risk = 'CRITICAL';
      plainEnglishText = `⚠️ Impossible Travel Detected: Login logged for ${scenario.rawPayload.targetUser} in ${scenario.rawPayload.origin}, then another attempt in ${scenario.rawPayload.destination} just ${scenario.rawPayload.timeDeltaMinutes} minutes later (speed: ${scenario.rawPayload.calculatedSpeedKmH} km/h).`;
      recAction = 'Enforce Biometric Step-Up Auth';
    } else {
      risk = 'MEDIUM';
      plainEnglishText = `⚠️ Unusual Device Signature: An unverified headless agent attempted to authenticate as ${scenario.rawPayload.targetUser} at ${scenario.rawPayload.timeOfDay}.`;
      recAction = 'Quarantine IP & Invalidate Session';
    }

    const newAlert = {
      id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      riskLevel: risk,
      userEmail: scenario.rawPayload.targetUser,
      plainEnglishSummary: plainEnglishText,
      recommendedAction: recAction,
      timeAgo: 'Just now',
      isResolved: false,
      dispatchedToWhatsApp: dispatchToWA,
      rawTelemetry: scenario.rawPayload
    };

    setAlerts(prev => [newAlert, ...prev]);

    if (dispatchToWA) {
      showToast(
        'WhatsApp Zero-Jargon Alert Dispatched',
        `Transmitted plain-English security summary to ${whatsAppNumber}`,
        true
      );
    }
  };

  const handleResolveAlert = (alertId, actionType) => {
    setAlerts(prev =>
      prev.map(item =>
        item.id === alertId ? { ...item, isResolved: true } : item
      )
    );
    showToast(
      'Account Remediated',
      `Applied mitigation policy (${actionType}) and updated telemetry state.`,
      false
    );
  };

  const handleManualDispatchFromModal = ({ phoneNumber, threat }) => {
    showToast(
      'WhatsApp Test Alert Sent',
      `Delivered zero-jargon incident breakdown for "${threat.title}" to ${phoneNumber}`,
      true
    );
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-pearl-100 flex flex-col selection:bg-crimson-600 selection:text-pearl-50 relative">
      
      {/* Top Navigation Bar */}
      <Navbar onOpenSimulator={() => setIsSimulatorOpen(true)} isLive={true} />

      {/* Floating Alert Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-obsidian-900 border border-sand-500/60 shadow-2xl rounded-2xl p-4 animate-bounce-short">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-sand-500/20 text-sand-300 border border-sand-500/40 shrink-0">
                {toastNotification.isWhatsApp ? <Smartphone className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-mono font-bold text-pearl-100 uppercase tracking-wide">
                    {toastNotification.title}
                  </h4>
                  <span className="text-[10px] font-mono text-pearl-400">
                    {toastNotification.timestamp}
                  </span>
                </div>
                <p className="text-xs text-pearl-200 mt-1 font-mono leading-relaxed">
                  {toastNotification.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setToastNotification(null)}
              className="text-pearl-400 hover:text-pearl-100 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        
        {/* Hackathon Presentation Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-950 border border-obsidian-700/80 p-6 sm:p-7 shadow-obsidian-card">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-900/40 text-sand-300 border border-crimson-700/50 text-xs font-mono font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-sand-400" />
                <span>BUILD WITH भारत 2.0 • HACKATHON LIVE MONITOR</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-pearl-100 tracking-tight">
                Real-Time Security Threat & Anomaly Radar
              </h2>
              <p className="text-sm text-pearl-300 mt-1 max-w-2xl">
                Ingesting raw authentication streams, flagging behavioral anomalies, and delivering zero-jargon plain-English explanations directly to non-technical stakeholders via WhatsApp.
              </p>

              {role === 'staff' && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-700/60 text-xs font-mono text-cyan-300">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    Staff View Active: Showing alerts assigned to <strong>{user?.name}</strong> ({user?.email})
                  </span>
                </div>
              )}
            </div>

            {/* Interactive WhatsApp Link Pill & Number Configuration Card (Owner Privileged) */}
            <RoleGuard
              allowedRoles={['owner']}
              fallback={
                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-obsidian-950/70 border border-obsidian-800 shrink-0 w-full lg:w-auto">
                  <div className="p-2.5 rounded-xl bg-obsidian-900 text-pearl-400 border border-obsidian-800">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-pearl-400 block">WhatsApp Pipeline:</span>
                    <div className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                      <span>CONNECTED</span>
                      <span className="text-pearl-400">({whatsAppNumber})</span>
                    </div>
                  </div>
                </div>
              }
            >
              <div
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="group cursor-pointer flex items-center gap-3.5 p-3.5 rounded-2xl bg-obsidian-950/90 border border-obsidian-700 hover:border-sand-500/70 shadow-md hover:shadow-sand-glow-sm transition-all duration-200 shrink-0 w-full lg:w-auto"
              >
                <div className="relative p-2.5 rounded-xl bg-sand-500/15 text-sand-400 border border-sand-500/30 group-hover:scale-105 transition-transform">
                  <Smartphone className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-mono text-pearl-400 block">WhatsApp Pipeline:</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sand-900/40 text-sand-300 border border-sand-700/40 group-hover:bg-sand-500 group-hover:text-obsidian-950 transition-colors">
                      TEST / CHANGE ↗
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold text-sand-300 flex items-center gap-1.5 mt-0.5">
                    <span className="text-emerald-400">CONNECTED</span>
                    <span className="text-pearl-200">({whatsAppNumber})</span>
                  </div>
                </div>
              </div>
            </RoleGuard>
          </div>
        </div>

        {/* 1. Real-Time Metrics Grid */}
        <MetricsGrid
          totalEvents={totalEvents}
          anomaliesFlagged={anomaliesFlagged}
          threatLevel={threatLevel}
          llmProcessed={anomaliesFlagged}
          parsingRate="480 ev/s"
        />

        {/* 2. Historical Threat Severity Trend (7D / 30D Rolling Posture) */}
        <TrafficTrendChart />

        {/* 3. Interactive Real-Time Charts & Ingestion Timeline */}
        <TrafficChart anomalyEventCount={spikeTriggerCount} />

        {/* 3. Live Zero-Jargon Plain-English Incident Feed */}
        <LiveAlertFeed
          alerts={role === 'staff' ? alerts.filter(a => a.userEmail === user?.email || a.id === 'ALT-9041') : alerts}
          onResolveAlert={handleResolveAlert}
        />

      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-obsidian-800 bg-obsidian-950/90 py-6 px-4 text-center text-xs font-mono text-pearl-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            NEUROLOCK © 2026 • Crafted by <strong className="text-sand-300">Team PARADOX</strong> for Build with भारत 2.0
          </span>
          <div className="flex items-center gap-4 text-pearl-400">
            <span>React.js + Tailwind CSS</span>
            <span>•</span>
            <span>Node.js / Express</span>
            <span>•</span>
            <span>LLM Intelligence</span>
            <span>•</span>
            <span>WhatsApp Dispatch API</span>
          </div>
        </div>
      </footer>

      {/* Attack Simulator Modal (Protected: Owner Only) */}
      <RoleGuard allowedRoles={['owner']}>
        <SimulateAttackModal
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          onTriggerAttack={handleTriggerAttack}
          whatsAppNumber={whatsAppNumber}
        />
      </RoleGuard>

      {/* WhatsApp Pipeline Tester & Phone Number Setup Modal */}
      <WhatsAppPipelineModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        phoneNumber={whatsAppNumber}
        onSavePhoneNumber={handleSavePhoneNumber}
        onDispatchAlert={handleManualDispatchFromModal}
      />

    </div>
  );
}
