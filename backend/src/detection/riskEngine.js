/**
 * NeuroLock Centralized Risk Assessment & Correlation Engine
 *
 * Fuses deterministic heuristic rule scores with statistical anomaly scores
 * into a single unified risk score (0-100), maps severity tiers, and synthesizes
 * explainable threat reasons and remediation actions.
 *
 * ARCHITECTURAL PRINCIPLES:
 * - Deterministic & Explainable: No black-box hallucinations.
 * - Multi-Vector Correlation: Compounding severity when multiple independent threats co-occur.
 * - False-Positive Resistance: Single weak anomalies stay in LOW/MEDIUM.
 * - High-Risk Gating: Critical attack combinations reliably escalate to HIGH/CRITICAL.
 */

import { evaluateRules } from './ruleEngine.js';
import { calculateAnomalyScore } from './anomalyScorer.js';

/**
 * Default Risk Engine Configuration
 */
export const DEFAULT_RISK_CONFIG = {
  // Score Fusion Weights (must sum to 1.00)
  weights: {
    ruleScore: 0.50, // Weight for deterministic heuristic rules
    anomalyScore: 0.50 // Weight for statistical/ML feature deviations
  },

  // Standardized Severity Threshold Ranges
  severityThresholds: {
    LOW: { min: 0, max: 29 },
    MEDIUM: { min: 30, max: 59 },
    HIGH: { min: 60, max: 79 },
    CRITICAL: { min: 80, max: 100 }
  },

  // Correlation and Escalation Multipliers
  correlation: {
    bothEnginesElevatedThreshold: 50, // Threshold where both engines indicate significant threat
    bothEnginesBonus: 10, // Synergy bonus when both engines independently flag high risk
    criticalRuleOverrideScore: 80 // Minimum risk score floor if high-impact attack signature is confirmed
  },

  // Standard Remediation Action Templates by Severity Tier
  recommendedActions: {
    LOW: 'Continue monitoring. Telemetry indicates expected operational baseline.',
    MEDIUM: 'Review the event and verify the affected user/device.',
    HIGH: 'Verify the account, review activity, and consider temporarily restricting access.',
    CRITICAL: 'Isolate the affected device/account and begin incident-response procedures.'
  }
};

/**
 * Maps a numeric score (0-100) to its corresponding severity level.
 * @param {number} score - Bounded risk score
 * @param {Object} [thresholds] - Custom severity ranges
 * @returns {'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'}
 */
export const getSeverityLevel = (score, thresholds = DEFAULT_RISK_CONFIG.severityThresholds) => {
  const s = Math.min(100, Math.max(0, Math.round(score)));

  if (s >= thresholds.CRITICAL.min) return 'CRITICAL';
  if (s >= thresholds.HIGH.min) return 'HIGH';
  if (s >= thresholds.MEDIUM.min) return 'MEDIUM';
  return 'LOW';
};

/**
 * Selects an appropriate, actionable remediation recommendation.
 * Enriches standard severity action templates with context-specific advice.
 *
 * @param {'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'} severity
 * @param {Array<string>} [triggeredRules=[]]
 * @returns {string}
 */
export const getRecommendedAction = (severity, triggeredRules = []) => {
  const defaultAction = DEFAULT_RISK_CONFIG.recommendedActions[severity] || DEFAULT_RISK_CONFIG.recommendedActions.LOW;

  if (severity === 'CRITICAL') {
    if (triggeredRules.includes('BRUTE_FORCE_ATTACK')) {
      return 'Lock account immediately, invalidate all active session tokens, and enforce password reset with step-up MFA.';
    }
    if (triggeredRules.includes('ABNORMAL_DATA_TRANSFER')) {
      return 'Terminate active connection immediately, quarantine the client IP at firewall, and initiate data exfiltration audit.';
    }
    return DEFAULT_RISK_CONFIG.recommendedActions.CRITICAL;
  }

  if (severity === 'HIGH') {
    if (triggeredRules.includes('UNRECOGNIZED_DEVICE') || triggeredRules.includes('UNRECOGNIZED_IP')) {
      return 'Trigger biometric re-authentication, challenge active session, and prompt user for device verification.';
    }
    return DEFAULT_RISK_CONFIG.recommendedActions.HIGH;
  }

  return defaultAction;
};

/**
 * Calculates unified risk assessment from individual detection outputs.
 *
 * @param {Object} params
 * @param {number} [params.ruleScore=0] - Output from Rule Engine (0-100)
 * @param {number} [params.anomalyScore=0] - Output from Anomaly Scorer (0-100)
 * @param {Array<string>} [params.triggeredRules=[]] - List of triggered rule IDs
 * @param {Array<string>} [params.anomalyFactors=[]] - List of contributing anomaly factors
 * @param {Object} [params.event={}] - Original normalized security event
 * @param {Object} [customConfig] - Optional config overrides
 * @returns {{riskScore: number, severity: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL', reasons: Array<string>, recommendedAction: string}}
 */
export const calculateRisk = (
  {
    ruleScore = 0,
    anomalyScore = 0,
    triggeredRules = [],
    anomalyFactors = [],
    event = {}
  } = {},
  customConfig = {}
) => {
  const config = { ...DEFAULT_RISK_CONFIG, ...customConfig };
  const { weights, correlation } = config;

  const boundedRuleScore = Math.min(100, Math.max(0, Number(ruleScore) || 0));
  const boundedAnomalyScore = Math.min(100, Math.max(0, Number(anomalyScore) || 0));

  // 1. Calculate weighted baseline fusion
  let fusedScore = (boundedRuleScore * weights.ruleScore) + (boundedAnomalyScore * weights.anomalyScore);

  // 2. Correlation Bonus: Both engines independently detect substantial risk
  if (
    boundedRuleScore >= correlation.bothEnginesElevatedThreshold &&
    boundedAnomalyScore >= correlation.bothEnginesElevatedThreshold
  ) {
    fusedScore += correlation.bothEnginesBonus;
  }

  // 3. High-Impact Attack Signature Floor Override
  // Guarantee CRITICAL tier for confirmed high-impact attack signatures
  const hasBruteForce = triggeredRules.includes('BRUTE_FORCE_ATTACK');
  const hasMultipleIndicators = triggeredRules.includes('MULTIPLE_SUSPICIOUS_INDICATORS');
  const hasMassExfiltration = triggeredRules.includes('ABNORMAL_DATA_TRANSFER');

  if (hasBruteForce && (boundedRuleScore >= 80 || boundedAnomalyScore >= 80)) {
    fusedScore = Math.max(fusedScore, correlation.criticalRuleOverrideScore);
  }

  if (hasMassExfiltration && boundedRuleScore >= 50 && boundedAnomalyScore >= 50) {
    fusedScore = Math.max(fusedScore, correlation.criticalRuleOverrideScore);
  }

  // 4. Bound final score strictly between 0 and 100
  const finalRiskScore = Math.min(100, Math.max(0, Math.round(fusedScore)));
  const severity = getSeverityLevel(finalRiskScore, config.severityThresholds);

  // 5. Synthesize clean, non-duplicate threat reasons
  const combinedReasons = [];

  // Add rule-based reasons
  if (triggeredRules.length > 0) {
    triggeredRules.forEach((rule) => {
      if (rule === 'BRUTE_FORCE_ATTACK') {
        combinedReasons.push('Rapid credential guessing / brute-force authentication pattern detected.');
      } else if (rule === 'SUSPICIOUS_LOGIN_TIME') {
        combinedReasons.push('Access requested during unusual/off-hours timeframe.');
      } else if (rule === 'UNRECOGNIZED_IP') {
        combinedReasons.push('Access originating from an unverified or unfamiliar IP address.');
      } else if (rule === 'UNRECOGNIZED_DEVICE') {
        combinedReasons.push('Authentication attempt using an unregistered device fingerprint.');
      } else if (rule === 'ABNORMAL_DATA_TRANSFER') {
        combinedReasons.push('Anomalously high outbound data volume indicating potential exfiltration.');
      } else if (rule === 'MULTIPLE_SUSPICIOUS_INDICATORS') {
        combinedReasons.push('Compounded risk: Multiple independent threat indicators triggered concurrently.');
      }
    });
  }

  // Add key anomaly factors if not already represented
  if (Array.isArray(anomalyFactors)) {
    anomalyFactors.forEach((factor) => {
      if (!factor.startsWith('All observed') && !combinedReasons.includes(factor)) {
        combinedReasons.push(factor);
      }
    });
  }

  if (combinedReasons.length === 0) {
    combinedReasons.push('All telemetry metrics within normal baseline parameters.');
  }

  // 6. Generate Contextual Recommendation
  const recommendedAction = getRecommendedAction(severity, triggeredRules);

  return {
    riskScore: finalRiskScore,
    severity,
    reasons: combinedReasons,
    recommendedAction
  };
};

/**
 * Convenience End-to-End Pipeline Function
 * Ingests a raw/normalized security event, runs rule engine and anomaly scorer,
 * and produces the unified risk correlation output.
 *
 * @param {Object} event - Normalized security event
 * @param {Object} [customConfig]
 * @returns {{riskScore: number, severity: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL', reasons: Array<string>, recommendedAction: string, ruleResult: Object, anomalyResult: Object}}
 */
export const assessEventRisk = (event = {}, customConfig = {}) => {
  const ruleResult = evaluateRules(event, customConfig?.ruleConfig);
  const anomalyResult = calculateAnomalyScore(event, customConfig?.scorerConfig);

  const riskResult = calculateRisk(
    {
      ruleScore: ruleResult.ruleScore,
      anomalyScore: anomalyResult.anomalyScore,
      triggeredRules: ruleResult.triggeredRules,
      anomalyFactors: anomalyResult.factors,
      event
    },
    customConfig?.riskConfig
  );

  return {
    ...riskResult,
    ruleResult,
    anomalyResult
  };
};

export default {
  DEFAULT_RISK_CONFIG,
  getSeverityLevel,
  getRecommendedAction,
  calculateRisk,
  assessEventRisk
};
