import mongoose from 'mongoose';

const { Schema } = mongoose;

const IncidentSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['accident', 'traffic', 'hazard', 'construction', 'weather'],
      required: [true, 'Incident type is required'],
      index: true,
    },
    severity: {
      type: String,
      enum: ['critical', 'severe', 'high', 'moderate', 'low'],
      required: [true, 'Severity is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'resolved', 'rejected'],
      default: 'pending',
      index: true,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    address: {
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    photos: [String],
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: Date,
    resolutionNotes: String,
    affectedRoutes: [String],
    estimatedClearanceTime: Date,
    updateCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index for location queries
IncidentSchema.index({ location: '2dsphere' });

// Compound indexes for common queries
IncidentSchema.index({ status: 1, createdAt: -1 });
IncidentSchema.index({ type: 1, severity: 1 });
IncidentSchema.index({ reportedBy: 1, createdAt: -1 });

export const Incident = mongoose.model('Incident', IncidentSchema);
