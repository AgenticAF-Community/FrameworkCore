# Overnight status — MCP billing auth

**Branch:** `feat/mcp-billing-auth`  
**Updated:** 2026-08-08  
**Verdict:** Phases **0–4 complete** on the feature branch. **Not merged to main.** Production MCP auth **not** enabled.

## Stripe mode

**Live** Stripe (`rk_live_` + `pk_live_` + live price `price_1U1x2t…` = **£3/mo GBP**).  
Automated tests create Checkout Sessions but **do not** complete payment. Clicking **Get MCP Access** and paying will charge a real card.

## Phase results

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Infra | PASS | `verify-billing-infra.js`; KV OK; Vercel Preview+Production env synced |
| 1 MCP auth | PASS | Bearer + 1000 hard cap; 5/5 tests |
| 2 Checkout/CTAs | PASS | Checkout URL, webhook/reveal, home+tools CTAs; website build OK |
| 3 Magic link | PASS | Manage-access + rotate; Resend subject locked; website build OK |
| 4 Docs/handoff | PASS | Application method + api README; this file |

## `MCP_AUTH_REQUIRED`

- Local `.env`: `true` (for your review)
- Vercel **Preview**: `true`
- Vercel **Production**: `false` (hosted MCP still open until you cut over)

## Local review (you)

```bash
git checkout feat/mcp-billing-auth
npm install
cd website && npm start
# separate terminal — API routes:
npx vercel dev
```

Then click:

1. Home → **Get MCP Access** (live Checkout — real money if you pay)
2. Tools → **Get MCP Access** / **Manage access**
3. After a test purchase: `/access/success` key once; `/manage-access` rotate

Webhook for live Stripe: point a Stripe webhook to  
`https://www.agenticaf.io/api/stripe/webhook` (or your Preview URL) for  
`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.  
Update `STRIPE_WEBHOOK_SECRET` if you create a new endpoint.

## After you approve

1. Confirm webhook + one live purchase end-to-end  
2. Set Production `MCP_AUTH_REQUIRED=true`  
3. Merge PR to `main`  
4. Rotate any secrets that appeared in chat/screenshots if needed  

## Commits on branch

- `phase-0/1: billing infra + MCP auth quota gate`
- `phase-2: checkout, webhook reveal, and MCP access CTAs`
- `phase-3: magic link manage-access and key rotate`
- `phase-4: docs and local review handoff` (this update)
