/**
 * Demo and Test Suite for NeuroLock Multi-Signal Risk Scoring
 *
 * Demonstrates multi-vector detection and generic event scoring across:
 * 1. Rapid Failed-Login Burst Attack (14 failed attempts / 20s)
 * 2. Mass File Access & Sensitive Credential Harvesting (.env, id_rsa, 150 files)
 * 3. Outbound Data Exfiltration Spike (750 MB outbound dump)
 * 4. Compound Multi-Signal APT Attack (Failed Logins + Sensitive File + Data Dump + Script)
 * 5. Clean Operational Telemetry (Normal generic event, zero false positives)
 */

import { calculateAnomalyScore } from './anomalyScorer.js';
import { evaluateRules } from './ruleEngine.js';
import { runDetectionPipeline } from './detectionPipeline.js';

export const runMultiSignalDemos = () => {
  console.log('================================================================');
  console.log('🎯 NEUROLOCK MULTI-SIGNAL RISK SCORING DEMO');
  console.log('================================================================\n');

  const testScenarios = [
    // Scenario 1: Failed Login Burst
    {
      title: '1. Failed Login Burst Attack (Credential Guessing / Brute-Force)',
      event: {
        eventType: 'LOGIN_ATTEMPT',
        username: 'admin@fintech-corp.in',
        timestamp: '2026-09-04T11:20:00.000Z',
        ipAddress: '185.220.101.5', // Tor exit node
        deviceId: 'unrecognized_kali_client_01',
        failedAttempts: 14,
        timeWindowSeconds: 20,
        requestRate: 420,
        unusualProcessActivity: false,
        userBaseline: {
          knownIps: ['103.21.244.10'],
          knownDevices: ['corp_laptop_macbook_01'],
          usualHours: { start: 8, end: 20 }
        }
      }
    },

    // Scenario 2: Mass File Access & Sensitive Credential Harvesting
    {
      title: '2. Mass File Enumeration & Sensitive Credential Scraping',
      event: {
        eventType: 'FILE_ACCESS',
        username: 'dev.intern@fintech-corp.in',
        timestamp: '2026-09-04T14:10:00.000Z',
        ipAddress: '103.21.244.10',
        deviceId: 'corp_laptop_macbook_01',
        filesAccessed: 145, // 145 files
        accessedFiles: [
          '/var/www/app/src/index.js',
          '/var/www/app/.env',
          '/home/deploy/.ssh/id_rsa',
          '/var/www/config/secrets.json'
        ],
        outboundBytes: 45000,
        requestRate: 85,
        unusualProcessActivity: true, // script scraping files
        userBaseline: {
          knownIps: ['103.21.244.10'],
          knownDevices: ['corp_laptop_macbook_01'],
          usualHours: { start: 8, end: 20 }
        }
      }
    },

    // Scenario 3: Outbound Data Exfiltration Spike
    {
      title: '3. Outbound Data Exfiltration Spike (Massive Data Dump)',
      event: {
        eventType: 'DATA_TRANSFER',
        username: 'sarah.jenkins@fintech-corp.in',
        timestamp: '2026-09-04T16:30:00.000Z',
        ipAddress: '194.26.29.112', // Unknown external proxy
        deviceId: 'unknown_headless_curl_agent',
        outboundBytes: 750 * 1024 * 1024, // 750 MB!
        dataTransferMb: 750,
        filesAccessed: 12,
        requestRate: 310,
        unusualProcessActivity: true,
        userBaseline: {
          knownIps: ['103.21.244.10'],
          knownDevices: ['corp_laptop_macbook_01'],
          usualHours: { start: 8, end: 20 },
          dataTransferStats: { avgMb: 12.0, maxMb: 35.0, sampleCount: 15 }
        }
      }
    },

    // Scenario 4: Compound Multi-Signal APT Attack
    {
      title: '4. Compound Multi-Signal APT Attack (Burst + Credential Theft + Exfil + 3 AM)',
      event: {
        eventType: 'SECURITY_INCIDENT',
        username: 'finance.lead@fintech-corp.in',
        timestamp: '2026-09-04T03:15:00.000Z', // 3:15 AM
        ipAddress: '185.220.101.88',
        deviceId: 'headless_python_attack_framework',
        failedAttempts: 8,
        timeWindowSeconds: 25,
        filesAccessed: 180,
        accessedFiles: ['/etc/shadow', '/secrets/customer_cards.sql.gz', '/app/.env'],
        outboundBytes: 620 * 1024 * 1024, // 620 MB exfil
        requestRate: 480,
        unusualProcessActivity: true,
        userBaseline: {
          knownIps: ['103.21.244.10'],
          knownDevices: ['corp_laptop_macbook_01'],
          usualHours: { start: 8, end: 19 }
        }
      }
    },

    // Scenario 5: Clean Operational Baseline Event
    {
      title: '5. Clean Operational Activity (Standard Daytime Document Read)',
      event: {
        eventType: 'FILE_ACCESS',
        username: 'sarah.jenkins@fintech-corp.in',
        timestamp: '2026-09-04T11:00:00.000Z',
        ipAddress: '103.21.244.10',
        deviceId: 'corp_laptop_macbook_01',
        filesAccessed: 3,
        accessedFiles: ['/reports/monthly_kpi.pdf', '/docs/readme.md'],
        outboundBytes: 15000,
        requestRate: 15,
        unusualProcessActivity: false,
        userBaseline: {
          knownIps: ['103.21.244.10'],
          knownDevices: ['corp_laptop_macbook_01'],
          usualHours: { start: 8, end: 20 }
        }
      }
    }
  ];

  for (const scenario of testScenarios) {
    console.log(`📌 SCENARIO: ${scenario.title}`);
    const result = runDetectionPipeline(scenario.event);

    console.log(`   Event Type:         ${result.event.eventType}`);
    console.log(`   Rule Score:         ${result.ruleResult.ruleScore} / 100  (Suspicious: ${result.ruleResult.suspicious})`);
    console.log(`   Triggered Rules:    [ ${result.ruleResult.triggeredRules.join(', ') || 'None'} ]`);
    console.log(`   Anomaly ML Score:   ${result.anomalyResult.anomalyScore} / 100  (Confidence: ${(result.anomalyResult.confidence * 100).toFixed(0)}%)`);
    console.log(`   ─────────────────────────────────────────────────────────────`);
    console.log(`   FINAL RISK SCORE:   ${result.riskResult.riskScore} / 100`);
    console.log(`   SEVERITY TIER:      [ ${result.riskResult.severity} ]`);
    console.log(`   RECOMMENDED ACTION: "${result.riskResult.recommendedAction}"`);
    console.log(`   KEY REASONS / THREAT VECTORS:`);
    result.riskResult.reasons.forEach((r) => console.log(`     • ${r}`));
    console.log('================================================================\n');
  }
};

// Auto-run if executed directly via node
if (process.argv[1]?.endsWith('demoMultiSignalScoring.js')) {
  runMultiSignalDemos();
}

export default runMultiSignalDemos;
