# Environment Setup

## Local development

Create `.env.local` in the project root before running the frontend locally:

```env
NEXT_PUBLIC_API_URL=https://fixitnow-qemf.onrender.com
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

## Vercel deployment

After importing the GitHub repository into Vercel, open:

```text
Project Settings → Environment Variables
```

Add:

```text
Name: NEXT_PUBLIC_API_URL
Value: https://fixitnow-qemf.onrender.com
```

Enable it for Production, Preview, and Development. Redeploy after adding or changing a `NEXT_PUBLIC_` variable because Next.js includes public variables in the browser bundle during the build.

You do not need to know the Vercel frontend URL to configure this variable. The value is the backend API URL, not the frontend URL.

The Vercel frontend URL will matter later when the SSLCommerz payment success and cancel flow is connected to dedicated frontend pages. At that stage, the backend callback/redirect handling will be updated to return the customer to the deployed frontend.
