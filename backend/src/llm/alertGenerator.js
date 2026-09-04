/**
 * Alert Generator Placeholder (LLM Contextual Intelligence)
 *
 * Converts complex cybersecurity telemetry into concise, zero-jargon,
 * plain-English briefings for non-technical stakeholders and dispatches
 * multi-channel notifications (WhatsApp with automated SMS fallback).
 */

import notificationDispatcher, { send as dispatchNotification } from '../services/notificationDispatcher.js';

/**
 * Synthesizes an anomaly payload into a human-readable alert summary.
 * @param {Object} anomalyPayload - Detected anomaly and context details
 * @returns {Promise<{summary: string, recommendedAction: string, riskLevel: string}>}
 */
export const generatePlainEnglishAlert = async (anomalyPayload) => {
  // Placeholder stub: Will be integrated with Gemini/OpenAI SDK in LLM implementation phase
  return {
    summary: 'A login event exhibited anomalous behavioral patterns.',
    recommendedAction: 'Verify recent activity and re-authenticate if necessary.',
    riskLevel: anomalyPayload?.riskLevel || 'MEDIUM'
  };
};

/**
 * Dispatches an alert notification via the multi-channel notification dispatcher.
 * Tries WhatsApp first and falls back to SMS on failure.
 *
 * @param {string} to - Destination recipient phone number
 * @param {string|Object} message - Threat summary or formatted alert payload
 * @param {Object} [options] - Dispatcher configuration options
 * @returns {Promise<{success: boolean, channel: string, messageId: string, fallback?: boolean}>}
 */
export const sendAlert = async (to, message, options = {}) => {
  return await dispatchNotification(to, message, options);
};

export default {
  generatePlainEnglishAlert,
  sendAlert,
  notificationDispatcher
};
