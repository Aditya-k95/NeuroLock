/**
 * NeuroLock File Access & Credential Harvesting Detector
 *
 * Specializes in detecting mass file enumeration, directory harvesting,
 * and unauthorized access attempts on sensitive configuration, secret, or key files.
 */

export const DEFAULT_FILE_ACCESS_CONFIG = {
  warningThresholdFiles: 20, // 20+ files in single burst
  criticalThresholdFiles: 100, // 100+ files indicates automated crawler/dump
  warningScore: 25,
  criticalScore: 45,
  sensitiveFileScore: 50,
  sensitivePatterns: [
    '.env',
    'id_rsa',
    'id_ed25519',
    '.pem',
    '.key',
    'credentials.json',
    'secrets.yaml',
    'secrets.json',
    '/etc/shadow',
    '/etc/passwd',
    'master.key',
    'service-account.json',
    '.git/config',
    'wp-config.php',
    'database.sqlite',
    'backup.sql'
  ]
};

/**
 * Extracts accessed files count from generic event payloads.
 *
 * @param {Object} event - Event payload
 * @returns {number} Count of accessed files
 */
export const extractFilesAccessedCount = (event = {}) => {
  if (typeof event.filesAccessed === 'number') return event.filesAccessed;
  if (typeof event.fileCount === 'number') return event.fileCount;
  if (Array.isArray(event.accessedFiles)) return event.accessedFiles.length;
  if (Array.isArray(event.files)) return event.files.length;
  if (typeof event.eventData?.filesAccessed === 'number') return event.eventData.filesAccessed;
  if (typeof event.eventData?.fileCount === 'number') return event.eventData.fileCount;
  if (Array.isArray(event.eventData?.accessedFiles)) return event.eventData.accessedFiles.length;
  return 0;
};

/**
 * Checks for mass file enumeration or rapid directory scraping.
 *
 * @param {Object} event - Security event payload
 * @param {Object} [config] - Config overrides
 * @returns {{triggered: boolean, ruleId: string, score: number, reason?: string, details?: Object}}
 */
export const checkUnusualFileAccess = (event = {}, config = DEFAULT_FILE_ACCESS_CONFIG) => {
  const count = extractFilesAccessedCount(event);

  if (count >= config.criticalThresholdFiles) {
    return {
      triggered: true,
      ruleId: 'MASS_FILE_ACCESS',
      score: config.criticalScore,
      reason: `Critical mass file access burst: ${count} files accessed in rapid succession (threshold: ${config.criticalThresholdFiles} files).`,
      details: {
        fileCount: count,
        severityTier: 'CRITICAL'
      }
    };
  }

  if (count >= config.warningThresholdFiles) {
    return {
      triggered: true,
      ruleId: 'MASS_FILE_ACCESS',
      score: config.warningScore,
      reason: `Elevated file access frequency: ${count} files accessed (threshold: ${config.warningThresholdFiles} files).`,
      details: {
        fileCount: count,
        severityTier: 'WARNING'
      }
    };
  }

  return { triggered: false, score: 0 };
};

/**
 * Checks for access to sensitive credential, key, or secret configuration files.
 *
 * @param {Object} event - Security event payload
 * @param {Object} [config] - Config overrides
 * @returns {{triggered: boolean, ruleId: string, score: number, reason?: string, details?: Object}}
 */
export const checkSensitiveFileAccess = (event = {}, config = DEFAULT_FILE_ACCESS_CONFIG) => {
  if (event.hasSensitiveFileAccess === true || event.eventData?.hasSensitiveFileAccess === true) {
    return {
      triggered: true,
      ruleId: 'SENSITIVE_FILE_ACCESS',
      score: config.sensitiveFileScore,
      reason: 'Unauthorized attempt to read sensitive system configuration or credential vault files.'
    };
  }

  const fileList = [];
  if (typeof event.filePath === 'string') fileList.push(event.filePath);
  if (typeof event.targetFile === 'string') fileList.push(event.targetFile);
  if (typeof event.file === 'string') fileList.push(event.file);
  if (Array.isArray(event.accessedFiles)) fileList.push(...event.accessedFiles);
  if (Array.isArray(event.files)) fileList.push(...event.files);
  if (typeof event.eventData?.filePath === 'string') fileList.push(event.eventData.filePath);
  if (Array.isArray(event.eventData?.accessedFiles)) fileList.push(...event.eventData.accessedFiles);

  const matchedSensitiveFiles = [];

  for (const file of fileList) {
    if (typeof file === 'string') {
      const lower = file.toLowerCase();
      for (const pattern of config.sensitivePatterns) {
        if (lower.includes(pattern.toLowerCase())) {
          matchedSensitiveFiles.push(file);
          break;
        }
      }
    }
  }

  if (matchedSensitiveFiles.length > 0) {
    const sample = matchedSensitiveFiles.slice(0, 3).join(', ');
    return {
      triggered: true,
      ruleId: 'SENSITIVE_FILE_ACCESS',
      score: config.sensitiveFileScore,
      reason: `Suspicious access to sensitive credential/configuration files detected: [${sample}].`,
      details: {
        matchedFiles: matchedSensitiveFiles,
        matchCount: matchedSensitiveFiles.length
      }
    };
  }

  return { triggered: false, score: 0 };
};

export default {
  DEFAULT_FILE_ACCESS_CONFIG,
  extractFilesAccessedCount,
  checkUnusualFileAccess,
  checkSensitiveFileAccess
};
