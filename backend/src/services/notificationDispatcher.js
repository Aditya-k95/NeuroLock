/**
 * Multi-Channel Notification Dispatcher
 *
 * Implements channel-selection logic and automatic fallback:
 * 1. Attempts delivery via primary channel (WhatsApp).
 * 2. If WhatsApp fails (network error, rate limit, app unavailable),
 *    automatically falls back to SMS (Twilio / Telephony).
 * 3. Provides a unified `send(to, message)` interface across the application.
 */

import whatsappSender, { send as sendWhatsApp, sendWhatsAppAlert } from './whatsappSender.js';
import smsSender, { send as sendSMS, sendSMSAlert } from './smsSender.js';

/**
 * Dispatches a security alert or notification, trying WhatsApp first and falling back to SMS on failure.
 *
 * @param {string} to - Destination phone number with country code
 * @param {string|Object} message - Formatted alert message text or threat alert payload
 * @param {Object} [options] - Dispatcher configuration options
 * @param {string} [options.preferredChannel='whatsapp'] - Primary channel to attempt ('whatsapp' | 'sms')
 * @param {boolean} [options.allowFallback=true] - Whether to fallback to alternative channel on error
 * @param {boolean} [options.simulateWhatsAppFailure=false] - Testing flag to simulate primary failure
 * @returns {Promise<{success: boolean, channel: string, messageId: string, fallback?: boolean, error?: string}>}
 */
export const send = async (to, message, options = {}) => {
  const {
    preferredChannel = 'whatsapp',
    allowFallback = true,
    simulateWhatsAppFailure = false
  } = options;

  // Validate recipient
  if (!to) {
    console.warn('[NotificationDispatcher] No recipient phone number provided for dispatch.');
    return {
      success: false,
      channel: 'none',
      error: 'Missing recipient phone number'
    };
  }

  // 1. Primary Channel Delivery: WhatsApp
  if (preferredChannel === 'whatsapp') {
    try {
      if (simulateWhatsAppFailure || process.env.SIMULATE_WHATSAPP_FAILURE === 'true') {
        throw new Error('Simulated WhatsApp API gateway timeout / network unreachable');
      }

      const whatsappResult = await (sendWhatsApp ? sendWhatsApp(to, message) : sendWhatsAppAlert(to, message));
      
      if (whatsappResult && whatsappResult.success !== false) {
        return {
          success: true,
          channel: 'whatsapp',
          messageId: whatsappResult.messageId,
          fallback: false,
          details: whatsappResult
        };
      }
      
      throw new Error(whatsappResult?.error || 'WhatsApp delivery returned unsuccessful status');
    } catch (primaryErr) {
      console.warn(
        `[NotificationDispatcher] ⚠️ Primary channel (WhatsApp) failed for ${to}: ${primaryErr.message}.`
      );

      if (!allowFallback) {
        return {
          success: false,
          channel: 'whatsapp',
          error: primaryErr.message
        };
      }

      // 2. Fallback Channel Delivery: SMS
      console.log(`[NotificationDispatcher] 🔄 Initiating automatic fallback to SMS channel for ${to}...`);
      try {
        const smsResult = await (sendSMS ? sendSMS(to, message) : sendSMSAlert(to, message));

        if (smsResult && smsResult.success !== false) {
          console.log(`[NotificationDispatcher] ✅ SMS fallback successfully delivered to ${to}.`);
          return {
            success: true,
            channel: 'sms',
            messageId: smsResult.messageId,
            fallback: true,
            primaryError: primaryErr.message,
            details: smsResult
          };
        }

        throw new Error(smsResult?.error || 'SMS fallback delivery returned unsuccessful status');
      } catch (fallbackErr) {
        console.error(
          `[NotificationDispatcher] ❌ All notification channels (WhatsApp, SMS) failed for ${to}: ${fallbackErr.message}`
        );
        return {
          success: false,
          channel: 'none',
          error: `Primary (WhatsApp): ${primaryErr.message} | Fallback (SMS): ${fallbackErr.message}`,
          attempts: ['whatsapp', 'sms']
        };
      }
    }
  }

  // If SMS is explicitly selected as preferred channel
  if (preferredChannel === 'sms') {
    try {
      const smsResult = await (sendSMS ? sendSMS(to, message) : sendSMSAlert(to, message));
      return {
        success: true,
        channel: 'sms',
        messageId: smsResult?.messageId,
        fallback: false,
        details: smsResult
      };
    } catch (smsErr) {
      console.warn(`[NotificationDispatcher] SMS dispatch failed for ${to}: ${smsErr.message}`);
      if (allowFallback) {
        try {
          const whatsappResult = await (sendWhatsApp ? sendWhatsApp(to, message) : sendWhatsAppAlert(to, message));
          return {
            success: true,
            channel: 'whatsapp',
            messageId: whatsappResult?.messageId,
            fallback: true,
            primaryError: smsErr.message
          };
        } catch (waErr) {
          return {
            success: false,
            channel: 'none',
            error: `Primary (SMS): ${smsErr.message} | Fallback (WhatsApp): ${waErr.message}`
          };
        }
      }
      return { success: false, channel: 'sms', error: smsErr.message };
    }
  }

  return {
    success: false,
    channel: 'unknown',
    error: `Unsupported preferredChannel: ${preferredChannel}`
  };
};

export const dispatchAlert = send;
export const sendNotification = send;
export const sendWhatsAppAlertWithFallback = send;

export default {
  send,
  dispatchAlert,
  sendNotification,
  sendWhatsAppAlertWithFallback
};
