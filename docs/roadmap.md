# Roadmap

This roadmap is planning, not a claim that features are already implemented.

## Phase 1 — Reliable foundation
- [x] Dedicated GitHub repository created and verified.
- [x] Product principles, architecture, execution lifecycle, and safety boundaries documented.
- [x] Runnable Next.js application scaffold and local development instructions.
- [ ] Environment variable template without real credentials.

## Phase 2 — Owner console and task records
- [x] Responsive owner workspace with task input and attachment UI.
- [x] Durable task, agent handoff, and artifact records (audit-grade tool event history remains open).
- [ ] Task timeline and approval queue.

## Phase 3 — Orchestration and tools
- [ ] Structured task planner and specialist handoffs.
- [ ] GitHub read/branch/write operations with scoped permissions.
- [ ] Isolated execution workspace.
- [x] Private artifact storage and retrieval for supported result types.

## Phase 4 — Verification loop
- [ ] Build/test runner with persisted logs.
- [ ] Browser automation and screenshots.
- [ ] Failure triage, repair, and retest loop.
- [ ] Independent audit before completion.

## Phase 5 — Deployment and learning
- [ ] Preview deployment integration.
- [ ] Explicit production approval gate.
- [ ] Searchable project memory with provenance.
- [ ] Owner feedback and correction workflow.
- [ ] Backups, recovery, observability, and operational hardening.


## Current implementation boundary

The connected Worker currently executes the 12 specialist roles as sequential model calls and persists handoffs. It does not yet provide those roles with GitHub write access, a filesystem execution workspace, browser automation, or an automated repair loop. See [current-capabilities.md](current-capabilities.md) for the live route inventory and verification status.
