/**
 * SMS Notification Service Placeholder
 *
 * Handles real-time SMS delivery (Twilio / AWS SNS / Telephony API)
 * as a high-reliability fallback channel when WhatsApp delivery fails.
 */

/**
 * Dispatches a zero-jargon security alert to a user's phone via SMS.
 * @param {string} to - Destination phone number with country code (recipient)
 * @param {string|Object} message - Formatted alert message text or alert data payload
 * @returns {Promise<{success: boolean, messageId: string, channel: string}>}
 */
export const send = async (to, message) => {
  const messageText = typeof message === 'string'
    ? message
    : (message?.plainEnglishSummary || message?.summary || message?.text || 'Security Alert');

  console.log(
    `[SMS Service Placeholder] Dispatched SMS to ${to}: "${messageText}"`
  );

  return {
    success: true,
    messageId: `mock_sms_${Date.now()}`,
    channel: 'sms'
  };
};

export const sendSMSAlert = send;

export default {
  send,
  sendSMSAlert
};
