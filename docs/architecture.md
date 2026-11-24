# Architecture

## System boundary

AI Operations HQ is a control plane for owner-directed work. Connected websites and repositories are external workspaces; they are not silently absorbed into this repository.

## Main components

1. **Owner Console** — natural-language task input, reference/file uploads, task status, plans, approvals, handoffs, test evidence, and artifacts. Responsive on mobile and desktop.
2. **Orchestrator** — converts instructions into structured briefs; inspects target projects; plans and delegates; tracks tool calls, retries, blockers, approvals, and acceptance criteria; reports only verified outcomes.
3. **Specialist roles** — CEO Orchestrator, Research Strategist, System Architect, Product Planner, Software Developer, Database Engineer, Automation Engineer, UI/UX Designer, Quality Engineer, Security Engineer, Performance Optimizer, and Independent Auditor. Select only the roles needed for each task.
4. **Tool adapters** — GitHub, deployment, browser automation, database, and private artifact storage.
5. **Execution workspace** — isolated branch/workspace, project-specific checks, preview environment, and recorded base commit.
6. **Memory and evidence** — task history, agent handoffs, decisions, owner corrections, artifacts, test runs, logs, screenshots, and deployment identifiers.

## Task states

queued -> inspecting -> planning -> awaiting_approval -> executing -> testing -> repairing -> verifying -> completed

Other states: blocked, cancelled, failed. Approval may be skipped only for reversible, low-risk actions within configured permissions that do not incur costs or affect production.

## Data principles

- Every task has an owner and target project.
- Every tool action is associated with a task/run and actor.
- Artifacts are private by default.
- Memory retains provenance and last-verified time.
- Secrets live only in protected environment variables or a secret manager.
- Authorization is enforced server-side, not only in the UI.
