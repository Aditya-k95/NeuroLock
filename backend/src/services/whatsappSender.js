/**
 * NeuroLock WhatsApp Notification Service
 *
 * Implements automated threat alerts via Twilio WhatsApp Business API.
 * Dispatches plain-English zero-jargon security alerts for HIGH and CRITICAL threats.
 */

import dotenv from 'dotenv';
dotenv.config();

/**
 * Formats structured alert data into the official NeuroLock WhatsApp alert template
 *
 * @param {Object} alert - Alert document or detection payload
 * @returns {string} Formatted WhatsApp message body
 */
export function formatWhatsAppMessage(alert = {}) {
  const title = alert.title || alert.alertType || 'Security Threat Detected';
  const severity = (alert.severity || 'HIGH').toUpperCase();
  const riskScore = alert.riskScore ?? 80;
  const explanation =
    alert.explanation ||
    'NeuroLock detected an anomalous behavioral pattern deviating from expected operational baselines.';
  const recommendedAction =
    alert.recommendedAction ||
    'Review the affected account immediately and verify recent access.';

  return `🚨 NeuroLock Security Alert

Threat:
${title}

Severity:
${severity}

Risk Score:
${riskScore}/100

What happened:
${explanation}

Recommended action:
${recommendedAction}`;
}

/**
 * Dispatches a WhatsApp alert for HIGH and CRITICAL severity threats via Twilio.
 * Automatically skips LOW and MEDIUM events to avoid notification fatigue.
 *
 * @param {Object} alert - Alert object containing severity, riskScore, title, explanation, recommendedAction
 * @param {Object} [options] - Optional overrides (e.g. custom recipient phone)
 * @returns {Promise<{ success: boolean, sent: boolean, messageId?: string, reason?: string, error?: string }>}
 */
export async function sendWhatsAppAlert(alert = {}, options = {}) {
  try {
    const severity = String(alert.severity || '').trim().toUpperCase();

    // 1. Severity Threshold Filter: ONLY send automatically for HIGH and CRITICAL
    if (severity !== 'HIGH' && severity !== 'CRITICAL') {
      console.log(
        `[WhatsApp] Notification skipped: Severity '${severity}' is below threshold (HIGH/CRITICAL required).`
      );
      return {
        success: true,
        sent: false,
        reason: `Severity '${severity}' is below threshold (only HIGH/CRITICAL trigger automated dispatch)`
      };
    }

    // 2. Load and validate environment configuration
    const accountSid = process.env.WHATSAPP_ACCOUNT_SID;
    const authToken = process.env.WHATSAPP_AUTH_TOKEN;
    const rawFrom = process.env.WHATSAPP_FROM || 'whatsapp:+14155238886';
    const rawTo = options.to || process.env.WHATSAPP_TO;

    const isConfigured =
      accountSid &&
      authToken &&
      !accountSid.includes('your_') &&
      !authToken.includes('your_') &&
      rawTo &&
      !rawTo.includes('XXXX');

    if (!isConfigured) {
      console.log('[WhatsApp] Notification skipped: credentials not configured in environment.');
      return {
        success: true,
        sent: false,
        reason: 'WhatsApp credentials not configured'
      };
    }

    // 3. Format WhatsApp phone numbers (Twilio requires 'whatsapp:+E164' format)
    const fromNumber = rawFrom.startsWith('whatsapp:') ? rawFrom : `whatsapp:${rawFrom}`;
    const toNumber = rawTo.startsWith('whatsapp:') ? rawTo : `whatsapp:${rawTo}`;

    // 4. Construct message body
    const messageBody = formatWhatsAppMessage(alert);

    // 5. Build Twilio REST API request using HTTP Basic Auth (No heavy SDK required)
    const twilioEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`;

    const formParams = new URLSearchParams();
    formParams.append('From', fromNumber);
    formParams.append('To', toNumber);
    formParams.append('Body', messageBody);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6-second timeout

    const response = await fetch(twilioEndpoint, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formParams.toString(),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `Twilio HTTP ${response.status}`;
      console.warn(`[WhatsApp] Delivery attempt failed: ${errorMsg}`);
      return {
        success: false,
        sent: false,
        error: errorMsg
      };
    }

    console.log(`[WhatsApp] Successfully transmitted alert to ${toNumber} (SID: ${data.sid})`);
    return {
      success: true,
      sent: true,
      messageId: data.sid
    };
  } catch (err) {
    console.warn(`[WhatsApp] Exception during notification dispatch: ${err.message}`);
    return {
      success: false,
      sent: false,
      error: err.message
    };
  }
}

export default {
  formatWhatsAppMessage,
  sendWhatsAppAlert
};
