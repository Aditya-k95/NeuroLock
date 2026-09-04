/**
 * NeuroLock Data Exfiltration & Traffic Spike Detector
 *
 * Specializes in detecting anomalous outbound network bandwidth, massive database dumps,
 * and high-volume data exfiltration vectors.
 */

export const DEFAULT_EXFIL_CONFIG = {
  warningThresholdBytes: 100 * 1024 * 1024, // 100 MB
  criticalThresholdBytes: 500 * 1024 * 1024, // 500 MB
  warningScore: 30,
  criticalScore: 50,
  spikeMultiplierThreshold: 3.0, // 3x over user's typical baseline data volume
  minBytesForSpike: 25 * 1024 * 1024 // 25 MB minimum to qualify as significant spike
};

/**
 * Normalizes bytes volume from diverse event formats.
 *
 * @param {Object} event - Event payload
 * @returns {number} Outbound volume in bytes
 */
export const extractOutboundBytes = (event = {}) => {
  if (typeof event.outboundBytes === 'number') return event.outboundBytes;
  if (typeof event.bytesTransferred === 'number') return event.bytesTransferred;
  if (typeof event.dataTransferMb === 'number') return event.dataTransferMb * 1024 * 1024;
  if (typeof event.eventData?.outboundBytes === 'number') return event.eventData.outboundBytes;
  if (typeof event.eventData?.bytesTransferred === 'number') return event.eventData.bytesTransferred;
  if (typeof event.eventData?.dataTransferMb === 'number') return event.eventData.dataTransferMb * 1024 * 1024;
  return 0;
};

/**
 * Checks for abnormal outbound data volume and large-scale data exfiltration.
 *
 * @param {Object} event - Security event payload
 * @param {Object} [config] - Config overrides
 * @returns {{triggered: boolean, ruleId: string, score: number, reason?: string, details?: Object}}
 */
export const checkDataExfiltration = (event = {}, config = DEFAULT_EXFIL_CONFIG) => {
  const bytes = extractOutboundBytes(event);

  if (bytes >= config.criticalThresholdBytes) {
    const mb = (bytes / (1024 * 1024)).toFixed(1);
    return {
      triggered: true,
      ruleId: 'ABNORMAL_DATA_TRANSFER',
      score: config.criticalScore,
      reason: `Critical data transfer volume detected: ${mb} MB outbound (threshold: ${(config.criticalThresholdBytes / (1024 * 1024)).toFixed(0)} MB).`,
      details: {
        outboundBytes: bytes,
        outboundMb: Number(mb),
        severityTier: 'CRITICAL'
      }
    };
  }

  if (bytes >= config.warningThresholdBytes) {
    const mb = (bytes / (1024 * 1024)).toFixed(1);
    return {
      triggered: true,
      ruleId: 'ABNORMAL_DATA_TRANSFER',
      score: config.warningScore,
      reason: `Elevated data transfer volume detected: ${mb} MB outbound (threshold: ${(config.warningThresholdBytes / (1024 * 1024)).toFixed(0)} MB).`,
      details: {
        outboundBytes: bytes,
        outboundMb: Number(mb),
        severityTier: 'WARNING'
      }
    };
  }

  return { triggered: false, score: 0 };
};

/**
 * Checks for sudden relative traffic volume spikes relative to user historical baseline.
 *
 * @param {Object} event - Security event payload
 * @param {Object} [config] - Config overrides
 * @returns {{triggered: boolean, ruleId: string, score: number, reason?: string}}
 */
export const checkTrafficSpike = (event = {}, config = DEFAULT_EXFIL_CONFIG) => {
  const bytes = extractOutboundBytes(event);
  const avgMb = event.userBaseline?.dataTransferStats?.avgMb || event.userBaseline?.avgDataTransferMb || 0;
  const sampleCount = event.userBaseline?.dataTransferStats?.sampleCount || 0;

  if (sampleCount >= 3 && avgMb > 0 && bytes >= config.minBytesForSpike) {
    const currentMb = bytes / (1024 * 1024);
    const multiplier = currentMb / avgMb;

    if (multiplier >= config.spikeMultiplierThreshold) {
      return {
        triggered: true,
        ruleId: 'OUTBOUND_TRAFFIC_SPIKE',
        score: 35,
        reason: `Outbound traffic surge: ${currentMb.toFixed(1)} MB is ${multiplier.toFixed(1)}x higher than user's historical baseline average (${avgMb.toFixed(1)} MB).`
      };
    }
  }

  return { triggered: false, score: 0 };
};

export default {
  DEFAULT_EXFIL_CONFIG,
  extractOutboundBytes,
  checkDataExfiltration,
  checkTrafficSpike
};
