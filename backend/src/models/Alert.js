import mongoose from 'mongoose';

/**
 * Alert Model
 * Core security-event storage model representing flagged anomalies,
 * ML/heuristic scores, and zero-jargon plain-English explanations.
 */
const alertSchema = new mongoose.Schema(
  {
    alertType: {
      type: String,
      required: [true, 'Alert type is required'],
      trim: true,
      uppercase: true
    },
    severity: {
      type: String,
      required: [true, 'Severity level is required'],
      enum: {
        values: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        message: '{VALUE} is not a valid severity level'
      },
      default: 'MEDIUM',
      uppercase: true
    },
    riskScore: {
      type: Number,
      min: [0, 'Risk score must be at least 0'],
      max: [100, 'Risk score cannot exceed 100'],
      default: 0
    },
    anomalyScore: {
      type: Number,
      min: [0, 'Anomaly score must be at least 0'],
      max: [100, 'Anomaly score cannot exceed 100'],
      default: 0
    },
    ruleScore: {
      type: Number,
      min: [0, 'Rule score must be at least 0'],
      max: [100, 'Rule score cannot exceed 100'],
      default: 0
    },
    title: {
      type: String,
      required: [true, 'Alert title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    explanation: {
      type: String,
      required: [true, 'Zero-jargon plain-English explanation is required'],
      trim: true
    },
    recommendedAction: {
      type: String,
      trim: true,
      default: 'Review recent authentication logs and re-verify identity'
    },
    sourceIp: {
      type: String,
      trim: true,
      default: ''
    },
    destinationIp: {
      type: String,
      trim: true,
      default: ''
    },
    deviceId: {
      type: String,
      trim: true,
      default: ''
    },
    username: {
      type: String,
      trim: true,
      default: ''
    },
    eventData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'],
        message: '{VALUE} is not a valid status'
      },
      default: 'ACTIVE',
      uppercase: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound and single indexes for query performance
alertSchema.index({ status: 1, timestamp: -1 });
alertSchema.index({ severity: 1, timestamp: -1 });
alertSchema.index({ alertType: 1 });
alertSchema.index({ username: 1 });
alertSchema.index({ sourceIp: 1 });

const Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema);
export default Alert;
