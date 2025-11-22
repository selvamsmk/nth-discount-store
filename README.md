
# nth-discount-store

A small e-commerce demo demonstrating cart + checkout APIs with an “every-nth order issues a one-time 10% coupon” mechanic. The project includes a simple React UI, server APIs, and admin tools to inspect and manage coupons and sales metrics.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Hono** - Lightweight, performant server framework
- **tRPC** - End-to-end type-safe APIs
- **Bun** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **SQLite/Turso** - Database engine
- **Authentication** - Better-Auth
- **Turborepo** - Optimized monorepo build system

## What you can do (User)

This repo contains an interactive demo storefront. As a normal user you can:

- Browse available store items (name, description, price).
- Add items to your cart and change quantities.
- View the cart total and itemized cart contents.
- Apply a coupon code at checkout — coupon codes must be valid and issued by the server (client-side whitelists are not used).
- Complete checkout. The server will create an `order`, persist `order_items`, apply a valid coupon (if supplied), and clear your cart.
- Receive a single-use 10% coupon when you hit the configured milestone: the server will generate and return a coupon automatically on every Nth order (N is the `n_value` setting).

Notes about coupons for users:

- Coupons are single-use. When redeemed at checkout they are validated server-side and marked as used to prevent reuse.
- Automatically generated coupons are returned in the checkout response; the frontend surfaces them so users can copy the code.
- Only coupons present in the database and not marked as used/invalidated can be applied.

## What Admins can do

Admin users get additional APIs and a dashboard for management and observability:

- View aggregated sales metrics on the Admin Dashboard:
	- Items sold (sum of quantities across orders)
	- Total revenue (sum of order totals)
	- Total discounts given (sum of discount amounts applied)
	- List of coupons with metadata (code, percent, used state, redeemed order id)
- Inspect individual coupons and see which orders redeemed them.
- Update the `n_value` setting via the Settings UI to change how frequently the system issues automatic coupons (every Nth order).
- (Planned/extendable) Create, invalidate, or force-generate coupons from admin-only endpoints.

Security notes for Admin features:

- Admin endpoints are protected; they require an authenticated session with an admin flag.
- The deployed demo includes seeded admin credentials for convenience — do not use them for any production system.

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Database Setup

This project uses SQLite with Drizzle ORM.

1. Start the local SQLite database:

```bash
cd apps/server && bun run db:local
```

2. Update your `.env` file in the `apps/server` directory with the appropriate connection details if needed.

3. Apply the schema to your database:

```bash
bun run db:push
```

### Database Seeding

- A TypeScript seed script is provided in the `packages/db` package and uses `@faker-js/faker` to generate richer item rows (name, description, SKUs). The seed script reads the env from `apps/server/.env` and connects using `DATABASE_URL`.

- Run the seed (from repo root):

```bash
cd packages/db
# either run the script directly with Bun
bun ./src/scripts/seed-items.ts
```

or if your package.json defines a script `db:seed` you can run:

```bash
bun run db:seed
```

- Control the number of rows with `SEED_COUNT` (default 20):

```bash
# example: seed 50 items
export SEED_COUNT=50
bun ./src/scripts/seed-items.ts
```

- Important: ensure `DATABASE_URL` in `apps/server/.env` points to the same database Drizzle Studio uses (prefer an absolute `file:` URL for local SQLite). If you see no rows in Studio after seeding, verify the printed `DATABASE_URL` from the seed script and the Drizzle Studio connection are identical.

- The seed script will not run automatically on server startup; it is explicit to avoid accidental production writes.

Then, run the development server:

```bash
bun run dev
```

Open http://localhost:3001 in your browser to see the web application.
The API is running at http://localhost:3000.

## Deployed demo

A deployed instance of this project is available for preview at:

https://nth-discount-store-production.up.railway.app/

Use this URL to inspect the running demo and verify behavior without running locally.

### Demo admin credentials

You can use the following admin account on the deployed instance to access the admin/settings UI:

- Email: admin2@gmail.com
- Password: admin123

Once signed in as the admin, open the Settings tab to update the `n_value` used by the server to decide when to generate the one-time coupon (every Nth order).

If you are running the app locally, seed the DB and sign in with a seeded admin account to access admin features.

## Project Structure

```
nth-discount-store/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   └── server/      # Backend API (Hono, TRPC)
├── packages/
│   ├── api/         # API layer / business logic
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run dev:server`: Start only the server
- `bun run check-types`: Check TypeScript types across all apps
- `bun run db:push`: Push schema changes to database
- `bun run db:studio`: Open database studio UI
- `cd apps/server && bun run db:local`: Start the local SQLite database
