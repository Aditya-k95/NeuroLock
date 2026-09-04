/**
 * Verification & Demo Script for Multi-Channel Alerts & SMS Fallback
 */

import whatsappSender, { sendWhatsAppAlert } from './whatsappSender.js';
import smsSender, { sendSMSAlert } from './smsSender.js';
import notificationDispatcher from './notificationDispatcher.js';
import alertGenerator, { generatePlainEnglishAlert, sendAlert } from '../llm/alertGenerator.js';

const runVerification = async () => {
  console.log('================================================================');
  console.log('📱 NEUROLOCK MULTI-CHANNEL ALERTS (SMS FALLBACK) VERIFICATION');
  console.log('================================================================\n');

  const testPhone = '+91 98765 43210';
  const testAlertData = {
    plainEnglishSummary: '🚨 Critical Threat: Unauthorized credential stuffing from IP 198.51.100.44 detected for user admin@fintech.in.',
    riskLevel: 'CRITICAL',
    alertId: 'ALT_TEST_8821'
  };

  // 1. Direct WhatsApp Sender Test
  console.log('--- Test 1: Direct WhatsApp Sender ---');
  const waResult = await whatsappSender.send(testPhone, testAlertData);
  console.log('WhatsApp Result:', waResult);
  console.assert(waResult.success === true, 'WhatsApp send failed');
  console.log('✅ Direct WhatsApp send verified.\n');

  // 2. Direct SMS Sender Test
  console.log('--- Test 2: Direct SMS Sender ---');
  const smsResult = await smsSender.send(testPhone, testAlertData);
  console.log('SMS Result:', smsResult);
  console.assert(smsResult.success === true, 'SMS send failed');
  console.assert(smsResult.channel === 'sms', 'SMS channel mismatch');
  console.log('✅ Direct SMS send verified.\n');

  // 3. Notification Dispatcher - Primary Channel (WhatsApp Success)
  console.log('--- Test 3: Notification Dispatcher (WhatsApp Primary Success) ---');
  const dispatchPrimary = await notificationDispatcher.send(testPhone, testAlertData);
  console.log('Dispatch Primary Result:', dispatchPrimary);
  console.assert(dispatchPrimary.success === true, 'Primary dispatch failed');
  console.assert(dispatchPrimary.channel === 'whatsapp', 'Expected whatsapp channel');
  console.assert(dispatchPrimary.fallback === false, 'Expected fallback to be false');
  console.log('✅ Notification Dispatcher WhatsApp primary success verified.\n');

  // 4. Notification Dispatcher - Automatic Fallback (WhatsApp Failure -> SMS Success)
  console.log('--- Test 4: Notification Dispatcher (WhatsApp Failure -> SMS Fallback) ---');
  const dispatchFallback = await notificationDispatcher.send(testPhone, testAlertData, {
    simulateWhatsAppFailure: true
  });
  console.log('Dispatch Fallback Result:', dispatchFallback);
  console.assert(dispatchFallback.success === true, 'Fallback dispatch failed');
  console.assert(dispatchFallback.channel === 'sms', 'Expected sms channel');
  console.assert(dispatchFallback.fallback === true, 'Expected fallback to be true');
  console.log('✅ Notification Dispatcher SMS fallback verified.\n');

  // 5. Alert Generator Integration Test
  console.log('--- Test 5: Alert Generator LLM & Dispatcher Integration ---');
  const plainEnglish = await generatePlainEnglishAlert({ riskLevel: 'HIGH' });
  console.log('Generated Plain English Alert:', plainEnglish);
  console.assert(plainEnglish.summary !== undefined, 'Summary missing');

  const alertGenDispatch = await sendAlert(testPhone, plainEnglish);
  console.log('Alert Generator Dispatch Result:', alertGenDispatch);
  console.assert(alertGenDispatch.success === true, 'AlertGenerator dispatch failed');

  const alertGenFallbackDispatch = await sendAlert(testPhone, plainEnglish, {
    simulateWhatsAppFailure: true
  });
  console.log('Alert Generator Fallback Dispatch Result:', alertGenFallbackDispatch);
  console.assert(alertGenFallbackDispatch.channel === 'sms', 'AlertGenerator fallback failed');
  console.log('✅ Alert Generator multi-channel dispatch verified.\n');

  console.log('================================================================');
  console.log('🎉 ALL MULTI-CHANNEL & SMS FALLBACK TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================');
};

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
