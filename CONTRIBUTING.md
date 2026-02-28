# Contributing to the Agentic Architecture Framework

Thank you for contributing. This guide is for **everyone** (community and working group members). Working group members have write access to the repo; everyone else contributes via fork and pull request.

---

## Working group members

If you’re a **working group member**, you can contribute directly to the repository:

1. **Clone the repo** (if you haven’t already):
   ```bash
   git clone https://github.com/AgenticAF-Community/FrameworkCore.git
   cd FrameworkCore
   ```

2. **Create a branch** for your change (e.g. `docs/update-security-pillar`, `fix-intro-typo`).

3. **Edit** the relevant files (see [Document structure](#document-structure) and [Repo layout](#repo-layout) below).

4. **Open a Pull Request** against `main`. Use the [PR template](.github/PULL_REQUEST_TEMPLATE.md): which section you changed, rationale, and the checklist. Request review from a maintainer.

5. **After review**, a maintainer will merge. Don’t merge your own PR unless that’s the agreed policy.

**Norms:** Keep PRs focused (one topic or section when possible). Preserve citations and the governance-first, epistemic-gate lens. If you’re unsure about scope or a big change, open an Issue or Discussion first.

---

## How to give feedback (everyone)

**Quick note or question on a section?**
- Open an [Issue](https://github.com/AgenticAF-Community/FrameworkCore/issues) and use the **“Feedback / Note on whitepaper”** template.
- Add the file and section, paste the relevant quote, and your note. Tag maintainers (e.g. `@username`) if you want a direct response.

**Bigger idea or discussion?**
- Start a [Discussion](https://github.com/AgenticAF-Community/FrameworkCore/discussions) in Ideas or Q&A. Use Discussions for open-ended questions, RFCs, and proposals.

**Proposed text change?**
- **Working group:** Branch and open a PR (see above).
- **Community (no write access):** Fork the repo, make your change on a branch, then open a PR from your fork to `FrameworkCore` `main`. Same PR template and review process.

---

## Repo layout

| Path | Purpose |
|------|---------|
| `docs/` | Whitepaper sections (markdown). Single source of truth for the framework. |
| `docs/assets/` | Images and graphics for the whitepaper. |
| `website/` | Docusaurus site (agenticaf.io). Builds from `docs/` and other content. |
| `tools/` | Skills, MCP server tools, posture CLI, design/build/review CLIs, trade-off engine. See `tools/README.md`. |

When in doubt, framework text lives in `docs/`; the website reflects it.

---

## Document structure

The whitepaper lives in `docs/` with one file per major section:

| File | Section |
|------|---------|
| `00-intro.md` | Intro and intent behind the framework |
| `01-executive-summary.md` | Executive Summary |
| `02-introduction.md` | Introduction |
| `03-what-is-an-agent.md` | What Is an Agent? |
| `04-deterministic-probabilistic-agentic.md` | Deterministic, Probabilistic, and Agentic Systems |
| `05-framework-overview.md` | Framework Overview |
| `06-pillar-security.md` … `11-pillar-sustainability.md` | The Six Pillars |
| `12-context-optimization.md` | Context Optimization (Foundation) |
| `13-autonomy-governance.md` | Autonomy & Outcome Governance (Foundation) |
| `14-ecosystem-interoperability.md` | Ecosystem and Interoperability |
| `15-application-method.md` | How to Apply the Framework |
| `16-conclusion.md` | Conclusion |
| `17-emerging-thought.md` | Emerging Thought (exploratory) |
| `18-ethics.md` | Ethical Considerations (Draft) |
| `19-annex-agent-control-contracts.md` | Annex: Agent Control Contracts |

Images for the whitepaper go in `docs/assets/`.

---

## Scope

Contributions should:

- Align with the six pillars and two foundations.
- Maintain the governance-first, epistemic-gate lens.
- Preserve citations and sources.
- Be suitable for an open, vendor-agnostic community.

The framework focuses on **architecture discipline** for agentic AI systems, not implementation or product-specific guidance. The **Emerging Thought** section is for ideas observed across the agentic landscape that may mature into the framework; it is exploratory, not normative.

---

## Release cadence

Releases are periodic (approximately every 3 months). PRs are reviewed and merged between releases. Releases are tagged with semantic versions (e.g. `v1.1.0`, `v2.0.0`). Maintainers coordinate tagging and release notes.

---

Thank you for helping make the framework better.
