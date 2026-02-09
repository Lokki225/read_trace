# Common Pitfalls

This document catalogs common mistakes and how to avoid them in the read_trace project.

## Format

Each pitfall entry includes:
- **Pitfall ID**: Unique identifier (PIT-001, PIT-002, etc.)
- **Title**: Name of the pitfall
- **Description**: What the pitfall is
- **Why It's a Problem**: Consequences of falling into this pitfall
- **How to Recognize It**: Signs that you've hit this pitfall
- **Prevention Strategies**: How to avoid it
- **Recovery**: What to do if you've already made this mistake
- **Related Pitfalls**: Links to related pitfalls

---

## Pitfall Template

```
### PIT-XXX: [Pitfall Title]

**Description**: [What the pitfall is]

**Why It's a Problem**: [Consequences]

**How to Recognize It**: [Signs you've hit it]

**Prevention Strategies**:
- [Strategy 1]
- [Strategy 2]

**Recovery**: [What to do if you've made this mistake]

**Related Pitfalls**: [Links to related pitfalls]

**Lessons Learned**: [Context from when this was discovered]
```

---

## Current Pitfalls

### PIT-001: Skipping Tests Before Implementation

**Description**: Writing implementation code before writing tests, or skipping tests entirely.

**Why It's a Problem**:
- Tests written after implementation often don't catch real bugs
- Tests may be written to match buggy implementation
- Harder to refactor without confidence in test coverage
- Violates AI Constitution Requirement 2 (Quality Assurance)

**How to Recognize It**:
- Implementation code exists but no tests
- Tests are written after implementation completes
- Test coverage is incomplete or spotty
- Bugs are discovered after "completion"

**Prevention Strategies**:
- Always write failing tests FIRST (RED phase)
- Verify tests fail before implementing
- Use test-driven development (TDD) discipline
- Reference ADR-003 (Red-Green-Refactor)

**Recovery**:
- Stop implementation immediately
- Write comprehensive tests for existing code
- Verify tests fail on current implementation
- Then refactor implementation to pass tests

**Related Pitfalls**: PIT-002 (Incomplete Test Coverage), PIT-003 (Skipping Validation)

**Lessons Learned**: TDD prevents bugs and provides confidence in refactoring.

---

### PIT-002: Incomplete Test Coverage

**Description**: Writing tests that don't cover edge cases, error conditions, or integration points.

**Why It's a Problem**:
- Bugs slip through to production
- Regressions aren't caught
- Refactoring breaks things unexpectedly
- False sense of security from incomplete tests

**How to Recognize It**:
- Tests pass but bugs still exist in production
- Regressions appear after refactoring
- Edge cases aren't tested
- Error handling isn't validated

**Prevention Strategies**:
- Write tests for happy path AND error cases
- Test edge cases and boundary conditions
- Write integration tests for component interactions
- Aim for high coverage (80%+ for new code)
- Review test coverage reports

**Recovery**:
- Identify missing test scenarios
- Write tests for uncovered code paths
- Verify tests catch the bugs
- Update implementation if needed

**Related Pitfalls**: PIT-001 (Skipping Tests), PIT-003 (Skipping Validation)

**Lessons Learned**: Comprehensive tests catch bugs early and prevent regressions.

---

### PIT-003: Skipping Validation and Regression Testing

**Description**: Marking tasks complete without running full test suite or validating acceptance criteria.

**Why It's a Problem**:
- Regressions break existing functionality
- Acceptance criteria not actually satisfied
- Bugs discovered during review (wasted time)
- Violates AI Constitution Rule 5 (No Shortcuts)

**How to Recognize It**:
- Tests fail when you run full suite
- Acceptance criteria not actually met
- Existing functionality broken
- Code review finds major issues

**Prevention Strategies**:
- Run FULL test suite before marking complete
- Verify EVERY acceptance criterion is satisfied
- Check for regressions explicitly
- Use validation checklist from story file
- Never skip validation steps

**Recovery**:
- Run full test suite to identify failures
- Fix failing tests and regressions
- Verify acceptance criteria again
- Only then mark task complete

**Related Pitfalls**: PIT-001 (Skipping Tests), PIT-002 (Incomplete Coverage)

**Lessons Learned**: Validation prevents embarrassing failures and wasted review time.

---

### PIT-004: Modifying Story Files Outside Permitted Sections

**Description**: Editing story file sections that shouldn't be modified by dev agents (Story, Acceptance Criteria, Dev Notes, etc.).

**Why It's a Problem**:
- Loses original story specification
- Makes it hard to track what was actually required
- Violates AI Constitution Rule 5 (No Shortcuts)
- Breaks story file integrity

**How to Recognize It**:
- Story description has been changed
- Acceptance criteria modified
- Dev Notes altered
- Original requirements unclear

**Prevention Strategies**:
- Only modify these sections:
  - Tasks/Subtasks (mark checkboxes)
  - Dev Agent Record (Debug Log, Completion Notes)
  - File List
  - Change Log
  - Status
- Never touch: Story, Acceptance Criteria, Dev Notes, References
- Use story file as read-only specification

**Recovery**:
- Restore original sections from git history
- Re-document changes in Dev Agent Record instead
- Update File List and Change Log appropriately

**Related Pitfalls**: PIT-005 (Incomplete File List)

**Lessons Learned**: Story files are contracts - preserve them as written.

---

### PIT-005: Incomplete File List

**Description**: Not updating File List section with all new, modified, or deleted files.

**Why It's a Problem**:
- Reviewers don't know what changed
- Hard to track project changes
- Deployment issues from missing files
- Violates definition-of-done checklist

**How to Recognize It**:
- File List is empty or incomplete
- Files were changed but not listed
- Reviewer has to hunt for changes
- Deployment fails due to missing files

**Prevention Strategies**:
- Track files as you implement
- Update File List BEFORE marking task complete
- Use relative paths from repo root
- Include new, modified, and deleted files
- Double-check File List matches actual changes

**Recovery**:
- Review git diff to see all changes
- Update File List with complete list
- Verify paths are correct and relative
- Re-run validation before completion

**Related Pitfalls**: PIT-004 (Modifying Story Files)

**Lessons Learned**: File List is critical for tracking and deployment.

---

### PIT-006: Implementing Features Not in Story Tasks

**Description**: Adding features or functionality that isn't mapped to a specific task/subtask in the story.

**Why It's a Problem**:
- Scope creep
- Extra work that wasn't planned
- Violates AI Constitution Rule 5 (No Shortcuts)
- Makes it hard to review what was actually required
- May introduce unnecessary complexity

**How to Recognize It**:
- Code exists that doesn't map to any task
- Extra features beyond story scope
- Story tasks complete but more code written
- Reviewer confused about scope

**Prevention Strategies**:
- Map every code change to a task/subtask
- Only implement what's in the story
- If new features needed, create new story
- Ask for clarification if scope is unclear
- Reference task/subtask in completion notes

**Recovery**:
- Identify code not mapped to tasks
- Either remove it or create new story for it
- Update File List and completion notes
- Ensure only required features remain

**Related Pitfalls**: PIT-004 (Modifying Story Files)

**Lessons Learned**: Stick to story scope - extra features are technical debt.

---

### PIT-007: Not Documenting Technical Decisions

**Description**: Implementing complex solutions without documenting why those decisions were made.

**Why It's a Problem**:
- Future developers don't understand the approach
- Same decisions get revisited
- Violates AI Constitution Requirement 5 (Memory and Learning)
- Hard to maintain or refactor code

**How to Recognize It**:
- Code is complex but no explanation exists
- Same architectural questions keep coming up
- Reviewers ask "why did you do it this way?"
- No entry in decisions.md for major choices

**Prevention Strategies**:
- Document technical decisions in Dev Agent Record
- Add entries to decisions.md for architectural choices
- Explain complex code with comments
- Reference decisions when making choices
- Keep decisions.md updated

**Recovery**:
- Review implementation and identify key decisions
- Document them in Dev Agent Record
- Add entries to decisions.md
- Add code comments explaining complex logic

**Related Pitfalls**: PIT-008 (Poor Code Documentation)

**Lessons Learned**: Documented decisions prevent repeated discussions.

---

### PIT-008: Poor Code Documentation

**Description**: Writing code without comments or documentation explaining complex logic.

**Why It's a Problem**:
- Hard to understand code later
- Maintenance becomes difficult
- Bugs are harder to fix
- Code review takes longer

**How to Recognize It**:
- Complex code with no comments
- Unclear variable or function names
- Logic that's hard to follow
- Reviewer asks for clarification

**Prevention Strategies**:
- Comment complex logic
- Use clear, descriptive names
- Document function purposes and parameters
- Explain non-obvious decisions
- Keep comments up-to-date with code

**Recovery**:
- Add comments to complex code
- Improve variable/function names
- Add documentation strings
- Verify code is understandable

**Related Pitfalls**: PIT-007 (Not Documenting Decisions)

**Lessons Learned**: Good documentation saves time in maintenance.

---

**Last Updated**: 2026-02-09
**Total Pitfalls**: 8
**Status**: Active
