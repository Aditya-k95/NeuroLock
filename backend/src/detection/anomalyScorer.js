/**
 * NeuroLock Prototype Anomaly Scoring Engine
 *
 * NOTE FOR ARCHITECTURAL TRANSPARENCY:
 * This module is a deterministic mathematical anomaly-scoring layer for the hackathon prototype.
 * It simulates the scoring behavior, normalization, and feature weighting of an ML anomaly model
 * (e.g., Isolation Forest, One-Class SVM, or Autoencoder) without external Python/FastAPI dependencies.
 *
 * DROP-IN ML REPLACEMENT:
 * This component exposes a standardized interface:
 *   `calculateAnomalyScore(event) => { anomalyScore, factors, confidence }`
 * To upgrade to a production ML model, replace the internal scoring logic with an ONNX runtime,
 * TensorFlow.js model, or an API call to a trained scikit-learn microservice without altering
 * any upstream ingestion, alerting, or database pipelines.
 */

/**
 * Feature Normalization and Scoring Configuration
 */
export const SCORER_CONFIG = {
  // Feature weights (must sum to 1.00)
  weights: {
    failedLoginCount: 0.22,
    loginHour: 0.10,
    isNewDevice: 0.15,
    isNewIp: 0.12,
    dataTransferMb: 0.15,
    filesAccessed: 0.10,
    requestRate: 0.08,
    unusualProcessActivity: 0.08
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
 * Normalizes the failed login count into a [0.0, 1.0] scale.
 * Uses a linear saturation curve up to maxFailedLoginsSaturation.
 */
export const normalizeFailedLogins = (count, max = SCORER_CONFIG.thresholds.maxFailedLoginsSaturation) => {
  const num = Math.max(0, Number(count) || 0);
  return Math.min(1.0, num / max);
};

/**
 * Normalizes the authentication hour into a [0.0, 1.0] anomaly metric.
 * Deep night (01:00 - 04:00) scores highest, while standard business hours score 0.0.
 */
export const normalizeLoginHour = (hour, thresholds = SCORER_CONFIG.thresholds) => {
  if (typeof hour !== 'number' || isNaN(hour) || hour < 0 || hour > 23) {
    return 0.0;
  }

  // 08:00 to 19:00: Standard business hours
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
 * Normalizes data transfer volume in megabytes into [0.0, 1.0].
 */
export const normalizeDataTransfer = (mb, thresholds = SCORER_CONFIG.thresholds) => {
  const num = Math.max(0, Number(mb) || 0);
  if (num <= thresholds.dataTransferWarningMb) return 0.0;
  const span = thresholds.dataTransferMaxMb - thresholds.dataTransferWarningMb;
  return Math.min(1.0, (num - thresholds.dataTransferWarningMb) / span);
};

/**
 * Normalizes accessed files count into [0.0, 1.0].
 */
export const normalizeFilesAccessed = (count, thresholds = SCORER_CONFIG.thresholds) => {
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
 * Extracts and normalizes an hour value from an event object.
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
 * Calculates the deterministic anomaly score across normalized security features.
 *
 * @param {Object} event - Normalized security event containing numerical/boolean telemetry features:
 *   - failedLoginCount: number
 *   - loginHour: number (0-23)
 *   - isNewDevice: boolean
 *   - isNewIp: boolean
 *   - dataTransferMb: number (MB)
 *   - filesAccessed: number
 *   - requestRate: number (RPM)
 *   - unusualProcessActivity: boolean
 * @param {Object} [customConfig] - Optional override for weights and thresholds
 * @returns {{anomalyScore: number, factors: Array<string>, confidence: number}}
 */
export const calculateAnomalyScore = (event = {}, customConfig = {}) => {
  const config = { ...SCORER_CONFIG, ...customConfig };
  const weights = config.weights;

  const factors = [];
  let evaluatedFeatureCount = 0;
  const totalSupportedFeatures = Object.keys(weights).length;

  // 1. Extract feature values with fallback resolution from event or eventData
  const rawFailedLogins = event.failedLoginCount ?? event.failedAttempts ?? event.eventData?.attempts ?? 0;
  const rawHour = extractHour(event);
  const rawIsNewDevice = Boolean(
    event.isNewDevice ??
    event.eventData?.isNewDevice ??
    (event.deviceId && event.userBaseline?.knownDevices && !event.userBaseline.knownDevices.includes(event.deviceId))
  );
  const rawIsNewIp = Boolean(
    event.isNewIp ??
    event.eventData?.isNewIp ??
    (event.ipAddress && event.userBaseline?.knownIps && !event.userBaseline.knownIps.includes(event.ipAddress))
  );
  const rawDataTransferMb = event.dataTransferMb ?? (event.outboundBytes ? event.outboundBytes / (1024 * 1024) : 0);
  const rawFilesAccessed = event.filesAccessed ?? event.eventData?.filesAccessed ?? 0;
  const rawRequestRate = event.requestRate ?? event.eventData?.requestRate ?? 0;
  const rawUnusualProcess = Boolean(event.unusualProcessActivity ?? event.eventData?.unusualProcessActivity ?? false);

  // 2. Compute normalized feature vectors [0.0 to 1.0]
  const normFailedLogins = normalizeFailedLogins(rawFailedLogins, config.thresholds.maxFailedLoginsSaturation);
  const normHour = rawHour !== null ? normalizeLoginHour(rawHour, config.thresholds) : 0.0;
  const normNewDevice = rawIsNewDevice ? 1.0 : 0.0;
  const normNewIp = rawIsNewIp ? 1.0 : 0.0;
  const normDataTransfer = normalizeDataTransfer(rawDataTransferMb, config.thresholds);
  const normFilesAccessed = normalizeFilesAccessed(rawFilesAccessed, config.thresholds);
  const normRequestRate = normalizeRequestRate(rawRequestRate, config.thresholds);
  const normUnusualProcess = rawUnusualProcess ? 1.0 : 0.0;

  // Track populated features for confidence estimation
  if (event.failedLoginCount !== undefined || event.failedAttempts !== undefined) evaluatedFeatureCount++;
  if (rawHour !== null) evaluatedFeatureCount++;
  if (event.isNewDevice !== undefined || event.deviceId !== undefined) evaluatedFeatureCount++;
  if (event.isNewIp !== undefined || event.ipAddress !== undefined) evaluatedFeatureCount++;
  if (event.dataTransferMb !== undefined || event.outboundBytes !== undefined) evaluatedFeatureCount++;
  if (event.filesAccessed !== undefined) evaluatedFeatureCount++;
  if (event.requestRate !== undefined) evaluatedFeatureCount++;
  if (event.unusualProcessActivity !== undefined) evaluatedFeatureCount++;

  // 3. Calculate linear weighted sum
  const featureScores = [
    { name: 'failedLoginCount', norm: normFailedLogins, weight: weights.failedLoginCount, desc: `Failed login attempts: ${rawFailedLogins}` },
    { name: 'loginHour', norm: normHour, weight: weights.loginHour, desc: `Off-hours authentication (hour: ${rawHour ?? 'N/A'}:00)` },
    { name: 'isNewDevice', norm: normNewDevice, weight: weights.isNewDevice, desc: 'Unfamiliar client device signature' },
    { name: 'isNewIp', norm: normNewIp, weight: weights.isNewIp, desc: 'Unfamiliar network IP address' },
    { name: 'dataTransferMb', norm: normDataTransfer, weight: weights.dataTransferMb, desc: `Anomalous outbound transfer volume (${rawDataTransferMb.toFixed(1)} MB)` },
    { name: 'filesAccessed', norm: normFilesAccessed, weight: weights.filesAccessed, desc: `Abnormal file access frequency (${rawFilesAccessed} files)` },
    { name: 'requestRate', norm: normRequestRate, weight: weights.requestRate, desc: `High API request velocity (${rawRequestRate} req/min)` },
    { name: 'unusualProcessActivity', norm: normUnusualProcess, weight: weights.unusualProcessActivity, desc: 'Suspicious background execution or headless script activity' }
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

  // 4. Multi-Dimensional Non-Linear Interaction Penalty
  // Elevates score when multiple anomalous vectors occur together in hyperspace
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

  // 5. Final Composite Anomaly Score (Scale: 0 to 100)
  const rawFinalScore = (weightedBaseSum * 100) + interactionBonus;
  const boundedAnomalyScore = Math.min(100, Math.max(0, Math.round(rawFinalScore)));

  // 6. Confidence Score based on telemetry feature completeness
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
