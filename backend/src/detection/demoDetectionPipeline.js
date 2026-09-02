/**
 * Demo and Test Suite for NeuroLock Unified Detection Pipeline
 *
 * Demonstrates complete multi-stage pipeline execution on 5 representative events:
 * 1. Standard Legitimate Employee Login
 * 2. Off-Hours Mild Indicator (Working Late at 11 PM)
 * 3. High-Velocity Brute-Force Password Spray
 * 4. Unfamiliar Device + Unfamiliar IP (Moderate Correlation)
 * 5. Compounded Multi-Vector Attack (3 AM + Tor IP + Headless Agent + Rate Spike)
 */

import { runDetectionPipeline } from './detectionPipeline.js';

const mockUserBaseline = {
  knownIps: ['103.21.244.10', '103.21.244.11'],
  knownDevices: ['dev_fingerprint_macbook_corp_88'],
  usualHours: { start: 6, end: 22 }
};

export const runPipelineDemos = () => {
  console.log('================================================================');
  console.log('🛡️  NEUROLOCK COMPLETE DETECTION PIPELINE DEMO');
  console.log('================================================================\n');

  const testEvents = [
    // Event 1: Normal Legitimate Login
    {
      label: '1. Normal Legitimate Employee Login',
      payload: {
        username: 'sarah.jenkins@fintech.in',
        eventType: 'LOGIN_ATTEMPT',
        timestamp: '2026-09-02T10:15:00.000Z', // 10:15 AM
        ipAddress: '103.21.244.10', // Known IP
        deviceId: 'dev_fingerprint_macbook_corp_88', // Known Device
        failedAttempts: 0,
        outboundBytes: 12000,
        filesAccessed: 3,
        requestRate: 15,
        unusualProcessActivity: false,
        userBaseline: mockUserBaseline
      }
    },

    // Event 2: Off-Hours Mild Indicator
    {
      label: '2. Off-Hours Login Alone (Employee Working at 11 PM)',
      payload: {
        username: 'sarah.jenkins@fintech.in',
        eventType: 'LOGIN_ATTEMPT',
        timestamp: '2026-09-02T23:00:00.000Z', // 11:00 PM
        ipAddress: '103.21.244.10',
        deviceId: 'dev_fingerprint_macbook_corp_88',
        failedAttempts: 0,
        outboundBytes: 8000,
        filesAccessed: 2,
        requestRate: 12,
        unusualProcessActivity: false,
        userBaseline: mockUserBaseline
      }
    },

    // Event 3: High-Velocity Brute-Force Password Spray
    {
      label: '3. High-Velocity Brute-Force Password Spray',
      payload: {
        username: 'sarah.jenkins@fintech.in',
        eventType: 'LOGIN_ATTEMPT',
        timestamp: '2026-09-02T14:45:00.000Z',
        ipAddress: '185.220.101.5', // Unknown Tor exit node
        deviceId: 'dev_fingerprint_macbook_corp_88',
        failedAttempts: 14,
        timeWindowSeconds: 20,
        outboundBytes: 15000,
        filesAccessed: 0,
        requestRate: 420,
        unusualProcessActivity: false,
        userBaseline: mockUserBaseline
      }
    },

    // Event 4: Unfamiliar Device + Unfamiliar IP
    {
      label: '4. Unfamiliar Device + Unfamiliar IP (New Laptop at Cafe)',
      payload: {
        username: 'sarah.jenkins@fintech.in',
        eventType: 'LOGIN_ATTEMPT',
        timestamp: '2026-09-02T13:00:00.000Z', // Normal business hour
        ipAddress: '122.161.44.18', // Unrecognized IP
        deviceId: 'dev_fingerprint_new_ipad_pro_01', // Unrecognized Device
        failedAttempts: 0,
        outboundBytes: 25000,
        filesAccessed: 5,
        requestRate: 25,
        unusualProcessActivity: false,
        userBaseline: mockUserBaseline
      }
    },

    // Event 5: Compounded Multi-Vector Attack
    {
      label: '5. Compounded Multi-Vector Attack (3 AM + Tor IP + Headless Script + Burst)',
      payload: {
        username: 'sarah.jenkins@fintech.in',
        eventType: 'LOGIN_ATTEMPT',
        timestamp: '2026-09-02T03:30:00.000Z', // 03:30 AM
        ipAddress: '194.26.29.112', // Unknown Russian proxy IP
        deviceId: 'dev_fingerprint_headless_python_99', // Unknown headless agent
        failedAttempts: 8,
        timeWindowSeconds: 30,
        outboundBytes: 45000,
        filesAccessed: 15,
        requestRate: 310,
        unusualProcessActivity: true, // Automated script execution
        userBaseline: mockUserBaseline
      }
    }
  ];

  for (const item of testEvents) {
    console.log(`📌 EVENT: ${item.label}`);
    const output = runDetectionPipeline(item.payload);

    console.log(`   Event ID:           ${output.event.eventId}`);
    console.log(`   Timestamp:          ${output.event.timestamp}`);
    console.log(`   Rule Engine Score:  ${output.ruleResult.ruleScore} / 100  (Suspicious: ${output.ruleResult.suspicious})`);
    console.log(`   Anomaly ML Score:   ${output.anomalyResult.anomalyScore} / 100  (Confidence: ${(output.anomalyResult.confidence * 100).toFixed(0)}%)`);
    console.log(`   ─────────────────────────────────────────────────────────────`);
    console.log(`   FINAL RISK SCORE:   ${output.riskResult.riskScore} / 100`);
    console.log(`   SEVERITY TIER:      [ ${output.riskResult.severity} ]`);
    console.log(`   RECOMMENDED ACTION: "${output.riskResult.recommendedAction}"`);
    console.log(`   SYNTHESIZED REASONS:`);
    output.riskResult.reasons.forEach((r) => console.log(`     • ${r}`));
    console.log('================================================================\n');
  }
};

// Auto-run when executed directly via node
if (process.argv[1]?.endsWith('demoDetectionPipeline.js')) {
  runPipelineDemos();
}

export default runPipelineDemos;
