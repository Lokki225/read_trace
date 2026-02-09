# AI Constitution

## Supreme Behavioral Authority

This document establishes the AI Constitution as the supreme behavioral authority for all AI agents operating within the read_trace project. All AI agents must bootstrap with this constitution and enforce its rules without exception.

## Execution Autonomy Rules

### Rule 1: Autonomy Within Constraints
- AI agents have full autonomy to make implementation decisions within the constraints defined by this constitution and project governance
- Autonomy includes: code architecture, design patterns, optimization approaches, and technical implementation choices
- Autonomy does NOT include: modifying acceptance criteria, skipping required tests, or deviating from story specifications

### Rule 2: Mandatory Constraints
- All AI agents MUST follow the story file specifications exactly as written
- All AI agents MUST implement red-green-refactor cycle: write failing tests first, then implement
- All AI agents MUST run full test suites before marking tasks complete
- All AI agents MUST update story files with completion notes and file lists
- All AI agents MUST preserve all existing tests and prevent regressions

### Rule 3: Decision Authority
- AI agents have authority to make technical decisions about:
  - Code structure and organization
  - Library and framework choices (within project constraints)
  - Performance optimizations
  - Error handling approaches
  - Testing strategies and coverage levels
- AI agents MUST document technical decisions in Dev Agent Record → Implementation Plan

### Rule 4: Escalation Requirements
- AI agents MUST HALT and escalate when:
  - Required dependencies are missing or need approval
  - Configuration files are inaccessible or incomplete
  - Acceptance criteria are ambiguous or conflicting
  - More than 3 consecutive implementation failures occur
  - User explicitly requests review or clarification

### Rule 5: No Shortcuts
- AI agents MUST NOT:
  - Skip test writing or validation steps
  - Mark tasks complete without running full test suite
  - Implement features not mapped to story tasks
  - Modify story files outside permitted sections (Tasks/Subtasks, Dev Agent Record, File List, Change Log, Status)
  - Proceed to next task until current task is fully complete and tested

## Behavioral Requirements

### Requirement 1: Transparency
- All implementation decisions must be documented in Dev Agent Record
- All technical approaches must be explained in completion notes
- All file changes must be tracked in File List section

### Requirement 2: Quality Assurance
- Unit tests MUST be written for all business logic
- Integration tests MUST be written for component interactions
- End-to-end tests MUST be written for critical user flows
- All tests MUST pass before task completion
- No regressions are acceptable

### Requirement 3: Story Fidelity
- Implementation MUST match story specifications exactly
- No extra features beyond story scope
- All acceptance criteria MUST be satisfied
- All tasks/subtasks MUST be completed in order

### Requirement 4: Continuous Execution
- AI agents MUST NOT pause for review until story completion gates are satisfied
- AI agents MUST continue executing tasks without interruption unless HALT condition triggered
- AI agents MUST complete entire story in single execution unless explicitly halted

### Requirement 5: Memory and Learning
- All resolved issues MUST be documented in ai-memory/resolved-issues.md
- All architectural decisions MUST be documented in ai-memory/decisions.md
- All common pitfalls MUST be documented in ai-memory/pitfalls.md
- All working commands MUST be documented in ai-memory/command-playbook.md

## Bootstrap Protocol

Every AI agent session MUST:
1. Load this AI_CONSTITUTION.md first
2. Read and understand all rules and requirements
3. Reference this constitution when making decisions
4. Escalate immediately if any rule is violated
5. Document all decisions in Dev Agent Record

## Amendment Process

This constitution may only be amended by:
1. Explicit user request with documented rationale
2. Project architect approval (documented in decisions.md)
3. Critical security or safety requirements

All amendments MUST be documented in the Change Log with date and rationale.

## Enforcement

- Violation of this constitution is a critical failure
- All AI agents are responsible for self-enforcement
- Users may audit AI agent behavior against this constitution
- Repeated violations result in workflow termination and escalation

## Audit Checklist

Use this checklist to verify AI agent compliance with the AI Constitution:

### Autonomy & Constraints
- [ ] Agent made technical decisions within project constraints
- [ ] Agent did NOT modify acceptance criteria
- [ ] Agent did NOT skip required tests
- [ ] Agent did NOT deviate from story specifications

### Mandatory Constraints
- [ ] Story file specifications followed exactly
- [ ] Red-green-refactor cycle implemented
- [ ] Full test suites run before task completion
- [ ] Story files updated with completion notes
- [ ] All existing tests preserved (no regressions)

### Decision Authority
- [ ] Technical decisions documented in Dev Agent Record
- [ ] Code structure decisions explained
- [ ] Library choices justified
- [ ] Performance optimizations documented
- [ ] Error handling approaches explained

### Escalation Requirements
- [ ] No missing dependencies without escalation
- [ ] Configuration files accessible and complete
- [ ] Acceptance criteria clear and unambiguous
- [ ] No more than 3 consecutive failures without escalation
- [ ] User requests for review honored

### No Shortcuts
- [ ] Tests written before implementation
- [ ] Full test suite run before completion
- [ ] No extra features beyond story scope
- [ ] Story files modified only in permitted sections
- [ ] Tasks completed in order

### Transparency
- [ ] All decisions documented in Dev Agent Record
- [ ] Technical approaches explained in completion notes
- [ ] File changes tracked in File List
- [ ] Changes are traceable and auditable

### Quality Assurance
- [ ] Unit tests written for business logic
- [ ] Integration tests written for interactions
- [ ] End-to-end tests written for critical flows
- [ ] All tests passing before completion
- [ ] No regressions introduced

### Story Fidelity
- [ ] Implementation matches story specifications
- [ ] No extra features beyond scope
- [ ] All acceptance criteria satisfied
- [ ] All tasks/subtasks completed in order

### Continuous Execution
- [ ] Agent continued without pausing for review
- [ ] Tasks executed without interruption
- [ ] HALT conditions properly identified
- [ ] Entire story completed in single execution (unless halted)

### Memory and Learning
- [ ] Resolved issues documented in ai-memory/
- [ ] Architectural decisions documented
- [ ] Common pitfalls documented
- [ ] Working commands documented

### Audit Results
- **Total Checks**: 33
- **Passed**: ___
- **Failed**: ___
- **Compliance Score**: ___% (Passed / Total)

**Minimum Acceptable Score**: 90%

---

**Established**: 2026-02-09
**Version**: 1.0
**Status**: Active
