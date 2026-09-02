/**
 * NeuroLock LLM Plain-English Alert Explanation Engine
 *
 * ARCHITECTURAL SAFETY RULE:
 * The LLM does NOT perform threat detection or classification. Threat scoring,
 * rule evaluation, and anomaly metrics are calculated deterministically by ruleEngine.js,
 * anomalyScorer.js, and riskEngine.js.
 *
 * The LLM's sole responsibility is translating the already-detected telemetry and
 * threat indicators into concise, zero-jargon, executive-friendly plain-English summaries
 * and practical remediation steps for MSME business owners.
 */

import dotenv from 'dotenv';
dotenv.config();

/**
 * Deterministic fallback generator for when LLM API keys are not configured or network calls fail.
 * Ensures the prototype functions 100% reliably in hackathon/demo environments.
 */
function generateDeterministicFallback(threatContext) {
  const {
    threatType = 'SECURITY_ANOMALY',
    severity = 'HIGH',
    username = 'Employee Account',
    sourceIp = '',
    eventData = {}
  } = threatContext;

  switch (threatType) {
    case 'BRUTE_FORCE':
      return {
        title: 'Possible Password-Guessing Attack',
        explanation: `NeuroLock detected an unusually high number of failed login attempts targeting ${username} in a very short window. Because this pattern matches an automated bot trying to guess credentials, the activity was flagged.`,
        recommendedAction: 'Lock the account immediately, invalidate active sessions, and enforce a password reset with two-factor authentication.'
      };

    case 'ACCOUNT_COMPROMISE':
    case 'IMPOSSIBLE_TRAVEL':
      return {
        title: 'Impossible Travel / Stolen Session Warning',
        explanation: `A login was detected for ${username} from a distant location shortly after activity from their normal workplace. It is physically impossible to travel between these locations in that timeframe, suggesting someone else may have obtained their password or session cookie.`,
        recommendedAction: 'Trigger step-up biometric or MFA verification immediately and confirm with the employee whether they are currently traveling.'
      };

    case 'SUSPICIOUS_LOGIN':
    case 'DEVICE_FINGERPRINT':
      return {
        title: 'Unrecognized Off-Hours Login Attempt',
        explanation: `An authentication request was made for ${username} during late-night off-hours using an unfamiliar device and IP address that does not match their verified historical workplace baseline.`,
        recommendedAction: 'Contact the employee to verify whether this login was intentional and review unverified devices registered to their profile.'
      };

    case 'DATA_EXFILTRATION':
      return {
        title: 'Abnormal Bulk Data Transfer Detected',
        explanation: `An unusually large volume of files and outbound data was downloaded from ${username}'s account during off-hours, which deviates significantly from their normal daily data usage.`,
        recommendedAction: 'Temporarily restrict file export privileges, quarantine the client IP at your firewall, and inspect which files were accessed.'
      };

    case 'RANSOMWARE_LIKE_ACTIVITY':
      return {
        title: 'Urgent: Rapid File Encryption Pattern Detected',
        explanation: `An automated process is modifying and renaming hundreds of business documents on this workstation in rapid succession. This behavior strongly resembles active ransomware attempting to lock company files.`,
        recommendedAction: 'Immediately isolate and disconnect this workstation from the local network and Wi-Fi to halt file modification.'
      };

    case 'NORMAL_LOGIN':
      return {
        title: 'Normal Verified Authentication',
        explanation: `Standard login observed for ${username} during regular working hours from an authorized company device and trusted IP address.`,
        recommendedAction: 'No action required. Telemetry is within expected operational baseline.'
      };

    default:
      return {
        title: `Security Anomaly (${severity} Alert)`,
        explanation: `NeuroLock flagged unusual activity on ${username}'s account that deviated significantly from standard daily operational baselines.`,
        recommendedAction: 'Review the recent activity log with the employee and ensure multi-factor authentication is active.'
      };
  }
}

/**
 * Sanitize security telemetry for the LLM prompt.
 * Strips all sensitive credentials, passwords, auth tokens, session IDs, and raw hashes.
 */
function sanitizeTelemetryForPrompt(detectionResult) {
  const event = detectionResult.event || {};
  const riskResult = detectionResult.riskResult || {};
  const ruleResult = detectionResult.ruleResult || {};
  const anomalyResult = detectionResult.anomalyResult || {};

  const rawType =
    detectionResult.threatType ||
    detectionResult.alertType ||
    event.scenarioId ||
    event.eventType ||
    '';

  const typeMap = {
    BRUTE_FORCE: 'BRUTE_FORCE',
    AUTH_BRUTE_FORCE: 'BRUTE_FORCE',
    AUTH_BURST_FAILURE: 'BRUTE_FORCE',
    CREDENTIAL_STUFFING: 'BRUTE_FORCE',
    ACCOUNT_COMPROMISE: 'ACCOUNT_COMPROMISE',
    IMPOSSIBLE_TRAVEL: 'ACCOUNT_COMPROMISE',
    GEO_IMPOSSIBLE_TRAVEL: 'ACCOUNT_COMPROMISE',
    SUSPICIOUS_LOGIN: 'SUSPICIOUS_LOGIN',
    DEVICE_FINGERPRINT: 'SUSPICIOUS_LOGIN',
    DEVICE_DEVIATION: 'SUSPICIOUS_LOGIN',
    UNRECOGNIZED_USER_AGENT: 'SUSPICIOUS_LOGIN',
    DATA_EXFILTRATION: 'DATA_EXFILTRATION',
    DATA_EXFILTRATION_BURST: 'DATA_EXFILTRATION',
    RANSOMWARE_LIKE_ACTIVITY: 'RANSOMWARE_LIKE_ACTIVITY',
    BEHAVIORAL_ENCRYPTION_SPIKE: 'RANSOMWARE_LIKE_ACTIVITY',
    NORMAL_LOGIN: 'NORMAL_LOGIN'
  };

  const threatType = typeMap[rawType] || rawType || 'SECURITY_ANOMALY';

  return {
    threatType,
    severity: riskResult.severity || detectionResult.severity || 'HIGH',
    riskScore: riskResult.riskScore ?? detectionResult.riskScore ?? 70,
    ruleScore: ruleResult.ruleScore ?? detectionResult.ruleScore ?? 50,
    anomalyScore: anomalyResult.anomalyScore ?? detectionResult.anomalyScore ?? 50,
    username: event.username || detectionResult.username || 'user@company.in',
    sourceIp: event.sourceIp || event.ipAddress || detectionResult.sourceIp || 'Unrecognized IP',
    city: event.eventData?.city || '',
    country: event.eventData?.country || '',
    failedAttempts: event.failedAttempts || event.failedLoginCount || 0,
    timeWindowSeconds: event.timeWindowSeconds || 0,
    dataTransferMb: event.dataTransferMb || 0,
    filesAccessed: event.filesAccessed || 0,
    filesModified: event.eventData?.filesModified || 0,
    triggeredRules: ruleResult.triggeredRules || detectionResult.triggeredRules || [],
    reasons: riskResult.reasons || ruleResult.reasons || []
  };
}

/**
 * Call Gemini API with structured JSON output formatting
 */
async function callGeminiLLM(sanitizedContext, apiKey) {
  const prompt = `You are NeuroLock's Plain-English Cybersecurity Advisor for MSME business owners (like store owners, clinic managers, logistics operators).

THE THREAT HAS ALREADY BEEN DETECTED AND CONFIRMED BY THE SECURITY ENGINE:
- Threat Category: ${sanitizedContext.threatType}
- Assessed Severity: ${sanitizedContext.severity} (Risk Score: ${sanitizedContext.riskScore}/100)
- Target Account: ${sanitizedContext.username}
- Source Location: ${sanitizedContext.city ? sanitizedContext.city + ', ' : ''}${sanitizedContext.country || sanitizedContext.sourceIp}
- Triggered Rules: ${sanitizedContext.triggeredRules.join(', ') || 'Behavioral deviations'}
- Key Signals: ${sanitizedContext.reasons.join('; ')}
${sanitizedContext.failedAttempts ? `- Failed Login Attempts: ${sanitizedContext.failedAttempts} in ${sanitizedContext.timeWindowSeconds || 15}s` : ''}
${sanitizedContext.dataTransferMb ? `- Outbound Data: ${sanitizedContext.dataTransferMb} MB (${sanitizedContext.filesAccessed} files)` : ''}
${sanitizedContext.filesModified ? `- Files Modified Rapidly: ${sanitizedContext.filesModified}` : ''}

MISSION:
Translate this technical security incident into a zero-jargon, reassuring yet actionable explanation that any non-technical business owner can instantly understand.

STRICT RULES:
1. Do NOT evaluate whether this is an attack; the engine has already proven it.
2. DO NOT use technical jargon (avoid "heuristic threshold", "sliding window", "entropy", "CIDR", "regex").
3. DO NOT invent unmentioned facts or make wild speculations. Distinguish verified facts from context.
4. Keep the explanation to 2-3 clear, natural sentences.
5. Provide 1 concise, practical recommended action.

RETURN ONLY VALID RAW JSON IN THIS EXACT FORMAT (NO MARKDOWN WRAPPERS):
{
  "title": "Short title describing the threat (e.g. 'Possible Password-Guessing Attack')",
  "explanation": "Clear plain-English explanation of what happened and why it was flagged.",
  "recommendedAction": "1 clear, non-technical recommended step for the business owner."
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500); // 4.5s fast timeout

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: controller.signal,
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 350,
        responseMimeType: 'application/json'
      }
    })
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`Gemini API HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Empty response from Gemini LLM');
  }

  // Parse JSON response safely
  const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  if (!parsed.title || !parsed.explanation || !parsed.recommendedAction) {
    throw new Error('Incomplete JSON schema returned by LLM');
  }

  return {
    title: String(parsed.title).trim(),
    explanation: String(parsed.explanation).trim(),
    recommendedAction: String(parsed.recommendedAction).trim()
  };
}

/**
 * Main Export: Generate plain-English explanation for a detected security event
 *
 * @param {Object} detectionResult - Unified detection result from detectionPipeline.js or alert telemetry
 * @returns {Promise<{ title: string, explanation: string, recommendedAction: string }>}
 */
export async function generateAlertExplanation(detectionResult = {}) {
  const sanitizedContext = sanitizeTelemetryForPrompt(detectionResult);
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.LLM_API_KEY ||
    process.env.OPENAI_API_KEY;

  // If no API key is set, use the deterministic plain-English generator immediately
  if (!apiKey || apiKey.includes('your_') || apiKey === 'undefined') {
    return generateDeterministicFallback(sanitizedContext);
  }

  try {
    // Attempt LLM generation
    const llmOutput = await callGeminiLLM(sanitizedContext, apiKey);
    return llmOutput;
  } catch (error) {
    console.warn(
      `[LLM Alert Generator] LLM call bypassed (${error.message}). Using deterministic zero-jargon fallback.`
    );
    return generateDeterministicFallback(sanitizedContext);
  }
}

export default {
  generateAlertExplanation
};
