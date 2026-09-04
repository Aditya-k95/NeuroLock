/**
 * Demo and Verification Suite for NeuroLock Escalation Service
 *
 * Demonstrates:
 * 1. SLA Timeout scanning on active high-risk alerts.
 * 2. Automated session isolation (autoBlock).
 * 3. Escalation WhatsApp alert dispatch without altering whatsappSender.js.
 * 4. Active quarantine checking and session unblocking.
 * 5. node-cron scheduled lifecycle management.
 */

import {
  autoBlock,
  isSessionBlocked,
  unblockSession,
  getBlockedSessions,
  checkAndEscalateAlerts,
  startEscalationScheduler,
  stopEscalationScheduler,
  getSchedulerStatus
} from './escalationService.js';

export const runEscalationServiceDemos = async () => {
  console.log('================================================================');
  console.log('⚡ NEUROLOCK AUTOMATED ESCALATION & AUTO-BLOCK SERVICE DEMO');
  console.log('================================================================\n');

  const now = Date.now();

  // Test scenarios: 5 sample alerts with different ages, risk scores, and statuses
  const testAlerts = [
    {
      id: 'ALT-1001',
      title: 'Brute-Force Credential Stuffing Burst',
      username: 'sarah.jenkins@fintech.in',
      severity: 'CRITICAL',
      riskScore: 94,
      status: 'ACTIVE',
      timestamp: new Date(now - 12 * 60 * 1000), // 12 minutes ago (OVERDUE)
      deviceId: 'dev_session_tok_kali_99',
      eventData: { sessionId: 'sess_sarah_jenkins_tok_9941' }
    },
    {
      id: 'ALT-1002',
      title: 'Outbound Database Exfiltration Dump',
      username: 'dev.intern@fintech-corp.in',
      severity: 'HIGH',
      riskScore: 78,
      status: 'ACTIVE',
      timestamp: new Date(now - 8 * 60 * 1000), // 8 minutes ago (OVERDUE)
      deviceId: 'dev_session_tok_curl_55',
      eventData: { sessionId: 'sess_intern_dump_tok_2210' }
    },
    {
      id: 'ALT-1003',
      title: 'Fresh Critical Threat Just Detected',
      username: 'finance.lead@fintech-corp.in',
      severity: 'CRITICAL',
      riskScore: 98,
      status: 'ACTIVE',
      timestamp: new Date(now - 1 * 60 * 1000), // 1 minute ago (NOT YET OVERDUE)
      deviceId: 'dev_session_tok_tor_11',
      eventData: { sessionId: 'sess_finance_tok_fresh_01' }
    },
    {
      id: 'ALT-1004',
      title: 'Normal Operational Activity',
      username: 'analyst@fintech.in',
      severity: 'LOW',
      riskScore: 12,
      status: 'ACTIVE',
      timestamp: new Date(now - 20 * 60 * 1000), // 20 minutes ago (LOW RISK)
      deviceId: 'dev_corp_macbook_88',
      eventData: { sessionId: 'sess_analyst_low_risk_44' }
    },
    {
      id: 'ALT-1005',
      title: 'Resolved Security Threat',
      username: 'admin@fintech.in',
      severity: 'CRITICAL',
      riskScore: 90,
      status: 'RESOLVED', // Already handled by human operator
      timestamp: new Date(now - 15 * 60 * 1000),
      deviceId: 'dev_admin_laptop_01',
      eventData: { sessionId: 'sess_admin_resolved_33' }
    }
  ];

  console.log('📌 PHASE 1: Scanning Active Alerts with 5-Minute SLA Policy');
  console.log('   Config: timeoutMinutes = 5, highRiskThreshold = 60\n');

  const escalationResult = await checkAndEscalateAlerts(
    { timeoutMinutes: 5, highRiskThreshold: 60, escalateToWhatsApp: true },
    testAlerts
  );

  console.log(`\n   >>> Total Escalated Alerts: ${escalationResult.escalatedCount}`);
  escalationResult.actionsTriggered.forEach((action) => {
    console.log(`   • [AUTO-BLOCK EXECUTED] Alert ID: ${action.alertId}`);
    console.log(`     Quarantined Session: "${action.sessionId}"`);
    console.log(`     WhatsApp Dispatch ID: "${action.whatsappResult?.messageId}"`);
  });
  console.log('────────────────────────────────────────────────────────────────\n');

  console.log('📌 PHASE 2: Verifying Session Quarantine & Security State');
  console.log(`   • Is session 'sess_sarah_jenkins_tok_9941' blocked? -> ${isSessionBlocked('sess_sarah_jenkins_tok_9941') ? '🔒 YES (BLOCKED)' : '❌ NO'}`);
  console.log(`   • Is session 'sess_intern_dump_tok_2210' blocked?   -> ${isSessionBlocked('sess_intern_dump_tok_2210') ? '🔒 YES (BLOCKED)' : '❌ NO'}`);
  console.log(`   • Is fresh session 'sess_finance_tok_fresh_01' blocked? -> ${isSessionBlocked('sess_finance_tok_fresh_01') ? '🔒 YES' : '✅ NO (Awaiting SLA)'}`);
  console.log(`   • Is resolved session 'sess_admin_resolved_33' blocked? -> ${isSessionBlocked('sess_admin_resolved_33') ? '🔒 YES' : '✅ NO (Already Handled)'}`);

  const activeBlocked = getBlockedSessions();
  console.log(`\n   Current Active Blocklist (${activeBlocked.length} sessions):`);
  activeBlocked.forEach((s) => {
    console.log(`     🚫 [${s.sessionId}] User: ${s.context.username} (Risk: ${s.context.riskScore}) | Reason: ${s.reason}`);
  });
  console.log('────────────────────────────────────────────────────────────────\n');

  console.log('📌 PHASE 3: Testing Remediation & Session Unblocking');
  const unblockSuccess = unblockSession('sess_sarah_jenkins_tok_9941');
  console.log(`   • Unblock 'sess_sarah_jenkins_tok_9941' result: ${unblockSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`   • Is session 'sess_sarah_jenkins_tok_9941' still blocked? -> ${isSessionBlocked('sess_sarah_jenkins_tok_9941') ? '🔒 YES' : '✅ NO (UNLOCKED)'}`);
  console.log('────────────────────────────────────────────────────────────────\n');

  console.log('📌 PHASE 4: node-cron Scheduled Runner Lifecycle Verification');
  const scheduler = startEscalationScheduler('*/5 * * * *');
  const statusRunning = getSchedulerStatus();
  console.log(`   • Scheduler Running: ${statusRunning.isRunning ? '✅ ACTIVE' : '❌ INACTIVE'}`);

  stopEscalationScheduler();
  const statusStopped = getSchedulerStatus();
  console.log(`   • Scheduler After Stop: ${!statusStopped.isRunning ? '⏹️ STOPPED CLEANLY' : '❌ STILL RUNNING'}`);
  console.log('================================================================\n');
};

// Auto-run when executed directly via node
if (process.argv[1]?.endsWith('demoEscalationService.js')) {
  runEscalationServiceDemos();
}

export default runEscalationServiceDemos;
