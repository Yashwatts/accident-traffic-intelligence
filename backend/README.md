# Backend Application

Node.js + Express + TypeScript backend for the Traffic & Accident Intelligence Platform.

## Structure

```
src/
├── services/     → Feature-based modules (microservices pattern)
├── middleware/   → Express middleware
├── config/       → Configuration (database, redis, aws, etc.)
├── utils/        → Helper functions
├── websocket/    → Socket.io server for real-time events
├── jobs/         → Background jobs (cron/queue)
└── types/        → TypeScript type definitions
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Seed database
npm run seed
```

## Key Folders

- **services/** - Each service (incident, auth, user, etc.) is self-contained with controller/service/model/routes
- **middleware/** - Cross-cutting concerns (auth, logging, validation, rate limiting)
- **websocket/** - Socket.io server for real-time updates
- **jobs/** - Background tasks (cleanup, daily summaries, analytics)

## Service Structure

Each service follows this pattern:
```
incident/
├── incident.controller.ts   → HTTP request handlers
├── incident.service.ts      → Business logic
├── incident.model.ts        → Database schema
├── incident.routes.ts       → Route definitions
├── incident.validation.ts   → Request validation schemas
└── incident.types.ts        → TypeScript types
```

## Best Practices

1. **Separation of concerns** - Controller → Service → Model
2. **Validation** - Validate all inputs with Zod
3. **Error handling** - Use custom error classes
4. **Logging** - Log important events with Winston
5. **Testing** - Write tests for services and routes
