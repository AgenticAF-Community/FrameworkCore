# Overnight status — MCP billing auth

**Branch:** `feat/mcp-billing-auth`  
**Stopped:** Phase 0 automated test failed  
**Time:** 2026-08-08 (local)

## Verdict

**Blocked on Stripe.** Everything else needed for Phase 0 is green. Do not proceed to Phase 1 until Stripe verifies.

## What passed

| Check | Result |
|-------|--------|
| Branch `feat/mcp-billing-auth` | Ready |
| Deps (`stripe`, `@upstash/redis`, `resend`, `dotenv`) | Installed |
| `api/lib/{config,kv,keys,stripe}.ts` | Created |
| `tools/scripts/verify-billing-infra.js` | Created |
| `.env.example` + `api/README.md` | Updated |
| `AUTH_SECRET` | Present |
| `APP_BASE_URL` | Present |
| `RESEND_FROM_EMAIL` (`@agenticaf.io`) | Present |
| `RESEND_API_KEY` | Present (send-restricted key OK) |
| Upstash KV REST round-trip | **PASS** |
| Vercel project KV env (Preview/Production) | Present in project |

## What failed

```text
Stripe: Invalid API Key provided: sk_test_…0D2B
```

`STRIPE_SECRET_KEY` in local `.env` is **not a valid Stripe secret**.  
`STRIPE_PUBLISHABLE_KEY` looks like a real `pk_test_…` (different account prefix than the secret).  
`STRIPE_PRICE_ID` cannot be validated until the secret works.

## Unblock (you — ~2 minutes)

1. Open [Stripe Test API keys](https://dashboard.stripe.com/test/apikeys).
2. Copy the **Secret key** (`sk_test_…`) into local `.env` as `STRIPE_SECRET_KEY` (**Save the file**).
3. Confirm or create a **£3/month GBP** recurring price; put its id in `STRIPE_PRICE_ID`.
4. Optional: refresh `STRIPE_WEBHOOK_SECRET` from Developers → Webhooks (can wait until Phase 2).
5. Tell the agent to resume, or run:

```bash
node tools/scripts/verify-billing-infra.js
```

When that prints `PASSED`, Phase 0 can commit and Phases 1–4 continue.

## Intentionally not done overnight

- No merge to `main`
- Production `MCP_AUTH_REQUIRED` left unset/false
- No live Stripe keys
- Phases 1–4 not started (stop-on-failure rule)

## Local review later (after green Phase 4)

1. `cd website && npm start`
2. `vercel dev` (or deploy Preview) for `/api/*`
3. Click **Get MCP Access** / manage flow
4. Only then set Production `MCP_AUTH_REQUIRED=true`
