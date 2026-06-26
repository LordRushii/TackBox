# Tackbox

Tackbox is a platform for creating, publishing, and sharing reusable AI agent skills.

It allows developers to build a structured repository of reusable agent instructions, workflows, prompts, and capability scripts that can be shared publicly or managed privately.

The idea is simple:

**Tackbox = GitHub for AI Agent Skills**

Developers repeatedly rewrite agent prompts, workflows, and capability instructions. Tackbox solves this by creating a reusable, shareable repository of agent intelligence. Instead of rewriting the same logic repeatedly, developers can publish once and reuse anywhere.

---

## Overview

Tackbox provides a centralized platform where developers can:

- Create agent skills in Markdown format
- Publish skills publicly or keep them private
- Browse community-created skills
- Reuse existing agent workflows
- Download skills as `.md` files
- Manage their personal skill library
- Upload existing skill files directly

---

## Core Features

### Authentication & Security

- **Dual Authentication Systems**:
  - **Local Credentials**: Email/password authentication using bcrypt password hashing and custom session-based authentication via secure `httpOnly` cookies.
  - **Single Sign-On (SSO)**: OAuth (Google) authentication integrated via Clerk (`@clerk/nextjs`), with authenticated sessions synchronized to the Convex database.
- Protected routes and persistent login sessions (*Note: Clerk middleware is defined in `proxy.ts`, but since it is not named `middleware.ts`, it is not automatically executed by Next.js at the routing layer to protect routes globally*).


### Skill Management

- Create, update, and delete skills
- Upload local skill files to auto-populate metadata
- Visibility control (Public / Private)
- Markdown-based skill writing with support for sub-skills

### Public Marketplace

- Browse public skills
- View full skill content and metadata on detail pages
- Download skills as Markdown
- Like and star skills

### User Dashboard

- View and edit authored skills
- Manage skill visibility and metadata
- Track skill views, downloads, and stars

---

## Tech Stack

**Frontend**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- DaisyUI

**Backend**
- Convex (Database & Serverless Functions)
- Custom authentication system + Clerk (SSO Integration)
- Zod (Input Validation)

---

## Architecture

```text
tackbox/
├── app/               # Next.js App Router pages and API routes
├── assests/           # Project static assets (note the spelling in the repository)
├── components/        # Reusable React components
├── convex/            # Convex backend functions and database schema
├── lib/               # Shared logic, authentication functions, and database helper utility functions
├── public/            # Static public files
├── skills/            # Directory containing local skill definitions/markdown files
├── proxy.ts           # Clerk middleware configuration (currently inactive as Next.js middleware due to filename; next.js expects middleware.ts)
└── skills-lock.json   # Lockfile specifying imported skill versions, paths, and computed hashes
```

*Note on special files:*
- **`proxy.ts`**: Contains Clerk middleware configuration (`clerkMiddleware()`). It is designed to intercept edge/serverless requests, apply Clerk authentication rules, and filter out static resources or Next.js internal requests. However, because it is named `proxy.ts` rather than `middleware.ts`, it is currently inactive and does not run automatically at the framework level in Next.js.
- **`skills-lock.json`**: A version lockfile that maps imported/installed skills (like `code-reviewer`, `convex`, etc.) to their remote GitHub repository sources, paths, and computed SHA-256 hashes to guarantee consistency and stability of dependencies.


---

## Database Schema

Tackbox uses **Convex** for its backend. The schema consists of the following core tables:

- **`users`**: Stores user credentials and profile info (`name`, `email`, optional `passwordHash` for local email/password users, optional `image` URL for SSO users, and `createdAt`).
- **`sessions`**: Manages secure local user sessions (`userId`, `sessionToken`, `expiresAt`, `createdAt`).
- **`skills`**: Stores skill metadata and content (`title`, `description`, `category`, optional `tags`, markdown `content`, optional `subSkills`, `visibility`, `authorId`, metrics like `views`/`downloads`/`stars`, `createdAt`, `updatedAt`).
- **`likes`**: Tracks which users have liked which skills (`userId`, `skillId`).


---

## Development

Install dependencies using `pnpm`:

```bash
pnpm install
```

Run the development servers:

```bash
# Start the Next.js frontend
pnpm run dev

# In a separate terminal, start the Convex backend
pnpm convex dev
```

---

## Roadmap

- Skill versioning
- Skill ratings
- Search and filtering
- Fork existing skills
- User profiles
- Comments system
- AI-based recommendations
# Tackbox

**GitHub for AI Agent Skills.**

Developers keep rewriting the same agent prompts, workflows, and instructions. Tackbox fixes that with a shared, structured repository of reusable agent skills — publish once, reuse anywhere, public or private.

[Live Demo](https://tackbox.vercel.app)

---

## What you can do

- Write agent skills in Markdown
- Publish publicly or keep them private
- Browse skills built by the community
- Download any skill as a `.md` file and drop it into your own agent
- Manage your skill library from a personal dashboard
- Upload existing skill files to auto-populate metadata

---

## Core Features

**Authentication & Security**
- **Dual Auth Systems**:
  - **Local Credentials**: Email/password auth using bcrypt password hashing and custom session-based auth via secure `httpOnly` cookies.
  - **Single Sign-On (SSO)**: OAuth (Google) auth integrated via Clerk (`@clerk/nextjs`), with authenticated sessions synced to Convex.
- Protected routes, persistent sessions (*Note: Clerk middleware is defined in `proxy.ts`, but since it is not named `middleware.ts`, it is not automatically executed by Next.js at the routing layer to protect routes globally*).

**Skill Management**
- Create, update, delete skills
- Public / private visibility control
- Markdown-based authoring with sub-skill support

**Marketplace**
- Browse and search public skills
- Full skill content + metadata on detail pages
- Like, star, and download as Markdown

**Dashboard**
- Edit your authored skills
- Manage visibility and metadata
- Track views, downloads, and stars

---

## Tech Stack

**Frontend** — Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, DaisyUI
**Backend** — Convex (database + serverless functions), Clerk (SSO), Zod (validation)

---

## Architecture

```text
tackbox/
├── app/                # Next.js App Router pages and API routes
│   ├── (auth)/         # Auth route group (login, register)
│   ├── about/          # About page
│   ├── actions/        # Server actions (including Clerk synchronization actions)
│   ├── api/            # API routes (skills publishing)
│   ├── auth/           # OAuth / redirect handler callback
│   ├── my-skills/      # User dashboard
│   ├── profile/        # User profile page
│   ├── skills/         # Skill browse and detail pages
│   └── sso-callback/   # SSO Callback route (from Clerk authentication)
├── assests/            # Project static assets (note the spelling in the repository)
├── components/         # Reusable React components
├── convex/             # Convex backend schema and database query/mutation functions
├── lib/                # Shared logic (auth, sessions, cookies, markdown rendering)
├── public/             # Static public assets (e.g. logos)
├── skills/             # Local skill Markdown files and definitions
├── proxy.ts            # Clerk middleware configuration for route interception (inactive as middleware due to file name, should be middleware.ts in Next.js)
└── skills-lock.json    # Skill version lockfile specifying imported skill sources, paths, and computed hashes
```

*Note on special files:*
- **`proxy.ts`**: Contains Clerk middleware configuration (`clerkMiddleware()`). It is designed to intercept edge/serverless requests, apply Clerk authentication rules, and filter out static resources or Next.js internal requests. However, because it is named `proxy.ts` rather than `middleware.ts`, it is currently inactive and does not run automatically at the framework level in Next.js.
- **`skills-lock.json`**: A version lockfile that maps imported/installed skills (like `code-reviewer`, `convex`, etc.) to their remote GitHub repository sources, paths, and computed SHA-256 hashes to guarantee consistency and stability of dependencies.
```

---

## Database Schema

| Table | Stores |
|---|---|
| `users` | name, email, password hash (optional), image (optional), createdAt |
| `sessions` | userId, sessionToken, expiresAt, createdAt |
| `skills` | title, description, category, tags (optional), content, subSkills (optional), visibility, authorId, views, downloads, stars, createdAt, updatedAt |
| `likes` | userId, skillId |

---

## Getting Started

```bash
pnpm install

# Terminal 1 — frontend
pnpm run dev

# Terminal 2 — Convex backend
pnpm convex dev
```

---

## Roadmap

Skill versioning · Skill ratings · Search and filtering · Fork skills · User profiles · Comments · AI-based recommendations

---

Built by **LordRushii**