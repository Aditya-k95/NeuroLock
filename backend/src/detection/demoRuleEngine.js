/**
 * Demo and Test Suite for NeuroLock Security Rule Engine
 *
 * Runs 5 representative real-world prototype scenarios:
 * 1. Normal login
 * 2. Brute-force attack
 * 3. Suspicious login time
 * 4. Suspicious login + new device + new IP (compounded)
 * 5. Abnormal data transfer
 */

import { evaluateRules } from './ruleEngine.js';

// Base user profile used across test scenarios
const mockUserBaseline = {
  knownIps: ['103.21.244.10', '103.21.244.11'],
  knownDevices: ['dev_fingerprint_chrome_macos_101'],
  usualHours: { start: 6, end: 22 } // 06:00 to 22:00
};

export const runRuleEngineDemos = () => {
  console.log('================================================================');
  console.log('🛡️  NEUROLOCK RULE ENGINE TEST & SCENARIO DEMO');
  console.log('================================================================\n');

  // Scenario 1: Normal legitimate login
  const scenario1 = {
    name: '1. Normal Legitimate Login',
    event: {
      username: 'sarah.jenkins@fintech.in',
      eventType: 'LOGIN_ATTEMPT',
      timestamp: '2026-09-02T10:15:00.000Z', // 10:15 AM
      ipAddress: '103.21.244.10',
      deviceId: 'dev_fingerprint_chrome_macos_101',
      failedAttempts: 0,
      outboundBytes: 4200,
      userBaseline: mockUserBaseline
    }
  };

  // Scenario 2: Brute-Force Password Guessing Attack
  const scenario2 = {
    name: '2. Brute-Force Attack',
    event: {
      username: 'sarah.jenkins@fintech.in',
      eventType: 'LOGIN_ATTEMPT',
      timestamp: '2026-09-02T14:30:00.000Z',
      ipAddress: '185.220.101.5',
      deviceId: 'dev_fingerprint_chrome_macos_101',
      failedAttempts: 12,
      timeWindowSeconds: 30,
      outboundBytes: 15000,
      userBaseline: mockUserBaseline
    }
  };

  // Scenario 3: Suspicious Late-Night Login Alone (Single Mild Indicator)
  const scenario3 = {
    name: '3. Suspicious Login Time Alone (Working Late)',
    event: {
      username: 'sarah.jenkins@fintech.in',
      eventType: 'LOGIN_ATTEMPT',
      timestamp: '2026-09-02T03:15:00.000Z', // 03:15 AM (unusual hour)
      ipAddress: '103.21.244.10', // known IP
      deviceId: 'dev_fingerprint_chrome_macos_101', // known device
      failedAttempts: 0,
      outboundBytes: 5000,
      userBaseline: mockUserBaseline
    }
  };

  // Scenario 4: Suspicious Login Time + Unrecognized Device + Unrecognized IP (Compounded Attack)
  const scenario4 = {
    name: '4. Suspicious Time + New Device + New IP (Compounded Multi-Indicator Attack)',
    event: {
      username: 'sarah.jenkins@fintech.in',
      eventType: 'LOGIN_ATTEMPT',
      timestamp: '2026-09-02T03:45:00.000Z', // 03:45 AM
      ipAddress: '194.26.29.112', // Unknown Russian proxy IP
      deviceId: 'dev_fingerprint_headless_python_99', // Unknown device
      failedAttempts: 1,
      outboundBytes: 8000,
      userBaseline: mockUserBaseline
    }
  };

  // Scenario 5: Abnormal Data Transfer / Exfiltration Spike
  const scenario5 = {
    name: '5. Abnormal Outbound Data Transfer Spike',
    event: {
      username: 'sarah.jenkins@fintech.in',
      eventType: 'DATA_EXPORT',
      timestamp: '2026-09-02T11:00:00.000Z',
      ipAddress: '103.21.244.10',
      deviceId: 'dev_fingerprint_chrome_macos_101',
      outboundBytes: 650 * 1024 * 1024, // 650 MB outbound transfer
      userBaseline: mockUserBaseline
    }
  };

  const scenarios = [scenario1, scenario2, scenario3, scenario4, scenario5];

  for (const item of scenarios) {
    console.log(`📌 Scenario: ${item.name}`);
    const result = evaluateRules(item.event);
    console.log(`   Suspicious:       ${result.suspicious ? '🚨 YES (FLAGGED)' : '✅ NO (CLEAN)'}`);
    console.log(`   Rule Score:       ${result.ruleScore} / 100`);
    console.log(`   Triggered Rules:  ${result.triggeredRules.length > 0 ? result.triggeredRules.join(', ') : 'None'}`);
    console.log('   Reasons:');
    if (result.reasons.length === 0) {
      console.log('     • Normal behavior matching user baseline.');
    } else {
      result.reasons.forEach((r) => console.log(`     • ${r}`));
    }
    console.log('----------------------------------------------------------------\n');
  }
};

// Auto-run when executed directly via node
if (process.argv[1]?.endsWith('demoRuleEngine.js')) {
  runRuleEngineDemos();
}

export default runRuleEngineDemos;
