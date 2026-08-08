# API (serverless)

- **`mcp.ts`** — AAF MCP server (Streamable HTTP) for Vercel.
- **`stats.ts`** — Public stats for the homepage: GitHub repo, MCP tool calls, posture reports, pillar averages. Reads from Vercel Blob when available (see below).
- **`refresh-stats.ts`** — Cron handler: fetches GitHub + `AAF_STATS_JSON`, writes to Vercel Blob. Invoked by Vercel Cron (see `vercel.json`).
- **`lib/`** — Shared billing/auth helpers (`config`, `kv`, `keys`, `stripe`, `mcp-auth`) for paid MCP access (£3/mo, 1,000 **tool calls** hard cap).

## MCP billing env (names only)

Set these in local `.env` and Vercel. **Production must keep `MCP_AUTH_REQUIRED=true`** (fail-closed: otherwise MCP returns 503).

| Variable | Role |
|----------|------|
| `STRIPE_SECRET_KEY` | Stripe secret (`sk_test_` until live) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable (optional for Checkout Sessions) |
| `STRIPE_PRICE_ID` | £3/month subscription price |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verify |
| `STRIPE_CUSTOMER_PORTAL_URL` | Customer portal login link |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Upstash Redis REST |
| `AUTH_SECRET` | HMAC for API-key hashes + magic links |
| `APP_BASE_URL` | Checkout success/cancel + magic-link base |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Magic-link email (`support@agenticaf.io`) |
| `MCP_AUTH_REQUIRED` | `true` required in production; local-only `false` opens bypass for development |

Verify locally: `node tools/scripts/verify-billing-infra.js`

## Stats and cron (get homepage stats live)

1. **Vercel Blob** — In the Vercel project: Storage → Create → Blob. This sets `BLOB_READ_WRITE_TOKEN` for the project.
2. **CRON_SECRET** — In Project → Settings → Environment Variables, add `CRON_SECRET` (e.g. a 16+ character random string). Vercel sends it as `Authorization: Bearer <CRON_SECRET>` when invoking the cron; the refresh endpoint rejects requests without it.
3. **Cron schedule** — `vercel.json` runs `/api/refresh-stats` daily at 12:00 UTC (`0 12 * * *`). On Pro you can change to hourly (e.g. `0 * * * *`).
4. **Optional: MCP/posture numbers** — Add env var **`AAF_STATS_JSON`** (a JSON string). The cron merges it with live GitHub and writes to Blob. Example:
   ```json
   {"mcpToolCalls": 1200, "postureReports": 45, "pillarAverages": {"security": 62, "reliability": 58, "cost": 41, "operational-excellence": 70, "performance": 65, "sustainability": 52, "context-optimization": 55, "autonomy-governance": 48}}
   ```

After the first cron run (or a manual GET to `/api/refresh-stats` with `Authorization: Bearer <CRON_SECRET>`), `GET /api/stats` serves from Blob so the homepage shows up-to-date figures. Without Blob, the stats API falls back to live GitHub + `AAF_STATS_JSON`.

**MCP endpoint:** `https://www.agenticaf.io/api/mcp` (Streamable HTTP). Requires `Authorization: Bearer aaf_live_…`.

**Auth:** Subscriber Bearer keys via `gateMcpRequest` only. Production-like deploys (`VERCEL_ENV=production` or `APP_BASE_URL` hosting agenticaf.io) refuse to serve MCP if `MCP_AUTH_REQUIRED` is not `true` (503). Local/preview may set `MCP_AUTH_REQUIRED=false` for an explicit open bypass — not a production mode.

**Metering:** Only JSON-RPC `tools/call` counts toward the monthly cap. `initialize` and `tools/list` do not. Pre-check rejects when already at cap; the crossing call may consume the last unit via atomic incr.

**Tool surface (19):** guide/list/docs (`aaf_guide`, `aaf_list_skills`, `aaf_list_docs`, `aaf_get_doc`), core lookup/skills, workloads (`aaf_list_workloads`, `aaf_workload_guidance`), design/trade-offs/ACC, build, review, pillar guidance, security scan.

**Paid access:** £3/month · 1,000 tool calls · hard cap. Checkout: `GET /api/stripe/checkout`. After purchase, keys are shown once at `/access/success`. Manage/rotate via `/manage-access` (Resend magic link, subject `AAF MAGIC LINK FOR SIGN IN`).

Send `Authorization: Bearer <aaf_live_…>` on every MCP request.

Stripe webhook: `POST /api/stripe/webhook` (raw body + `stripe-signature`).

### Google Antigravity IDE (and other stdio-only clients)

Antigravity uses **`mcp_config.json`** with **`command` + `args`** (local stdio), not a bare `url` field like Cursor. Use the community **`mcp-remote`** proxy so the IDE talks to the hosted AAF server over HTTP:

1. Open **Agent panel → Manage MCP Servers → View raw config** (or edit `mcp_config.json`).
2. Merge this under `mcpServers` (requires **Node.js 18+** on the machine):

```json
{
  "mcpServers": {
    "aaf": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://www.agenticaf.io/api/mcp",
        "--transport",
        "http-first"
      ]
    }
  }
}
```

`http-first` matches the AAF server’s Streamable HTTP transport (mcp-remote’s default is also `http-first`; the flag makes intent explicit).

Add your subscriber Bearer key (avoid spaces after `:` in `args` on some Windows clients; put the full value in `env`):

```json
{
  "mcpServers": {
    "aaf": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://www.agenticaf.io/api/mcp",
        "--transport",
        "http-first",
        "--header",
        "Authorization:${AAF_MCP_AUTHORIZATION}"
      ],
      "env": {
        "AAF_MCP_AUTHORIZATION": "Bearer aaf_live_YOUR_KEY"
      }
    }
  }
}
```

Save, restart Antigravity (or reload MCP). Ask the agent what MCP tools are available; you should see `aaf_lookup`, `aaf_checklist`, etc.
