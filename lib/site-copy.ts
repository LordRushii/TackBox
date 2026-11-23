// Marketing copy for the home and about pages.
// Written by the content subagent and passed through the humanizer skill. Edit here, not in the JSX.

export const HOME = {
  hero: {
    eyebrow: "Open registry for agent skills",
    headline: ["Write the skill once.", "Install it anywhere."],
    subhead:
      "Tackbox is a public registry for AI agent skills. Each skill is one Markdown file that you can read, download, or install with a single command.",
    primaryCta: "Browse skills",
    secondaryCta: "Publish a skill",
    installCaption: "Install any skill from your terminal",
    marqueeLabel: "Example skills",
    marqueeSkills: [
      "code-reviewer",
      "react-component-auditor",
      "tailwind-refactor",
      "accessibility-audit",
      "api-contract-checker",
      "sql-migration-reviewer",
      "nextjs-route-planner",
      "dockerfile-linter",
      "github-actions-debugger",
      "terraform-plan-explainer",
      "design-token-sync",
      "figma-to-components",
      "pr-description-writer",
      "incident-postmortem",
    ],
  },
  howItWorks: {
    title: "How it works",
    steps: [
      {
        title: "Find a skill",
        body: "Browse by category and open any skill to read the full file before you use it. You don't need an account to look around.",
      },
      {
        title: "Install it",
        body: "Run npx skills add with the skill's path, or download the .md file and put it wherever your agent reads instructions.",
      },
      {
        title: "Publish your own",
        body: "Write the frontmatter and instructions in Markdown, then make the skill public or keep it private. Published skills are committed to a GitHub repo and credited to you.",
      },
    ],
  },
  bento: {
    title: "Built on plain files",
    subtitle: "A skill is one Markdown file, so any agent that accepts text can use it.",
    cards: [
      {
        title: "Plain Markdown",
        body: "YAML frontmatter for name, description, mode, temperature and tools, then instructions in the body. Nothing in the file is specific to Tackbox, so you can take it anywhere.",
      },
      {
        title: "One command to install",
        body: "npx skills add <owner>/<repo>/skills/<name> installs the skill. If you'd rather copy it by hand, every skill also downloads as a .md file.",
      },
      {
        title: "Stored in git",
        body: "Every published skill is a real file in a GitHub repo, so it has a commit history and a URL you can link to.",
      },
      {
        title: "Yours to share or keep",
        body: "Publish a skill for everyone or keep it private. Public skills show who wrote them, and you manage all of yours from My skills.",
      },
    ],
  },
  categoriesTitle: "Browse by category",
  finalCta: {
    title: "Publish your first skill",
    body: "If you've written the same agent instructions twice, put them in a skill file and publish it.",
    button: "Start writing",
  },
} as const;

export const ABOUT = {
  eyebrow: "About Tackbox",
  headline: ["I got tired of writing", "the same instructions twice."],
  intro: [
    "Every time I set up an agent, I wrote the same instructions again: how to review a pull request, what to check before a merge, how I like things named. I'd written them before, but I could never find the last version.",
    "The good versions were spread across private repos, Notion docs and old chat threads. Other developers I talked to had the same problem, and there was no common place to look for what anyone else had written.",
    "Tackbox is where I started putting those instructions. Each one is a Markdown file with a name, an author and an install command, so the next person can find it. The first one I published was code-reviewer, which checks code for bugs, security and auth problems before merge.",
  ],
  anatomyTitle: "What's in a skill file",
  anatomy: [
    {
      label: "Frontmatter",
      body: "YAML at the top of SKILL.md with the name, description, mode, temperature and tools. It tells both the agent and the person reading what the skill is for.",
    },
    {
      label: "Instructions",
      body: "The Markdown body. This is the text your agent loads into context, written the way you'd brief a colleague on the task.",
    },
    {
      label: "Install path",
      body: "Each skill has an address in the form <owner>/<repo>/skills/<name>. Pass it to npx skills add, or download the file directly.",
    },
  ],
  principlesTitle: "What Tackbox tries to do",
  principles: [
    {
      title: "Make skills findable",
      body: "A useful skill shouldn't sit in one person's repo. Anyone can browse the registry without an account, and every skill has its own page you can link to.",
    },
    {
      title: "Give developers attribution",
      body: "Each skill is tied to the developer who wrote it. When someone installs your skill, your name stays on it.",
    },
    {
      title: "Keep the format simple",
      body: "A skill is one Markdown file with frontmatter. You can open it in any editor and pass it to any model that takes text.",
    },
  ],
  audienceTitle: "Who it's for",
  audiences: [
    {
      title: "AI engineers",
      body: "You maintain prompts and agent configs across several projects. Keep the instructions that work in one place and install them where you need them.",
    },
    {
      title: "Indie hackers",
      body: "You're shipping alone and don't want to write a review checklist from scratch for every project. Start from a skill someone else already published.",
    },
    {
      title: "Automation teams",
      body: "Several agents need to follow the same rules. Publish those rules once as a skill and install the same file in each agent.",
    },
    {
      title: "AI tooling developers",
      body: "You build agents or editors that load instructions. Skills here are plain Markdown with the same frontmatter fields, so they're easy to parse.",
    },
  ],
  roadmapTitle: "Planned",
  roadmapNote: "None of these are shipped yet, but they're what I plan to build next.",
  roadmap: [
    "Skill versioning",
    "Ratings",
    "Search and filtering",
    "Forking",
    "User profiles",
    "Comments",
    "Recommendations",
  ],
  builder: {
    title: "Who builds it",
    body: "I'm Rushikesh Jadhav (LordRushii), and I build Tackbox on my own with Next.js and Convex. I'm building it in the open, and every published skill is a file on GitHub.",
  },
  cta: {
    title: "Have instructions worth sharing?",
    body: "Write them up as a skill and publish it, or browse what's already in the registry.",
    primary: "Publish a skill",
    secondary: "Browse skills",
  },
} as const;
