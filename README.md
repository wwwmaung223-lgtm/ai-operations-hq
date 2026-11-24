# AI Operations HQ

An owner-directed AI operations system that turns natural-language instructions, reference images, and files into traceable work: inspect, plan, execute, test, repair, and report.

> **Current status:** Repository foundation and operating specifications only. Planned integrations must not be treated as implemented until present in code and verified.

## Product promise

The owner gives an instruction and optional references. The system should:
1. Understand the requested outcome and constraints.
2. Inspect the connected project before changing it.
3. Plan and delegate work to specialist agents.
4. Make changes in an isolated branch or workspace.
5. Run relevant checks and browser tests.
6. Repair failures and rerun checks.
7. Save task history, artifacts, decisions, and verified learnings.
8. Report what changed, what passed, and what remains unverified.

## Operating principles

- Evidence over claims: report actions and tests only when tool results confirm them.
- Protect existing work: inspect first, isolate changes, and preserve unrelated projects and data.
- Require owner approval for destructive changes, production deployments, external publication, paid usage, and security-sensitive changes.
- Use least-privilege credentials; never commit secrets or service-role keys.
- Retain useful project knowledge with provenance, timestamps, and correction history.
- Support mobile and desktop.
- Deliver incrementally and avoid regressions.

## Initial architecture

- Owner interface: chat, attachments, task timeline, approvals, and artifacts.
- Orchestrator: intent parsing, planning, delegation, and verification.
- Specialist agents: research, architecture, product, development, database, automation, design, QA, security, and performance.
- Tool adapters: GitHub, deployment, database, file storage, and browser automation.
- Execution workspace: isolated branch/workspace and preview environment.
- Memory and audit: task events, handoffs, decisions, knowledge, test evidence, and artifacts.

See docs/architecture.md, docs/execution-lifecycle.md, and docs/safety-and-approvals.md.

## Repository status

This commit establishes product requirements and engineering guardrails. It does not claim that the autonomous execution pipeline, browser testing, or production deployment integration is complete.

## Development

Runnable application setup will be added with the first application scaffold. Never add environment files, API keys, database secrets, or customer data to this public repository.
