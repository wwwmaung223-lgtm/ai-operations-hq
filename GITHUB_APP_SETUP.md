# GitHub App setup for AI Operations HQ

This integration is deliberately disabled until an owner creates and installs a GitHub App. No token, private key, or client secret is committed to this repository.

## 1. Create the GitHub App

In GitHub: Settings → Developer settings → GitHub Apps → New GitHub App.

Use:
- App name: AI Operations HQ
- Homepage URL: `https://ai-operations-hq-black.vercel.app`
- Callback URL: `https://ai-operations-hq-black.vercel.app/api/github/callback`
- Enable **User authorization (OAuth) during installation**.
- Disable webhook delivery until a verified webhook handler is implemented.
- Install only on repositories the owner explicitly selects.

Recommended repository permissions:
- Metadata: Read-only (required)
- Contents: Read and write (needed later for branch-based code changes)
- Pull requests: Read and write (needed later to open reviewable PRs)
- Checks: Read-only (for test status inspection)
- Actions: Read-only (for workflow run inspection)

Do not grant Administration, Secrets, or Webhooks permissions for this first milestone.

## 2. Configure Vercel environment variables

Add these as **server-only** Production and Preview environment variables in the `ai-operations-hq` Vercel project:
- `GITHUB_APP_CLIENT_ID` — GitHub App client ID
- `GITHUB_APP_CLIENT_SECRET` — GitHub App client secret

Never use a `NEXT_PUBLIC_` prefix for either value. Redeploy Preview after adding them.

## 3. Install the App

Install the App on only the intended repository (initially `wwwmaung223-lgtm/ai-operations-hq`). Complete the owner authorization flow from the Preview or Production site after the callback URL is configured for that exact host. GitHub App user tokens expire; reconnect when authorization expires.

## 4. Current API routes

- `GET /api/github/connect` — starts state-protected GitHub authorization
- `GET /api/github/callback` — exchanges the code server-side and stores the token in an HttpOnly cookie
- `GET /api/github/status` — reports connection state without returning credentials
- `GET /api/github/installations` — lists App installations for the connected owner
- `GET /api/github/repos?installation_id=...` — lists repositories accessible through that installation
- `POST /api/github/disconnect` — clears local authorization cookies

The access token is never returned to client JavaScript or written to task history. Repository listing is read-only. Code writes, branch creation, PR creation, builds, and deployment remain unimplemented and must be added as separate approval-gated capabilities.

## 5. Security notes

The callback validates a cryptographically random OAuth state cookie. The token is stored in a Secure, HttpOnly, SameSite=Lax cookie for up to eight hours. API routes call GitHub server-to-server and never expose the token. The current milestone does not yet bind a GitHub identity to a signed-in Operations HQ owner account; add that owner binding before enabling shared or multi-user repository operations.
