import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import MetricsGrid from '../components/MetricsGrid';
import TrafficTrendChart from '../components/TrafficTrendChart';
import TrafficChart from '../components/TrafficChart';
import LiveAlertFeed from '../components/LiveAlertFeed';
import SimulateAttackModal from '../components/SimulateAttackModal';
import WhatsAppPipelineModal from '../components/WhatsAppPipelineModal';
import UserProfileModal from '../components/UserProfileModal';
import AuditLogsModal from '../components/AuditLogsModal';
import EngineSettingsModal from '../components/EngineSettingsModal';
import NotificationToast from '../components/NotificationToast';
import ThreatDistributionChart from '../components/ThreatDistributionChart';
import RoleGuard, { useUser } from '../components/RoleGuard';
import { useLanguage } from '../context/LanguageContext';
import { getSocket } from '../services/socket';
import {
  Sparkles,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  X,
  Zap,
  ShieldCheck,
  Flame,
  ArrowUpRight,
  Send,
  MessageSquare,
  Activity,
  ShieldAlert,
  Sliders,
  TrendingUp,
  Shield
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  const { t } = useLanguage();
  const { user, role, setUser } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Dynamic User Profile State (persisted to localStorage)
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('neurolock_user_name') || user?.name || 'User';
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('neurolock_user_role') || user?.role || 'SecOps Lead';
  });

  // Search Query State for live incident search
  const [searchQuery, setSearchQuery] = useState('');
  
  // Persistent target phone number
  const [whatsAppNumber, setWhatsAppNumber] = useState(() => {
    return localStorage.getItem('neurolock_whatsapp_number') || '+91 98765 43210';
  });

  // Floating Toast Notification State & Notification History Log
  const [toastNotification, setToastNotification] = useState(null);
  const [notificationsHistory, setNotificationsHistory] = useState([
    {
      id: 'init-1',
      title: 'Radar Initialized',
      message: 'Autonomous sliding-window telemetry radar active and monitoring auth endpoints.',
      isWhatsApp: false,
      type: 'INFO',
      timestamp: '18:10'
    }
  ]);

  // Listen for language switch notifications
  useEffect(() => {
    const handleLangChange = (e) => {
      if (e.detail?.toastMessage) {
        setToastNotification({
          id: `lang-${Date.now()}`,
          title: '🌐 Language Switched / भाषा बदली',
          message: e.detail.toastMessage,
          isWhatsApp: false,
          type: 'INFO',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    };
    window.addEventListener('neurolock-language-changed', handleLangChange);
    return () => window.removeEventListener('neurolock-language-changed', handleLangChange);
  }, []);

  const [totalEvents, setTotalEvents] = useState(18492);
  const [anomaliesFlagged, setAnomaliesFlagged] = useState(3);
  const [threatLevel, setThreatLevel] = useState('HIGH');
  const [spikeTriggerCount, setSpikeTriggerCount] = useState(0);

  // Initial State: Fallback Demo Alerts
  const [alerts, setAlerts] = useState([
    {
      id: 'ALT-9041',
      riskLevel: 'CRITICAL',
      severity: 'CRITICAL',
      userEmail: 'sarah.jenkins@fintech.in',
      username: 'sarah.jenkins@fintech.in',
      title: 'CRITICAL Risk: Credential Stuffing Burst',
      plainEnglishSummary: 'Someone located in Frankfurt, Germany attempted to enter your password 14 times within 12 seconds. Because this fits an automated credential-guessing attack pattern, we flagged this incident for immediate isolation.',
      explanation: 'Someone located in Frankfurt, Germany attempted to enter your password 14 times within 12 seconds. Because this fits an automated credential-guessing attack pattern, we flagged this incident for immediate isolation.',
      recommendedAction: 'Lock account and invalidate active sessions',
      timeAgo: '1 min ago',
      isResolved: false,
      status: 'ACTIVE',
      dispatchedToWhatsApp: false,
      rawTelemetry: {
        timestamp: '2026-09-02T12:51:22.000Z',
        anomaly: 'AUTH_BURST_ATTACK',
        eventType: 'AUTH_BURST_FAILURE',
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
      severity: 'HIGH',
      userEmail: 'rohit.mehta@enterprise.in',
      username: 'rohit.mehta@enterprise.in',
      title: 'HIGH Risk: Impossible Travel Anomaly',
      plainEnglishSummary: 'We detected a successful login from Mumbai, followed 3 minutes later by another login attempt from London, UK. It is physically impossible to travel 4,400 miles in 3 minutes, suggesting someone else may possess Rohit\'s credentials.',
      explanation: 'We detected a successful login from Mumbai, followed 3 minutes later by another login attempt from London, UK. It is physically impossible to travel 4,400 miles in 3 minutes, suggesting someone else may possess Rohit\'s credentials.',
      recommendedAction: 'Trigger multi-factor re-authentication',
      timeAgo: '6 mins ago',
      isResolved: false,
      status: 'ACTIVE',
      dispatchedToWhatsApp: false,
      rawTelemetry: {
        timestamp: '2026-09-02T12:46:10.000Z',
        anomaly: 'IMPOSSIBLE_TRAVEL_VELOCITY',
        eventType: 'GEO_IMPOSSIBLE_TRAVEL',
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
      severity: 'MEDIUM',
      userEmail: 'dev.ops@cloudcorp.in',
      username: 'dev.ops@cloudcorp.in',
      title: 'MEDIUM Risk: Unrecognized Headless Agent',
      plainEnglishSummary: 'A login request was made using a headless automated script on an unapproved cloud server rather than a normal web browser.',
      explanation: 'A login request was made using a headless automated script on an unapproved cloud server rather than a normal web browser.',
      recommendedAction: 'Verify if scheduled CI/CD pipeline bot',
      timeAgo: '24 mins ago',
      isResolved: true,
      status: 'RESOLVED',
      dispatchedToWhatsApp: false,
      rawTelemetry: {
        timestamp: '2026-09-02T12:28:44.000Z',
        anomaly: 'UNRECOGNIZED_USER_AGENT',
        eventType: 'DEVICE_DEVIATION',
        userAgent: 'python-requests/2.31.0-spoofed',
        baselineDevice: 'macOS Chrome 122'
      }
    }
  ]);

  // Connect to Backend REST API & Real-time WebSockets on Mount
  useEffect(() => {
    let isMounted = true;

    // 1. Fetch live alerts from backend
    const fetchBackendAlerts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/alerts`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
            setAlerts(json.data);
            const activeAlerts = json.data.filter(a => !a.isResolved && a.status !== 'RESOLVED');
            setAnomaliesFlagged(activeAlerts.length);
            const hasCritical = activeAlerts.some(a => a.severity === 'CRITICAL' || a.riskLevel === 'CRITICAL');
            setThreatLevel(hasCritical ? 'CRITICAL' : activeAlerts.length > 0 ? 'HIGH' : 'LOW');
          }
        }
      } catch (err) {
        console.warn('[Dashboard] Alerts fetch notice:', err.message);
      }
    };

    fetchBackendAlerts();

    // 2. Real-time Socket.io listener for new alerts and status updates
    try {
      const socket = getSocket();
      if (socket) {
        const handleNewAlert = (newAlert) => {
          if (!isMounted) return;
          setAlerts(prev => {
            const exists = prev.some(a => a.id === newAlert.id || a._id === newAlert._id);
            if (exists) return prev;
            return [newAlert, ...prev];
          });
          setAnomaliesFlagged(prev => prev + 1);
          setTotalEvents(prev => prev + (newAlert.rawTelemetry?.attempts || 12));
          if (newAlert.severity === 'CRITICAL' || newAlert.riskLevel === 'CRITICAL') {
            setThreatLevel('CRITICAL');
          }
        };

        const handleUpdatedAlert = (updated) => {
          if (!isMounted) return;
          setAlerts(prev =>
            prev.map(item =>
              (item.id === updated.id || item._id === updated._id || item.id === updated._id)
                ? { ...item, ...updated, isResolved: updated.status === 'RESOLVED' }
                : item
            )
          );
        };

        socket.on('alert:new', handleNewAlert);
        socket.on('alert:updated', handleUpdatedAlert);

        return () => {
          isMounted = false;
          socket.off('alert:new', handleNewAlert);
          socket.off('alert:updated', handleUpdatedAlert);
        };
      }
    } catch (sockErr) {
      console.warn('[Dashboard] Socket notice:', sockErr.message);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (title, message, isWhatsApp = true, type = 'INFO') => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      title,
      message,
      isWhatsApp,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setToastNotification(newNotif);
    setNotificationsHistory(prev => [newNotif, ...prev]);
  };

  const handleSaveProfile = ({ name, role: newRole }) => {
    setUserName(name);
    setUserRole(newRole);
    localStorage.setItem('neurolock_user_name', name);
    localStorage.setItem('neurolock_user_role', newRole);
    if (setUser) {
      setUser(prev => ({
        ...prev,
        name,
        role: newRole.toLowerCase().includes('staff') ? 'staff' : (prev?.role || 'owner')
      }));
    }
    showToast(
      'Operator Profile Updated',
      `Welcome, ${name} (${newRole}). Radar credentials synchronized.`,
      false,
      'PROFILE'
    );
  };

  const handleSavePhoneNumber = (newNumber) => {
    setWhatsAppNumber(newNumber);
    localStorage.setItem('neurolock_whatsapp_number', newNumber);
  };

  // Handle attack injection from the Simulator by posting telemetry to backend detection pipeline
  const handleTriggerAttack = async (scenario, dispatchToWA = true) => {
    setTotalEvents(prev => prev + (scenario.rawPayload.attempts || 12));
    setAnomaliesFlagged(prev => prev + 1);
    setThreatLevel('CRITICAL');
    setSpikeTriggerCount(prev => prev + 1);

    try {
      const response = await fetch(`${API_BASE_URL}/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: scenario.rawPayload.eventType,
          targetUser: scenario.rawPayload.targetUser,
          attempts: scenario.rawPayload.attempts,
          timeDeltaSeconds: scenario.rawPayload.timeDeltaSeconds,
          ipAddress: scenario.rawPayload.ipAddress,
          deviceId: scenario.rawPayload.userAgent || scenario.rawPayload.deviceId,
          calculatedSpeedKmH: scenario.rawPayload.calculatedSpeedKmH,
          scenarioId: scenario.id,
          scenarioTitle: scenario.title,
          rawPayload: scenario.rawPayload
        })
      });

      const data = await response.json();
      if (data.success && data.alert) {
        setAlerts(prev => {
          const exists = prev.some(a => a.id === data.alert.id || a._id === data.alert._id);
          if (exists) return prev;
          return [data.alert, ...prev];
        });

        showToast(
          `${data.alert.severity || data.alert.riskLevel} Threat Flagged`,
          data.alert.title || data.alert.explanation || data.alert.plainEnglishSummary,
          false,
          'THREAT'
        );
      }
    } catch (err) {
      console.warn('[Dashboard] Telemetry POST fallback:', err.message);

      let risk = scenario.id === 'BRUTE_FORCE' ? 'CRITICAL' : 'HIGH';
      const fallbackAlert = {
        id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
        riskLevel: risk,
        severity: risk,
        userEmail: scenario.rawPayload.targetUser,
        username: scenario.rawPayload.targetUser,
        title: `${risk} Risk: ${scenario.title}`,
        plainEnglishSummary: `Injected anomaly simulation for ${scenario.title} against ${scenario.rawPayload.targetUser}.`,
        explanation: `Injected anomaly simulation for ${scenario.title} against ${scenario.rawPayload.targetUser}.`,
        recommendedAction: 'Verify credentials and enforce immediate session invalidation',
        timeAgo: 'Just now',
        isResolved: false,
        status: 'ACTIVE',
        dispatchedToWhatsApp: false,
        rawTelemetry: scenario.rawPayload
      };
      setAlerts(prev => [fallbackAlert, ...prev]);
    }
  };

  // Handle resolving an alert (updates backend and local state)
  const handleResolveAlert = async (alertId, actionType = 'LOCK_ACCOUNT') => {
    // 1. Optimistically update local state
    setAlerts(prev =>
      prev.map(item =>
        (item.id === alertId || item._id === alertId)
          ? { ...item, isResolved: true, status: 'RESOLVED' }
          : item
      )
    );
    setAnomaliesFlagged(prev => Math.max(0, prev - 1));
    showToast(
      'Account Remediated',
      `Applied mitigation policy (${actionType}) and isolated compromised credentials.`,
      false
    );

    // 2. Persist to backend
    try {
      await fetch(`${API_BASE_URL}/alerts/${alertId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED' })
      });
    } catch (err) {
      console.warn('[Dashboard] Could not sync resolve status with backend:', err.message);
    }
  };

  // Handle acknowledging an alert (updates backend and local state)
  const handleAcknowledgeAlert = async (alertId) => {
    // 1. Optimistically update local state
    setAlerts(prev =>
      prev.map(item =>
        (item.id === alertId || item._id === alertId)
          ? { ...item, status: 'ACKNOWLEDGED' }
          : item
      )
    );
    showToast(
      'Incident Acknowledged',
      `Incident ${alertId} reviewed by operator. Under observation.`,
      false
    );

    // 2. Persist to backend
    try {
      await fetch(`${API_BASE_URL}/alerts/${alertId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACKNOWLEDGED' })
      });
    } catch (err) {
      console.warn('[Dashboard] Could not sync acknowledge status with backend:', err.message);
    }
  };

  const handleManualDispatchFromModal = ({ phoneNumber, threat }) => {
    showToast(
      'WhatsApp Test Alert Simulated',
      `Delivered zero-jargon incident breakdown for "${threat.title}" to ${phoneNumber}`,
      true
    );
  };

  // Scoped alerts based on Role (Staff vs Owner)
  const roleScopedAlerts = role === 'staff'
    ? alerts.filter(a => (a.userEmail === user?.email || a.username === user?.email) || a.id === 'ALT-9041')
    : alerts;

  // Filter alerts by search query
  const filteredAlerts = roleScopedAlerts.filter(alert => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const userField = (alert.userEmail || alert.username || '').toLowerCase();
    const idField = (alert.id || alert._id || '').toLowerCase();
    const summaryField = (alert.plainEnglishSummary || alert.explanation || '').toLowerCase();
    const ipField = alert.rawTelemetry?.ipAddress || alert.sourceIp || '';

    return (
      userField.includes(q) ||
      idField.includes(q) ||
      summaryField.includes(q) ||
      ipField.includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#0d0a14] text-slate-100 flex flex-row selection:bg-purple-600 selection:text-white relative font-sans">
      
      {/* 1. Slim Icon-Only Sidebar on the far left (~72px wide) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenWhatsApp={() => setIsWhatsAppModalOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        alertCount={filteredAlerts.filter(a => !a.isResolved && a.status !== 'RESOLVED').length}
      />

      {/* 2. Main Body Container with Top Header */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navigation Bar */}
        <Navbar
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          onOpenWhatsApp={() => setIsWhatsAppModalOpen(true)}
          onOpenUserProfile={() => setIsUserProfileOpen(true)}
          userName={userName}
          userRole={userRole}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          notifications={notificationsHistory}
          onClearNotifications={() => setNotificationsHistory([])}
          isLive={true}
          alertCount={filteredAlerts.filter(a => !a.isResolved && a.status !== 'RESOLVED').length}
        />

        {/* Luxury Glassmorphic Floating Toast Notification */}
        <NotificationToast
          notification={toastNotification}
          onClose={() => setToastNotification(null)}
          onAction={() => setIsWhatsAppModalOpen(true)}
        />

        {/* Main Viewport Content: View Switcher */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          
          {/* Top Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#171228] via-[#1a152e] to-[#140f24] border border-purple-500/20 p-6 sm:p-7 shadow-saas-card">
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>MINI PROJECT 2026 • WOLFPACK SQUADRON RADAR</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Real-Time Security Threat & Anomaly Radar
                </h2>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Welcome back, <strong className="text-purple-300 font-bold">{userName}</strong> ({userRole}). Ingesting authentication streams, detecting behavioral anomalies in milliseconds, and delivering zero-jargon plain-English explanations.
                </p>

                {role === 'staff' && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-700/60 text-xs font-mono text-cyan-300">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      Staff View Scoped: Displaying incidents assigned to <strong>{user?.name}</strong> ({user?.email})
                    </span>
                  </div>
                )}
              </div>

              {/* Quick WhatsApp Configuration Pill */}
              <div
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="group cursor-pointer flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0e0a17]/90 border border-purple-500/20 hover:border-purple-500/50 shadow-md hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all shrink-0 w-full lg:w-auto"
              >
                <div className="relative p-2.5 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 group-hover:scale-105 transition-transform">
                  <Smartphone className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400 block font-medium">Notification Channel:</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      TEST / VIEW ↗
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <span className="text-emerald-400">READY</span>
                    <span className="text-slate-300">({whatsAppNumber})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* View Tab Navigation Pill Selector */}
          <div className="flex items-center gap-2 border-b border-[#231d38]/60 pb-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                  : 'text-slate-400 hover:text-white bg-[#151220]'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Full Radar Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'alerts'
                  ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                  : 'text-slate-400 hover:text-white bg-[#151220]'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Threat Alerts ({filteredAlerts.filter(a => !a.isResolved && a.status !== 'RESOLVED').length})</span>
            </button>

            <button
              onClick={() => setActiveTab('traffic')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'traffic'
                  ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                  : 'text-slate-400 hover:text-white bg-[#151220]'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Telemetry & Traffic</span>
            </button>
          </div>

          {/* 1. Real-Time Metrics Grid (4 Key SaaS Cards) */}
          <MetricsGrid
            totalEvents={totalEvents}
            anomaliesFlagged={anomaliesFlagged}
            threatLevel={threatLevel}
            llmProcessed={anomaliesFlagged}
            parsingRate="480 ev/s"
          />

          {/* 2. Main Content Split: Controlled by Active Sidebar / Tab */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
              
              {/* Wider Left Column (8 cols): Traffic Trend & Real-time Chart & Health Card */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                <TrafficTrendChart />
                <TrafficChart anomalyEventCount={spikeTriggerCount} />

                {/* Stream Pipeline Health Card */}
                <div className="saas-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-bold text-white">
                        Live Telemetry Stream Pipeline Status
                      </h3>
                    </div>
                    <span className="badge-green">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      99.98% Uptime
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-[#0e0a17] border border-[#231d38]">
                      <div className="text-xs text-slate-400">Sliding Window Ingestion</div>
                      <div className="text-lg font-bold text-white mt-1">100% Real-Time</div>
                      <div className="text-[11px] text-purple-400 mt-1">Zero dropped events</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0e0a17] border border-[#231d38]">
                      <div className="text-xs text-slate-400">Anomaly Pipeline Latency</div>
                      <div className="text-lg font-bold text-white mt-1">&lt; 15ms Ingestion</div>
                      <div className="text-[11px] text-yellow-400 mt-1">Deterministic heuristics</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0e0a17] border border-[#231d38]">
                      <div className="text-xs text-slate-400">Storage Subsystem</div>
                      <div className="text-lg font-bold text-emerald-400 mt-1">Active Dual Mode</div>
                      <div className="text-[11px] text-slate-400 mt-1">MongoDB + Memory Fallback</div>
                    </div>
                  </div>
                </div>

                {/* Threat Vector & Risk Distribution Pie/Donut Chart */}
                <ThreatDistributionChart alerts={filteredAlerts} />
              </div>

              {/* Narrower Right Column: Threat Feed + Standout Hero Card */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                <LiveAlertFeed
                  alerts={filteredAlerts}
                  onResolveAlert={handleResolveAlert}
                  onAcknowledgeAlert={handleAcknowledgeAlert}
                />

                {/* Standout HERO CARD in Bottom-Right */}
                <div className="saas-hero-card p-6 sm:p-7 relative overflow-hidden group">
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                  <div className="absolute -left-10 -top-10 w-32 h-32 rounded-full bg-yellow-300/20 blur-xl pointer-events-none" />

                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                        <span>{t('heroBadge', 'Zero-Jargon Threat Engine')}</span>
                      </div>
                      <span className="text-[11px] text-white/80 font-medium">
                        Instant Mitigation Ready
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-extrabold text-white tracking-tight leading-snug">
                        Zero-Jargon Cybersecurity Intelligence
                      </h3>
                      <p className="text-xs text-white/90 mt-1.5 leading-relaxed font-normal">
                        Converts cryptic network bursts and raw authorization payloads into clear, human-actionable plain-English incident alerts for stakeholders.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-white">
                        <Smartphone className="w-4 h-4 text-yellow-200" />
                        <span className="font-semibold">{whatsAppNumber}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                        MONITORED
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 pt-1">
                      <RoleGuard allowedRoles={['owner']}>
                        <button
                          onClick={() => setIsSimulatorOpen(true)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-purple-950 hover:bg-slate-100 font-bold text-xs shadow-lg transition-all active:scale-95"
                        >
                          <Zap className="w-3.5 h-3.5 text-purple-700" />
                          <span>Launch Attack Simulator</span>
                        </button>
                      </RoleGuard>

                      <button
                        onClick={() => setIsWhatsAppModalOpen(true)}
                        className="flex items-center justify-center p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md transition-all active:scale-95"
                        title="View Notification Dispatch Pipeline"
                      >
                        <Send className="w-4 h-4 text-yellow-200" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* View Tab 2: Dedicated Threat Alerts View */}
          {activeTab === 'alerts' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="saas-card p-6 border border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-500/15 text-purple-300">
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Active Threat Incidents & Mitigation Center</h3>
                      <p className="text-xs text-slate-400">Deep-dive incident analysis with instant 1-click credential revocation and acknowledgment</p>
                    </div>
                  </div>
                  <RoleGuard allowedRoles={['owner']}>
                    <button
                      onClick={() => setIsSimulatorOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-all shadow-md"
                    >
                      <Zap className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Inject Test Threat</span>
                    </button>
                  </RoleGuard>
                </div>
                
                <LiveAlertFeed
                  alerts={filteredAlerts}
                  onResolveAlert={handleResolveAlert}
                  onAcknowledgeAlert={handleAcknowledgeAlert}
                />
              </div>
            </div>
          )}

          {/* View Tab 3: Dedicated Telemetry & Traffic Stream View */}
          {activeTab === 'traffic' && (
            <div className="space-y-6 animate-fadeIn">
              <TrafficTrendChart />
              <TrafficChart anomalyEventCount={spikeTriggerCount} />
              
              <div className="saas-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                      <Activity className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-white">Sliding-Window Heuristic Engine Metrics</h3>
                  </div>
                  <span className="text-xs text-purple-400 font-mono">Telemetry Pipeline: ACTIVE</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#0e0a17] border border-[#231d38]">
                    <div className="text-slate-400">Current Ingestion Rate</div>
                    <div className="text-xl font-bold text-white mt-1">480 req/sec</div>
                    <div className="text-purple-400 mt-1">Nominal Capacity</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0e0a17] border border-[#231d38]">
                    <div className="text-slate-400">Sliding Window</div>
                    <div className="text-xl font-bold text-yellow-400 mt-1">30 Seconds</div>
                    <div className="text-slate-400 mt-1">Rolling buffer</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0e0a17] border border-[#231d38]">
                    <div className="text-slate-400">Anomaly Trigger Threshold</div>
                    <div className="text-xl font-bold text-rose-400 mt-1">&gt; 4 Fails / 60s</div>
                    <div className="text-slate-400 mt-1">Burst heuristic</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0e0a17] border border-[#231d38]">
                    <div className="text-slate-400">Storage State</div>
                    <div className="text-xl font-bold text-purple-300 mt-1">In-Memory Active</div>
                    <div className="text-slate-400 mt-1">Zero-credential local mode</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-[#1f1a33]/60 bg-[#0d0a14] py-6 px-4 sm:px-8 text-center text-xs text-slate-400">
          <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>
              NEUROLOCK © 2026 • Crafted by <strong className="text-purple-400">WolfPack Squadron</strong> for Mini Project 2026
            </span>
            <div className="flex items-center gap-3 text-slate-500 text-[11px]">
              <span className="text-slate-300">React + Tailwind CSS</span>
              <span>•</span>
              <span className="text-slate-300">Express + Socket.io</span>
              <span>•</span>
              <span className="text-slate-300">Zero-Jargon Heuristic Engine</span>
              <span>•</span>
              <span className="text-slate-300">MSME Threat Radar</span>
            </div>
          </div>
        </footer>

      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
        userName={userName}
        userRole={userRole}
        onSaveProfile={handleSaveProfile}
      />

      {/* Audit Logs Modal */}
      <AuditLogsModal
        isOpen={isAuditLogsOpen}
        onClose={() => setIsAuditLogsOpen(false)}
        alerts={alerts}
      />

      {/* Engine Settings Modal */}
      <EngineSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        whatsAppNumber={whatsAppNumber}
        onSavePhoneNumber={handleSavePhoneNumber}
        userName={userName}
        userRole={userRole}
        onSaveProfile={handleSaveProfile}
      />

      {/* Attack Simulator Modal (Owner Protected) */}
      <RoleGuard allowedRoles={['owner']}>
        <SimulateAttackModal
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          onTriggerAttack={handleTriggerAttack}
          whatsAppNumber={whatsAppNumber}
        />
      </RoleGuard>

      {/* WhatsApp Pipeline Modal */}
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
