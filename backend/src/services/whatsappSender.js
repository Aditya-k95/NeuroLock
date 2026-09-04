/**
 * WhatsApp Notification Service Placeholder
 *
 * Handles real-time push notification delivery via WhatsApp (Twilio / Meta API)
 * with 1-click mitigation action links.
 */

/**
 * Dispatches a zero-jargon security alert to a user's WhatsApp channel.
 * @param {string} recipientNumber - Destination phone number with country code
 * @param {Object} alertData - Formatted threat alert payload
 * @returns {Promise<{success: boolean, messageId: string}>}
 */
export const sendWhatsAppAlert = async (recipientNumber, alertData) => {
  // Placeholder stub: Will be wired up with Twilio / WhatsApp API in notification phase
  const messageText = typeof alertData === 'string'
    ? alertData
    : (alertData?.plainEnglishSummary || alertData?.summary || alertData?.text || 'Security Alert');

  console.log(
    `[WhatsApp Service Placeholder] Dispatched alert to ${recipientNumber}: "${messageText}"`
  );

  return {
    success: true,
    messageId: `mock_msg_${Date.now()}`
  };
};

export const send = sendWhatsAppAlert;

export default {
  send,
  sendWhatsAppAlert
};
