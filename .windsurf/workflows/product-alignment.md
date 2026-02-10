---
description: Validate all implementation against Product Layer specifications
---

# Product Alignment Workflow

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
✅ Product alignment: VALIDATED
✅ ai-memory/ files found: [resolved-issues.md, command-playbook.md, decisions.md, pitfalls.md]

Proceeding with product alignment validation...
```

**BLOCKING RULE**: Do not proceed until bootstrap is complete.

---

## Product Layer Validation Framework

## Product Layer Validation

### 1. Load Product Context

Before implementing any story:
- Read relevant feature specification from `product/features/`
- Review personas to understand user needs
- Check roadmap for strategic context
- Review decisions.md for architectural constraints

### 2. Strategic Alignment Check

Verify implementation aligns with:
- **Product Vision**: Supports overall product goals
- **User Needs**: Addresses persona requirements
- **Feature Specifications**: Matches feature definitions
- **Architectural Decisions**: Follows established patterns
- **Quality Standards**: Meets confidence thresholds

### 3. Feature Specification Validation

For each acceptance criterion:
- [ ] Maps to specific feature requirement
- [ ] Satisfies user persona needs
- [ ] Follows architectural guidelines
- [ ] Meets quality and performance standards
- [ ] Aligns with roadmap priorities

### 4. Scope Boundary Enforcement

**Prevent Scope Creep:**
- Implement only what's specified in story
- No extra features beyond acceptance criteria
- No "nice-to-have" additions without approval
- Stay focused on current story's objectives

**When User Needs Aren't Met:**
- Document gap in `product/decisions.md`
- Create new story for additional requirements
- Don't expand current story scope

### 5. Cross-Feature Consistency

Ensure implementation is consistent with:
- Similar features in other areas
- Shared components and patterns
- User experience expectations
- Technical architecture standards

## Alignment Validation Checklist

Before marking story complete:

### Product Alignment
- [ ] Implementation matches feature specification
- [ ] Addresses user persona needs
- [ ] Follows architectural decisions
- [ ] Maintains cross-feature consistency
- [ ] No scope creep beyond story

### Strategic Alignment
- [ ] Supports product vision
- [ ] Aligns with roadmap priorities
- [ ] Follows quality standards
- [ ] Meets performance requirements
- [ ] Enables future enhancements

### Documentation Alignment
- [ ] Feature status updated in FEATURE_STATUS.json
- [ ] Product Layer documentation current
- [ ] Architectural decisions documented
- [ ] User-facing changes noted

## Escalation Triggers

HALT and escalate when:
- Story conflicts with product specifications
- Acceptance criteria contradict feature requirements
- Implementation requires architectural changes
- User needs not addressed by story scope
- Quality standards cannot be met with current approach

## Governance Compliance

This workflow enforces AI Constitution governance and compliance requirements:
- AI Constitution story fidelity requirements
- Product Layer specification adherence
- No unauthorized scope changes
- Strategic alignment validation
- Transparent product alignment documentation
