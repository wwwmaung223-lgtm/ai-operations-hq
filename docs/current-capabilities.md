# Current Capabilities and Verification Boundaries

Last reviewed: 2026-11-26

## Repository application

- Next.js owner workspace with responsive UI.
- Email/password authentication UI and API client.
- Task command interface, live handoff feed, specialist status cards, and Results Vault view.
- File selection and upload client flow, including passing private storage references to task execution.
- Consistent API response parsing for JSON and non-JSON error responses.

## Connected Cloudflare Worker runtime

The currently deployed `ai-team-live` Worker exposes:

- `/health`
- `/api/auth/login`, `/api/auth/signup`, `/api/auth/user`
- `/api/collective/status`, `/api/agents`, `/api/tasks`, `/api/results`
- `/api/upload`, `/api/signed`
- `/api/image/analyze`, `/api/image/edit`, `/api/image/generate`
- `/api/run` (NDJSON task event stream)

The Worker uses Supabase Auth, Postgres and private Storage, Cloudflare Workers AI, and an OpenRouter-backed model helper.

## Important execution boundary

The 12 specialist roles currently run as sequential model calls with role prompts and persisted handoffs. The task runner does **not** yet give those model calls direct GitHub, filesystem, browser, database-migration, or Vercel tools. A model response is advice or a proposed action unless a separate tool execution event confirms the action.

The current image-generation endpoint is an actual Worker tool path. The generic software-development role is not yet an autonomous code-editing agent.

## Verification status

- Vercel Preview for the latest typed auth/file-reference client changes: READY; homepage HTTP check: 200.
- GitHub Actions CI on the latest code commit: lint, TypeScript check, and production build all passed.
- GitHub source checks confirm the response parser and upload-reference wiring are present.
- Sign-in, sign-up, private file upload, and a full 12-agent task have not yet been end-to-end exercised with a real owner account.
- PDF and ZIP attachments are stored but not extracted by the task runner.
- Production has not been changed by the preview branch.

## Next engineering gates

1. [x] Run CI on every pull request and relevant branch push (lint, typecheck, production build).
2. Add owner-approved GitHub App access with least-privilege repository permissions.
3. Implement branch-scoped file read/write operations behind approval records.
4. Run project-specific lint, typecheck, build, and browser tests in an isolated workspace.
5. Persist tool calls, approvals, test logs, and artifacts with task/run identifiers.
6. Keep production deployment behind a separate explicit owner approval.
