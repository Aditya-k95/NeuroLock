/**
 * NeuroLock Unified Detection Pipeline
 *
 * Coordinates the full deterministic security analysis pipeline:
 * 1. Telemetry Ingestion & Feature Normalization
 * 2. Deterministic Rule Heuristics (`ruleEngine.js`)
 * 3. Statistical Multi-Vector Anomaly Scoring (`anomalyScorer.js`)
 * 4. Multi-Layer Threat Correlation & Severity Fusion (`riskEngine.js`)
 *
 * ARCHITECTURAL BOUNDARY:
 * This module is a pure, decoupled detection service.
 * It does NOT directly interact with MongoDB, send WhatsApp alerts, or call LLMs.
 * It is reusable across REST controllers, WebSocket ingestors, attack simulators,
 * and automated test suites.
 */

import { evaluateRules } from './ruleEngine.js';
import { calculateAnomalyScore } from './anomalyScorer.js';
import { calculateRisk } from './riskEngine.js';

/**
 * Validates and normalizes raw telemetry payloads into a standardized schema.
 * Handles missing fields, field aliases, type coercions, and baseline defaults.
 *
 * @param {Object} rawEvent - Raw input event from API, simulator, or network collector
 * @returns {Object} Normalized event ready for detection engines
 */
export const normalizeSecurityEvent = (rawEvent = {}) => {
  const timestamp = rawEvent.timestamp
    ? new Date(rawEvent.timestamp).toISOString()
    : new Date().toISOString();

  const eventId =
    rawEvent.eventId ||
    rawEvent.id ||
    `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const username =
    rawEvent.username ||
    rawEvent.userEmail ||
    rawEvent.user ||
    rawEvent.targetUser ||
    'anonymous@unknown';

  const ipAddress =
    rawEvent.ipAddress ||
    rawEvent.sourceIp ||
    rawEvent.ip ||
    rawEvent.eventData?.ipAddress ||
    '127.0.0.1';

  const deviceId =
    rawEvent.deviceId ||
    rawEvent.deviceFingerprint ||
    rawEvent.userAgent ||
    rawEvent.eventData?.deviceId ||
    'unknown-device';

  const failedAttempts = Math.max(
    0,
    Number(
      rawEvent.failedAttempts ??
      rawEvent.failedLoginCount ??
      rawEvent.attempts ??
      rawEvent.eventData?.attempts ??
      0
    )
  );

  const timeWindowSeconds = Math.max(
    1,
    Number(
      rawEvent.timeWindowSeconds ??
      rawEvent.timeDeltaSeconds ??
      rawEvent.windowSeconds ??
      rawEvent.eventData?.timeWindowSeconds ??
      60
    )
  );

  // Compute normalized data transfer in MB
  let dataTransferMb = 0;
  if (typeof rawEvent.dataTransferMb === 'number') {
    dataTransferMb = rawEvent.dataTransferMb;
  } else if (typeof rawEvent.outboundBytes === 'number') {
    dataTransferMb = rawEvent.outboundBytes / (1024 * 1024);
  } else if (typeof rawEvent.bytesTransferred === 'number') {
    dataTransferMb = rawEvent.bytesTransferred / (1024 * 1024);
  }

  const filesAccessed = Math.max(
    0,
    Number(rawEvent.filesAccessed ?? rawEvent.eventData?.filesAccessed ?? 0)
  );

  const requestRate = Math.max(
    0,
    Number(rawEvent.requestRate ?? rawEvent.eventData?.requestRate ?? 0)
  );

  const unusualProcessActivity = Boolean(
    rawEvent.unusualProcessActivity ??
    rawEvent.eventData?.unusualProcessActivity ??
    false
  );

  // User baseline metadata
  const userBaseline = {
    knownIps: Array.isArray(rawEvent.userBaseline?.knownIps)
      ? rawEvent.userBaseline.knownIps
      : [],
    knownDevices: Array.isArray(rawEvent.userBaseline?.knownDevices)
      ? rawEvent.userBaseline.knownDevices
      : [],
    usualHours: rawEvent.userBaseline?.usualHours || { start: 6, end: 22 }
  };

  return {
    eventId,
    username,
    eventType: rawEvent.eventType || 'SECURITY_TELEMETRY',
    timestamp,
    ipAddress,
    destinationIp: rawEvent.destinationIp || '',
    deviceId,
    failedAttempts,
    failedLoginCount: failedAttempts,
    timeWindowSeconds,
    dataTransferMb,
    filesAccessed,
    requestRate,
    unusualProcessActivity,
    isSuccess: Boolean(rawEvent.isSuccess ?? (failedAttempts === 0)),
    userBaseline,
    eventData: {
      ...rawEvent.eventData,
      ...rawEvent.rawPayload
    }
  };
};

/**
 * Executes the complete detection pipeline for a security event.
 *
 * @param {Object} rawEvent - Raw or normalized security telemetry payload
 * @param {Object} [customConfig] - Optional config overrides for detection stages
 * @returns {{
 *   event: Object,
 *   ruleResult: { suspicious: boolean, ruleScore: number, triggeredRules: Array<string>, reasons: Array<string> },
 *   anomalyResult: { anomalyScore: number, factors: Array<string>, confidence: number },
 *   riskResult: { riskScore: number, severity: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL', reasons: Array<string>, recommendedAction: string },
 *   timestamp: string
 * }}
 */
export const runDetectionPipeline = (rawEvent = {}, customConfig = {}) => {
  // Step 1: Validate and normalize incoming event
  const normalizedEvent = normalizeSecurityEvent(rawEvent);

  // Step 2: Execute Deterministic Heuristic Rule Engine
  const ruleResult = evaluateRules(normalizedEvent, customConfig?.ruleConfig);

  // Step 3: Execute Statistical Anomaly Scorer
  const anomalyResult = calculateAnomalyScore(normalizedEvent, customConfig?.scorerConfig);

  // Step 4: Pass both results to Centralized Risk Correlation Engine
  const riskResult = calculateRisk(
    {
      ruleScore: ruleResult.ruleScore,
      anomalyScore: anomalyResult.anomalyScore,
      triggeredRules: ruleResult.triggeredRules,
      anomalyFactors: anomalyResult.factors,
      event: normalizedEvent
    },
    customConfig?.riskConfig
  );

  // Step 5: Return unified structured evaluation package
  return {
    event: normalizedEvent,
    ruleResult,
    anomalyResult,
    riskResult,
    timestamp: new Date().toISOString()
  };
};

export default {
  normalizeSecurityEvent,
  runDetectionPipeline
};
