/**
 * NeuroLock Multi-Signal Anomaly Scoring Engine
 *
 * Deterministic mathematical multi-vector anomaly-scoring engine.
 * Evaluates generic telemetry events across multiple orthogonal threat vectors:
 * 1. Authentication & Burst Velocity (Failed logins, brute force, spray)
 * 2. Network & Outbound Traffic (Data exfiltration, bandwidth spikes)
 * 3. File System & Resource Activity (Mass file access, sensitive credential scraping)
 * 4. User Behavioral Baseline (Empirical active hours, /24 subnet recognition, device trust)
 * 5. Execution Environment (Unusual background processes, headless scripts, rate spikes)
 *
 * STANDARDIZED INTERFACE:
 *   `calculateAnomalyScore(event) => { anomalyScore, factors, confidence }`
 */

import {
  evaluateBaselineDeviation,
  calculateHourAnomaly,
  calculateIpDeviation,
  calculateDeviceDeviation
} from './userBaseline.js';

import { extractOutboundBytes } from './exfilDetector.js';
import { extractFilesAccessedCount } from './fileAccessDetector.js';

/**
 * Feature Normalization and Scoring Configuration
 */
export const SCORER_CONFIG = {
  // Feature weights across all multi-signal dimensions (must sum to 1.00)
  weights: {
    failedLoginCount: 0.18, // Failed login attempts / velocity burst
    loginHour: 0.08, // Off-hours / temporal deviation
    isNewDevice: 0.10, // Unfamiliar client hardware signature
    isNewIp: 0.10, // Unfamiliar network IP / subnet
    baselineDeviation: 0.14, // Rolling per-user behavioral profile deviation
    dataTransferMb: 0.15, // Outbound traffic volume / exfiltration spike
    filesAccessed: 0.12, // Mass file access / sensitive credential traversal
    requestRate: 0.08, // API request velocity / rate limits
    unusualProcessActivity: 0.05 // Suspicious headless / background script execution
  },

  // Normalization thresholds
  thresholds: {
    maxFailedLoginsSaturation: 10, // 10+ failed attempts maps to 1.0
    normalHourRange: { start: 8, end: 19 }, // 08:00 - 19:00 has 0.0 anomaly weight
    transitionHours: [6, 7, 20, 21], // Mild anomaly weight (0.35)
    deepNightHours: [22, 23, 0, 1, 2, 3, 4, 5], // High anomaly weight (0.85 - 1.0)
    dataTransferWarningMb: 50, // Below 50 MB is normal (0.0)
    dataTransferMaxMb: 500, // 500+ MB maps to 1.0
    filesAccessedWarning: 20, // Below 20 files is normal (0.0)
    filesAccessedMax: 200, // 200+ files maps to 1.0
    requestRateWarningRpm: 60, // Normal threshold (requests/min)
    requestRateMaxRpm: 500 // 500+ req/min maps to 1.0
  },

  // Multi-dimensional outlier interaction penalty
  interaction: {
    elevatedFeatureThreshold: 0.35, // Features scoring >= 0.35 count as elevated
    bonusPerElevatedFeature: 12, // Compounding bonus for each extra elevated dimension
    maxInteractionBonus: 35 // Cap for interaction bonus
  }
};

/**
 * Normalizes failed login counts / burst metrics into [0.0, 1.0].
 */
export const normalizeFailedLogins = (count, max = SCORER_CONFIG.thresholds.maxFailedLoginsSaturation) => {
  const num = Math.max(0, Number(count) || 0);
  return Math.min(1.0, num / max);
};

/**
 * Normalizes authentication hour into [0.0, 1.0].
 * Adapts to user empirical history when baseline profile is available.
 */
export const normalizeLoginHour = (hour, thresholds = SCORER_CONFIG.thresholds, baseline = null) => {
  if (typeof hour !== 'number' || isNaN(hour) || hour < 0 || hour > 23) {
    return 0.0;
  }

  // If user has an empirical baseline, use adaptive historical model
  if (baseline && (baseline.hourlyFrequency || baseline.typicalHours || baseline.totalLogins)) {
    return calculateHourAnomaly(hour, baseline);
  }

  // Standard business hours fallback (08:00 to 19:00)
  if (hour >= thresholds.normalHourRange.start && hour <= thresholds.normalHourRange.end) {
    return 0.0;
  }

  // Early morning / Late evening transitions
  if (thresholds.transitionHours.includes(hour)) {
    return 0.35;
  }

  // Deep night off-hours
  if ([1, 2, 3, 4].includes(hour)) {
    return 1.0; // Peak anomaly
  }

  return 0.75;
};

/**
 * Normalizes outbound data transfer volume in megabytes into [0.0, 1.0].
 */
export const normalizeDataTransfer = (mb, thresholds = SCORER_CONFIG.thresholds) => {
  const num = Math.max(0, Number(mb) || 0);
  if (num <= thresholds.dataTransferWarningMb) return 0.0;
  const span = thresholds.dataTransferMaxMb - thresholds.dataTransferWarningMb;
  return Math.min(1.0, (num - thresholds.dataTransferWarningMb) / span);
};

/**
 * Normalizes accessed files count and sensitive file indicators into [0.0, 1.0].
 */
export const normalizeFilesAccessed = (count, thresholds = SCORER_CONFIG.thresholds, isSensitive = false) => {
  if (isSensitive) return 1.0;
  const num = Math.max(0, Number(count) || 0);
  if (num <= thresholds.filesAccessedWarning) return 0.0;
  const span = thresholds.filesAccessedMax - thresholds.filesAccessedWarning;
  return Math.min(1.0, (num - thresholds.filesAccessedWarning) / span);
};

/**
 * Normalizes request rate (requests per minute) into [0.0, 1.0].
 */
export const normalizeRequestRate = (rpm, thresholds = SCORER_CONFIG.thresholds) => {
  const num = Math.max(0, Number(rpm) || 0);
  if (num <= thresholds.requestRateWarningRpm) return 0.0;
  const span = thresholds.requestRateMaxRpm - thresholds.requestRateWarningRpm;
  return Math.min(1.0, (num - thresholds.requestRateWarningRpm) / span);
};

/**
 * Extracts hour value from generic event objects.
 */
const extractHour = (event) => {
  if (typeof event.loginHour === 'number') return event.loginHour;
  if (typeof event.hour === 'number') return event.hour;
  if (typeof event.eventData?.hour === 'number') return event.eventData.hour;

  if (event.timestamp) {
    const d = new Date(event.timestamp);
    if (!isNaN(d.getTime())) {
      const offset = typeof event.timezoneOffsetHours === 'number' ? event.timezoneOffsetHours : 0;
      return (d.getUTCHours() + offset + 24) % 24;
    }
  }

  return null;
};

/**
 * Detects whether event touches sensitive credential or configuration files.
 */
const checkSensitiveFilesPresence = (event) => {
  if (event.hasSensitiveFileAccess === true || event.eventData?.hasSensitiveFileAccess === true) {
    return true;
  }

  const sensitiveKeywords = ['.env', 'id_rsa', 'id_ed25519', '.pem', '.key', 'credentials.json', 'secrets.yaml', '/etc/shadow', '/etc/passwd'];
  const pathsToCheck = [];

  if (typeof event.filePath === 'string') pathsToCheck.push(event.filePath);
  if (typeof event.targetFile === 'string') pathsToCheck.push(event.targetFile);
  if (Array.isArray(event.accessedFiles)) pathsToCheck.push(...event.accessedFiles);
  if (Array.isArray(event.files)) pathsToCheck.push(...event.files);
  if (Array.isArray(event.eventData?.accessedFiles)) pathsToCheck.push(...event.eventData.accessedFiles);

  return pathsToCheck.some((p) => typeof p === 'string' && sensitiveKeywords.some((kw) => p.toLowerCase().includes(kw)));
};

/**
 * Calculates multi-signal anomaly score across normalized security telemetry features.
 * Accepts generic event objects (logins, file accesses, outbound data transfers, API velocity spikes).
 *
 * @param {Object} event - Generic security event object
 * @param {Object} [customConfig] - Optional config overrides for weights and thresholds
 * @returns {{anomalyScore: number, factors: Array<string>, confidence: number}}
 */
export const calculateAnomalyScore = (event = {}, customConfig = {}) => {
  const config = { ...SCORER_CONFIG, ...customConfig };
  const weights = config.weights;

  const factors = [];
  let evaluatedFeatureCount = 0;
  const totalSupportedFeatures = Object.keys(weights).length;

  // 1. Evaluate rolling per-user baseline profile
  const baseline = event.userBaseline || {};
  const baselineAnalysis = evaluateBaselineDeviation(event, baseline);

  // 2. Extract telemetry signals across diverse generic event types
  const rawFailedLogins = Math.max(
    0,
    Number(
      event.failedLoginCount ??
      event.failedAttempts ??
      event.attempts ??
      event.eventData?.attempts ??
      0
    )
  );

  const rawHour = extractHour(event);

  // Device familiarity signal
  let normNewDevice = 0.0;
  if (event.deviceId && baseline && (baseline.knownDevices?.length > 0 || baseline.deviceProfiles?.length > 0)) {
    normNewDevice = calculateDeviceDeviation(event.deviceId, baseline).deviation;
  } else if (event.isNewDevice !== undefined || event.eventData?.isNewDevice !== undefined) {
    normNewDevice = Boolean(event.isNewDevice ?? event.eventData?.isNewDevice) ? 1.0 : 0.0;
  }

  // Network IP / Subnet familiarity signal
  let normNewIp = 0.0;
  const ipAddress = event.ipAddress || event.sourceIp || event.eventData?.ipAddress;
  if (ipAddress && baseline && (baseline.knownIps?.length > 0 || baseline.ipProfiles?.length > 0 || baseline.ipSubnets?.length > 0)) {
    normNewIp = calculateIpDeviation(ipAddress, baseline).deviation;
  } else if (event.isNewIp !== undefined || event.eventData?.isNewIp !== undefined) {
    normNewIp = Boolean(event.isNewIp ?? event.eventData?.isNewIp) ? 1.0 : 0.0;
  }

  // Outbound data volume signal
  const outboundBytes = extractOutboundBytes(event);
  const rawDataTransferMb = outboundBytes / (1024 * 1024);

  // File access and sensitive credential traversal signal
  const rawFilesAccessed = extractFilesAccessedCount(event);
  const hasSensitiveFiles = checkSensitiveFilesPresence(event);

  // Velocity and process execution signals
  const rawRequestRate = Math.max(0, Number(event.requestRate ?? event.rpm ?? event.eventData?.requestRate ?? 0));
  const rawUnusualProcess = Boolean(
    event.unusualProcessActivity ??
    event.isHeadless ??
    event.eventData?.unusualProcessActivity ??
    false
  );

  // 3. Compute normalized feature vectors [0.0 to 1.0]
  const normFailedLogins = normalizeFailedLogins(rawFailedLogins, config.thresholds.maxFailedLoginsSaturation);
  const normHour = rawHour !== null ? normalizeLoginHour(rawHour, config.thresholds, baseline) : 0.0;
  const normBaselineDeviation = baselineAnalysis.normDeviation;
  const normDataTransfer = normalizeDataTransfer(rawDataTransferMb, config.thresholds);
  const normFilesAccessed = normalizeFilesAccessed(rawFilesAccessed, config.thresholds, hasSensitiveFiles);
  const normRequestRate = normalizeRequestRate(rawRequestRate, config.thresholds);
  const normUnusualProcess = rawUnusualProcess ? 1.0 : 0.0;

  // Track populated features for confidence estimation
  if (event.failedLoginCount !== undefined || event.failedAttempts !== undefined || event.attempts !== undefined) evaluatedFeatureCount++;
  if (rawHour !== null) evaluatedFeatureCount++;
  if (event.isNewDevice !== undefined || event.deviceId !== undefined) evaluatedFeatureCount++;
  if (event.isNewIp !== undefined || event.ipAddress !== undefined) evaluatedFeatureCount++;
  if (event.userBaseline !== undefined) evaluatedFeatureCount++;
  if (outboundBytes > 0 || event.dataTransferMb !== undefined || event.outboundBytes !== undefined) evaluatedFeatureCount++;
  if (rawFilesAccessed > 0 || hasSensitiveFiles || event.filesAccessed !== undefined) evaluatedFeatureCount++;
  if (rawRequestRate > 0 || event.requestRate !== undefined) evaluatedFeatureCount++;
  if (event.unusualProcessActivity !== undefined || event.isHeadless !== undefined) evaluatedFeatureCount++;

  // 4. Calculate linear weighted sum across all signal vectors
  const featureScores = [
    {
      name: 'failedLoginCount',
      norm: normFailedLogins,
      weight: weights.failedLoginCount,
      desc: `Failed login attempts: ${rawFailedLogins}`
    },
    {
      name: 'loginHour',
      norm: normHour,
      weight: weights.loginHour,
      desc: `Off-hours authentication (hour: ${rawHour ?? 'N/A'}:00)`
    },
    {
      name: 'isNewDevice',
      norm: normNewDevice,
      weight: weights.isNewDevice,
      desc: 'Unfamiliar client device signature'
    },
    {
      name: 'isNewIp',
      norm: normNewIp,
      weight: weights.isNewIp,
      desc: normNewIp === 0.25 ? 'IP in known subnet (/24)' : 'Unfamiliar network IP address'
    },
    {
      name: 'baselineDeviation',
      norm: normBaselineDeviation,
      weight: weights.baselineDeviation,
      desc: 'Rolling behavioral profile deviation (unusual combination of hour, subnet, and device)'
    },
    {
      name: 'dataTransferMb',
      norm: normDataTransfer,
      weight: weights.dataTransferMb,
      desc: `Anomalous outbound transfer volume (${rawDataTransferMb.toFixed(1)} MB)`
    },
    {
      name: 'filesAccessed',
      norm: normFilesAccessed,
      weight: weights.filesAccessed,
      desc: hasSensitiveFiles
        ? 'Sensitive credential / secret configuration file accessed'
        : `Abnormal file access frequency (${rawFilesAccessed} files)`
    },
    {
      name: 'requestRate',
      norm: normRequestRate,
      weight: weights.requestRate,
      desc: `High API request velocity (${rawRequestRate} req/min)`
    },
    {
      name: 'unusualProcessActivity',
      norm: normUnusualProcess,
      weight: weights.unusualProcessActivity,
      desc: 'Suspicious background execution or headless script activity'
    }
  ];

  let weightedBaseSum = 0;
  let elevatedCount = 0;

  for (const item of featureScores) {
    const contribution = item.norm * item.weight;
    weightedBaseSum += contribution;

    if (item.norm >= config.interaction.elevatedFeatureThreshold) {
      elevatedCount++;
      factors.push(`${item.desc} (metric: ${(item.norm * 100).toFixed(0)}%)`);
    }
  }

  // 5. Multi-Dimensional Non-Linear Interaction Penalty
  let interactionBonus = 0;
  if (elevatedCount >= 2) {
    interactionBonus = Math.min(
      config.interaction.maxInteractionBonus,
      (elevatedCount - 1) * config.interaction.bonusPerElevatedFeature
    );
    factors.push(
      `Multi-dimensional correlation: ${elevatedCount} elevated anomaly vectors detected (+${interactionBonus} interaction penalty)`
    );
  }

  // 6. Final Composite Anomaly Score (Scale: 0 to 100)
  const rawFinalScore = (weightedBaseSum * 100) + interactionBonus;
  const boundedAnomalyScore = Math.min(100, Math.max(0, Math.round(rawFinalScore)));

  // 7. Confidence Score based on telemetry feature completeness
  const confidence = Math.min(1.0, Math.max(0.5, Number((evaluatedFeatureCount / totalSupportedFeatures).toFixed(2))));

  return {
    anomalyScore: boundedAnomalyScore,
    factors: factors.length > 0 ? factors : ['All observed telemetry features within normal baseline distribution'],
    confidence
  };
};

export default {
  SCORER_CONFIG,
  calculateAnomalyScore,
  normalizeFailedLogins,
  normalizeLoginHour,
  normalizeDataTransfer,
  normalizeFilesAccessed,
  normalizeRequestRate
};
