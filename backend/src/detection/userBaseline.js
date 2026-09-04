import mongoose from 'mongoose';
import UserBaseline from '../models/UserBaseline.js';

/**
 * In-memory baseline storage fallback.
 * Allows deterministic offline operation, unit testing, and resilience
 * when MongoDB is not connected or in standalone demo environments.
 */
const inMemoryBaselines = new Map();

/**
 * Extracts a CIDR subnet string from an IP address (/24 for IPv4, /64 for IPv6).
 *
 * @param {string} ip - IPv4 or IPv6 address string
 * @returns {string} Subnet string (e.g., '103.21.244.0/24')
 */
export const extractSubnet = (ip) => {
  if (!ip || typeof ip !== 'string') return '';
  const cleanIp = ip.trim();

  // IPv4 handling
  if (cleanIp.includes('.')) {
    const parts = cleanIp.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
    }
  }

  // IPv6 handling
  if (cleanIp.includes(':')) {
    const groups = cleanIp.split(':');
    if (groups.length >= 4) {
      return `${groups.slice(0, 4).join(':')}::/64`;
    }
  }

  return cleanIp;
};

/**
 * Checks if a given IP address belongs to the specified subnet.
 *
 * @param {string} ip - IP address to test
 * @param {string} subnet - CIDR subnet (e.g., '103.21.244.0/24')
 * @returns {boolean}
 */
export const isIpInSubnet = (ip, subnet) => {
  if (!ip || !subnet) return false;
  const ipSubnet = extractSubnet(ip);
  return ipSubnet.toLowerCase() === subnet.toLowerCase();
};

/**
 * Checks if a given IP address belongs to any of the provided subnet ranges.
 *
 * @param {string} ip - Target IP address
 * @param {Array<string>} knownSubnets - List of known CIDR subnets
 * @returns {boolean}
 */
export const isIpInKnownRanges = (ip, knownSubnets = []) => {
  if (!ip || !Array.isArray(knownSubnets) || knownSubnets.length === 0) return false;
  const targetSubnet = extractSubnet(ip);
  return knownSubnets.some((sub) => sub.toLowerCase() === targetSubnet.toLowerCase());
};

/**
 * Computes the typical operating hours window based on empirical 24h frequency.
 *
 * @param {Array<number>} hourlyFrequency - 24-element array of counts (0 to 23)
 * @returns {{start: number, end: number, activeHours: Array<number>}}
 */
export const computeTypicalHours = (hourlyFrequency = []) => {
  if (!Array.isArray(hourlyFrequency) || hourlyFrequency.length !== 24) {
    return { start: 6, end: 22, activeHours: [] };
  }

  const total = hourlyFrequency.reduce((sum, val) => sum + (Number(val) || 0), 0);
  if (total < 3) {
    // Insufficient statistical samples; retain standard business day window
    return { start: 6, end: 22, activeHours: [] };
  }

  // Active hours are hours with at least 10% of total activity or >= 2 logins
  const activeHours = [];
  hourlyFrequency.forEach((count, hour) => {
    if (count >= 2 || (total > 0 && count / total >= 0.08)) {
      activeHours.push(hour);
    }
  });

  if (activeHours.length === 0) {
    return { start: 6, end: 22, activeHours: [] };
  }

  const minHour = Math.min(...activeHours);
  const maxHour = Math.max(...activeHours);

  // Extend window by 1 hour buffer on each side bounded between 0 and 23
  return {
    start: Math.max(0, minHour - 1),
    end: Math.min(23, maxHour + 1),
    activeHours
  };
};

/**
 * Computes an hour anomaly score [0.0, 1.0] comparing against the user's historical distribution.
 *
 * @param {number} hour - Hour to test (0 to 23)
 * @param {Object} baseline - User baseline profile
 * @returns {number} Normalized hour anomaly (0.0 = normal habit, 1.0 = highly unusual)
 */
export const calculateHourAnomaly = (hour, baseline = {}) => {
  if (typeof hour !== 'number' || hour < 0 || hour > 23) return 0.0;

  const hourlyFrequency = baseline.typicalHours?.hourlyFrequency || baseline.hourlyFrequency;
  const totalLogins = baseline.totalLogins || baseline.totalEvents || 0;

  // If user has strong historical baseline (>= 3 events)
  if (Array.isArray(hourlyFrequency) && hourlyFrequency.length === 24 && totalLogins >= 3) {
    const hourCount = Number(hourlyFrequency[hour]) || 0;
    const maxHourCount = Math.max(...hourlyFrequency);

    if (hourCount > 0 && maxHourCount > 0) {
      // Relative frequency in user's profile: higher frequency => 0 anomaly
      const relativeFrequency = hourCount / maxHourCount;
      if (relativeFrequency >= 0.25) return 0.0;
      return Math.max(0, Number((0.5 * (1 - relativeFrequency)).toFixed(2)));
    }

    // Check distance to closest active hour in user's history
    const activeHours = [];
    hourlyFrequency.forEach((count, h) => {
      if (count > 0) activeHours.push(h);
    });

    if (activeHours.length > 0) {
      const distances = activeHours.map((h) => {
        const diff = Math.abs(hour - h);
        return Math.min(diff, 24 - diff); // Circular distance around 24h clock
      });
      const minDistance = Math.min(...distances);
      if (minDistance <= 1) return 0.2;
      if (minDistance <= 2) return 0.45;
      if (minDistance <= 4) return 0.75;
      return 1.0;
    }
  }

  // Fallback to start/end window if available
  const start = baseline.typicalHours?.start ?? baseline.usualHours?.start ?? 6;
  const end = baseline.typicalHours?.end ?? baseline.usualHours?.end ?? 22;

  if (hour >= start && hour <= end) {
    return 0.0;
  }

  // Deep night off-hours
  if ([1, 2, 3, 4].includes(hour)) {
    return 1.0;
  }

  return 0.7;
};

/**
 * Computes the IP & Subnet deviation metric [0.0, 1.0].
 *
 * @param {string} ip - IP address to test
 * @param {Object} baseline - User baseline profile
 * @returns {{deviation: number, matchType: 'EXACT_IP' | 'SUBNET_MATCH' | 'UNKNOWN'}}
 */
export const calculateIpDeviation = (ip, baseline = {}) => {
  if (!ip) return { deviation: 0.0, matchType: 'UNKNOWN' };

  const knownIps = [
    ...(baseline.knownIps || []),
    ...(baseline.ipProfiles ? baseline.ipProfiles.map((p) => p.ip) : [])
  ];

  if (knownIps.includes(ip)) {
    return { deviation: 0.0, matchType: 'EXACT_IP' };
  }

  const knownSubnets = [
    ...(baseline.ipSubnets || []),
    ...(baseline.ipProfiles ? baseline.ipProfiles.map((p) => p.subnet || extractSubnet(p.ip)) : []),
    ...(baseline.knownIps ? baseline.knownIps.map((kIp) => extractSubnet(kIp)) : [])
  ].filter(Boolean);

  if (isIpInKnownRanges(ip, knownSubnets)) {
    // Same /24 ISP or office subnet transition (e.g. DHCP renewal, intra-office change)
    return { deviation: 0.25, matchType: 'SUBNET_MATCH' };
  }

  return { deviation: 1.0, matchType: 'UNKNOWN' };
};

/**
 * Computes client device deviation metric [0.0, 1.0].
 *
 * @param {string} deviceId - Client device fingerprint ID
 * @param {Object} baseline - User baseline profile
 * @returns {{deviation: number, trustScore: number}}
 */
export const calculateDeviceDeviation = (deviceId, baseline = {}) => {
  if (!deviceId) return { deviation: 0.0, trustScore: 0.5 };

  const knownDevices = [
    ...(baseline.knownDevices || []),
    ...(baseline.deviceProfiles ? baseline.deviceProfiles.map((d) => d.deviceId) : [])
  ];

  if (knownDevices.includes(deviceId)) {
    const profile = baseline.deviceProfiles?.find((d) => d.deviceId === deviceId);
    const trustScore = profile?.trustScore ?? 0.9;
    return {
      deviation: Math.max(0, Number((1.0 - trustScore).toFixed(2))),
      trustScore
    };
  }

  return { deviation: 1.0, trustScore: 0.0 };
};

/**
 * Multi-vector behavioral baseline deviation analysis.
 * Analyzes event against the user's rolling profile across hours, subnets, and devices.
 *
 * @param {Object} event - Security event object
 * @param {Object} [baseline] - User baseline profile
 * @returns {{
 *   deviationScore: number,
 *   normDeviation: number,
 *   factors: Array<string>,
 *   metrics: { hourDeviation: number, ipDeviation: number, deviceDeviation: number, matchType: string }
 * }}
 */
export const evaluateBaselineDeviation = (event = {}, baseline = {}) => {
  const hour =
    typeof event.loginHour === 'number'
      ? event.loginHour
      : typeof event.hour === 'number'
      ? event.hour
      : event.timestamp
      ? new Date(event.timestamp).getUTCHours()
      : null;

  const ip = event.ipAddress || event.sourceIp || event.eventData?.ipAddress || '';
  const deviceId = event.deviceId || event.eventData?.deviceId || '';

  const hourDeviation = hour !== null ? calculateHourAnomaly(hour, baseline) : 0.0;
  const { deviation: ipDeviation, matchType } = calculateIpDeviation(ip, baseline);
  const { deviation: deviceDeviation, trustScore } = calculateDeviceDeviation(deviceId, baseline);

  const factors = [];

  if (hourDeviation >= 0.35) {
    factors.push(`Authentication hour (${hour}:00) deviates from user's empirical login history (deviation: ${(hourDeviation * 100).toFixed(0)}%)`);
  } else if (baseline.totalLogins >= 3 && hourDeviation === 0.0 && hour !== null) {
    factors.push(`Authentication matches user's habitual active hour profile (${hour}:00)`);
  }

  if (matchType === 'SUBNET_MATCH') {
    factors.push(`IP address (${ip}) matches user's known ISP subnet range (${extractSubnet(ip)}) [low deviation]`);
  } else if (matchType === 'UNKNOWN' && ip && (baseline.ipProfiles?.length > 0 || baseline.knownIps?.length > 0)) {
    factors.push(`Access originating from novel IP and unfamiliar subnet range (${ip})`);
  }

  if (deviceDeviation === 0.0 && deviceId) {
    factors.push(`Known trusted device verified (trust rating: ${(trustScore * 100).toFixed(0)}%)`);
  } else if (deviceDeviation > 0.5 && deviceId && (baseline.deviceProfiles?.length > 0 || baseline.knownDevices?.length > 0)) {
    factors.push(`Unfamiliar device fingerprint (${deviceId})`);
  }

  // Composite normalized behavioral deviation [0.0 to 1.0]
  // Weighted: 35% Hour history + 35% Subnet/IP habit + 30% Device trust
  const compositeNorm = Number((hourDeviation * 0.35 + ipDeviation * 0.35 + deviceDeviation * 0.30).toFixed(2));
  const deviationScore = Math.min(100, Math.max(0, Math.round(compositeNorm * 100)));

  return {
    deviationScore,
    normDeviation: compositeNorm,
    factors,
    metrics: {
      hourDeviation,
      ipDeviation,
      deviceDeviation,
      matchType,
      trustScore
    }
  };
};

/**
 * Formats a UserBaseline document/object into a standardized detection baseline.
 * Compatible with `ruleEngine.js`, `anomalyScorer.js`, and `riskEngine.js`.
 *
 * @param {Object} baselineDoc - Baseline profile document or object
 * @returns {Object}
 */
export const formatBaselineForScorer = (baselineDoc = {}) => {
  const doc = baselineDoc._doc || baselineDoc;

  const knownIps = [
    ...(doc.knownIps || []),
    ...(doc.ipProfiles ? doc.ipProfiles.map((p) => p.ip) : [])
  ];

  const knownDevices = [
    ...(doc.knownDevices || []),
    ...(doc.deviceProfiles ? doc.deviceProfiles.map((d) => d.deviceId) : [])
  ];

  const ipSubnets = [
    ...(doc.ipSubnets || []),
    ...(doc.ipProfiles ? doc.ipProfiles.map((p) => p.subnet || extractSubnet(p.ip)) : [])
  ].filter(Boolean);

  const usualHours = {
    start: doc.typicalHours?.start ?? doc.usualHours?.start ?? 6,
    end: doc.typicalHours?.end ?? doc.usualHours?.end ?? 22
  };

  return {
    username: doc.username || 'anonymous',
    totalLogins: doc.totalLogins || 0,
    totalEvents: doc.totalEvents || 0,
    knownIps: Array.from(new Set(knownIps)),
    knownDevices: Array.from(new Set(knownDevices)),
    ipSubnets: Array.from(new Set(ipSubnets)),
    usualHours,
    hourlyFrequency: doc.typicalHours?.hourlyFrequency || doc.hourlyFrequency || new Array(24).fill(0),
    dataTransferStats: doc.dataTransferStats || { avgMb: 0, maxMb: 0, sampleCount: 0 },
    rawBaseline: doc
  };
};

/**
 * Retrieves the rolling behavioral baseline profile for a user.
 * Queries MongoDB if connected, otherwise falls back to the in-memory cache.
 *
 * @param {string} username - Target username / email
 * @returns {Promise<Object>} Formatted user baseline
 */
export const getUserBaseline = async (username) => {
  const cleanUsername = String(username || 'anonymous').trim().toLowerCase();

  // 1. If MongoDB is connected, query DB
  if (mongoose.connection.readyState === 1) {
    try {
      const dbBaseline = await UserBaseline.findOne({ username: cleanUsername }).lean();
      if (dbBaseline) {
        return formatBaselineForScorer(dbBaseline);
      }
    } catch (err) {
      console.warn(`[UserBaseline] MongoDB query fallback for '${cleanUsername}':`, err.message);
    }
  }

  // 2. Check in-memory store
  if (inMemoryBaselines.has(cleanUsername)) {
    return formatBaselineForScorer(inMemoryBaselines.get(cleanUsername));
  }

  // 3. Return default cold-start profile
  return formatBaselineForScorer({
    username: cleanUsername,
    totalLogins: 0,
    totalEvents: 0,
    knownIps: [],
    knownDevices: [],
    ipSubnets: [],
    usualHours: { start: 6, end: 22 },
    hourlyFrequency: new Array(24).fill(0)
  });
};

/**
 * Updates a user's rolling behavioral baseline profile with new event telemetry.
 * Automatically adapts typical hours, IP subnets, device fingerprints, and data volume metrics.
 *
 * @param {string} username - User identifier
 * @param {Object} eventData - Security event telemetry
 * @returns {Promise<Object>} Updated baseline profile
 */
export const updateUserBaseline = async (username, eventData = {}) => {
  const cleanUsername = String(username || eventData.username || 'anonymous').trim().toLowerCase();
  const timestamp = eventData.timestamp ? new Date(eventData.timestamp) : new Date();
  const hour = typeof eventData.hour === 'number' ? eventData.hour : timestamp.getUTCHours();
  const ip = eventData.ipAddress || eventData.sourceIp || '';
  const subnet = ip ? extractSubnet(ip) : '';
  const deviceId = eventData.deviceId || '';
  const userAgent = eventData.userAgent || '';
  const isLogin = eventData.eventType === 'LOGIN_ATTEMPT' || eventData.isLogin || eventData.failedAttempts !== undefined;
  const isSuccess = Boolean(eventData.isSuccess ?? (eventData.failedAttempts === 0));
  const dataTransferMb = Number(eventData.dataTransferMb ?? (eventData.outboundBytes ? eventData.outboundBytes / (1024 * 1024) : 0)) || 0;

  // Retrieve existing baseline
  let baseline = null;

  if (mongoose.connection.readyState === 1) {
    try {
      baseline = await UserBaseline.findOne({ username: cleanUsername });
    } catch (err) {
      console.warn(`[UserBaseline] DB fetch error for '${cleanUsername}':`, err.message);
    }
  }

  if (!baseline && inMemoryBaselines.has(cleanUsername)) {
    baseline = inMemoryBaselines.get(cleanUsername);
  }

  // Create baseline structure if new
  if (!baseline) {
    baseline = {
      username: cleanUsername,
      totalLogins: 0,
      totalEvents: 0,
      typicalHours: {
        hourlyFrequency: new Array(24).fill(0),
        start: 6,
        end: 22,
        primaryTimezoneOffset: 0
      },
      ipProfiles: [],
      ipSubnets: [],
      deviceProfiles: [],
      dataTransferStats: { avgMb: 0, maxMb: 0, sampleCount: 0 },
      riskHistory: []
    };
  }

  // 1. Update event and login counts
  baseline.totalEvents = (baseline.totalEvents || 0) + 1;
  baseline.lastActiveAt = timestamp;

  if (isLogin && isSuccess) {
    baseline.totalLogins = (baseline.totalLogins || 0) + 1;
    baseline.lastLoginAt = timestamp;

    // 2. Update hourly frequency distribution
    if (hour >= 0 && hour <= 23) {
      if (!Array.isArray(baseline.typicalHours.hourlyFrequency) || baseline.typicalHours.hourlyFrequency.length !== 24) {
        baseline.typicalHours.hourlyFrequency = new Array(24).fill(0);
      }
      baseline.typicalHours.hourlyFrequency[hour] = (baseline.typicalHours.hourlyFrequency[hour] || 0) + 1;

      // Recompute rolling typical hours bounds
      const { start, end } = computeTypicalHours(baseline.typicalHours.hourlyFrequency);
      baseline.typicalHours.start = start;
      baseline.typicalHours.end = end;
    }

    // 3. Update IP Profiles and Subnets
    if (ip) {
      const existingIpIndex = baseline.ipProfiles.findIndex((p) => p.ip === ip);
      if (existingIpIndex >= 0) {
        baseline.ipProfiles[existingIpIndex].count += 1;
        baseline.ipProfiles[existingIpIndex].lastSeen = timestamp;
      } else {
        baseline.ipProfiles.push({
          ip,
          subnet,
          count: 1,
          firstSeen: timestamp,
          lastSeen: timestamp
        });
      }

      if (subnet && !baseline.ipSubnets.includes(subnet)) {
        baseline.ipSubnets.push(subnet);
      }
    }

    // 4. Update Device Profiles
    if (deviceId) {
      const existingDeviceIndex = baseline.deviceProfiles.findIndex((d) => d.deviceId === deviceId);
      if (existingDeviceIndex >= 0) {
        baseline.deviceProfiles[existingDeviceIndex].count += 1;
        baseline.deviceProfiles[existingDeviceIndex].lastSeen = timestamp;
        // Increment trust score with repeated successful logins up to 1.0
        const currentTrust = baseline.deviceProfiles[existingDeviceIndex].trustScore || 0.5;
        baseline.deviceProfiles[existingDeviceIndex].trustScore = Math.min(1.0, currentTrust + 0.1);
      } else {
        baseline.deviceProfiles.push({
          deviceId,
          userAgent,
          count: 1,
          firstSeen: timestamp,
          lastSeen: timestamp,
          trustScore: 0.5
        });
      }
    }
  }

  // 5. Update data transfer rolling statistics
  if (dataTransferMb > 0) {
    const stats = baseline.dataTransferStats || { avgMb: 0, maxMb: 0, sampleCount: 0 };
    const newCount = (stats.sampleCount || 0) + 1;
    const currentTotal = (stats.avgMb || 0) * (stats.sampleCount || 0);
    stats.avgMb = Number(((currentTotal + dataTransferMb) / newCount).toFixed(2));
    stats.maxMb = Math.max(stats.maxMb || 0, dataTransferMb);
    stats.sampleCount = newCount;
    baseline.dataTransferStats = stats;
  }

  // 6. Persist to MongoDB if available
  if (mongoose.connection.readyState === 1 && typeof baseline.save === 'function') {
    try {
      await baseline.save();
    } catch (err) {
      console.warn(`[UserBaseline] DB save error for '${cleanUsername}':`, err.message);
    }
  } else if (mongoose.connection.readyState === 1) {
    try {
      await UserBaseline.findOneAndUpdate(
        { username: cleanUsername },
        { $set: baseline },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.warn(`[UserBaseline] DB upsert error for '${cleanUsername}':`, err.message);
    }
  }

  // Update in-memory fallback
  inMemoryBaselines.set(cleanUsername, baseline);

  return formatBaselineForScorer(baseline);
};

export default {
  extractSubnet,
  isIpInSubnet,
  isIpInKnownRanges,
  computeTypicalHours,
  calculateHourAnomaly,
  calculateIpDeviation,
  calculateDeviceDeviation,
  evaluateBaselineDeviation,
  formatBaselineForScorer,
  getUserBaseline,
  updateUserBaseline
};
