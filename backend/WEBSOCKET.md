# Socket.io Real-Time Engine

## Overview

This real-time engine provides live updates for incidents, location-based events, and notifications using Socket.io.

## Features

- ✅ **JWT Authentication** - Secure socket connections with token verification
- ✅ **Location-based Rooms** - Grid-based spatial indexing for efficient broadcasting
- ✅ **Incident Broadcasting** - Real-time incident creation, updates, and clearing
- ✅ **Horizontal Scaling** - Redis adapter for multi-server deployments
- ✅ **Graceful Disconnect** - Automatic cleanup and reconnection handling
- ✅ **Role-based Access** - Different events for citizens, responders, and admins

## Architecture

```
websocket/
├── index.js              # Main Socket.io server setup
├── middleware/
│   └── auth.js          # Authentication middleware
├── handlers/
│   ├── incident.js      # Incident event handlers
│   └── location.js      # Location subscription handlers
└── utils/
    └── rooms.js         # Room management utilities
```

## Client Connection

### Authentication

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token-here'
  }
});

// Or pass token in query
const socket = io('http://localhost:5000?token=your-jwt-token');
```

### Connection Events

```javascript
socket.on('connection:success', (data) => {
  console.log('Connected:', data);
  // { socketId, authenticated, role, message, timestamp }
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

## Location-Based Subscriptions

### Subscribe to Location

```javascript
socket.emit('location:subscribe', {
  lat: 37.7749,
  lng: -122.4194,
  radius: 10 // kilometers
}, (response) => {
  console.log(response);
  // { success: true, message: "Subscribed to updates within 10km", ... }
});
```

### Update Location

```javascript
socket.emit('location:update', {
  lat: 37.7800,
  lng: -122.4100,
  radius: 15
}, (response) => {
  console.log(response);
});
```

### Unsubscribe from Location

```javascript
socket.emit('location:unsubscribe', {}, (response) => {
  console.log(response);
});
```

### Receive Location-based Incidents

```javascript
socket.on('incident:created', (data) => {
  console.log('New incident nearby:', data.incident);
  // { id, type, severity, location, address, status, createdAt }
});

socket.on('incident:updated', (data) => {
  console.log('Incident updated:', data);
});

socket.on('incident:cleared', (data) => {
  console.log('Incident cleared:', data);
});
```

## Incident Subscriptions

### Subscribe to Specific Incident

```javascript
socket.emit('incident:subscribe', {
  incidentId: 'incident_xyz789'
}, (response) => {
  console.log(response);
});
```

### Receive Incident Updates

```javascript
socket.on('incident:status-updated', (data) => {
  console.log('Status updated:', data);
  // { incidentId, status, notes, updatedBy, timestamp }
});
```

### Update Incident Status (Responders Only)

```javascript
socket.emit('incident:update-status', {
  incidentId: 'incident_xyz789',
  status: 'on-scene',
  notes: 'Arrived at location, assessing situation'
}, (response) => {
  console.log(response);
});
```

## City Subscriptions

```javascript
socket.emit('city:subscribe', {
  city: 'San Francisco',
  state: 'CA'
}, (response) => {
  console.log(response);
});
```

## Responder-Only Events

Responders automatically join the responder room and receive:

```javascript
socket.on('incident:new', (data) => {
  console.log('New incident requires response:', data);
  // { incident: { id, type, severity, location, requiresResponse } }
});
```

## Admin Events

### Get Server Statistics

```javascript
socket.emit('server:stats', {}, (response) => {
  console.log(response.data);
  // { totalConnections, authenticatedUsers, responders, transports }
});
```

## Health Check

```javascript
socket.emit('ping', (response) => {
  console.log('Latency:', Date.now() - response.timestamp);
});

socket.emit('status', (response) => {
  console.log('Connection status:', response.data);
  // { socketId, connected, authenticated, userId, role, rooms, location }
});
```

## Broadcasting from Server

### Broadcast Incident Created

```javascript
import { broadcastIncidentCreated } from './websocket/handlers/incident.js';

// After creating an incident
const io = req.app.get('io');
broadcastIncidentCreated(io, incident);
```

### Broadcast Incident Updated

```javascript
import { broadcastIncidentUpdated } from './websocket/handlers/incident.js';

const io = req.app.get('io');
broadcastIncidentUpdated(io, incident);
```

### Broadcast Incident Cleared

```javascript
import { broadcastIncidentCleared } from './websocket/handlers/incident.js';

const io = req.app.get('io');
broadcastIncidentCleared(io, incident);
```

### Send to Specific User

```javascript
import { RoomManager } from './websocket/utils/rooms.js';

const io = req.app.get('io');
const roomManager = new RoomManager(io);

roomManager.sendToUser(userId, 'notification:new', {
  title: 'New Notification',
  message: 'You have a new message',
});
```

## Room Structure

### Location Rooms
Grid-based spatial indexing (2 decimal precision ≈ 1km grids):
- Format: `location:3777:-12241`
- Subscribing to a location joins multiple neighboring grids

### Incident Rooms
- Format: `incident:incident_xyz789`
- All users watching a specific incident

### User Rooms
- Format: `user:user_123abc`
- Private room for user-specific notifications

### Special Rooms
- `responders` - All active responders
- `admins` - All admin users
- `city:ca:san-francisco` - City-specific updates

## Horizontal Scaling

When `REDIS_HOST` is configured in production, Socket.io automatically uses Redis adapter for multi-server deployments:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

This allows:
- Multiple server instances
- Load balancing
- Shared room state
- Cross-server broadcasting

## Error Handling

All socket events support callback-based error handling:

```javascript
socket.emit('location:subscribe', data, (response) => {
  if (!response.success) {
    console.error('Error:', response.error);
  }
});
```

## Performance Considerations

- **Grid Precision**: 2 decimal places (±1km) balances accuracy vs. room count
- **Radius**: Default 10km, max recommended 50km
- **Connection Limit**: Configure based on server capacity
- **Ping Interval**: 25s keeps connections alive
- **Timeout**: 60s before disconnect

## Security

- JWT token required for authenticated features
- Role-based access control
- Rate limiting on API endpoints (affects token generation)
- Input validation on all events
- Sanitization of user data

## Monitoring

Check connection status:

```javascript
socket.emit('status', (response) => {
  console.log(response.data);
});
```

Admin monitoring:

```javascript
socket.emit('server:stats', (response) => {
  console.log(response.data);
});
```

## Graceful Shutdown

Server sends shutdown notification before closing:

```javascript
socket.on('server:shutdown', (data) => {
  console.log('Server shutting down:', data.message);
  // Implement reconnection logic
});
```
