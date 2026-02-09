---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
inputDocuments: ["product-brief-read_trace-2026-02-09.md", "prd-read_trace-2026-02-09.md", "ux-design-specification.md"]
workflowType: 'architecture'
project_name: 'read_trace'
user_name: 'Lokki'
date: '2026-02-09'
architectureStatus: 'COMPLETE - READY FOR IMPLEMENTATION'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- **Auto-save & Resume System**: Real-time detection of title, chapter, and scroll position across supported sites with one-click resume functionality
- **Multi-Series Dashboard**: Centralized view of all tracked series with progress indicators, search/filter capabilities, and quick resume actions
- **Cross-Platform Tracking**: Support for minimum 2 major scanlation platforms with unified reading state and extensible architecture for new platforms
- **Basic Recap Functionality**: "Previously on..." summaries for users returning after >7 days breaks with key plot points and character developments
- **Browser Extension**: DOM monitoring, cross-origin communication, local storage for offline functionality, and automatic updates
- **Quick Onboarding**: 2-minute setup flow with browser extension installation and optional bookmark import

**Non-Functional Requirements:**
- **Performance**: <2 second dashboard load, <1 second resume action, real-time state updates within 5 seconds
- **Scalability**: Support 10,000 concurrent users at launch with horizontal scaling for 10x growth
- **Reliability**: 99.9% uptime, no data loss for reading progress, graceful degradation for unsupported sites
- **Security**: End-to-end encryption, OAuth integration, GDPR/CCPA compliance, anonymous usage analytics
- **Usability**: WCAG 2.1 AA compliance, responsive design, Chrome 90+/Firefox 88+/Safari 14+ support

**Scale & Complexity:**
- Primary domain: Full-stack web application with browser extension
- Complexity level: Medium-High
- Estimated architectural components: 8-12 major components

### Technical Constraints & Dependencies

- Browser extension API stability across Chrome, Firefox, Safari platforms
- Third-party scanlation site accessibility and structure changes
- Cloud infrastructure reliability and scalability requirements
- Next.js 14+ with App Router, shadcn/ui, and Tailwind CSS tech stack
- PostgreSQL primary database with Redis caching and Elasticsearch search
- Docker containerization with Kubernetes orchestration

### Cross-Cutting Concerns Identified

- **Authentication & Authorization**: JWT with refresh tokens, cross-device synchronization
- **Data Synchronization**: Real-time progress updates across devices and platforms
- **Error Handling & Monitoring**: Graceful degradation, real-time error tracking
- **Performance Optimization**: Caching strategies, lazy loading, CDN integration
- **Privacy & Compliance**: Data anonymization, user consent management
- **Extensibility**: Plugin architecture for new scanlation platforms

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application with browser extension based on project requirements analysis

### Starter Options Considered

**Next.js create-next-app**: Official Next.js CLI with TypeScript, ESLint, Tailwind CSS, App Router, and Turbopack defaults. Provides solid foundation for web applications with excellent performance and developer experience.

**Create T3 App**: Full-stack typesafe Next.js starter with Next.js, Prisma, TypeScript, Tailwind CSS, tRPC, and NextAuth.js. Emphasizes type safety and modularity, allowing selection of only needed components.

### Selected Starter: Next.js create-next-app

**Rationale for Selection:**
- Official Next.js CLI ensures long-term maintenance and compatibility
- Includes all required technologies from your PRD: Next.js 14+, TypeScript, Tailwind CSS
- App Router aligns with your UX requirements for dashboard and extension
- Turbopack provides excellent development performance for complex features
- Extensible architecture allows adding browser extension and backend services
- Best practices configuration with ESLint and modern tooling

**Initialization Command:**

```bash
npx create-next-app@latest read_trace --typescript --eslint --tailwind --app --turbopack --src-dir
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript configuration with strict type checking, modern ES2022+ features, and optimized compilation for production and development

**Styling Solution:**
Tailwind CSS with PostCSS, optimized purging in production, and utility-first approach supporting your shadcn/ui component requirements

**Build Tooling:**
Turbopack for development (fast refresh, optimized builds), Webpack for production compatibility, automatic code splitting and optimization

**Testing Framework:**
Jest configuration with React Testing Library support, setup for unit and integration testing capabilities

**Code Organization:**
src/ directory structure with clear separation of components, pages, API routes, and utilities following Next.js App Router conventions

**Development Experience:**
ESLint with Next.js-specific rules, Prettier integration, hot module replacement, TypeScript IDE support, and optimized development workflow

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Supabase as database and auth platform
- Next.js 14+ with App Router and TypeScript
- Zustand for state management
- Vercel + Supabase deployment

**Important Decisions (Shape Architecture):**
- Supabase Client SDK with optional API routes
- Email/Password + Google + Discord authentication
- Browser extension communication patterns

**Deferred Decisions (Post-MVP):**
- Advanced monitoring setup
- Performance optimization details
- Analytics implementation

### Data Architecture

**Database Platform:** Supabase (PostgreSQL 15.1 + Auth + Realtime)
- **Rationale:** All-in-one solution eliminating need for separate services
- **Affects:** User management, reading progress sync, series data storage
- **Implementation:** Row Level Security policies for data privacy

### Authentication & Security

**Authentication Method:** Supabase Auth with Email/Password + Google + Discord
- **Rationale:** Covers traditional users, Google convenience, Discord community integration
- **Affects:** User onboarding, social features, community engagement
- **Implementation:** RLS policies ensuring users only access their own data

### API & Communication Patterns

**Communication Pattern:** Supabase Client SDK with optional Next.js API routes
- **Rationale:** Direct client access for real-time features, flexibility to add API routes later
- **Affects:** Real-time sync, browser extension integration, data flow architecture
- **Implementation:** Realtime subscriptions for cross-device progress sync

### Frontend Architecture

**State Management:** Zustand
- **Rationale:** Browser extension friendly, real-time sync optimized, TypeScript-first
- **Affects:** Reading progress tracking, cross-device sync, extension communication
- **Implementation:** Focused stores for user data, reading progress, series metadata

### Infrastructure & Deployment

**Hosting Strategy:** Vercel + Supabase integration
- **Rationale:** Native Next.js integration, automatic env sync, global CDN
- **Affects:** Deployment pipeline, environment management, scaling strategy
- **Implementation:** Automatic deployments with preview environments

### Decision Impact Analysis

**Implementation Sequence:**
1. Initialize Next.js project with Supabase integration
2. Set up authentication flows (Email/Password + Google + Discord)
3. Implement database schema with RLS policies
4. Build Zustand stores for state management
5. Configure Vercel deployment pipeline

**Cross-Component Dependencies:**
- Authentication decisions affect all data access patterns
- State management choice impacts browser extension architecture
- Database design influences real-time sync implementation

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
25 areas where AI agents could make different choices

### Naming Patterns

**Database Naming Conventions:**
- Tables: `snake_case` (e.g., `reading_progress`, `user_series`)
- Columns: `snake_case` (e.g., `user_id`, `last_read_chapter`)
- Foreign keys: `user_id` format
- Primary keys: `id` (auto-increment)

**API Naming Conventions:**
- Endpoints: Plural (`/api/users`, `/api/series`)
- Route parameters: `:id` format
- Query parameters: `camelCase` (`userId`, `seriesId`)
- Headers: `X-Custom-Header` format

**Code Naming Conventions:**
- Components: `PascalCase` (`UserCard.tsx`)
- Files: `PascalCase` for components, `camelCase` for utilities
- Functions: `camelCase` (`getUserData`, `setReadingProgress`)
- Variables: `camelCase` (`userId`, `lastReadChapter`)

### Structure Patterns

**Project Organization:**
- Tests: Co-located (`Component.tsx` + `Component.test.tsx`)
- Components: Feature-based (`features/dashboard/components/`)
- Shared UI: `components/ui/` for atomic components
- Utilities: `lib/` for core, `utils/` for helpers
- Stores: `store/` at root level
- Hooks: `hooks/` for custom React hooks

**Directory Structure:**
```
src/
├── app/              # Next.js App Router
├── components/ui/    # Atomic UI components
├── features/         # Domain-specific logic
│   ├── dashboard/
│   └── extension/
├── hooks/            # Global React hooks
├── lib/              # SDK initializations
├── store/            # Zustand stores
├── types/            # TypeScript interfaces
└── utils/            # Pure helper functions
```

### Format Patterns

**API Response Formats:**
- All responses match Supabase `{data, error}` pattern
- Success: `{data: payload, error: null}`
- Error: `{data: null, error: {message, code}}`
- Dates: ISO 8601 strings

**Data Exchange Formats:**
- JSON fields: `camelCase` in frontend, `snake_case` in database
- Booleans: `true/false` (not 1/0)
- Null handling: Explicit `null` for missing values
- Arrays: Always arrays, never single objects

### Communication Patterns

**State Management Patterns:**
- Multiple domain stores (`useReadingStore`, `useAuthStore`)
- Immutable updates using spread operators
- Action naming: `set*`, `update*`, `add/remove*`, `toggle*`, `reset*`
- Granular selectors to prevent re-renders

**Event System Patterns:**
- Event naming: Dot notation (`reading.progress.updated`)
- Event payload: `{id, type, data, timestamp, userId?}`
- Real-time subscriptions for cross-device sync

### Process Patterns

**Error Handling Patterns:**
- React Error Boundaries for component errors
- Toast notifications for user-facing errors
- Console logging for development, structured logging for production
- Error format: `{type, code, message, context}`

**Loading State Patterns:**
- Local loading states per component
- Naming: `isLoading`, `isSaving`, `isSyncing`, `isSubmitting`
- Optimistic updates for instant feedback
- Smart retry logic for transient failures

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow naming conventions exactly
- Use co-located test files
- Implement optimistic updates for user actions
- Handle errors with toast notifications
- Use `{data, error}` response pattern

**Pattern Enforcement:**
- ESLint rules for naming conventions
- TypeScript interfaces for response formats
- Custom hooks for consistent state management
- Error boundary components for error handling

### Pattern Examples

**Good Examples:**
```typescript
// Component with co-located test
export const UserCard = () => { /* ... */ }
// UserCard.test.tsx

// Zustand store with immutable updates
set((state) => ({
  progress: { ...state.progress, [seriesId]: progress }
}))

// API response matching Supabase pattern
return { data: updatedProgress, error: null }
```

**Anti-Patterns:**
```typescript
// Don't mix naming conventions
const user_data = getUser() // ❌ Should be userData

// Don't use global loading states for local operations
const isLoading = useAppStore(state => state.loading) // ❌ Too broad

// Don't mutate state directly
state.progress[seriesId] = progress // ❌ Not immutable
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```
read_trace/
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── .env.local
├── .env.example
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── .windsurfrules
├── IMPLEMENTATION_STATUS.json
├── VERIFICATION_LOG.md
├── AI_SESSION_MEMORY.md
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── docs/
│   ├── AI_CONSTITUTION.md
│   ├── ai-memory/
│   │   ├── README.md
│   │   ├── resolved-issues.md
│   │   ├── command-playbook.md
│   │   ├── decisions.md
│   │   └── pitfalls.md
│   └── contracts.md
├── product/                 # BMAD Product Layer - REQUIRED
│   ├── roadmap.md
│   ├── decisions.md
│   ├── personas.md
│   ├── FEATURE_STATUS.json
│   └── features/
│       ├── _TEMPLATE/
│       │   ├── spec.md
│       │   ├── acceptance-criteria.md
│       │   ├── test-scenarios.md
│       │   └── risks.md
│       ├── auto-save-resume/
│       ├── multi-series-dashboard/
│       ├── cross-platform-tracking/
│       ├── basic-recap-functionality/
│       ├── browser-extension/
│       └── quick-onboarding/
├── backend/                 # BMAD Backend Layer
│   ├── services/
│   │   ├── auth/
│   │   ├── reading/
│   │   ├── series/
│   │   └── extension/
│   ├── middleware/
│   └── utils/
├── model/                   # BMAD Model Layer
│   ├── schemas/
│   ├── types/
│   └── validation/
├── api/                     # BMAD API Layer
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── dto/
├── database/                # BMAD Database Layer
│   ├── migrations/
│   ├── seeds/
│   ├── models/
│   └── queries/
├── src/                     # Next.js Frontend
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── store/
│   ├── types/
│   └── utils/
├── extension/
│   ├── manifest.json
│   ├── content.ts
│   ├── background.ts
│   └── popup/
├── tests/
│   ├── __mocks__/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .windsurf/
│   └── workflows/
├── public/
│   ├── icons/
│   └── manifest.json
└── vercel.json
```

### BMAD Architectural Boundaries

**Product Layer (Strategic Foundation):**
- **Purpose**: Define WHAT and WHY before implementation
- **Components**: roadmap.md, personas.md, features/, decisions.md
- **Rules**: No code without completed Product Layer specification
- **Enforcement**: AI Constitution + Product Layer enforcement

**BMAD Layer Communication:**
```
api/ → backend/ → model/
backend/ → database/ → model/
```

**Forbidden Communication Paths:**
- api/ → database/ (must go through backend/)
- api/ → model/ directly (must go through backend/)
- backend/ → api/ (unidirectional flow)
- model/ → database/ (model is pure)
- database/ → api/ (must go through backend/)

**Data Transfer Rules:**
- **API Layer**: DTOs (Data Transfer Objects)
- **Backend Layer**: Domain Objects
- **Model Layer**: Schemas/Types
- **Database Layer**: Raw Records

### Requirements to Structure Mapping

**Product Layer Features:**

**auto-save-resume/**
- Product: `product/features/auto-save-resume/spec.md`
- Backend: `backend/services/reading/progressService.ts`
- API: `api/routes/reading/progress.ts`
- Database: `database/migrations/003_create_reading_progress.sql`
- Frontend: `src/features/reading/components/ReadingProgress.tsx`

**multi-series-dashboard/**
- Product: `product/features/multi-series-dashboard/spec.md`
- Backend: `backend/services/series/seriesService.ts`
- API: `api/routes/series/index.ts`
- Database: `database/migrations/002_create_series.sql`
- Frontend: `src/features/dashboard/components/SeriesGrid.tsx`

**cross-platform-tracking/**
- Product: `product/features/cross-platform-tracking/spec.md`
- Backend: `backend/services/extension/platformService.ts`
- API: `api/routes/extension/platform.ts`
- Database: `database/migrations/005_create_extension_data.sql`
- Extension: `src/features/extension/content/platformAdapters/`

**basic-recap-functionality/**
- Product: `product/features/basic-recap-functionality/spec.md`
- Backend: `backend/services/reading/recapService.ts`
- API: `api/routes/reading/recap.ts`
- Database: `database/migrations/003_create_reading_progress.sql`
- Frontend: `src/features/dashboard/components/RecapSection.tsx`

**browser-extension/**
- Product: `product/features/browser-extension/spec.md`
- Backend: `backend/services/extension/contentService.ts`
- API: `api/routes/extension/content.ts`
- Database: `database/migrations/005_create_extension_data.sql`
- Extension: `extension/` + `src/features/extension/`

**quick-onboarding/**
- Product: `product/features/quick-onboarding/spec.md`
- Backend: `backend/services/auth/authService.ts`
- API: `api/routes/auth/`
- Database: `database/migrations/001_create_users.sql`
- Frontend: `src/features/dashboard/components/OnboardingWizard.tsx`

### Integration Points

**BMAD Data Flow:**
1. **API Request** → API Layer (DTO validation)
2. **API Layer** → Backend Layer (Domain Objects)
3. **Backend Layer** → Database Layer (via Model)
4. **Database Layer** → Model Layer (Raw Records)
5. **Model Layer** → Backend Layer (Schemas/Types)
6. **Backend Layer** → API Layer (Response DTOs)

**Frontend Integration:**
- **Next.js API Routes** → BMAD API Layer
- **Zustand Stores** → API Layer DTOs
- **Components** → Backend Services via API
- **Extension** → Background Script → API Layer

**External Integrations:**
- **Supabase**: Database layer + Auth + Realtime
- **OAuth Providers**: Backend auth services
- **Scanlation Sites**: Extension content scripts
- **Vercel**: Deployment platform

### BMAD Enforcement Guidelines

**All AI Agents MUST:**
1. **Read Product Layer First**: Check product/features/[feature]/ before implementation
2. **Follow BMAD Communication Paths**: No forbidden layer crossings
3. **Use Correct Data Types**: DTOs, Domain Objects, Schemas, Records
4. **Update IMPLEMENTATION_STATUS.json**: Track confidence metrics
5. **Document Decisions**: Use product/decisions.md for architectural choices
6. **Verify Before Shipping**: Ensure all tests pass + confidence score ≥90

**Product Layer Pipeline:**
```
IDEA → SPEC → ACCEPTANCE CRITERIA → TEST SCENARIOS → IMPLEMENTATION → VERIFICATION
```

**Feature Lifecycle States:**
```
PROPOSED → SPECIFIED → IMPLEMENTED → VERIFIED → SHIPPED → OBSERVED → IMPROVED
```

**Confidence Metrics Tracking:**
- Architecture: BMAD compliance score
- Testing: Pass rate + coverage
- Performance: Interactive Pulse (<300ms for web)
- Security: Vulnerability scan results
- Documentation: Code vs docs alignment

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices work together without conflicts. Next.js 14+ with Supabase 15.1 provides native integration, Zustand is browser-extension friendly, and Vercel + Supabase offers seamless deployment. All versions are current and mutually compatible.

**Pattern Consistency:**
Implementation patterns fully support architectural decisions. Naming conventions (snake_case database, camelCase frontend) are consistent across all layers. Structure patterns (feature-based organization, co-located tests) align perfectly with the chosen technology stack.

**Structure Alignment:**
The project structure comprehensively supports all architectural decisions. BMAD boundaries are properly defined with clear communication paths (api/ → backend/ → model/). Integration points between frontend, extension, and backend are well-structured.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
All six core features are fully supported architecturally:
- Auto-save & Resume: Supabase realtime + Zustand + extension content scripts
- Multi-Series Dashboard: Next.js components + Supabase queries + Zustand stores
- Cross-Platform Tracking: Extension platform adapters + sync services
- Basic Recap Functionality: Backend recap service + database storage
- Browser Extension: Complete extension architecture with content/background/popup
- Quick Onboarding: Supabase auth + onboarding components

**Functional Requirements Coverage:**
All functional requirements have direct architectural support. Real-time progress tracking, cross-device synchronization, OAuth authentication, and dashboard functionality are all addressed by the chosen technology stack and patterns.

**Non-Functional Requirements Coverage:**
Performance requirements addressed through Supabase CDN, Vercel global distribution, and optimized patterns. Security covered by Supabase RLS, OAuth integration, and BMAD data boundaries. Scalability supported by serverless architecture and database design.

### Implementation Readiness Validation ✅

**Decision Completeness:**
All critical architectural decisions are documented with specific versions and rationale. Technology stack, communication patterns, and data flow are fully specified. Implementation guidance is comprehensive.

**Structure Completeness:**
The project structure is complete and specific, with all files and directories defined. BMAD layer boundaries are clear, and integration points are explicitly mapped. Requirements to structure mapping is thorough.

**Pattern Completeness:**
All potential conflict points are addressed with comprehensive patterns. Naming conventions cover database, API, and code. Communication patterns include error handling, loading states, and optimistic updates. Process patterns are fully documented.

### Gap Analysis Results

**Critical Gaps:** None identified

**Important Gaps:** None identified

**Nice-to-Have Gaps:**
- Additional monitoring patterns (post-MVP enhancement)
- Advanced caching strategies (future optimization)
- Extended browser platform adapters (future expansion)

### Validation Issues Addressed

No blocking issues found. The architecture is coherent, complete, and ready for implementation. All decisions work together harmoniously, and the structure provides clear guidance for AI agents.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

**✅ BMAD Integration**
- [x] Product Layer structure defined
- [x] BMAD layer boundaries established
- [x] Communication paths specified
- [x] Enforcement guidelines documented

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** HIGH based on comprehensive validation results

**Key Strengths:**
- Complete technology stack with proven integrations
- Comprehensive BMAD architecture with clear boundaries
- Detailed implementation patterns preventing conflicts
- Full requirements coverage with specific architectural support
- Browser extension architecture properly integrated
- Real-time synchronization fully addressed

**Areas for Future Enhancement:**
- Advanced monitoring and analytics (post-MVP)
- Additional scanlation platform support
- Performance optimization patterns
- Extended offline functionality

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect BMAD project structure and layer boundaries
- Refer to this document for all architectural questions
- Read Product Layer specifications before implementing any feature
- Follow BMAD communication paths strictly

**First Implementation Priority:**
Initialize the project using the selected starter template:
```bash
npx create-next-app@latest read_trace --typescript --eslint --tailwind --app --turbopack --src-dir
```
