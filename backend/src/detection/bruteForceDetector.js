/**
 * NeuroLock Brute-Force & Credential Attack Detector
 *
 * Specializes in detecting rapid bursts of failed authentication attempts,
 * distributed password spraying, and high-velocity credential guessing.
 */

export const DEFAULT_BRUTE_FORCE_CONFIG = {
  maxAllowedFailedAttempts: 4, // 5 or more failed attempts triggers the rule
  timeWindowSeconds: 60, // Evaluation window in seconds
  baseScore: 40, // Base risk score contribution
  criticalAttemptsThreshold: 10, // Escalates risk score if 10+ failed attempts occur
  criticalScore: 60,
  sprayThresholdAccounts: 3 // Multiple accounts targeted from same IP
};

/**
 * Calculates attempt burst velocity (attempts per second).
 *
 * @param {number} attempts - Number of failed attempts
 * @param {number} windowSeconds - Duration of the observation window
 * @returns {number} Attempts per second
 */
export const calculateBurstVelocity = (attempts = 0, windowSeconds = 60) => {
  const safeWindow = Math.max(1, Number(windowSeconds) || 60);
  const safeAttempts = Math.max(0, Number(attempts) || 0);
  return Number((safeAttempts / safeWindow).toFixed(2));
};

/**
 * Checks for rapid failed login bursts and brute-force patterns.
 *
 * @param {Object} event - Security event payload
 * @param {Object} [config] - Config overrides
 * @returns {{triggered: boolean, ruleId: string, score: number, reason?: string, details?: Object}}
 */
export const checkBruteForce = (event = {}, config = DEFAULT_BRUTE_FORCE_CONFIG) => {
  const attempts = Math.max(
    0,
    Number(
      event.failedAttempts ??
      event.failedLoginCount ??
      event.attempts ??
      event.eventData?.attempts ??
      0
    )
  );

  const windowSec = Math.max(
    1,
    Number(
      event.timeWindowSeconds ??
      event.timeDeltaSeconds ??
      event.windowSeconds ??
      event.eventData?.timeWindowSeconds ??
      config.timeWindowSeconds
    )
  );

  const velocity = calculateBurstVelocity(attempts, windowSec);

  if (attempts > config.maxAllowedFailedAttempts && windowSec <= config.timeWindowSeconds) {
    const isCritical = attempts >= config.criticalAttemptsThreshold;
    const score = isCritical ? config.criticalScore : config.baseScore;

    return {
      triggered: true,
      ruleId: 'BRUTE_FORCE_ATTACK',
      score,
      reason: `Detected ${attempts} failed login attempts within ${windowSec}s (${velocity} attempts/sec). Exceeds threshold of ${config.maxAllowedFailedAttempts + 1} attempts.`,
      details: {
        attempts,
        windowSeconds: windowSec,
        velocity,
        isCritical
      }
    };
  }

  return { triggered: false, score: 0 };
};

/**
 * Checks for password spraying attacks (single IP targeting multiple usernames).
 *
 * @param {Object} event - Security event payload
 * @param {Object} [config] - Config overrides
 * @returns {{triggered: boolean, ruleId: string, score: number, reason?: string}}
 */
export const checkPasswordSpray = (event = {}, config = DEFAULT_BRUTE_FORCE_CONFIG) => {
  const targetedAccounts = Array.isArray(event.targetedUsernames || event.eventData?.targetedUsernames)
    ? (event.targetedUsernames || event.eventData?.targetedUsernames).length
    : (event.targetedAccountsCount || event.eventData?.targetedAccountsCount || 0);

  if (targetedAccounts >= config.sprayThresholdAccounts) {
    return {
      triggered: true,
      ruleId: 'PASSWORD_SPRAY_ATTACK',
      score: 55,
      reason: `Distributed password spray pattern detected: IP targeted ${targetedAccounts} distinct accounts concurrently.`
    };
  }

  return { triggered: false, score: 0 };
};

export default {
  DEFAULT_BRUTE_FORCE_CONFIG,
  calculateBurstVelocity,
  checkBruteForce,
  checkPasswordSpray
};
