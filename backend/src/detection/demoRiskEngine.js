/**
 * Demo and Test Suite for NeuroLock Risk Correlation Engine
 *
 * Demonstrates end-to-end multi-layer detection and risk correlation across:
 * 1. Normal event
 * 2. One weak anomaly
 * 3. Brute-force attack
 * 4. New device + new IP
 * 5. Multiple high-risk indicators
 */

import { assessEventRisk, calculateRisk } from './riskEngine.js';

// Base user profile used across tests
const mockUserBaseline = {
  knownIps: ['103.21.244.10', '103.21.244.11'],
  knownDevices: ['dev_fingerprint_chrome_macos_101'],
  usualHours: { start: 6, end: 22 }
};

export const runRiskEngineDemos = () => {
  console.log('================================================================');
  console.log('🛡️  NEUROLOCK CENTRALIZED RISK CORRELATION ENGINE DEMO');
  console.log('================================================================\n');

  const testCases = [
    // 1. Normal Event
    {
      title: '1. Normal Event (Clean Baseline)',
      event: {
        username: 'sarah.jenkins@fintech.in',
        eventType: 'LOGIN_ATTEMPT',
        timestamp: '2026-09-02T10:30:00.000Z', // 10:30 AM
        ipAddress: '103.21.244.10',
        deviceId: 'dev_fingerprint_chrome_macos_101',
        failedAttempts: 0,
        failedLoginCount: 0,
        dataTransferMb: 15.0,
        filesAccessed: 4,
        requestRate: 20,
        unusualProcessActivity: false,
        userBaseline: mockUserBaseline
      }
    },

    // 2. One Weak Anomaly (Employee working at 11 PM)
    {
      title: '2. One Weak Anomaly (Working Late at 11 PM)',
      event: {
        username: 'sarah.jenkins@fintech.in',
        eventType: 'LOGIN_ATTEMPT',
        timestamp: '2026-09-02T23:00:00.000Z', // 11:00 PM
        ipAddress: '103.21.244.10', // known IP
        deviceId: 'dev_fingerprint_chrome_macos_101', // known device
        failedAttempts: 0,
        failedLoginCount: 0,
        dataTransferMb: 10.0,
        filesAccessed: 2,
        requestRate: 15,
        unusualProcessActivity: false,
        userBaseline: mockUserBaseline
      }
    },

    // 3. Brute-Force Attack
    {
      title: '3. Brute-Force Attack (High Velocity Password Guessing)',
      event: {
        username: 'sarah.jenkins@fintech.in',
        eventType: 'LOGIN_ATTEMPT',
        timestamp: '2026-09-02T14:20:00.000Z',
        ipAddress: '185.220.101.5',
        deviceId: 'dev_fingerprint_chrome_macos_101',
        failedAttempts: 12,
        failedLoginCount: 12,
        timeWindowSeconds: 25,
        dataTransferMb: 12.0,
        filesAccessed: 0,
        requestRate: 350,
        unusualProcessActivity: false,
        userBaseline: mockUserBaseline
      }
    },

    // 4. New Device + New IP (Moderate Multi-Factor Correlation)
    {
      title: '4. New Device + New IP (Unrecognized Network & Hardware)',
      event: {
        username: 'sarah.jenkins@fintech.in',
        eventType: 'LOGIN_ATTEMPT',
        timestamp: '2026-09-02T12:00:00.000Z', // Normal hour
        ipAddress: '172.56.21.89', // New IP
        deviceId: 'dev_fingerprint_new_ipad_99', // New Device
        failedAttempts: 0,
        failedLoginCount: 0,
        dataTransferMb: 25.0,
        filesAccessed: 5,
        requestRate: 30,
        unusualProcessActivity: false,
        userBaseline: mockUserBaseline
      }
    },

    // 5. Multiple High-Risk Indicators (Compounded Night Attack)
    {
      title: '5. Multiple High-Risk Indicators (3 AM + New IP + New Device + Brute-force + Script)',
      event: {
        username: 'sarah.jenkins@fintech.in',
        eventType: 'LOGIN_ATTEMPT',
        timestamp: '2026-09-02T03:30:00.000Z', // 03:30 AM
        ipAddress: '194.26.29.112', // Unknown Russian proxy IP
        deviceId: 'dev_fingerprint_headless_python_99', // Unknown headless agent
        failedAttempts: 7,
        failedLoginCount: 7,
        timeWindowSeconds: 40,
        dataTransferMb: 35.0,
        filesAccessed: 15,
        requestRate: 280,
        unusualProcessActivity: true, // Headless script execution
        userBaseline: mockUserBaseline
      }
    }
  ];

  for (const test of testCases) {
    console.log(`📌 Test Case: ${test.title}`);
    const result = assessEventRisk(test.event);

    console.log(`   Rule Score:         ${result.ruleResult.ruleScore} / 100`);
    console.log(`   Anomaly Score:      ${result.anomalyResult.anomalyScore} / 100`);
    console.log(`   Final Risk Score:   ${result.riskScore} / 100`);
    console.log(`   Severity Tier:      [ ${result.severity} ]`);
    console.log(`   Recommended Action: "${result.recommendedAction}"`);
    console.log('   Synthesized Reasons:');
    result.reasons.forEach((r) => console.log(`     • ${r}`));
    console.log('----------------------------------------------------------------\n');
  }
};

// Auto-run when executed directly via node
if (process.argv[1]?.endsWith('demoRiskEngine.js')) {
  runRiskEngineDemos();
}

export default runRiskEngineDemos;
