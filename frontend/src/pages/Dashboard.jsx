import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import MetricsGrid from '../components/MetricsGrid';
import TrafficChart from '../components/TrafficChart';
import LiveAlertFeed from '../components/LiveAlertFeed';
import SimulateAttackModal from '../components/SimulateAttackModal';
import { Sparkles, Smartphone } from 'lucide-react';

export default function Dashboard() {
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
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
      rawTelemetry: {
        timestamp: '2026-09-02T12:28:44.000Z',
        anomaly: 'UNRECOGNIZED_USER_AGENT',
        userAgent: 'python-requests/2.31.0-spoofed',
        baselineDevice: 'macOS Chrome 122'
      }
    }
  ]);

  // Handle attack injection from the Simulator
  const handleTriggerAttack = (scenario) => {
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
      rawTelemetry: scenario.rawPayload
    };

    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleResolveAlert = (alertId, actionType) => {
    setAlerts(prev =>
      prev.map(item =>
        item.id === alertId ? { ...item, isResolved: true } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-pearl-100 flex flex-col selection:bg-crimson-600 selection:text-pearl-50">
      
      {/* Top Navigation Bar */}
      <Navbar onOpenSimulator={() => setIsSimulatorOpen(true)} isLive={true} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        
        {/* Hackathon Presentation Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-950 border border-obsidian-700/80 p-6 sm:p-7 shadow-obsidian-card">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-900/40 text-sand-300 border border-crimson-700/50 text-xs font-mono font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-sand-400" />
                <span>BUILD WITH भारत 2.0 • HACKATHON LIVE MONITOR</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-pearl-100 tracking-tight">
                Real-Time Security Threat & Anomaly Radar
              </h2>
              <p className="text-sm text-pearl-300 mt-1 max-w-2xl">
                Ingesting raw authentication streams, flagging behavioral anomalies, and delivering zero-jargon plain-English explanations directly to non-technical stakeholders.
              </p>
            </div>

            {/* Quick WhatsApp Link Pill */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-obsidian-950 border border-obsidian-700">
              <div className="p-2 rounded-lg bg-sand-500/15 text-sand-400 border border-sand-500/30">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-pearl-400 block">WhatsApp Pipeline:</span>
                <span className="text-xs font-mono font-bold text-sand-300">CONNECTED (+91-98XXX)</span>
              </div>
            </div>
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

        {/* 2. Interactive Charts & Ingestion Timeline */}
        <TrafficChart anomalyEventCount={spikeTriggerCount} />

        {/* 3. Live Zero-Jargon Plain-English Incident Feed */}
        <LiveAlertFeed
          alerts={alerts}
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
          </div>
        </div>
      </footer>

      {/* Attack Simulator Modal */}
      <SimulateAttackModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onTriggerAttack={handleTriggerAttack}
      />

    </div>
  );
}
