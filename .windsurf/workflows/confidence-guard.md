---
description: Protect confidence scores from degradation below 90%
---

# Confidence Guard Workflow

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
✅ Confidence protection: ACTIVE (≥90% threshold)
✅ ai-memory/ files found: [resolved-issues.md, command-playbook.md, decisions.md, pitfalls.md]

Proceeding with confidence guard protection...
```

**BLOCKING RULE**: Do not proceed until bootstrap is complete.

---

## Confidence Protection Framework

## Confidence Score Framework

### What is Confidence?

Confidence measures the degree of certainty that:
- Implementation satisfies all acceptance criteria
- Tests provide adequate coverage and validation
- Code quality meets project standards
- No regressions introduced
- Documentation is complete and accurate

### Minimum Thresholds

**Story Completion Confidence**: ≥90%

Components that contribute to confidence:
- **Test Coverage**: ≥90% for critical paths
- **Acceptance Criteria**: 100% satisfied
- **Code Quality**: No critical issues
- **Regression Prevention**: 100% existing tests passing
- **Documentation**: Complete and accurate

### Confidence Calculation

```
Confidence Score = (
  Test Coverage * 0.30 +
  AC Satisfaction * 0.30 +
  Code Quality * 0.20 +
  Regression Prevention * 0.15 +
  Documentation * 0.05
) * 100
```

**Example:**
- Test Coverage: 95% → 0.95 * 0.30 = 0.285
- AC Satisfaction: 100% → 1.00 * 0.30 = 0.300
- Code Quality: 90% → 0.90 * 0.20 = 0.180
- Regression: 100% → 1.00 * 0.15 = 0.150
- Documentation: 100% → 1.00 * 0.05 = 0.050
- **Total**: 0.965 * 100 = **96.5% Confidence**

### Guard Actions

**When Confidence < 90%:**

1. **HALT** - Do not proceed to next task
2. **IDENTIFY** - Determine which component is below threshold
3. **REMEDIATE** - Address the deficiency:
   - Low test coverage → Write more tests
   - AC not satisfied → Complete implementation
   - Code quality issues → Refactor and fix
   - Regressions → Fix broken tests
   - Documentation incomplete → Complete documentation
4. **VALIDATE** - Recalculate confidence score
5. **CONTINUE** - Only when ≥90% achieved

### Protection Rules

**NEVER:**
- Mark task complete with confidence < 90%
- Lower quality standards to meet deadlines
- Skip tests to improve velocity
- Accept partial acceptance criteria satisfaction
- Ignore code quality issues
- Allow regressions to persist
- Proceed with incomplete documentation

**ALWAYS:**
- Measure confidence before task completion
- Document confidence score in Dev Agent Record
- Address deficiencies before proceeding
- Maintain or improve confidence over time
- Escalate if unable to achieve 90% threshold

## Confidence Tracking

Document in Dev Agent Record → Completion Notes:

```
Task X Confidence Score: 95%
- Test Coverage: 96%
- AC Satisfaction: 100%
- Code Quality: 92%
- Regression Prevention: 100%
- Documentation: 100%
```

## Governance Compliance

This workflow enforces AI Constitution governance and compliance requirements:
- AI Constitution quality assurance requirements
- Minimum 90% confidence threshold
- No quality compromises or shortcuts
- Transparent confidence measurement
- Continuous quality improvement
