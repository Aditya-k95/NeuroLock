/**
 * Demo and Test Suite for NeuroLock Anomaly Scorer
 *
 * Demonstrates the deterministic feature normalization, multi-dimensional
 * scoring, and factor analysis across 5 distinct threat and operational profiles:
 * 1. Normal Daytime Activity
 * 2. Single Mild Indicator (Working Late)
 * 3. High Failed Logins & Burst Rate
 * 4. Compounded Multi-Vector Attack (3 AM + Unknown Device + Unknown IP + Process Anomaly)
 * 5. Mass Data Exfiltration & File Enumeration
 */

import { calculateAnomalyScore } from './anomalyScorer.js';

export const runAnomalyScorerDemos = () => {
  console.log('================================================================');
  console.log('🧠 NEUROLOCK ANOMALY SCORING ENGINE DEMO');
  console.log('================================================================\n');

  const testCases = [
    {
      title: '1. Normal Daytime Activity (Clean Baseline)',
      event: {
        failedLoginCount: 0,
        loginHour: 11, // 11:00 AM
        isNewDevice: false,
        isNewIp: false,
        dataTransferMb: 12.5,
        filesAccessed: 4,
        requestRate: 15,
        unusualProcessActivity: false
      }
    },
    {
      title: '2. Single Mild Indicator (Legitimate Employee Working at 11 PM)',
      event: {
        failedLoginCount: 0,
        loginHour: 23, // 11:00 PM
        isNewDevice: false,
        isNewIp: false,
        dataTransferMb: 8.0,
        filesAccessed: 3,
        requestRate: 10,
        unusualProcessActivity: false
      }
    },
    {
      title: '3. Rapid Authentication Spike (Brute Force Anomaly)',
      event: {
        failedLoginCount: 9,
        loginHour: 14,
        isNewDevice: true,
        isNewIp: true,
        dataTransferMb: 18.0,
        filesAccessed: 0,
        requestRate: 380, // High request rate
        unusualProcessActivity: false
      }
    },
    {
      title: '4. Compounded Multi-Vector Attack (3 AM + New IP + New Device + Script)',
      event: {
        failedLoginCount: 6,
        loginHour: 3, // 03:00 AM
        isNewDevice: true,
        isNewIp: true,
        dataTransferMb: 45.0,
        filesAccessed: 12,
        requestRate: 220,
        unusualProcessActivity: true
      }
    },
    {
      title: '5. Mass Data Exfiltration & File Enumeration',
      event: {
        failedLoginCount: 0,
        loginHour: 2, // 02:00 AM
        isNewDevice: true,
        isNewIp: false,
        dataTransferMb: 620.0, // 620 MB exfiltration
        filesAccessed: 240, // 240 files accessed
        requestRate: 450,
        unusualProcessActivity: true
      }
    }
  ];

  for (const test of testCases) {
    console.log(`📌 Test Case: ${test.title}`);
    const result = calculateAnomalyScore(test.event);

    console.log(`   Anomaly Score:  ${result.anomalyScore} / 100`);
    console.log(`   Confidence:     ${(result.confidence * 100).toFixed(0)}%`);
    console.log('   Contributing Factors:');
    result.factors.forEach((f) => console.log(`     • ${f}`));
    console.log('----------------------------------------------------------------\n');
  }
};

// Auto-run when executed directly via node
if (process.argv[1]?.endsWith('demoAnomalyScorer.js')) {
  runAnomalyScorerDemos();
}

export default runAnomalyScorerDemos;
