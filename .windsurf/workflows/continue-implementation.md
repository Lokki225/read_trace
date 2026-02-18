---
description: Safely resume development from the exact point it was stopped, without rework, drift, or loss of architectural context
---

# 🔁 WORKFLOW: `continue-implementation` 

> **Purpose:**
> Safely resume development **from the exact point it was stopped**, without rework, drift, or loss of architectural context.
> **Phase-Based Implementation**: Work on ONE phase at a time, mark complete, update JSON files, then stop.

---

## 🔰 STEP -1 — AI Constitution Bootstrap (MANDATORY FIRST STEP)

**Before ANY other action, execute this bootstrap sequence:**

### Required Reading (Check existence, read if present):

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

After reading, acknowledge:

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

## 🎯 When to Use

Trigger this workflow when:

* Implementation was paused
* Context might be partially lost
* You are resuming work across sessions, days, or tools
* An AI agent is re-attached to an ongoing project
* You want **continuity without re-analysis from scratch**
* Continuing to next phase of a multi-phase feature

---

## 🧭 Core Principle

> **Never resume coding until the agent proves it understands the current state better than a human reviewer would.**
> **One Phase Per Run**: Complete one phase, update tracking, then stop. Next run picks up the next phase.

---

## 📄 STEP 0 — Detect Current Phase (MANDATORY)

The agent MUST determine which phase to work on before any implementation.

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
   - If all tasks in a phase are `[x]`, that phase is complete

3. **Read IMPLEMENTATION_STATUS.json**:
   - File: `IMPLEMENTATION_STATUS.json` 
   - Check: `currentWork.phaseCompleted` array
   - Verify consistency with phase file completion status

4. **Read FEATURE_STATUS.json**:
   - File: `product/FEATURE_STATUS.json` 
   - Check feature state: Should be SPECIFIED or IMPLEMENTING
   - Verify feature is ready for implementation

### Required Output (Step 0)

The agent must explicitly state:

```text
📄 PHASE DETECTION

Feature: <feature-name>
Phase Files Found: [phase1.md, phase2.md, phase3.md, ...]

Phase 1: [COMPLETE | IN_PROGRESS | PENDING]
Phase 2: [COMPLETE | IN_PROGRESS | PENDING]
Phase 3: [COMPLETE | IN_PROGRESS | PENDING]
...

Current Phase to Implement: Phase X
Phase Status: [IN_PROGRESS | PENDING]
Phase File: product/features/<feature-name>/implementation_tasks_phaseX.md

Reason: [Phase X has Y pending tasks | Phase X is marked in-progress | All previous phases complete]
```

### Phase Decision Rules

* If **ALL phases complete** → Feature is DONE, update to IMPLEMENTED state
* If **current phase has in-progress tasks** → Resume that phase
* If **current phase has only pending tasks** → Start that phase
* If **previous phase incomplete** → ERROR: Cannot skip phases
* If **no phase files found** → Use single `implementation_tasks.md` file

---

## 🧩 STEP 1 — Context Rehydration (MANDATORY)

The agent MUST reconstruct the current state **before touching any code**.

### Required Inputs

1. **Check for VALIDATION_REPORT.md** (PRIORITY CHECK):
   - File: `product/features/<feature-name>/VALIDATION_REPORT.md` 
   - If exists: This is a validation-driven continuation
   - Extract all gaps/missing/errors from the report
   - Prioritize: HIGH → MEDIUM → LOW priority items

2. **Read current phase implementation tasks**:
   - File: `product/features/<feature-name>/implementation_tasks_phase<N>.md` (or `implementation_tasks.md`)
   - Identify which tasks are checked off ([x])
   - Identify current in-progress task ([~])
   - Identify next pending task ([ ])

3. **Read Product Layer files** for context:
   - `product/features/<feature-name>/spec.md` 
   - `product/features/<feature-name>/acceptance-criteria.md` 
   - `product/features/<feature-name>/test-scenarios.md` 

4. **Read FEATURE_STATUS.json** for feature state:
   - File: `product/FEATURE_STATUS.json` 
   - Verify current feature state

5. **Read IMPLEMENTATION_STATUS.json** for global state:
   - File: `IMPLEMENTATION_STATUS.json` 
   - Check current work status and confidence score

### Required Outputs

The agent must explicitly state:

```text
📌 CURRENT IMPLEMENTATION CONTEXT

Feature: [FEATURE_NAME]
Current Phase: Phase X - [Phase Name]
Phase Status: [IN_PROGRESS | PENDING]

🔍 VALIDATION REPORT STATUS:
- VALIDATION_REPORT.md exists: YES / NO
- If YES:
  - Total Gaps Found: [COUNT]
  - HIGH Priority: [COUNT]
  - MEDIUM Priority: [COUNT]
  - LOW Priority: [COUNT]
  - Mode: VALIDATION-DRIVEN FIXES
- If NO:
  - Mode: STANDARD CONTINUATION

📋 Task Progress (from implementation_tasks_phaseX.md):
- Completed Tasks: [COUNT] / [TOTAL] in this phase
- Last Completed Task: [Task description]
- Next Task: [Task description]
- Tasks Remaining in Phase: [COUNT]

Completed Acceptance Criteria (this phase):
- AC-1 
- AC-2 

Pending Acceptance Criteria (this phase):
- AC-3 
- AC-4 

Touched Layers (this phase):
- Presentation
- Domain
- Data

Modified Files (this phase):
- file_a.dart → reason
- file_b.dart → reason

Existing Tests (this phase):
- test_x.dart → covers AC-1
- test_y.dart → partial
```

 If any of this cannot be reconstructed → **STOP & ESCALATE**

---

## 🧠 STEP 2 — Integrity Check

Before continuing, the agent must verify:

### Integrity Questions (Must ALL be answered)

1. Is the current implementation **still aligned with the PRD**?
2. Are all completed ACs **fully covered by tests**?
3. Does any implemented code violate **Clean Architecture rules**?
4. Has any shortcut been taken under "temporary" assumptions?
5. Is there any **technical debt already introduced**?

### Required Output

```text
 INTEGRITY ASSESSMENT

Architectural Integrity: PASS / FAIL
Test Integrity: PASS / FAIL
Spec Alignment: PASS / FAIL
Technical Debt Introduced: YES / NO
If YES → describe and justify
```

 Any FAIL → must be resolved **before continuing**

---

## ▶️ STEP 3 — Create Cascade TODOs (MANDATORY)

**CRITICAL**: Before implementing, create Cascade TODOs for clear task tracking.

### TODO Creation Rules

**Optimal Batch Size**: Create **5-8 TODOs** per run (not too few, not overwhelming)

### Mode A: Validation-Driven (If VALIDATION_REPORT.md exists)

Extract gaps from validation report and create TODOs:

```text
📝 CASCADE TODO CREATION (VALIDATION MODE)

Source: product/features/<feature-name>/VALIDATION_REPORT.md

TODO Batch:
1. ⚠️ [HIGH] Fix Gap 1: [Description from report]
   - Files: [Expected files]
   - Action: [Specific fix]

2. ⚠️ [HIGH] Fix Gap 2: [Description]
   - Files: [Expected files]
   - Action: [Specific fix]

3. ⚠️ [MEDIUM] Fix Gap 3: [Description]
   - Files: [Expected files]
   - Action: [Specific fix]

... (5-8 total TODOs)

Prioritization:
- HIGH priority gaps first
- Then MEDIUM priority
- Then LOW priority
- Batch size: 5-8 tasks
```

### Mode B: Standard Continuation (No validation report)

Extract next tasks from implementation_tasks file:

```text
📝 CASCADE TODO CREATION (STANDARD MODE)

Source: product/features/<feature-name>/implementation_tasks_phaseX.md

TODO Batch:
1. ✅ [TASK] Next pending task from phase file
   - Files to create/modify: [List]
   - Acceptance criteria: [AC-X]

2. ✅ [TASK] Following task
   - Files to create/modify: [List]
   - Acceptance criteria: [AC-Y]

... (5-8 total TODOs)

Batch Strategy:
- Start with next uncompleted task ([~] or [ ])
- Include 5-8 sequential tasks from phase
- Group related tasks together
- Stop at phase boundaries
```

### Required Action

**The agent MUST call `update_plan` tool to create these TODOs.**

Example:
```
update_plan([
  {"step": "Fix Gap 1: Missing error handling in X", "status": "pending"},
  {"step": "Fix Gap 2: Create missing file Y", "status": "pending"},
  {"step": "Implement Task 3: Add feature Z", "status": "pending"},
  ...
])
```

---

## ▶️ STEP 4 — Controlled Phase Resumption

Only after Steps 1, 2 & 3 pass:

### Phase Resumption Rules

* Resume **ONLY** on:
  * Tasks in Cascade TODO list (created in Step 3)
  * Tasks in the current phase file (implementation_tasks_phaseX.md)
  * The next uncompleted task in the phase (marked `[ ]` or `[~]`)
  * Gaps from VALIDATION_REPORT.md (if exists)
  * Do NOT jump to future phases or skip tasks within the phase
* Do **NOT**:
  * Refactor unrelated code
  * Improve aesthetics opportunistically
  * "Clean up" without scope approval
  * Work on tasks from other phases

### Allowed Actions (Current Phase Only)

* Fix gaps identified in VALIDATION_REPORT.md
* Implement missing logic for current phase tasks
* Extend tests for current phase acceptance criteria
* Complete UI strictly required by the current phase
* Mark tasks as `[x]` when fully complete
* Mark tasks as `[~]` when in-progress
* Update Cascade TODOs as work progresses

---

## 📘 STEP 5 — Phase Completion Check

After implementing phase tasks, the agent MUST determine if the phase is complete.

### Phase Completion Criteria

A phase is considered **COMPLETE** when:

1. **All tasks marked `[x]`** in the phase file
2. **All acceptance criteria** for the phase are met
3. **All tests** for the phase are passing
4. **No blocking issues** remain

### Required Output

The agent must explicitly state:

```text
📘 PHASE COMPLETION STATUS

Phase: Phase X - [Phase Name]
Phase File: product/features/<feature-name>/implementation_tasks_phaseX.md

Task Completion:
- Total Tasks: [COUNT]
- Completed Tasks: [COUNT]
- In-Progress Tasks: [COUNT]
- Pending Tasks: [COUNT]

Phase Status: [COMPLETE | IN_PROGRESS | BLOCKED]

If COMPLETE:
- All tasks marked [x]
- All acceptance criteria met
- All tests passing
- Ready to proceed to next phase

If IN_PROGRESS:
- X tasks remaining
- Will resume in next run

If BLOCKED:
- Blocker: [Description]
- Requires: [User action needed]
```

### Phase Completion Actions

If phase is **COMPLETE**, agent MUST:

1. Update phase file: Mark all tasks as `[x]` 
2. Update IMPLEMENTATION_STATUS.json: Add phase to `currentWork.phasesCompleted` array
3. Update FEATURE_STATUS.json: Update feature state if needed
4. Create phase completion summary
5. **STOP** - Do not proceed to next phase automatically

---

## 🧾 STEP 6 — Update Tracking Files (MANDATORY)

**CRITICAL**: If VALIDATION_REPORT.md was used, archive or delete it after fixes are complete.

After completing validation-driven fixes:

```bash
# Move validation report to archive
mv product/features/<feature-name>/VALIDATION_REPORT.md \
   product/features/<feature-name>/VALIDATION_REPORT_RESOLVED_[timestamp].md
```

After completing phase work, the agent MUST update all tracking files.

### Update IMPLEMENTATION_STATUS.json

File: `IMPLEMENTATION_STATUS.json` 

**If Phase Complete:**

```json
{
  "currentWork": {
    "feature": "<feature-name>",
    "status": "IMPLEMENTING",
    "currentPhase": <next-phase-number>,
    "phasesCompleted": [1, 2, 3, ...],
    "tasksCompleted": [
      "Phase X: Task description",
      ...
    ]
  },
  "confidenceMetrics": {
    "globalScore": <updated-score>
  }
}
```

**If Phase In-Progress:**

```json
{
  "currentWork": {
    "feature": "<feature-name>",
    "status": "IMPLEMENTING",
    "currentPhase": <current-phase-number>,
    "phasesCompleted": [1, 2, ...],
    "tasksCompleted": [
      "Phase X: Task description",
      ...
    ],
    "nextTask": "Phase X: Next task description"
  }
}
```

### Update FEATURE_STATUS.json

File: `product/FEATURE_STATUS.json` 

**If ALL Phases Complete:**

```json
{
  "name": "<feature-name>",
  "state": "IMPLEMENTED",
  "lastUpdated": "<ISO-8601-timestamp>",
  "completionPercentage": 100
}
```

**If Some Phases Complete:**

```json
{
  "name": "<feature-name>",
  "state": "IMPLEMENTING",
  "lastUpdated": "<ISO-8601-timestamp>",
  "completionPercentage": <percentage>,
  "currentPhase": "Phase X"
}
```

### Update Phase File

File: `product/features/<feature-name>/implementation_tasks_phaseX.md` 

* Mark completed tasks with `[x]` 
* Mark in-progress tasks with `[~]` 
* Leave pending tasks as `[ ]` 
* Update any notes or blockers

### Required Output

The agent must explicitly state:

```text
🧾 TRACKING FILES UPDATED

Files Updated:
- IMPLEMENTATION_STATUS.json
  - currentPhase: Phase X
  - phasesCompleted: [1, 2, ...]
  - tasksCompleted: [COUNT] tasks

- FEATURE_STATUS.json
  - state: [IMPLEMENTING | IMPLEMENTED]
  - completionPercentage: [X]%

- implementation_tasks_phaseX.md
  - Marked [COUNT] tasks as complete
  - [COUNT] tasks remaining in phase
```

---

## 📊 STEP 7 — Phase Summary Report (MANDATORY)

The agent MUST provide a comprehensive summary before stopping.

### Required Output

The agent must explicitly state:

```text
📊 PHASE IMPLEMENTATION SUMMARY

Feature: <feature-name>
Phase: Phase X - [Phase Name]
Phase Status: [COMPLETE | IN_PROGRESS | BLOCKED]

Work Completed:
- Tasks Completed: [COUNT]
- Files Created: [COUNT]
- Files Modified: [COUNT]
- Tests Added: [COUNT]
- Acceptance Criteria Met: [COUNT]

Key Changes:
- <change 1>
- <change 2>
- <change 3>

Next Steps:
- If COMPLETE: Run `/continue-implementation` to start Phase X+1
- If IN_PROGRESS: Run `/continue-implementation` to continue Phase X
- If BLOCKED: [Describe required action]

Confidence Score:
- Previous: [X]
- Current: [Y]
- Change: [+/-Z]

Tracking Files Updated:
✅ IMPLEMENTATION_STATUS.json
✅ FEATURE_STATUS.json
✅ implementation_tasks_phaseX.md
```

---

## ✅ Definition of Done — `continue-implementation` 

A continuation is considered valid **ONLY IF**:

* **VALIDATION_REPORT.md checked** (if exists, enters validation-driven mode)
* **Cascade TODOs created** (5-8 optimal batch size)
* **Phase detected correctly** from phase files
* **Context was reconstructed explicitly** for the current phase
* **No assumptions were made silently**
* **Only current phase tasks were worked on** (no skipping ahead)
* **Validation gaps addressed** (if VALIDATION_REPORT.md existed)
* **Phase file updated** with task completion status
* **IMPLEMENTATION_STATUS.json updated** with phase completion
* **FEATURE_STATUS.json updated** with feature state
* **VALIDATION_REPORT.md archived** (if it was used)
* **Phase summary provided** before stopping
* **Agent STOPPED** after phase completion (did not continue to next phase)
* **Cascade TODOs updated** to reflect completed work

---

## 🚫 CRITICAL RULE: One Phase Per Run

**The agent MUST STOP after completing or making progress on ONE phase.**

* ✅ Complete Phase 1 → Update files → STOP
* ✅ Work on Phase 2 (if Phase 1 done) → Update files → STOP
* ❌ Complete Phase 1 → Automatically start Phase 2 (FORBIDDEN)
* ❌ Work on multiple phases in one run (FORBIDDEN)

**Why:** This ensures:
* Clear phase boundaries
* Trackable progress
* User can review between phases
* Prevents scope creep
* Maintains confidence scoring accuracy

---

---

## 🔍 STEP 8 — Validate Implementation (MANDATORY AFTER FEATURE COMPLETE)

**Trigger**: Run this step ONLY when ALL phases are complete (feature status = IMPLEMENTED).

### Validation Execution

Run the `validate-implementation` workflow targeting the completed feature:

```
/validate-implementation [feature-name]
```

This workflow will:
1. Audit all acceptance criteria against implemented code
2. Verify all tests exist and pass
3. Check for missing, partial, or incorrect elements
4. Produce a confidence score
5. Auto-fix any gaps found (corrective action, not passive review)

### Validation Gate Rules

```
✅ VALIDATION GATE:

□ Run: /validate-implementation [feature-name]
□ All acceptance criteria verified: YES / NO
□ All tests passing: YES / NO
□ Confidence score ≥ 90: YES / NO
□ No gaps found (or all gaps fixed): YES / NO

🎯 RESULT: [PASS / FAIL]
```

**IF VALIDATION FAILS:**
- ❌ DO NOT proceed to git push
- ❌ Fix all gaps identified by validate-implementation
- ❌ Re-run validation until PASS
- ❌ Only proceed to Step 9 when confidence ≥ 90

**IF VALIDATION PASSES:**
- ✅ Proceed to Step 9: Git Push

---

## 🚀 STEP 9 — Git Push (ONLY IF STEP 8 PASSED)

**BLOCKING RULE**: This step executes ONLY if Step 8 validation returned PASS with confidence ≥ 90.

### Pre-Push Checklist

```
✅ PRE-PUSH CHECKLIST:

□ Step 8 validation: PASSED ✅
□ Confidence score ≥ 90 ✅
□ All tests passing (0 failures) ✅
□ No uncommitted changes to unrelated files ✅
□ Story file status = done ✅
□ Dev Agent Record filled ✅
□ File List complete ✅
```

### Git Commands

```bash
# Stage all changes for the feature
git add .

# Commit with structured message
git commit -m "feat([story-id]): [Feature Name] - Story [X.Y] complete

Implemented:
- [Key component 1]
- [Key component 2]
- [Key component 3]

Tests: [N] passing (+[M] new)
Confidence: [XX]%
AC: [N]/[N] satisfied (100%)

Closes #[story-id]"

# Push to remote
git push
```

### Required Output

```text
🚀 GIT PUSH RESULT

Commit: [commit hash]
Branch: [branch name]
Files Changed: [COUNT]
Tests: [N] passing
Confidence: [XX]%

Status: ✅ PUSHED SUCCESSFULLY
```

**IF PUSH FAILS:**
- Report the error
- Do NOT retry automatically
- Escalate to user for resolution

---

## Governance Compliance

This workflow enforces AI Constitution governance and compliance requirements:
* AI Constitution autonomy rules and behavioral requirements
* Phase-based implementation with clear boundaries
* Context reconstruction before any code changes
* Validation-driven fixes when VALIDATION_REPORT.md exists
* Cascade TODO creation for task tracking
* Mandatory tracking file updates (IMPLEMENTATION_STATUS.json, FEATURE_STATUS.json)
* One phase per run rule enforcement
* Mandatory validation before git push (Step 8)
* Git push only on validated, confidence ≥ 90 implementations (Step 9)
