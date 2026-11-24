# Global AI Collective — Free-first routing

## Design principles

- Never make a paid inference request automatically.
- Prefer providers and model variants whose published inference price is exactly zero.
- Treat free tiers as conditional capacity, not an unlimited entitlement.
- Keep provider credentials server-side only.
- Record which provider/model answered each specialist step.
- If an optional provider is unavailable, fall back to the included Cloudflare Workers AI binding.
- If every free route is unavailable, fail clearly; never silently switch to paid inference.

## Current routing

1. Cloudflare Workers AI is the included primary/fallback route using Llama 3.3 70B Instruct.
2. Optional OpenRouter Free routing is enabled only when the server-side `OPENROUTER_API_KEY` is present.
3. The router discovers models from OpenRouter's live model catalog and accepts only IDs ending in `:free` whose prompt and completion prices are both zero.
4. It tries a small set of eligible free models. If they fail or are rate-limited, it falls back to Cloudflare Workers AI.
5. The task activity feed records provider/model selection.

OpenRouter's free plan has published request limits (currently 50 requests/day on the free plan); model availability and limits can change. See https://openrouter.ai/pricing.

## Optional setup

To add OpenRouter Free capacity, create an account, create an API key, and add this Vercel project environment variable as a server-only secret:

- `OPENROUTER_API_KEY`

Do not use a `NEXT_PUBLIC_` prefix. Add it to Preview first, then redeploy Preview. The Worker must receive it as a Cloudflare Worker secret named `OPENROUTER_API_KEY` for the optional route to activate. No paid credits or automatic top-ups should be enabled.

Do not paste the key into chat or commit it to GitHub.

## Not yet implemented

- Multi-provider Gemini/Groq/NVIDIA/Mistral adapters
- Local self-hosted inference node
- Model benchmarking and task-specific ranking
- Shared public/community model pool
- Durable per-provider quota ledger
- Distributed consensus and independent verifier scoring

These require separate provider credentials, compute, and/or infrastructure. They must be added with explicit zero-cost checks and provider terms review.
