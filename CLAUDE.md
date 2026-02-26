# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mar Quente HUB is an enterprise management system (projects, tasks, users, departments, tickets, marketing, UGC, collections, launch calendar) built with React 18 + Vite + Supabase. All UI text is in Portuguese (pt-BR).

## Commands

```bash
# Development
yarn dev                    # Start dev server (localhost:5173)
yarn build                  # Production build
yarn lint                   # ESLint

# Testing
yarn test                   # Vitest in watch mode
yarn test:run               # Run all tests once
yarn test:coverage          # Coverage report (v8)
vitest run tests/foo.test.js  # Run a single test file
yarn test:e2e               # Playwright E2E tests
yarn test:e2e:headed        # E2E in headed browser
yarn test:all               # Full test suite
```

## Architecture

### Data Layer Abstraction (`src/api/`)

The core architectural pattern is a switchable data client controlled by `VITE_USE_MOCK` env var:

- `base44Client.js` — exports `base44`, which is either a mock or Supabase client
- `supabaseClient.js` — real Supabase backend with entity classes
- `mockClient.js` / `mockData.js` — in-memory mock data with simulated delays
- `entities.js` — re-exports all entities from `base44` for convenient imports

Every entity (Task, Project, Department, etc.) exposes the same interface: `.list()`, `.get(id)`, `.create(data)`, `.update(id, data)`, `.delete(id)`, `.search(filters)`. Auth is accessed via `base44.auth` (`.me()`, `.login()`, `.logout()`).

Usage pattern in components:
```js
import { Task } from "@/api/entities";
const tasks = await Task.list("-updated_date");
```

### Routing (`src/pages/index.jsx`)

React Router v7 with nested routes. Public routes: `/login`, `/register`. All other routes are wrapped in `<ProtectedRoute>` → `<Layout>`. Routes are PascalCase: `/Dashboard`, `/Projects`, `/Tasks`, `/Users`, `/Departments`, `/Collections`, `/UGC`, `/Tickets`, `/LaunchCalendar`, `/MarketingDirectory`, `/SharedAssets`, `/AdminPanel`.

### Component Organization (`src/components/`)

Components are grouped by feature domain: `admin/`, `calendar/`, `collections/`, `dashboard/`, `departments/`, `marketing/`, `projects/`, `tasks/`, `tickets/`, `ugc/`, `users/`. Shared UI primitives live in `components/ui/` (Shadcn/ui + Radix).

### Layout & Auth

- `src/pages/Layout.jsx` — main layout with sidebar navigation, neumorphic design theme
- `src/components/ProtectedRoute.jsx` — checks Supabase auth session, redirects to `/login`
- Role-based access: admin, manager, user. Navigation items filtered by `currentUser.permissions`

### Styling

- TailwindCSS with CSS custom properties (HSL color tokens defined in `src/index.css`)
- Dark mode via class strategy (`next-themes`)
- Custom neumorphic shadow utilities: `.shadow-neumorphic`, `.shadow-neumorphic-inset`, etc.
- Animations via `tailwindcss-animate` + Framer Motion

## Key Conventions

- **Path alias**: always use `@/` for imports from `src/` (configured in vite.config.js and vitest.config.js)
- **JSX in .js files**: Vite is configured to treat `.js` files as JSX via esbuild loader
- **Package manager**: yarn (yarn.lock present, Vercel configured for yarn)
- **UI components**: use existing Shadcn/ui components from `@/components/ui/` before creating new ones
- **Icons**: `lucide-react`
- **Forms**: React Hook Form + Zod for validation
- **Toasts**: Sonner (`sonner`)
- **Drag-and-drop**: `@hello-pangea/dnd`
- **Charts**: Recharts

## Environment Variables

Copy `.env.example` to `.env`. Key variables:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VITE_SUPABASE_SERVICE_KEY` | Supabase service role key |
| `VITE_USE_MOCK` | `true` = mock data, `false` = Supabase |

## Deployment

Deployed on Vercel (region: gru1/São Paulo). Config in `vercel.json` with SPA rewrites to `index.html` and security headers.
