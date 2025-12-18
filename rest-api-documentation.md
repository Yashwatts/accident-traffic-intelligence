# REST API Documentation
## Traffic & Accident Intelligence Platform

**Version:** 1.0  
**Base URL:** `https://api.trafficintel.com/v1`  
**Last Updated:** December 14, 2025

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Incidents](#2-incidents)
3. [Traffic Status](#3-traffic-status)
4. [Notifications](#4-notifications)
5. [Routes](#5-routes)
6. [Users](#6-users)
7. [Admin Operations](#7-admin-operations)
8. [Analytics](#8-analytics)

---

## General Conventions

### Authentication

Most endpoints require authentication via JWT Bearer token:

```
Authorization: Bearer <access_token>
```

### Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "meta": {
    "timestamp": "2025-12-14T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2025-12-14T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### Pagination

Paginated endpoints accept:
- `page` (default: 1)
- `limit` (default: 20, max: 100)

Response includes:

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## 1. Authentication

### 1.1 Register User

Create a new user account.

**Endpoint:** `POST /auth/register`  
**Access:** Public  
**Rate Limit:** 5 requests per hour per IP

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890" // Optional
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123abc",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "citizen",
      "emailVerified": false
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "refresh_token_here",
      "expiresIn": 900 // seconds (15 minutes)
    }
  },
  "message": "Account created successfully. Please verify your email."
}
```

**Validation Errors:**

- Email already exists: `409 Conflict`
- Invalid email format: `422 Validation Error`
- Weak password: `422 Validation Error` (min 8 chars, 1 uppercase, 1 number, 1 special)

---

### 1.2 Login

Authenticate user and receive tokens.

**Endpoint:** `POST /auth/login`  
**Access:** Public  
**Rate Limit:** 10 requests per minute per IP

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123abc",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "citizen",
      "emailVerified": true,
      "avatar": "https://cdn.trafficintel.com/avatars/user_123abc.jpg"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "refresh_token_here",
      "expiresIn": 900
    }
  }
}
```

**Errors:**

- Invalid credentials: `401 Unauthorized`
- Account suspended: `403 Forbidden`
- Too many failed attempts: `429 Too Many Requests` (locked for 15 minutes)

---

### 1.3 Refresh Token

Get new access token using refresh token.

**Endpoint:** `POST /auth/refresh`  
**Access:** Public (requires refresh token)

**Request Body:**

```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token_here",
    "expiresIn": 900
  }
}
```

**Errors:**

- Invalid/expired refresh token: `401 Unauthorized`

---

### 1.4 Logout

Invalidate current tokens.

**Endpoint:** `POST /auth/logout`  
**Access:** Authenticated

**Request Body:**

```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:** `204 No Content`

---

### 1.5 Verify Email

Verify user's email address.

**Endpoint:** `GET /auth/verify-email?token=<verification_token>`  
**Access:** Public

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Errors:**

- Invalid/expired token: `400 Bad Request`

---

### 1.6 Request Password Reset

Send password reset email.

**Endpoint:** `POST /auth/forgot-password`  
**Access:** Public  
**Rate Limit:** 3 requests per hour per email

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "If an account exists with this email, a reset link has been sent."
}
```

---

### 1.7 Reset Password

Reset password using token from email.

**Endpoint:** `POST /auth/reset-password`  
**Access:** Public

**Request Body:**

```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 2. Incidents

### 2.1 Create Incident

Report a new incident.

**Endpoint:** `POST /incidents`  
**Access:** Authenticated  
**Rate Limit:** 10 incidents per hour per user

**Request Body:**

```json
{
  "location": {
    "lat": 37.7749,
    "lng": -122.4194
  },
  "type": "car-crash",
  "severity": "moderate",
  "vehicleCount": 2,
  "injuries": true,
  "injuryCount": 1,
  "injurySeverity": "minor",
  "lanesBlocked": "partial",
  "lanesAffected": ["left", "center"],
  "description": "Two-car collision on Highway 101 northbound",
  "conditions": {
    "weather": "clear",
    "lighting": "daylight",
    "roadCondition": "dry"
  }
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "incident": {
      "id": "incident_xyz789",
      "location": {
        "lat": 37.7749,
        "lng": -122.4194
      },
      "address": {
        "formattedAddress": "US-101, San Francisco, CA 94102",
        "city": "San Francisco",
        "state": "CA"
      },
      "type": "car-crash",
      "severity": "moderate",
      "severityScore": 55,
      "status": "active",
      "vehicleCount": 2,
      "injuries": true,
      "reportedBy": {
        "id": "user_123abc",
        "name": "John Doe",
        "role": "citizen"
      },
      "reportCount": 1,
      "verifications": [],
      "photos": [],
      "createdAt": "2025-12-14T10:30:00Z",
      "updatedAt": "2025-12-14T10:30:00Z"
    }
  },
  "message": "Incident reported successfully"
}
```

**Duplicate Detection:**

If similar incident exists within 500m and 30 minutes:

```json
{
  "success": true,
  "data": {
    "incident": {
      "id": "incident_existing",
      "reportCount": 2,
      "...": "existing incident data"
    },
    "merged": true
  },
  "message": "Your report has been added to an existing incident"
}
```

**Errors:**

- Invalid coordinates: `422 Validation Error`
- Missing required fields: `422 Validation Error`
- Rate limit exceeded: `429 Too Many Requests`

---

### 2.2 Get Incidents Near Location

Get incidents within radius of coordinates.

**Endpoint:** `GET /incidents/nearby`  
**Access:** Public  
**Rate Limit:** 60 requests per minute

**Query Parameters:**

- `lat` (required) - Latitude
- `lng` (required) - Longitude
- `radius` (optional) - Radius in meters (default: 10000, max: 50000)
- `severity` (optional) - Filter by severity (comma-separated: "moderate,severe,critical")
- `status` (optional) - Filter by status (default: "active,dispatched,on-scene,clearing")
- `limit` (optional) - Number of results (default: 50, max: 100)

**Example Request:**

```
GET /incidents/nearby?lat=37.7749&lng=-122.4194&radius=5000&severity=severe,critical
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "incidents": [
      {
        "id": "incident_xyz789",
        "location": {
          "lat": 37.7749,
          "lng": -122.4194
        },
        "address": {
          "formattedAddress": "US-101, San Francisco, CA 94102",
          "city": "San Francisco",
          "state": "CA"
        },
        "type": "car-crash",
        "severity": "severe",
        "severityScore": 75,
        "status": "active",
        "vehicleCount": 3,
        "injuries": true,
        "reportCount": 5,
        "photos": [
          {
            "thumbnailUrl": "https://cdn.trafficintel.com/incidents/thumb_abc123.jpg"
          }
        ],
        "distance": 1250, // meters from query location
        "createdAt": "2025-12-14T09:15:00Z",
        "estimatedClearTime": "2025-12-14T11:30:00Z"
      }
    ],
    "meta": {
      "count": 8,
      "radius": 5000,
      "center": {
        "lat": 37.7749,
        "lng": -122.4194
      }
    }
  }
}
```

---

### 2.3 Get Incident Details

Get full details of a specific incident.

**Endpoint:** `GET /incidents/:id`  
**Access:** Public

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "incident": {
      "id": "incident_xyz789",
      "location": {
        "lat": 37.7749,
        "lng": -122.4194
      },
      "address": {
        "street": "Highway 101 Northbound",
        "city": "San Francisco",
        "state": "CA",
        "postalCode": "94102",
        "formattedAddress": "US-101, San Francisco, CA 94102"
      },
      "type": "car-crash",
      "severity": "severe",
      "severityScore": 75,
      "status": "on-scene",
      "vehicleCount": 3,
      "injuries": true,
      "injuryCount": 2,
      "injurySeverity": "serious",
      "lanesBlocked": "all",
      "roadClosed": true,
      "description": "Multi-vehicle accident blocking all lanes",
      "conditions": {
        "weather": "rain",
        "lighting": "daylight",
        "roadCondition": "wet"
      },
      "reportedBy": {
        "id": "user_123abc",
        "name": "John Doe",
        "role": "citizen"
      },
      "reportCount": 5,
      "verifications": [
        {
          "userId": "user_456def",
          "userName": "Jane Smith",
          "verifiedAt": "2025-12-14T09:20:00Z"
        }
      ],
      "photos": [
        {
          "id": "photo_001",
          "url": "https://cdn.trafficintel.com/incidents/abc123.jpg",
          "thumbnailUrl": "https://cdn.trafficintel.com/incidents/thumb_abc123.jpg",
          "uploadedBy": {
            "id": "user_123abc",
            "name": "John Doe"
          },
          "uploadedAt": "2025-12-14T09:16:00Z"
        }
      ],
      "assignedResponders": [
        {
          "id": "responder_001",
          "name": "Officer Mike Johnson",
          "role": "police",
          "agency": "SFPD",
          "status": "on-scene",
          "assignedAt": "2025-12-14T09:18:00Z",
          "arrivedAt": "2025-12-14T09:25:00Z"
        }
      ],
      "timeline": [
        {
          "event": "reported",
          "description": "Incident reported by John Doe",
          "timestamp": "2025-12-14T09:15:00Z"
        },
        {
          "event": "dispatched",
          "description": "Emergency services dispatched",
          "timestamp": "2025-12-14T09:18:00Z"
        },
        {
          "event": "arrived",
          "description": "Officer Mike Johnson arrived on scene",
          "timestamp": "2025-12-14T09:25:00Z"
        }
      ],
      "views": 342,
      "notificationsSent": 1250,
      "estimatedClearTime": "2025-12-14T11:30:00Z",
      "createdAt": "2025-12-14T09:15:00Z",
      "updatedAt": "2025-12-14T09:25:00Z"
    }
  }
}
```

**Errors:**

- Incident not found: `404 Not Found`

---

### 2.4 Update Incident

Update incident details (responders and original reporter only).

**Endpoint:** `PATCH /incidents/:id`  
**Access:** Authenticated (reporter or responder)

**Request Body:**

```json
{
  "status": "clearing",
  "estimatedClearTime": "2025-12-14T11:30:00Z",
  "description": "Tow trucks arrived, vehicles being removed"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "incident": {
      "...": "updated incident data"
    }
  },
  "message": "Incident updated successfully"
}
```

**Errors:**

- Not authorized: `403 Forbidden`
- Incident not found: `404 Not Found`

---

### 2.5 Verify Incident

Add verification to an incident.

**Endpoint:** `POST /incidents/:id/verify`  
**Access:** Authenticated

**Request Body:**

```json
{
  "comment": "I just passed by, confirmed 3 vehicles involved"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "verification": {
      "userId": "user_456def",
      "userName": "Jane Smith",
      "verifiedAt": "2025-12-14T09:20:00Z",
      "comment": "I just passed by, confirmed 3 vehicles involved"
    }
  },
  "message": "Verification added successfully"
}
```

**Errors:**

- Already verified: `409 Conflict`
- Cannot verify own report: `400 Bad Request`

---

### 2.6 Upload Incident Photo

Upload photo to incident.

**Endpoint:** `POST /incidents/:id/photos`  
**Access:** Authenticated  
**Content-Type:** `multipart/form-data`

**Request Body:**

```
photo: <file> (max 10MB, jpg/png)
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "photo": {
      "id": "photo_002",
      "url": "https://cdn.trafficintel.com/incidents/def456.jpg",
      "thumbnailUrl": "https://cdn.trafficintel.com/incidents/thumb_def456.jpg",
      "uploadedBy": {
        "id": "user_123abc",
        "name": "John Doe"
      },
      "uploadedAt": "2025-12-14T09:30:00Z"
    }
  }
}
```

**Errors:**

- File too large: `413 Payload Too Large`
- Invalid file type: `422 Validation Error`
- Max 10 photos per incident: `400 Bad Request`

---

### 2.7 Delete Incident Photo

Delete a photo from incident (uploader or admin only).

**Endpoint:** `DELETE /incidents/:incidentId/photos/:photoId`  
**Access:** Authenticated (uploader or admin)

**Response:** `204 No Content`

---

### 2.8 Clear Incident

Mark incident as cleared (responders only).

**Endpoint:** `POST /incidents/:id/clear`  
**Access:** Responder or Admin

**Request Body:**

```json
{
  "resolutionNotes": "All vehicles removed, road reopened",
  "clearedAt": "2025-12-14T11:15:00Z" // Optional, defaults to now
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "incident": {
      "...": "updated incident with status: cleared"
    }
  },
  "message": "Incident marked as cleared"
}
```

---

### 2.9 Delete Incident

Delete incident (admin or original reporter within 5 minutes).

**Endpoint:** `DELETE /incidents/:id`  
**Access:** Admin or Reporter (within 5 minutes)

**Response:** `204 No Content`

**Errors:**

- Not authorized: `403 Forbidden`
- Time limit exceeded: `403 Forbidden`

---

### 2.10 Search Incidents

Search incidents with filters.

**Endpoint:** `GET /incidents/search`  
**Access:** Public

**Query Parameters:**

- `q` - Text search (address, description, tags)
- `city` - Filter by city
- `state` - Filter by state
- `severity` - Filter by severity (comma-separated)
- `status` - Filter by status (comma-separated)
- `type` - Filter by incident type
- `fromDate` - Start date (ISO 8601)
- `toDate` - End date (ISO 8601)
- `page` - Page number
- `limit` - Results per page

**Example Request:**

```
GET /incidents/search?city=San%20Francisco&severity=severe,critical&fromDate=2025-12-14T00:00:00Z&page=1&limit=20
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "incidents": [
      {
        "...": "incident data (summary format)"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 2.11 Get User's Incidents

Get incidents reported by current user.

**Endpoint:** `GET /incidents/my-reports`  
**Access:** Authenticated

**Query Parameters:**

- `status` - Filter by status
- `page` - Page number
- `limit` - Results per page

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "incidents": [
      {
        "...": "user's reported incidents"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 12
  }
}
```

---

## 3. Traffic Status

### 3.1 Get Traffic on Route

Get real-time traffic for a route.

**Endpoint:** `POST /traffic/route`  
**Access:** Public  
**Rate Limit:** 30 requests per minute

**Request Body:**

```json
{
  "origin": {
    "lat": 37.7749,
    "lng": -122.4194
  },
  "destination": {
    "lat": 37.8044,
    "lng": -122.2712
  },
  "waypoints": [
    {
      "lat": 37.7900,
      "lng": -122.3900
    }
  ]
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "route": {
      "distance": 15300, // meters
      "duration": 1200, // seconds (no traffic)
      "durationInTraffic": 1800, // seconds (with current traffic)
      "polyline": "encoded_polyline_string",
      "segments": [
        {
          "distance": 5000,
          "duration": 400,
          "congestionLevel": "moderate",
          "incidents": ["incident_xyz789"]
        }
      ],
      "incidents": [
        {
          "id": "incident_xyz789",
          "location": {
            "lat": 37.7800,
            "lng": -122.4000
          },
          "severity": "severe",
          "status": "active",
          "distanceFromRoute": 50, // meters
          "impact": "high"
        }
      ]
    }
  }
}
```

---

### 3.2 Get Traffic in Area

Get traffic conditions in bounding box.

**Endpoint:** `GET /traffic/area`  
**Access:** Public

**Query Parameters:**

- `neLat` - Northeast corner latitude
- `neLng` - Northeast corner longitude
- `swLat` - Southwest corner latitude
- `swLng` - Southwest corner longitude

**Example Request:**

```
GET /traffic/area?neLat=37.8&neLng=-122.3&swLat=37.7&swLng=-122.5
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "segments": [
      {
        "id": "segment_001",
        "roadName": "US-101 Northbound",
        "congestionLevel": "heavy",
        "flowSpeed": 25, // km/h
        "typicalSpeed": 90,
        "geometry": {
          "type": "LineString",
          "coordinates": [[-122.4, 37.7], [-122.39, 37.71]]
        }
      }
    ],
    "lastUpdated": "2025-12-14T10:30:00Z"
  }
}
```

---

## 4. Notifications

### 4.1 Get User Notifications

Get all notifications for current user.

**Endpoint:** `GET /notifications`  
**Access:** Authenticated

**Query Parameters:**

- `unreadOnly` - Filter to unread (boolean)
- `type` - Filter by type
- `page` - Page number
- `limit` - Results per page

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_001",
        "type": "incident-nearby",
        "title": "New Severe Incident Near You",
        "message": "Car crash reported 2 miles from your location on US-101",
        "incidentId": "incident_xyz789",
        "actionUrl": "/incidents/incident_xyz789",
        "priority": "high",
        "read": false,
        "createdAt": "2025-12-14T10:25:00Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "unreadCount": 8
    }
  }
}
```

---

### 4.2 Mark Notification as Read

Mark single notification as read.

**Endpoint:** `PATCH /notifications/:id/read`  
**Access:** Authenticated

**Response:** `204 No Content`

---

### 4.3 Mark All as Read

Mark all notifications as read.

**Endpoint:** `POST /notifications/mark-all-read`  
**Access:** Authenticated

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### 4.4 Delete Notification

Delete a notification.

**Endpoint:** `DELETE /notifications/:id`  
**Access:** Authenticated

**Response:** `204 No Content`

---

### 4.5 Get Notification Preferences

Get user's notification settings.

**Endpoint:** `GET /notifications/preferences`  
**Access:** Authenticated

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "preferences": {
      "push": true,
      "email": true,
      "sms": false,
      "alertRadius": 10, // miles
      "alertSeverity": ["severe", "critical"],
      "quietHours": {
        "enabled": true,
        "start": "22:00",
        "end": "07:00"
      }
    }
  }
}
```

---

### 4.6 Update Notification Preferences

Update user's notification settings.

**Endpoint:** `PATCH /notifications/preferences`  
**Access:** Authenticated

**Request Body:**

```json
{
  "push": true,
  "email": false,
  "alertRadius": 25,
  "alertSeverity": ["moderate", "severe", "critical"]
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "preferences": {
      "...": "updated preferences"
    }
  },
  "message": "Preferences updated successfully"
}
```

---

### 4.7 Register Device Token

Register device for push notifications.

**Endpoint:** `POST /notifications/devices`  
**Access:** Authenticated

**Request Body:**

```json
{
  "token": "firebase_device_token_here",
  "platform": "ios"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Device registered successfully"
}
```

---

### 4.8 Unregister Device Token

Remove device from push notifications.

**Endpoint:** `DELETE /notifications/devices/:token`  
**Access:** Authenticated

**Response:** `204 No Content`

---

## 5. Routes

### 5.1 Create Route

Save a route for alerts.

**Endpoint:** `POST /routes`  
**Access:** Authenticated  
**Rate Limit:** 10 routes max per user

**Request Body:**

```json
{
  "name": "Home to Work",
  "origin": {
    "lat": 37.7749,
    "lng": -122.4194,
    "address": "123 Main St, San Francisco, CA"
  },
  "destination": {
    "lat": 37.8044,
    "lng": -122.2712,
    "address": "456 Market St, Oakland, CA"
  },
  "alertsEnabled": true,
  "alertRadius": 1000, // meters
  "severityFilter": ["severe", "critical"],
  "usualDepartureTimes": [
    {
      "dayOfWeek": 1, // Monday
      "time": "08:00",
      "notifyBefore": 15 // minutes
    }
  ]
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "route": {
      "id": "route_001",
      "name": "Home to Work",
      "origin": {
        "lat": 37.7749,
        "lng": -122.4194,
        "address": "123 Main St, San Francisco, CA"
      },
      "destination": {
        "lat": 37.8044,
        "lng": -122.2712,
        "address": "456 Market St, Oakland, CA"
      },
      "distance": 15300,
      "duration": 1200,
      "polyline": "encoded_polyline",
      "alertsEnabled": true,
      "createdAt": "2025-12-14T10:30:00Z"
    }
  }
}
```

**Errors:**

- Max routes exceeded: `400 Bad Request`

---

### 5.2 Get User Routes

Get all saved routes for current user.

**Endpoint:** `GET /routes`  
**Access:** Authenticated

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "routes": [
      {
        "id": "route_001",
        "name": "Home to Work",
        "origin": {
          "lat": 37.7749,
          "lng": -122.4194,
          "address": "123 Main St, San Francisco, CA"
        },
        "destination": {
          "lat": 37.8044,
          "lng": -122.2712,
          "address": "456 Market St, Oakland, CA"
        },
        "alertsEnabled": true,
        "timesUsed": 45,
        "lastUsedAt": "2025-12-14T08:00:00Z",
        "createdAt": "2025-11-01T10:00:00Z"
      }
    ]
  }
}
```

---

### 5.3 Get Route Details

Get specific route with current incidents.

**Endpoint:** `GET /routes/:id`  
**Access:** Authenticated

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "route": {
      "id": "route_001",
      "name": "Home to Work",
      "...": "route details",
      "currentIncidents": [
        {
          "id": "incident_xyz789",
          "severity": "severe",
          "location": {
            "lat": 37.7800,
            "lng": -122.4000
          },
          "distanceFromRoute": 120,
          "status": "active"
        }
      ],
      "trafficStatus": {
        "congestionLevel": "moderate",
        "durationInTraffic": 1500, // vs normal 1200
        "delayMinutes": 5
      }
    }
  }
}
```

---

### 5.4 Update Route

Update route details.

**Endpoint:** `PATCH /routes/:id`  
**Access:** Authenticated

**Request Body:**

```json
{
  "name": "Updated Route Name",
  "alertsEnabled": false
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "route": {
      "...": "updated route"
    }
  }
}
```

---

### 5.5 Delete Route

Delete a saved route.

**Endpoint:** `DELETE /routes/:id`  
**Access:** Authenticated

**Response:** `204 No Content`

---

### 5.6 Check Route Status

Get current status of route (incidents and traffic).

**Endpoint:** `GET /routes/:id/status`  
**Access:** Authenticated

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "status": {
      "clear": false,
      "incidentCount": 2,
      "incidents": [
        {
          "...": "incident summary"
        }
      ],
      "trafficCondition": "moderate",
      "estimatedDuration": 1500,
      "normalDuration": 1200,
      "delayMinutes": 5,
      "recommendation": "Consider alternate route"
    }
  }
}
```

---

## 6. Users

### 6.1 Get Current User Profile

Get authenticated user's profile.

**Endpoint:** `GET /users/me`  
**Access:** Authenticated

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123abc",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://cdn.trafficintel.com/avatars/user_123abc.jpg",
      "bio": "Regular commuter on US-101",
      "phoneNumber": "+1234567890",
      "phoneVerified": true,
      "emailVerified": true,
      "role": "citizen",
      "stats": {
        "incidentsReported": 15,
        "incidentsVerified": 42,
        "reputationScore": 85,
        "helpfulVotes": 28
      },
      "createdAt": "2025-01-15T10:00:00Z"
    }
  }
}
```

---

### 6.2 Update Profile

Update user profile.

**Endpoint:** `PATCH /users/me`  
**Access:** Authenticated

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "bio": "Updated bio",
  "phoneNumber": "+1234567890"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "...": "updated user"
    }
  }
}
```

---

### 6.3 Upload Avatar

Upload profile picture.

**Endpoint:** `POST /users/me/avatar`  
**Access:** Authenticated  
**Content-Type:** `multipart/form-data`

**Request Body:**

```
avatar: <file> (max 5MB, jpg/png)
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "avatar": "https://cdn.trafficintel.com/avatars/user_123abc.jpg"
  }
}
```

---

### 6.4 Change Password

Change user password.

**Endpoint:** `POST /users/me/change-password`  
**Access:** Authenticated

**Request Body:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Errors:**

- Incorrect current password: `401 Unauthorized`

---

### 6.5 Get User Statistics

Get detailed user statistics.

**Endpoint:** `GET /users/me/stats`  
**Access:** Authenticated

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "stats": {
      "incidentsReported": 15,
      "incidentsVerified": 42,
      "reputationScore": 85,
      "helpfulVotes": 28,
      "rank": 342, // Global rank
      "achievements": [
        {
          "id": "first_report",
          "name": "First Reporter",
          "description": "Reported your first incident",
          "unlockedAt": "2025-01-16T14:30:00Z"
        }
      ],
      "activityByMonth": [
        {
          "month": "2025-12",
          "reportsCount": 5,
          "verificationsCount": 12
        }
      ]
    }
  }
}
```

---

### 6.6 Delete Account

Permanently delete user account.

**Endpoint:** `DELETE /users/me`  
**Access:** Authenticated

**Request Body:**

```json
{
  "password": "UserPassword123!",
  "confirmation": "DELETE"
}
```

**Response:** `204 No Content`

---

### 6.7 Apply for Responder Status

Request verification as first responder.

**Endpoint:** `POST /users/me/apply-responder`  
**Access:** Authenticated

**Request Body:**

```json
{
  "agency": "San Francisco Police Department",
  "badgeNumber": "12345",
  "department": "police",
  "licenseNumber": "CA-LEO-12345",
  "certifications": ["EMT-Basic", "Advanced Life Support"],
  "verificationDocuments": ["doc_id_1", "doc_id_2"]
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Application submitted. You will be notified once verified."
}
```

---

## 7. Admin Operations

### 7.1 Get Dashboard Stats

Get admin dashboard statistics.

**Endpoint:** `GET /admin/dashboard`  
**Access:** Admin

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "stats": {
      "activeIncidents": 342,
      "incidentsToday": 125,
      "totalUsers": 50000,
      "activeUsers24h": 8500,
      "responders": {
        "total": 250,
        "active": 45
      },
      "severityBreakdown": {
        "minor": 45,
        "moderate": 180,
        "severe": 95,
        "critical": 22
      },
      "responseTimeAvg": 480, // seconds
      "reportsPerHour": 15.2,
      "topCities": [
        {
          "city": "San Francisco",
          "incidentCount": 45,
          "activeCount": 8
        }
      ]
    }
  }
}
```

---

### 7.2 Get All Users

List all users with filters.

**Endpoint:** `GET /admin/users`  
**Access:** Admin

**Query Parameters:**

- `role` - Filter by role
- `status` - Filter by status
- `search` - Search by name/email
- `page` - Page number
- `limit` - Results per page

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123abc",
        "email": "user@example.com",
        "fullName": "John Doe",
        "role": "citizen",
        "status": "active",
        "emailVerified": true,
        "stats": {
          "incidentsReported": 15,
          "reputationScore": 85
        },
        "lastLoginAt": "2025-12-14T09:00:00Z",
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 50000,
    "totalPages": 1000
  }
}
```

---

### 7.3 Get User Details (Admin)

Get full user details including sensitive info.

**Endpoint:** `GET /admin/users/:id`  
**Access:** Admin

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "...": "full user data",
      "ipAddresses": ["192.168.1.1"],
      "devices": [...],
      "loginHistory": [...]
    }
  }
}
```

---

### 7.4 Suspend User

Temporarily suspend user account.

**Endpoint:** `POST /admin/users/:id/suspend`  
**Access:** Admin

**Request Body:**

```json
{
  "reason": "Repeated false reports",
  "duration": 30, // days (0 = permanent)
  "notifyUser": true
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "User suspended successfully"
}
```

---

### 7.5 Unsuspend User

Restore suspended user.

**Endpoint:** `POST /admin/users/:id/unsuspend`  
**Access:** Admin

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "User account restored"
}
```

---

### 7.6 Delete User (Admin)

Permanently delete user account.

**Endpoint:** `DELETE /admin/users/:id`  
**Access:** Admin

**Request Body:**

```json
{
  "reason": "User request / policy violation / spam"
}
```

**Response:** `204 No Content`

---

### 7.7 Verify Responder

Approve responder application.

**Endpoint:** `POST /admin/users/:id/verify-responder`  
**Access:** Admin

**Request Body:**

```json
{
  "approved": true,
  "notes": "Badge number verified with SFPD"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Responder verified successfully"
}
```

---

### 7.8 Get All Incidents (Admin)

List all incidents with admin filters.

**Endpoint:** `GET /admin/incidents`  
**Access:** Admin

**Query Parameters:**

- `status` - Filter by status (including "deleted")
- `flagged` - Show only flagged incidents
- `reviewed` - Filter by review status
- `city` / `state` - Location filters
- `page` / `limit` - Pagination

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "incidents": [
      {
        "...": "incident data with admin fields",
        "flagged": true,
        "flagReason": "Potentially fake",
        "reviewed": false
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 15000
  }
}
```

---

### 7.9 Flag Incident

Flag incident for review.

**Endpoint:** `POST /admin/incidents/:id/flag`  
**Access:** Admin

**Request Body:**

```json
{
  "reason": "Suspected fake report / Inappropriate content / Duplicate"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Incident flagged for review"
}
```

---

### 7.10 Review Incident

Mark incident as reviewed.

**Endpoint:** `POST /admin/incidents/:id/review`  
**Access:** Admin

**Request Body:**

```json
{
  "action": "approve", // approve / remove-flag / delete
  "notes": "Verified with police report"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Incident reviewed successfully"
}
```

---

### 7.11 Force Delete Incident

Permanently delete incident.

**Endpoint:** `DELETE /admin/incidents/:id/force`  
**Access:** Admin

**Request Body:**

```json
{
  "reason": "Fake report / Spam / Duplicate"
}
```

**Response:** `204 No Content`

---

### 7.12 Get Action Logs

Get admin action audit logs.

**Endpoint:** `GET /admin/logs`  
**Access:** Admin

**Query Parameters:**

- `adminId` - Filter by admin
- `action` - Filter by action type
- `targetType` - Filter by target type
- `fromDate` / `toDate` - Date range
- `page` / `limit` - Pagination

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log_001",
        "adminName": "Admin User",
        "adminEmail": "admin@trafficintel.com",
        "action": "user-suspend",
        "targetType": "user",
        "targetIdentifier": "user@example.com",
        "description": "Suspended user for 30 days",
        "reason": "Repeated false reports",
        "status": "success",
        "createdAt": "2025-12-14T10:00:00Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 2500
  }
}
```

---

### 7.13 Bulk Operations

Perform bulk actions on incidents.

**Endpoint:** `POST /admin/bulk-operations`  
**Access:** Admin

**Request Body:**

```json
{
  "operation": "clear-incidents", // clear-incidents / delete-incidents / export-data
  "filters": {
    "city": "San Francisco",
    "status": "cleared",
    "olderThan": "2025-01-01T00:00:00Z"
  },
  "reason": "Cleanup old cleared incidents"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "affected": 1250,
    "jobId": "job_abc123"
  },
  "message": "Bulk operation started"
}
```

---

### 7.14 Export Data

Export data for analytics or compliance.

**Endpoint:** `POST /admin/export`  
**Access:** Admin

**Request Body:**

```json
{
  "dataType": "incidents", // incidents / users / logs
  "format": "csv", // csv / json
  "filters": {
    "fromDate": "2025-12-01T00:00:00Z",
    "toDate": "2025-12-14T23:59:59Z",
    "city": "San Francisco"
  }
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://cdn.trafficintel.com/exports/export_abc123.csv",
    "expiresAt": "2025-12-15T10:30:00Z",
    "recordCount": 5000
  },
  "message": "Export ready for download"
}
```

---

## 8. Analytics

### 8.1 Get Platform Analytics

Get overall platform metrics.

**Endpoint:** `GET /analytics/platform`  
**Access:** Admin

**Query Parameters:**

- `fromDate` - Start date
- `toDate` - End date
- `granularity` - hour / day / week / month

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "analytics": {
      "totalIncidents": 15000,
      "incidentTrend": [
        {
          "date": "2025-12-14",
          "count": 125,
          "byType": {
            "car-crash": 80,
            "motorcycle": 15,
            "truck": 20,
            "pedestrian": 10
          }
        }
      ],
      "averageResponseTime": 480,
      "topLocations": [
        {
          "city": "San Francisco",
          "state": "CA",
          "incidentCount": 2500
        }
      ],
      "peakHours": [
        {
          "hour": 8,
          "avgIncidents": 25
        },
        {
          "hour": 17,
          "avgIncidents": 30
        }
      ],
      "userGrowth": [
        {
          "month": "2025-12",
          "newUsers": 5000,
          "totalUsers": 50000
        }
      ]
    }
  }
}
```

---

### 8.2 Get City Analytics

Get analytics for specific city.

**Endpoint:** `GET /analytics/cities/:city`  
**Access:** Public

**Query Parameters:**

- `state` - State code (required)
- `fromDate` - Start date
- `toDate` - End date

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "city": "San Francisco",
    "state": "CA",
    "analytics": {
      "totalIncidents": 2500,
      "activeIncidents": 45,
      "incidentsByType": {
        "car-crash": 1800,
        "motorcycle": 300,
        "truck": 250,
        "pedestrian": 150
      },
      "hotspots": [
        {
          "location": {
            "lat": 37.7749,
            "lng": -122.4194
          },
          "address": "US-101 & Market St",
          "incidentCount": 85
        }
      ],
      "averageResponseTime": 420,
      "mostDangerousHours": [8, 17, 18]
    }
  }
}
```

---

### 8.3 Get User Analytics

Get analytics for current user.

**Endpoint:** `GET /analytics/me`  
**Access:** Authenticated

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "analytics": {
      "totalReports": 15,
      "verifications": 42,
      "impactScore": 850, // Estimated users helped
      "responsiveness": 92, // Percentage of timely reports
      "accuracy": 88, // Based on verifications
      "reportsByMonth": [
        {
          "month": "2025-12",
          "count": 5
        }
      ],
      "topLocations": [
        {
          "city": "San Francisco",
          "count": 10
        }
      ]
    }
  }
}
```

---

## Error Codes Reference

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Invalid or missing token |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict (duplicate) |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |
| `MAINTENANCE` | Service under maintenance |

---

## Rate Limiting

All endpoints have rate limits to prevent abuse:

- **Authentication:** 10 requests/minute
- **Incident Creation:** 10 incidents/hour per user
- **Photo Upload:** 20 uploads/hour per user
- **Search/Read:** 60 requests/minute
- **Updates:** 30 requests/minute

Rate limit headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1702555800
```

---

## Webhooks (Future)

For responders and third-party integrations:

- `incident.created`
- `incident.updated`
- `incident.cleared`
- `responder.assigned`

---

## WebSocket Events

Real-time updates via Socket.io:

**Client → Server:**
- `subscribe:location` - Subscribe to incidents in area
- `unsubscribe:location` - Unsubscribe from area
- `subscribe:incident` - Subscribe to incident updates
- `incident:update` - Update incident (responders)

**Server → Client:**
- `incident:created` - New incident in subscribed area
- `incident:updated` - Incident status changed
- `incident:cleared` - Incident cleared
- `responder:assigned` - Responder assigned to incident

---

## Versioning

API version is in the URL: `/v1/...`

Major versions are incremented for breaking changes. Deprecated versions are supported for 6 months after new version release.

---

## SDKs & Libraries

Official SDKs available:
- JavaScript/TypeScript (NPM)
- Swift (iOS)
- Kotlin (Android)
- Python (for analytics)

---

This API documentation provides complete coverage of all platform features with production-ready specifications, error handling, and access control.