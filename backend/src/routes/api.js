import express from 'express';
import mongoose from 'mongoose';
import Alert from '../models/Alert.js';
import User from '../models/User.js';

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
 * @desc    Create a new security threat alert (useful for seeding, tests, and future pipeline)
 * @access  Public
 */
router.post('/alerts', checkDbConnection, async (req, res, next) => {
  try {
    const alert = new Alert(req.body);
    const savedAlert = await alert.save();

    // Broadcast new alert event via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('alert:new', savedAlert);
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

export default router;
