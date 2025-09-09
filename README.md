## Next.js Starter Kit

Production-ready starter for building modern apps with Next.js 15, React 19, and Tailwind CSS v4. Includes a polished UI kit (Radix + shadcn-style components), dark/system theming, strong defaults for performance and security, and one-click deploy to Vercel.

### Features

- **Next.js 15 (App Router)**: File-based routing, React Server Components
- **React 19** with **Turbopack** for dev speed
- **Tailwind CSS v4** (no config file) with CSS variables and animations
- **Radix UI + shadcn-style components** in `components/ui`
- **Dark/System theme** via `next-themes` and a built-in `ThemeToggle`
- **Security headers + CSP** (auto-adjusts on Vercel)
- **Vercel Analytics** gated for production on Vercel
- **TypeScript**, strict mode, path aliases (`@/*`)
- **Prettier + ESLint** (Next + Prettier config)

### Stack

- **Framework**: Next.js 15 (`next`), React 19
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`), `tw-animate-css`
- **UI**: Radix primitives, `lucide-react`, components in `components/ui`
- **Theming**: `next-themes`
- **Build/Dev**: Turbopack (`next dev --turbopack`)

### Quickstart

```bash
# Install deps (recommended)
pnpm install

# Start dev server
pnpm dev

# Type-check, lint, format
pnpm lint
pnpm format
pnpm format:check

# Build & run production
pnpm build && pnpm start
```

Requirements: Node 18.18+ (Node 20+ recommended) and pnpm.

### Analytics

`@vercel/analytics` only loads in production on Vercel. No local env vars required.

### Scripts

- **dev**: `next dev --turbopack`
- **build**: `next build`
- **start**: `next start`
- **lint**: `next lint`
- **format**: `prettier --write .`
- **format:check**: `prettier --check .`

### Deployment

- One-click deploy to Vercel: the app ships with headers and CSP optimized for Vercel.
- You can also self-host: run `pnpm build && pnpm start` behind your own reverse proxy.

### License

MIT — see `LICENSE`.
