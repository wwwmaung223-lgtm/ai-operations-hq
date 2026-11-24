# Safety and approval policy

## Actions allowed within configured scope
Examples include reading repository files, analyzing references, drafting plans, creating task branches, editing files on those branches, and running local or preview checks, provided connected permissions allow them.

## Owner approval required
- Deleting or overwriting important data or files.
- Database migrations that can affect production data.
- Production deployments, domain/DNS changes, or external publishing.
- Merging to a protected/default branch.
- Enabling paid services, increasing usage, or creating billable resources.
- Changing authentication, access control, secrets, or security policies.
- Sending messages or taking actions outside the workspace on the owner's behalf.

## Credential handling
- Never commit API keys, access tokens, passwords, service-role keys, or environment files.
- Prefer short-lived, narrowly scoped credentials.
- Keep server secrets out of browser code and logs.
- Redact sensitive values from task history and artifacts.
- Do not ask the owner to paste secrets into chat.

## Change isolation and recovery
Inspect before editing. Record the base commit. Use a separate branch/workspace. Keep diffs reviewable. Preserve rollback information. Never modify unrelated repositories or databases. If scope is ambiguous, stop before making changes.

## Evidence and truthful reporting
A deployment response is not proof that a site works. A successful build is not proof that browser flows work. Report each verification layer separately and identify what was not tested.
