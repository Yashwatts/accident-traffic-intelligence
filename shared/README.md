# Shared Types

Shared TypeScript types and constants used by both frontend and backend.

## Purpose

- **Single source of truth** for data structures
- **Type safety** across the entire stack
- **Consistency** between client and server
- **Easy refactoring** - Change types in one place

## Structure

```
shared/
├── types/
│   ├── incident.types.ts   → Incident-related types
│   ├── user.types.ts       → User-related types
│   ├── api.types.ts        → API request/response types
│   └── index.ts
├── constants/
│   ├── roles.ts            → User roles
│   ├── statuses.ts         → Incident statuses
│   └── index.ts
└── utils/
    └── validation.ts       → Shared validation logic
```

## Usage

### Frontend
```typescript
import { Incident, Severity } from '@shared/types';
```

### Backend
```typescript
import { Incident, Severity } from '@shared/types';
```

## Example Types

```typescript
// shared/types/incident.types.ts
export type Severity = 'minor' | 'moderate' | 'severe' | 'critical';
export type Status = 'active' | 'dispatched' | 'on-scene' | 'cleared';

export interface Incident {
  id: string;
  location: {
    lat: number;
    lng: number;
  };
  severity: Severity;
  status: Status;
  vehicleCount: number;
  injuries: boolean;
  photos: string[];
  createdAt: Date;
}
```

## Benefits

✓ **No type mismatches** between FE and BE
✓ **Autocomplete** in both projects
✓ **Refactor safely** with TypeScript
✓ **Single package** - Can be published to npm
