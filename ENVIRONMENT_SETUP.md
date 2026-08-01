# Environment Setup

## Local development

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL=https://fixitnow-qemf.onrender.com
BACKEND_API_URL=https://fixitnow-qemf.onrender.com
```

The file should sit beside `package.json`:

```text
FixItNow-Frontend/
├── .env.local
├── package.json
├── src/
└── public/
```

Do not commit `.env.local`. It is already ignored by `.gitignore`.

`NEXT_PUBLIC_API_URL` is used by browser requests. `BACKEND_API_URL` is used only by the Next.js server route handlers that forward SSLCommerz callbacks to the backend.

## Vercel deployment

Import the GitHub repository into Vercel, then open:

```text
Project Settings → Environment Variables
```

Add both variables for Production, Preview and Development:

```text
NEXT_PUBLIC_API_URL=https://fixitnow-qemf.onrender.com
BACKEND_API_URL=https://fixitnow-qemf.onrender.com
```

Deploy the frontend and copy its production URL, for example:

```text
https://fixitnow-frontend.vercel.app
```

## Connect SSLCommerz to Vercel

After the Vercel deployment succeeds, open the FixItNow backend service on Render and update:

```env
APP_BASE_URL=https://YOUR-FRONTEND.vercel.app
```

Do not include a trailing slash. Save the variable and redeploy/restart the backend.

This makes new SSLCommerz sessions use these public frontend callback URLs:

```text
https://YOUR-FRONTEND.vercel.app/api/payments/success
https://YOUR-FRONTEND.vercel.app/api/payments/fail
https://YOUR-FRONTEND.vercel.app/api/payments/cancel
https://YOUR-FRONTEND.vercel.app/api/payments/ipn
```

Those route handlers forward the callback data to the Render backend for validation and then redirect the browser to the frontend result pages.

Create a new payment session after changing `APP_BASE_URL`. Previously generated SSLCommerz gateway links still contain the old callback addresses.

## CORS note

The browser still sends normal API requests directly to Render. If the backend uses an allow-list for CORS, add the Vercel production origin to that allow-list and redeploy the backend.
