# FixItNow Frontend

A responsive Next.js App Router frontend for the FixItNow home service marketplace.

## Commit 3 scope

- Live public service browsing from the FixItNow backend
- Category, location, rating and price filters
- Responsive filter panel and pagination
- Live technician discovery with search and sorting
- Public technician profile with services, availability and reviews
- Skeleton, empty and route-level error states
- Toast feedback for API and network failures
- Mobile navigation menu
- Local and Vercel environment setup guide

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
