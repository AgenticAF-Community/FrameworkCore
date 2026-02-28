/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  defaultSidebar: [
    'intro',
    'executive-summary',
    'introduction',
    'what-is-an-agent',
    'deterministic-probabilistic-agentic',
    'framework-overview',
    'pillar-security',
    'pillar-reliability',
    'pillar-cost',
    'pillar-operations',
    {
      type: 'category',
      label: 'Pillar 5: Performance Efficiency',
      collapsed: false,
      items: [
        'pillar-performance',
        'pillar-performance-casestudy-1',
      ],
    },
    'pillar-sustainability',
    'context-optimization',
    'autonomy-governance',
    'ecosystem-interoperability',
    'application-method',
    'conclusion',
    'ethics',
    'emerging-thought',
    'annex-agent-control-contracts',
  ],
};

module.exports = sidebars;
