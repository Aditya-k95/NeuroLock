/**
 * NeuroLock Deterministic Security Rule Engine
 *
 * Core Heuristic Threat Analysis Module.
 * Evaluates normalized security events against deterministic threshold rules
 * without requiring ML models or LLMs.
 */

/**
 * Default Configurable Rule Thresholds and Weights
 * Centralized configuration to eliminate hard-coded magic numbers.
 */
export const DEFAULT_RULE_CONFIG = {
  // 1. Brute-Force Login Thresholds
  bruteForce: {
    maxAllowedFailedAttempts: 4, // 5 or more failed attempts triggers the rule
    timeWindowSeconds: 60, // Evaluation window in seconds
    baseScore: 40, // Base risk score contribution
    criticalAttemptsThreshold: 10, // Escalates risk score if 10+ failed attempts occur
    criticalScore: 60
  },

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
  abnormalDataTransfer: {
    warningThresholdBytes: 100 * 1024 * 1024, // 100 MB
    criticalThresholdBytes: 500 * 1024 * 1024, // 500 MB
    warningScore: 30,
    criticalScore: 50
  },

  // 6. Compound Correlation / Multiple Indicators
  compoundCorrelation: {
    thresholdCount: 2, // Compounding bonus applies if >= 2 distinct rules fire
    escalationBonusPerRule: 15, // Compounding penalty per extra triggered rule
    threePlusRulesMinScore: 65 // Minimum score guarantee if 3 or more rules fire together
  },

  // Global classification threshold
  suspiciousScoreThreshold: 30 // Any composite score >= 30 is classified as suspicious
};

/**
 * Rule 1: Brute-Force Login Detection
 * Why this rule exists:
 * Automated credential-stuffing and dictionary attacks produce rapid bursts of
 * failed login attempts. Legitimate users rarely fail >= 5 times within 60 seconds.
 */
export const checkBruteForce = (event, config = DEFAULT_RULE_CONFIG.bruteForce) => {
  const attempts = event.failedAttempts || event.eventData?.attempts || 0;
  const windowSec = event.timeWindowSeconds || event.eventData?.timeWindowSeconds || config.timeWindowSeconds;

  if (attempts > config.maxAllowedFailedAttempts && windowSec <= config.timeWindowSeconds) {
    const isCritical = attempts >= config.criticalAttemptsThreshold;
    const score = isCritical ? config.criticalScore : config.baseScore;

    return {
      triggered: true,
      ruleId: 'BRUTE_FORCE_ATTACK',
      score,
      reason: `Detected ${attempts} failed login attempts within ${windowSec} seconds (threshold: ${config.maxAllowedFailedAttempts + 1} attempts).`
    };
  }

  return { triggered: false, score: 0 };
};

/**
 * Rule 2: Suspicious Login Time Detection
 * Why this rule exists:
 * MSME employees and business stakeholders typically authenticate during active business hours.
 * Off-hour logins (e.g. 2:00 AM - 5:00 AM) indicate higher risk of automated intrusion or compromised credentials.
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
      // Use UTC hours by default to ensure deterministic behavior across timezones, with optional timezoneOffsetHours support
      const offset = typeof event.timezoneOffsetHours === 'number' ? event.timezoneOffsetHours : 0;
      eventHour = (dateObj.getUTCHours() + offset + 24) % 24;
    }
  }

  if (typeof eventHour === 'number') {
    const startHour = event.userBaseline?.usualHours?.start ?? config.usualStartHour;
    const endHour = event.userBaseline?.usualHours?.end ?? config.usualEndHour;

    // Checks if login hour is outside allowed daytime/business window
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
 * Why this rule exists:
 * Attackers usually connect through external proxy networks, VPNs, or foreign ASN subnets
 * that deviate from the user's established IP baseline.
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
 * Why this rule exists:
 * Browser, OS, and client device fingerprints remain consistent for genuine users.
 * An unfamiliar device fingerprint points to potential session hijacking or stolen tokens.
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
 * Rule 5: Abnormal Data Transfer Volume Detection
 * Why this rule exists:
 * Unauthorized data exfiltration or massive database dumps generate anomalous outbound
 * byte volume that far exceeds regular API transactional usage.
 */
export const checkAbnormalDataTransfer = (event, config = DEFAULT_RULE_CONFIG.abnormalDataTransfer) => {
  let bytes = 0;
  if (typeof event.outboundBytes === 'number') {
    bytes = event.outboundBytes;
  } else if (typeof event.dataTransferMb === 'number') {
    bytes = event.dataTransferMb * 1024 * 1024;
  } else if (typeof event.bytesTransferred === 'number') {
    bytes = event.bytesTransferred;
  } else if (typeof event.eventData?.outboundBytes === 'number') {
    bytes = event.eventData.outboundBytes;
  } else if (typeof event.eventData?.dataTransferMb === 'number') {
    bytes = event.eventData.dataTransferMb * 1024 * 1024;
  }

  if (bytes >= config.criticalThresholdBytes) {
    const mb = (bytes / (1024 * 1024)).toFixed(1);
    return {
      triggered: true,
      ruleId: 'ABNORMAL_DATA_TRANSFER',
      score: config.criticalScore,
      reason: `Critical data transfer volume detected: ${mb} MB outbound (threshold: ${(config.criticalThresholdBytes / (1024 * 1024)).toFixed(0)} MB).`
    };
  }

  if (bytes >= config.warningThresholdBytes) {
    const mb = (bytes / (1024 * 1024)).toFixed(1);
    return {
      triggered: true,
      ruleId: 'ABNORMAL_DATA_TRANSFER',
      score: config.warningScore,
      reason: `Elevated data transfer volume detected: ${mb} MB outbound (threshold: ${(config.warningThresholdBytes / (1024 * 1024)).toFixed(0)} MB).`
    };
  }

  return { triggered: false, score: 0 };
};

/**
 * Rule 6: Ransomware-Like Behavioral Indicators
 * Why this rule exists:
 * Rapid mass file modifications, renaming to locked extensions, and entropy spikes
 * indicate automated endpoint ransomware operations.
 */
export const checkRansomwareBehavior = (event) => {
  const filesMod = Number(event.filesModified ?? event.eventData?.filesModified ?? 0);
  const filesRenamed = Number(event.filesRenamed ?? event.eventData?.filesRenamed ?? 0);
  const encryptionLike = Boolean(event.encryptionLikeActivity ?? event.eventData?.encryptionLikeActivity ?? false);
  const vssDeletion = Boolean(event.eventData?.volumeShadowCopyDeletionAttempted ?? false);

  if (encryptionLike || filesMod >= 100 || filesRenamed >= 100 || vssDeletion) {
    const isSevere = filesMod >= 500 || vssDeletion;
    return {
      triggered: true,
      ruleId: 'RANSOMWARE_BEHAVIOR_SPIKE',
      score: isSevere ? 65 : 45,
      reason: `Ransomware behavioral heuristics triggered: ${filesMod} files modified, ${filesRenamed} files renamed, encryption pattern detected.`
    };
  }

  return { triggered: false, score: 0 };
};

/**
 * Main Evaluation Engine
 * Analyzes a normalized security event across all deterministic rules.
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

  // 1. Evaluate individual heuristic rules
  const ruleCheckers = [
    () => checkBruteForce(event, config.bruteForce),
    () => checkSuspiciousTime(event, config.suspiciousTime),
    () => checkUnrecognizedIp(event, config.unrecognizedIp),
    () => checkUnrecognizedDevice(event, config.unrecognizedDevice),
    () => checkAbnormalDataTransfer(event, config.abnormalDataTransfer),
    () => checkRansomwareBehavior(event)
  ];

  for (const checker of ruleCheckers) {
    const result = checker();
    if (result.triggered) {
      triggeredRules.push(result.ruleId);
      reasons.push(result.reason);
      baseScoreSum += result.score;
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
  checkSuspiciousTime,
  checkUnrecognizedIp,
  checkUnrecognizedDevice,
  checkAbnormalDataTransfer
};
