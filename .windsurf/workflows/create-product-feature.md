---
description: Create product feature files from story specification
---

# Create Product Feature Workflow

This workflow creates a complete product feature directory with all necessary documentation files based on a story specification.

## Usage

```
/create-product-feature <story-id>
```

Example: `/create-product-feature 3-2`

## Workflow Steps

### 1. Parse Story ID and Validate
// turbo
Parse the story ID from the command (e.g., "3-2") and validate it exists in the project's epic/story structure.

**Validation checks:**
- Story ID format is valid (e.g., `<epic>-<story>`)
- Story file exists in `_bmad-output/implementation-artifacts/` or similar location
- Extract story title, description, and acceptance criteria from the story file

### 2. Create Feature Directory Structure
// turbo
Create the feature directory under `product/features/` with a slug-based name derived from the story title.

**Directory structure to create:**
```
product/features/<feature-slug>/
├── acceptance-criteria.md
├── test-scenarios.md
├── spec.md
├── risks.md
├── implementation_tasks_phase1.md
├── implementation_tasks_phase2.md
├── implementation_tasks_phase3.md
└── implementation_tasks_phase4.md
```

**Naming convention:**
- Convert story title to kebab-case (lowercase, hyphens)
- Example: "Series Card Component" → "series-card-component"

### 3. Generate acceptance-criteria.md
// turbo
Create `acceptance-criteria.md` based on the template at `product/features/_TEMPLATE/acceptance-criteria.md`.

**Content mapping:**
- **Feature name**: Use story title
- **Feature ID**: Use story ID (e.g., "3-2")
- **Story**: Reference the story ID
- **Last Updated**: Use current date (YYYY-MM-DD)
- **Acceptance Criteria**: Extract from story's acceptance criteria section
  - Convert each AC to Gherkin format (Given/When/Then)
  - Add rationale explaining why each criterion is important
  - Reference related test scenarios
- **Functional Requirements**: Extract from story requirements
- **Non-Functional Requirements**: Add standard requirements (performance, security, accessibility, usability)
- **Data Requirements**: Infer from story context
- **Integration Requirements**: Identify any API or third-party integrations mentioned
- **Browser and Device Support**: Use standard support matrix
- **Quality Gates**: Set standard testing requirements (90%+ coverage)

### 4. Generate test-scenarios.md
// turbo
Create `test-scenarios.md` based on the template at `product/features/_TEMPLATE/test-scenarios.md`.

**Content mapping:**
- **Feature name**: Use story title
- **Feature ID**: Use story ID
- **Story**: Reference the story ID
- **Test Strategy**: Use standard testing pyramid (60% unit, 30% integration, 10% E2E)
- **Unit Tests**: Create test suites for each major component/function
  - Generate 3-5 test cases per suite
  - Include edge cases and error scenarios
- **Integration Tests**: Create test suites for feature interactions
  - Generate 2-3 test cases per suite
  - Test component interactions and API integration
- **E2E Tests**: Create 1-2 critical user flow tests
- **Error Handling Tests**: Add tests for common error scenarios
- **Performance Tests**: Add load time and memory tests
- **Accessibility Tests**: Add keyboard navigation and screen reader tests
- **Test Data**: Define valid and invalid test data sets

### 5. Generate spec.md
// turbo
Create `spec.md` based on the template at `product/features/_TEMPLATE/spec.md`.

**Content mapping:**
- **Feature ID**: Use story ID
- **Feature Title**: Use story title
- **Epic**: Extract epic number from story ID
- **Story**: Reference the story ID
- **Status**: Set to "PROPOSED"
- **Confidence Level**: Set to "MEDIUM"
- **Priority**: Infer from story context (default: "HIGH")
- **Executive Summary**: Create 2-3 sentence summary from story description
- **Problem Statement**: Extract from story context
- **Feature Description**: Use story description and requirements
- **Scope**: Define in-scope and out-of-scope items based on story
- **Technical Architecture**: Infer from story requirements
  - Identify components, data models, API endpoints
- **User Experience**: Reference story user flows
- **Acceptance Criteria**: Reference the acceptance-criteria.md file
- **Dependencies**: Identify technical and feature dependencies
- **Risks and Mitigations**: Reference the risks.md file
- **Success Metrics**: Define measurable success criteria
- **Implementation Approach**: Outline phases if applicable
- **Timeline**: Estimate based on story complexity
- **Resources**: List required team roles

### 6. Generate risks.md
// turbo
Create `risks.md` based on the template at `product/features/_TEMPLATE/risks.md`.

**Content mapping:**
- **Feature**: Use story title
- **Feature ID**: Use story ID
- **Story**: Reference the story ID
- **Risk Assessment Date**: Use current date
- **Technical Risks**: Identify 2-3 technical risks
  - Example: Integration complexity, performance bottlenecks, browser compatibility
  - For each risk: ID, description, probability, impact, mitigation strategy
- **Performance Risks**: Identify 1-2 performance risks
  - Example: Load time, memory usage, scalability
- **Security Risks**: Identify 1-2 security risks if applicable
  - Example: Data validation, authentication, authorization
- **Integration Risks**: Identify 1-2 integration risks if applicable
  - Example: API availability, third-party service dependencies
- **Business Risks**: Identify 1-2 business risks if applicable
  - Example: User adoption, market fit
- **Risk Summary Matrix**: Create table with all identified risks
- **Risk Monitoring Plan**: Define monitoring schedule and escalation criteria

### 7. Generate implementation_tasks_phase1.md through implementation_tasks_phase4.md
// turbo
Create 4 implementation task files based on the template at `product/features/_TEMPLATE/implementation_tasks.md`.

**File naming:**
- `implementation_tasks_phase1.md` - Architecture & Setup
- `implementation_tasks_phase2.md` - Database & Backend Integration
- `implementation_tasks_phase3.md` - Core Implementation
- `implementation_tasks_phase4.md` - Testing & Validation + Documentation

**Content mapping for each phase:**
- Keep the pre-implementation checklist only in phase1.md
- Distribute the 7 phases from the template across 4 files:
  - **Phase 1 file**: Pre-Implementation Checklist + Phase 1 (Architecture & Setup)
  - **Phase 2 file**: Phase 2 (Database & Backend Integration)
  - **Phase 3 file**: Phase 3 (Core Implementation)
  - **Phase 4 file**: Phase 4 (Testing & Validation) + Phase 5 (Documentation & Cleanup) + Phase 6 (Verification & Confidence Scoring) + Phase 7 (Deployment Preparation) + Rollback Plan
- Customize tasks based on story requirements
- Maintain all sections: task descriptions, verification steps, commands
- Keep the task dependencies legend and verification commands in phase1.md

### 8. Update FEATURE_STATUS.json
// turbo
Add the new feature to `product/FEATURE_STATUS.json` with initial status.

**Entry format:**
```json
{
  "featureId": "<story-id>",
  "name": "<feature-title>",
  "slug": "<feature-slug>",
  "status": "SPECIFIED",
  "completionPercentage": 0,
  "createdDate": "<YYYY-MM-DD>",
  "lastModified": "<YYYY-MM-DD>",
  "description": "<brief-description>",
  "epic": <epic-number>,
  "story": <story-number>
}
```

### 9. Verify All Files Created
// turbo
Verify that all files were created successfully and contain expected content.

**Verification checklist:**
- [ ] Feature directory exists at `product/features/<feature-slug>/`
- [ ] All 8 files exist (acceptance-criteria.md, test-scenarios.md, spec.md, risks.md, implementation_tasks_phase1-4.md)
- [ ] Each file contains proper frontmatter and structure
- [ ] Feature entry added to FEATURE_STATUS.json
- [ ] All template placeholders replaced with story-specific content
- [ ] Cross-references between files are correct (e.g., spec.md references acceptance-criteria.md)

### 10. Display Summary
// turbo
Display a summary of what was created.

**Summary output:**
```
✅ Feature Created: <feature-title>
📁 Location: product/features/<feature-slug>/
📋 Files Created:
   - acceptance-criteria.md
   - test-scenarios.md
   - spec.md
   - risks.md
   - implementation_tasks_phase1.md
   - implementation_tasks_phase2.md
   - implementation_tasks_phase3.md
   - implementation_tasks_phase4.md

📊 Status: SPECIFIED
🔗 Story ID: <story-id>

Next Steps:
1. Review the generated files in product/features/<feature-slug>/
2. Customize content as needed for your specific requirements
3. Update FEATURE_STATUS.json if status should change
4. Run /smart-implementation <story-id> to start implementation
```

---

## Notes

- All files are generated from templates in `product/features/_TEMPLATE/`
- Content is customized based on story information
- Files respect the specified format and structure
- Feature is marked as "SPECIFIED" and ready for implementation
- Use `/smart-implementation` workflow to begin implementation after feature creation
