# GitHub App connection setup

The GitHub integration is disabled until the owner configures the server-only environment variables and installs the App. No credentials are committed to this repository.

## What is implemented

- Owner must already be signed in to Operations HQ.
- The connect route validates the Supabase access token against Supabase Auth before starting OAuth.
- OAuth state is cryptographically random and signed; the callback is bound to the initiating Supabase owner.
- GitHub access tokens and owner-binding cookies are Secure, HttpOnly, SameSite=Lax cookies.
- Every GitHub API route checks the current Supabase owner against the signed owner cookie.
- The token is never returned to browser JavaScript.
- The first milestone only lists GitHub App installations and repositories. It does not edit files, create branches, open PRs, run workflows, or deploy.

## 1. Create the GitHub App

In GitHub: Settings → Developer settings → GitHub Apps → New GitHub App.

Use:
- App name: AI Operations HQ
- Homepage URL: the current Vercel Preview URL
- Callback URL: the exact current Preview URL followed by `/api/github/callback`
- Enable **User authorization (OAuth) during installation**.
- Disable webhook delivery until a verified webhook handler is implemented.
- Install only on repositories the owner explicitly selects.

Least-privilege permissions for this read-only milestone:
- Metadata: Read-only (required)
- Contents: No access for the initial repository-listing test; grant Read-only only when source inspection is added.
- Pull requests: No access for the initial repository-listing test.
- Checks and Actions: No access for the initial repository-listing test.
- Administration, Secrets, and Webhooks: No access.

The integration uses GitHub App user authorization for this milestone. It does not use a private key or installation access token yet.

## 2. Configure Vercel Preview environment variables

The Vercel project currently has no environment variables configured. Add the following to **Preview only** first:

- `SUPABASE_URL` — Supabase Project URL
- `SUPABASE_ANON_KEY` — Supabase publishable/anon key
- `GITHUB_APP_CLIENT_ID` — GitHub App client ID
- `GITHUB_APP_CLIENT_SECRET` — GitHub App client secret
- `GITHUB_APP_CALLBACK_URL` — exact Preview callback URL registered in the GitHub App
- `GITHUB_APP_STATE_SECRET` — a unique random secret, at least 32 characters

Use values from Supabase Project Settings → API. Do not use the service-role key. Never add a `NEXT_PUBLIC_` prefix to these variables. Do not paste secrets into chat, GitHub files, or screenshots.

After setting Preview variables, redeploy the Preview branch.

## 3. Install and test

1. Install the GitHub App only on the intended test repository.
2. Open the Vercel Preview and sign in to Operations HQ.
3. In the GitHub connection panel, choose **Connect GitHub**.
4. Approve the GitHub App authorization.
5. Confirm the connected account and repository list appear.
6. Disconnect and verify the list disappears.
7. Repeat with a different Operations HQ account if multi-user use is planned; owner binding should prevent cross-account access.

## 4. Current API routes

- `POST /api/github/connect` — validates the signed-in Operations HQ owner and starts OAuth
- `GET /api/github/callback` — validates signed OAuth state, exchanges the code server-side, and stores owner-bound HttpOnly cookies
- `GET /api/github/status` — reports connection state without returning credentials
- `GET /api/github/installations` — lists App installations for the signed-in owner
- `GET /api/github/repos?installation_id=...` — verifies the installation belongs to the connected GitHub account before listing repositories
- `POST /api/github/disconnect` — clears the current browser's GitHub authorization cookies

## 5. Next approval-gated milestone

After the read-only connection passes end-to-end testing, add:
- GitHub repository contents read access
- isolated branch creation
- proposed file changes and diffs
- owner approval records before any write
- PR creation and CI status inspection
- production deployment only after a separate explicit approval

Do not grant write permissions until the read-only connection and owner-binding tests pass.
