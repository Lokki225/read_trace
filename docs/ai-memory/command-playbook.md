# Command Playbook

This document maintains a collection of working commands that have been tested and proven to work in the read_trace project environment.

## Format

Each command entry includes:
- **Command Name**: Brief descriptive name
- **Description**: What the command does
- **Full Command**: Complete command syntax
- **When to Use**: Scenarios where this command is appropriate
- **Expected Output**: What successful execution looks like
- **Common Variations**: Alternative forms of the command
- **Prerequisites**: Required setup or dependencies

---

## Command Template

```
### [Command Name]

**Description**: [What it does]

**Full Command**:
\`\`\`bash
[complete command syntax]
\`\`\`

**When to Use**: [Scenarios]

**Expected Output**: [Success output]

**Common Variations**:
- [Variation 1]
- [Variation 2]

**Prerequisites**: [Required setup]

**Notes**: [Additional context]
```

---

## Project Commands

### Run Tests

**Description**: Execute the project test suite

**Full Command**:
```bash
npm test
```

**When to Use**: After implementing features, before committing code

**Expected Output**: Test results showing pass/fail status

**Common Variations**:
- `npm test -- --watch` - Run tests in watch mode
- `npm test -- --coverage` - Run tests with coverage report

**Prerequisites**: Node.js and npm installed, dependencies installed via `npm install`

**Notes**: Tests should pass before marking tasks complete

---

### Install Dependencies

**Description**: Install project dependencies

**Full Command**:
```bash
npm install
```

**When to Use**: After cloning repository or when dependencies change

**Expected Output**: Dependencies installed in node_modules folder

**Common Variations**:
- `npm ci` - Clean install for CI/CD environments
- `npm install --save-dev [package]` - Install dev dependency

**Prerequisites**: Node.js and npm installed

**Notes**: Always run before starting development

---

### Build Project

**Description**: Build the Next.js project for production

**Full Command**:
```bash
npm run build
```

**When to Use**: Before deployment, to verify build succeeds

**Expected Output**: Build artifacts in .next folder

**Common Variations**:
- `npm run dev` - Start development server
- `npm run start` - Start production server

**Prerequisites**: Dependencies installed

**Notes**: Build must succeed before deployment

---

## Workflow Commands

### Run Dev Story Workflow

**Description**: Execute the dev-story workflow for a specific story

**Full Command**:
```bash
/bmad-bmm-dev-story [story-number]
```

**When to Use**: When implementing a story from the sprint

**Expected Output**: Story implementation workflow begins

**Common Variations**:
- `/bmad-bmm-dev-story 1-3` - Develop story 1-3

**Prerequisites**: Story file exists and is marked ready-for-dev

**Notes**: Workflow continues until story is complete

---

### Run Code Review

**Description**: Execute code review workflow for a completed story

**Full Command**:
```bash
/bmad-bmm-code-review [story-file-path]
```

**When to Use**: After story implementation is complete and marked for review

**Expected Output**: Code review findings and recommendations

**Common Variations**:
- Use different LLM than implementation agent for fresh perspective

**Prerequisites**: Story marked as "review" status

**Notes**: Recommended to use different LLM than dev agent

---

## Git Commands

### Commit Changes

**Description**: Commit changes to git repository

**Full Command**:
```bash
git add .
git commit -m "[story-key]: [description]"
```

**When to Use**: After completing a story task

**Expected Output**: Commit hash and summary

**Common Variations**:
- `git add [specific-file]` - Add specific file only
- `git commit --amend` - Modify previous commit

**Prerequisites**: Git initialized and configured

**Notes**: Use story key in commit message for traceability

---

## File Operations

### Create Directory Structure

**Description**: Create nested directory structure

**Full Command**:
```bash
mkdir -p [path/to/directory]
```

**When to Use**: When creating new folder hierarchies

**Expected Output**: Directories created

**Common Variations**:
- `mkdir [single-directory]` - Create single directory

**Prerequisites**: Write permissions in parent directory

**Notes**: Use `-p` flag to create parent directories automatically

---

**Last Updated**: 2026-02-09
**Total Commands**: 8
**Status**: Active
