# Project Folder Structure
## Traffic & Accident Intelligence Platform

**Industry-Standard, Scalable, Maintainable Architecture**

---

## Complete Project Structure

```
accident-traffic-platform/
├── frontend/                    # React application
├── backend/                     # Node.js API server
├── shared/                      # Shared types/utils between FE/BE
├── docs/                        # Documentation
├── scripts/                     # Build/deployment scripts
├── .github/                     # GitHub Actions workflows
├── docker-compose.yml           # Local development environment
├── .gitignore
├── README.md
└── package.json                 # Root package (monorepo scripts)
```

---

## Frontend Structure (React + Vite + TypeScript)

```
frontend/
│
├── public/                      # Static assets (not processed by Vite)
│   ├── icons/                   # App icons for PWA
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   ├── manifest.json            # PWA manifest
│   ├── robots.txt               # SEO
│   └── favicon.ico
│
├── src/
│   │
│   ├── api/                     # API client layer (centralized HTTP calls)
│   │   ├── client/              # HTTP clients
│   │   │   ├── axios-client.ts  # Axios instance with interceptors
│   │   │   └── socket-client.ts # Socket.io client setup
│   │   ├── endpoints/           # API endpoint functions
│   │   │   ├── incident.api.ts  # Incident-related API calls
│   │   │   ├── user.api.ts      # User/profile API calls
│   │   │   ├── auth.api.ts      # Authentication API calls
│   │   │   ├── location.api.ts  # Geocoding/location API calls
│   │   │   ├── notification.api.ts
│   │   │   └── analytics.api.ts
│   │   └── index.ts             # Re-export all APIs
│   │
│   ├── assets/                  # Static assets (processed by Vite)
│   │   ├── images/              # Images (logos, illustrations)
│   │   │   ├── logo.svg
│   │   │   ├── empty-state.svg
│   │   │   └── error-state.svg
│   │   ├── fonts/               # Custom fonts (if not using CDN)
│   │   └── videos/              # Video assets
│   │
│   ├── components/              # Reusable React components
│   │   │
│   │   ├── common/              # Generic, reusable components
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.module.css
│   │   │   │   └── Button.test.tsx
│   │   │   ├── Card/
│   │   │   ├── Badge/
│   │   │   ├── Modal/
│   │   │   ├── Spinner/
│   │   │   ├── Tooltip/
│   │   │   ├── Avatar/
│   │   │   ├── Dropdown/
│   │   │   └── index.ts         # Re-export all common components
│   │   │
│   │   ├── layout/              # Layout components
│   │   │   ├── Header/
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Header.module.css
│   │   │   ├── Sidebar/
│   │   │   ├── Footer/
│   │   │   ├── Container/
│   │   │   ├── Navigation/
│   │   │   └── BottomSheet/
│   │   │
│   │   ├── forms/               # Form-specific components
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   ├── Checkbox/
│   │   │   ├── Radio/
│   │   │   ├── FileUpload/
│   │   │   ├── SearchInput/
│   │   │   └── FormField/       # Wrapper with label + error
│   │   │
│   │   ├── map/                 # Map-related components
│   │   │   ├── Map/             # Main map component
│   │   │   ├── MapPin/          # Incident pins
│   │   │   ├── MapCluster/      # Pin clustering
│   │   │   ├── MapControls/     # Zoom, center, style toggle
│   │   │   ├── MapLegend/
│   │   │   └── UserLocation/    # User's location marker
│   │   │
│   │   ├── incident/            # Incident-specific components
│   │   │   ├── IncidentCard/
│   │   │   ├── IncidentList/
│   │   │   ├── IncidentDetail/
│   │   │   ├── IncidentForm/
│   │   │   ├── SeverityBadge/
│   │   │   ├── StatusBadge/
│   │   │   └── PhotoGallery/
│   │   │
│   │   ├── dashboard/           # Dashboard-specific components
│   │   │   ├── StatsCard/
│   │   │   ├── ChartWidget/
│   │   │   ├── Heatmap/
│   │   │   └── ResponderPanel/
│   │   │
│   │   └── analytics/           # Analytics-specific components
│   │       ├── TimeSeriesChart/
│   │       ├── BarChart/
│   │       ├── PieChart/
│   │       └── DataTable/
│   │
│   ├── pages/                   # Page components (routes)
│   │   ├── Home/                # Landing page
│   │   │   ├── Home.tsx
│   │   │   └── Home.module.css
│   │   ├── MapView/             # Main map interface
│   │   │   ├── MapView.tsx
│   │   │   ├── components/      # Page-specific components
│   │   │   │   ├── IncidentSidebar.tsx
│   │   │   │   └── FilterPanel.tsx
│   │   │   └── MapView.module.css
│   │   ├── ReportIncident/      # Report accident flow
│   │   │   ├── ReportIncident.tsx
│   │   │   ├── steps/           # Multi-step wizard
│   │   │   │   ├── LocationStep.tsx
│   │   │   │   ├── DetailsStep.tsx
│   │   │   │   ├── PhotoStep.tsx
│   │   │   │   └── ConfirmStep.tsx
│   │   │   └── ReportIncident.module.css
│   │   ├── Dashboard/           # Responder dashboard
│   │   │   ├── Dashboard.tsx
│   │   │   └── Dashboard.module.css
│   │   ├── Analytics/           # City official analytics
│   │   │   ├── Analytics.tsx
│   │   │   └── Analytics.module.css
│   │   ├── Profile/             # User profile
│   │   │   ├── Profile.tsx
│   │   │   └── Settings.tsx
│   │   ├── Auth/                # Authentication pages
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ForgotPassword.tsx
│   │   ├── Routes/              # Saved routes management
│   │   │   ├── Routes.tsx
│   │   │   └── RouteEditor.tsx
│   │   ├── Notifications/       # Notifications center
│   │   │   └── Notifications.tsx
│   │   ├── NotFound/            # 404 page
│   │   │   └── NotFound.tsx
│   │   └── index.ts             # Re-export all pages
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useIncidents.ts      # Fetch/manage incidents
│   │   ├── useRealtime.ts       # Socket.io connection
│   │   ├── useGeolocation.ts    # User's location
│   │   ├── useAuth.ts           # Authentication state
│   │   ├── useMediaQuery.ts     # Responsive breakpoints
│   │   ├── useDebounce.ts       # Debounced values
│   │   ├── useLocalStorage.ts   # Persist state in localStorage
│   │   ├── useNotifications.ts  # Push notifications
│   │   ├── useMap.ts            # Map instance management
│   │   └── index.ts
│   │
│   ├── stores/                  # Zustand state management
│   │   ├── incident-store.ts    # Incident state
│   │   ├── auth-store.ts        # Auth state
│   │   ├── ui-store.ts          # UI state (modals, sidebars)
│   │   ├── filter-store.ts      # Filter state
│   │   ├── notification-store.ts
│   │   └── index.ts
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── incident.ts          # Incident types
│   │   ├── user.ts              # User types
│   │   ├── auth.ts              # Auth types
│   │   ├── api.ts               # API response types
│   │   ├── notification.ts
│   │   ├── route.ts             # Saved route types
│   │   └── index.ts
│   │
│   ├── utils/                   # Utility functions
│   │   ├── date.ts              # Date formatting
│   │   ├── geocoding.ts         # Geocoding helpers
│   │   ├── validation.ts        # Form validation
│   │   ├── formatting.ts        # String/number formatting
│   │   ├── constants.ts         # App constants
│   │   ├── storage.ts           # localStorage helpers
│   │   ├── error-handler.ts     # Error handling
│   │   └── index.ts
│   │
│   ├── styles/                  # Global styles
│   │   ├── design-tokens.css    # CSS variables
│   │   ├── globals.css          # Global resets/base styles
│   │   ├── animations.css       # Keyframe animations
│   │   └── utilities.css        # Utility classes
│   │
│   ├── lib/                     # Third-party library configurations
│   │   ├── mapbox.ts            # Mapbox setup
│   │   ├── firebase.ts          # Firebase (push notifications)
│   │   └── sentry.ts            # Error tracking
│   │
│   ├── routes/                  # Route configuration
│   │   ├── router.tsx           # React Router setup
│   │   ├── ProtectedRoute.tsx   # Auth-required routes
│   │   └── routes.config.ts     # Route definitions
│   │
│   ├── contexts/                # React Context providers (if needed)
│   │   ├── ThemeContext.tsx     # Dark/light mode
│   │   └── MapContext.tsx       # Map instance provider
│   │
│   ├── services/                # Business logic services
│   │   ├── notification.service.ts  # Push notifications
│   │   ├── geolocation.service.ts   # Location tracking
│   │   └── analytics.service.ts     # Analytics tracking
│   │
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── vite-env.d.ts            # Vite type declarations
│
├── tests/                       # Tests (mirrors src structure)
│   ├── unit/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── integration/
│   └── e2e/
│       └── scenarios/
│
├── .env.example                 # Environment variables template
├── .env.local                   # Local environment (gitignored)
├── .eslintrc.json               # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── package.json
└── README.md
```

---

## Backend Structure (Node.js + Express + TypeScript)

```
backend/
│
├── src/
│   │
│   ├── services/                # Feature-based modules (microservices pattern)
│   │   │
│   │   ├── incident/            # Incident service
│   │   │   ├── incident.controller.ts   # HTTP request handlers
│   │   │   ├── incident.service.ts      # Business logic
│   │   │   ├── incident.model.ts        # MongoDB schema
│   │   │   ├── incident.routes.ts       # Route definitions
│   │   │   ├── incident.validation.ts   # Zod schemas
│   │   │   ├── incident.types.ts        # TypeScript types
│   │   │   └── __tests__/               # Service tests
│   │   │       ├── incident.controller.test.ts
│   │   │       └── incident.service.test.ts
│   │   │
│   │   ├── auth/                # Authentication service
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.validation.ts
│   │   │   └── strategies/      # Auth strategies
│   │   │       ├── jwt.strategy.ts
│   │   │       └── local.strategy.ts
│   │   │
│   │   ├── user/                # User management service
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.model.ts
│   │   │   ├── user.routes.ts
│   │   │   └── user.validation.ts
│   │   │
│   │   ├── location/            # Location/geocoding service
│   │   │   ├── location.controller.ts
│   │   │   ├── location.service.ts
│   │   │   ├── location.routes.ts
│   │   │   └── geocoding/       # Geocoding providers
│   │   │       ├── google-maps.ts
│   │   │       └── mapbox.ts
│   │   │
│   │   ├── notification/        # Notification service
│   │   │   ├── notification.controller.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── notification.model.ts
│   │   │   ├── notification.routes.ts
│   │   │   └── providers/       # Notification providers
│   │   │       ├── fcm.provider.ts      # Firebase Cloud Messaging
│   │   │       ├── email.provider.ts    # SendGrid/SES
│   │   │       └── sms.provider.ts      # Twilio
│   │   │
│   │   ├── analytics/           # Analytics service
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── analytics.routes.ts
│   │   │   └── aggregations/    # Data aggregation queries
│   │   │       ├── heatmap.aggregation.ts
│   │   │       ├── trends.aggregation.ts
│   │   │       └── reports.aggregation.ts
│   │   │
│   │   └── media/               # Media/file upload service
│   │       ├── media.controller.ts
│   │       ├── media.service.ts
│   │       ├── media.routes.ts
│   │       └── processors/      # Image processing
│   │           ├── resize.processor.ts
│   │           ├── compress.processor.ts
│   │           └── watermark.processor.ts
│   │
│   ├── models/                  # Shared database models
│   │   ├── base.model.ts        # Base model with common fields
│   │   └── index.ts
│   │
│   ├── middleware/              # Express middleware
│   │   ├── auth.middleware.ts           # JWT verification
│   │   ├── error.middleware.ts          # Global error handler
│   │   ├── validation.middleware.ts     # Zod validation
│   │   ├── rate-limit.middleware.ts     # Rate limiting
│   │   ├── logger.middleware.ts         # Request logging
│   │   ├── cors.middleware.ts           # CORS configuration
│   │   ├── upload.middleware.ts         # File upload (Multer)
│   │   ├── permission.middleware.ts     # RBAC
│   │   └── index.ts
│   │
│   ├── config/                  # Configuration files
│   │   ├── database.ts          # MongoDB connection
│   │   ├── redis.ts             # Redis connection
│   │   ├── postgres.ts          # PostgreSQL connection
│   │   ├── aws.ts               # AWS SDK setup
│   │   ├── env.ts               # Environment variables
│   │   ├── logger.ts            # Winston logger setup
│   │   └── index.ts
│   │
│   ├── utils/                   # Utility functions
│   │   ├── logger.ts            # Logger instance
│   │   ├── jwt.ts               # JWT helpers
│   │   ├── email.ts             # Email sending
│   │   ├── geocoding.ts         # Geocoding helpers
│   │   ├── encryption.ts        # Bcrypt/crypto
│   │   ├── date.ts              # Date utilities
│   │   ├── file.ts              # File utilities
│   │   └── index.ts
│   │
│   ├── types/                   # TypeScript types
│   │   ├── express.d.ts         # Express type augmentation
│   │   ├── models.ts            # Shared model types
│   │   ├── api.ts               # API types
│   │   └── index.ts
│   │
│   ├── websocket/               # WebSocket (Socket.io) server
│   │   ├── socket-server.ts     # Socket.io setup
│   │   ├── handlers/            # Event handlers
│   │   │   ├── incident.handler.ts
│   │   │   ├── notification.handler.ts
│   │   │   └── connection.handler.ts
│   │   ├── middleware/          # Socket middleware
│   │   │   ├── auth.middleware.ts
│   │   │   └── logger.middleware.ts
│   │   └── rooms/               # Room management
│   │       └── room-manager.ts
│   │
│   ├── jobs/                    # Background jobs (cron/queue)
│   │   ├── cleanup-old-incidents.job.ts
│   │   ├── send-daily-summary.job.ts
│   │   ├── update-analytics.job.ts
│   │   ├── sync-to-postgres.job.ts
│   │   └── index.ts
│   │
│   ├── queues/                  # Message queues (Bull/BullMQ)
│   │   ├── notification.queue.ts
│   │   ├── email.queue.ts
│   │   └── analytics.queue.ts
│   │
│   ├── validators/              # Shared validation schemas
│   │   ├── common.validation.ts
│   │   └── index.ts
│   │
│   ├── constants/               # Constants
│   │   ├── roles.ts             # User roles
│   │   ├── statuses.ts          # Incident statuses
│   │   ├── severities.ts        # Severity levels
│   │   └── index.ts
│   │
│   ├── errors/                  # Custom error classes
│   │   ├── AppError.ts          # Base error class
│   │   ├── ValidationError.ts
│   │   ├── AuthError.ts
│   │   └── NotFoundError.ts
│   │
│   ├── database/                # Database management
│   │   ├── seeds/               # Seed data for development
│   │   │   ├── users.seed.ts
│   │   │   └── incidents.seed.ts
│   │   ├── migrations/          # Database migrations
│   │   │   └── 001_initial_setup.ts
│   │   └── indexes/             # Index creation scripts
│   │       └── mongodb.indexes.ts
│   │
│   ├── app.ts                   # Express app setup
│   └── server.ts                # Server entry point
│
├── tests/                       # Tests
│   ├── unit/                    # Unit tests
│   │   ├── services/
│   │   ├── utils/
│   │   └── middleware/
│   ├── integration/             # Integration tests
│   │   └── api/
│   │       ├── incident.test.ts
│   │       ├── auth.test.ts
│   │       └── user.test.ts
│   ├── e2e/                     # End-to-end tests
│   │   └── flows/
│   │       ├── report-incident.test.ts
│   │       └── responder-workflow.test.ts
│   ├── fixtures/                # Test data
│   │   ├── incidents.json
│   │   └── users.json
│   └── setup.ts                 # Test setup/teardown
│
├── scripts/                     # Utility scripts
│   ├── seed-db.ts               # Seed database
│   ├── create-admin.ts          # Create admin user
│   └── generate-types.ts        # Generate types from schemas
│
├── logs/                        # Log files (gitignored)
│   ├── error.log
│   └── combined.log
│
├── uploads/                     # Temporary uploads (gitignored)
│   └── .gitkeep
│
├── .env.example                 # Environment variables template
├── .env.development             # Development environment
├── .env.test                    # Test environment
├── .env.production              # Production environment (not in git)
├── .eslintrc.json               # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── tsconfig.json                # TypeScript configuration
├── jest.config.js               # Jest configuration
├── nodemon.json                 # Nodemon configuration
├── Dockerfile                   # Docker image
├── .dockerignore
├── package.json
└── README.md
```

---

## Shared Types (Optional Monorepo Structure)

```
shared/
├── types/                       # Shared TypeScript types
│   ├── incident.types.ts
│   ├── user.types.ts
│   ├── api.types.ts
│   └── index.ts
├── constants/                   # Shared constants
│   ├── roles.ts
│   ├── statuses.ts
│   └── index.ts
├── utils/                       # Shared utilities
│   ├── validation.ts
│   └── formatting.ts
├── package.json
└── tsconfig.json
```

---

## Root Level Files

```
accident-traffic-platform/
│
├── .github/                     # GitHub-specific files
│   ├── workflows/               # GitHub Actions
│   │   ├── ci.yml               # Continuous Integration
│   │   ├── cd.yml               # Continuous Deployment
│   │   └── tests.yml            # Automated tests
│   ├── ISSUE_TEMPLATE/          # Issue templates
│   └── PULL_REQUEST_TEMPLATE.md
│
├── docs/                        # Documentation
│   ├── architecture.md          # Architecture documentation
│   ├── api.md                   # API documentation
│   ├── deployment.md            # Deployment guide
│   ├── design-system.md         # Design system
│   ├── contributing.md          # Contribution guide
│   └── screenshots/             # Screenshots for README
│
├── scripts/                     # Root-level scripts
│   ├── setup.sh                 # Initial setup script
│   ├── docker-dev.sh            # Docker development environment
│   └── deploy.sh                # Deployment script
│
├── docker-compose.yml           # Local development services
├── docker-compose.prod.yml      # Production services
├── .gitignore                   # Git ignore rules
├── .dockerignore                # Docker ignore rules
├── .prettierignore              # Prettier ignore rules
├── .eslintignore                # ESLint ignore rules
├── package.json                 # Root package (monorepo)
├── pnpm-workspace.yaml          # PNPM workspace (if using PNPM)
├── turbo.json                   # Turborepo config (if using Turbo)
├── LICENSE                      # License file
└── README.md                    # Project README
```

---

## Docker Compose (Local Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
      POSTGRES_DB: traffic_analytics

volumes:
  mongodb_data:
  redis_data:
  postgres_data:
```

---

## Key Folder Purposes

### Frontend

| Folder | Purpose |
|--------|---------|
| `api/` | Centralized API calls, prevents scattered fetch() calls throughout components |
| `components/` | Reusable UI components, organized by type (common/layout/forms/etc.) |
| `pages/` | Top-level route components, each page can have its own subfolder with page-specific components |
| `hooks/` | Custom React hooks for shared logic (data fetching, auth, geolocation) |
| `stores/` | Zustand state management, one store per domain (incidents, auth, UI) |
| `types/` | TypeScript types, centralized for consistency |
| `utils/` | Pure functions, no React dependencies |
| `routes/` | Route configuration, protected routes, navigation logic |
| `lib/` | Third-party library setup and configuration |

### Backend

| Folder | Purpose |
|--------|---------|
| `services/` | Feature-based modules (like microservices), each has controller/service/model/routes |
| `middleware/` | Express middleware for cross-cutting concerns (auth, logging, validation) |
| `config/` | Configuration for databases, external services, environment variables |
| `websocket/` | Socket.io server, handlers, and real-time event logic |
| `jobs/` | Background jobs and scheduled tasks (cron) |
| `models/` | Shared database models if needed across services |
| `utils/` | Helper functions, pure utilities |
| `validators/` | Zod schemas for request validation |
| `errors/` | Custom error classes for consistent error handling |

---

## Best Practices

### ✅ Do's

1. **Co-locate related files** - Keep components with their styles and tests
2. **One component per file** - Easier to find and maintain
3. **Index files** - Use index.ts to re-export for cleaner imports
4. **Consistent naming** - PascalCase for components, kebab-case for folders
5. **Separate business logic** - Keep logic in services, not in controllers/components
6. **Type everything** - Use TypeScript strictly, no `any`

### ❌ Don'ts

1. **Don't nest too deep** - Max 3-4 levels of nesting
2. **Don't create utils dumping ground** - Be specific (date.ts, validation.ts)
3. **Don't mix concerns** - API calls don't belong in components
4. **Don't skip tests** - Each service/component should have tests
5. **Don't hardcode values** - Use constants/env variables

---

## Scalability Considerations

### Frontend
- **Code splitting** - Each page is lazy-loaded
- **Component library** - Common components are reusable
- **State management** - Zustand scales better than Context API
- **Type safety** - Prevents bugs as team grows

### Backend
- **Microservices pattern** - Each service can be split into its own repo/server
- **Database per service** - Services own their data
- **Shared types** - Can be published as npm package
- **Queue-based** - Async processing with Bull/BullMQ

---

This structure supports a team of 10+ developers, handles millions of requests, and can be easily refactored into true microservices when needed.
