# Production Architecture
## Traffic & Accident Intelligence Platform

**Scalable, Secure, Real-Time Architecture for Production Deployment**

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (Frontend)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │   Web App    │  │  Mobile PWA  │  │  Admin Panel │                │
│  │  (React +    │  │  (React +    │  │  (React +    │                │
│  │   Vite)      │  │   Vite)      │  │   Vite)      │                │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                │
│         │                  │                  │                         │
│         └──────────────────┴──────────────────┘                         │
│                            │                                            │
└────────────────────────────┼────────────────────────────────────────────┘
                             │
                             │ HTTPS/WSS
                             │
┌────────────────────────────┼────────────────────────────────────────────┐
│                            ▼                                            │
│                     ┌──────────────┐                                    │
│                     │  CDN + WAF   │                                    │
│                     │  (CloudFlare)│                                    │
│                     └──────┬───────┘                                    │
│                            │                                            │
│                     ┌──────▼───────┐                                    │
│                     │ Load Balancer│                                    │
│                     │  (Nginx/ALB) │                                    │
│                     └──────┬───────┘                                    │
│                            │                                            │
├────────────────────────────┼────────────────────────────────────────────┤
│                   API GATEWAY LAYER                                     │
├────────────────────────────┼────────────────────────────────────────────┤
│                            │                                            │
│         ┌──────────────────┴──────────────────┐                        │
│         │                                      │                        │
│    ┌────▼─────┐                         ┌─────▼────┐                   │
│    │ REST API │                         │ WebSocket│                   │
│    │ Gateway  │                         │  Server  │                   │
│    │ (Express)│                         │(Socket.io)│                  │
│    └────┬─────┘                         └─────┬────┘                   │
│         │                                      │                        │
└─────────┼──────────────────────────────────────┼────────────────────────┘
          │                                      │
          │                                      │
┌─────────┼──────────────────────────────────────┼────────────────────────┐
│         │          APPLICATION LAYER           │                        │
├─────────┼──────────────────────────────────────┼────────────────────────┤
│         │                                      │                        │
│    ┌────▼─────────────────────────────────────▼─────┐                  │
│    │         Node.js Backend Services               │                  │
│    │         (Microservices Architecture)           │                  │
│    ├────────────────────────────────────────────────┤                  │
│    │                                                │                  │
│    │  ┌──────────────┐  ┌───────────────────┐     │                  │
│    │  │  Incident    │  │  User/Auth        │     │                  │
│    │  │  Service     │  │  Service          │     │                  │
│    │  └──────┬───────┘  └────────┬──────────┘     │                  │
│    │         │                    │                │                  │
│    │  ┌──────▼───────┐  ┌────────▼──────────┐     │                  │
│    │  │  Location    │  │  Notification     │     │                  │
│    │  │  Service     │  │  Service          │     │                  │
│    │  └──────┬───────┘  └────────┬──────────┘     │                  │
│    │         │                    │                │                  │
│    │  ┌──────▼───────┐  ┌────────▼──────────┐     │                  │
│    │  │  Analytics   │  │  Media            │     │                  │
│    │  │  Service     │  │  Service          │     │                  │
│    │  └──────────────┘  └───────────────────┘     │                  │
│    │                                                │                  │
│    └────────────────────┬───────────────────────────┘                  │
│                         │                                              │
└─────────────────────────┼──────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────────┐
          │               │                   │
┌─────────▼───┐  ┌────────▼────────┐  ┌──────▼──────┐
│   MongoDB   │  │  Redis Cache    │  │  PostgreSQL │
│  (Primary)  │  │  (Session/RT)   │  │ (Analytics) │
└─────────────┘  └─────────────────┘  └─────────────┘
          │               │                   │
┌─────────▼───────────────▼───────────────────▼──────┐
│                                                     │
│              EXTERNAL SERVICES                      │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  AWS S3  │  │  Twilio  │  │  Google Maps API │ │
│  │ (Photos) │  │  (SMS)   │  │  (Geocoding)     │ │
│  └──────────┘  └──────────┘  └──────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Tech Stack
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite (fast HMR, optimized builds)
- **Styling:** Tailwind CSS + CSS Modules for components
- **State Management:** Zustand (lightweight, no boilerplate)
- **Routing:** React Router v6
- **Maps:** Mapbox GL JS or Google Maps API
- **Real-time:** Socket.io Client
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios with interceptors
- **PWA:** Workbox (offline support, push notifications)

### Directory Structure

```
frontend/
├── public/
│   ├── icons/              # App icons (PWA)
│   ├── manifest.json       # PWA manifest
│   └── service-worker.js   # Offline support
│
├── src/
│   ├── api/                # API client layer
│   │   ├── axios-client.ts
│   │   ├── incident-api.ts
│   │   ├── user-api.ts
│   │   └── socket-client.ts
│   │
│   ├── components/         # Reusable components
│   │   ├── common/         # Buttons, Cards, Badges
│   │   ├── layout/         # Header, Sidebar, Footer
│   │   ├── map/            # Map, Pins, Clusters
│   │   ├── forms/          # Input, Select, FileUpload
│   │   └── incident/       # IncidentCard, DetailModal
│   │
│   ├── pages/              # Route pages
│   │   ├── MapView/
│   │   ├── ReportIncident/
│   │   ├── Dashboard/
│   │   ├── Analytics/
│   │   └── Profile/
│   │
│   ├── hooks/              # Custom hooks
│   │   ├── useIncidents.ts
│   │   ├── useRealtime.ts
│   │   ├── useGeolocation.ts
│   │   ├── useAuth.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── stores/             # Zustand state stores
│   │   ├── incident-store.ts
│   │   ├── auth-store.ts
│   │   ├── ui-store.ts
│   │   └── filter-store.ts
│   │
│   ├── types/              # TypeScript types
│   │   ├── incident.ts
│   │   ├── user.ts
│   │   └── api.ts
│   │
│   ├── utils/              # Helper functions
│   │   ├── date-formatter.ts
│   │   ├── geocoding.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   │
│   ├── styles/             # Global styles
│   │   ├── design-tokens.css
│   │   ├── globals.css
│   │   └── animations.css
│   │
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── router.tsx          # Route configuration
│
├── .env.example
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### State Management Strategy

```typescript
// Zustand store example - Incident Store
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface IncidentStore {
  incidents: Incident[];
  selectedIncident: Incident | null;
  filters: FilterState;
  
  // Actions
  setIncidents: (incidents: Incident[]) => void;
  addIncident: (incident: Incident) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  selectIncident: (id: string | null) => void;
  setFilters: (filters: Partial<FilterState>) => void;
}

export const useIncidentStore = create<IncidentStore>()(
  devtools(
    persist(
      (set, get) => ({
        incidents: [],
        selectedIncident: null,
        filters: { severity: [], status: [] },
        
        setIncidents: (incidents) => set({ incidents }),
        addIncident: (incident) => 
          set((state) => ({ 
            incidents: [incident, ...state.incidents] 
          })),
        updateIncident: (id, updates) =>
          set((state) => ({
            incidents: state.incidents.map(i => 
              i.id === id ? { ...i, ...updates } : i
            )
          })),
        selectIncident: (id) =>
          set((state) => ({
            selectedIncident: id 
              ? state.incidents.find(i => i.id === id) || null 
              : null
          })),
        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters }
          }))
      }),
      { name: 'incident-storage' }
    )
  )
);
```

### Real-Time Integration (Frontend)

```typescript
// Socket client with automatic reconnection
import io from 'socket.io-client';
import { useEffect } from 'react';
import { useIncidentStore } from '@/stores/incident-store';

export const useRealtimeIncidents = () => {
  const { addIncident, updateIncident } = useIncidentStore();
  
  useEffect(() => {
    const socket = io(import.meta.env.VITE_WS_URL, {
      auth: { token: localStorage.getItem('token') },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
    
    // Listen for new incidents
    socket.on('incident:created', (incident) => {
      addIncident(incident);
      showNotification('New incident reported nearby');
    });
    
    // Listen for updates
    socket.on('incident:updated', ({ id, updates }) => {
      updateIncident(id, updates);
    });
    
    // Listen for cleared incidents
    socket.on('incident:cleared', ({ id }) => {
      updateIncident(id, { status: 'cleared' });
    });
    
    // Connection events
    socket.on('connect', () => {
      console.log('✓ Real-time connected');
    });
    
    socket.on('disconnect', () => {
      console.log('✗ Real-time disconnected');
    });
    
    return () => {
      socket.disconnect();
    };
  }, []);
};
```

### Performance Optimizations

1. **Code Splitting:**
```typescript
// Lazy load routes
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Analytics = lazy(() => import('@/pages/Analytics'));

<Suspense fallback={<LoadingSpinner />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Suspense>
```

2. **Image Optimization:**
```typescript
// Progressive image loading
<img 
  src={incident.photo} 
  loading="lazy"
  srcSet={`${incident.photo}?w=400 400w, ${incident.photo}?w=800 800w`}
  sizes="(max-width: 768px) 400px, 800px"
/>
```

3. **Virtualized Lists:**
```typescript
// React Window for long lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={incidents.length}
  itemSize={120}
  width="100%"
>
  {({ index, style }) => (
    <IncidentCard 
      style={style} 
      incident={incidents[index]} 
    />
  )}
</FixedSizeList>
```

4. **Memoization:**
```typescript
// Prevent unnecessary re-renders
const filteredIncidents = useMemo(() => {
  return incidents.filter(i => 
    filters.severity.includes(i.severity)
  );
}, [incidents, filters.severity]);
```

---

## Backend Architecture

### Tech Stack
- **Runtime:** Node.js 20+ LTS
- **Framework:** Express.js
- **Language:** TypeScript
- **Real-time:** Socket.io
- **Validation:** Zod
- **Authentication:** JWT + Refresh Tokens
- **File Upload:** Multer + Sharp (image processing)
- **Testing:** Jest + Supertest
- **API Docs:** Swagger/OpenAPI

### Microservices Architecture

Each service is independently deployable and scalable:

#### 1. **Incident Service** (Core)
```
Responsibilities:
- CRUD operations for incidents
- Report validation and processing
- Duplicate detection (merge nearby reports)
- Status management (active → cleared)
- Severity calculation

Endpoints:
POST   /api/incidents              - Create incident
GET    /api/incidents              - List incidents (filtered)
GET    /api/incidents/:id          - Get single incident
PATCH  /api/incidents/:id          - Update incident
DELETE /api/incidents/:id          - Delete (soft delete)
POST   /api/incidents/:id/verify   - Verify/upvote incident
```

#### 2. **User/Auth Service**
```
Responsibilities:
- User registration and login
- JWT token generation and validation
- Role-based access control (Citizen, Responder, Admin)
- Password reset, email verification
- Session management

Endpoints:
POST   /api/auth/register          - Sign up
POST   /api/auth/login             - Sign in
POST   /api/auth/logout            - Sign out
POST   /api/auth/refresh           - Refresh token
POST   /api/auth/forgot-password   - Password reset
GET    /api/users/me               - Get current user
PATCH  /api/users/me               - Update profile
```

#### 3. **Location Service**
```
Responsibilities:
- Geocoding (lat/lng → address)
- Reverse geocoding (address → lat/lng)
- Proximity search (incidents near user)
- Route management (saved routes)
- Geofencing (alert zones)

Endpoints:
POST   /api/location/geocode       - Address → Coordinates
POST   /api/location/reverse       - Coordinates → Address
GET    /api/location/nearby        - Find nearby incidents
POST   /api/routes                 - Save route
GET    /api/routes                 - Get user routes
```

#### 4. **Notification Service**
```
Responsibilities:
- Push notifications (FCM/APNS)
- SMS alerts (Twilio)
- Email notifications (SendGrid)
- In-app notifications
- User preference management

Endpoints:
POST   /api/notifications/send     - Send notification
GET    /api/notifications          - Get user notifications
PATCH  /api/notifications/:id/read - Mark as read
POST   /api/notifications/subscribe- Subscribe to topic
```

#### 5. **Analytics Service**
```
Responsibilities:
- Data aggregation (time-based, location-based)
- Heatmap generation
- Report generation (PDF, CSV)
- Trend analysis
- Performance metrics

Endpoints:
GET    /api/analytics/overview     - Key metrics
GET    /api/analytics/heatmap      - Heatmap data
GET    /api/analytics/trends       - Time-series data
POST   /api/analytics/report       - Generate report
GET    /api/analytics/locations    - Top dangerous locations
```

#### 6. **Media Service**
```
Responsibilities:
- Image upload and storage (S3)
- Image processing (resize, compress, watermark)
- CDN distribution
- Virus scanning
- Metadata extraction (EXIF, location)

Endpoints:
POST   /api/media/upload           - Upload photo
GET    /api/media/:id              - Get photo
DELETE /api/media/:id              - Delete photo
POST   /api/media/:id/process      - Process image
```

### Directory Structure

```
backend/
├── src/
│   ├── services/           # Business logic
│   │   ├── incident/
│   │   │   ├── incident.controller.ts
│   │   │   ├── incident.service.ts
│   │   │   ├── incident.model.ts
│   │   │   ├── incident.routes.ts
│   │   │   └── incident.validation.ts
│   │   ├── auth/
│   │   ├── location/
│   │   ├── notification/
│   │   ├── analytics/
│   │   └── media/
│   │
│   ├── middleware/         # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── logger.middleware.ts
│   │
│   ├── config/             # Configuration
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── aws.ts
│   │   └── env.ts
│   │
│   ├── utils/              # Utilities
│   │   ├── logger.ts
│   │   ├── jwt.ts
│   │   ├── email.ts
│   │   └── geocoding.ts
│   │
│   ├── types/              # TypeScript types
│   │   ├── express.d.ts
│   │   └── models.ts
│   │
│   ├── websocket/          # Socket.io server
│   │   ├── socket-server.ts
│   │   ├── handlers/
│   │   └── middleware/
│   │
│   ├── jobs/               # Background jobs
│   │   ├── cleanup-old-incidents.ts
│   │   ├── send-daily-summary.ts
│   │   └── update-analytics.ts
│   │
│   ├── app.ts              # Express app setup
│   └── server.ts           # Server entry point
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── tsconfig.json
├── package.json
└── Dockerfile
```

### API Layer (Express Setup)

```typescript
// app.ts - Express application setup
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { rateLimiter } from './middleware/rate-limit.middleware';

// Import routes
import incidentRoutes from './services/incident/incident.routes';
import authRoutes from './services/auth/auth.routes';
import locationRoutes from './services/location/location.routes';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));

// Rate limiting
app.use('/api/', rateLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api/incidents', incidentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/location', locationRoutes);

// Error handling (must be last)
app.use(errorHandler);

export default app;
```

### Service Layer Example

```typescript
// incident.service.ts - Business logic
import { Incident, IIncident } from './incident.model';
import { AppError } from '@/utils/errors';
import { socketServer } from '@/websocket/socket-server';

export class IncidentService {
  
  // Create new incident
  async createIncident(data: Partial<IIncident>): Promise<IIncident> {
    // Check for duplicates (within 100m, last 5 minutes)
    const duplicates = await this.findDuplicates(
      data.location!, 
      100, 
      5 * 60 * 1000
    );
    
    if (duplicates.length > 0) {
      // Merge with existing incident
      return this.mergeIncident(duplicates[0]._id, data);
    }
    
    // Create new incident
    const incident = await Incident.create({
      ...data,
      status: 'active',
      reportCount: 1,
      createdAt: new Date()
    });
    
    // Emit real-time event
    socketServer.emitIncidentCreated(incident);
    
    // Send notifications to nearby users
    await this.notifyNearbyUsers(incident);
    
    return incident;
  }
  
  // Find duplicates (same location, recent)
  private async findDuplicates(
    location: { lat: number; lng: number },
    radiusMeters: number,
    timeWindowMs: number
  ) {
    const since = new Date(Date.now() - timeWindowMs);
    
    return Incident.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [location.lng, location.lat]
          },
          $maxDistance: radiusMeters
        }
      },
      createdAt: { $gte: since },
      status: { $ne: 'cleared' }
    });
  }
  
  // Merge duplicate report
  private async mergeIncident(
    existingId: string, 
    newData: Partial<IIncident>
  ) {
    const incident = await Incident.findByIdAndUpdate(
      existingId,
      {
        $inc: { reportCount: 1 },
        $push: { 
          photos: { $each: newData.photos || [] },
          reports: {
            reportedBy: newData.reportedBy,
            timestamp: new Date(),
            details: newData.details
          }
        },
        // Upgrade severity if new report is worse
        $max: { 
          severityScore: this.calculateSeverityScore(newData) 
        }
      },
      { new: true }
    );
    
    // Emit update
    socketServer.emitIncidentUpdated(incident);
    
    return incident;
  }
  
  // Get incidents with filters
  async getIncidents(filters: any) {
    const query: any = {};
    
    if (filters.severity) {
      query.severity = { $in: filters.severity };
    }
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.bounds) {
      // Geospatial query for map bounds
      query.location = {
        $geoWithin: {
          $box: [
            [filters.bounds.sw.lng, filters.bounds.sw.lat],
            [filters.bounds.ne.lng, filters.bounds.ne.lat]
          ]
        }
      };
    }
    
    return Incident.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 100)
      .populate('reportedBy', 'name avatar');
  }
  
  // Update incident status
  async updateStatus(id: string, status: string, userId: string) {
    // Verify user has permission (responder only)
    // ... permission check ...
    
    const incident = await Incident.findByIdAndUpdate(
      id,
      { 
        status,
        updatedBy: userId,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!incident) {
      throw new AppError('Incident not found', 404);
    }
    
    // Emit update
    socketServer.emitIncidentUpdated(incident);
    
    // If cleared, notify followers
    if (status === 'cleared') {
      await this.notifyIncidentCleared(incident);
    }
    
    return incident;
  }
  
  // Calculate severity score (0-100)
  private calculateSeverityScore(data: Partial<IIncident>): number {
    let score = 0;
    
    score += (data.vehicleCount || 1) * 10;  // More vehicles = worse
    score += data.injuries ? 30 : 0;          // Injuries = serious
    score += data.lanesBlocked === 'all' ? 25 : 10;
    score += data.reportCount || 1 * 5;       // Multiple reports = confirmed
    
    return Math.min(score, 100);
  }
  
  // Notify nearby users
  private async notifyNearbyUsers(incident: IIncident) {
    // Find users within 10 miles who have notifications enabled
    // ... implement notification logic ...
  }
  
  private async notifyIncidentCleared(incident: IIncident) {
    // Notify users who reported or are following this incident
    // ... implement notification logic ...
  }
}

export const incidentService = new IncidentService();
```

### WebSocket Server (Socket.io)

```typescript
// socket-server.ts - Real-time events
import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyJWT } from '@/utils/jwt';
import { logger } from '@/utils/logger';

export class SocketIOServer {
  private io: SocketServer;
  
  constructor(httpServer: HTTPServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(','),
        credentials: true
      },
      transports: ['websocket', 'polling']
    });
    
    this.setupMiddleware();
    this.setupHandlers();
  }
  
  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication required'));
        }
        
        const user = await verifyJWT(token);
        socket.data.user = user;
        
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }
  
  private setupHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.data.user.id;
      logger.info(`User connected: ${userId}`);
      
      // Join user's personal room
      socket.join(`user:${userId}`);
      
      // Join location-based rooms
      socket.on('subscribe:location', (location: { lat: number, lng: number }) => {
        const room = this.getLocationRoom(location);
        socket.join(room);
      });
      
      // Responder-specific rooms
      if (socket.data.user.role === 'responder') {
        socket.join('responders');
      }
      
      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${userId}`);
      });
    });
  }
  
  // Emit new incident to relevant users
  emitIncidentCreated(incident: any) {
    const room = this.getLocationRoom(incident.location);
    
    // Emit to users in that geographic area
    this.io.to(room).emit('incident:created', incident);
    
    // Emit to all responders
    this.io.to('responders').emit('incident:created', incident);
  }
  
  // Emit incident update
  emitIncidentUpdated(incident: any) {
    const room = this.getLocationRoom(incident.location);
    this.io.to(room).emit('incident:updated', incident);
  }
  
  // Emit to specific user
  emitToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }
  
  // Convert lat/lng to grid-based room (e.g., "loc:37.7_-122.4")
  private getLocationRoom(location: { lat: number, lng: number }) {
    const latGrid = Math.floor(location.lat * 10) / 10;
    const lngGrid = Math.floor(location.lng * 10) / 10;
    return `loc:${latGrid}_${lngGrid}`;
  }
}

export let socketServer: SocketIOServer;

export const initSocketServer = (httpServer: HTTPServer) => {
  socketServer = new SocketIOServer(httpServer);
  return socketServer;
};
```

---

## Database Design

### MongoDB (Primary Database)

**Why MongoDB:**
- Flexible schema for evolving incident data
- Geospatial queries (built-in $near, $geoWithin)
- Fast writes (critical for real-time reporting)
- Horizontal scalability (sharding)
- Document model fits incident structure

### Collections & Schemas

#### 1. **Incidents Collection**

```typescript
interface IIncident {
  _id: ObjectId;
  
  // Location (GeoJSON for indexing)
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  
  // Incident details
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  severityScore: number; // 0-100
  status: 'active' | 'dispatched' | 'on-scene' | 'cleared';
  type: 'car-crash' | 'motorcycle' | 'truck' | 'pedestrian' | 'other';
  
  vehicleCount: number;
  injuries: boolean;
  injuryCount?: number;
  lanesBlocked: 'none' | 'partial' | 'all';
  
  // Reporting
  reportedBy: ObjectId; // User ID
  reportCount: number; // Number of merged reports
  reports: Array<{
    reportedBy: ObjectId;
    timestamp: Date;
    details?: string;
  }>;
  verifications: ObjectId[]; // Users who verified
  
  // Media
  photos: Array<{
    url: string;
    uploadedBy: ObjectId;
    uploadedAt: Date;
    thumbnailUrl: string;
  }>;
  
  // Response tracking
  assignedResponders: Array<{
    userId: ObjectId;
    role: 'police' | 'ambulance' | 'fire' | 'tow';
    assignedAt: Date;
    arrivedAt?: Date;
  }>;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  clearedAt?: Date;
  
  // Analytics
  views: number;
  affectedUsers: number; // Estimated from notifications
  
  // Soft delete
  deletedAt?: Date;
}

// Indexes
db.incidents.createIndex({ location: "2dsphere" });
db.incidents.createIndex({ status: 1, createdAt: -1 });
db.incidents.createIndex({ severity: 1 });
db.incidents.createIndex({ createdAt: -1 });
db.incidents.createIndex({ "address.city": 1, createdAt: -1 });
```

#### 2. **Users Collection**

```typescript
interface IUser {
  _id: ObjectId;
  
  // Authentication
  email: string; // unique
  passwordHash: string;
  emailVerified: boolean;
  phoneNumber?: string;
  phoneVerified: boolean;
  
  // Profile
  name: string;
  avatar?: string;
  role: 'citizen' | 'responder' | 'admin';
  
  // Responder details (if applicable)
  responderInfo?: {
    agency: string;
    badgeNumber: string;
    department: 'police' | 'ems' | 'fire';
    verified: boolean;
  };
  
  // Preferences
  notificationPreferences: {
    push: boolean;
    email: boolean;
    sms: boolean;
    alertRadius: number; // miles
  };
  
  // Saved routes
  routes: Array<{
    name: string;
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    waypoints?: Array<{ lat: number; lng: number }>;
    notifyBeforeDeparture: boolean;
    usualDepartureTimes?: string[]; // e.g., ["08:00", "17:00"]
  }>;
  
  // Stats
  incidentsReported: number;
  incidentsVerified: number;
  reputationScore: number; // Gamification
  
  // Metadata
  createdAt: Date;
  lastLoginAt: Date;
  
  // Security
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

// Indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ "routes.name": 1 });
```

#### 3. **Notifications Collection**

```typescript
interface INotification {
  _id: ObjectId;
  
  userId: ObjectId;
  type: 'incident-created' | 'incident-cleared' | 'route-alert' | 'system';
  
  title: string;
  message: string;
  
  // Related entities
  incidentId?: ObjectId;
  routeId?: string;
  
  // Status
  read: boolean;
  readAt?: Date;
  
  // Delivery
  channels: Array<'push' | 'email' | 'sms'>;
  deliveryStatus: {
    push?: 'sent' | 'failed';
    email?: 'sent' | 'failed';
    sms?: 'sent' | 'failed';
  };
  
  createdAt: Date;
  expiresAt: Date; // Auto-delete after 30 days
}

// Indexes
db.notifications.createIndex({ userId: 1, createdAt: -1 });
db.notifications.createIndex({ read: 1 });
db.notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
```

### Redis (Caching & Session Store)

**Use Cases:**
- Session management (JWT refresh tokens)
- Rate limiting (API calls per user)
- Real-time data (active users, live incident counts)
- Pub/Sub for inter-service communication
- Cache frequently accessed data (hot incidents)

```typescript
// Redis data structures

// 1. Session storage
SET session:{userId} {refreshToken} EX 604800 // 7 days

// 2. Rate limiting
INCR rate:{ip}:{endpoint}
EXPIRE rate:{ip}:{endpoint} 60

// 3. Cache incidents (hot data)
SET incident:{id} {JSON} EX 300 // 5 minutes

// 4. Real-time stats
HINCRBY stats:today incidents 1
HINCRBY stats:today users_notified 1250

// 5. Pub/Sub for microservices
PUBLISH incident:created {incidentId}
```

### PostgreSQL (Analytics & Reporting)

**Why PostgreSQL for Analytics:**
- Complex queries with JOINs
- Time-series data (TimescaleDB extension)
- Materialized views for reports
- ACID compliance for financial/audit data

```sql
-- Time-series table for analytics
CREATE TABLE incident_analytics (
  id SERIAL PRIMARY KEY,
  incident_id VARCHAR(24) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  
  -- Location
  city VARCHAR(100),
  state VARCHAR(50),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Details
  severity VARCHAR(20),
  vehicle_count INT,
  has_injuries BOOLEAN,
  lanes_blocked VARCHAR(20),
  
  -- Response metrics
  time_to_dispatch_sec INT,
  time_to_arrival_sec INT,
  time_to_clear_sec INT,
  
  -- Context
  day_of_week INT,
  hour_of_day INT,
  weather_condition VARCHAR(50),
  traffic_volume VARCHAR(20)
);

-- Indexes for common queries
CREATE INDEX idx_timestamp ON incident_analytics (timestamp DESC);
CREATE INDEX idx_location ON incident_analytics (city, state);
CREATE INDEX idx_severity ON incident_analytics (severity, timestamp);

-- Materialized view for top locations
CREATE MATERIALIZED VIEW top_dangerous_locations AS
SELECT 
  city,
  state,
  COUNT(*) as incident_count,
  AVG(time_to_clear_sec) as avg_clear_time,
  SUM(CASE WHEN severity = 'severe' OR severity = 'critical' THEN 1 ELSE 0 END) as severe_count
FROM incident_analytics
WHERE timestamp >= NOW() - INTERVAL '1 year'
GROUP BY city, state
ORDER BY incident_count DESC
LIMIT 100;

-- Refresh view daily
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW top_dangerous_locations;
END;
$$ LANGUAGE plpgsql;
```

---

## Real-Time Data Flow

### Event Flow Diagram

```
┌─────────────┐
│   Client    │
│ (React App) │
└──────┬──────┘
       │
       │ 1. User reports accident
       │ POST /api/incidents
       │
       ▼
┌──────────────────┐
│   REST API       │
│  (Express)       │
└──────┬───────────┘
       │
       │ 2. Validate & process
       │
       ▼
┌──────────────────┐
│ Incident Service │
│  (Business Logic)│
└──────┬───────────┘
       │
       │ 3. Save to database
       │
       ▼
┌──────────────────┐
│    MongoDB       │
│  (Incidents DB)  │
└──────────────────┘
       │
       │ 4. Emit event
       │
       ▼
┌──────────────────┐
│  Socket.io       │
│   Server         │
└──────┬───────────┘
       │
       │ 5. Broadcast to clients
       │
       ├──────────────────┬──────────────────┬─────────────────┐
       │                  │                  │                 │
       ▼                  ▼                  ▼                 ▼
┌───────────┐      ┌───────────┐     ┌───────────┐    ┌──────────┐
│  Nearby   │      │ Responder │     │  Route    │    │ Reporter │
│  Citizens │      │ Dashboard │     │ Followers │    │ (Confirm)│
└───────────┘      └───────────┘     └───────────┘    └──────────┘
   (Push)            (Real-time)      (Alert)          (Success)
```

### Real-Time Event Types

```typescript
// Events emitted by server

// 1. Incident lifecycle
'incident:created'      → New incident reported
'incident:updated'      → Incident details changed
'incident:verified'     → User verified incident
'incident:dispatched'   → Responder assigned
'incident:arrived'      → Responder on scene
'incident:cleared'      → Incident resolved

// 2. User notifications
'notification:new'      → New notification for user
'notification:route'    → Alert on saved route

// 3. System events
'system:maintenance'    → Planned downtime
'system:alert'          → Critical system message

// 4. Analytics (responder dashboard)
'stats:update'          → Live stats updated
'map:cluster-update'    → Map clusters recalculated
```

### Notification Flow

```
User reports incident
        │
        ▼
┌───────────────────┐
│ Incident Service  │
│ Creates incident  │
└─────────┬─────────┘
          │
          ├─────────────────────────────┐
          │                             │
          ▼                             ▼
┌───────────────────┐         ┌──────────────────┐
│ Notification Svc  │         │  Socket.io       │
│ Determines who    │         │  Emit real-time  │
│ should be notified│         │  to connected    │
└─────────┬─────────┘         │  clients         │
          │                   └──────────────────┘
          │
    ┌─────┴────────┬──────────┬──────────┐
    │              │          │          │
    ▼              ▼          ▼          ▼
┌────────┐   ┌─────────┐ ┌────────┐ ┌────────┐
│  Push  │   │  Email  │ │  SMS   │ │ In-App │
│  (FCM) │   │SendGrid │ │Twilio  │ │ Notif  │
└────────┘   └─────────┘ └────────┘ └────────┘
    │              │          │          │
    ▼              ▼          ▼          ▼
┌────────────────────────────────────────────┐
│        Users receive notification          │
│  (Push on phone, email, SMS, or in-app)    │
└────────────────────────────────────────────┘
```

---

## Security Architecture

### Authentication & Authorization

```
┌──────────────────────────────────────────────┐
│          Authentication Flow                 │
└──────────────────────────────────────────────┘

1. User Login
   Client → POST /api/auth/login { email, password }
        ↓
   Server → Verify credentials
        ↓
   Generate 2 tokens:
   - Access Token (JWT, short-lived: 15 min)
   - Refresh Token (long-lived: 7 days, stored in Redis)
        ↓
   Response: { accessToken, refreshToken, user }

2. Authenticated Request
   Client → GET /api/incidents
            Headers: { Authorization: Bearer <accessToken> }
        ↓
   Middleware → Verify JWT signature
             → Check expiration
             → Extract user from token
        ↓
   Route Handler → Process request with user context

3. Token Refresh (when access token expires)
   Client → POST /api/auth/refresh { refreshToken }
        ↓
   Server → Verify refresh token in Redis
        ↓
   Generate new access token
        ↓
   Response: { accessToken }

4. Logout
   Client → POST /api/auth/logout { refreshToken }
        ↓
   Server → Delete refresh token from Redis
        ↓
   Client → Clear local tokens
```

### JWT Structure

```typescript
// Access Token Payload
{
  sub: "user_id",              // Subject (user ID)
  email: "user@example.com",
  role: "citizen",             // or "responder", "admin"
  iat: 1702593600,             // Issued at
  exp: 1702594500              // Expires in 15 minutes
}

// Middleware to verify and extract
app.use('/api/protected', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new Error('No token provided');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});
```

### Role-Based Access Control (RBAC)

```typescript
// Permission matrix
const permissions = {
  citizen: [
    'incidents:read',
    'incidents:create',
    'incidents:verify',
    'profile:update'
  ],
  responder: [
    'incidents:read',
    'incidents:create',
    'incidents:update',      // Can update status
    'incidents:assign',      // Can claim incidents
    'dashboard:access'
  ],
  admin: [
    '*'                      // All permissions
  ]
};

// Middleware
const requireRole = (...roles: string[]) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
};

// Usage
router.patch('/incidents/:id/status', 
  authenticate,
  requireRole('responder', 'admin'),
  updateIncidentStatus
);
```

### Security Best Practices

#### 1. **Input Validation**
```typescript
import { z } from 'zod';

const createIncidentSchema = z.object({
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }),
  severity: z.enum(['minor', 'moderate', 'severe', 'critical']),
  vehicleCount: z.number().int().min(1).max(20),
  injuries: z.boolean(),
  photos: z.array(z.string().url()).max(10)
});

// Middleware
const validate = (schema: z.ZodSchema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: error.errors });
    }
  };
};

router.post('/incidents', validate(createIncidentSchema), createIncident);
```

#### 2. **Rate Limiting**
```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const limiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);

// Stricter limits for reporting (prevent spam)
const reportLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 reports per minute
  message: 'Too many reports, slow down'
});

router.post('/incidents', reportLimiter, createIncident);
```

#### 3. **SQL Injection Prevention**
```typescript
// ✓ GOOD: Use parameterized queries
const result = await db.query(
  'SELECT * FROM incidents WHERE id = $1',
  [incidentId]
);

// ✗ BAD: String concatenation
const result = await db.query(
  `SELECT * FROM incidents WHERE id = '${incidentId}'`
);
```

#### 4. **XSS Prevention**
```typescript
import helmet from 'helmet';
import xss from 'xss-clean';

app.use(helmet()); // Sets security headers
app.use(xss());    // Sanitizes user input

// Content Security Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
  }
}));
```

#### 5. **File Upload Security**
```typescript
import multer from 'multer';
import path from 'path';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 5                     // 5 files max
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only image files allowed'));
  }
});

// Virus scanning (using ClamAV or AWS Macie)
const scanFile = async (buffer: Buffer) => {
  // Integrate with virus scanner
  const isSafe = await virusScanner.scan(buffer);
  if (!isSafe) {
    throw new Error('File contains malware');
  }
};
```

#### 6. **HTTPS Only**
```typescript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// Strict Transport Security
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}));
```

#### 7. **Environment Variables**
```bash
# .env (never commit to git)
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/traffic_db
REDIS_URL=redis://user:pass@host:6379
POSTGRES_URL=postgresql://user:pass@host:5432/analytics_db

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET=another-super-secret-key

# External APIs
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=traffic-incident-photos
GOOGLE_MAPS_API_KEY=AIza...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...

# URLs
API_URL=https://api.trafficplatform.com
WS_URL=wss://ws.trafficplatform.com
CLIENT_URL=https://trafficplatform.com
```

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                     │
└──────────────────────────────────────────────────────────────┘

                        ┌────────────┐
                        │  Route 53  │
                        │    DNS     │
                        └──────┬─────┘
                               │
                        ┌──────▼─────┐
                        │ CloudFlare │
                        │  CDN + WAF │
                        └──────┬─────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
         ┌──────▼──────┐             ┌───────▼────────┐
         │   S3 + CF   │             │  Load Balancer │
         │  (Static)   │             │   (ALB/NLB)    │
         └─────────────┘             └────────┬───────┘
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        │                     │                     │
                 ┌──────▼───────┐    ┌───────▼────────┐   ┌───────▼────────┐
                 │   ECS/EKS    │    │   ECS/EKS      │   │   ECS/EKS      │
                 │  Instance 1  │    │  Instance 2    │   │  Instance 3    │
                 │  (API + WS)  │    │  (API + WS)    │   │  (API + WS)    │
                 └──────┬───────┘    └───────┬────────┘   └───────┬────────┘
                        │                    │                     │
                        └────────────────────┼─────────────────────┘
                                             │
                        ┌────────────────────┴────────────────────┐
                        │                                         │
                 ┌──────▼──────┐                          ┌──────▼──────┐
                 │  MongoDB    │                          │   Redis     │
                 │   Atlas     │                          │ ElastiCache │
                 │ (Multi-AZ)  │                          │  (Cluster)  │
                 └─────────────┘                          └─────────────┘

External Services:
- S3 (photo storage)
- SES (email)
- SNS (push notifications)
- CloudWatch (monitoring)
- Datadog (APM)
```

### Scaling Strategy

**Horizontal Scaling:**
- Auto-scaling groups (2-10 instances based on CPU/memory)
- Load balancer distributes traffic
- Stateless API servers (session in Redis)
- Socket.io with Redis adapter (sticky sessions)

**Database Scaling:**
- MongoDB: Replica set (1 primary + 2 secondaries)
- Redis: Cluster mode (sharding)
- PostgreSQL: Read replicas for analytics

**CDN:**
- Static assets (React build) on CloudFront
- Images on S3 with CloudFront distribution
- 90%+ cache hit rate

---

## Monitoring & Logging

```typescript
// Structured logging with Winston
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Usage
logger.info('Incident created', { 
  incidentId: incident._id, 
  severity: incident.severity,
  location: incident.location
});

logger.error('Failed to send notification', { 
  error: error.message,
  userId: user._id
});
```

### Metrics to Monitor

```
Application Metrics:
- Request rate (req/sec)
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Active WebSocket connections

Business Metrics:
- Incidents reported per hour
- Average response time (dispatch to on-scene)
- User engagement (DAU, MAU)
- Notification delivery rate

Infrastructure Metrics:
- CPU usage
- Memory usage
- Database connections
- Cache hit rate
- Network I/O
```

---

## Development Workflow

```
Developer Workflow:

1. Local Development
   - Docker Compose (MongoDB, Redis, API)
   - Hot reload (Vite frontend, nodemon backend)
   - Mock data seeding

2. Feature Branch
   - Git feature branch
   - Write code + tests
   - Run tests locally

3. Pull Request
   - Create PR → Triggers CI
   - Automated tests run
   - Code review required
   - Merge to main

4. CI/CD Pipeline (GitHub Actions)
   ┌─────────────────┐
   │  Push to main   │
   └────────┬────────┘
            │
   ┌────────▼────────┐
   │  Run Tests      │ (Unit, Integration, E2E)
   └────────┬────────┘
            │
   ┌────────▼────────┐
   │  Build Docker   │
   │  Images         │
   └────────┬────────┘
            │
   ┌────────▼────────┐
   │  Push to ECR    │ (Container Registry)
   └────────┬────────┘
            │
   ┌────────▼────────┐
   │  Deploy to      │
   │  Staging        │ (Automated)
   └────────┬────────┘
            │
   ┌────────▼────────┐
   │  Run Smoke      │
   │  Tests          │
   └────────┬────────┘
            │
   ┌────────▼────────┐
   │  Manual Approval│
   │  for Production │
   └────────┬────────┘
            │
   ┌────────▼────────┐
   │  Deploy to Prod │ (Blue-Green Deployment)
   └─────────────────┘
```

---

This architecture is production-ready, scalable to millions of users, secure, and follows industry best practices. Each component is designed for high availability, fault tolerance, and real-time performance.