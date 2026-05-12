/** Grouped skills — multi-select; API stores selected skill titles as a comma-separated string. */

export const SKILL_CATEGORIES = [
  {
    title: "Frontend & web",
    description:
      "Interfaces, design systems in the browser, and fast user experiences.",
    skills: [
      {
        title: "React",
        description: "Component-based SPAs with hooks and client-side routing.",
      },
      {
        title: "Next.js",
        description: "SSR, app router, edge-ready deployments for production sites.",
      },
      { title: "Vue", description: "Progressive SPA with composition API and tooling." },
      {
        title: "TypeScript",
        description: "Strict types across apps and libraries to reduce regressions.",
      },
      {
        title: "JavaScript",
        description: "ES modules, bundles, DOM APIs across browser environments.",
      },
      {
        title: "HTML & CSS",
        description: "Semantic markup, layouts, responsiveness, accessibility.",
      },
      {
        title: "Tailwind CSS",
        description: "Utility-first styling with design-token-style consistency.",
      },
      {
        title: "Web performance",
        description: "Core Web Vitals, bundles, splitting, caches, prefetching.",
      },
    ],
  },
  {
    title: "Backend & APIs",
    description:
      "Services, databases, and contracts between clients and infrastructure.",
    skills: [
      {
        title: "Node.js",
        description: "JavaScript runtimes, streams, event loop–based services.",
      },
      {
        title: "NestJS",
        description: "Structured APIs with modules, DI, and validation in TypeScript.",
      },
      {
        title: "Python",
        description: "General-purpose backend logic, scripts, and async workloads.",
      },
      {
        title: "Django",
        description: "Batteries-included web apps with admin, ORM, and security defaults.",
      },
      {
        title: "PostgreSQL",
        description: "Relational modelling, indexing, migrations, and SQL tuning.",
      },
      {
        title: "REST APIs",
        description: "Resource modelling, versioning, predictable HTTP semantics.",
      },
      {
        title: "GraphQL",
        description: "Schemas, resolvers, and flexible client-facing query layers.",
      },
      {
        title: "Microservices",
        description: "Splitting bounded contexts, queues, retries, resilience patterns.",
      },
    ],
  },
  {
    title: "Mobile & desktop",
    description:
      "Native-feel apps beyond the browser—from phones to cross-platform desktops.",
    skills: [
      {
        title: "React Native",
        description: "Shared JS codebase for iOS and Android with bridge architecture.",
      },
      { title: "Swift", description: "Native iOS with Apple frameworks and performance." },
      { title: "Kotlin", description: "Android-first tooling and Compose/interop workflows." },
      {
        title: "Flutter",
        description: "Single Dart codebase with Skia-rendered widgets and tooling.",
      },
      {
        title: "Electron",
        description: "Desktop shells around web stacks for cross-platform distribution.",
      },
    ],
  },
  {
    title: "Design & product",
    description:
      "Research through delivery—experience, visuals, handoff, and coherence.",
    skills: [
      {
        title: "UI design",
        description: "Visual hierarchy, components, typography, polish in mockups.",
      },
      {
        title: "UX research",
        description: "Interviews, usability tests, and turning findings into roadmap.",
      },
      { title: "Figma", description: "Libraries, auto-layout, variants, dev handoff." },
      {
        title: "Design systems",
        description: "Tokens, patterns, docs, and governance across teams.",
      },
      {
        title: "Prototyping",
        description: "Clickable flows to validate ideas before development spend.",
      },
    ],
  },
  {
    title: "Blockchain & Web3",
    description:
      "Trust-minimized rails—contracts, wallets, and on-chain integrations.",
    skills: [
      {
        title: "Solidity",
        description: "Ethereum smart-contract development, patterns, audits awareness.",
      },
      {
        title: "Smart contracts",
        description: "Security mindset, lifecycle, upgrading, multisig workflows.",
      },
      { title: "EVM", description: "Deployment, bytecode, gas, interoperability choices." },
      {
        title: "DeFi",
        description: "AMM, lending, yield design and composability pitfalls.",
      },
      { title: "NFTs", description: "Metadata, standards (ERC‑721 / 1155), marketplaces." },
      {
        title: "Wallet integration",
        description: "connect flow, signatures, SIWE-friendly patterns.",
      },
    ],
  },
  {
    title: "Data, AI & DevOps",
    description:
      "Operate systems continuously—experimentation, infra, pipelines, resilience.",
    skills: [
      {
        title: "Machine learning",
        description: "Model training, evaluation, serving, drift awareness.",
      },
      {
        title: "Data analysis",
        description: "SQL dashboards, exploratory work, KPIs-driven storytelling.",
      },
      {
        title: "AWS",
        description: "Managed services, IAM, networking, cost-aware architecture.",
      },
      {
        title: "Docker",
        description: "Images, multi-stage builds, compose for local and CI parity.",
      },
      {
        title: "Kubernetes",
        description: "Scheduling, services, ingress, helm, cluster operations.",
      },
      {
        title: "CI/CD",
        description: "Automated build, test, deploy, and release discipline.",
      },
    ],
  },
  {
    title: "Content & growth",
    description:
      "Reach and clarity—technical communication and sustainable acquisition.",
    skills: [
      {
        title: "Technical writing",
        description: "Docs, guides, and explainers for developers and operators.",
      },
      {
        title: "Copywriting",
        description: "Landing pages, emails, and conversion-focused messaging.",
      },
      {
        title: "SEO",
        description: "Structure, metadata, content strategy for organic discovery.",
      },
      {
        title: "Growth marketing",
        description: "Experiments, funnels, cohorts, and retention loops.",
      },
    ],
  },
];

/** Hiring focus — multi-select plus optional free-text notes in the form. */
export const HIRING_FOCUS_OPTIONS = [
  {
    title: "Engineering & development",
    description: "Full-stack, platform, or specialist ICs and small teams.",
  },
  {
    title: "Product & UX design",
    description: "Discovery, roadmaps, research, and high-fidelity design.",
  },
  {
    title: "Blockchain & smart contracts",
    description: "Protocol work, auditing partners, wallet and security expertise.",
  },
  {
    title: "DevOps & infrastructure",
    description: "Reliability engineering, tooling, deployments, observability.",
  },
  {
    title: "Data & analytics",
    description: "Pipelines, warehousing, dashboards, experimentation rigor.",
  },
  {
    title: "Marketing & content",
    description: "Brand, lifecycle comms, and demand for product-led motions.",
  },
  {
    title: "Operations & PM",
    description: "Program delivery, stakeholder alignment, tooling for scale.",
  },
];

/** Stable primary label for API storage and keys. */
export function skillKey(skill) {
  return typeof skill === "string" ? skill : skill.title;
}

export const flattenSkillList = () =>
  SKILL_CATEGORIES.flatMap((c) => c.skills.map(skillKey));
