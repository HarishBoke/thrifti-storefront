# Thrifti — Shopify Headless Storefront

> **BUY. SELL. REPEAT.** — A headless e-commerce storefront for Thrifti, Bangalore's curated second-hand fashion marketplace. Built on React 19, Express 4, tRPC 11, and Shopify Storefront API.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Prerequisites](#3-prerequisites)
4. [Environment Variables](#4-environment-variables)
5. [Getting Started](#5-getting-started)
6. [Project Structure](#6-project-structure)
7. [Architecture](#7-architecture)
8. [Pages & Routes](#8-pages--routes)
9. [Shopify Integration](#9-shopify-integration)
10. [Authentication](#10-authentication)
11. [Database](#11-database)
12. [Key Features](#12-key-features)
13. [Development Workflow](#13-development-workflow)
14. [Testing](#14-testing)
15. [Deployment](#15-deployment)
16. [Design System](#16-design-system)
17. [Static Assets & CDN](#17-static-assets--cdn)

---

## 1. Project Overview

Thrifti is a headless Shopify storefront targeting the pre-launch phase of a Bangalore-based thrift fashion brand. The frontend is a React SPA served by an Express server that proxies all Shopify Storefront API calls server-side, keeping credentials out of the browser. The application supports full product browsing, collection filtering, a persistent cart, Shopify customer account management (login, register, orders, addresses, wishlist), and a seller onboarding flow via WhatsApp.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS 4, shadcn/ui, Radix UI |
| Routing | Wouter 3 |
| Data fetching | tRPC 11 + TanStack Query |
| Backend | Express 4, Node.js |
| API layer | Shopify Storefront API 2024-01 (GraphQL) |
| Database | MySQL / TiDB (via Drizzle ORM) |
| Auth | Manus OAuth (session users) + Shopify Customer API (storefront accounts) |
| File storage | AWS S3 via Manus Forge storage proxy |
| Build tooling | Vite 6, esbuild, TypeScript 5, pnpm |
| Testing | Vitest |
| Fonts | Playfair Display (serif headings), Space Grotesk (sans labels), Space Mono (body/mono) |

---

## 3. Prerequisites

Before running the project, ensure the following are installed on your machine.

- **Node.js** ≥ 20 (LTS recommended)
- **pnpm** ≥ 9 — install with `npm install -g pnpm`
- A **Shopify store** with the Storefront API enabled and a Storefront Access Token generated
- A **MySQL or TiDB** database (connection string in `DATABASE_URL`)
- Access to a **Manus platform project** (provides OAuth, Forge API, and managed secrets)

---

## 4. Environment Variables

All secrets are injected by the Manus platform at runtime. When running locally, create a `.env` file in the project root. **Never commit `.env` to version control.**

### Required Variables

| Variable | Description |
|---|---|
| `SHOPIFY_STORE_DOMAIN` | Your Shopify store domain, e.g. `your-store.myshopify.com` |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Public Storefront API access token from Shopify Admin → Apps → Storefront API |
| `DATABASE_URL` | MySQL/TiDB connection string, e.g. `mysql://user:pass@host:3306/dbname` |
| `JWT_SECRET` | Secret used to sign session cookies (any long random string) |
| `VITE_APP_ID` | Manus OAuth application ID |
| `OAUTH_SERVER_URL` | Manus OAuth backend base URL |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal URL (used by the frontend) |
| `OWNER_OPEN_ID` | Manus OpenID of the project owner (for owner notifications) |
| `BUILT_IN_FORGE_API_URL` | Manus Forge API base URL (LLM, storage, notifications) |
| `BUILT_IN_FORGE_API_KEY` | Server-side bearer token for Manus Forge API |
| `VITE_FRONTEND_FORGE_API_KEY` | Frontend bearer token for Manus Forge API |
| `VITE_FRONTEND_FORGE_API_URL` | Manus Forge API URL for frontend use |

### Optional / Frontend Variables

| Variable | Description |
|---|---|
| `VITE_APP_TITLE` | Browser tab title (defaults to `Thrifti`) |
| `VITE_APP_LOGO` | URL to override the app logo |
| `VITE_ANALYTICS_ENDPOINT` | Analytics ingestion endpoint |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics website identifier |
| `PORT` | Server port (defaults to `3000`, auto-increments if occupied) |

---

## 5. Getting Started

### Install dependencies

```bash
pnpm install
```

### Set up the database

Push the Drizzle schema to your database (runs `drizzle-kit generate` then `drizzle-kit migrate`):

```bash
pnpm db:push
```

### Start the development server

```bash
pnpm dev
```

This starts the Express server with Vite middleware in development mode. The server auto-detects an available port starting from `3000` and logs the URL. Hot Module Replacement (HMR) is active for all frontend files.

### Build for production

```bash
pnpm build
```

This compiles the React frontend with Vite and bundles the Express server with esbuild into `dist/`.

### Start the production server

```bash
pnpm start
```

Serves the pre-built static assets and API from `dist/index.js`.

---

## 6. Project Structure

```
thrifti-storefront/
├── client/
│   ├── index.html              ← HTML entry point (Google Fonts loaded here)
│   └── src/
│       ├── App.tsx             ← Route definitions and provider tree
│       ├── main.tsx            ← React root mount
│       ├── index.css           ← Global styles, Tailwind theme tokens
│       ├── const.ts            ← Shared frontend constants (getLoginUrl, etc.)
│       ├── pages/              ← One file per route
│       ├── components/         ← Reusable UI components and shadcn/ui wrappers
│       │   ├── Navbar.tsx      ← Top navigation with music toggle, cart, search
│       │   ├── Footer.tsx      ← Site footer with link groups and social icons
│       │   ├── ProductCard.tsx ← Product tile used in grids and carousels
│       │   ├── CartDrawer.tsx  ← Slide-in cart panel
│       │   ├── ThriftiLogo.tsx ← Inline SVG logo component (red and white variants)
│       │   └── StorefrontLayout.tsx ← Shared page wrapper (Navbar + Footer)
│       ├── contexts/
│       │   ├── CartContext.tsx         ← Shopify cart state (persisted in localStorage)
│       │   ├── ShopifyAuthContext.tsx  ← Shopify customer session state
│       │   └── ThemeContext.tsx        ← Light/dark theme provider
│       └── lib/
│           └── trpc.ts         ← tRPC client binding
├── server/
│   ├── routers.ts              ← All tRPC procedures (auth, products, cart, wishlist…)
│   ├── shopify.ts              ← Shopify Storefront API client and GraphQL helpers
│   ├── db.ts                   ← Drizzle query helpers
│   ├── storage.ts              ← S3/Forge file upload helpers
│   └── _core/                  ← Framework plumbing (do not edit)
│       ├── index.ts            ← Express server entry point
│       ├── env.ts              ← Centralised env variable registry
│       ├── trpc.ts             ← publicProcedure / protectedProcedure / router
│       ├── context.ts          ← tRPC request context (injects ctx.user)
│       ├── oauth.ts            ← Manus OAuth callback route
│       ├── llm.ts              ← invokeLLM() helper
│       └── notification.ts     ← notifyOwner() helper
├── drizzle/
│   ├── schema.ts               ← Database table definitions
│   └── relations.ts            ← Drizzle relation definitions
├── shared/
│   ├── shopifyTypes.ts         ← Shared Shopify type definitions
│   └── types.ts                ← Other shared types
├── todo.md                     ← Feature and bug tracking
├── drizzle.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 7. Architecture

The application follows a **server-first headless architecture**. All Shopify Storefront API calls are made from the Express backend via `server/shopify.ts`, which keeps the Storefront Access Token out of the browser. The frontend communicates exclusively through tRPC procedures — there are no raw `fetch` or Axios calls in the client code.

```
Browser (React SPA)
    │
    │  tRPC (JSON-RPC over HTTP)
    ▼
Express Server  (/api/trpc)
    │
    ├── Shopify Storefront API  (GraphQL, server-side only)
    ├── MySQL / TiDB            (Drizzle ORM — users, wishlists)
    ├── Manus OAuth             (session cookies)
    └── Manus Forge API         (LLM, storage, notifications)
```

**Request context** is built per-request in `server/_core/context.ts`. It reads the session cookie, verifies the JWT, and attaches the resolved `user` object to `ctx`. Protected procedures call `protectedProcedure` which throws `UNAUTHORIZED` if `ctx.user` is null.

---

## 8. Pages & Routes

| Route | Page Component | Description |
|---|---|---|
| `/` | `Home.tsx` | Landing page with hero, sell steps, polaroids, countdown, and featured products |
| `/products` | `Products.tsx` | Paginated product listing with search and sort |
| `/products/:handle` | `ProductDetail.tsx` | Single product page with variant selector and add-to-cart |
| `/collections` | `Collections.tsx` | All Shopify collections grid |
| `/collections/:handle` | `CollectionDetail.tsx` | Products filtered by collection |
| `/sell` | `Sell.tsx` | Seller onboarding with LLM-powered description generator |
| `/account` | `Account.tsx` | Shopify customer dashboard (orders, addresses, wishlist) |
| `/login` | `Login.tsx` | Shopify customer login and registration |
| `/about` | `About.tsx` | Brand story |
| `/how-it-works` | `HowItWorks.tsx` | How Thrifti works for buyers and sellers |
| `/faqs` | `FAQ.tsx` | Frequently asked questions |
| `/contact` | `Contact.tsx` | Contact form / WhatsApp link |
| `/partner` | `Partner.tsx` | Partnership enquiry |
| `/returns` | `Returns.tsx` | Returns policy |
| `/shipping` | `Shipping.tsx` | Shipping policy |
| `/terms` | `Terms.tsx` | Terms of use |
| `/privacy` | `Privacy.tsx` | Privacy policy |

---

## 9. Shopify Integration

All Shopify data flows through `server/shopify.ts` using the **Storefront API 2024-01** (GraphQL). The API endpoint is constructed as:

```
https://{SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json
```

### Available tRPC Procedures

| Namespace | Procedure | Description |
|---|---|---|
| `products` | `list` | Paginated product listing with optional search query and sort |
| `products` | `get` | Single product by handle |
| `collections` | `list` | All collections |
| `collections` | `get` | Single collection with its products by handle |
| `cart` | `create` | Create a new Shopify cart |
| `cart` | `get` | Fetch cart by ID |
| `cart` | `addLines` | Add line items to cart |
| `cart` | `updateLines` | Update line item quantities |
| `cart` | `removeLines` | Remove line items |
| `customer` | `login` | Authenticate a Shopify customer |
| `customer` | `register` | Create a new Shopify customer account |
| `customer` | `logout` | Invalidate Shopify customer token |
| `customer` | `recover` | Send password reset email |
| `customer` | `me` | Fetch current customer profile |
| `customer` | `orders` | Customer order history |
| `customer` | `addresses` | Manage saved addresses (list, create, update, delete, setDefault) |
| `wishlist` | `list` | List saved products for a customer |
| `wishlist` | `add` | Save a product to wishlist |
| `wishlist` | `remove` | Remove a product from wishlist |
| `sell` | `generateDescription` | LLM-powered product description generator for sellers |

### Cart Persistence

The Shopify cart ID is persisted in `localStorage` under the key `thrifti_cart_id`. On each page load, `CartContext` fetches the cart by ID and syncs state. The checkout URL returned by Shopify is opened in a new tab via `goToCheckout()`.

---

## 10. Authentication

The project has **two independent authentication layers**.

**Manus OAuth** handles app-level user sessions. When a user logs in via Manus, the OAuth callback at `/api/oauth/callback` exchanges the code for a token, upserts the user in the `users` database table, creates a signed JWT session cookie, and redirects to `/`. This session is available server-side as `ctx.user` in any tRPC procedure. The `users` table includes a `role` field (`user` | `admin`) for access control.

**Shopify Customer Auth** handles storefront account features (orders, addresses, wishlist). The customer access token is obtained via `trpc.customer.login` and stored in `localStorage` (`shopify_customer_token`, `shopify_customer_token_expires`). The `ShopifyAuthContext` manages this state client-side and exposes `isAuthenticated`, `customer`, `setTokenAndFetch()`, and `logout()`.

The two auth systems are independent — a visitor can browse and add to cart without either session, log in to a Shopify account for order history, or log in via Manus for admin features.

---

## 11. Database

The database schema is defined in `drizzle/schema.ts` using Drizzle ORM with a MySQL/TiDB adapter.

### Tables

**`users`** — Manus OAuth session users.

| Column | Type | Notes |
|---|---|---|
| `id` | int (PK, auto-increment) | Surrogate key |
| `openId` | varchar(64) | Manus OAuth identifier, unique |
| `name` | text | Display name |
| `email` | varchar(320) | User email |
| `loginMethod` | varchar(64) | OAuth provider |
| `role` | enum(`user`, `admin`) | Default: `user` |
| `createdAt` | timestamp | Auto-set on insert |
| `updatedAt` | timestamp | Auto-updated on change |
| `lastSignedIn` | timestamp | Updated on each login |

**`wishlists`** — Saved products per Shopify customer.

| Column | Type | Notes |
|---|---|---|
| `id` | int (PK, auto-increment) | Surrogate key |
| `customerEmail` | varchar(320) | Shopify customer email |
| `productHandle` | varchar(255) | Shopify product handle |
| `productId` | varchar(255) | Shopify GID (`gid://shopify/Product/…`) |
| `productTitle` | text | Cached at save time |
| `productImage` | text | Cached image URL |
| `productPrice` | varchar(64) | Cached price string |
| `createdAt` | timestamp | Auto-set on insert |

### Schema Changes

After editing `drizzle/schema.ts`, always run:

```bash
pnpm db:push
```

This generates a new migration file and applies it to the database.

---

## 12. Key Features

**Headless Shopify storefront** — Full product catalogue, collections, variant selection, cart management, and Shopify-hosted checkout, all driven by the Storefront API with no Shopify theme or Liquid templates.

**LLM-powered Sell page** — Sellers describe their item and the app uses `invokeLLM()` to generate a polished product description, which is then sent to the store owner via WhatsApp.

**Wishlist** — Authenticated Shopify customers can heart products. Wishlist state is stored in the MySQL database and fetched via tRPC.

**Ambient music toggle** — The navbar includes a toggle that plays/pauses a lo-fi ambient background track (hosted on CDN) with smooth fade-in and fade-out transitions. The track is royalty-free (FASSounds — Lofi Study, Pixabay Content License).

**Launch countdown timer** — The homepage "New Drops, Just In" section displays a live DD:HH:MIN:SEC countdown to the launch date (26 April 2026 IST). After launch it automatically switches to a "WE'RE LIVE!" badge.

**Animated ticker banner** — A continuously scrolling marquee banner runs below the navbar with the brand tagline.

**Polaroid gallery** — The SELL / BUY / REPEAT section uses CSS `transform: rotate()` to render editorial photos as physical polaroids with handwritten-style captions.

**Responsive mobile design** — The layout is built mobile-first following the Figma v6 prototype. The navbar collapses category links on mobile, the Bangalore photo grid stacks vertically, and the polaroid section reflows to a single column.

---

## 13. Development Workflow

### Adding a new tRPC procedure

1. Add a query helper in `server/db.ts` if database access is needed.
2. Define the procedure in `server/routers.ts` under the appropriate router namespace.
3. Consume it in the frontend with `trpc.<namespace>.<procedure>.useQuery()` or `.useMutation()`.

### Adding a new page

1. Create `client/src/pages/NewPage.tsx`.
2. Register the route in `client/src/App.tsx` inside the `<Switch>` block.
3. Wrap the page in `<StorefrontLayout>` to include the Navbar and Footer automatically.

### Adding a new database table

1. Add the table definition to `drizzle/schema.ts`.
2. Run `pnpm db:push` to generate and apply the migration.
3. Add query helpers to `server/db.ts`.

### Useful commands

| Command | Description |
|---|---|
| `pnpm dev` | Start development server with HMR |
| `pnpm build` | Build frontend and backend for production |
| `pnpm start` | Run the production build |
| `pnpm test` | Run all Vitest tests |
| `pnpm check` | TypeScript type-check without emitting |
| `pnpm format` | Format all files with Prettier |
| `pnpm db:push` | Generate and apply Drizzle migrations |

---

## 14. Testing

Tests live alongside server code in `server/*.test.ts` and are run with Vitest.

```bash
pnpm test
```

The test suite currently covers:

- **`server/auth.logout.test.ts`** — tRPC `auth.logout` procedure (reference test pattern)
- **`server/shopify.credentials.test.ts`** — Validates that Shopify credentials are present and the endpoint is reachable
- **`server/shopify.test.ts`** — Integration tests for Shopify Storefront API helpers (products, collections, cart)

When adding new procedures, add a corresponding test file following the pattern in `server/auth.logout.test.ts`.

---

## 15. Deployment

The project is hosted on the **Manus platform** with built-in CI, managed secrets, and a CDN. To deploy:

1. Ensure all changes are committed and a checkpoint is saved via the Manus Management UI.
2. Click the **Publish** button in the Manus Management UI header.
3. The platform builds the project, injects all environment variables, and serves it at the assigned domain (e.g., `thriftishop-rdj3855m.manus.space`).

Custom domains can be configured in **Settings → Domains** in the Manus Management UI.

> **Note:** Do not attempt to deploy to external providers (Vercel, Railway, Render) without first reviewing compatibility with the Manus Forge API integrations and managed secret injection.

---

## 16. Design System

The design follows a bold editorial aesthetic inspired by vintage fashion zines.

| Token | Value | Usage |
|---|---|---|
| `--thrifti-red` | `#E8192C` | Primary brand colour — CTAs, accents, section backgrounds |
| `--thrifti-dark` | `#1A1A1A` | Near-black — body text, dark section backgrounds |
| `--thrifti-cream` | `#F5F0E8` | Off-white — light section backgrounds, polaroid frames |
| Heading font | Playfair Display (serif) | All editorial headings |
| Label font | Space Grotesk (sans-serif) | Navigation, badges, uppercase labels |
| Body/mono font | Space Mono (monospace) | Body copy, captions, descriptive text |

Global CSS variables and Tailwind theme tokens are defined in `client/src/index.css`. The `ThemeProvider` defaults to `light` theme. Utility classes `thrifti-btn-dark` and `thrifti-btn-light` provide consistent CTA button styles.

---

## 17. Static Assets & CDN

All images, audio, and other binary assets **must not** be stored inside the project directory. Doing so causes deployment timeouts.

**Required workflow for new assets:**

```bash
# Upload asset and get CDN URL
manus-upload-file --webdev /path/to/asset.jpg

# Use the returned CDN URL directly in code
# e.g. https://d2xsxph8kpxj0f.cloudfront.net/.../asset.jpg
```

Store the original files in `/home/ubuntu/webdev-static-assets/` (outside the project directory). All CDN URLs share the same lifecycle as the Manus web project and remain stable across deployments.

The ambient music track is hosted at:
```
https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/thrifti-ambient_37354e1c.mp3
```
Track credit: *Lofi Study — Calm Peaceful Chill Hop* by FASSounds, licensed under the [Pixabay Content License](https://pixabay.com/service/license-summary/).

---

*Last updated: April 2026 — Thrifti v1 pre-launch build.*
