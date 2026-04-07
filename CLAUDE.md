# CLAUDE.md — Dhanunjaiah Handlooms Frontend

## What This Is

Frontend for **dhanunjaiah.com** — an ecommerce store selling handwoven Pochampally Ikat sarees. Built for a real family business in Telangana, India. Live in production with real customers and real payments.

## Tech Stack

- **Next.js 16** (React 19, App Router)
- **TypeScript** (strict)
- **Tailwind CSS** (custom design tokens in globals.css)
- **Zustand** (cart + auth state, persisted to localStorage)

## Architecture

```
frontend/
├── src/app/
│   ├── (store)/           # Customer-facing pages (wrapped in Header + Footer)
│   │   ├── page.tsx       # Homepage — hero + featured products
│   │   ├── sarees/        # Collection listing + product detail [id]
│   │   ├── cart/           # Shopping cart
│   │   ├── checkout/       # Checkout form → Razorpay redirect
│   │   ├── my-orders/      # Customer's order history (auth required)
│   │   ├── track/          # Public order tracking by order number
│   │   ├── nool/           # Video reels (YouTube Shorts style)
│   │   └── order-confirmation/[orderNumber]/
│   ├── admin/             # Admin panel (AdminGuard + AdminLayout)
│   │   ├── page.tsx       # Dashboard — stats, recent orders
│   │   ├── sarees/        # Product CRUD + image upload
│   │   ├── orders/        # Order management + status updates
│   │   └── nool/          # Video upload management
│   ├── login/             # Login page
│   └── register/          # Registration page
├── src/lib/
│   ├── api.ts             # Backend API client with mapProductToSaree()
│   ├── auth-store.ts      # Zustand auth — httpOnly cookie, credentials: 'include'
│   ├── cart-store.ts      # Zustand cart — per-product GST calculation
│   ├── razorpay.ts        # Razorpay SDK loader + options builder
│   ├── types.ts           # All TypeScript interfaces
│   └── format.ts          # formatINR, formatFabric, formatWeave, formatStatus
├── src/components/        # Shared UI components
└── e2e/                   # Playwright E2E tests
```

## Backend API

Backend is in a **separate repo**: `handmade-mini-backend` (Spring Boot, Java 21).

API base URL comes from `NEXT_PUBLIC_API_URL` env var. No defaults — must be set.

All authenticated requests use `credentials: 'include'` (httpOnly cookie). The backend sets a `dhn_token` cookie on login. Frontend never touches the JWT directly.

## Key Design Decisions

1. **No sample/mock data** — every page fetches from the real backend API. Zero fallbacks.
2. **Per-product GST** — cart calculates GST per item using `saree.gstPct` (5% or 12%), not a flat rate.
3. **Razorpay redirect checkout** — NOT modal. Full-page redirect to Razorpay, callback returns to backend which verifies payment and redirects to order confirmation.
4. **Presigned URL uploads** — images/videos go directly from browser to Cloudflare R2 via presigned URLs. Never through the backend server.
5. **PENDING_PAYMENT flow** — order created → redirect to pay → if payment succeeds: stock decremented + order PAID. If cancelled: cart stays, order expires in 30 min.
6. **Nool page** — no header/footer (controlled via store layout pathname check). YouTube Shorts style: vertical scroll, video left 65%, details right 35% on desktop. Full-screen video on mobile.

## Environment Variables

| Variable | Example | Required |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.dhanunjaiah.com` | Yes |
| `NEXT_PUBLIC_RAZORPAY_KEY` | `rzp_test_xxx` or `rzp_live_xxx` | Yes |

## Build & Run

```bash
npm install
npm run dev          # Dev server
npm run build        # Production build
npx playwright test  # E2E tests
```

## Branching

- `main` — production (protected, merge via PR only)
- `dev` — development (push freely, create PR to merge to main)
- Vercel auto-deploys: `main` → dhanunjaiah.com, `dev` → preview URL

## What NOT To Do

- Don't add sample/mock data fallbacks — if API fails, show error
- Don't store JWT in localStorage — use httpOnly cookies via `credentials: 'include'`
- Don't hardcode API URLs — use env vars
- Don't push to `main` directly — always PR from `dev`
- Don't add `console.log` — use proper error handling
- Don't use `any` type — define proper interfaces

## Infrastructure

| Service | URL | Provider |
|---|---|---|
| Frontend (prod) | dhanunjaiah.com | Vercel |
| Frontend (dev) | dev.dhanunjaiah.com | Vercel preview |
| Backend (prod) | api.dhanunjaiah.com | AWS EC2 Mumbai |
| Backend (dev) | dev-api.dhanunjaiah.com | AWS EC2 Mumbai |
| Database (prod) | Supabase (PostgreSQL) | ap-south-1 |
| Database (dev) | Supabase (PostgreSQL) | ap-south-1 |
| Images/Videos | Cloudflare R2 | APAC |
| Payments | Razorpay | Test mode |
