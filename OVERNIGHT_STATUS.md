# Overnight status — MCP billing auth

**Branch:** `feat/mcp-billing-auth`  
**Updated:** 2026-08-08

## Verdict

Phases **0** and **1** green. Continuing Phase 2+.

## Stripe mode (important)

You chose **live** Stripe (`rk_live_` + `pk_live_` + live £3 price `price_1U1x2t…`).  
Automated tests do **not** complete Checkout payments. Manual clicks on **Get MCP Access** can charge a real card.

## Phase 0 — PASS

- `node tools/scripts/verify-billing-infra.js` → PASSED  
- Live price: GBP **£3.00**/month active  
- KV round-trip OK  
- Billing env synced to Vercel **Preview** + **Production**  
- `MCP_AUTH_REQUIRED`: Preview `true`, Production `false` (open MCP until you cut over)

Note: `STRIPE_PRICE_ID` must be a `price_…` id (not `prod_…`). Corrected to the £3 price under product `AAF MCP Access`.

## Phase 1 — PASS

- `api/lib/mcp-auth.ts` + gate on `api/mcp.ts`  
- `MCP_AUTH_REQUIRED=true node --test tools/tests/mcp-auth.test.js` → 5/5  
- Seed helper: `node tools/scripts/seed-test-mcp-key.js`

## Next

Phase 2: Checkout + webhook + success UI + home/tools CTAs  
Phase 3: Magic link + manage-access  
Phase 4: Docs + local review handoff  

Still **no merge to main**. Production MCP stays open until you approve cutover.
