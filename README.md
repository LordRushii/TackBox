# SkillHub

SkillHub is a platform for creating, publishing, and sharing reusable AI agent skills.

It allows developers to build a structured repository of reusable agent instructions, workflows, prompts, and capability scripts that can be shared publicly or managed privately.

The idea is simple:

**SkillHub = GitHub for AI Agent Skills**

Developers repeatedly rewrite agent prompts, workflows, and capability instructions. SkillHub solves this by creating a reusable, shareable repository of agent intelligence. Instead of rewriting the same logic repeatedly, developers can publish once and reuse anywhere.

---

## Overview

SkillHub provides a centralized platform where developers can:

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

- Custom authentication system (Email/password)
- Password hashing with bcrypt
- Session-based authentication using secure `httpOnly` cookies
- Protected routes and persistent login sessions

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
- Custom authentication system
- Zod (Input Validation)

---

## Architecture

```text
skillhub/
├── app/               # Next.js App Router pages and API routes
├── components/        # Reusable React components
├── convex/            # Convex backend functions and database schema
├── lib/               # Utility functions and shared logic
├── middleware/        # Next.js middleware for route protection
└── public/            # Static assets
```

---

## Database Schema

SkillHub uses **Convex** for its backend. The schema consists of the following core tables:

- **`users`**: Stores user information (name, email, password hash, etc.).
- **`sessions`**: Manages secure user sessions (session token, expiration, etc.).
- **`skills`**: Stores skill metadata and content (title, description, tags, markdown content, sub-skills, visibility, metrics like views/downloads).
- **`likes`**: Tracks which users have liked which skills.

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
