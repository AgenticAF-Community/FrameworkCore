# AAF MCP Server

One MCP server exposes both **framework tools** (`aaf_lookup`, `aaf_checklist`, `aaf_pillars_summary`) and **skills** (`aaf_get_skill`). Content is read from the repo (`docs/`, `tools/skills/`); the server is read-only and does not return secrets.

## Tools

| Tool | Description |
|------|-------------|
| **aaf_lookup** | Look up a term or topic in the AAF framework docs. Returns matching doc names and an excerpt. |
| **aaf_checklist** | Return the AAF architecture review checklist (pre-production readiness). Optional `kind`: `"review"` or `"design"`. |
| **aaf_pillars_summary** | Short summary of the six pillars and cross-cutting foundations (context optimization, autonomy & outcome governance). |
| **aaf_get_skill** | Return full content of an AAF skill. `skillId`: `aaf-architecture-review`, `aaf-security`, `aaf-epistemic-gates`, `aaf-cost-context`. |

## Option 1: Local stdio (most secure, recommended)

Run the server on your machine; Cursor (or another client) connects via stdio. No network, no auth surface.

**Setup**

1. From repo root:
   ```bash
   cd tools/mcp-server && npm install && node index.js
   ```
2. In Cursor, add to your MCP config (e.g. `.cursor/mcp.json` or Cursor Settings → MCP):
   ```json
   {
     "mcpServers": {
       "aaf": {
         "command": "node",
         "args": ["/absolute/path/to/AAF-Project/tools/mcp-server/index.js"],
         "cwd": "/absolute/path/to/AAF-Project"
       }
     }
   }
   ```
   Use the real path to your repo. The server resolves `docs/` and `tools/skills/` relative to the repo root (one level up from `tools/mcp-server`).

**Why this is most secure:** The server only has access to what your process can read (local files). No tokens, no public endpoint, no third-party access.

## Option 2: Vercel (public deployment)

The repo includes an API route at **`api/mcp.ts`** for Streamable HTTP on Vercel. The same four tools are exposed. Optional API-key auth: set `MCP_API_KEY` in Vercel and send `Authorization: Bearer <key>`.

**Deployment**

1. Ensure root `package.json` includes dependencies used by `api/mcp.ts` (e.g. `mcp-handler`, `@modelcontextprotocol/sdk`, `zod`). Run `npm install` at repo root.
2. Deploy to Vercel as usual (static site from `website/build` plus serverless functions from `api/`).
3. MCP endpoint: `https://<your-project>.vercel.app/api/mcp` (Streamable HTTP).

**Auth (optional)**

- If `MCP_API_KEY` is set, clients can send `Authorization: Bearer <MCP_API_KEY>`; `withMcpAuth` will accept it and treat the request as authorized.
- If `MCP_API_KEY` is not set, auth is skipped and the handler still runs (no required auth by default).
- For stricter access, set `required: true` in `api/mcp.ts` and configure OAuth or API keys as needed.

**Security on Vercel**

- Use **Vercel Firewall** (WAF, rate limiting, DDoS) and **Deployment Protection** for preview URLs.
- Keep tools read-only; no secrets in responses; validate/sanitize inputs; no client-controlled URLs (no SSRF).
- Scope: only AAF tools and skill getter are exposed.

## Option 3: Private network (e.g. VPC)

Run the MCP server (or an HTTP adapter that wraps the same tools) inside a private subnet. Clients reach it over internal HTTPS; no public internet. Harden with TLS, optional API key or mTLS, rate limiting, and read-only data source. Implementation is environment-specific; use the same tool logic as in `index.js` or `api/mcp.ts`.

## Content source

- **Framework:** `docs/*.md` (whitepaper).
- **Skills:** `tools/skills/<skillId>/SKILL.md` for `aaf-architecture-review`, `aaf-security`, `aaf-epistemic-gates`, `aaf-cost-context`.

The whitepaper remains the single source of truth; the MCP server serves it in programmatic form.

## References

- [Deploy MCP servers to Vercel](https://vercel.com/docs/mcp/deploy-mcp-servers-to-vercel)
- [MCP security best practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices)
- AAF skills index: [tools/skills/README.md](../skills/README.md)
