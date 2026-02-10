---
description: Proactive identification and fixing of common issues
---

# Auto-Healing Workflow

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
✅ Auto-healing: ACTIVE
✅ ai-memory/ files found: [resolved-issues.md, command-playbook.md, decisions.md, pitfalls.md]

Proceeding with auto-healing diagnostics...
```

**BLOCKING RULE**: Do not proceed until bootstrap is complete.

---

## Auto-Healing Framework

### 1. Proactive Issue Detection

Run proactive diagnostics before and after implementation:

**Code Quality Checks:**
- Linting errors and warnings
- Type safety violations
- Unused imports or variables
- Deprecated API usage
- Security vulnerabilities

**Test Health Checks:**
- Flaky tests (inconsistent results)
- Slow tests (>1s for unit tests)
- Missing test coverage for critical paths
- Outdated test data or mocks

**Architecture Violations:**
- Circular dependencies
- Tight coupling between modules
- Missing abstraction layers
- Inconsistent patterns

**Documentation Drift:**
- Code comments out of sync with implementation
- README instructions that don't work
- Missing documentation for new features
- Stale examples or guides

### 2. Common Issue Patterns

**Pattern**: Import errors after refactoring
**Auto-Fix**: Update all import paths automatically

**Pattern**: Test failures due to environment issues
**Auto-Fix**: Ensure test setup/teardown properly isolates tests

**Pattern**: Confidence score degradation over time
**Auto-Fix**: Identify and address root cause (usually test coverage or code quality)

**Pattern**: Regression in previously working features
**Auto-Fix**: Run git bisect to identify breaking change, then revert or fix

**Pattern**: Performance degradation
**Auto-Fix**: Profile code, identify bottleneck, optimize critical path

### 3. Healing Actions

For each detected issue:

1. **Classify Severity**
   - Critical: Breaks functionality or tests
   - High: Degrades quality or performance
   - Medium: Violates standards or patterns
   - Low: Minor improvements or cleanup

2. **Auto-Fix When Safe**
   - Linting errors (formatting, imports)
   - Type safety issues (add proper types)
   - Documentation updates (sync with code)
   - Test data refresh (update mocks)

3. **Escalate When Uncertain**
   - Breaking changes required
   - Architectural refactoring needed
   - Performance optimization trade-offs
   - Security vulnerability mitigations

4. **Document All Fixes**
   - Add to `docs/ai-memory/resolved-issues.md`
   - Note pattern and solution
   - Include prevention strategy

### 4. Preventive Maintenance

**Daily Checks:**
- Run full test suite and address any failures
- Check linting and fix any new errors
- Review test coverage and fill gaps
- Update dependencies with security patches

**Weekly Checks:**
- Review confidence scores across all features
- Identify technical debt accumulation
- Check for documentation drift
- Audit code quality trends

**Monthly Checks:**
- Comprehensive architecture review
- Performance profiling and optimization
- Security audit and vulnerability assessment
- Dependency updates and migration planning

## Healing Playbook

### Issue: Failing Tests After Change

```
1. Run test suite to identify failures
2. For each failure:
   - Check if test or implementation changed
   - Verify test is still valid for requirements
   - Fix implementation if test is correct
   - Update test if requirements changed
3. Run full suite to ensure no cascading failures
4. Document fix in resolved-issues.md
```

### Issue: Low Code Quality Score

```
1. Run linter with --fix flag for auto-fixes
2. Review remaining issues and fix manually
3. Run type checker and address violations
4. Check for code duplication and refactor
5. Verify code follows project patterns
6. Document improvements in completion notes
```

### Issue: Performance Degradation

```
1. Profile application to identify bottlenecks
2. Check for O(n²) or worse algorithms
3. Review database queries for N+1 problems
4. Optimize critical path identified by profiler
5. Add performance test to prevent regression
6. Document optimization in decisions.md
```

### Issue: Documentation Drift

```
1. Review all changed files
2. Update code comments to match implementation
3. Update README if setup process changed
4. Refresh examples to use current API
5. Verify documentation builds without errors
6. Add documentation check to CI/CD
```

## Memory Integration

**After Fixing Any Issue:**

1. **Document in resolved-issues.md**
   - Issue description and symptoms
   - Root cause analysis
   - Solution implemented
   - Prevention strategy

2. **Update command-playbook.md**
   - If new commands were discovered
   - Document successful command patterns

3. **Record in decisions.md**
   - If architectural changes made
   - Document rationale and alternatives

4. **Note in pitfalls.md**
   - If common mistake identified
   - Describe how to avoid in future

## Governance Compliance

This workflow enforces AI Constitution governance and compliance requirements:
- AI Constitution memory and learning requirements
- Proactive quality maintenance
- Continuous improvement mindset
- Systematic issue resolution
- Knowledge preservation for future sessions
