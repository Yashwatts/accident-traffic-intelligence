# Security & Performance Hardening Documentation

## Overview
This application implements comprehensive security measures and performance optimizations across both backend and frontend.

## Backend Security

### 1. Rate Limiting (`middleware/rateLimiter.js`)

**Implementation:**
- Redis-backed distributed rate limiting
- Multiple rate limit tiers per endpoint type
- Automatic retry-after headers

**Rate Limits:**
```javascript
General API:        100 requests / 15 minutes
Authentication:     5 attempts / 15 minutes (brute force protection)
Incident Creation:  10 reports / hour per user
Password Reset:     3 attempts / hour
File Upload:        20 uploads / hour per user
WebSocket Connect:  5 connections / minute
```

**Features:**
- IP-based and user-based limiting
- Sliding window algorithm
- Graceful fallback to memory store if Redis unavailable
- Skips successful auth attempts from counting

### 2. Input Validation (`middleware/validation.js`)

**Schema Validation with Zod:**
- Email format validation
- Password strength requirements (min 8 chars, uppercase, lowercase, number, special char)
- Phone number validation
- Coordinate range validation (-90 to 90 lat, -180 to 180 lng)
- Description length limits (max 1000 chars)
- XSS protection via HTML escaping

**Validation Middleware:**
```javascript
validate(schema, source) // Validates body, query, or params
sanitizeBody             // Removes dangerous content
validateObjectId         // MongoDB ID format check
validatePagination       // Limits 1-100
validateFileUpload       // Size and type restrictions
validateServiceArea      // Geographic boundaries
```

**Prototype Pollution Protection:**
- Filters `__proto__`, `constructor`, `prototype` from objects

### 3. Authorization (`middleware/authorization.js`)

**Role-Based Access Control (RBAC):**
```javascript
Roles: user, responder, admin

requireAuth              // User must be logged in
requireRole(...roles)    // Specific role required
requireAdmin             // Admin only
requireResponder         // Responder or admin
requireOwnership         // Resource owner or admin
requireActiveAccount     // Not banned/suspended
requirePermission        // Fine-grained permissions
requireActionLimit       // Prevent rapid actions
requireWhitelistedIP     // IP whitelist for sensitive endpoints
```

**Features:**
- Account status checks (banned, suspended, unverified)
- Resource ownership verification
- Time-based action limiting
- Conditional authorization

### 4. Performance Optimization (`utils/performanceOptimization.js`)

**Caching:**
- Redis-backed response caching
- Configurable TTL per endpoint
- Cache invalidation by pattern
- Query result memoization

**Compression:**
- Gzip compression for responses >1KB
- Configurable compression level (6)

**Database Optimization:**
```javascript
Connection Pooling:
  - maxPoolSize: 50
  - minPoolSize: 10
  - maxIdleTimeMS: 30000

Query Optimization:
  - Lean queries (plain objects)
  - Field selection
  - Index hints
  - Pagination helpers
```

**Memory Management:**
- Automatic monitoring
- Heap usage warnings at 90%
- Batch processing for large datasets
- Request deduplication

## Frontend Security

### 1. Input Sanitization (`lib/securityUtils.js`)

**XSS Prevention:**
```javascript
sanitizeHTML(dirty)      // DOMPurify sanitization
sanitizeInput(input)     // Remove dangerous characters
detectInjection(input)   // SQL injection detection
```

**Validation:**
```javascript
isValidEmail(email)
validatePassword(password)        // Returns errors array
calculatePasswordStrength(pass)   // 0-100 score
validateFile(file, options)       // Size and type checks
validateCoordinates(lat, lng)
containsProfanity(text)           // Word list check
```

### 2. Secure Storage (`lib/securityUtils.js`)

**Encrypted localStorage:**
```javascript
secureStorage.set(key, value)    // Base64 encoding
secureStorage.get(key)
secureStorage.remove(key)
secureStorage.clear()
```

**CSRF Protection:**
```javascript
generateCSRFToken()              // Cryptographically secure
```

### 3. Enhanced API Client (`lib/apiSecure.js`)

**Features:**
- Automatic token refresh on 401
- Exponential backoff retry (3 attempts: 1s, 2s, 4s)
- Request deduplication for GET requests
- Client-side rate limiting (100 req/min)
- CSRF token injection for state-changing requests
- Request ID tracking
- Input sanitization before sending

**Rate Limit Handling:**
```javascript
429 Response → Show retry-after to user
Network Error → Auto-retry with backoff
Token Expired → Auto-refresh and retry
```

### 4. Security Utilities

**Client Rate Limiter:**
```javascript
const limiter = new ClientRateLimiter(100, 60000);
limiter.canMakeRequest()  // Returns boolean
limiter.getWaitTime()     // Milliseconds until reset
```

**Auto-logout:**
```javascript
setupInactivityLogout(30 * 60 * 1000, onLogout)
// Logs out after 30 minutes of inactivity
```

**Clickjacking Prevention:**
```javascript
preventClickjacking()  // Redirects if in iframe
```

## API Protection

### Headers
```javascript
Helmet Configuration:
  - Content Security Policy
  - HSTS (1 year, includeSubDomains, preload)
  - XSS Filter
  - No Sniff
  - Referrer Policy: strict-origin-when-cross-origin
  - Frame blocking
```

### CORS
```javascript
Allowed Origins: Frontend URL
Credentials: true (for cookies)
Methods: GET, POST, PUT, PATCH, DELETE
Headers: Content-Type, Authorization, X-CSRF-Token
```

### Request Size Limits
```javascript
JSON Body: 10MB
URL Encoded: 10MB
File Upload: 5MB per file (configurable)
```

## Performance Benchmarks

**Response Times (Target):**
- API Endpoints: <100ms (cached), <500ms (uncached)
- Database Queries: <50ms (indexed), <200ms (complex)
- WebSocket Latency: <50ms
- Static Assets: <10ms (CDN)

**Throughput:**
- Max Concurrent Connections: 10,000
- Requests/Second: 1,000+ (with caching)
- WebSocket Connections: 5,000+

**Memory:**
- Heap Usage Target: <70%
- Alert at: 90%

## Monitoring & Logging

**Logged Events:**
- All authentication attempts
- Rate limit violations
- Authorization failures
- Validation errors
- Performance warnings (memory, slow queries)
- Security incidents (injection attempts, suspicious activity)

**Metrics:**
- Request latency
- Error rates
- Cache hit ratios
- Memory usage
- Active connections

## Deployment Recommendations

### Environment Variables
```env
# Redis
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
JWT_SECRET=<strong-random-secret>
JWT_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
BCRYPT_ROUNDS=10

# Performance
CACHE_TTL=300
ENABLE_COMPRESSION=true
MAX_POOL_SIZE=50
```

### Production Checklist
- [ ] Enable Redis for rate limiting and caching
- [ ] Set strong JWT secrets (32+ characters)
- [ ] Configure CORS for specific domains
- [ ] Enable HTTPS only
- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Configure log aggregation (ELK, Datadog)
- [ ] Enable automated backups
- [ ] Set up DDoS protection (Cloudflare)
- [ ] Configure CDN for static assets
- [ ] Enable auto-scaling
- [ ] Set up health checks and alerts

## Testing

**Security Tests:**
```bash
# SQL Injection attempts
# XSS payloads
# CSRF attacks
# Brute force attacks
# Rate limit bypassing
# Authorization bypassing
```

**Performance Tests:**
```bash
# Load testing (Apache JMeter, k6)
# Stress testing
# Spike testing
# Endurance testing
# Memory leak detection
```

## Incident Response

**If Rate Limited:**
1. Wait for retry-after period
2. Check application logic for unnecessary requests
3. Implement request batching
4. Use WebSocket for real-time updates

**If Security Breach:**
1. Rotate all secrets (JWT, API keys)
2. Force password resets for affected users
3. Review audit logs
4. Patch vulnerability
5. Notify affected users

## Best Practices

1. **Always validate inputs** on both client and server
2. **Never trust client data** - server is source of truth
3. **Use parameterized queries** to prevent SQL injection
4. **Escape user content** before displaying
5. **Implement rate limiting** on all public endpoints
6. **Log security events** for audit trail
7. **Keep dependencies updated** (`npm audit fix`)
8. **Use HTTPS** in production
9. **Implement CSRF protection** for state-changing operations
10. **Monitor and alert** on anomalies

## Additional Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Node.js Security Best Practices: https://nodejs.org/en/docs/guides/security/
- Express Security Best Practices: https://expressjs.com/en/advanced/best-practice-security.html
