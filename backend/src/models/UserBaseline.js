import mongoose from 'mongoose';

/**
 * UserBaseline Model
 *
 * Stores the rolling behavioral profile per user for adaptive anomaly detection.
 * Captures historical login hour distributions, observed IP addresses and /24 subnet ranges,
 * trusted client device fingerprints, and data transfer baselines.
 */
const ipProfileSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      trim: true
    },
    subnet: {
      type: String,
      trim: true,
      default: ''
    },
    count: {
      type: Number,
      default: 1,
      min: 1
    },
    firstSeen: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const deviceProfileSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true
    },
    userAgent: {
      type: String,
      trim: true,
      default: ''
    },
    count: {
      type: Number,
      default: 1,
      min: 1
    },
    firstSeen: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    trustScore: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1.0
    }
  },
  { _id: false }
);

const userBaselineSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required for baseline profile'],
      unique: true,
      trim: true,
      lowercase: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    totalLogins: {
      type: Number,
      default: 0,
      min: 0
    },
    totalEvents: {
      type: Number,
      default: 0,
      min: 0
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    lastActiveAt: {
      type: Date,
      default: Date.now
    },
    typicalHours: {
      // 24-element frequency histogram representing hour of day (0 to 23)
      hourlyFrequency: {
        type: [Number],
        default: () => new Array(24).fill(0),
        validate: {
          validator: (arr) => Array.isArray(arr) && arr.length === 24,
          message: 'hourlyFrequency must contain exactly 24 hour buckets'
        }
      },
      start: {
        type: Number,
        default: 6,
        min: 0,
        max: 23
      },
      end: {
        type: Number,
        default: 22,
        min: 0,
        max: 23
      },
      primaryTimezoneOffset: {
        type: Number,
        default: 0
      }
    },
    ipProfiles: {
      type: [ipProfileSchema],
      default: []
    },
    ipSubnets: {
      type: [String],
      default: []
    },
    deviceProfiles: {
      type: [deviceProfileSchema],
      default: []
    },
    dataTransferStats: {
      avgMb: {
        type: Number,
        default: 0,
        min: 0
      },
      maxMb: {
        type: Number,
        default: 0,
        min: 0
      },
      sampleCount: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    riskHistory: {
      type: [
        {
          timestamp: { type: Date, default: Date.now },
          riskScore: Number,
          anomalyScore: Number,
          ruleScore: Number
        }
      ],
      default: []
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast lookup during event ingestion and detection
userBaselineSchema.index({ 'ipProfiles.ip': 1 });
userBaselineSchema.index({ ipSubnets: 1 });
userBaselineSchema.index({ 'deviceProfiles.deviceId': 1 });
userBaselineSchema.index({ updatedAt: -1 });

const UserBaseline =
  mongoose.models.UserBaseline || mongoose.model('UserBaseline', userBaselineSchema);

export default UserBaseline;
