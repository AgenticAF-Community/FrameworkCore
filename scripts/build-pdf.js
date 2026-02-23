#!/usr/bin/env node

/**
 * Builds a formal PDF from the whitepaper docs.
 * Concatenates all docs in sidebar order, adds title + license pages, outputs to website/static/pdf/
 */

const fs = require('fs');
const path = require('path');
const { mdToPdf } = require('md-to-pdf');

const ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const ASSETS_DIR = path.join(DOCS_DIR, 'assets');
const OUTPUT_DIR = path.join(ROOT, 'website', 'static', 'pdf');
const STYLES_PATH = path.join(__dirname, 'pdf-styles.css');

// Sidebar order (from website/sidebars.js) mapped to doc filenames
const DOC_ORDER = [
  '00-intro',
  '01-executive-summary',
  '02-introduction',
  '03-what-is-an-agent',
  '04-deterministic-probabilistic-agentic',
  '05-framework-overview',
  '06-pillar-security',
  '07-pillar-reliability',
  '08-pillar-cost',
  '09-pillar-operations',
  '10-pillar-performance',
  '11-pillar-sustainability',
  '12-context-optimization',
  '13-autonomy-governance',
  '14-ecosystem-interoperability',
  '15-application-method',
  '16-conclusion',
  '18-ethics',
  '19-annex-agent-control-contracts',
];

function stripFrontmatter(content) {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
  return match ? match[1].trim() : content;
}

function loadDoc(filename) {
  const filePath = path.join(DOCS_DIR, `${filename}.md`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Doc not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return stripFrontmatter(raw);
}

function buildTitlePage() {
  const date = new Date().toISOString().split('T')[0];
  return `<img src="./assets/aaf-logo-white.png" alt="AAF Logo" class="title-logo" />

# THE AGENTIC ARCHITECTURE FRAMEWORK

## v1.3

*A governance-first architecture for agentic AI systems*

---

*Generated ${date}*

<div class="page-break"></div>
`;
}

function buildLicensePage() {
  return `# License

The Agentic Architecture Framework is licensed under **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**.

**You are free to:** Share and adapt this framework for any non-commercial purpose.

**You must:** Give appropriate credit and link to the license: https://creativecommons.org/licenses/by-nc/4.0/

**You may not:** Use this material for commercial purposes (e.g. selling the document, charging for training based on it).

**You may:** Use the framework to build commercial products. The restriction applies to commercializing the framework document itself, not to products built using its principles.

---

<div class="page-break"></div>
`;
}

async function main() {
  const parts = [buildTitlePage(), buildLicensePage()];

  for (const name of DOC_ORDER) {
    const content = loadDoc(name);
    parts.push(content);
    parts.push('\n\n'); // section spacing
  }

  const fullMarkdown = parts.join('\n');

  // Resolve image paths: ./assets/ -> absolute path for md-to-pdf
  // md-to-pdf uses basedir for the file server; ./assets/ relative to basedir (docs/) should work
  const basedir = DOCS_DIR;

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const outputPath = path.join(OUTPUT_DIR, 'agentic-architecture-framework-v1.pdf');

  // Use system Chrome on macOS if Puppeteer's bundled Chrome is not installed
  const chromePaths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ];
  const executablePath = chromePaths.find((p) => fs.existsSync(p));

  const pdf = await mdToPdf(
    { content: fullMarkdown },
    {
      dest: outputPath,
      basedir,
      stylesheet: STYLES_PATH,
      document_title: 'Agentic Architecture Framework v1',
      pdf_options: {
        format: 'A4',
        margin: '25mm 30mm',
        printBackground: true,
      },
      ...(executablePath && { launch_options: { executablePath } }),
    }
  );

  if (pdf) {
    console.log(`PDF built: ${outputPath}`);
  } else {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
