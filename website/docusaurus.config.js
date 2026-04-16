// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking

const config = {
  title: 'The Agentic Architecture Framework',
  tagline: 'A governance-first architecture for agentic AI systems',
  favicon: '/img/aaf-favicon.png',

  // Production: agenticaf.io (Vercel); preview uses VERCEL_URL
  url: process.env.VERCEL
    ? (process.env.VERCEL_ENV === 'production' ? 'https://agenticaf.io' : `https://${process.env.VERCEL_URL}`)
    : 'https://agenticaf.io',
  baseUrl: '/',

  organizationName: 'AgenticAF-Community',
  projectName: 'FrameworkCore',
  trailingSlash: false,

  // Kit landing page for gated PDF download
  customFields: {
    pdfDownloadUrl: process.env.PDF_DOWNLOAD_URL || 'https://agentic-architecture-framework.kit.com/fc548b5d10',
    giscus: {
      repo: 'AgenticAF-Community/FrameworkCore',
      repoId: 'R_kgDORSpHHg',
      category: 'Announcements',
      categoryId: 'DIC_kwDORSpHHs4C2vxH',
      mapping: 'title',
      strict: '0',
      reactionsEnabled: '1',
    },
  },

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  markdown: {
    format: 'md',
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: '../docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/AgenticAF-Community/FrameworkCore/tree/main/',
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  headTags: [
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Agentic Architecture Framework',
        url: 'https://agenticaf.io',
        logo: 'https://agenticaf.io/img/aaf-logo.png',
        description: 'Community-driven, vendor-agnostic architecture guidance for the agentic era.',
      }),
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/aaf-og-image.png',
      navbar: {
        title: 'AAF Framework',
        logo: {
          alt: 'Agentic Architecture Framework',
          src: '/img/aaf-logo.png',
          width: 200,
          height: 44,
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'defaultSidebar',
            position: 'left',
            label: 'Framework',
          },
          {
            to: '/tools',
            position: 'left',
            label: 'Tools & Skills',
          },
          {
            to: '/faq',
            position: 'left',
            label: 'FAQ',
          },
          {
            href: 'https://github.com/AgenticAF-Community/FrameworkCore',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            title: 'Framework',
            items: [
              {
                label: 'Introduction',
                to: '/intro',
              },
              {
                label: 'Executive Summary',
                to: '/executive-summary',
              },
              {
                label: 'Tools & Skills',
                to: '/tools',
              },
              {
                label: 'FAQ',
                to: '/faq',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/AgenticAF-Community/FrameworkCore',
              },
              {
                label: 'License',
                href: 'https://github.com/AgenticAF-Community/FrameworkCore/blob/main/LICENSE',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Contribute',
                to: 'https://github.com/AgenticAF-Community/FrameworkCore/blob/main/CONTRIBUTING.md',
              },
              {
                label: 'Discussions',
                href: 'https://github.com/AgenticAF-Community/FrameworkCore/discussions',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} AgenticAF Community. Licensed under CC BY-NC 4.0 (non-commercial).`,
      },
      metadata: [
        { name: 'description', content: 'Agentic Architecture Framework: vendor-agnostic guide to AI agent architecture' },
        { name: 'keywords', content: 'AI agents, agentic AI, agent architecture, autonomy levels, epistemic gates' },
      ],
    }),
};

module.exports = config;
