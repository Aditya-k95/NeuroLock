/**
 * NeuroLock Deterministic Security Rule Engine
 *
 * Core Heuristic Threat Analysis Module.
 * Evaluates normalized security events across modular rule detectors:
 * - Brute-Force & Credential Spraying (`bruteForceDetector.js`)
 * - Data Exfiltration & Outbound Spikes (`exfilDetector.js`)
 * - Mass File Access & Sensitive File Traversal (`fileAccessDetector.js`)
 * - Off-Hours & Identity / Device Anomaly Checks
 */

import {
  checkBruteForce,
  checkPasswordSpray,
  DEFAULT_BRUTE_FORCE_CONFIG
} from './bruteForceDetector.js';

import {
  checkDataExfiltration,
  checkTrafficSpike,
  DEFAULT_EXFIL_CONFIG
} from './exfilDetector.js';

import {
  checkUnusualFileAccess,
  checkSensitiveFileAccess,
  DEFAULT_FILE_ACCESS_CONFIG
} from './fileAccessDetector.js';

/**
 * Default Configurable Rule Thresholds and Weights
 */
export const DEFAULT_RULE_CONFIG = {
  // 1. Brute-Force Login Thresholds
  bruteForce: DEFAULT_BRUTE_FORCE_CONFIG,

  // 2. Suspicious Login Time Thresholds (24-hour clock)
  suspiciousTime: {
    usualStartHour: 6, // 06:00 AM
    usualEndHour: 22, // 10:00 PM (22:00)
    baseScore: 15 // Low-to-moderate penalty for off-hour access alone
  },

  // 3. New / Unrecognized IP
  unrecognizedIp: {
    baseScore: 15 // Low-to-moderate penalty for unknown IP alone
  },

  // 4. New / Unrecognized Device
  unrecognizedDevice: {
    baseScore: 20 // Moderate penalty for unrecognized device fingerprint
  },

  // 5. Abnormal Data Transfer (Exfiltration / Spikes)
  abnormalDataTransfer: DEFAULT_EXFIL_CONFIG,

  // 6. File Access Anomalies
  fileAccess: DEFAULT_FILE_ACCESS_CONFIG,

  // 7. Compound Correlation / Multiple Indicators
  compoundCorrelation: {
    thresholdCount: 2, // Compounding bonus applies if >= 2 distinct rules fire
    escalationBonusPerRule: 15, // Compounding penalty per extra triggered rule
    threePlusRulesMinScore: 65 // Minimum score guarantee if 3 or more rules fire together
  },

  // Global classification threshold
  suspiciousScoreThreshold: 30 // Any composite score >= 30 is classified as suspicious
};

/**
 * Rule 2: Suspicious Login Time Detection
 */
export const checkSuspiciousTime = (event, config = DEFAULT_RULE_CONFIG.suspiciousTime) => {
  let eventHour;

  if (typeof event.hour === 'number') {
    eventHour = event.hour;
  } else if (typeof event.eventData?.hour === 'number') {
    eventHour = event.eventData.hour;
  } else if (event.timestamp) {
    const dateObj = new Date(event.timestamp);
    if (!isNaN(dateObj.getTime())) {
      const offset = typeof event.timezoneOffsetHours === 'number' ? event.timezoneOffsetHours : 0;
      eventHour = (dateObj.getUTCHours() + offset + 24) % 24;
    }
  }

  if (typeof eventHour === 'number') {
    const startHour = event.userBaseline?.usualHours?.start ?? config.usualStartHour;
    const endHour = event.userBaseline?.usualHours?.end ?? config.usualEndHour;

    if (eventHour < startHour || eventHour >= endHour) {
      const formattedHour = `${String(eventHour).padStart(2, '0')}:00`;
      return {
        triggered: true,
        ruleId: 'SUSPICIOUS_LOGIN_TIME',
        score: config.baseScore,
        reason: `Authentication occurred at ${formattedHour}, outside the standard operating window (${startHour}:00 - ${endHour}:00).`
      };
    }
  }

  return { triggered: false, score: 0 };
};

/**
 * Rule 3: Unrecognized IP Address Detection
 */
export const checkUnrecognizedIp = (event, config = DEFAULT_RULE_CONFIG.unrecognizedIp) => {
  const ipAddress = event.ipAddress || event.sourceIp || event.eventData?.ipAddress;
  const knownIps = event.userBaseline?.knownIps || event.userBaseline?.usualIps;

  if (ipAddress && Array.isArray(knownIps) && knownIps.length > 0) {
    if (!knownIps.includes(ipAddress)) {
      return {
        triggered: true,
        ruleId: 'UNRECOGNIZED_IP',
        score: config.baseScore,
        reason: `Access attempt from unfamiliar IP address (${ipAddress}). Not in user's known IP baseline.`
      };
    }
  }

  return { triggered: false, score: 0 };
};

/**
 * Rule 4: Unrecognized Device Detection
 */
export const checkUnrecognizedDevice = (event, config = DEFAULT_RULE_CONFIG.unrecognizedDevice) => {
  const deviceId = event.deviceId || event.eventData?.deviceId;
  const knownDevices = event.userBaseline?.knownDevices || event.userBaseline?.usualDevices;

  if (deviceId && Array.isArray(knownDevices) && knownDevices.length > 0) {
    if (!knownDevices.includes(deviceId)) {
      return {
        triggered: true,
        ruleId: 'UNRECOGNIZED_DEVICE',
        score: config.baseScore,
        reason: `Login from unrecognized device fingerprint (${deviceId}). Expected one of user's registered devices.`
      };
    }
  }

  return { triggered: false, score: 0 };
};

/**
 * Alias for backward compatibility with exfilDetector
 */
export const checkAbnormalDataTransfer = checkDataExfiltration;

/**
 * Main Evaluation Engine
 * Analyzes a normalized security event across all deterministic modular rules.
 *
 * @param {Object} event - Normalized security event payload
 * @param {Object} [customConfig] - Optional override of default rule configurations
 * @returns {{suspicious: boolean, ruleScore: number, triggeredRules: Array<string>, reasons: Array<string>}}
 */
export const evaluateRules = (event = {}, customConfig = {}) => {
  const config = { ...DEFAULT_RULE_CONFIG, ...customConfig };

  const triggeredRules = [];
  const reasons = [];
  let baseScoreSum = 0;

  // 1. Evaluate modular heuristic rules across telemetry dimensions
  const ruleCheckers = [
    () => checkBruteForce(event, config.bruteForce),
    () => checkPasswordSpray(event, config.bruteForce),
    () => checkSuspiciousTime(event, config.suspiciousTime),
    () => checkUnrecognizedIp(event, config.unrecognizedIp),
    () => checkUnrecognizedDevice(event, config.unrecognizedDevice),
    () => checkDataExfiltration(event, config.abnormalDataTransfer),
    () => checkTrafficSpike(event, config.abnormalDataTransfer),
    () => checkUnusualFileAccess(event, config.fileAccess),
    () => checkSensitiveFileAccess(event, config.fileAccess)
  ];

  for (const checker of ruleCheckers) {
    const result = checker();
    if (result.triggered) {
      if (!triggeredRules.includes(result.ruleId)) {
        triggeredRules.push(result.ruleId);
        reasons.push(result.reason);
        baseScoreSum += result.score;
      }
    }
  }

  // 2. Compound Multiplier: Escalate risk when multiple indicators occur together
  const triggeredCount = triggeredRules.length;
  let finalScore = baseScoreSum;

  if (triggeredCount >= config.compoundCorrelation.thresholdCount) {
    const extraRules = triggeredCount - 1;
    const compoundBonus = extraRules * config.compoundCorrelation.escalationBonusPerRule;
    finalScore += compoundBonus;

    // Enforce minimum floor if 3 or more rules fire simultaneously
    if (triggeredCount >= 3 && finalScore < config.compoundCorrelation.threePlusRulesMinScore) {
      finalScore = config.compoundCorrelation.threePlusRulesMinScore;
    }

    triggeredRules.push('MULTIPLE_SUSPICIOUS_INDICATORS');
    reasons.push(
      `Compounded threat: ${triggeredCount} distinct security indicators triggered concurrently (+${compoundBonus} risk escalation).`
    );
  }

  // 3. Normalize score strictly between 0 and 100
  const normalizedScore = Math.min(100, Math.max(0, Math.round(finalScore)));
  const isSuspicious = normalizedScore >= config.suspiciousScoreThreshold;

  return {
    suspicious: isSuspicious,
    ruleScore: normalizedScore,
    triggeredRules,
    reasons
  };
};

export default {
  DEFAULT_RULE_CONFIG,
  evaluateRules,
  checkBruteForce,
  checkPasswordSpray,
  checkSuspiciousTime,
  checkUnrecognizedIp,
  checkUnrecognizedDevice,
  checkAbnormalDataTransfer,
  checkDataExfiltration,
  checkTrafficSpike,
  checkUnusualFileAccess,
  checkSensitiveFileAccess
};
