# 🚀 BMAD Complete Starter Kit

**Purpose:** Complete project setup with BMAD Method, rules, workflows, and all insights from PickSizer  
**Created:** 2026-01-21  
**Version:** 1.0.0  
**Based on:** Real-world implementation challenges and solutions

---

## 📋 Quick Start Checklist

### Phase 1: Project Foundation (Day 1)

**Step 0: AI Foundation (CRITICAL FIRST STEP)**
- [ ] **Create docs/AI_CONSTITUTION.md** - Supreme behavioral authority for all AI agents
- [ ] **Create docs/ai-memory/** folder - Persistent AI knowledge base
  - [ ] Create docs/ai-memory/README.md (usage guide)
  - [ ] Create docs/ai-memory/resolved-issues.md (never re-solve these)
  - [ ] Create docs/ai-memory/command-playbook.md (known working commands)
  - [ ] Create docs/ai-memory/decisions.md (architectural decisions)
  - [ ] Create docs/ai-memory/pitfalls.md (common mistakes to avoid)

**Step 1: Core Project Files**
- [ ] Copy this starter kit to new project
- [ ] Initialize Product Layer with required structure
- [ ] Create product/roadmap.md with product vision and milestones
- [ ] Create product/personas.md with target user definitions
- [ ] Create product/decisions.md for architecture decision records
- [ ] Create product/FEATURE_STATUS.json for feature lifecycle tracking
- [ ] Set up product/features/_TEMPLATE/ with all required templates
- [ ] Create docs/contracts.md with BMAD design contracts
- [ ] Initialize BMAD structure (Backend, Model, API, Database folders)
- [ ] Set up IMPLEMENTATION_STATUS.json with template
- [ ] **MANDATORY**: Set platformType (web|mobile|desktop|api|cli) in IMPLEMENTATION_STATUS.json
- [ ] Configure platform-specific performance targets based on platformType
- [ ] Create VERIFICATION_LOG.md with template
- [ ] Configure Jest with comprehensive jest.setup.js
- [ ] Set up package.json with required dependencies

**Step 2: AI Agent Configuration**
- [ ] Create .windsurfrules with AI Constitution reference at top + BMAD rules
- [ ] Set up enhanced workflows in .windsurf/workflows/:
  - [ ] /continue-implementation.md (with AI Constitution bootstrap)
  - [ ] /validate-implementation.md (with AI Constitution bootstrap)
  - [ ] /smart-implementation.md (with AI Constitution bootstrap)
  - [ ] /confidence-guard.md (quality protection)
  - [ ] /product-alignment.md (strategic validation)
  - [ ] /auto-healing.md (proactive fixes)
- [ ] Configure AI_SESSION_MEMORY.md

### Phase 2: Test Infrastructure (Day 1-2)
- [ ] Implement global mocks in jest.setup.js
- [ ] Create test utilities and mock factories
- [ ] Set up CI/CD with 95% pass rate gates
- [ ] Configure performance monitoring (<300ms Interactive Pulse)

### Phase 3: Development Workflow (Ongoing)
- [ ] Use verification-first approach for all changes
- [ ] Update IMPLEMENTATION_STATUS.json after each task
- [ ] Maintain VERIFICATION_LOG.md with evidence
- [ ] Run full test suite before commits

---

## 🏗️ BMAD Structure Template

```
project-root/
├── docs/                    # CRITICAL: AI Foundation & Documentation
│   ├── AI_CONSTITUTION.md   # Supreme AI behavioral authority (READ FIRST)
│   ├── ai-memory/           # Persistent AI knowledge base
│   │   ├── README.md        # Memory system usage guide
│   │   ├── resolved-issues.md    # Never re-solve these problems
│   │   ├── command-playbook.md   # Known working commands
│   │   ├── decisions.md          # Architectural decisions (ADRs)
│   │   └── pitfalls.md           # Common mistakes to avoid
│   └── contracts.md         # Design contracts between BMAD layers
├── product/                 # REQUIRED: Product Layer - Strategic foundation
│   ├── roadmap.md           # Product vision, milestones, success metrics
│   ├── decisions.md         # Architecture decision records (ADR)
│   ├── personas.md          # User definitions and needs
│   ├── FEATURE_STATUS.json  # Feature lifecycle tracking
│   └── features/            # Feature specifications
│       ├── _TEMPLATE/       # Feature template (DO NOT MODIFY)
│       │   ├── spec.md
│       │   ├── acceptance-criteria.md
│       │   ├── test-scenarios.md
│       │   └── risks.md
│       └── <feature-name>/  # Individual feature folders
├── backend/                 # BMAD: Backend logic and services
│   ├── services/
│   ├── middleware/
│   └── utils/
├── model/                   # BMAD: Data models and validation
│   ├── schemas/
│   ├── types/
│   └── validation/
├── api/                     # BMAD: API endpoints and routing
│   ├── routes/
│   ├── controllers/
│   └── middleware/
├── database/                # BMAD: Database schemas and migrations
│   ├── migrations/
│   ├── seeds/
│   └── models/
├── tests/                   # Test suites organized by layer
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/                 # Build and utility scripts
├── .windsurf/               # Windsurf configuration
│   └── workflows/           # Custom workflows (with AI bootstrap)
├── IMPLEMENTATION_STATUS.json
├── VERIFICATION_LOG.md
├── AI_SESSION_MEMORY.md
├── .windsurfrules           # BMAD rules + AI Constitution reference
├── jest.setup.js
└── package.json
```

---

## 🧱 BMAD PRODUCT LAYER — OFFICIAL SPEC (v1.1)

**This section defines the Product Layer for BMAD.**  
**The Product Layer is NOT optional. It is REQUIRED for all SaaS projects.**

The Product Layer exists to ensure that:
• All code is tied to a user problem  
• All features are defined before implementation  
• All features are verifiable  
• No feature is built without documented value  

**Agents MUST follow the rules in this section exactly.**

---

### 🎯 PURPOSE

The Product Layer enforces a strict pipeline:

**IDEA → FEATURE SPEC → ACCEPTANCE CRITERIA → TEST SCENARIOS → IMPLEMENTATION → VERIFICATION**

No step may be skipped.  
No step may be merged.  
No step may be inferred.

---

### 📁 REQUIRED DIRECTORY STRUCTURE

The following structure MUST exist at the root of every BMAD project:

```
product/
├── roadmap.md
├── decisions.md
├── personas.md
├── features/
│   ├── _TEMPLATE/
│   │   ├── spec.md
│   │   ├── acceptance-criteria.md
│   │   ├── test-scenarios.md
│   │   └── risks.md
│   └── <feature-name>/
│       ├── spec.md
│       ├── acceptance-criteria.md
│       ├── test-scenarios.md
│       └── risks.md
```

**Agents MUST NOT change this structure.**  
**Agents MUST NOT rename these files.**

---

### 📄 PRODUCT FILE DEFINITIONS

#### 1. roadmap.md

This file defines the long-term direction of the SaaS.

It MUST contain:
• Product vision  
• Target users  
• Business goal (revenue or impact)  
• Milestones (M1, M2, M3…)  
• Success metrics  

**Agents MUST read this file before working on any feature.**

---

#### 2. decisions.md

This file logs all important decisions.

Each decision entry MUST include:
• Date  
• Context  
• Decision  
• Alternatives considered  
• Consequences  
• Status (Active / Deprecated)

**Agents MUST write to this file when:**
• Choosing a framework  
• Changing architecture  
• Removing a feature  
• Changing a core rule

---

#### 3. personas.md

This file defines the users of the SaaS.

Each persona MUST include:
• Role  
• Goals  
• Pain points  
• How the product helps

**Agents MUST validate that every feature serves at least one persona.**

---

### 📌 FEATURE DEFINITION SYSTEM

Each feature MUST have its own folder inside:

```
product/features/<feature-name>/
```

Each feature folder MUST contain exactly:

• spec.md  
• acceptance-criteria.md  
• test-scenarios.md  
• risks.md  

**No file may be missing.**  
**No file may be empty.**

---

#### spec.md — Feature Specification

This file defines WHAT and WHY.

It MUST include:
• Feature name  
• Summary  
• Problem statement  
• Goals  
• Non-goals  
• User flow  
• Technical constraints  

**Agents MUST NOT implement a feature without a completed spec.md.**

---

#### acceptance-criteria.md — Completion Rules

This file defines WHEN the feature is considered done.

It MUST include:
• A checklist of user-visible behaviors  
• Edge cases  
• Error handling rules  

Each line MUST be testable.

**Agents MUST use this file to verify completion.**

---

#### test-scenarios.md — Verification Definition

This file defines HOW the feature will be tested.

It MUST include:
• Scenario ID  
• Input  
• Expected output  
• Validation rules  

**Agents MUST map these to real tests.**

---

#### risks.md — Failure Awareness

This file defines what could go wrong.

It MUST include:
• Technical risks  
• Product risks  
• Performance risks  
• Mitigation strategies  

**Agents MUST read this before implementation.**

---

### 🚫 STRICT RULES (NO INTERPRETATION)

• No code without a spec.md  
• No feature without acceptance-criteria.md  
• No feature is complete without test-scenarios.md  
• No feature is shipped without verification  
• No undocumented decisions  

**Agents MUST NOT:**
• Guess requirements  
• Skip files  
• Merge steps  
• Invent structure

---

### ⚖️ MODE: BALANCED SAAS MODE

This Product Layer is optimized for:

• Fast iteration  
• Revenue-driven SaaS  
• Solo or small-team development  
• High discipline without bureaucracy  

**This is NOT:**
• Enterprise documentation bloat  
• Academic theory  
• Over-engineering

---

### 📌 ENFORCEMENT

**Agents MUST:**

1. Read product/roadmap.md  
2. Validate persona relevance  
3. Check spec.md exists  
4. Confirm acceptance-criteria.md exists  
5. Confirm test-scenarios.md exists  
6. Confirm risks.md exists  
7. Only then start implementation

**Failure to follow these steps = BMAD violation.**

---

**END OF PRODUCT LAYER SPEC**

---

## 🔁 BMAD FEATURE LIFECYCLE — OFFICIAL SPEC (v1.1)

**This section defines the Feature Lifecycle for BMAD.**  
**It is MANDATORY for all SaaS features.**

The Feature Lifecycle exists to ensure that:
• No feature is built without intent  
• No feature is shipped without verification  
• No feature is abandoned without observation  
• No feature is considered done without real-world feedback  

**Agents MUST follow this lifecycle exactly.**

---

### 🎯 PURPOSE

The Feature Lifecycle enforces a controlled flow:

**PROPOSED → SPECIFIED → IMPLEMENTED → VERIFIED → SHIPPED → OBSERVED → IMPROVED → (repeat)**

No state may be skipped.  
No state may be merged.  
No state may be inferred.

---

### 📌 FEATURE STATES (STRICT DEFINITIONS)

#### 1. PROPOSED

A feature is PROPOSED when:
• A problem or opportunity is identified  
• It is written as an idea in product/roadmap.md or product/decisions.md  

**Rules:**
• No code allowed  
• No feature folder allowed yet  

---

#### 2. SPECIFIED

A feature is SPECIFIED when:
• A folder exists in product/features/<feature-name>/  
• spec.md is complete  
• acceptance-criteria.md is complete  
• test-scenarios.md is complete  
• risks.md is complete  

**Rules:**
• No implementation before this state  
• All 4 files MUST exist and be filled  

---

#### 3. IMPLEMENTED

A feature is IMPLEMENTED when:
• Code exists in backend/, model/, api/, database/  
• Code follows BMAD architecture  
• Feature logic is fully written  

**Rules:**
• Tests may still fail  
• Verification not yet done  

---

#### 4. VERIFIED

A feature is VERIFIED when:
• All test scenarios are mapped to real tests  
• All tests pass  
• Performance targets are respected  
• Security checks pass  

**Rules:**
• Must update IMPLEMENTATION_STATUS.json  
• Must update VERIFICATION_LOG.md  

---

#### 5. SHIPPED

A feature is SHIPPED when:
• It is deployed to users (prod or beta)  
• Users can access it  

**Rules:**
• Version tag required  
• Feature flag or release note required  

---

#### 6. OBSERVED

A feature is OBSERVED when:
• Usage is tracked  
• Errors are logged  
• Performance is monitored  
• User feedback is collected  

**Rules:**
• Metrics must be recorded  
• No new work without observation  

---

#### 7. IMPROVED

A feature is IMPROVED when:
• Issues from OBSERVED are turned into new PROPOSED items  
• Spec is updated  
• Tests updated  
• Code refined  

**Rules:**
• Lifecycle loops back to SPECIFIED  

---

### 📊 REQUIRED TRACKING FILE

Add this file:

`product/FEATURE_STATUS.json` 

```json
{
  "features": [
    {
      "name": "feature-name",
      "state": "PROPOSED",
      "owner": "Franklin",
      "persona": "Primary User",
      "businessGoal": "Increase retention",
      "created": "YYYY-MM-DD",
      "lastUpdated": "YYYY-MM-DD",
      "metrics": {
        "usage": null,
        "errorRate": null,
        "performance": null
      }
    }
  ]
}
```

**Agents MUST update this file when a feature changes state.**

---

### 🚫 STRICT RULES

• No feature can jump states
• No feature can be in two states
• No feature can be marked VERIFIED without passing tests
• No feature can be SHIPPED without VERIFIED
• No IMPROVED without OBSERVED

---

### 📌 ENFORCEMENT CHECKLIST

**Before coding:**

* [ ] State = SPECIFIED
* [ ] All 4 product files exist

**Before shipping:**

* [ ] State = VERIFIED
* [ ] Tests passed
* [ ] Performance ok
* [ ] Security ok

---

**END OF FEATURE LIFECYCLE SPEC**

---

## 🔐 BMAD DESIGN CONTRACTS — OFFICIAL SPEC (v1.1)

**This section defines the Design Contracts between BMAD layers.**  
**It is MANDATORY for all BMAD SaaS projects.**

The Design Contracts exist to ensure that:
• Strict separation of concerns  
• Predictable data flow  
• No layer leakage  
• No hidden dependencies  

**Agents MUST follow these rules exactly.**

---

### 🧱 BMAD LAYERS (AUTHORITATIVE)

BMAD consists of exactly four layers:

1. **backend/**   → Business logic & services  
2. **model/**     → Pure data structures & validation  
3. **api/**       → External interfaces & controllers  
4. **database/**  → Persistence & queries  

No other layers may perform these roles.

---

### 🔁 ALLOWED COMMUNICATION PATHS

Only the following communication is allowed:

**api/ → backend/ → model/**  
**backend/ → database/ → model/**

🚫 **Forbidden paths:**

• api/ → database/  
• api/ → model/ directly  
• backend/ → api/  
• model/ → database/  
• database/ → api/

---

### 📦 DATA TRANSFER RULES

Each layer uses its own data type:

• **API** → DTO (Data Transfer Object)  
• **Backend** → Domain Objects  
• **Model** → Schemas / Types  
• **Database** → Raw Records  

**Rules:**
• API MUST NOT return database entities  
• Backend MUST NOT expose ORM models  
• Model MUST NOT contain business logic  
• Database MUST NOT contain validation logic  

---

### 📁 REQUIRED CONTRACT FILE

Add this file:

`docs/contracts.md` 

```markdown
# 🔐 BMAD Design Contracts

## Layer Responsibilities

### API Layer
- Handles HTTP / RPC input & output
- Performs request validation
- Maps DTOs to domain inputs

### Backend Layer
- Contains all business logic
- Orchestrates workflows
- Calls model and database via interfaces

### Model Layer
- Defines schemas, types, validation rules
- No side effects
- No I/O

### Database Layer
- Handles persistence
- No business rules
- No API logic

---

## Data Flow Contracts

API → Backend → Model  
Backend → Database → Model  

No other flow is allowed.

---

## DTO Rules

- API inputs use DTOs
- API outputs use DTOs
- DTOs must be explicit objects
- No implicit field spreading

---

## Forbidden Practices

- Returning DB models from API
- Accessing DB directly in API
- Putting logic in Model
- Validating in Database

---

END OF DESIGN CONTRACTS
```

**Agents MUST read this file before implementing any feature.**

---

### 🚫 STRICT RULES

• No layer may bypass another
• No data structure may cross layers without mapping
• No business logic in model/
• No persistence logic in backend/ without repository interface
• No validation in database/

**Violations are BMAD failures.**

---

### 📌 ENFORCEMENT

Before any PR or task completion:

* [ ] API only uses DTOs
* [ ] Backend only uses domain objects
* [ ] Model only contains schemas/types
* [ ] Database only contains queries/migrations

---

**END OF DESIGN CONTRACTS SPEC**

---

## 📊 BMAD CONFIDENCE METRICS — OFFICIAL SPEC (v1.1)

**This section defines the Confidence Metrics System for BMAD.**  
**It is MANDATORY for all SaaS projects using BMAD.**

The Confidence Metrics System exists to:
• Quantify how trustworthy the system is  
• Prevent fake progress  
• Make quality visible  
• Drive engineering decisions with data  

**Agents MUST follow this system exactly.**

---

### 🎯 PURPOSE

The system computes a **Confidence Score** based on five pillars:

1. **Architecture**  
2. **Testing**  
3. **Performance**  
4. **Security**  
5. **Documentation**

Each pillar is scored independently.  
The global Confidence Score is the average.

No subjective scoring is allowed.

---

### 📁 REQUIRED FILE UPDATE

Extend `IMPLEMENTATION_STATUS.json` with:

```json
"confidenceScore": {
  "architecture": 0,
  "testing": 0,
  "performance": 0,
  "security": 0,
  "documentation": 0,
  "global": 0
}
```

**Agents MUST update these after every session.**

---

### 📐 SCORING RULES (0 → 100 SCALE)

Each pillar is scored strictly using the rules below.

---

#### 1. ARCHITECTURE SCORE

Based on BMAD compliance:

| Condition                 | Score |
| ------------------------- | ----- |
| BMAD fully respected      | 100   |
| Minor layer leaks         | 75    |
| Multiple violations       | 40    |
| Spaghetti / no separation | 0     |

**Rules:**
• Uses Design Contracts
• No forbidden communication paths
• All layers present

---

#### 2. TESTING SCORE

Based on real metrics:

| Condition                        | Score |
| -------------------------------- | ----- |
| Pass rate ≥95% and coverage ≥80% | 100   |
| Pass rate ≥90%                   | 75    |
| Pass rate ≥80%                   | 40    |
| <80%                             | 0     |

**Agents MUST use real test output.**

---

#### 3. PERFORMANCE SCORE

Based on Interactive Pulse with **platform-adaptive thresholds**:

| Platform | Target | Score 100 | Score 75 | Score 40 | Score 0 |
|----------|---------|-------------|------------|------------|-----------|
| **Web** | <300ms | <300ms | 300-500ms | 500ms-1s | >1s |
| **Mobile** | <200ms | <200ms | 200-400ms | 400ms-800ms | >800ms |
| **Desktop** | <100ms | <100ms | 100-200ms | 200ms-500ms | >500ms |
| **API** | <150ms | <150ms | 150-300ms | 300ms-600ms | >600ms |
| **CLI** | <500ms | <500ms | 500ms-1s | 1s-2s | >2s |

**Rules:**
• Read platformType from IMPLEMENTATION_STATUS.json
• Use appropriate thresholds for scoring
• Auto-detect platform if not specified
• Measured with platform-appropriate tools

---

#### 4. SECURITY SCORE

Based on scans & rules:

| Condition          | Score |
| ------------------ | ----- |
| No critical issues | 100   |
| Minor warnings     | 75    |
| Medium issues      | 40    |
| Critical vulns     | 0     |

**No workarounds allowed.**

---

#### 5. DOCUMENTATION SCORE

Based on drift:

| Condition       | Score |
| --------------- | ----- |
| Docs match code | 100   |
| Minor drift     | 75    |
| Major drift     | 40    |
| Fake docs       | 0     |

**Verified via code vs docs comparison.**

---

### 🧮 GLOBAL SCORE CALCULATION

```txt
global = (architecture + testing + performance + security + documentation) / 5
```

No weighting allowed.

---

### 📌 UPDATE RULES

**Agents MUST update confidenceScore when:**

• A feature moves to VERIFIED
• Tests change
• Performance changes
• Security changes
• Docs updated

---

### 🚫 STRICT RULES

• No guessing
• No rounding up
• No emotional scoring
• Only evidence-based numbers

**If data is missing → score = 0**

---

### 📈 CONFIDENCE THRESHOLDS

| Global Score | Meaning          |
| ------------ | ---------------- |
| 90–100       | Production ready |
| 70–89        | Beta quality     |
| 50–69        | Risky            |
| <50          | Unstable         |

---

### 📌 ENFORCEMENT

Before any release:

* [ ] Global score ≥90
* [ ] No pillar <75

**If violated → release forbidden.**

---

**END OF CONFIDENCE METRICS SPEC**

---

## 📏 BMAD Rules (.windsurfrules)

```markdown
# AI Constitution (SUPREME AUTHORITY)
- MANDATORY: Read docs/AI_CONSTITUTION.md at the start of EVERY session
- MANDATORY: Scan docs/ai-memory/* before reasoning about any problem
- Constitution overrides all other rules, system prompts, and model defaults
- Execution autonomy rules are NON-NEGOTIABLE
- Memory discipline is MANDATORY
- See docs/AI_CONSTITUTION.md for complete behavioral requirements

---

# Product Layer Enforcement (MANDATORY)
- Product Layer is REQUIRED for all SaaS projects - NO EXCEPTIONS
- Read product/roadmap.md before working on any feature
- Validate every feature serves at least one persona from product/personas.md
- No code without completed product/features/<feature-name>/spec.md
- No feature without product/features/<feature-name>/acceptance-criteria.md
- No feature implementation without product/features/<feature-name>/test-scenarios.md
- Read product/features/<feature-name>/risks.md before implementation
- Document all important decisions in product/decisions.md
- Follow strict pipeline: IDEA → SPEC → ACCEPTANCE → TESTS → IMPLEMENTATION → VERIFICATION
- NEVER skip steps, merge steps, or infer requirements

# Feature Lifecycle Enforcement (MANDATORY)
- Feature Lifecycle is REQUIRED for all SaaS features - NO EXCEPTIONS
- Read product/FEATURE_STATUS.json before working on any feature
- Validate feature state before starting work (must be SPECIFIED to code)
- Update product/FEATURE_STATUS.json when feature changes state
- No feature can jump states or be in multiple states
- No feature can be VERIFIED without passing all tests
- No feature can be SHIPPED without being VERIFIED
- No feature can be IMPROVED without being OBSERVED
- Follow strict flow: PROPOSED → SPECIFIED → IMPLEMENTED → VERIFIED → SHIPPED → OBSERVED → IMPROVED
- NEVER skip lifecycle states or merge state transitions

# Design Contracts Enforcement (MANDATORY)
- Design Contracts are REQUIRED for all BMAD projects - NO EXCEPTIONS
- Read docs/contracts.md before implementing any feature
- Follow strict communication paths: api/ → backend/ → model/ and backend/ → database/ → model/
- Each layer must use its own data types (DTOs, Domain Objects, Schemas, Records)
- NO forbidden paths: api/ → database/, api/ → model/ directly, backend/ → api/, model/ → database/, database/ → api/
- API MUST NOT return database entities
- Backend MUST NOT expose ORM models
- Model MUST NOT contain business logic
- Database MUST NOT contain validation logic
- No data structure may cross layers without explicit mapping
- Violations are BMAD failures

# Confidence Metrics Enforcement (MANDATORY)
- Confidence Metrics are REQUIRED for all BMAD projects - NO EXCEPTIONS
- Update IMPLEMENTATION_STATUS.json confidenceScore after every session
- Score based on evidence only (test output, performance tools, security scans)
- No subjective scoring, guessing, or emotional assessments
- Global score ≥90 required for production release
- No individual pillar may be <75 for release
- If data missing, score = 0 (no fake progress)
- Release forbidden if confidence thresholds not met

# BMAD Architecture Enforcement
- Always follow the BMAD structure: Product, Backend, Model, API, Database
- Keep backend logic separate from frontend concerns
- Models should be pure data structures with validation
- API layer handles all external communication
- Database interactions must go through proper ORM/query builders
- Never mix business logic with database queries directly

# Code Organization
- Use feature-based folder structure within BMAD layers
- Each BMAD component should have clear single responsibility
- Follow dependency injection patterns
- Keep files under 300 lines; split when exceeding this
- Group related functionality in modules

# Incremental Development
- Break changes into small, testable commits
- Complete one feature fully before starting another
- Always run tests after modifications
- Update documentation inline with code changes
- Request confirmation before major architectural changes

# Error Handling & Validation
- Implement comprehensive error handling at API boundaries
- Validate all inputs at the API layer
- Use typed schemas for request/response validation
- Log errors with context and stack traces
- Return user-friendly error messages

# Clean Code Practices
- Use meaningful variable and function names
- Avoid abbreviations unless industry-standard
- Write self-documenting code; comments explain "why" not "what"
- Follow DRY principle; extract repeated code
- Maximum function complexity: 10 cyclomatic complexity

# Testing Requirements
- Write unit tests for all business logic
- Integration tests for API endpoints
- Mock external dependencies in tests
- Aim for 80%+ code coverage
- Tests must be deterministic and isolated

# Performance Optimization
- Implement caching for frequently accessed data
- Use pagination for list endpoints (default 50 items)
- Optimize database queries; avoid N+1 problems
- Lazy load relationships when appropriate
- Profile before optimizing; measure improvements

# Security Best Practices
- Never commit secrets or API keys
- Use environment variables for configuration
- Implement rate limiting on public endpoints
- Validate and sanitize all user inputs
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization
```

---

## 🔧 Custom Workflows (.windsurf/workflows/)

### /smart-implementation.md
```markdown
---
description: Intelligent implementation with real-time validation, confidence tracking, and anti-simplification enforcement
---

# Smart Implementation Workflow v2.0

## Purpose
Execute implementation with continuous validation, automatic confidence scoring, goosebumps-free development, and **MANDATORY** prevention of corner-cutting, simplification, or incomplete implementations.

---

## 🔰 STEP -1 — AI Constitution Bootstrap (MANDATORY FIRST STEP)

**Before ANY implementation action, execute this bootstrap sequence:**

### Required Reading:

```
📚 BOOTSTRAP CHECKLIST:

□ Read docs/AI_CONSTITUTION.md (MANDATORY)
□ Scan docs/ai-memory/resolved-issues.md (Never re-solve these)
□ Scan docs/ai-memory/command-playbook.md (Use known commands)
□ Scan docs/ai-memory/decisions.md (Follow established patterns)
□ Scan docs/ai-memory/pitfalls.md (Avoid known mistakes)
□ Read AI_SESSION_MEMORY.md (Session context)
□ Read IMPLEMENTATION_STATUS.json (Current work)
```

### Constitution Acknowledgment:

```
🔰 AI CONSTITUTION LOADED

✅ Execution autonomy: ENABLED
✅ Memory discipline: ACTIVE
✅ Cascading tasks: ENABLED
✅ Anti-simplification: ZERO TOLERANCE
✅ Product Layer: 100% implementation required

Proceeding with smart implementation...
```

**BLOCKING RULE**: Do not proceed to implementation until bootstrap is complete.

---

## 🚨 CRITICAL: Anti-Simplification Rules

### **ZERO TOLERANCE POLICY**

**AI Agents MUST NEVER:**

- ❌ Propose "simplified" or "minimal" versions of requirements
- ❌ Skip acceptance criteria claiming they're "optional"
- ❌ Omit edge cases or error handling
- ❌ Skip test scenarios documented in Product Layer
- ❌ Remove features to "make implementation easier"
- ❌ Suggest "implementing this later" for documented requirements
- ❌ Replace specified solutions with "simpler alternatives"
- ❌ Skip integration requirements
- ❌ Ignore performance, security, or quality requirements
- ❌ Mark stories complete without implementing ALL acceptance criteria

### **MANDATORY IMPLEMENTATION RULE**

> **Every single item in acceptance criteria, test scenarios, specifications, and risk assessments MUST be implemented EXACTLY as documented. No exceptions. No simplifications. No shortcuts.**

### **Verification Before ANY Code Change**

Before writing ANY code, AI agents MUST:

1. **Read and acknowledge** ALL Product Layer files
2. **Create implementation checklist** from acceptance criteria
3. **Verify** every item will be implemented
4. **Confirm** no simplifications or omissions
5. **Document** the implementation approach for EACH criterion

---

## Pre-Flight Safety Check

### 1. **Product Layer Verification (MANDATORY)**

**BLOCKING CHECK**: Before ANY implementation, verify Product Layer completeness:

```
✅ Product Layer Checklist for [FEATURE_NAME]:

📋 Specifications:
  □ Feature specification exists at product/features/[FEATURE]/spec.md
  □ Problem statement is clear and specific
  □ Goals are well-defined
  □ User flow is complete
  □ Technical constraints are listed

✅ Acceptance Criteria:
  □ Acceptance criteria exists at product/features/[FEATURE]/acceptance-criteria.md
  □ ALL functional requirements are testable
  □ ALL integration requirements are specific
  □ ALL quality requirements have measurable criteria
  □ ALL edge cases are documented
  □ ALL error handling scenarios are defined
  □ ALL performance criteria are quantified
  □ ALL security requirements are specified

✅ Test Scenarios:
  □ Test scenarios exist at product/features/[FEATURE]/test-scenarios.md
  □ ALL test scenarios map to acceptance criteria
  □ Input/output for each scenario is defined

✅ Implementation Tasks (MANDATORY PHASE-BASED BREAKDOWN):
  □ Create implementation_tasks_phase1.md (Domain Layer)
  □ Create implementation_tasks_phase2.md (Data Layer)
  □ Create implementation_tasks_phase3.md (Presentation Layer)
  □ Create implementation_tasks_phase4.md (Integration & Testing)
  
  🚫 BLOCKING RULE:
  - DO NOT create a single monolithic implementation_tasks.md
  - MUST split into multiple phase files (minimum 3-4 phases)
  - Each phase must be independently completable

🎯 RESULT: [PASS/FAIL] - CANNOT proceed with FAIL
```

**IF ANY ITEM FAILS**:
- ❌ **STOP IMMEDIATELY**
- ❌ **DO NOT write any code**
- ❌ Report missing documentation
- ❌ Request Product Layer completion

### 2. **Platform Detection & Configuration**

- Read platformType from IMPLEMENTATION_STATUS.json
- **MANDATORY**: Set performance thresholds based on platform:
  - **Web**: <300ms interactive, <200ms API, <100ms DB
  - **Mobile**: <200ms interactive, <300ms API, <150ms DB  
  - **Desktop**: <100ms interactive, <100ms API, <50ms DB
  - **API**: <150ms interactive, <50ms API, <25ms DB
  - **CLI**: <500ms interactive, N/A API, N/A DB

---

## Implementation Process

### **Step 1: Create Phase-Based Implementation Tasks**

Before ANY coding, create separate implementation task files for each architectural phase:

```
REQUIRED PHASE FILES (minimum 4 phases):

1. implementation_tasks_phase1.md - Domain Layer
2. implementation_tasks_phase2.md - Data Layer  
3. implementation_tasks_phase3.md - Presentation Layer
4. implementation_tasks_phase4.md - Integration & Testing

EACH PHASE FILE MUST CONTAIN:
- Phase objectives and estimated duration
- Granular tasks (3-6 per phase)
- Specific files to create/modify
- Verification commands
- Completion criteria

🚫 BLOCKING RULES:
- DO NOT create monolithic implementation_tasks.md
- DO NOT combine phases
- DO NOT skip any phase
- DO NOT proceed to next phase until current is 100% complete
```

### **Step 2: Implementation Loop**

For each task:
1. **Analyze** - Read all Product Layer files
2. **Plan** - Map strategy to EVERY acceptance criterion
3. **Implement** - Make minimal, testable changes
4. **Validate** - Run automated checks
5. **Score** - Update confidence metrics
6. **Commit** - Only if confidence ≥75

---

## Quality Validation

### **Final Verification Before Marking Complete**

```
✅ COMPLETION CHECKLIST:

Product Spec Compliance:
□ ALL screens from spec.md implemented (100%)
□ ALL user flows working (100%)
□ ALL dependencies integrated (100%)

Acceptance Criteria Compliance:
□ ALL functional requirements implemented (100%)
□ ALL integration requirements working (100%)
□ ALL quality requirements met (100%)
□ ALL edge cases handled (100%)
□ ALL error scenarios implemented (100%)
□ ALL performance criteria validated (100%)
□ ALL security requirements satisfied (100%)

Code Quality:
□ Confidence score ≥ 75
□ ALL tests passing (0 failures)
□ Test coverage ≥ 80%
□ No lint errors

🚨 CRITICAL RULE:
ONLY mark feature as IMPLEMENTED if completion = 100%
ANY percentage < 100% = Feature is INCOMPLETE
```

---

## Success Criteria
- Confidence score maintained or improved
- All tests passing
- Product alignment verified
- Design contracts respected
- **100% acceptance criteria implemented**
```

### /confidence-guard.md
```markdown
---
description: Protect confidence score and prevent quality degradation
---

# Confidence Guard Workflow

## Purpose
Maintain and improve confidence score through continuous monitoring and proactive quality protection.

## Real-Time Monitoring
1. **Confidence Score Tracking**
   - Before/after comparison for each change
   - Trend analysis over sessions
   - Pillar-specific alerts
   - Global score protection

2. **Quality Gates**
   - Auto-block if any pillar <70
   - Warning zone at 70-75
   - Safe zone ≥75
   - Production ready ≥90

## Protective Actions
- **Score Recovery** - Automatic suggestions for score improvement
- **Trend Analysis** - Identify declining patterns early
- **Pillar Balancing** - Ensure no pillar is neglected
- **Release Protection** - Block releases below thresholds

## Enforcement Rules
- No release with global score <90
- No pillar may be <75 for release
- Immediate alert on score drops >15 points
- Trend analysis weekly

## Success Criteria
- Confidence score trending upward
- All pillars balanced above 75
- No quality gate violations
- Production readiness achieved
```

### /product-alignment.md
```markdown
---
description: Ensure every implementation aligns with product strategy
---

# Product Alignment Workflow

## Purpose
Guarantee all code serves product goals and user needs.

## Strategic Validation
1. **Product Layer Check**
   - roadmap.md alignment verification
   - personas.md user validation
   - decisions.md compliance check
   - FEATURE_STATUS.json state validation

2. **Feature Lifecycle Compliance**
   - Current state verification
   - Next state readiness assessment
   - Transition requirements check
   - Documentation completeness validation

3. **Business Value Verification**
   - User impact assessment
   - ROI calculation
   - Strategic priority validation
   - Success metric definition

## Alignment Scoring
- Product fit: 0-100
- User value: 0-100
- Strategic alignment: 0-100
- Overall alignment: Average of three scores

**Minimum alignment score: 80 for implementation**

## Success Criteria
- Alignment score ≥80
- Product Layer complete
- Feature lifecycle respected
- Business value clear
```

### /continue-implementation.md
```markdown
---
description: Safely resume development from exact stopping point, phase-based implementation
---

# Continue Implementation Workflow

## Purpose
Resume development without rework, drift, or loss of architectural context. **One Phase Per Run**: Complete one phase, update tracking, then stop.

---

## 🔰 STEP -1 — AI Constitution Bootstrap (MANDATORY FIRST STEP)

**Before ANY other action, execute this bootstrap sequence:**

### Required Reading:

```
📚 BOOTSTRAP CHECKLIST:

□ Read docs/AI_CONSTITUTION.md (MANDATORY)
□ Scan docs/ai-memory/resolved-issues.md (Check for previously solved problems)
□ Scan docs/ai-memory/command-playbook.md (Check for known working commands)
□ Scan docs/ai-memory/decisions.md (Load architectural decisions)
□ Scan docs/ai-memory/pitfalls.md (Load known mistakes to avoid)
□ Read AI_SESSION_MEMORY.md (Load session context)
□ Read IMPLEMENTATION_STATUS.json (Identify current work)
```

### Constitution Acknowledgment:

```
🔰 AI CONSTITUTION LOADED

✅ Execution autonomy: ENABLED
✅ Memory discipline: ACTIVE
✅ Cascading tasks: ENABLED
✅ Anti-simplification: ENFORCED
✅ ai-memory/ files found: [resolved-issues.md, command-playbook.md, decisions.md, pitfalls.md]
✅ Current work context: [Brief 1-line summary from IMPLEMENTATION_STATUS.json]

Proceeding with autonomous continuation...
```

**BLOCKING RULE**: Do not proceed to Step 0 until bootstrap is complete.

---

## STEP 0 — Phase Detection (MANDATORY)

### Phase Detection Algorithm

1. **Scan for phase files** in `product/features/<feature-name>/`:
   - Look for: `implementation_tasks_phase1.md`, `implementation_tasks_phase2.md`, etc.
   - If no phase files exist, look for: `implementation_tasks.md` (single-phase feature)

2. **Determine current phase**:
   - Read each phase file in order (phase1, phase2, phase3, etc.)
   - Check task completion status:
     - `[x]` = Done
     - `[~]` = In Progress
     - `[ ]` = Pending
   - Current phase = First phase with `[ ]` (pending) or `[~]` (in-progress) tasks

3. **Read IMPLEMENTATION_STATUS.json**:
   - Check: `currentWork.phaseCompleted` array
   - Verify consistency with phase file completion status

### Required Output (Step 0)

```text
📄 PHASE DETECTION

Feature: <feature-name>
Phase Files Found: [phase1.md, phase2.md, phase3.md, ...]

Phase 1: [COMPLETE | IN_PROGRESS | PENDING]
Phase 2: [COMPLETE | IN_PROGRESS | PENDING]
Phase 3: [COMPLETE | IN_PROGRESS | PENDING]

Current Phase to Implement: Phase X
Phase File: product/features/<feature-name>/implementation_tasks_phaseX.md
```

### Phase Decision Rules

* If **ALL phases complete** → Feature is DONE, update to IMPLEMENTED state
* If **current phase has in-progress tasks** → Resume that phase
* If **current phase has only pending tasks** → Start that phase
* If **previous phase incomplete** → ERROR: Cannot skip phases

---

## STEP 1 — Context Rehydration (MANDATORY)

### Required Inputs

1. **Check for VALIDATION_REPORT.md** (PRIORITY CHECK):
   - File: `product/features/<feature-name>/VALIDATION_REPORT.md`
   - If exists: This is a validation-driven continuation
   - Extract all gaps/missing/errors from the report

2. **Read current phase implementation tasks**:
   - File: `product/features/<feature-name>/implementation_tasks_phase<N>.md`
   - Identify which tasks are checked off ([x])
   - Identify current in-progress task ([~])
   - Identify next pending task ([ ])

3. **Read Product Layer files** for context:
   - `product/features/<feature-name>/spec.md`
   - `product/features/<feature-name>/acceptance-criteria.md`
   - `product/features/<feature-name>/test-scenarios.md`

### Required Output

```text
📌 CURRENT IMPLEMENTATION CONTEXT

Feature: [FEATURE_NAME]
Current Phase: Phase X - [Phase Name]
Phase Status: [IN_PROGRESS | PENDING]

📋 Task Progress:
- Completed Tasks: [COUNT] / [TOTAL] in this phase
- Next Task: [Task description]
- Tasks Remaining in Phase: [COUNT]

Mode: [VALIDATION-DRIVEN | STANDARD CONTINUATION]
```

---

## STEP 2 — Integrity Check

Verify:
1. Is current implementation **aligned with product specs**?
2. Are completed ACs **covered by tests**?
3. Does code violate **Clean Architecture rules**?
4. Has any shortcut been taken?
5. Is there **technical debt introduced**?

### Required Output

```text
✓ INTEGRITY ASSESSMENT

Architectural Integrity: PASS / FAIL
Test Integrity: PASS / FAIL
Spec Alignment: PASS / FAIL
Technical Debt: YES / NO (describe if YES)
```

⚠️ Any FAIL → must be resolved **before continuing**

---

## STEP 3 — Create Cascade TODOs (MANDATORY)

**Optimal Batch Size**: Create **5-8 TODOs** per run

### Mode A: Validation-Driven (If VALIDATION_REPORT.md exists)

```text
📝 CASCADE TODO CREATION (VALIDATION MODE)

Source: product/features/<feature-name>/VALIDATION_REPORT.md

TODO Batch:
1. ⚠️ [HIGH] Fix Gap 1: [Description]
2. ⚠️ [HIGH] Fix Gap 2: [Description]
3. ⚠️ [MEDIUM] Fix Gap 3: [Description]
... (5-8 total TODOs)
```

### Mode B: Standard Continuation

```text
📝 CASCADE TODO CREATION (STANDARD MODE)

Source: product/features/<feature-name>/implementation_tasks_phaseX.md

TODO Batch:
1. ✅ [TASK] Next pending task from phase file
2. ✅ [TASK] Following task
... (5-8 total TODOs)
```

**Agent MUST call `update_plan` tool to create these TODOs.**

---

## STEP 4 — Controlled Phase Resumption

### Phase Resumption Rules

* Resume **ONLY** on:
  * Tasks in Cascade TODO list (created in Step 3)
  * Tasks in the current phase file
  * The next uncompleted task (marked `[ ]` or `[~]`)
  * Gaps from VALIDATION_REPORT.md (if exists)

* Do **NOT**:
  * Refactor unrelated code
  * Work on tasks from other phases
  * Jump to future phases

---

## STEP 5 — Phase Completion Check

### Phase Completion Criteria

A phase is **COMPLETE** when:
1. **All tasks marked `[x]`** in the phase file
2. **All acceptance criteria** for the phase are met
3. **All tests** for the phase are passing
4. **No blocking issues** remain

### Required Output

```text
📘 PHASE COMPLETION STATUS

Phase: Phase X - [Phase Name]
Task Completion: [COUNT] / [TOTAL]
Phase Status: [COMPLETE | IN_PROGRESS | BLOCKED]

If COMPLETE:
- Ready to proceed to next phase
- All tasks verified
```

### Phase Completion Actions

If phase is **COMPLETE**, agent MUST:
1. Update phase file: Mark all tasks as `[x]`
2. Update IMPLEMENTATION_STATUS.json: Add phase to `phasesCompleted` array
3. Create phase completion summary
4. **STOP** - Do not proceed to next phase automatically

---

## STEP 6 — Update Tracking Files (MANDATORY)

### Update IMPLEMENTATION_STATUS.json

```json
{
  "currentWork": {
    "feature": "<feature-name>",
    "status": "IMPLEMENTING",
    "currentPhase": <next-phase-number>,
    "phasesCompleted": [1, 2, ...],
    "tasksCompleted": ["Phase X: Task description", ...]
  }
}
```

### Update FEATURE_STATUS.json

**If ALL Phases Complete:**
```json
{
  "name": "<feature-name>",
  "state": "IMPLEMENTED",
  "completionPercentage": 100
}
```

---

## STEP 7 — Phase Summary Report (MANDATORY)

```text
📊 PHASE IMPLEMENTATION SUMMARY

Feature: <feature-name>
Phase: Phase X - [Phase Name]
Phase Status: [COMPLETE | IN_PROGRESS]

Work Completed:
- Tasks Completed: [COUNT]
- Files Created: [COUNT]
- Tests Added: [COUNT]

Next Steps:
- If COMPLETE: Run `/continue-implementation` to start Phase X+1
- If IN_PROGRESS: Run `/continue-implementation` to continue Phase X

Tracking Files Updated:
✅ IMPLEMENTATION_STATUS.json
✅ FEATURE_STATUS.json
✅ implementation_tasks_phaseX.md
```

---

## 🚫 CRITICAL RULE: One Phase Per Run

**The agent MUST STOP after completing or making progress on ONE phase.**

* ✅ Complete Phase 1 → Update files → STOP
* ✅ Work on Phase 2 (if Phase 1 done) → Update files → STOP
* ❌ Complete Phase 1 → Automatically start Phase 2 (FORBIDDEN)

**Why:** Ensures clear phase boundaries, trackable progress, prevents scope creep
```

### /validate-implementation.md
```markdown
---
description: Audit implementation, detect gaps, and complete them correctly — not just report
---

# Validate Implementation Workflow

## Purpose
Audit implementation, detect **missing, partial, or incorrect elements**, and **complete them correctly** — not just report them.

**Usage:**
- `/validate-implementation` — Validates ALL features in product/features/
- `/validate-implementation [feature-name]` — Validates ONLY the specified feature

---

## 🔰 STEP -1 — AI Constitution Bootstrap (MANDATORY FIRST STEP)

**Before ANY validation action, execute this bootstrap sequence:**

### Required Reading:

```
📚 BOOTSTRAP CHECKLIST:

□ Read docs/AI_CONSTITUTION.md (MANDATORY)
□ Scan docs/ai-memory/resolved-issues.md (Check for known issues)
□ Scan docs/ai-memory/command-playbook.md (Load command knowledge)
□ Scan docs/ai-memory/decisions.md (Load architectural decisions)
□ Scan docs/ai-memory/pitfalls.md (Load known mistakes)
□ Read IMPLEMENTATION_STATUS.json (Current state)
```

### Constitution Acknowledgment:

```
🔰 AI CONSTITUTION LOADED

✅ Execution autonomy: ENABLED
✅ Memory discipline: ACTIVE
✅ Anti-simplification: ENFORCED
✅ Validation mode: CORRECTIVE ACTION (not passive review)

Proceeding with validation...
```

---

## STEP 0 — Scope Detection (MANDATORY)

**Determine validation scope based on user input:**

```
🎯 SCOPE DETECTION

User Input: [feature-name] provided? YES / NO

If YES:
  - Validation Mode: SINGLE FEATURE
  - Feature: [feature-name]
  - Path: product/features/[feature-name]/
  - Verify feature exists: YES / NO

If NO:
  - Validation Mode: ALL FEATURES
  - Scan: product/features/
  - Features Found: [list all feature directories]
  - Total Features: [COUNT]
```

### Feature Discovery

If validating ALL features:

```
📁 FEATURE DISCOVERY

Scanning: product/features/

Features Found:
1. authentication/
2. ai-tutor-integration/
3. study-session-framework/
...

Total: [COUNT] features

Validation Strategy:
- Process each feature sequentially
- Generate individual VALIDATION_REPORT.md per feature
- Create aggregate summary at end
```

---

## STEP 1 — Specification Lock & Phase Detection

Lock the authoritative sources for **each feature in scope**:

```
📜 VALIDATION REFERENCES

Feature: [FEATURE_NAME]
Product Spec: product/features/[feature-name]/spec.md
Acceptance Criteria: product/features/[feature-name]/acceptance-criteria.md
Test Scenarios: product/features/[feature-name]/test-scenarios.md
Implementation Tasks: product/features/[feature-name]/implementation_tasks*.md (SOURCE OF TRUTH)
Architecture Rules: Flutter Clean Architecture + BMAD
```

🚫 No validation allowed without this lock

### Phase Detection

Detect if feature uses phased implementation:

```
📋 PHASE DETECTION

Phase Files Found:
- implementation_tasks.md (single-phase) OR
- implementation_tasks_phase1.md, implementation_tasks_phase2.md, ... (multi-phase)

Validation Scope:
- Single-phase: Validate entire feature
- Multi-phase: Validate only completed phases
```

---

## STEP 2 — File-Level Task Verification (CRITICAL)

**SOURCE OF TRUTH**: `implementation_tasks*.md` files

The agent MUST verify EACH task from implementation_tasks files:

### File Verification Process

For EACH task marked `[x]` (completed):

```
📁 FILE VERIFICATION

Task: [Task description from implementation_tasks]
Expected Files: [List all files mentioned in the task]

Verification:
For each file:
  1. File Exists: YES / NO
  2. File Content: COMPLETE / PARTIAL / EMPTY / INCORRECT
  3. Key Elements Present:
     - Required imports: YES / NO
     - Required classes/functions: YES / NO
     - Required logic: YES / NO
     - Proper architecture layer: YES / NO
  4. Tests Exist: YES / NO / PARTIAL
  5. Verdict: PASS / FAIL
```

### Task-by-Task Audit

```
📋 TASK AUDIT REPORT

✅ Task 1: [Description]
   Files: [file1.dart, file2.dart]
   Status: COMPLETE
   Evidence: All files exist, logic correct, tests present

⚠️ Task 2: [Description]
   Files: [file3.dart]
   Status: PARTIAL
   Issues:
   - Missing error handling
   - No unit tests
   Action Required: Add error handling, create tests

❌ Task 3: [Description]
   Files: [file4.dart, file5.dart]
   Status: INCOMPLETE
   Issues:
   - file4.dart: Empty/stub implementation
   - file5.dart: File does not exist
   Action Required: Complete implementation, create missing file

📊 Summary:
- Total Tasks: [COUNT]
- Verified Complete: [COUNT]
- Partial/Issues: [COUNT]
- Missing/Failed: [COUNT]
```

---

## STEP 3 — Acceptance Criteria & Architecture Validation

### 1️⃣ Functional Coverage

For EACH Acceptance Criterion:

```
AC-1:
- Implemented: YES / PARTIAL / NO
- Evidence: file + function + test
- Related Tasks: [Task IDs from implementation_tasks]
```

### 2️⃣ Non-Functional Requirements

Check explicitly:
* Performance
* Security
* Accessibility
* Offline behavior
* Error handling
* Logging
* Maintainability

```
NF-Performance: PASS / FAIL
NF-Security: PASS / FAIL
NF-Offline: PASS / FAIL
NF-Error-Handling: PASS / FAIL
```

### 3️⃣ Architecture Compliance

* UI contains no business logic
* Domain has no Flutter imports
* Data layer isolated
* Dependency direction respected
* BMAD layer contracts enforced

```
Architecture Verdict: PASS / FAIL
Violations:
- file → rule broken → severity
```

---

## STEP 4 — Generate VALIDATION_REPORT.md (MANDATORY)

**CRITICAL**: Create validation report for `/continue-implementation` to use.

File: `product/features/[feature-name]/VALIDATION_REPORT.md`

```markdown
# Validation Report: [Feature Name]

**Generated**: [ISO-8601-timestamp]
**Feature**: [feature-name]
**Overall Status**: [PASS | PARTIAL | FAIL]

---

## Executive Summary

- Total Tasks Audited: [COUNT]
- Tasks Passing: [COUNT]
- Tasks with Issues: [COUNT]
- Tasks Failed: [COUNT]
- Completion Rate: [X]%
- Confidence Score: [X]/100

---

## Critical Gaps & Missing Elements

### 🚨 HIGH PRIORITY

#### Gap 1: [Description]
- **Task**: [Task ID from implementation_tasks]
- **Issue**: [What's missing/wrong]
- **Expected Files**: [file1.dart, file2.dart]
- **Actual Status**: [Missing | Partial | Incorrect]
- **Action Required**: [Specific fix needed]
- **Blocks**: [AC-X, AC-Y]

### ⚠️ MEDIUM PRIORITY

#### Gap N: [Description]
...

### 📝 LOW PRIORITY

#### Gap M: [Description]
...

---

## Task-Level Verification Results

### ✅ Verified Complete Tasks

- [x] Task 1: [Description]
  - Files: [file1.dart, file2.dart]
  - Status: COMPLETE
  - Tests: PRESENT

### ⚠️ Partial/Issues Tasks

- [~] Task 2: [Description]
  - Issues: Missing error handling, no tests
  - Action: Add error handling, create tests

### ❌ Failed/Missing Tasks

- [ ] Task 3: [Description]
  - Files: [file4.dart] (MISSING)
  - Action: Create file with full implementation

---

## Architecture Violations

### Critical Violations
- [file.dart]: [Violation description]
  - Rule Broken: [Architecture rule]
  - Fix Required: [Specific action]

---

## Acceptance Criteria Status

- AC-1: ✅ COMPLETE
- AC-2: ⚠️ PARTIAL (missing tests)
- AC-3: ❌ NOT IMPLEMENTED

---

## Next Steps for /continue-implementation

When running `/continue-implementation`, the workflow will:
1. Read this VALIDATION_REPORT.md
2. Extract all gaps and missing elements
3. Create Cascade TODOs for each gap (prioritized)
4. Execute fixes systematically
5. Re-run validation when complete
```

### Required Actions

1. **Create the file**: `product/features/[feature-name]/VALIDATION_REPORT.md`
2. **Populate all sections** with actual verification data
3. **Prioritize gaps**: HIGH > MEDIUM > LOW
4. **Be specific**: Include exact file names, line numbers, function names
5. **Link to tasks**: Reference implementation_tasks task numbers

---

## STEP 5 — Corrective Implementation (CRITICAL)

### Rules

* The agent MUST:
  * Implement missing elements
  * Fix partial implementations
  * Add or correct tests

* The agent MUST NOT:
  * Rewrite unrelated code
  * Change scope
  * Redesign UX unless required by ACs

### Required Output Before Coding

```
🧩 CORRECTION PLAN

Missing Elements:
- AC-3 → not implemented
- NF-Offline → partial

Planned Fixes:
- File X → add logic Y
- Test Z → add coverage
```

---

## Success Criteria

Validation is complete **ONLY IF**:

* **All tasks from implementation_tasks*.md verified file-by-file**
* **VALIDATION_REPORT.md created** with all gaps documented
* All ACs are implemented AND proven
* All NFs are explicitly checked
* Architecture violations are resolved
* Missing elements are implemented (not just reported)
* Confidence score ≥ **75**
* **Report structured for /continue-implementation consumption**
```

### /auto-healing.md
```markdown
---
description: Automatically detect and fix common issues
---

# Auto-Healing Workflow

## Purpose
Proactively identify and resolve issues before they impact confidence score.

## Continuous Health Checks
1. **Code Quality Scan**
   - Complexity analysis
   - Duplication detection
   - Security vulnerability scan
   - Performance regression check

2. **Test Health Monitoring**
   - Coverage tracking
   - Flaky test detection
   - Performance test validation
   - Integration test health

3. **Documentation Sync**
   - Code-doc alignment verification
   - README accuracy check
   - API documentation validation
   - Contract compliance verification

## Auto-Repair Actions
- **Simple Fixes** - Apply automatically
- **Complex Issues** - Create detailed remediation plans
- **Critical Problems** - Immediate notification and rollback
- **Trend Issues** - Systemic improvements

## Healing Rules
- Auto-fix issues with confidence impact <5 points
- Create tickets for issues impacting confidence 5-15 points
- Immediate rollback for issues impacting confidence >15 points
- Weekly systemic health reports

## Success Criteria
- Issues detected before impact
- Confidence score stable
- Documentation always in sync
- Test health maintained
```

### /code-fixing.md
```markdown
---
description: Fix actual code issues using verification-first approach
---

# Code Fixing Workflow

## Purpose
Fix actual code issues based on verification-first implementation workflow.

## Steps

1. **Read Status Files**
   - Read `IMPLEMENTATION_STATUS.json` to understand critical issues
   - Read `VERIFICATION_LOG.md` to confirm issues and their root causes

2. **Investigate Issues**
   - Run targeted tests to verify current failure behavior
   - Identify exact root causes in source code
   - Document findings with specific file locations

3. **Plan Fixes**
   - For complex implementations (>200 lines), create detailed plan
   - Identify all dependencies and potential conflicts
   - Plan incremental changes with verification points

4. **Implement Fixes**
   - Make minimal, targeted changes
   - Follow BMAD architecture principles
   - Add comprehensive error handling

5. **Verify Fixes**
   - Run targeted tests to confirm fixes work
   - Run full test suite to ensure no regressions
   - Update documentation with verification evidence

6. **Update Status**
   - Move completed items from `criticalIssues` to `completedIssues`
   - Update `VERIFICATION_LOG.md` with accurate results
   - Clean up `nextActions` array

## Quality Gates
- Test pass rate must be 95%+
- All critical issues must be resolved
- Documentation must be updated
```

### /continue-code-session.md
```markdown
---
description: Continue code development session by checking IMPLEMENTATION_STATUS.json and AI_SESSION_MEMORY for verification-first approach
---

# Continue Code Session Workflow

## Purpose
Verification-first continuation of code development using IMPLEMENTATION_STATUS.json as single source of truth, with universal agent safeguards enforced.

## MANDATORY PRE-REQUIREMENTS - VERIFICATION-FIRST APPROACH

### Step 1: Read Implementation Status Files (MANDATORY)
**BEFORE ANY CONTINUATION - MUST READ THESE FILES:**

#### Primary Authority Files:
1. **IMPLEMENTATION_STATUS.json** - Single source of truth for implementation status
2. **AI_SESSION_MEMORY.md** - Historical context with universal safeguards  
3. **VERIFICATION_LOG.md** - Detailed verification history and trends

#### Verification Requirements:
- **NEVER trust documentation claims** - Always verify against actual source code
- **Check verification accuracy** - Current accuracy is 0% (0/5 claims actually implemented)
- **Review test results** - Current pass rate is 81% (target: 95%+)
- **Identify undocumented issues** - 3 critical issues not previously documented

### Step 2: Follow Universal Agent Safeguards (MANDATORY)
**ALL WORKFLOWS MUST FOLLOW THESE RULES - NO EXCEPTIONS:**

#### From .windsurfrules Section 5:
- **Production System Enforcement** - This is a PRODUCTION system
- **Missing Package Handling** - Auto-install, ask user if fails
- **Complex Implementation Planning** - User approval required for >200 lines
- **Unknown Situation Resolution** - Ask user BEFORE coding alternatives
- **Universal Agent Behavior Rules** - Apply to ALL workflows

#### Forbidden Behaviors:
- Create "good enough" solutions for critical issues
- Use test project shortcuts in production code
- Proceed without user approval when uncertain
- Ignore security or performance requirements

### Step 3: Continue Implementation Process (VERIFICATION-FIRST)

#### Required Analysis:
1. **Read IMPLEMENTATION_STATUS.json** - Get current verified state
2. **Check AI_SESSION_MEMORY.md** - Understand historical context and safeguards
3. **Read product/roadmap.md** - Understand product vision and current phase
4. **Read product/personas.md** - Validate user context for issues
5. **Verify claimed fixes** - Check if documented fixes are actually in source code
6. **Identify real issues** - Focus on actual code, not documentation
7. **Check test failures** - Analyze failed tests for root causes
8. **Security assessment** - Verify encryption, data integrity, vulnerabilities
9. **Performance evaluation** - Check for timeouts violating <300ms requirement

#### Required Implementation Process:
1. **Select highest priority issue** - From IMPLEMENTATION_STATUS.json criticalIssues
2. **Validate Product Layer compliance** - Check issue has proper product documentation
3. **Read relevant feature specs** - Review product/features/*/spec.md for context
4. **Review acceptance criteria** - Check product/features/*/acceptance-criteria.md
5. **Handle missing dependencies** - Auto-install, ask user if fails
6. **Create implementation plan** - If complex (>200 lines or >3 files)
7. **Get user approval** - For complex implementations
8. **Edit actual source files** - Not just documentation
9. **Test implementation** - Verify fix works correctly against acceptance criteria
10. **Update IMPLEMENTATION_STATUS.json** - Mark as VERIFIED IMPLEMENTED
11. **Update VERIFICATION_LOG.md** - Record verification results

---

## Expected Outcomes

### Single Session Goal:
- Implement at least 1-2 critical issues in actual source code
- Update IMPLEMENTATION_STATUS.json with VERIFIED status
- Improve verification accuracy from 0% to 40%+
- Increase test pass rate from 81% to 85%+

### Multiple Sessions Goal:
- Eventually implement all 5+ critical issues
- Achieve 100% verification accuracy
- Reach 95%+ test pass rate
- Eliminate documentation vs implementation gap

---

## Success Criteria
- **Implementation Status**: Issues marked as VERIFIED IMPLEMENTED
- **Verification Accuracy**: 100% of claims verified in source code
- **Test Results**: 95%+ pass rate maintained
- **Security**: All critical vulnerabilities resolved
- **Performance**: All operations <300ms Interactive Pulse
```

### /implementation-first.md
```markdown
---
description: Implementation-first workflow with verification
---

# Implementation-First Workflow

## Purpose
Execute implementation tasks using verification-first approach.

## Steps

1. **Check Implementation Status**
   - Read `IMPLEMENTATION_STATUS.json` for current state
   - Review `AI_SESSION_MEMORY.md` for context
   - Identify next priority tasks

2. **Verify Current State**
   - Run tests to establish baseline
   - Verify claimed issues actually exist
   - Document current behavior

3. **Plan Implementation**
   - Break down complex tasks into small steps
   - Identify verification points for each step
   - Plan testing strategy

4. **Implement Incrementally**
   - Make small, testable changes
   - Verify each change before proceeding
   - Update documentation as you go

5. **Quality Assurance**
   - Run full test suite
   - Check performance metrics
   - Verify security requirements

6. **Update Documentation**
   - Update `IMPLEMENTATION_STATUS.json`
   - Update `VERIFICATION_LOG.md`
   - Update `AI_SESSION_MEMORY.md`

## Success Criteria
- All tests passing (95%+ pass rate)
- Performance requirements met
- Documentation accurate and up-to-date
```

### /code-review.md
```markdown
---
description: Comprehensive code review with BMAD compliance
---

# Code Review Workflow

## Purpose
Perform comprehensive code review ensuring BMAD compliance and quality standards.

## Review Checklist

### Architecture Compliance
- [ ] Follows BMAD structure (Backend, Model, API, Database)
- [ ] Clear separation of concerns
- [ ] Proper dependency injection
- [ ] Single responsibility principle followed

### Code Quality
- [ ] Meaningful variable and function names
- [ ] No code duplication
- [ ] Proper error handling
- [ ] Adequate comments explaining "why"
- [ ] Function complexity under 10

### Testing
- [ ] Unit tests for business logic
- [ ] Integration tests for APIs
- [ ] Test coverage >80%
- [ ] Tests are deterministic
- [ ] External dependencies mocked

### Performance
- [ ] Database queries optimized
- [ ] Caching implemented where appropriate
- [ ] No N+1 query problems
- [ ] Pagination for list endpoints

### Security
- [ ] Input validation at API boundaries
- [ ] No hardcoded secrets
- [ ] Proper authentication/authorization
- [ ] SQL injection prevention
- [ ] XSS prevention

### Documentation
- [ ] Code is self-documenting
- [ ] Complex algorithms explained
- [ ] API endpoints documented
- [ ] Database schema documented

## Review Process

1. **Automated Checks**
   - Run linting and formatting
   - Run test suite
   - Check code coverage
   - Run security scans

2. **Manual Review**
   - Architecture compliance
   - Code quality assessment
   - Performance review
   - Security assessment

3. **Feedback Integration**
   - Document all findings
   - Prioritize issues by severity
   - Create action items
   - Follow up on fixes

## Output
- Detailed review report
- Action items for fixes
- Updated implementation status
```

### /quick-flow-solo-dev.md
```markdown
---
description: Rapid solo development workflow
---

# Quick Flow Solo Development

## Purpose
Rapid development workflow for solo developers with BMAD compliance.

## Workflow Steps

### 1. Quick Setup (5 min)
```bash
# Check current status
npm run status-check

# Run baseline tests
npm test -- --watchAll=false --passWithNoTests
```

### 2. Feature Development
```bash
# Create feature branch
git checkout -b feature/feature-name

# Implement with TDD
npm run dev:test -- --testPathPattern=feature-name

# Make incremental changes
# Verify each step
```

### 3. Quick Verification
```bash
# Run targeted tests
npm test -- --testPathPattern="feature-name"

# Check performance
npm run test:performance

# Full test suite
npm test -- --watchAll=false
```

### 4. Quick Documentation
```bash
# Update status
npm run status:update "Feature completed"

# Commit with verification
git add .
git commit -m "feat: feature-name [verified]"
```

## Speed Tips
- Use hot reload for rapid testing
- Pre-commit hooks for quality gates
- Automated status updates
- Template-based documentation

## Quality Gates
- All tests must pass
- Performance benchmarks met
- Documentation updated
```

---

## 🧠 Unified AI Agent Behavior Guide

### **READ ONCE - ENFORCE ALWAYS**

This section contains all behaviors, rules, and workflows that AI agents must follow. **Read this once, then enforce consistently without re-reading.**

---

## 🎯 CORE PRINCIPLES

### 1. Verification-First Approach (MANDATORY)
- **NEVER trust documentation** - Always verify against actual source code
- **IMPLEMENTATION_STATUS.json is single source of truth** - All status comes from here
- **Code before documentation** - Source code is authority, not claims
- **Test everything** - Verify fixes work before claiming completion

### 2. Production System Standards (MANDATORY)
- **This is a PRODUCTION system** - No test project shortcuts
- **Quality gates are strict** - 95% test pass rate, <300ms performance
- **Security is critical** - No workarounds for security issues
- **Performance matters** - Interactive Pulse <300ms is required

### 3. BMAD Architecture Enforcement (MANDATORY)
- **Backend, Model, API, Database structure** - Never deviate
- **Clear separation of concerns** - No mixing layers
- **Single responsibility principle** - Each component has one job
- **Dependency injection patterns** - Always use proper DI

---

## 🔧 UNIVERSAL WORKFLOWS

### For ANY Task - Follow This Sequence:

#### Step 1: Status Check (ALWAYS)
1. Read `IMPLEMENTATION_STATUS.json` - Get current state
2. Read `AI_SESSION_MEMORY.md` - Understand context
3. Read `VERIFICATION_LOG.md` - Check verification history
4. Identify highest priority issues from `criticalIssues`

#### Step 2: Verification (ALWAYS)
1. Run tests to establish baseline
2. Verify claimed issues actually exist in source code
3. Check if documented fixes are actually implemented
4. Document current behavior vs expected behavior

#### Step 3: Planning (FOR COMPLEX TASKS)
1. If implementation >200 lines or spans >3 files, create plan
2. Identify all dependencies and potential conflicts
3. Plan incremental changes with verification points
4. Get user approval before proceeding

#### Step 4: Implementation (ALWAYS)
1. Make minimal, targeted changes to actual source files
2. Follow BMAD architecture principles
3. Add comprehensive error handling
4. Test each change before proceeding

#### Step 5: Verification (ALWAYS)
1. Run targeted tests to confirm fixes work
2. Run full test suite to ensure no regressions
3. Check performance metrics
4. Verify security requirements

#### Step 6: Documentation Update (ALWAYS)
1. Update `IMPLEMENTATION_STATUS.json` - Move issues to completed
2. Update `VERIFICATION_LOG.md` - Record verification results
3. Update `AI_SESSION_MEMORY.md` - Document lessons learned
4. Clean up `nextActions` array

---

## 🚨 UNIVERSAL SAFEGUARDS

### These Rules Apply to ALL Workflows - NO EXCEPTIONS:

#### Missing Dependencies:
1. **Auto-install first** - Try `npm install package-name`
2. **Ask user if fails** - Don't create alternatives without permission
3. **Prefer real implementations** - Use actual packages over mocks
4. **Document attempts** - Log all installation attempts

#### Complex Implementations:
1. **>200 lines = Complex** - Must create detailed plan
2. **>3 files = Complex** - Must get user approval
3. **High-risk changes = Complex** - Must get user approval
4. **Architectural changes = Complex** - Must get user approval

#### Unknown Situations:
1. **STOP when uncertain** - Don't guess or make assumptions
2. **Ask user for direction** - Always clarify before proceeding
3. **Document uncertainty** - Explain what you don't understand
4. **Wait for user response** - Don't proceed without approval

#### Forbidden Behaviors:
1. **NO "good enough" solutions** - Critical issues need proper fixes
2. **NO test project shortcuts** - This is production code
3. **NO security workarounds** - Security issues must be properly fixed
4. **NO performance shortcuts** - <300ms requirement is mandatory
5. **NO documentation without implementation** - Code changes, not just docs

---

## 📋 QUALITY GATES (MANDATORY)

### Must Pass Before Any Task Completion:
- **Test Pass Rate**: ≥95%
- **Code Coverage**: ≥80%
- **Performance**: <300ms Interactive Pulse
- **Security**: No critical vulnerabilities
- **Documentation**: Accurate and up-to-date

### Must Check Before Any Commit:
- All tests passing
- Performance benchmarks met
- Security scans passed
- Documentation updated

---

## 🎯 SUCCESS CRITERIA

### Task Completion Requirements:
- **Source code actually changed** - Not just documentation
- **Tests verify the fix** - Real evidence of working solution
- **Performance improved** - Measurable improvement in metrics
- **Status updated** - IMPLEMENTATION_STATUS.json reflects completion

### Project Success Requirements:
- **100% verification accuracy** - All claims verified in source code
- **95%+ test pass rate** - Consistently maintained
- **<300ms performance** - All operations meet requirement
- **Zero critical issues** - All documented issues resolved

---

## 🔄 CONTINUOUS IMPROVEMENT

### After Each Task:
1. **Update AI_SESSION_MEMORY.md** - Document what worked and what didn't
2. **Refine workflows** - Improve processes based on experience
3. **Share learnings** - Update this guide with new insights
4. **Maintain standards** - Keep quality gates strict

### Weekly Review:
1. **Check verification accuracy** - Ensure 100% accuracy
2. **Review test trends** - Maintain 95%+ pass rate
3. **Update safeguards** - Add new rules as needed
4. **Optimize workflows** - Make them more efficient

---

**REMEMBER: This guide contains ALL behaviors needed. Read it once, then enforce consistently. The goal is to bridge the gap between documentation and actual implementation through verification-first approach.**

---

## 📝 IMPLEMENTATION_STATUS.json Template

```json
{
  "projectInfo": {
    "name": "Your Project Name",
    "version": "1.0.0",
    "bmadVersion": "1.1",
    "platformType": "web", // web | mobile | desktop | api | cli
    "performanceProfile": "standard", // standard | high-performance | real-time
    "created": "YYYY-MM-DD",
    "lastUpdated": "YYYY-MM-DD",
    "team": ["Team Member Names"],
    "testPassRateTarget": 95,
    "currentTestPassRate": 0,
    "performanceTargets": {
      "interactivePulse": "<300ms",
      "apiResponseTime": "<200ms",
      "databaseQueryTime": "<100ms"
    },
    "qualityGates": {
      "codeCoverage": ">=80%",
      "maxFileSize": "<300 lines",
      "maxFunctionComplexity": "<10",
      "securityScan": "Pass"
    }
  },
  "implementationStatus": {
    "criticalIssues": [],
    "completedIssues": [],
    "inProgressIssues": []
  },
  "confidenceScore": {
    "architecture": 0,
    "testing": 0,
    "performance": 0,
    "security": 0,
    "documentation": 0,
    "global": 0
  },
  "verificationHistory": [],
  "nextActions": [
    "🎯 Set up BMAD project structure",
    "🔧 Configure test infrastructure",
    "📊 Establish baseline metrics",
    "📝 Set up documentation templates",
    "🚀 Configure development workflows"
  ]
}
```

---

## 📊 VERIFICATION_LOG.md Template

```markdown
# 🔍 Implementation Verification Log

**Last Updated:** YYYY-MM-DD  
**Purpose:** Track verification of claimed fixes vs actual code reality  
**Strategy:** Code-first verification - source code is authority

---

## 🚨 VERIFICATION RESULTS SUMMARY

### Overall Verification Accuracy: 100%
- **Total Claims Verified:** 0
- **Actually Implemented:** 0  
- **False Claims:** 0
- **In Progress:** 0
- **Undocumented Critical Issues:** 0

---

## 📋 DETAILED VERIFICATION RESULTS

### ✅ VERIFIED IMPLEMENTED (0/0 Claims Accurate)

### 🔧 IN PROGRESS (0 Claims)

### 🚨 NEWLY DISCOVERED CRITICAL ISSUES

---

## 🎯 CURRENT PRIORITIES

### Priority 1 (Infrastructure Blockers):
1. Set up test environment
2. Configure CI/CD pipeline
3. Establish performance baseline

### Priority 2 (Quality Gates):
1. Implement comprehensive testing
2. Set up security scanning
3. Configure performance monitoring

---

## 📈 PROGRESS TRACKING

| Date | Test Pass Rate | Critical Issues | Performance达标 | BMAD Compliance |
|------|----------------|----------------|-----------------|-----------------|
|      | 0%             | 0              | N/A             | N/A             |

---

## 🔍 VERIFICATION METHODOLOGY

### Code-First Verification Process:
1. **Read Source Code** - Examine actual implementation
2. **Run Tests** - Verify claimed behavior matches reality
3. **Check Dependencies** - Ensure all required packages installed
4. **Validate Configuration** - Confirm setup is correct
5. **Document Evidence** - Record findings with file locations

### Quality Standards:
- **100% Verification Accuracy** - No false claims
- **Evidence-Based Tracking** - Every claim has proof
- **Real-Time Updates** - Documentation matches code
- **Continuous Improvement** - Learn from each verification
```

---

## 🧠 AI_SESSION_MEMORY.md Template

```markdown
# AI Session Memory

**Purpose:** Persistent context for AI agents across sessions  
**Last Updated:** YYYY-MM-DD  
**Project:** [Project Name]

---

## 🎯 Project Context

### Project Overview
- **Name:** [Project Name]
- **Type:** [Web App/Mobile/API/etc]
- **Tech Stack:** [List main technologies]
- **Architecture:** BMAD (Backend, Model, API, Database)
- **Team Size:** [Number of developers]

### Current Status
- **Development Phase:** [Planning/Development/Testing/Deployment]
- **Test Pass Rate:** [Current percentage]%
- **Critical Issues:** [Number] remaining
- **Performance:** [Current metrics]

---

## 🏗️ Architecture Decisions

### BMAD Structure
- **Backend:** [Responsibilities and key components]
- **Model:** [Data models and validation approach]
- **API:** [API design patterns and frameworks]
- **Database:** [Database choice and ORM]

### Key Patterns
- **Dependency Injection:** [Approach and framework]
- **Error Handling:** [Strategy and implementation]
- **Testing:** [Testing framework and approach]
- **Security:** [Security measures implemented]

---

## 📋 Development Guidelines

### Code Standards
- **Language:** [Primary language(s)]
- **Style Guide:** [Linting and formatting rules]
- **File Organization:** [Folder structure rules]
- **Naming Conventions:** [Patterns for names]

### Quality Gates
- **Test Coverage:** >=80%
- **Test Pass Rate:** >=95%
- **Performance:** <300ms Interactive Pulse
- **Security:** Automated scans required

---

## 🔧 Technical Details

### Dependencies
- **Core:** [List core dependencies]
- **Development:** [List dev dependencies]
- **Testing:** [List testing dependencies]
- **CI/CD:** [List deployment dependencies]

### Configuration
- **Environment Variables:** [Key variables and purposes]
- **Database:** [Connection and configuration]
- **API:** [Endpoints and authentication]
- **Testing:** [Test environment setup]

---

## 🚨 Known Issues & Solutions

### Current Issues
1. **[Issue Title]**
   - **Description:** [Detailed description]
   - **Impact:** [What it affects]
   - **Solution:** [Planned or implemented fix]

### Resolved Issues
1. **[Issue Title]**
   - **Description:** [What was fixed]
   - **Solution:** [How it was resolved]
   - **Lessons Learned:** [Key takeaways]

---

## 📊 Performance Metrics

### Benchmarks
- **API Response Time:** [Current]ms (Target: <200ms)
- **Database Query Time:** [Current]ms (Target: <100ms)
- **Interactive Pulse:** [Current]ms (Target: <300ms)
- **Memory Usage:** [Current]MB (Target: <500MB)

### Optimization History
- **[Date]:** [Optimization made] - [Result]
- **[Date]:** [Optimization made] - [Result]

---

## 🎯 Next Session Priorities

### Immediate (Next Session)
1. [Priority task 1]
2. [Priority task 2]
3. [Priority task 3]

### Short Term (This Week)
1. [Task 1]
2. [Task 2]
3. [Task 3]

### Long Term (This Month)
1. [Goal 1]
2. [Goal 2]
3. [Goal 3]

---

## 💡 Lessons Learned

### What Works Well
- [Pattern/Approach that works]
- [Tool/Technology that's effective]
- [Process that's efficient]

### What to Avoid
- [Pitfall to avoid]
- [Approach that doesn't work]
- [Common mistakes]

### Best Practices
- [Best practice 1]
- [Best practice 2]
- [Best practice 3]
```

---

## 🧪 Essential jest.setup.js Template

```javascript
/**
 * BMAD Test Environment Setup
 * Comprehensive mocks for browser APIs and testing infrastructure
 */

import '@testing-library/jest-dom'

// Web Crypto API Mock
const crypto = {
  getRandomValues: jest.fn(() => new Uint32Array(1)),
  subtle: {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    generateKey: jest.fn(),
    importKey: jest.fn(),
    exportKey: jest.fn()
  }
}
Object.defineProperty(global, 'crypto', { value: crypto, writable: true })

// Canvas API Mock
class MockCanvasRenderingContext2D {
  constructor() {
    this.fillStyle = '#000000'
    this.strokeStyle = '#000000'
    this.lineWidth = 1
    this.globalAlpha = 1
    this.globalCompositeOperation = 'source-over'
    this.shadowBlur = 0
    this.shadowColor = 'rgba(0, 0, 0, 0)'
    this.shadowOffsetX = 0
    this.shadowOffsetY = 0
    this.lineCap = 'butt'
    this.lineJoin = 'miter'
    this.miterLimit = 10
  }

  fillRect() {}
  clearRect() {}
  strokeRect() {}
  fillText() {}
  strokeText() {}
  measureText() { return { width: 100 } }
  beginPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  arc() {}
  quadraticCurveTo() {}
  bezierCurveTo() {}
  rect() {}
  clip() {}
  save() {}
  restore() {}
  scale() {}
  rotate() {}
  translate() {}
  transform() {}
  setTransform() {}
  resetTransform() {}
  drawImage() {}
  createLinearGradient() {
    return { addColorStop: () => {} }
  }
  createRadialGradient() {
    return { addColorStop: () => {} }
  }
  createPattern() { return {} }
  getImageData(x, y, width, height) {
    return new ImageData(new Uint8ClampedArray(width * height * 4), width, height)
  }
  putImageData() {}
  createImageData(width, height) {
    return new ImageData(new Uint8ClampedArray(width * height * 4), width, height)
  }
  setLineDash() {}
  getLineDash() { return [] }
}

class MockCanvas {
  constructor() {
    this.width = 0
    this.height = 0
    this.style = {}
  }

  getContext(contextType) {
    if (contextType === '2d') {
      return new MockCanvasRenderingContext2D()
    }
    return null
  }

  toDataURL() { return 'data:image/png;base64,mock' }
  toBlob(callback) {
    callback && callback(new Blob(['mock'], { type: 'image/png' }))
  }
}

global.HTMLCanvasElement = MockCanvas
global.CanvasRenderingContext2D = MockCanvasRenderingContext2D

// Override document.createElement for canvas
const originalCreateElement = global.document.createElement
global.document.createElement = function(tagName) {
  if (tagName.toLowerCase() === 'canvas') {
    return new MockCanvas()
  }
  return originalCreateElement.call(this, tagName)
}

// Performance API Mock
const mockPerformance = {
  marks: new Map(),
  measures: new Map(),
  _startTime: Date.now(),
  
  mark: jest.fn((name) => {
    const timestamp = Date.now() - mockPerformance._startTime
    mockPerformance.marks.set(name, timestamp)
    return name
  }),
  
  measure: jest.fn((name, startMark, endMark) => {
    const startTime = mockPerformance.marks.get(startMark) || 0
    const endTime = mockPerformance.marks.get(endMark) || Date.now() - mockPerformance._startTime
    const duration = endTime - startTime
    mockPerformance.measures.set(name, { startTime, endTime, duration })
    return { name, startTime, endTime, duration }
  }),
  
  now: jest.fn(() => Date.now() - mockPerformance._startTime),
  getEntriesByName: jest.fn((name, type) => {
    const measure = mockPerformance.measures.get(name)
    return measure ? [measure] : []
  }),
  getEntriesByType: jest.fn(() => [])
}

Object.defineProperty(global, 'performance', { value: mockPerformance, writable: true })

// TensorFlow.js Mock
jest.mock('@tensorflow/tfjs', () => ({
  tensor: jest.fn(),
  image: jest.fn(),
  sequential: jest.fn(),
  layers: {
    dense: jest.fn(() => ({ getWeights: jest.fn(() => []) })),
    conv2d: jest.fn(() => ({ getWeights: jest.fn(() => []) })),
    maxPooling2d: jest.fn(() => ({ getWeights: jest.fn(() => []) })),
    flatten: jest.fn(() => ({ getWeights: jest.fn(() => []) })),
    dropout: jest.fn(() => ({ getWeights: jest.fn(() => []) }))
  },
  dispose: jest.fn(),
  memory: jest.fn(() => ({ numBytes: 0, numTensors: 0 })),
  tidy: jest.fn((fn) => fn()),
  browser: {
    fromPixels: jest.fn(() => ({ 
      reshape: jest.fn(),
     toFloat: jest.fn(),
      dispose: jest.fn()
    }))
  }
}))

// Face Detection Mock
jest.mock('@tensorflow-models/face-detection', () => ({
  createDetector: jest.fn(() => ({
    estimateFaces: jest.fn(() => [])
  })),
  SupportedModels: {
    MediaPipeFaceDetector: 'MediaPipeFaceDetector'
  }
}))

// Next.js Router Mock
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    back: jest.fn(),
    reload: jest.fn()
  }))
}))

// Supabase Mock
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis()
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: { path: 'mock-path' }, error: null }),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'mock-url' } }))
      }))
    },
    auth: {
      signIn: jest.fn().mockResolvedValue({ data: { user: { id: 'mock-user' } }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: { id: 'mock-user' } }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } }))
    }
  }))
}))

// Environment Variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key'
process.env.NODE_ENV = 'test'

// Global test cleanup
afterEach(() => {
  jest.clearAllMocks()
  // Reset performance marks and measures
  mockPerformance.marks.clear()
  mockPerformance.measures.clear()
})
```

---

## 📦 Essential Dependencies

### package.json Template
```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "description": "BMAD Method Project",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:performance": "jest --testPathPattern=performance",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "status-check": "node scripts/check-status.js",
    "status:update": "node scripts/update-status.js"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@tensorflow/tfjs": "^4.0.0",
    "@tensorflow-models/face-detection": "^1.0.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/jest": "^29.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.0.0",
    "@peculiar/webcrypto": "^1.5.0",
    "husky": "^8.0.0",
    "lint-staged": "^14.0.0"
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test -- --watchAll=false"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

---

## 🎯 BMAD Development Workflow

### 1. Project Initialization
```bash
# Create new project
mkdir your-project
cd your-project

# Copy starter kit files
cp -r /path/to/BMAD_COMPLETE_STARTER_KIT/* .

# Install dependencies
npm install

# Initialize git
git init
git add .
git commit -m "Initial commit: BMAD project setup"
```

### 2. Daily Development Routine
```bash
# Check current status
npm run status-check

# Start development
npm run dev

# Run tests in parallel
npm run test:watch

# Make changes following BMAD structure
# backend/ - Business logic
# model/ - Data models
# api/ - API endpoints
# database/ - Database operations
```

### 3. Verification-First Approach
```bash
# Before making changes
npm test -- --testPathPattern="affected-area"

# Make targeted changes
# Verify each step

# After changes
npm test -- --testPathPattern="affected-area"
npm test -- --watchAll=false

# Update documentation
npm run status:update "Feature completed"
```

### 4. Quality Gates
```bash
# Full test suite
npm test -- --watchAll=false

# Coverage report
npm run test:coverage

# Performance tests
npm run test:performance

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 🚨 Common Pitfalls & Solutions

### Issue: Test Environment Conflicts
**Problem:** Global mocks conflicting with individual test mocks  
**Solution:** Use test-specific mocks for complex APIs like IndexedDB  
**Prevention:** Document mock responsibilities in jest.setup.js

### Issue: Performance Tests Return NaN
**Problem:** Performance API mock returning Date.now() instead of elapsed time  
**Solution:** Use proper performance mock with _startTime tracking  
**Prevention:** Include performance tests in CI/CD pipeline

### Issue: Canvas API Missing
**Problem:** document.createElement('canvas') returns undefined  
**Solution:** Comprehensive Canvas mock with full 2D context implementation  
**Prevention:** Test Canvas-dependent code early

### Issue: Memory Leaks in Tests
**Problem:** Tests not cleaning up resources properly  
**Solution:** Use afterEach cleanup and proper dispose patterns  
**Prevention:** Include memory cleanup in test templates

### Issue: Documentation Drift
**Problem:** Documentation doesn't match actual code  
**Solution:** Update documentation with every code change  
**Prevention:** Use verification-first approach

---

## 📊 Success Metrics & Monitoring

### Quality Dashboard
```javascript
// scripts/quality-dashboard.js
const qualityMetrics = {
  testPassRate: '>=95%',
  codeCoverage: '>=80%',
  performance: '<300ms',
  securityScan: 'Pass',
  documentationAccuracy: '100%'
}

// Automated quality checks
const qualityChecks = {
  runTestSuite: () => /* ... */,
  checkCoverage: () => /* ... */,
  measurePerformance: () => /* ... */,
  scanSecurity: () => /* ... */,
  verifyDocumentation: () => /* ... */
}
```

### Continuous Monitoring
```bash
# Set up quality monitoring
npm install --save-dev @codecov/codecov-node

# Add to CI/CD pipeline
- name: Quality Checks
  run: |
    npm run test:coverage
    npm run test:performance
    npm run lint
    npm run type-check
```

---

## 🎉 BMAD Success Criteria

✅ **Infrastructure:** Test environment stable and comprehensive  
✅ **Quality:** 95%+ test pass rate maintained  
✅ **Performance:** <300ms Interactive Pulse achieved  
✅ **Documentation:** Real-time tracking of all changes  
✅ **Workflow:** Verification-first approach consistently applied  
✅ **Architecture:** BMAD structure properly implemented  
✅ **Security:** Automated security scanning in place  
✅ **Monitoring:** Continuous quality monitoring active  

---

## 🔄 Continuous Improvement

### Weekly Review Checklist
- [ ] Check test pass rate trends
- [ ] Review performance metrics
- [ ] Update documentation accuracy
- [ ] Identify recurring issues
- [ ] Update BMAD rules if needed

### Monthly Optimization
- [ ] Refactor test infrastructure
- [ ] Update dependencies
- [ ] Improve mock implementations
- [ ] Enhance CI/CD pipeline
- [ ] Review and update workflows

### Quarterly Assessment
- [ ] Evaluate BMAD methodology effectiveness
- [ ] Update starter kit with new learnings
- [ ] Share improvements with team
- [ ] Plan next quarter's improvements

---

**Remember:** The BMAD Method is about building confidence through verification. Every change should be traceable, testable, and documented. This starter kit provides everything you need to succeed with BMAD from day one! 🚀

---

## 🧠 AI Constitution & Memory System Templates

### docs/AI_CONSTITUTION.md Template

**Purpose:** Supreme behavioral contract for all AI agents. Ensures consistent behavior across models and sessions.

**Key Sections:**
1. **Authority** - This document overrides all other rules
2. **Execution Autonomy** - Run safe commands automatically, no permission loops
3. **Memory Discipline** - Check ai-memory/ before investigating any problem
4. **Cascading Tasks** - Continue work without asking when tasks are clear
5. **Anti-Simplification** - Implement 100% of requirements, no shortcuts
6. **Command Patterns** - Which commands to run automatically vs ask
7. **Model Consistency** - Same behavior across GPT-4, Claude, etc.

**File Location:** `docs/AI_CONSTITUTION.md`  
**Reference:** Copy from this project's constitution or create from ChatGPT recommendation

---

### docs/ai-memory/ System

**Purpose:** Persistent institutional knowledge that prevents re-solving problems.

#### 1. resolved-issues.md
```markdown
# Resolved Issues

## Issue: [Problem Title]
**Date Resolved:** YYYY-MM-DD  
**Status:** RESOLVED

### Problem
[Detailed description of the issue]

### Solution
[Exact solution that worked]

### Commands Used
```bash
[Exact commands that fixed it]
```

### Files Modified
- `path/to/file.ext` - [What changed]

### Prevention
[How to avoid this issue in future]

---
```

#### 2. command-playbook.md
```markdown
# Command Playbook

## [Technology] Commands

### [Use Case]
```bash
# Command that works
command --flags arguments
```
**When:** [When to use this]  
**Why:** [Why this pattern works]  
**Notes:** [Important warnings or context]

---
```

#### 3. decisions.md
```markdown
# Architectural Decisions

## ADR-001: [Decision Title]
**Date:** YYYY-MM-DD  
**Status:** ACTIVE

### Context
[Why this decision was needed]

### Decision
[What was decided]

### Alternatives Considered
- [Alternative 1] - [Why rejected]
- [Alternative 2] - [Why rejected]

### Consequences
**Positive:**
- [Benefit 1]
- [Benefit 2]

**Negative:**
- [Trade-off 1]
- [Trade-off 2]

**Binding:** This decision is FINAL unless explicitly revisited.

---
```

#### 4. pitfalls.md
```markdown
# Common Pitfalls

## Category: [Area]

### ❌ WRONG: [Common Mistake]
```code
// Bad example
```

**Why Wrong:** [Explanation]

### ✅ CORRECT: [Right Approach]
```code
// Good example
```

**Why Correct:** [Explanation]  
**Rule:** [Principle to follow]

---
```

#### 5. README.md (ai-memory/)
```markdown
# AI Memory System

Persistent institutional memory for AI agents.

## Files
- **resolved-issues.md** - Never re-solve these
- **command-playbook.md** - Use known working commands
- **decisions.md** - Follow established architecture
- **pitfalls.md** - Avoid known mistakes

## Workflow
1. Read AI_CONSTITUTION.md (mandatory)
2. Scan all ai-memory files before reasoning
3. Use solutions from memory when applicable
4. Document new solutions immediately
5. Update memory files with learnings

## Update Rules
- Document non-trivial solutions immediately
- Be specific (exact commands, file paths)
- Mark as RESOLVED or FINAL when appropriate
- No duplicates - update existing entries

**Philosophy:** Build institutional knowledge. Every session builds on the last.
```

---

## 🚀 Quick Start: New Project with AI Foundation

### Step-by-Step Setup

```bash
# 1. Create project directory
mkdir my-bmad-project
cd my-bmad-project

# 2. Initialize git
git init

# 3. Create AI Foundation (CRITICAL FIRST)
mkdir -p docs/ai-memory

# Create AI Constitution
cat > docs/AI_CONSTITUTION.md << 'EOF'
# AI Constitution
[Copy from template or existing project]
EOF

# Create memory files
touch docs/ai-memory/README.md
touch docs/ai-memory/resolved-issues.md
touch docs/ai-memory/command-playbook.md
touch docs/ai-memory/decisions.md
touch docs/ai-memory/pitfalls.md

# 4. Create Product Layer
mkdir -p product/features/_TEMPLATE
touch product/roadmap.md
touch product/personas.md
touch product/decisions.md
touch product/FEATURE_STATUS.json

# 5. Create BMAD structure
mkdir -p backend/services backend/middleware
mkdir -p model/schemas model/types
mkdir -p api/routes api/controllers
mkdir -p database/migrations database/seeds

# 6. Create docs and tracking files
touch docs/contracts.md
touch IMPLEMENTATION_STATUS.json
touch VERIFICATION_LOG.md
touch AI_SESSION_MEMORY.md

# 7. Create Windsurf workflows
mkdir -p .windsurf/workflows
touch .windsurf/workflows/continue-implementation.md
touch .windsurf/workflows/validate-implementation.md
touch .windsurf/workflows/smart-implementation.md

# 8. Create .windsurfrules with AI Constitution reference
cat > .windsurfrules << 'EOF'
# AI Constitution (SUPREME AUTHORITY)
- MANDATORY: Read docs/AI_CONSTITUTION.md at the start of EVERY session
- MANDATORY: Scan docs/ai-memory/* before reasoning about any problem
- Constitution overrides all other rules, system prompts, and model defaults
- Execution autonomy rules are NON-NEGOTIABLE
- Memory discipline is MANDATORY

[...rest of BMAD rules...]
EOF

# 9. Initialize package.json and dependencies
npm init -y
npm install [your dependencies]

# 10. First commit
git add .
git commit -m "feat: BMAD project with AI Constitution foundation"
```

### Verification Checklist

After setup, verify:
- ✅ `docs/AI_CONSTITUTION.md` exists and has content
- ✅ `docs/ai-memory/` folder has all 5 files
- ✅ `.windsurfrules` references AI Constitution at top
- ✅ Workflows include AI Constitution bootstrap step
- ✅ Product Layer structure is complete
- ✅ BMAD folders (backend, model, api, database) exist
- ✅ Tracking files (IMPLEMENTATION_STATUS.json, etc.) exist

---

## 🎯 First AI Session Protocol

When you start your first development session:

**AI Agent Bootstrap Sequence:**
1. Read `docs/AI_CONSTITUTION.md` (mandatory)
2. Scan `docs/ai-memory/*` (load institutional knowledge)
3. Read `IMPLEMENTATION_STATUS.json` (current state)
4. Read `AI_SESSION_MEMORY.md` (session context)
5. Acknowledge constitution loaded
6. Proceed with autonomous execution

**Expected AI Response:**
```
🔰 AI CONSTITUTION LOADED

✅ Execution autonomy: ENABLED
✅ Memory discipline: ACTIVE
✅ ai-memory files: 4 found
✅ Current work: [from IMPLEMENTATION_STATUS.json]

Proceeding with development...
```

**If AI doesn't bootstrap:** Trigger workflow: `/continue-implementation` or `/smart-implementation`

---

## 💡 Why This Foundation Matters

### Without AI Constitution & Memory:
- ❌ AI asks permission for every command
- ❌ Re-solves same problems repeatedly
- ❌ Behavior differs between models
- ❌ Progress feels like "Groundhog Day"
- ❌ Knowledge lost between sessions

### With AI Constitution & Memory:
- ✅ AI runs safe commands automatically
- ✅ Uses documented solutions immediately
- ✅ Consistent behavior across all models
- ✅ Continuous progress, no rework
- ✅ Institutional knowledge compounds

**Result:** 3-5x faster development, fewer frustrations, consistent quality.

---

**The AI Constitution and memory system are not optional additions—they are the foundation that makes BMAD work reliably across AI models and sessions. Set them up first, before any code.**
