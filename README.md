<div align="center">
  <img src="public/logo.png" alt="Tackbox logo" width="280">
</div>

# Tackbox

Tackbox is an open registry for AI agent skills. A skill is one Markdown file with YAML frontmatter and instructions for an agent. You write it once on Tackbox, and anyone can read it, download it, or install it from the terminal.

[Live demo](https://tackbox.vercel.app)

## How it works

Skills are stored in Convex. When you publish a public skill, the server commits it to this GitHub repo at `skills/<slug>/SKILL.md`, so every skill has a git history and a stable URL. Install one with:

```bash
npx skills add LordRushii/TackBox/skills/<slug>
```

Each committed file carries a `tackbox-id` in its frontmatter, which stops a different skill with the same slug from overwriting it.

## Features

- Write skills in an editor or upload an existing `.md` file
- Keep skills private or publish them to the registry
- Browse public skills with search and category filters
- Star skills, and track views and downloads
- Download a skill as `.md` or `.zip`
- Manage your own skills from My skills, and edit your profile

## Tech stack

| Area | Tools |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, DaisyUI, Motion |
| Backend | Convex (database, queries, mutations, cron jobs), Zod |
| Auth | Email and password with bcrypt and Convex sessions; Google sign-in through Clerk |
| Registry | GitHub via Octokit |
| Tests | Vitest, convex-test |
| Hosting | Vercel |

Login, signup and view counts are rate limited in Convex. The limit keys are hashed, so raw IPs and emails are never stored. An hourly cron clears expired entries.

## Project layout

```
app/          Pages and routes
components/   UI components
features/     Auth, skill and registry logic (server actions, validation, GitHub publish)
convex/       Schema, queries, mutations, rate limits, crons, tests
lib/          Convex client, Markdown rendering, site copy
skills/       The live registry. The app commits published skills here
```

## Getting started

```bash
pnpm install

# Terminal 1: Convex backend
pnpm convex dev

# Terminal 2: Next.js
pnpm dev
```

Create `.env.local`:

```bash
NEXT_PUBLIC_CONVEX_URL=                # set by `pnpm convex dev`
CONVEX_SERVER_SECRET=                  # 32+ characters
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Publishing to the registry (optional locally)
GITHUB_TOKEN=
GITHUB_OWNER=
GITHUB_REPO=
NEXT_PUBLIC_GITHUB_OWNER=
NEXT_PUBLIC_GITHUB_REPO=
```

Set the same `CONVEX_SERVER_SECRET` on the Convex deployment with `pnpm convex env set CONVEX_SERVER_SECRET <value>`. Without the GitHub variables, skills still save, but nothing gets committed to the registry.

Run the tests with `pnpm test` and the linter with `pnpm lint`.

## Roadmap

Skill versioning, forking skills, public author pages, comments, and recommendations.

Built by **LordRushii**
