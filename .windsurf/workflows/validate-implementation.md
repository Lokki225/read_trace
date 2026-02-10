---
description: Audit an implementation, detect missing, partial, or incorrect elements, and complete them correctly — not just report them
---

# ✅ WORKFLOW: `validate-implementation [feature-name]` 

> **Purpose:**
> Audit an implementation, detect **missing, partial, or incorrect elements**, and **complete them correctly** — not just report them.

> **Usage:**
> - `/validate-implementation` — Validates ALL features in product/features/
> - `/validate-implementation [feature-name]` — Validates ONLY the specified feature

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

**BLOCKING RULE**: Do not proceed until bootstrap is complete.

---

## 🎯 When to Use

Trigger this workflow when:

* A story is marked "done" but feels suspicious
* Another AI or human implemented the feature
* You want a **professor-level review**
* Before merging, releasing, or demoing
* After rapid AI-assisted development
* You want to validate a specific feature only

---

## 🧭 Core Principle

> **Validation is not passive review. It is corrective action.**

## Confidence Guard Integration

This workflow includes confidence guard mechanisms to ensure quality thresholds are met throughout validation.

---

## Governance Compliance

This workflow enforces AI Constitution governance and compliance requirements:
- AI Constitution quality assurance requirements
- Confidence score protection (≥90% threshold)
- Complete test coverage for critical functionality
- No shortcuts or quality compromises
- Transparent documentation of validation results
- Corrective implementation (not just reporting)
- File-level task verification
- VALIDATION_REPORT.md generation for continue-implementation workflow
