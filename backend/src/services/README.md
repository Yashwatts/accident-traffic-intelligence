# Services

Feature-based modules following the microservices pattern. Each service is self-contained and can be independently scaled or separated into its own microservice.

## Structure

Each service includes:
- **Controller** - HTTP request handling
- **Service** - Business logic
- **Model** - Database schema
- **Routes** - Route definitions
- **Validation** - Request validation schemas
- **Types** - TypeScript types

## Services

### 1. Incident Service
- Create, read, update, delete incidents
- Duplicate detection and merging
- Status management
- Severity calculation

### 2. Auth Service
- User registration and login
- JWT token generation
- Password reset
- Session management

### 3. User Service
- User profile management
- Role-based access control
- Preferences management

### 4. Location Service
- Geocoding (address ↔ coordinates)
- Proximity search
- Route management
- Geofencing

### 5. Notification Service
- Push notifications (FCM)
- Email notifications
- SMS alerts (Twilio)
- In-app notifications

### 6. Analytics Service
- Data aggregation
- Report generation
- Heatmap data
- Trend analysis

### 7. Media Service
- Image upload to S3
- Image processing (resize, compress)
- CDN distribution
- Virus scanning

## Architecture Pattern

```
Request → Route → Controller → Service → Model → Database
                      ↓
                 Validation
                      ↓
                Error Handling
```

## Benefits

✓ **Scalable** - Each service can be scaled independently
✓ **Maintainable** - Clear separation of concerns
✓ **Testable** - Easy to unit test business logic
✓ **Flexible** - Can be split into separate microservices
