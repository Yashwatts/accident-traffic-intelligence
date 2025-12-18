# MongoDB Schema Design
## Traffic & Accident Intelligence Platform

**Production-Ready Database Schemas with Indexing and Relationships**

---

## Schema Design Philosophy

### Why These Design Choices?

1. **Embedded vs Referenced Documents**
   - Embed: Data that's always accessed together (incident photos, reports)
   - Reference: Data that's shared or large (user references, responders)

2. **Denormalization for Performance**
   - Store frequently accessed data together (user name in incident)
   - Reduces JOIN-like queries
   - Acceptable data duplication for read performance

3. **GeoJSON for Location**
   - Native MongoDB geospatial support
   - Fast proximity queries
   - Built-in indexing with 2dsphere

4. **Timestamps Everywhere**
   - Track creation and modification
   - Essential for analytics and auditing
   - Soft delete support

---

## 1. Users Collection

### Purpose
Store all user accounts (citizens, responders, admins) with authentication, profile, and preferences.

### Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  // Authentication
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  
  phoneNumber?: string;
  phoneVerified: boolean;
  phoneVerificationCode?: string;
  phoneVerificationExpires?: Date;
  
  // Profile
  firstName: string;
  lastName: string;
  avatar?: string; // URL to S3
  bio?: string;
  
  // Role & Permissions
  role: 'citizen' | 'responder' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
  
  // Responder-specific (only if role === 'responder')
  responderInfo?: {
    agency: string;
    badgeNumber: string;
    department: 'police' | 'ems' | 'fire' | 'tow';
    verified: boolean;
    verifiedBy?: mongoose.Types.ObjectId; // Admin who verified
    verifiedAt?: Date;
    licenseNumber?: string;
    certifications?: string[];
  };
  
  // Notification Preferences
  notificationPreferences: {
    push: boolean;
    email: boolean;
    sms: boolean;
    alertRadius: number; // miles (5, 10, 25, 50)
    alertSeverity: Array<'minor' | 'moderate' | 'severe' | 'critical'>;
    quietHours?: {
      enabled: boolean;
      start: string; // "22:00"
      end: string;   // "07:00"
    };
  };
  
  // Saved Routes (for notifications)
  routes: Array<{
    _id: mongoose.Types.ObjectId;
    name: string;
    origin: {
      lat: number;
      lng: number;
      address: string;
    };
    destination: {
      lat: number;
      lng: number;
      address: string;
    };
    waypoints?: Array<{
      lat: number;
      lng: number;
    }>;
    alertsEnabled: boolean;
    usualDepartureTimes?: string[]; // ["08:00", "17:00"]
    createdAt: Date;
  }>;
  
  // User Statistics (for gamification)
  stats: {
    incidentsReported: number;
    incidentsVerified: number;
    reputationScore: number; // 0-100
    helpfulVotes: number;
    lastActivityAt?: Date;
  };
  
  // Security
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  
  // Device tokens for push notifications
  deviceTokens: Array<{
    token: string;
    platform: 'ios' | 'android' | 'web';
    addedAt: Date;
  }>;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  deletedAt?: Date; // Soft delete
}

const UserSchema = new Schema<IUser>(
  {
    // Authentication
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false // Never return in queries by default
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    
    phoneNumber: {
      type: String,
      sparse: true, // Allows multiple null values
      index: true
    },
    phoneVerified: {
      type: Boolean,
      default: false
    },
    phoneVerificationCode: String,
    phoneVerificationExpires: Date,
    
    // Profile
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    avatar: String,
    bio: {
      type: String,
      maxlength: 500
    },
    
    // Role
    role: {
      type: String,
      enum: ['citizen', 'responder', 'admin'],
      default: 'citizen',
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
      index: true
    },
    
    // Responder Info
    responderInfo: {
      agency: String,
      badgeNumber: String,
      department: {
        type: String,
        enum: ['police', 'ems', 'fire', 'tow']
      },
      verified: {
        type: Boolean,
        default: false
      },
      verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      verifiedAt: Date,
      licenseNumber: String,
      certifications: [String]
    },
    
    // Notification Preferences
    notificationPreferences: {
      push: {
        type: Boolean,
        default: true
      },
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      alertRadius: {
        type: Number,
        default: 10,
        min: 1,
        max: 100
      },
      alertSeverity: {
        type: [String],
        enum: ['minor', 'moderate', 'severe', 'critical'],
        default: ['severe', 'critical']
      },
      quietHours: {
        enabled: {
          type: Boolean,
          default: false
        },
        start: String,
        end: String
      }
    },
    
    // Saved Routes
    routes: [
      {
        name: {
          type: String,
          required: true
        },
        origin: {
          lat: {
            type: Number,
            required: true,
            min: -90,
            max: 90
          },
          lng: {
            type: Number,
            required: true,
            min: -180,
            max: 180
          },
          address: String
        },
        destination: {
          lat: {
            type: Number,
            required: true,
            min: -90,
            max: 90
          },
          lng: {
            type: Number,
            required: true,
            min: -180,
            max: 180
          },
          address: String
        },
        waypoints: [
          {
            lat: Number,
            lng: Number
          }
        ],
        alertsEnabled: {
          type: Boolean,
          default: true
        },
        usualDepartureTimes: [String],
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    
    // Stats
    stats: {
      incidentsReported: {
        type: Number,
        default: 0
      },
      incidentsVerified: {
        type: Number,
        default: 0
      },
      reputationScore: {
        type: Number,
        default: 50,
        min: 0,
        max: 100
      },
      helpfulVotes: {
        type: Number,
        default: 0
      },
      lastActivityAt: Date
    },
    
    // Security
    refreshToken: {
      type: String,
      select: false
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    
    // Device Tokens
    deviceTokens: [
      {
        token: {
          type: String,
          required: true
        },
        platform: {
          type: String,
          enum: ['ios', 'android', 'web'],
          required: true
        },
        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    
    // Metadata
    lastLoginAt: Date,
    deletedAt: Date
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'users'
  }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ 'stats.reputationScore': -1 }); // Leaderboard
UserSchema.index({ createdAt: -1 });
UserSchema.index({ deletedAt: 1 }); // Soft delete queries

// Virtual: Full Name
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Methods
UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshToken;
  delete obj.resetPasswordToken;
  delete obj.emailVerificationToken;
  delete obj.phoneVerificationCode;
  return obj;
};

export const User = mongoose.model<IUser>('User', UserSchema);
```

### Indexing Strategy

```javascript
// Performance Indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phoneNumber: 1 }, { sparse: true });
db.users.createIndex({ role: 1, status: 1 });
db.users.createIndex({ "stats.reputationScore": -1 }); // Leaderboard queries
db.users.createIndex({ createdAt: -1 }); // Recent users
db.users.createIndex({ deletedAt: 1 }); // Active users filter

// Compound indexes
db.users.createIndex({ role: 1, "stats.incidentsReported": -1 }); // Top reporters
```

### Reasoning

**Why Embedded Routes?**
- Routes are user-specific and always queried together
- Limited number per user (typically 2-5)
- No need for separate collection

**Why Device Tokens Array?**
- Users can have multiple devices
- Need to send push notifications to all devices
- Easy to add/remove tokens

**Why Soft Delete?**
- Maintain data integrity (incident reports reference users)
- Audit trail
- Can restore accounts if needed

**Why Reputation Score?**
- Gamification encourages quality reporting
- Helps identify trusted reporters
- Can be used to prioritize reports

---

## 2. Incidents Collection

### Purpose
Store all accident/incident reports with location, severity, status, photos, and response tracking.

### Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IIncident extends Document {
  // Location (GeoJSON for geospatial queries)
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  
  // Address (denormalized for quick display)
  address: {
    street?: string;
    city: string;
    state: string;
    postalCode?: string;
    country: string;
    formattedAddress: string; // Full address string
  };
  
  // Incident Classification
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  severityScore: number; // 0-100 (calculated)
  status: 'active' | 'dispatched' | 'on-scene' | 'clearing' | 'cleared';
  type: 'car-crash' | 'motorcycle' | 'truck' | 'pedestrian' | 'bicycle' | 'other';
  
  // Incident Details
  vehicleCount: number;
  injuries: boolean;
  injuryCount?: number;
  injurySeverity?: 'minor' | 'serious' | 'critical' | 'fatal';
  fatalities?: number;
  
  lanesBlocked: 'none' | 'partial' | 'all';
  lanesAffected?: string[]; // ['left', 'center', 'right']
  roadClosed: boolean;
  
  description?: string; // Optional text description
  conditions?: {
    weather?: 'clear' | 'rain' | 'snow' | 'fog' | 'ice';
    lighting?: 'daylight' | 'dusk' | 'night' | 'dawn';
    roadCondition?: 'dry' | 'wet' | 'icy' | 'construction';
  };
  
  // Reporting & Verification
  reportedBy: mongoose.Types.ObjectId; // User ID (reference)
  reportedByName: string; // Denormalized for display
  reportedByRole: 'citizen' | 'responder'; // Responder reports are auto-verified
  
  reportCount: number; // Number of merged duplicate reports
  reports: Array<{
    _id: mongoose.Types.ObjectId;
    reportedBy: mongoose.Types.ObjectId;
    reportedByName: string;
    timestamp: Date;
    details?: string;
    location?: {
      lat: number;
      lng: number;
    };
  }>;
  
  verifications: Array<{
    userId: mongoose.Types.ObjectId;
    userName: string;
    verifiedAt: Date;
    comment?: string;
  }>;
  
  // Media
  photos: Array<{
    _id: mongoose.Types.ObjectId;
    url: string; // S3 URL
    thumbnailUrl: string;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedByName: string;
    uploadedAt: Date;
    metadata?: {
      width: number;
      height: number;
      size: number; // bytes
      exif?: any;
    };
  }>;
  
  // Response Tracking
  assignedResponders: Array<{
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    userName: string;
    role: 'police' | 'ambulance' | 'fire' | 'tow';
    agency: string;
    assignedAt: Date;
    arrivedAt?: Date;
    status: 'assigned' | 'en-route' | 'on-scene' | 'completed';
  }>;
  
  // Timeline Events
  timeline: Array<{
    _id: mongoose.Types.ObjectId;
    event: 'reported' | 'verified' | 'dispatched' | 'arrived' | 'cleared' | 'updated';
    description: string;
    performedBy?: mongoose.Types.ObjectId;
    performedByName?: string;
    timestamp: Date;
  }>;
  
  // Analytics & Engagement
  views: number;
  notificationsSent: number;
  affectedUsers: number; // Estimated from notifications
  
  // Search & Tags
  tags: string[]; // ['highway', 'rush-hour', 'major-crash']
  incidentNumber?: string; // Official reference number from PD
  
  // Resolution
  clearedAt?: Date;
  clearedBy?: mongoose.Types.ObjectId;
  clearedByName?: string;
  resolutionNotes?: string;
  estimatedClearTime?: Date; // When responders expect to clear
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date; // Soft delete
  
  // Admin flags
  flagged: boolean;
  flagReason?: string;
  reviewed: boolean;
  reviewedBy?: mongoose.Types.ObjectId;
}

const IncidentSchema = new Schema<IIncident>(
  {
    // Location (GeoJSON)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (v: number[]) {
            return v.length === 2 && 
                   v[0] >= -180 && v[0] <= 180 && 
                   v[1] >= -90 && v[1] <= 90;
          },
          message: 'Invalid coordinates'
        }
      }
    },
    
    // Address
    address: {
      street: String,
      city: {
        type: String,
        required: true,
        index: true
      },
      state: {
        type: String,
        required: true,
        index: true
      },
      postalCode: String,
      country: {
        type: String,
        default: 'USA'
      },
      formattedAddress: {
        type: String,
        required: true
      }
    },
    
    // Classification
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'severe', 'critical'],
      required: true,
      index: true
    },
    severityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'dispatched', 'on-scene', 'clearing', 'cleared'],
      default: 'active',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['car-crash', 'motorcycle', 'truck', 'pedestrian', 'bicycle', 'other'],
      required: true
    },
    
    // Details
    vehicleCount: {
      type: Number,
      required: true,
      min: 1,
      max: 50
    },
    injuries: {
      type: Boolean,
      default: false
    },
    injuryCount: Number,
    injurySeverity: {
      type: String,
      enum: ['minor', 'serious', 'critical', 'fatal']
    },
    fatalities: {
      type: Number,
      default: 0,
      min: 0
    },
    
    lanesBlocked: {
      type: String,
      enum: ['none', 'partial', 'all'],
      default: 'none'
    },
    lanesAffected: [String],
    roadClosed: {
      type: Boolean,
      default: false
    },
    
    description: {
      type: String,
      maxlength: 2000
    },
    conditions: {
      weather: {
        type: String,
        enum: ['clear', 'rain', 'snow', 'fog', 'ice']
      },
      lighting: {
        type: String,
        enum: ['daylight', 'dusk', 'night', 'dawn']
      },
      roadCondition: {
        type: String,
        enum: ['dry', 'wet', 'icy', 'construction']
      }
    },
    
    // Reporting
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    reportedByName: {
      type: String,
      required: true
    },
    reportedByRole: {
      type: String,
      enum: ['citizen', 'responder'],
      required: true
    },
    
    reportCount: {
      type: Number,
      default: 1,
      min: 1
    },
    reports: [
      {
        reportedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        reportedByName: String,
        timestamp: {
          type: Date,
          default: Date.now
        },
        details: String,
        location: {
          lat: Number,
          lng: Number
        }
      }
    ],
    
    verifications: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        userName: String,
        verifiedAt: {
          type: Date,
          default: Date.now
        },
        comment: String
      }
    ],
    
    // Media
    photos: [
      {
        url: {
          type: String,
          required: true
        },
        thumbnailUrl: String,
        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        uploadedByName: String,
        uploadedAt: {
          type: Date,
          default: Date.now
        },
        metadata: {
          width: Number,
          height: Number,
          size: Number,
          exif: Schema.Types.Mixed
        }
      }
    ],
    
    // Responders
    assignedResponders: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        userName: String,
        role: {
          type: String,
          enum: ['police', 'ambulance', 'fire', 'tow'],
          required: true
        },
        agency: String,
        assignedAt: {
          type: Date,
          default: Date.now
        },
        arrivedAt: Date,
        status: {
          type: String,
          enum: ['assigned', 'en-route', 'on-scene', 'completed'],
          default: 'assigned'
        }
      }
    ],
    
    // Timeline
    timeline: [
      {
        event: {
          type: String,
          enum: ['reported', 'verified', 'dispatched', 'arrived', 'cleared', 'updated'],
          required: true
        },
        description: String,
        performedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        performedByName: String,
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ],
    
    // Analytics
    views: {
      type: Number,
      default: 0
    },
    notificationsSent: {
      type: Number,
      default: 0
    },
    affectedUsers: {
      type: Number,
      default: 0
    },
    
    // Search
    tags: [String],
    incidentNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    
    // Resolution
    clearedAt: Date,
    clearedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    clearedByName: String,
    resolutionNotes: String,
    estimatedClearTime: Date,
    
    // Metadata
    deletedAt: Date,
    
    // Admin
    flagged: {
      type: Boolean,
      default: false
    },
    flagReason: String,
    reviewed: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    collection: 'incidents'
  }
);

// Indexes
IncidentSchema.index({ location: '2dsphere' }); // CRITICAL: Geospatial queries
IncidentSchema.index({ status: 1, createdAt: -1 }); // Active incidents
IncidentSchema.index({ severity: 1, status: 1 }); // Filter by severity
IncidentSchema.index({ 'address.city': 1, 'address.state': 1, createdAt: -1 }); // City queries
IncidentSchema.index({ createdAt: -1 }); // Recent incidents
IncidentSchema.index({ reportedBy: 1, createdAt: -1 }); // User's reports
IncidentSchema.index({ tags: 1 }); // Tag search
IncidentSchema.index({ deletedAt: 1 }); // Soft delete filter

// Compound indexes for common queries
IncidentSchema.index({ status: 1, severity: 1, createdAt: -1 }); // Dashboard
IncidentSchema.index({ 'address.city': 1, severity: 1, createdAt: -1 }); // City dashboard

// Text search
IncidentSchema.index({ 
  'address.formattedAddress': 'text', 
  description: 'text',
  tags: 'text'
});

// Virtuals
IncidentSchema.virtual('isActive').get(function () {
  return this.status !== 'cleared' && !this.deletedAt;
});

IncidentSchema.virtual('responseTime').get(function () {
  if (this.assignedResponders.length === 0) return null;
  const firstResponder = this.assignedResponders[0];
  if (!firstResponder.arrivedAt) return null;
  return firstResponder.arrivedAt.getTime() - this.createdAt.getTime();
});

export const Incident = mongoose.model<IIncident>('Incident', IncidentSchema);
```

### Indexing Strategy

```javascript
// Critical geospatial index
db.incidents.createIndex({ location: "2dsphere" });

// Performance indexes
db.incidents.createIndex({ status: 1, createdAt: -1 });
db.incidents.createIndex({ severity: 1, status: 1 });
db.incidents.createIndex({ "address.city": 1, "address.state": 1, createdAt: -1 });
db.incidents.createIndex({ reportedBy: 1, createdAt: -1 });
db.incidents.createIndex({ createdAt: -1 });

// Compound indexes for dashboards
db.incidents.createIndex({ status: 1, severity: 1, createdAt: -1 });
db.incidents.createIndex({ "address.city": 1, severity: 1, createdAt: -1 });

// Text search
db.incidents.createIndex({
  "address.formattedAddress": "text",
  "description": "text",
  "tags": "text"
});
```

### Reasoning

**Why GeoJSON?**
- MongoDB's built-in 2dsphere index
- Fast proximity queries ($near, $geoWithin)
- Industry standard for location data

**Why Embed Reports Array?**
- Duplicate reports are merged into same incident
- Need to track all reporters (credit, notifications)
- Limited size (typically 2-10 reports per incident)

**Why Denormalize reportedByName?**
- Avoid populating user on every query
- Display name is needed 99% of the time
- User rarely changes name

**Why Timeline Array?**
- Audit trail of all actions
- Essential for responder accountability
- Analytics (average response time)

**Why Soft Delete?**
- Analytics need historical data
- Can't delete (users/responders still referenced)
- May need to restore if deleted by mistake

---

## 3. Notifications Collection

### Purpose
Store in-app notifications for users (push/email/SMS are sent via external services).

### Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  
  type: 'incident-created' | 'incident-cleared' | 'incident-nearby' | 
        'route-alert' | 'responder-assigned' | 'system' | 'achievement';
  
  title: string;
  message: string;
  
  // Related entities
  incidentId?: mongoose.Types.ObjectId;
  routeId?: string; // User's route ID
  
  // Content
  data?: any; // Additional data (JSON)
  actionUrl?: string; // Deep link URL
  
  // Status
  read: boolean;
  readAt?: Date;
  
  // Delivery channels
  channels: Array<'in-app' | 'push' | 'email' | 'sms'>;
  deliveryStatus: {
    inApp?: 'sent' | 'delivered';
    push?: 'sent' | 'delivered' | 'failed';
    email?: 'sent' | 'delivered' | 'opened' | 'failed';
    sms?: 'sent' | 'delivered' | 'failed';
  };
  
  // Priority
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Metadata
  createdAt: Date;
  expiresAt: Date; // Auto-delete after 30 days
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    
    type: {
      type: String,
      enum: [
        'incident-created',
        'incident-cleared',
        'incident-nearby',
        'route-alert',
        'responder-assigned',
        'system',
        'achievement'
      ],
      required: true,
      index: true
    },
    
    title: {
      type: String,
      required: true,
      maxlength: 200
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000
    },
    
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
      index: true
    },
    routeId: String,
    
    data: Schema.Types.Mixed,
    actionUrl: String,
    
    read: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: Date,
    
    channels: {
      type: [String],
      enum: ['in-app', 'push', 'email', 'sms'],
      default: ['in-app']
    },
    deliveryStatus: {
      inApp: String,
      push: String,
      email: String,
      sms: String
    },
    
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    
    expiresAt: {
      type: Date,
      required: true,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'notifications'
  }
);

// Indexes
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
NotificationSchema.index({ incidentId: 1 });
NotificationSchema.index({ type: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
```

### Reasoning

**Why TTL Index?**
- Automatically delete old notifications after 30 days
- Keeps collection size manageable
- No manual cleanup needed

**Why Separate from External Notifications?**
- In-app notifications need persistence
- Push/email/SMS are fire-and-forget
- Need history for user's notification center

---

## 4. Routes Collection (Alternative: Embedded in User)

### Purpose
Store user-defined routes for proactive alerts (can be embedded in User, shown here as separate for flexibility).

### Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IRoute extends Document {
  userId: mongoose.Types.ObjectId;
  
  name: string;
  
  origin: {
    lat: number;
    lng: number;
    address: string;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  
  destination: {
    lat: number;
    lng: number;
    address: string;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  
  waypoints?: Array<{
    lat: number;
    lng: number;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
  }>;
  
  // Route geometry (polyline from Google/Mapbox)
  polyline?: string; // Encoded polyline
  distance?: number; // meters
  duration?: number; // seconds
  
  // Alert settings
  alertsEnabled: boolean;
  alertRadius: number; // meters (how close to route)
  severityFilter: Array<'minor' | 'moderate' | 'severe' | 'critical'>;
  
  // Schedule
  usualDepartureTimes?: Array<{
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    time: string; // "08:30"
    notifyBefore: number; // minutes (notify 15 min before departure)
  }>;
  
  // Statistics
  timesUsed: number;
  lastUsedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const RouteSchema = new Schema<IRoute>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    
    origin: {
      lat: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      lng: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      },
      address: String,
      location: {
        type: {
          type: String,
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      }
    },
    
    destination: {
      lat: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      lng: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      },
      address: String,
      location: {
        type: {
          type: String,
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      }
    },
    
    waypoints: [
      {
        lat: Number,
        lng: Number,
        location: {
          type: {
            type: String,
            enum: ['Point']
          },
          coordinates: [Number]
        }
      }
    ],
    
    polyline: String,
    distance: Number,
    duration: Number,
    
    alertsEnabled: {
      type: Boolean,
      default: true
    },
    alertRadius: {
      type: Number,
      default: 1000, // 1km
      min: 100,
      max: 10000
    },
    severityFilter: {
      type: [String],
      enum: ['minor', 'moderate', 'severe', 'critical'],
      default: ['severe', 'critical']
    },
    
    usualDepartureTimes: [
      {
        dayOfWeek: {
          type: Number,
          min: 0,
          max: 6
        },
        time: String,
        notifyBefore: {
          type: Number,
          default: 15
        }
      }
    ],
    
    timesUsed: {
      type: Number,
      default: 0
    },
    lastUsedAt: Date
  },
  {
    timestamps: true,
    collection: 'routes'
  }
);

// Indexes
RouteSchema.index({ userId: 1, createdAt: -1 });
RouteSchema.index({ 'origin.location': '2dsphere' });
RouteSchema.index({ 'destination.location': '2dsphere' });
RouteSchema.index({ alertsEnabled: 1, userId: 1 });

export const Route = mongoose.model<IRoute>('Route', RouteSchema);
```

### Reasoning

**Separate Collection vs Embedded?**
- **Embedded** (in User): Better if routes are always accessed with user
- **Separate**: Better if querying routes independently (find all routes affected by incident)
- **Recommendation**: Start embedded, separate if needed

**Why GeoJSON for Origin/Destination?**
- Can query "all routes near this incident"
- Spatial indexing for performance

---

## 5. Admin Action Log Collection

### Purpose
Audit trail of all admin actions for security and compliance.

### Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminActionLog extends Document {
  adminId: mongoose.Types.ObjectId;
  adminName: string;
  adminEmail: string;
  
  action: 'user-suspend' | 'user-delete' | 'user-restore' | 'user-verify-responder' |
          'incident-delete' | 'incident-flag' | 'incident-unflag' | 'incident-edit' |
          'system-config' | 'bulk-delete' | 'export-data' | 'other';
  
  targetType: 'user' | 'incident' | 'system' | 'bulk';
  targetId?: mongoose.Types.ObjectId;
  targetIdentifier?: string; // Email, incident number, etc.
  
  description: string;
  reason?: string; // Why action was taken
  
  // Before/after snapshots
  changes?: {
    before: any;
    after: any;
  };
  
  // Request metadata
  ipAddress: string;
  userAgent?: string;
  
  // Status
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
  
  createdAt: Date;
}

const AdminActionLogSchema = new Schema<IAdminActionLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    adminName: {
      type: String,
      required: true
    },
    adminEmail: {
      type: String,
      required: true
    },
    
    action: {
      type: String,
      enum: [
        'user-suspend',
        'user-delete',
        'user-restore',
        'user-verify-responder',
        'incident-delete',
        'incident-flag',
        'incident-unflag',
        'incident-edit',
        'system-config',
        'bulk-delete',
        'export-data',
        'other'
      ],
      required: true,
      index: true
    },
    
    targetType: {
      type: String,
      enum: ['user', 'incident', 'system', 'bulk'],
      required: true,
      index: true
    },
    targetId: {
      type: Schema.Types.ObjectId,
      index: true
    },
    targetIdentifier: String,
    
    description: {
      type: String,
      required: true
    },
    reason: String,
    
    changes: {
      before: Schema.Types.Mixed,
      after: Schema.Types.Mixed
    },
    
    ipAddress: {
      type: String,
      required: true
    },
    userAgent: String,
    
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'success',
      index: true
    },
    errorMessage: String
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only createdAt
    collection: 'admin_action_logs'
  }
);

// Indexes
AdminActionLogSchema.index({ adminId: 1, createdAt: -1 });
AdminActionLogSchema.index({ action: 1, createdAt: -1 });
AdminActionLogSchema.index({ targetType: 1, targetId: 1 });
AdminActionLogSchema.index({ createdAt: -1 }); // Recent actions

export const AdminActionLog = mongoose.model<IAdminActionLog>('AdminActionLog', AdminActionLogSchema);
```

### Reasoning

**Why Immutable Log?**
- No updates or deletes (audit integrity)
- Only createdAt timestamp
- Permanent record of admin actions

**Why Denormalize Admin Info?**
- Admin might be deleted later
- Need permanent record of who did what
- No foreign key constraints

**Why Before/After Snapshots?**
- See exact changes made
- Can potentially undo actions
- Compliance and debugging

---

## 6. Traffic Status Collection (Optional)

### Purpose
Store real-time traffic flow data (separate from incidents) for general traffic monitoring.

### Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface ITrafficStatus extends Document {
  // Location segment
  location: {
    type: 'LineString';
    coordinates: Array<[number, number]>; // Array of [lng, lat] points
  };
  
  roadName: string;
  roadType: 'highway' | 'arterial' | 'local' | 'other';
  
  // Traffic conditions
  flowSpeed: number; // km/h
  typicalSpeed: number; // km/h
  congestionLevel: 'free' | 'light' | 'moderate' | 'heavy' | 'stopped';
  
  // Related incidents
  affectedByIncidents?: mongoose.Types.ObjectId[];
  
  // Metadata
  source: 'google-maps' | 'mapbox' | 'manual' | 'sensor';
  lastUpdated: Date;
  
  // Expiration
  expiresAt: Date;
}

const TrafficStatusSchema = new Schema<ITrafficStatus>(
  {
    location: {
      type: {
        type: String,
        enum: ['LineString'],
        required: true
      },
      coordinates: {
        type: [[Number]],
        required: true
      }
    },
    
    roadName: {
      type: String,
      required: true,
      index: true
    },
    roadType: {
      type: String,
      enum: ['highway', 'arterial', 'local', 'other'],
      required: true
    },
    
    flowSpeed: {
      type: Number,
      required: true,
      min: 0
    },
    typicalSpeed: {
      type: Number,
      required: true,
      min: 0
    },
    congestionLevel: {
      type: String,
      enum: ['free', 'light', 'moderate', 'heavy', 'stopped'],
      required: true,
      index: true
    },
    
    affectedByIncidents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Incident'
      }
    ],
    
    source: {
      type: String,
      enum: ['google-maps', 'mapbox', 'manual', 'sensor'],
      required: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    
    expiresAt: {
      type: Date,
      required: true,
      index: true
    }
  },
  {
    timestamps: false, // Use lastUpdated instead
    collection: 'traffic_status'
  }
);

// Indexes
TrafficStatusSchema.index({ location: '2dsphere' });
TrafficStatusSchema.index({ congestionLevel: 1, lastUpdated: -1 });
TrafficStatusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL

export const TrafficStatus = mongoose.model<ITrafficStatus>('TrafficStatus', TrafficStatusSchema);
```

### Reasoning

**Why Separate from Incidents?**
- Traffic status is real-time, frequently updating
- Incidents are discrete events
- Different data sources and update frequencies

**Why LineString?**
- Traffic applies to road segments, not points
- Can query "traffic on this road"

**Why TTL?**
- Traffic data is time-sensitive
- Auto-delete after expiration
- No need for historical traffic (use analytics DB)

---

## Summary of Relationships

```
User
 ├─→ Incidents (reportedBy)
 ├─→ Incidents (verifications.userId)
 ├─→ Incidents (assignedResponders.userId)
 ├─→ Notifications (userId)
 ├─→ Routes (userId)
 └─→ AdminActionLog (adminId)

Incident
 ├─→ User (reportedBy)
 ├─→ User (assignedResponders.userId)
 ├─→ User (verifications.userId)
 └─→ Notifications (incidentId)

Route
 └─→ User (userId)

Notification
 ├─→ User (userId)
 └─→ Incident (incidentId)

AdminActionLog
 ├─→ User (adminId)
 └─→ User or Incident (targetId)

TrafficStatus
 └─→ Incidents (affectedByIncidents)
```

---

## Index Performance Analysis

### Critical Indexes (Must Have)

1. **Geospatial**
   ```javascript
   db.incidents.createIndex({ location: "2dsphere" });
   ```
   - Used for "incidents near me" queries
   - Most frequent query type

2. **Status + Time**
   ```javascript
   db.incidents.createIndex({ status: 1, createdAt: -1 });
   ```
   - Dashboard queries (active incidents)
   - Sorted by time

3. **User Lookups**
   ```javascript
   db.users.createIndex({ email: 1 }, { unique: true });
   ```
   - Login queries
   - Email must be unique

4. **Notifications**
   ```javascript
   db.notifications.createIndex({ userId: 1, createdAt: -1 });
   ```
   - User's notification feed
   - Most recent first

### Query Performance Examples

```javascript
// Find incidents near location (uses 2dsphere index)
db.incidents.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [-122.4, 37.8]
      },
      $maxDistance: 10000 // 10km
    }
  },
  status: { $ne: "cleared" }
});

// Active incidents by severity (uses compound index)
db.incidents.find({
  status: "active",
  severity: { $in: ["severe", "critical"] }
}).sort({ createdAt: -1 }).limit(50);

// User's notifications (uses compound index)
db.notifications.find({
  userId: ObjectId("..."),
  read: false
}).sort({ createdAt: -1 });
```

---

This schema design supports millions of users, thousands of concurrent incidents, and sub-second query times with proper indexing.