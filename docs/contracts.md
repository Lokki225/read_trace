# BMAD Design Contracts

## Overview

This document defines the architectural contracts for the BMAD (Business-Model-API-Database) layered architecture. These contracts enforce strict boundaries between layers and define allowed communication patterns.

## Layer Responsibilities

### API Layer (`api/`)

**Purpose**: Handle HTTP requests/responses and data transfer

**Responsibilities**:
- Validate incoming requests against DTOs
- Transform request DTOs to domain objects
- Call backend services
- Transform response objects to DTOs
- Handle HTTP status codes and error responses
- Implement request/response logging

**Data Type**: Data Transfer Objects (DTOs)

**Example DTO**:
```typescript
interface CreateReadingProgressDTO {
  seriesId: string;
  chapterId: string;
  scrollPosition: number;
  timestamp: ISO8601;
}
```

**Allowed Outbound Communication**:
- ✅ api/ → backend/ (call services)

**Forbidden Outbound Communication**:
- ❌ api/ → database/ (must go through backend/)
- ❌ api/ → model/ (must go through backend/)

---

### Backend Layer (`backend/`)

**Purpose**: Implement business logic and coordinate between layers

**Responsibilities**:
- Implement domain logic and business rules
- Coordinate between API and database layers
- Transform DTOs to domain objects
- Transform domain objects to database records
- Implement caching and optimization logic
- Handle cross-cutting concerns (logging, monitoring)

**Data Type**: Domain Objects

**Example Domain Object**:
```typescript
class ReadingProgress {
  seriesId: string;
  chapterId: string;
  scrollPosition: number;
  lastUpdated: Date;
  
  constructor(data: ReadingProgressDTO) {
    this.seriesId = data.seriesId;
    this.chapterId = data.chapterId;
    this.scrollPosition = Math.max(0, Math.min(100, data.scrollPosition));
    this.lastUpdated = new Date(data.timestamp);
  }
}
```

**Allowed Outbound Communication**:
- ✅ backend/ → database/ (query/persist data)
- ✅ backend/ → model/ (use schemas/types)

**Forbidden Outbound Communication**:
- ❌ backend/ → api/ (unidirectional flow)
- ❌ backend/ → external services directly (must be coordinated)

---

### Model Layer (`model/`)

**Purpose**: Define data structures and validation schemas

**Responsibilities**:
- Define TypeScript types and interfaces
- Implement validation schemas (Zod, Yup, etc.)
- Define domain enums and constants
- Provide type safety across layers

**Data Type**: Schemas/Types

**Example Schema**:
```typescript
import { z } from 'zod';

export const ReadingProgressSchema = z.object({
  seriesId: z.string().uuid(),
  chapterId: z.string(),
  scrollPosition: z.number().min(0).max(100),
  lastUpdated: z.date(),
});

export type ReadingProgress = z.infer<typeof ReadingProgressSchema>;
```

**Allowed Outbound Communication**:
- ✅ model/ → (no outbound dependencies - pure definitions)

**Forbidden Outbound Communication**:
- ❌ model/ → database/ (model is pure, no side effects)
- ❌ model/ → backend/ (backend uses model, not vice versa)
- ❌ model/ → api/ (api uses model, not vice versa)

---

### Database Layer (`database/`)

**Purpose**: Persist and retrieve data

**Responsibilities**:
- Execute database migrations
- Define database schema
- Implement query builders and ORM models
- Handle database connections and transactions
- Seed test data

**Data Type**: Raw Records

**Example Raw Record**:
```typescript
interface ReadingProgressRecord {
  id: string;
  user_id: string;
  series_id: string;
  chapter_id: string;
  scroll_position: number;
  last_updated: string; // ISO 8601
  created_at: string;
  updated_at: string;
}
```

**Allowed Outbound Communication**:
- ✅ database/ → model/ (use schemas for validation)

**Forbidden Outbound Communication**:
- ❌ database/ → api/ (must go through backend/)
- ❌ database/ → backend/ (unidirectional - backend calls database)

---

## Data Flow Contracts

### Complete Request-Response Cycle

```
1. HTTP Request
   ↓
2. API Layer (DTO Validation)
   - Validate request against DTO schema
   - Transform DTO → Domain Object
   ↓
3. Backend Layer (Business Logic)
   - Apply domain logic
   - Transform Domain Object → Database Record
   ↓
4. Database Layer (Persistence)
   - Execute query
   - Return Raw Record
   ↓
5. Backend Layer (Response Preparation)
   - Transform Raw Record → Domain Object
   - Transform Domain Object → Response DTO
   ↓
6. API Layer (Response)
   - Return DTO in HTTP response
   - Status code: 200/201/400/500 etc.
```

### Example: Create Reading Progress

**Step 1: API Layer receives request**
```typescript
// POST /api/reading/progress
{
  "seriesId": "uuid-123",
  "chapterId": "ch-45",
  "scrollPosition": 75,
  "timestamp": "2026-02-09T15:30:00Z"
}
```

**Step 2: API validates and calls backend**
```typescript
const dto = CreateReadingProgressDTO.parse(request.body);
const result = await readingService.createProgress(dto);
```

**Step 3: Backend transforms and persists**
```typescript
const domainObject = new ReadingProgress(dto);
const record = await database.readingProgress.create({
  user_id: userId,
  series_id: domainObject.seriesId,
  chapter_id: domainObject.chapterId,
  scroll_position: domainObject.scrollPosition,
  last_updated: domainObject.lastUpdated.toISOString(),
});
```

**Step 4: Backend transforms response**
```typescript
const responseDTO = {
  id: record.id,
  seriesId: record.series_id,
  chapterId: record.chapter_id,
  scrollPosition: record.scroll_position,
  lastUpdated: record.last_updated,
};
return { data: responseDTO, error: null };
```

**Step 5: API returns response**
```typescript
// 201 Created
{
  "data": {
    "id": "progress-uuid",
    "seriesId": "uuid-123",
    "chapterId": "ch-45",
    "scrollPosition": 75,
    "lastUpdated": "2026-02-09T15:30:00Z"
  },
  "error": null
}
```

---

## Communication Path Rules

### Allowed Paths (✅)

```
api/ → backend/
backend/ → database/
backend/ → model/
database/ → model/
```

### Forbidden Paths (❌)

```
api/ → database/        (violates layering)
api/ → model/           (violates layering)
backend/ → api/         (breaks unidirectional flow)
model/ → database/      (model is pure)
model/ → backend/       (backend uses model, not vice versa)
model/ → api/           (api uses model, not vice versa)
database/ → api/        (violates layering)
database/ → backend/    (unidirectional - backend calls database)
```

---

## Enforcement Mechanisms

### 1. TypeScript Strict Mode

All layers use strict TypeScript configuration to enforce type safety:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### 2. ESLint Import Rules

Enforce layer boundaries with ESLint:
```javascript
rules: {
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        'api/*',      // api/ cannot import from other layers
        'database/*', // database/ cannot import from api/
      ]
    }
  ]
}
```

### 3. Directory Structure Isolation

Clear separation prevents accidental imports:
```
api/           # Cannot import from backend/, model/, database/
backend/       # Cannot import from api/
model/         # Cannot import from any layer
database/      # Cannot import from api/, backend/
```

### 4. Code Review Checklist

Before merging, verify:
- [ ] No forbidden imports detected
- [ ] Data types match layer contract (DTO, Domain, Schema, Record)
- [ ] Communication flows follow allowed paths
- [ ] Tests validate layer boundaries

---

## Data Type Transformation Examples

### DTO → Domain Object → Record

**API Layer (DTO)**:
```typescript
interface UserRegistrationDTO {
  email: string;
  password: string;
  name: string;
}
```

**Backend Layer (Domain Object)**:
```typescript
class User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  
  constructor(dto: UserRegistrationDTO) {
    this.email = dto.email;
    this.passwordHash = hashPassword(dto.password);
    this.name = dto.name;
    this.createdAt = new Date();
  }
}
```

**Database Layer (Raw Record)**:
```typescript
interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
  updated_at: string;
}
```

**Model Layer (Schema)**:
```typescript
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  passwordHash: z.string(),
  name: z.string().min(1),
  createdAt: z.date(),
});
```

---

## Validation Rules

### Input Validation (API Layer)

All incoming requests must be validated against DTOs:
```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = CreateUserDTO.parse(body); // Throws if invalid
    // Process valid DTO
  } catch (error) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
```

### Business Logic Validation (Backend Layer)

Domain objects enforce business rules:
```typescript
class ReadingProgress {
  constructor(dto: ReadingProgressDTO) {
    if (dto.scrollPosition < 0 || dto.scrollPosition > 100) {
      throw new Error('Scroll position must be between 0 and 100');
    }
    this.scrollPosition = dto.scrollPosition;
  }
}
```

### Schema Validation (Model Layer)

Schemas provide runtime type checking:
```typescript
const result = ReadingProgressSchema.safeParse(data);
if (!result.success) {
  console.error('Validation failed:', result.error);
}
```

---

## Testing Across Layers

### API Layer Tests

Test DTO validation and HTTP contracts:
```typescript
describe('POST /api/reading/progress', () => {
  it('should reject invalid scroll position', async () => {
    const response = await POST({
      body: { scrollPosition: 150 } // Invalid
    });
    expect(response.status).toBe(400);
  });
});
```

### Backend Layer Tests

Test business logic in isolation:
```typescript
describe('ReadingProgress', () => {
  it('should clamp scroll position to 0-100', () => {
    const progress = new ReadingProgress({
      scrollPosition: 150
    });
    expect(progress.scrollPosition).toBe(100);
  });
});
```

### Database Layer Tests

Test persistence and queries:
```typescript
describe('readingProgressRepository', () => {
  it('should persist and retrieve reading progress', async () => {
    const record = await db.readingProgress.create({...});
    const retrieved = await db.readingProgress.findById(record.id);
    expect(retrieved.id).toBe(record.id);
  });
});
```

### Integration Tests

Test complete request-response cycle:
```typescript
describe('Reading Progress Integration', () => {
  it('should create and retrieve reading progress', async () => {
    const response = await POST(createProgressRequest);
    expect(response.status).toBe(201);
    
    const getResponse = await GET(`/api/reading/progress/${response.id}`);
    expect(getResponse.data.scrollPosition).toBe(75);
  });
});
```

---

## Summary

These contracts establish clear boundaries and communication patterns for the BMAD architecture:

1. **Each layer has a specific purpose** and data type
2. **Communication flows unidirectionally** through the stack
3. **Forbidden paths are strictly enforced** to prevent architectural violations
4. **Data transforms at layer boundaries** to maintain type safety
5. **All layers are independently testable** through their contracts

By adhering to these contracts, the codebase maintains architectural integrity, enables parallel development, and facilitates testing and maintenance.
