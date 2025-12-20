import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../../config/env.js';

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    // Authentication
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    
    phoneNumber: {
      type: String,
      sparse: true,
      index: true,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    
    // Profile
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    avatar: String,
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    
    // Role
    role: {
      type: String,
      enum: ['citizen', 'responder', 'admin'],
      default: 'citizen',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
      index: true,
    },
    
    // Admin Info
    adminInfo: {
      assignedState: {
        type: String,
        trim: true,
        index: true,
      },
    },
    
    // Responder Info
    responderInfo: {
      agency: String,
      badgeNumber: String,
      department: {
        type: String,
        enum: ['police', 'ems', 'fire', 'tow'],
      },
      verified: {
        type: Boolean,
        default: false,
      },
      verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      verifiedAt: Date,
    },
    
    // Notification Preferences
    notificationPreferences: {
      push: {
        type: Boolean,
        default: true,
      },
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
      alertRadius: {
        type: Number,
        default: 10,
        min: 1,
        max: 100,
      },
      alertSeverity: {
        type: [String],
        enum: ['minor', 'moderate', 'severe', 'critical'],
        default: ['severe', 'critical'],
      },
    },
    
    // Stats
    stats: {
      incidentsReported: {
        type: Number,
        default: 0,
      },
      incidentsVerified: {
        type: Number,
        default: 0,
      },
      reputationScore: {
        type: Number,
        default: 50,
        min: 0,
        max: 100,
      },
      helpfulVotes: {
        type: Number,
        default: 0,
      },
      lastActivityAt: Date,
    },
    
    // Security
    security: {
      failedLoginAttempts: {
        type: Number,
        default: 0,
      },
      lastFailedLogin: Date,
      lastLogin: Date,
    },
    refreshTokens: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    
    // Device Tokens
    deviceTokens: [
      {
        token: {
          type: String,
          required: true,
        },
        platform: {
          type: String,
          enum: ['ios', 'android', 'web'],
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Metadata
    lastLoginAt: Date,
    deletedAt: Date,
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Indexes (email index is already defined in schema with index: true)
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ 'stats.reputationScore': -1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ deletedAt: 1 });

// Virtual: Full Name
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(env.BCRYPT_ROUNDS);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method: Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Method: Get safe user object (without sensitive data)
UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshToken;
  delete obj.resetPasswordToken;
  delete obj.emailVerificationToken;
  return obj;
};

export const User = mongoose.model('User', UserSchema);
