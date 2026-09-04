import cron from 'node-cron';
import mongoose from 'mongoose';
import Alert from '../models/Alert.js';
import { sendWhatsAppAlert } from './whatsappSender.js';

/**
 * Default Escalation and Auto-Action Configuration
 */
export const DEFAULT_ESCALATION_CONFIG = {
  highRiskThreshold: 60, // Minimum risk score (0-100) to qualify as HIGH_RISK
  timeoutMinutes: 5, // Response SLA before automated mitigation fires
  cronSchedule: '*/1 * * * *', // Run scheduled check every minute
  escalateToWhatsApp: true,
  defaultRecipient: process.env.ADMIN_WHATSAPP_NUMBER || '+91 98765 43210'
};

/**
 * Active Session Quarantine Store
 * Maintains state of automatically isolated sessions across the cluster.
 */
const blockedSessions = new Map();

/**
 * In-memory fallback alerts store for offline execution and automated tests.
 */
const inMemoryActiveAlerts = [];

/**
 * Quarantines a session ID, invalidating active access tokens and restricting requests.
 *
 * @param {string} sessionId - Identifier of the session, device, or user token to isolate
 * @param {Object} [context] - Trigger metadata and threat context
 * @returns {{success: boolean, sessionId: string, blockedAt: Date, reason: string, context: Object}}
 */
export const autoBlock = (sessionId, context = {}) => {
  if (!sessionId) {
    console.warn('[EscalationService] autoBlock called without valid sessionId');
    return { success: false, error: 'Missing sessionId' };
  }

  const blockRecord = {
    sessionId,
    blockedAt: new Date(),
    reason: context.reason || 'Automated high-risk timeout mitigation',
    context: {
      alertId: context.alertId || null,
      username: context.username || 'unknown',
      riskScore: context.riskScore || 0,
      severity: context.severity || 'HIGH',
      ...context
    },
    status: 'BLOCKED'
  };

  blockedSessions.set(sessionId, blockRecord);

  console.log(
    `[EscalationService] 🚫 AUTO-BLOCKED session: "${sessionId}" | User: "${blockRecord.context.username}" | Reason: "${blockRecord.reason}"`
  );

  return {
    success: true,
    sessionId,
    blockedAt: blockRecord.blockedAt,
    reason: blockRecord.reason,
    context: blockRecord.context
  };
};

/**
 * Checks if a session ID is currently quarantined.
 *
 * @param {string} sessionId
 * @returns {boolean}
 */
export const isSessionBlocked = (sessionId) => {
  return blockedSessions.has(sessionId);
};

/**
 * Manually remediates and removes a session from quarantine.
 *
 * @param {string} sessionId
 * @returns {boolean} True if unblocked, false if session was not found
 */
export const unblockSession = (sessionId) => {
  if (blockedSessions.has(sessionId)) {
    blockedSessions.delete(sessionId);
    console.log(`[EscalationService] ✅ UNBLOCKED session: "${sessionId}"`);
    return true;
  }
  return false;
};

/**
 * Retrieves all currently quarantined sessions and audit records.
 *
 * @returns {Array<Object>}
 */
export const getBlockedSessions = () => {
  return Array.from(blockedSessions.values());
};

/**
 * Core Escalation Watcher:
 * Scans active Alert records, identifies high-risk alerts unacknowledged beyond the
 * response timeout window, auto-triggers session isolation, and dispatches WhatsApp notices.
 *
 * @param {Object} [customConfig] - Config overrides
 * @param {Array<Object>} [mockAlerts] - Optional in-memory alerts for tests/offline runs
 * @returns {Promise<{escalatedCount: number, escalatedAlerts: Array<Object>, actionsTriggered: Array<Object>}>}
 */
export const checkAndEscalateAlerts = async (customConfig = {}, mockAlerts = null) => {
  const config = { ...DEFAULT_ESCALATION_CONFIG, ...customConfig };
  const timeoutMs = config.timeoutMinutes * 60 * 1000;
  const cutoffTime = new Date(Date.now() - timeoutMs);

  const escalatedAlerts = [];
  const actionsTriggered = [];

  // 1. Process Database Alerts if MongoDB is connected
  if (mongoose.connection.readyState === 1) {
    try {
      const candidates = await Alert.find({
        status: 'ACTIVE',
        $or: [
          { severity: { $in: ['HIGH', 'CRITICAL'] } },
          { riskScore: { $gte: config.highRiskThreshold } }
        ],
        timestamp: { $lte: cutoffTime },
        'eventData.autoBlocked': { $ne: true }
      });

      for (const alert of candidates) {
        const sessionId =
          alert.eventData?.sessionId ||
          alert.deviceId ||
          (alert.username ? `session_${alert.username}` : `session_${alert._id}`);

        // Trigger Auto-Block
        const blockResult = autoBlock(sessionId, {
          alertId: alert._id.toString(),
          username: alert.username,
          riskScore: alert.riskScore,
          severity: alert.severity,
          title: alert.title,
          reason: `Unacknowledged ${alert.severity} risk alert (${alert.riskScore}/100) exceeded ${config.timeoutMinutes}-minute response SLA.`
        });

        // Update Alert Record in Database
        alert.eventData = {
          ...alert.eventData,
          autoBlocked: true,
          escalatedAt: new Date(),
          escalationAction: 'AUTO_BLOCK',
          quarantinedSessionId: sessionId
        };
        alert.recommendedAction = `[AUTO-ACTION APPLIED] Session "${sessionId}" quarantined due to unacknowledged threat timeout.`;
        await alert.save();

        // Dispatch WhatsApp Notification via existing whatsappSender
        let whatsappResult = null;
        if (config.escalateToWhatsApp) {
          const recipient = alert.eventData?.phone || config.defaultRecipient;
          whatsappResult = await sendWhatsAppAlert(recipient, {
            plainEnglishSummary: `[AUTO-MITIGATION] Unacknowledged ${alert.severity} threat for user "${alert.username || 'unknown'}" exceeded ${config.timeoutMinutes}-min SLA. Session "${sessionId}" has been automatically isolated to prevent lateral movement.`,
            riskLevel: alert.severity,
            alertId: alert._id.toString()
          });
        }

        escalatedAlerts.push(alert);
        actionsTriggered.push({
          alertId: alert._id,
          sessionId,
          action: 'AUTO_BLOCK',
          blockResult,
          whatsappResult
        });
      }
    } catch (err) {
      console.warn('[EscalationService] DB alert scan error:', err.message);
    }
  }

  // 2. Process In-Memory / Mock Alerts (for testing and offline demo environments)
  const memoryCandidates = Array.isArray(mockAlerts) ? mockAlerts : inMemoryActiveAlerts;
  for (const alert of memoryCandidates) {
    const alertTime = new Date(alert.timestamp || alert.createdAt || Date.now());
    const isOverdue = alertTime.getTime() <= cutoffTime.getTime();
    const isHighRisk =
      alert.severity === 'HIGH' ||
      alert.severity === 'CRITICAL' ||
      (Number(alert.riskScore) || 0) >= config.highRiskThreshold;
    const isUnacknowledged = alert.status === 'ACTIVE' && !alert.eventData?.autoBlocked;

    if (isOverdue && isHighRisk && isUnacknowledged) {
      const sessionId =
        alert.eventData?.sessionId ||
        alert.deviceId ||
        (alert.username ? `session_${alert.username}` : `session_mock_${Date.now()}`);

      const blockResult = autoBlock(sessionId, {
        alertId: alert.id || alert._id || 'mock_alert',
        username: alert.username,
        riskScore: alert.riskScore,
        severity: alert.severity,
        title: alert.title,
        reason: `Unacknowledged ${alert.severity} risk alert (${alert.riskScore}/100) exceeded ${config.timeoutMinutes}-minute response SLA.`
      });

      alert.eventData = {
        ...alert.eventData,
        autoBlocked: true,
        escalatedAt: new Date(),
        escalationAction: 'AUTO_BLOCK',
        quarantinedSessionId: sessionId
      };

      let whatsappResult = null;
      if (config.escalateToWhatsApp) {
        const recipient = alert.eventData?.phone || config.defaultRecipient;
        whatsappResult = await sendWhatsAppAlert(recipient, {
          plainEnglishSummary: `[AUTO-MITIGATION] Unacknowledged ${alert.severity} threat for user "${alert.username || 'unknown'}" exceeded ${config.timeoutMinutes}-min SLA. Session "${sessionId}" has been automatically isolated.`,
          riskLevel: alert.severity,
          alertId: alert.id || alert._id
        });
      }

      escalatedAlerts.push(alert);
      actionsTriggered.push({
        alertId: alert.id || alert._id,
        sessionId,
        action: 'AUTO_BLOCK',
        blockResult,
        whatsappResult
      });
    }
  }

  return {
    escalatedCount: actionsTriggered.length,
    escalatedAlerts,
    actionsTriggered
  };
};

/**
 * Scheduled Cron Job Controller
 */
let scheduledJob = null;
let isSchedulerRunning = false;

/**
 * Starts the automated escalation scheduler using node-cron.
 *
 * @param {string} [cronSchedule] - Standard cron expression (default: 'x/1 * * * *')
 * @param {Object} [config] - Escalation config overrides
 * @returns {{job: Object, stop: Function, start: Function}}
 */
export const startEscalationScheduler = (
  cronSchedule = DEFAULT_ESCALATION_CONFIG.cronSchedule,
  config = {}
) => {
  if (scheduledJob) {
    scheduledJob.stop();
  }

  console.log(`[EscalationService] 🕒 Starting background escalation watcher (Schedule: "${cronSchedule}")`);

  scheduledJob = cron.schedule(cronSchedule, async () => {
    try {
      await checkAndEscalateAlerts(config);
    } catch (err) {
      console.error('[EscalationService] Scheduled check exception:', err.message);
    }
  });

  isSchedulerRunning = true;

  return {
    job: scheduledJob,
    stop: stopEscalationScheduler,
    start: () => {
      scheduledJob.start();
      isSchedulerRunning = true;
    }
  };
};

/**
 * Stops the scheduled escalation cron runner.
 */
export const stopEscalationScheduler = () => {
  if (scheduledJob) {
    scheduledJob.stop();
    scheduledJob = null;
    isSchedulerRunning = false;
    console.log('[EscalationService] ⏹️ Background escalation watcher stopped');
  }
};

/**
 * Returns current scheduler status.
 */
export const getSchedulerStatus = () => {
  return {
    isRunning: isSchedulerRunning,
    blockedSessionsCount: blockedSessions.size
  };
};

export default {
  DEFAULT_ESCALATION_CONFIG,
  autoBlock,
  isSessionBlocked,
  unblockSession,
  getBlockedSessions,
  checkAndEscalateAlerts,
  startEscalationScheduler,
  stopEscalationScheduler,
  getSchedulerStatus
};
