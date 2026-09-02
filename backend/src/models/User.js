import mongoose from 'mongoose';

/**
 * User Model
 * Represents an MSME administrator or security user managing NeuroLock threat radar.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    companyName: {
      type: String,
      trim: true,
      default: ''
    },
    role: {
      type: String,
      enum: {
        values: ['ADMIN', 'SECURITY_OFFICER', 'ANALYST', 'USER'],
        message: '{VALUE} is not a supported role'
      },
      default: 'ADMIN',
      uppercase: true
    }
  },
  {
    timestamps: true
  }
);

// Index for role-based querying
userSchema.index({ role: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
