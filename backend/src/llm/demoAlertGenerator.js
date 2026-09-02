import { generateAlertExplanation } from './alertGenerator.js';

async function testAlertGenerator() {
  console.log('================================================================');
  console.log('🛡️  NEUROLOCK LLM ALERT EXPLANATION ENGINE TEST');
  console.log('    (Zero-Jargon Plain-English Translation Verification)');
  console.log('================================================================');

  // Test 1: User request example (Brute Force)
  const test1 = {
    threatType: 'BRUTE_FORCE',
    severity: 'CRITICAL',
    riskScore: 92,
    ruleScore: 95,
    anomalyScore: 88,
    triggeredRules: ['High failed-login count', 'High request rate'],
    username: 'alex.williams@enterprise.in'
  };

  const res1 = await generateAlertExplanation(test1);
  console.log('\n[Scenario 1] BRUTE_FORCE');
  console.log('  Title:             ', res1.title);
  console.log('  Explanation:       ', res1.explanation);
  console.log('  Recommended Action:', res1.recommendedAction);

  // Test 2: Full Detection Pipeline Result (Ransomware)
  const test2 = {
    event: {
      scenarioId: 'RANSOMWARE_LIKE_ACTIVITY',
      username: 'finance.lead@bharatfin.in',
      eventData: { filesModified: 850, filesRenamed: 820 }
    },
    riskResult: {
      severity: 'CRITICAL',
      riskScore: 96,
      reasons: ['Ransomware behavioral heuristics triggered: 850 files modified']
    },
    ruleResult: {
      ruleScore: 100,
      triggeredRules: ['RANSOMWARE_BEHAVIOR_SPIKE']
    },
    anomalyResult: {
      anomalyScore: 71
    }
  };

  const res2 = await generateAlertExplanation(test2);
  console.log('\n[Scenario 2] RANSOMWARE_LIKE_ACTIVITY');
  console.log('  Title:             ', res2.title);
  console.log('  Explanation:       ', res2.explanation);
  console.log('  Recommended Action:', res2.recommendedAction);

  // Test 3: Account Compromise / Impossible Travel
  const test3 = {
    threatType: 'ACCOUNT_COMPROMISE',
    severity: 'HIGH',
    riskScore: 67,
    username: 'priya.sharma@fintech.in'
  };

  const res3 = await generateAlertExplanation(test3);
  console.log('\n[Scenario 3] ACCOUNT_COMPROMISE');
  console.log('  Title:             ', res3.title);
  console.log('  Explanation:       ', res3.explanation);
  console.log('  Recommended Action:', res3.recommendedAction);

  // Test 4: Data Exfiltration
  const test4 = {
    threatType: 'DATA_EXFILTRATION',
    severity: 'CRITICAL',
    riskScore: 80,
    username: 'rahul.verma@defensecorp.in'
  };

  const res4 = await generateAlertExplanation(test4);
  console.log('\n[Scenario 4] DATA_EXFILTRATION');
  console.log('  Title:             ', res4.title);
  console.log('  Explanation:       ', res4.explanation);
  console.log('  Recommended Action:', res4.recommendedAction);

  console.log('\n================================================================');
  console.log('✅ All LLM explanation scenarios evaluated successfully!');
  console.log('================================================================\n');
}

testAlertGenerator();
