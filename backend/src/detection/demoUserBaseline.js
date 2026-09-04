/**
 * Demo and Test Suite for NeuroLock Login Pattern Baselining
 *
 * Demonstrates:
 * 1. Rolling profile creation and cold-start baseline evaluation.
 * 2. Incremental behavioral training across multiple sequential events.
 * 3. Subnet-aware IP migration (/24 ISP subnet match vs alien IP).
 * 4. Adaptive Anomaly Scoring: How risk score dynamically drops once
 *    unusual habits (e.g., late night work) become learned baseline habits.
 * 5. Full detection pipeline integration with adaptive baselines.
 */

import {
  getUserBaseline,
  updateUserBaseline,
  extractSubnet,
  isIpInSubnet,
  evaluateBaselineDeviation
} from './userBaseline.js';
import { calculateAnomalyScore } from './anomalyScorer.js';
import { runDetectionPipeline } from './detectionPipeline.js';

export const runUserBaselineDemos = async () => {
  console.log('================================================================');
  console.log('🧬 NEUROLOCK LOGIN PATTERN BASELINING & ADAPTIVE RISK DEMO');
  console.log('================================================================\n');

  const username = 'rohit.sharma@msme-corp.in';

  // -------------------------------------------------------------
  // Test 1: Cold Start Profile Evaluation
  // -------------------------------------------------------------
  console.log('📌 PHASE 1: Cold Start Baseline (Brand New User)');
  const coldBaseline = await getUserBaseline(username);
  console.log(`   User: ${coldBaseline.username}`);
  console.log(`   Total Logins: ${coldBaseline.totalLogins}`);
  console.log(`   Known IPs: [${coldBaseline.knownIps.join(', ') || 'None'}]`);
  console.log(`   Known Subnets: [${coldBaseline.ipSubnets.join(', ') || 'None'}]`);
  console.log(`   Default Hours Window: ${coldBaseline.usualHours.start}:00 - ${coldBaseline.usualHours.end}:00`);

  // An event at 2:00 AM for cold start user (expect high anomaly)
  const coldEvent2am = {
    username,
    hour: 2,
    loginHour: 2,
    ipAddress: '103.21.244.10',
    deviceId: 'laptop_rohit_dell_xps',
    failedLoginCount: 0,
    userBaseline: coldBaseline
  };

  const coldScore = calculateAnomalyScore(coldEvent2am);
  console.log(`\n   >>> 2:00 AM Login Score BEFORE Training: ${coldScore.anomalyScore} / 100`);
  console.log('   Factors:');
  coldScore.factors.forEach((f) => console.log(`     • ${f}`));
  console.log('────────────────────────────────────────────────────────────────\n');

  // -------------------------------------------------------------
  // Test 2: Training Rolling Profile (Night Shift Routine)
  // -------------------------------------------------------------
  console.log('📌 PHASE 2: Training Rolling Behavioral Profile (Simulating 5 Night Logins)');
  console.log('   Simulating sequential successful logins at 01:00 - 03:00 from home IP/device...');

  for (let i = 1; i <= 5; i++) {
    const trainingHour = i % 2 === 0 ? 1 : 2;
    await updateUserBaseline(username, {
      username,
      eventType: 'LOGIN_ATTEMPT',
      hour: trainingHour,
      timestamp: new Date(`2026-09-0${i}T0${trainingHour}:15:00.000Z`),
      ipAddress: '103.21.244.10',
      deviceId: 'laptop_rohit_dell_xps',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      failedAttempts: 0,
      isSuccess: true,
      dataTransferMb: 14.5
    });
  }

  const trainedBaseline = await getUserBaseline(username);
  console.log(`\n   Learned Profile Summary:`);
  console.log(`   • Total Logins: ${trainedBaseline.totalLogins}`);
  console.log(`   • Known IPs: [${trainedBaseline.knownIps.join(', ')}]`);
  console.log(`   • Discovered Subnet Range: [${trainedBaseline.ipSubnets.join(', ')}]`);
  console.log(`   • Active Hourly Buckets: Hours [${trainedBaseline.hourlyFrequency.map((cnt, h) => (cnt > 0 ? `${h}:00 (${cnt}x)` : null)).filter(Boolean).join(', ')}]`);
  console.log(`   • Adapted Operating Hours: ${trainedBaseline.usualHours.start}:00 - ${trainedBaseline.usualHours.end}:00`);
  console.log('────────────────────────────────────────────────────────────────\n');

  // -------------------------------------------------------------
  // Test 3: Adaptive Anomaly Scoring (Same 2:00 AM event after training)
  // -------------------------------------------------------------
  console.log('📌 PHASE 3: Adaptive Scoring Evaluation (Post-Training)');
  const postTrainingEvent2am = {
    username,
    hour: 2,
    loginHour: 2,
    ipAddress: '103.21.244.10',
    deviceId: 'laptop_rohit_dell_xps',
    failedLoginCount: 0,
    userBaseline: trainedBaseline
  };

  const adaptedScore = calculateAnomalyScore(postTrainingEvent2am);
  console.log(`   >>> 2:00 AM Login Score AFTER Training: ${adaptedScore.anomalyScore} / 100  (Reduced from ${coldScore.anomalyScore}/100!)`);
  console.log('   Factors:');
  adaptedScore.factors.forEach((f) => console.log(`     • ${f}`));
  console.log('────────────────────────────────────────────────────────────────\n');

  // -------------------------------------------------------------
  // Test 4: Subnet-Aware IP Migration (/24 Subnet Match vs Foreign IP)
  // -------------------------------------------------------------
  console.log('📌 PHASE 4: Subnet-Aware IP Deviation Analysis');

  // Case A: DHCP renewal / same ISP subnet (103.21.244.55 vs baseline 103.21.244.10)
  const subnetShiftEvent = {
    username,
    hour: 2,
    loginHour: 2,
    ipAddress: '103.21.244.55', // Different IP, but same /24 subnet!
    deviceId: 'laptop_rohit_dell_xps',
    failedLoginCount: 0,
    userBaseline: trainedBaseline
  };

  const subnetScore = calculateAnomalyScore(subnetShiftEvent);
  console.log(`   Case A: Same /24 Subnet Transition (IP: 103.21.244.55 in subnet ${extractSubnet('103.21.244.55')})`);
  console.log(`   • Anomaly Score: ${subnetScore.anomalyScore} / 100`);
  console.log(`   • Subnet Factors:`);
  subnetScore.factors.forEach((f) => console.log(`       - ${f}`));

  // Case B: Alien IP (185.220.101.5 Tor Exit Node)
  const foreignIpEvent = {
    username,
    hour: 2,
    loginHour: 2,
    ipAddress: '185.220.101.5', // Completely foreign IP & subnet
    deviceId: 'laptop_rohit_dell_xps',
    failedLoginCount: 0,
    userBaseline: trainedBaseline
  };

  const foreignScore = calculateAnomalyScore(foreignIpEvent);
  console.log(`\n   Case B: Unrecognized External IP (IP: 185.220.101.5)`);
  console.log(`   • Anomaly Score: ${foreignScore.anomalyScore} / 100`);
  console.log(`   • Factors:`);
  foreignScore.factors.forEach((f) => console.log(`       - ${f}`));
  console.log('────────────────────────────────────────────────────────────────\n');

  // -------------------------------------------------------------
  // Test 5: Full End-to-End Detection Pipeline Execution
  // -------------------------------------------------------------
  console.log('📌 PHASE 5: End-to-End Pipeline Evaluation with Rolling Baseline');
  const pipelineOutput = runDetectionPipeline({
    username,
    eventType: 'LOGIN_ATTEMPT',
    timestamp: '2026-09-04T02:15:00.000Z',
    ipAddress: '103.21.244.10',
    deviceId: 'laptop_rohit_dell_xps',
    failedAttempts: 0,
    outboundBytes: 8500,
    filesAccessed: 2,
    requestRate: 14,
    unusualProcessActivity: false,
    userBaseline: trainedBaseline
  });

  console.log(`   Event ID:           ${pipelineOutput.event.eventId}`);
  console.log(`   Rule Engine Score:  ${pipelineOutput.ruleResult.ruleScore} / 100`);
  console.log(`   Anomaly ML Score:   ${pipelineOutput.anomalyResult.anomalyScore} / 100`);
  console.log(`   Final Risk Score:   ${pipelineOutput.riskResult.riskScore} / 100`);
  console.log(`   Severity Tier:      [ ${pipelineOutput.riskResult.severity} ]`);
  console.log(`   Synthesized Reasons:`);
  pipelineOutput.riskResult.reasons.forEach((r) => console.log(`     • ${r}`));
  console.log('================================================================\n');
};

// Auto-run if executed directly via node
if (process.argv[1]?.endsWith('demoUserBaseline.js')) {
  runUserBaselineDemos();
}

export default runUserBaselineDemos;
