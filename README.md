# FixItNow Frontend

A responsive Next.js App Router frontend for the FixItNow home service marketplace.

## Overview

FixItNow connects customers with local service professionals. The frontend supports public service discovery, technician profiles, customer booking requests, booking tracking, completed-service reviews, SSLCommerz checkout, payment history, JWT-based authentication, role-aware navigation, protected dashboards, technician scheduling and booking management.

## Technology

- Next.js App Router
- TypeScript
- Tailwind CSS
- Custom JWT session handling
- Next.js Proxy for optimistic route protection
- Toast-based API feedback

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

On Windows Command Prompt:

```bat
copy .env.example .env.local
```

Open `http://localhost:3000`.

## Environment variable

```env
NEXT_PUBLIC_API_URL=https://fixitnow-qemf.onrender.com
BACKEND_API_URL=https://fixitnow-qemf.onrender.com
```

See `ENVIRONMENT_SETUP.md` for local and Vercel instructions.

## Backend

```text
https://fixitnow-qemf.onrender.com
```

## Scripts

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
npm start
```
