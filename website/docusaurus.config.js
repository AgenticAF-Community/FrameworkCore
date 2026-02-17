// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking

const config = {
  title: 'The Agentic Architecture Framework',
  tagline: 'A governance-first architecture for agentic AI systems',
  favicon: '/img/aaf-logo.png',

  url: 'https://agenticaf-community.github.io',
  baseUrl: '/FrameworkCore/',

  organizationName: 'AgenticAF-Community',
  projectName: 'FrameworkCore',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

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
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'AAF Framework',
        logo: {
          alt: 'Agentic Architecture Framework',
          src: '/img/aaf-logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'defaultSidebar',
            position: 'left',
            label: 'Framework',
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
                label: 'GitHub',
                href: 'https://github.com/AgenticAF-Community/FrameworkCore',
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
        copyright: `Copyright © ${new Date().getFullYear()} AgenticAF Community. Licensed under CC BY 4.0.`,
      },
      metadata: [
        { name: 'description', content: 'Agentic Architecture Framework: vendor-agnostic guide to AI agent architecture' },
        { name: 'keywords', content: 'AI agents, agentic AI, agent architecture, autonomy levels, epistemic gates' },
      ],
    }),
};

module.exports = config;
