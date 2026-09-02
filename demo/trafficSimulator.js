/**
 * NeuroLock Cybersecurity Attack & Traffic Simulator
 *
 * SAFETY DECLARATION:
 * -------------------
 * This module is STRICTLY A BENCHMARK & DEMO TELEMETRY SIMULATOR.
 * - It generates purely synthetic in-memory JSON security events.
 * - It does NOT perform real attacks.
 * - It does NOT scan networks.
 * - It does NOT execute malware or destructive binaries.
 * - It does NOT modify filesystem files or make unauthorized requests.
 *
 * Scenarios Supported:
 * 1. NORMAL_LOGIN               - Clean baseline employee authentication
 * 2. BRUTE_FORCE                - Rapid credential-stuffing password spray
 * 3. SUSPICIOUS_LOGIN           - Off-hours access from unfamiliar proxy/location
 * 4. ACCOUNT_COMPROMISE         - Impossible travel velocity & token mismatch
 * 5. DATA_EXFILTRATION          - Massive unauthorized outbound data transfer
 * 6. RANSOMWARE_LIKE_ACTIVITY   - Rapid file modifications, encryption & renaming spikes
 */

import { runDetectionPipeline } from '../backend/src/detection/detectionPipeline.js';

// Standard mock employee baselines
export const MOCK_BASELINES = {
  sarah: {
    username: 'sarah.jenkins@fintech.in',
    knownIps: ['103.21.244.10', '103.21.244.11'],
    knownDevices: ['dev_macbook_pro_m3_sarah_01'],
    usualHours: { start: 8, end: 19 }
  },
  admin: {
    username: 'admin@bharatmsme.in',
    knownIps: ['103.21.244.10'],
    knownDevices: ['dev_thinkpad_x1_admin_01'],
    usualHours: { start: 9, end: 18 }
  },
  finance: {
    username: 'finance.lead@bharatfin.in',
    knownIps: ['103.21.244.10', '103.21.244.50'],
    knownDevices: ['dev_dell_workstation_finance_04'],
    usualHours: { start: 8, end: 20 }
  }
};

/**
 * Scenario Generators Registry
 */
export const SCENARIO_GENERATORS = {
  /**
   * 1. NORMAL_LOGIN:
   * Legitimate daytime login from a recognized company device and known office IP.
   */
  NORMAL_LOGIN: (overrides = {}) => {
    const baseline = MOCK_BASELINES.sarah;
    return {
      scenarioId: 'NORMAL_LOGIN',
      scenarioName: 'Legitimate Employee Morning Login',
      description: 'Standard authentication during normal working hours from a verified corporate laptop and office Wi-Fi.',
      eventId: `sim_norm_${Date.now()}`,
      username: baseline.username,
      eventType: 'AUTH_LOGIN',
      timestamp: new Date().toISOString(),
      loginHour: 10, // 10:00 AM
      sourceIp: baseline.knownIps[0],
      ipAddress: baseline.knownIps[0],
      deviceId: baseline.knownDevices[0],
      failedAttempts: 0,
      failedLoginCount: 0,
      isNewIp: false,
      isNewDevice: false,
      requestRate: 14,
      dataTransferMb: 5.2,
      filesAccessed: 3,
      unusualProcessActivity: false,
      isSuccess: true,
      userBaseline: baseline,
      eventData: {
        authMethod: 'PASSWORD_PLUS_HARDWARE_FIDO',
        city: 'Mumbai',
        country: 'India',
        browser: 'Chrome 122 (macOS)'
      },
      ...overrides
    };
  },

  /**
   * 2. BRUTE_FORCE:
   * High-frequency automated password dictionary spray originating from an external proxy node.
   */
  BRUTE_FORCE: (overrides = {}) => {
    const baseline = MOCK_BASELINES.admin;
    return {
      scenarioId: 'BRUTE_FORCE',
      scenarioName: 'Automated Password Guessing Burst',
      description: 'Attacker bot running a rapid credential dictionary attack attempting 18 passwords in 15 seconds.',
      eventId: `sim_brute_${Date.now()}`,
      username: baseline.username,
      eventType: 'AUTH_BRUTE_FORCE',
      timestamp: new Date().toISOString(),
      loginHour: 14, // 02:00 PM
      sourceIp: '185.220.101.5', // Foreign Tor exit node
      ipAddress: '185.220.101.5',
      deviceId: 'dev_headless_curl_bot_v2',
      failedAttempts: 18,
      failedLoginCount: 18,
      timeWindowSeconds: 15,
      isNewIp: true,
      isNewDevice: true,
      requestRate: 480, // 480 requests/min
      dataTransferMb: 12.0,
      filesAccessed: 0,
      unusualProcessActivity: true,
      isSuccess: false,
      userBaseline: baseline,
      eventData: {
        attackType: 'CREDENTIAL_DICTIONARY_SPRAY',
        asn: 'AS14061 (Tor Node)',
        city: 'Frankfurt',
        country: 'Germany',
        httpStatusCode: 401
      },
      ...overrides
    };
  },

  /**
   * 3. SUSPICIOUS_LOGIN:
   * Off-hours authentication attempt at 03:00 AM from an unknown residential proxy.
   */
  SUSPICIOUS_LOGIN: (overrides = {}) => {
    const baseline = MOCK_BASELINES.sarah;
    return {
      scenarioId: 'SUSPICIOUS_LOGIN',
      scenarioName: 'Unrecognized Off-Hours Login Attempt',
      description: 'Login attempt occurring at 3:30 AM from an unknown IP subnet and unverified browser profile.',
      eventId: `sim_susp_${Date.now()}`,
      username: baseline.username,
      eventType: 'AUTH_SUSPICIOUS',
      timestamp: new Date().toISOString(),
      loginHour: 3, // 03:00 AM (off-hours)
      sourceIp: '194.26.29.112', // Unknown IP
      ipAddress: '194.26.29.112',
      deviceId: 'dev_unknown_firefox_linux_89',
      failedAttempts: 2,
      failedLoginCount: 2,
      timeWindowSeconds: 60,
      isNewIp: true,
      isNewDevice: true,
      requestRate: 28,
      dataTransferMb: 9.5,
      filesAccessed: 6,
      unusualProcessActivity: false,
      isSuccess: true,
      userBaseline: baseline,
      eventData: {
        city: 'Bucharest',
        country: 'Romania',
        mfaPrompted: false,
        clientTlsFingerprint: 'tls_ja3_unfamiliar'
      },
      ...overrides
    };
  },

  /**
   * 4. ACCOUNT_COMPROMISE:
   * Impossible physical travel velocity anomaly and session hijacking token discrepancy.
   */
  ACCOUNT_COMPROMISE: (overrides = {}) => {
    const baseline = MOCK_BASELINES.sarah;
    return {
      scenarioId: 'ACCOUNT_COMPROMISE',
      scenarioName: 'Impossible Travel & Stolen Session Token',
      description: 'User authenticated from Mumbai, then 12 minutes later logged in from Frankfurt (36,000 km/h).',
      eventId: `sim_ato_${Date.now()}`,
      username: baseline.username,
      eventType: 'ACCOUNT_TAKEOVER',
      timestamp: new Date().toISOString(),
      loginHour: 4, // 04:00 AM
      sourceIp: '82.102.23.4',
      ipAddress: '82.102.23.4',
      deviceId: 'dev_spoofed_session_agent_99',
      failedAttempts: 1,
      failedLoginCount: 1,
      isNewIp: true,
      isNewDevice: true,
      requestRate: 190,
      dataTransferMb: 45.0,
      filesAccessed: 28,
      unusualProcessActivity: true,
      isSuccess: true,
      userBaseline: baseline,
      eventData: {
        anomaly: 'IMPOSSIBLE_TRAVEL_VELOCITY',
        originCity: 'Mumbai, India',
        destinationCity: 'Frankfurt, Germany',
        distanceKm: 6570,
        timeDeltaMinutes: 12,
        calculatedSpeedKmH: 32850
      },
      ...overrides
    };
  },

  /**
   * 5. DATA_EXFILTRATION:
   * Massive outbound byte dump and rapid file downloads during early morning hours.
   */
  DATA_EXFILTRATION: (overrides = {}) => {
    const baseline = MOCK_BASELINES.admin;
    return {
      scenarioId: 'DATA_EXFILTRATION',
      scenarioName: 'Bulk Data Exfiltration & Database Dump',
      description: 'Over 680 MB of sensitive financial archives transferred to an unverified external destination server.',
      eventId: `sim_exfil_${Date.now()}`,
      username: baseline.username,
      eventType: 'DATA_EXPORT_ANOMALY',
      timestamp: new Date().toISOString(),
      loginHour: 2, // 02:00 AM
      sourceIp: baseline.knownIps[0],
      destinationIp: '45.33.32.156', // External drop server
      deviceId: baseline.knownDevices[0],
      failedAttempts: 0,
      failedLoginCount: 0,
      isNewIp: false,
      isNewDevice: false,
      dataTransferMb: 680.0, // 680 MB bulk dump
      outboundBytes: 680 * 1024 * 1024,
      filesAccessed: 340, // 340 sensitive documents accessed
      requestRate: 380,
      unusualProcessActivity: true,
      isSuccess: true,
      userBaseline: baseline,
      eventData: {
        transferProtocol: 'HTTPS_ENCRYPTED_POST',
        targetDataset: 'msme_customer_payroll_q3_2026.tar.gz',
        destinationHost: 'external-drop-vps.cloud'
      },
      ...overrides
    };
  },

  /**
   * 6. RANSOMWARE_LIKE_ACTIVITY:
   * High-entropy bulk file modifications, rapid renaming to .locked extensions, and process spawning.
   */
  RANSOMWARE_LIKE_ACTIVITY: (overrides = {}) => {
    const baseline = MOCK_BASELINES.finance;
    return {
      scenarioId: 'RANSOMWARE_LIKE_ACTIVITY',
      scenarioName: 'Rapid File Encryption & Renaming Wave',
      description: 'Automated script rapidly modifying and renaming hundreds of local documents with high entropy.',
      eventId: `sim_ransom_${Date.now()}`,
      username: baseline.username,
      eventType: 'BEHAVIORAL_ENCRYPTION_SPIKE',
      timestamp: new Date().toISOString(),
      loginHour: 1, // 01:00 AM
      sourceIp: baseline.knownIps[0],
      deviceId: baseline.knownDevices[0],
      failedAttempts: 0,
      failedLoginCount: 0,
      isNewIp: false,
      isNewDevice: false,
      dataTransferMb: 350.0,
      filesAccessed: 850,
      requestRate: 520, // 520 file operations/min
      unusualProcessActivity: true,
      isSuccess: true,
      userBaseline: baseline,
      eventData: {
        filesModified: 850,
        filesRenamed: 820,
        renamedExtension: '.locked',
        highEntropyWrites: true,
        encryptionLikeActivity: true,
        spawnedProcess: 'powershell.exe -ExecutionPolicy Bypass -NoProfile',
        volumeShadowCopyDeletionAttempted: true
      },
      ...overrides
    };
  }
};

/**
 * Generates a synthetic security event for a given scenario type.
 *
 * @param {string} scenarioType - One of: NORMAL_LOGIN, BRUTE_FORCE, SUSPICIOUS_LOGIN, ACCOUNT_COMPROMISE, DATA_EXFILTRATION, RANSOMWARE_LIKE_ACTIVITY
 * @param {Object} [overrides={}] - Optional custom property overrides
 * @returns {Object} Structured synthetic security event
 */
export const generateScenarioEvent = (scenarioType = 'NORMAL_LOGIN', overrides = {}) => {
  const normalizedKey = String(scenarioType).trim().toUpperCase();
  const generator = SCENARIO_GENERATORS[normalizedKey];

  if (!generator) {
    throw new Error(
      `Unknown scenario '${scenarioType}'. Valid scenarios: ${Object.keys(SCENARIO_GENERATORS).join(', ')}`
    );
  }

  return generator(overrides);
};

/**
 * Generates a scenario event and runs it through the detection pipeline.
 *
 * @param {string} scenarioType
 * @param {Object} [overrides={}]
 * @returns {{ event: Object, detection: Object }}
 */
export const simulateAndDetect = (scenarioType, overrides = {}) => {
  const syntheticEvent = generateScenarioEvent(scenarioType, overrides);
  const detectionResult = runDetectionPipeline(syntheticEvent);

  return {
    scenario: syntheticEvent.scenarioId,
    scenarioName: syntheticEvent.scenarioName,
    description: syntheticEvent.description,
    event: syntheticEvent,
    detection: detectionResult
  };
};

/**
 * Standalone Demonstration Runner
 * Iterates through all 6 scenarios and logs formatted detection results.
 */
export const runAllScenariosDemo = () => {
  console.log('================================================================');
  console.log('🛡️  NEUROLOCK CYBERSECURITY ATTACK & TRAFFIC SIMULATOR');
  console.log('    (100% Synthetic Telemetry - Safe In-Memory Demonstration)');
  console.log('================================================================\n');

  const scenarios = Object.keys(SCENARIO_GENERATORS);

  scenarios.forEach((scenarioKey, idx) => {
    const result = simulateAndDetect(scenarioKey);
    const { detection } = result;

    console.log(`[#${idx + 1}] SCENARIO: ${result.scenarioName} (${scenarioKey})`);
    console.log(`    Description:        ${result.description}`);
    console.log(`    Target User:        ${result.event.username}`);
    console.log(`    Source IP:          ${result.event.sourceIp}`);
    console.log(`    ────────────────────────────────────────────────────────────`);
    console.log(`    Rule Engine Score:  ${detection.ruleResult.ruleScore} / 100`);
    console.log(`    Anomaly ML Score:   ${detection.anomalyResult.anomalyScore} / 100`);
    console.log(`    FINAL RISK SCORE:   ${detection.riskResult.riskScore} / 100`);
    console.log(`    SEVERITY VERDICT:   [ ${detection.riskResult.severity} ]`);
    console.log(`    RECOMMENDED ACTION: "${detection.riskResult.recommendedAction}"`);
    console.log(`    KEY REASONS:`);
    detection.riskResult.reasons.forEach((r) => console.log(`      • ${r}`));
    console.log('================================================================\n');
  });
};

// Auto-run if executed directly via node demo/trafficSimulator.js
if (process.argv[1]?.includes('trafficSimulator.js')) {
  runAllScenariosDemo();
}

export default {
  MOCK_BASELINES,
  SCENARIO_GENERATORS,
  generateScenarioEvent,
  simulateAndDetect,
  runAllScenariosDemo
};
