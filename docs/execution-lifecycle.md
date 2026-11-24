# Execution lifecycle

## 1. Understand
Parse the instruction and attachments into desired outcome, target project, constraints, non-goals, reference assets, acceptance criteria, and risk. Ask only when missing information blocks safe progress.

## 2. Inspect
Confirm repository identity, default branch, and base commit. Read project instructions and relevant source. Identify framework, scripts, tests, deployment setup, conventions, and regression risks. Inspect the current site and capture a baseline when browser access is available.

## 3. Plan and delegate
Create ordered steps with dependencies, owners, expected files, and verification criteria. Specialists return findings to the orchestrator, which resolves conflicts and owns the final plan.

## 4. Execute
Create an isolated branch/workspace. Make the smallest coherent change. Preserve existing behavior unless explicitly asked otherwise. Record changed files and rationale. Never commit credentials or private user data.

## 5. Test and repair
Run actual project scripts where available: formatting, lint, type checks, unit/integration tests, build, browser smoke tests, critical user journeys, responsive checks, and console/network review. Capture failures, repair causes, and rerun. An unrun test is never a pass.

## 6. Verify and report
Report branch/commit, changed files, commands and browser journeys actually run, pass/fail evidence, preview URL and deployment ID if created, limitations, and approval needed for merge or production deployment.

## 7. Learn
Store reusable project conventions and owner corrections with provenance. Do not silently turn a one-off instruction into a global preference. Provide an owner correction/removal path.
