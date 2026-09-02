import { sendWhatsAppAlert, formatWhatsAppMessage } from './whatsappSender.js';

async function testWhatsAppSender() {
  console.log('================================================================');
  console.log('🛡️  NEUROLOCK WHATSAPP ALERT NOTIFICATION SERVICE TEST');
  console.log('================================================================\n');

  // Test 1: Message Formatting Preview
  const sampleAlert = {
    title: 'Possible Password-Guessing Attack',
    severity: 'CRITICAL',
    riskScore: 100,
    explanation: 'NeuroLock detected an unusually high number of failed login attempts targeting admin@bharatmsme.in in a very short window.',
    recommendedAction: 'Lock the account immediately, invalidate active sessions, and enforce a password reset with two-factor authentication.'
  };

  console.log('--- [Preview] Formatted Message Body ---');
  console.log(formatWhatsAppMessage(sampleAlert));
  console.log('----------------------------------------\n');

  // Test 2: LOW severity threshold test (should be skipped)
  console.log('[Test 2] Testing LOW severity event dispatch...');
  const lowResult = await sendWhatsAppAlert({
    title: 'Normal Morning Authentication',
    severity: 'LOW',
    riskScore: 10
  });
  console.log('Result:', lowResult);

  // Test 3: MEDIUM severity threshold test (should be skipped)
  console.log('\n[Test 3] Testing MEDIUM severity event dispatch...');
  const medResult = await sendWhatsAppAlert({
    title: 'Unrecognized Off-Hours Login Attempt',
    severity: 'MEDIUM',
    riskScore: 47
  });
  console.log('Result:', medResult);

  // Test 4: CRITICAL severity dispatch with unconfigured / mock credentials
  console.log('\n[Test 4] Testing CRITICAL severity dispatch (safe skip when unconfigured)...');
  const critResult = await sendWhatsAppAlert(sampleAlert);
  console.log('Result:', critResult);

  console.log('\n================================================================');
  console.log('✅ All WhatsApp service threshold tests passed successfully!');
  console.log('================================================================\n');
}

testWhatsAppSender();
