# Security Review: FrameworkCore Repo — Lean & Minimal Exposure

**Goal:** The FrameworkCore repo should contain only framework content and the minimum needed to build/serve the framework site. Deploy tooling, secrets, and internal scripts should not be in the repo before it goes public.

---

## 1. What belongs in the public FrameworkCore repo (keep)

| Path | Purpose |
|------|---------|
| `docs/` | Whitepaper sections — core framework content |
| `docs/assets/` | Images used in the whitepaper (infographics, logo for PDF) |
| `website/` | Docusaurus site (framework docs + landing) |
| `website/src/`, `website/static/img/` | Site UI and public assets (no PDF if built by CI) |
| `LICENSE` | CC BY-NC 4.0 |
| `README.md` | Project overview, contributing, license |
| `CONTRIBUTING.md` | How to contribute |
| `.github/ISSUE_TEMPLATE/`, `PULL_REQUEST_TEMPLATE.md` | Community contribution flow |

**Optional in public repo:** A minimal `package.json` at root only if you want `npm run build` for the website; otherwise the website folder can be self-contained.

---

## 2. What should NOT be in the public repo (remove or exclude)

### 2.1 Secrets and deploy-only config

| Item | Risk | Action |
|------|------|--------|
| `.env` | Contains tokens (e.g. `vercel_token`, `GITHUB_TOKEN`). | Already in `.gitignore`. Never commit. |
| `.env.example` | Documents `vercel_token`, `AAF_SITE_PASSWORD`, `GITHUB_TOKEN`. | For public repo: remove or replace with a minimal example that only lists non-secret vars (e.g. `PDF_DOWNLOAD_URL`). Do not expose var names that imply secrets. |
| `scripts/deploy-vercel.sh` | Contains hardcoded Vercel token. | Already in `.gitignore`. Keep excluded. Do not add a copy without the token. |
| `.vercel/` | Project/org IDs. | Already in `.gitignore`. |

### 2.2 Deploy and build tooling (internal use)

| Item | Why exclude from “framework-only” repo |
|------|----------------------------------------|
| `vercel.json` | Vercel-specific build and project config. Deployment is an internal choice; the framework is host-agnostic. |
| `middleware.js` | Password protection for working-group access. When the repo is public, the live site may move to a different auth model or host; this is deploy config, not framework content. |
| `scripts/build-pdf.js`, `scripts/pdf-styles.css` | PDF build from docs. Useful but not part of “the framework”; could live in a separate internal or tooling repo. |
| Root `package.json` (with `build:pdf`, `md-to-pdf`) | Only used for local/CI PDF build. Not needed for someone who only reads or builds the website. |
| `.github/workflows/deploy.yml` | GitHub Pages deploy. If you standardize on Vercel, this is redundant; if you keep it, it uses `GITHUB_TOKEN` (safe) but reveals deploy strategy. For a lean “framework only” repo, consider removing or moving to an internal repo. |

### 2.3 Source assets and internal drafts

| Item | Why consider excluding |
|------|------------------------|
| `Img/` | Source images (e.g. for design). The built site uses `docs/assets/` and `website/static/img/`. Duplicates and large files increase repo size and aren’t needed to read or build the framework. |
| `Agentic Architecture Framework v1.3 Working Draft.md` | Single-file draft. If the source of truth is `docs/`, this can be removed or moved elsewhere. |
| `AAF Visual guidelines` | Internal branding. Not required for the framework text or site. |
| `website/static/pdf/` | ~31 MB generated PDF. Heavy for a repo; better generated in CI or hosted elsewhere and linked. |

---

## 3. Minimal exposure rules (before going public)

1. **No secrets or references to secrets**  
   - No `.env`, no tokens, no `vercel_token`, no `AAF_SITE_PASSWORD` in repo or in `.env.example` variable names that hint at secrets.  
   - Use a minimal `.env.example` with only non-sensitive vars (e.g. optional `PDF_DOWNLOAD_URL`), or omit it.

2. **No deploy-only automation in this repo**  
   - No Vercel project config (`vercel.json`), no password middleware (`middleware.js`), no deploy scripts.  
   - Option: move these to a separate private “deploy” or “infra” repo that pulls FrameworkCore as a submodule or dependency and deploys it.

3. **Framework = docs + site only**  
   - Repo contains: `docs/`, `website/` (Docusaurus), `LICENSE`, `README`, `CONTRIBUTING`, and minimal GitHub templates.  
   - Optional: single root `package.json` with a script that builds the website only (e.g. `cd website && npm ci && npm run build`), no PDF or deploy.

4. **No large generated or duplicate assets**  
   - No `website/static/pdf/` in repo (generate in CI or host elsewhere).  
   - Prefer a single set of images (e.g. `docs/assets/` + `website/static/img/` as needed) and drop `Img/` if it’s redundant.

5. **License and README match**  
   - README says CC BY-NC 4.0 and points to `LICENSE`; `LICENSE` file is CC BY-NC 4.0.

---

## 4. Recommended layout for “lean” public FrameworkCore

```
FrameworkCore/
  docs/                 # Whitepaper sections + docs/assets
  website/              # Docusaurus (source only; no generated PDF in repo)
  LICENSE
  README.md
  CONTRIBUTING.md
  .github/
    ISSUE_TEMPLATE/
    PULL_REQUEST_TEMPLATE.md
  .gitignore            # Standard (node_modules, .env, build, etc.)
```

**Not in repo:**  
`vercel.json`, `middleware.js`, `scripts/`, root `package.json` (or a minimal one without PDF/deploy), `.env.example` with secret var names, `Img/`, working draft single file, `website/static/pdf/`, `.vercel/`, `.env`, `deploy-vercel.sh`.

---

## 5. How to deploy the site if tooling lives elsewhere

- **Option A — Separate deploy repo:** A private repo (e.g. `AAF-Deploy` or `FrameworkCore-Deploy`) that clones or submodules FrameworkCore, adds `vercel.json`, `middleware.js`, and deploy scripts, and runs the Vercel (or other) deploy. FrameworkCore stays lean and public.
- **Option B — CI-only deploy from this repo:** Keep `vercel.json` and `middleware.js` in a **private** branch or in the repo but ensure `.env` and any script with tokens are never committed; use Vercel’s Git integration with env vars set in the dashboard. Before making the repo public, remove `vercel.json`, `middleware.js`, and deploy scripts from the default branch and rely on a separate deploy pipeline (e.g. from the private deploy repo).
- **Option C — Manual deploy from a local clone:** You keep a local (or private) copy that has the extra files; the public repo is the lean clone. You run `./scripts/deploy-vercel.sh` from the private copy only.

---

## 6. Immediate actions (before opening the repo)

1. **Confirm `.gitignore`**  
   Ensure it includes: `.env`, `.env.local`, `.env.*.local`, `.vercel`, `scripts/deploy-vercel.sh`, and that `scripts/deploy-vercel.sh` is not tracked (remove from index if it was ever committed: `git rm --cached scripts/deploy-vercel.sh`).

2. **Audit history for secrets**  
   If `.env` or `deploy-vercel.sh` (with token) was ever committed, rotate the Vercel token and any other secrets, and consider history rewrite (e.g. `git filter-repo`) or use GitHub’s secret scanning and invalidate exposed secrets.

3. **Thin `.env.example` for public repo**  
   Replace with only non-secret vars (e.g. `PDF_DOWNLOAD_URL=` and a short comment). Remove `vercel_token`, `AAF_SITE_PASSWORD`, `GITHUB_TOKEN` from the example.

4. **Update README**  
   Change “CC BY 4.0” to “CC BY-NC 4.0” to match the actual LICENSE.

5. **Decide where deploy and PDF tooling live**  
   Move `vercel.json`, `middleware.js`, `scripts/`, and (if desired) root `package.json` with PDF script to a private deploy repo or remove from the default branch before making FrameworkCore public.

---

## 7. Summary

- **Lean repo:** Only framework content (`docs/`, `website/` source), license, README, CONTRIBUTING, and minimal GitHub templates.
- **Minimal exposure:** No secrets, no deploy scripts with tokens, no Vercel/password config in the public repo; optional minimal `.env.example` without secret variable names.
- **Deploy:** Handled by a separate private repo or by CI using only dashboard-set env vars and no committed deploy scripts/tokens.
