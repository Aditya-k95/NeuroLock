import express from 'express';
import mongoose from 'mongoose';
import Alert from '../models/Alert.js';
import User from '../models/User.js';
import { runDetectionPipeline } from '../detection/detectionPipeline.js';
import { generateAlertExplanation } from '../llm/alertGenerator.js';
import { sendWhatsAppAlert } from '../services/whatsappSender.js';
import { generateScenarioEvent, SCENARIO_GENERATORS } from '../../../demo/trafficSimulator.js';

const router = express.Router();

/**
 * Middleware: Check Database Connection State
 */
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: 'Database connection is currently unavailable. Please verify that MongoDB is running.'
    });
  }
  next();
};

/**
 * @route   GET /api/health
 * @desc    Health-check endpoint returning service status and database state
 * @access  Public
 */
router.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(200).json({
    status: 'ok',
    service: 'NeuroLock Backend',
    timestamp: new Date().toISOString(),
    database: dbStatusMap[dbState] || 'unknown'
  });
});

/**
 * @route   GET /api/metrics
 * @desc    Get dashboard-level cybersecurity aggregate metrics and health score
 * @access  Public
 */
router.get('/metrics', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      // Graceful fallback when MongoDB is offline in standalone development mode
      return res.status(200).json({
        success: true,
        securityScore: 98,
        totalAlerts: 0,
        criticalAlerts: 0,
        highAlerts: 0,
        mediumAlerts: 0,
        lowAlerts: 0,
        activeAlerts: 0,
        status: 'standalone_mode'
      });
    }

    const [totalAlerts, activeAlerts, severityCounts] = await Promise.all([
      Alert.countDocuments(),
      Alert.countDocuments({ status: 'ACTIVE' }),
      Alert.aggregate([
        {
          $group: {
            _id: '$severity',
            count: { $sum: 1 },
            activeCount: {
              $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    const severityMap = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    const activeSeverityMap = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };

    severityCounts.forEach((item) => {
      if (severityMap[item._id] !== undefined) {
        severityMap[item._id] = item.count;
        activeSeverityMap[item._id] = item.activeCount;
      }
    });

    // Calculate dynamic security health score (100 baseline minus active penalties)
    const penalty =
      activeSeverityMap.CRITICAL * 15 +
      activeSeverityMap.HIGH * 8 +
      activeSeverityMap.MEDIUM * 3 +
      activeSeverityMap.LOW * 1;

    const securityScore = Math.max(10, Math.min(100, 100 - penalty));

    res.status(200).json({
      success: true,
      securityScore,
      totalAlerts,
      criticalAlerts: severityMap.CRITICAL,
      highAlerts: severityMap.HIGH,
      mediumAlerts: severityMap.MEDIUM,
      lowAlerts: severityMap.LOW,
      activeAlerts
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/alerts
 * @desc    Fetch security threat alerts with filtering and pagination
 * @access  Public
 * @query   status, severity, alertType, username, limit, page, sortBy, order
 */
router.get('/alerts', checkDbConnection, async (req, res, next) => {
  try {
    const {
      status,
      severity,
      alertType,
      username,
      limit = 50,
      page = 1,
      sortBy = 'timestamp',
      order = 'desc'
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = String(status).toUpperCase();
    }
    if (severity) {
      filter.severity = String(severity).toUpperCase();
    }
    if (alertType) {
      filter.alertType = String(alertType).toUpperCase();
    }
    if (username) {
      filter.username = { $regex: username, $options: 'i' };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Alert.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: alerts.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/alerts/:id
 * @desc    Fetch a single alert by its MongoDB ID
 * @access  Public
 */
router.get('/alerts/:id', checkDbConnection, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid alert ID format'
      });
    }

    const alert = await Alert.findById(id).lean();

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/alerts/:id/status
 * @desc    Update alert resolution status (ACTIVE, ACKNOWLEDGED, RESOLVED)
 * @access  Public
 */
router.patch('/alerts/:id/status', checkDbConnection, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid alert ID format'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: status'
      });
    }

    const formattedStatus = String(status).trim().toUpperCase();
    const validStatuses = ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'];

    if (!validStatuses.includes(formattedStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status '${status}'. Allowed values are: ${validStatuses.join(', ')}`
      });
    }

    const updatedAlert = await Alert.findByIdAndUpdate(
      id,
      { status: formattedStatus },
      { new: true, runValidators: true }
    );

    if (!updatedAlert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    // Broadcast status change via Socket.io if initialized
    const io = req.app.get('io');
    if (io) {
      io.emit('alert:updated', updatedAlert);
    }

    res.status(200).json({
      success: true,
      message: `Alert status updated to ${formattedStatus}`,
      data: updatedAlert
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/alerts
 * @desc    Create a new security threat alert
 * @access  Public
 */
router.post('/alerts', checkDbConnection, async (req, res, next) => {
  try {
    const alert = new Alert(req.body);
    const savedAlert = await alert.save();

    // Broadcast new alert event via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('new-alert', savedAlert);
      io.emit('alert:new', savedAlert);
    }

    // Automatically dispatch WhatsApp notification for HIGH and CRITICAL alerts
    if (savedAlert.severity === 'HIGH' || savedAlert.severity === 'CRITICAL') {
      sendWhatsAppAlert(savedAlert).catch((err) =>
        console.warn('[WhatsApp Alert Error]', err.message)
      );
    }

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: savedAlert
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    next(error);
  }
});

/**
 * Scenario Alias Mapper
 * Maps UI aliases to canonical scenario keys
 */
const mapAttackType = (rawType) => {
  if (!rawType) return null;
  const key = String(rawType).trim().toUpperCase();

  const aliasMap = {
    NORMAL_LOGIN: 'NORMAL_LOGIN',
    BRUTE_FORCE: 'BRUTE_FORCE',
    AUTH_BURST_FAILURE: 'BRUTE_FORCE',
    CREDENTIAL_STUFFING: 'BRUTE_FORCE',
    SUSPICIOUS_LOGIN: 'SUSPICIOUS_LOGIN',
    DEVICE_FINGERPRINT: 'SUSPICIOUS_LOGIN',
    DEVICE_DEVIATION: 'SUSPICIOUS_LOGIN',
    ACCOUNT_COMPROMISE: 'ACCOUNT_COMPROMISE',
    IMPOSSIBLE_TRAVEL: 'ACCOUNT_COMPROMISE',
    GEO_IMPOSSIBLE_TRAVEL: 'ACCOUNT_COMPROMISE',
    DATA_EXFILTRATION: 'DATA_EXFILTRATION',
    DATA_EXPORT: 'DATA_EXFILTRATION',
    RANSOMWARE_LIKE_ACTIVITY: 'RANSOMWARE_LIKE_ACTIVITY',
    RANSOMWARE: 'RANSOMWARE_LIKE_ACTIVITY'
  };

  return aliasMap[key] || (SCENARIO_GENERATORS[key] ? key : null);
};

/**
 * @route   POST /api/simulate-attack
 * @desc    Simulate attack scenario, run detection pipeline, persist Alert, and return structured verdict
 * @access  Public
 */
router.post('/simulate-attack', async (req, res, next) => {
  try {
    const rawType = req.body.type || req.body.scenario || req.body.id || req.body.attackType;
    const canonicalType = mapAttackType(rawType);

    if (!canonicalType) {
      return res.status(400).json({
        success: false,
        error: `Invalid attack type '${rawType}'. Supported types: NORMAL_LOGIN, BRUTE_FORCE, SUSPICIOUS_LOGIN, ACCOUNT_COMPROMISE, DATA_EXFILTRATION, RANSOMWARE_LIKE_ACTIVITY`
      });
    }

    // 1. Generate synthetic security event
    const syntheticEvent = generateScenarioEvent(canonicalType, req.body.overrides || {});

    // 2. Execute deterministic detection pipeline
    const detection = runDetectionPipeline(syntheticEvent);

    // 3. Generate zero-jargon plain-English explanation via LLM layer (with safe fallback)
    const llmExplanation = await generateAlertExplanation(detection);

    // 4. Create Alert document in MongoDB if connected
    let alertDoc = null;
    if (mongoose.connection.readyState === 1) {
      try {
        const newAlert = new Alert({
          alertType: canonicalType,
          severity: detection.riskResult.severity,
          riskScore: detection.riskResult.riskScore,
          anomalyScore: detection.anomalyResult.anomalyScore,
          ruleScore: detection.ruleResult.ruleScore,
          title: llmExplanation.title,
          explanation: llmExplanation.explanation,
          recommendedAction: llmExplanation.recommendedAction,
          sourceIp: syntheticEvent.sourceIp || syntheticEvent.ipAddress,
          destinationIp: syntheticEvent.destinationIp || '',
          deviceId: syntheticEvent.deviceId || '',
          username: syntheticEvent.username,
          eventData: syntheticEvent.eventData || {},
          status: 'ACTIVE',
          timestamp: syntheticEvent.timestamp || new Date()
        });

        alertDoc = await newAlert.save();
      } catch (dbErr) {
        console.warn('[Simulator API] Could not persist alert to DB:', dbErr.message);
      }
    }

    // 5. Broadcast live events via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('telemetry:stream', syntheticEvent);
      const alertPayload = alertDoc || {
        _id: `sim_${Date.now()}`,
        alertType: canonicalType,
        severity: detection.riskResult.severity,
        riskScore: detection.riskResult.riskScore,
        anomalyScore: detection.anomalyResult.anomalyScore,
        ruleScore: detection.ruleResult.ruleScore,
        title: llmExplanation.title,
        explanation: llmExplanation.explanation,
        recommendedAction: llmExplanation.recommendedAction,
        sourceIp: syntheticEvent.sourceIp || syntheticEvent.ipAddress,
        destinationIp: syntheticEvent.destinationIp || '',
        deviceId: syntheticEvent.deviceId || '',
        username: syntheticEvent.username,
        eventData: syntheticEvent.eventData || {},
        status: 'ACTIVE',
        timestamp: syntheticEvent.timestamp || new Date().toISOString()
      };

      io.emit('new-alert', alertPayload);
      io.emit('alert:new', alertPayload);
    }

    // 6. Automatically dispatch WhatsApp notification for HIGH and CRITICAL severity threats
    let whatsappDelivery = { sent: false, reason: 'Severity below threshold' };
    if (detection.riskResult.severity === 'HIGH' || detection.riskResult.severity === 'CRITICAL') {
      whatsappDelivery = await sendWhatsAppAlert(
        {
          title: llmExplanation.title,
          severity: detection.riskResult.severity,
          riskScore: detection.riskResult.riskScore,
          explanation: llmExplanation.explanation,
          recommendedAction: llmExplanation.recommendedAction
        },
        {
          to: req.body.targetPhone || req.body.overrides?.targetPhone
        }
      );
    }

    // 7. Return complete structured response
    const alertId = alertDoc ? alertDoc._id : `sim_${Date.now()}`;

    res.status(200).json({
      success: true,
      alertId,
      alertType: canonicalType,
      title: llmExplanation.title,
      severity: detection.riskResult.severity,
      riskScore: detection.riskResult.riskScore,
      anomalyScore: detection.anomalyResult.anomalyScore,
      ruleScore: detection.ruleResult.ruleScore,
      explanation: llmExplanation.explanation,
      recommendedAction: llmExplanation.recommendedAction,
      whatsapp: whatsappDelivery,
      timestamp: syntheticEvent.timestamp,
      event: syntheticEvent,
      detection
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/simulate/scenarios
 * @desc    Get list of available benchmark cybersecurity attack scenarios
 * @access  Public
 */
router.get('/simulate/scenarios', (req, res) => {
  res.status(200).json({
    success: true,
    scenarios: [
      { id: 'NORMAL_LOGIN', name: 'Legitimate Employee Morning Login', category: 'BASELINE' },
      { id: 'BRUTE_FORCE', name: 'Automated Password Guessing Burst', category: 'CREDENTIAL_ATTACK' },
      { id: 'SUSPICIOUS_LOGIN', name: 'Unrecognized Off-Hours Login Attempt', category: 'ANOMALOUS_ACCESS' },
      { id: 'ACCOUNT_COMPROMISE', name: 'Impossible Travel & Stolen Session Token', category: 'ACCOUNT_TAKEOVER' },
      { id: 'DATA_EXFILTRATION', name: 'Bulk Data Exfiltration & Database Dump', category: 'EXFILTRATION' },
      { id: 'RANSOMWARE_LIKE_ACTIVITY', name: 'Rapid File Encryption & Renaming Wave', category: 'RANSOMWARE' }
    ]
  });
});

export default router;
