# DesignByShoug

A monorepo built with [Turborepo](https://turborepo.dev/) containing a marketing website, CMS dashboard, and backend API.

## Tech Stack

| App | Technology | Port | Description |
|-----|------------|------|-------------|
| **marketing** | Next.js 16 | 3000 | Product showcase website |
| **cms** | React + Vite | 3002 | Content management dashboard |
| **server** | Bun + Elysia.js | 3001 | Backend REST API |

## Project Structure

```
designbyshoug/
├── apps/
│   ├── marketing/          # Next.js marketing website
│   │   ├── app/            # App router pages
│   │   └── public/         # Static assets
│   │
│   ├── cms/                # React CMS dashboard (Vite)
│   │   └── src/            # React components
│   │
│   └── server/             # Bun + Elysia.js backend
│       └── src/
│           ├── index.ts    # Entry point
│           └── modules/    # Feature-based modules
│               ├── health/
│               │   └── index.ts
│               └── products/
│                   ├── index.ts    # Controller
│                   ├── service.ts  # Business logic
│                   └── model.ts    # Validation schemas
│
├── packages/
│   ├── eslint-config/      # Shared ESLint configuration
│   ├── typescript-config/  # Shared TypeScript configuration
│   └── ui/                 # Shared UI components
│
├── turbo.json              # Turborepo configuration
└── package.json            # Root package.json
```

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [Bun](https://bun.sh/) >= 1.1.38 (package manager & server runtime)

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd designbyshoug

# Install dependencies
bun install
```

### Development

Run all apps simultaneously:

```bash
bun run dev
```

Run specific apps:

```bash
# Marketing site only
bun run dev --filter=marketing

# CMS only
bun run dev --filter=cms

# Server only
bun run dev --filter=server
```

### Building

Build all apps:

```bash
bun run build
```

Build specific app:

```bash
bun run build --filter=marketing
```

### Linting & Type Checking

```bash
# Lint all packages
bun run lint

# Type check all packages
bun run check-types
```

## Apps

### Marketing (`apps/marketing`)

Next.js 16 application for displaying products and company information.

- **Port:** 3000
- **Framework:** Next.js with App Router
- **Styling:** (Add your preferred styling solution)

```bash
# Development
bun run dev --filter=marketing

# Build
bun run build --filter=marketing

# Start production server
cd apps/marketing && bun run start
```

### CMS (`apps/cms`)

React dashboard for managing content displayed on the marketing site and monitoring website analytics.

- **Port:** 3002
- **Framework:** React 19 + Vite
- **Build Tool:** Vite 8

```bash
# Development
bun run dev --filter=cms

# Build
bun run build --filter=cms

# Preview production build
cd apps/cms && bun run preview
```

### Server (`apps/server`)

Backend API built with Bun runtime and Elysia.js framework.

- **Port:** 3001
- **Runtime:** Bun
- **Framework:** Elysia.js
- **API Docs:** http://localhost:3001/swagger

```bash
# Development (with hot reload)
bun run dev --filter=server

# Build
bun run build --filter=server

# Start production server
cd apps/server && bun run start
```

#### Server Architecture (Elysia.js Best Practices)

The server follows a **feature-based folder structure** as recommended by [Elysia.js best practices](https://elysiajs.com/essential/best-practice.html):

```
src/
├── index.ts                 # App entry point
└── modules/
    └── [feature]/
        ├── index.ts         # Elysia controller (routes)
        ├── service.ts       # Business logic (abstract class)
        └── model.ts         # Validation schemas (Elysia.t)
```

**Key Principles:**

- **Controller:** Elysia instance handles HTTP routing and validation
- **Service:** Abstract class with static methods for business logic
- **Model:** Elysia's `t` (TypeBox) for request/response validation

#### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/products` | List all products |
| GET | `/products/:id` | Get product by ID |
| POST | `/products` | Create product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |

## Shared Packages

### `@repo/ui`

Shared React component library used by `marketing` and `cms` apps.

### `@repo/eslint-config`

Shared ESLint configuration including:
- `eslint-config-next` for Next.js apps
- `eslint-config-prettier` for code formatting

### `@repo/typescript-config`

Shared TypeScript configurations:
- `base.json` - Base configuration
- `nextjs.json` - Next.js specific
- `react-library.json` - React libraries

## Remote Caching

Turborepo supports [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching) to share build artifacts across machines.

```bash
# Login to Vercel
bunx turbo login

# Link to Remote Cache
bunx turbo link
```

## Environment Variables

Create `.env` files in each app directory as needed:

```bash
# apps/marketing/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001

# apps/cms/.env
VITE_API_URL=http://localhost:3001

# apps/server/.env
PORT=3001
DATABASE_URL=your-database-url
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `bun run dev` | Start all apps in development mode |
| `bun run build` | Build all apps |
| `bun run lint` | Lint all packages |
| `bun run check-types` | Type check all packages |
| `bun run format` | Format code with Prettier |

## Useful Links

- [Turborepo Documentation](https://turborepo.dev/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Elysia.js Documentation](https://elysiajs.com/)
- [Bun Documentation](https://bun.sh/docs)
- [Vite Documentation](https://vitejs.dev/)
