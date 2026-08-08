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
    {
      type: 'category',
      label: 'Common Agentic Workloads',
      collapsed: false,
      items: [
        '13.5-common-agentic-workloads',
        '13.51-workload-knowledge-assistant',
        '13.52-workload-customer-chatbot',
        '13.53-workload-internal-copilot',
        '13.54-workload-workflow-agent',
      ],
    },
    'ecosystem-interoperability',
    'application-method',
    'conclusion',
    'ethics',
    'emerging-thought',
    'annex-agent-control-contracts',
  ],
};

module.exports = sidebars;
