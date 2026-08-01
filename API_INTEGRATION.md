# FixItNow API Integration

Backend base URL:

```text
https://fixitnow-qemf.onrender.com
```

Browser API requests read `NEXT_PUBLIC_API_URL`. Server-side SSLCommerz callback forwarding reads `BACKEND_API_URL`.

## Implemented mapping

| Frontend component or route | Backend endpoint | Status |
| --- | --- | --- |
| `/auth/register` | `POST /api/auth/register` | Implemented |
| `/auth/login` | `POST /api/auth/login` | Implemented |
| Header authentication state | JWT returned by login | Implemented |
| `/services` category selector | `GET /api/categories` | Implemented |
| `/services` service grid and filters | `GET /api/services` | Implemented |
| Home page featured services | `GET /api/services` | Implemented |
| `/technicians` search and listing | `GET /api/technicians` | Implemented |
| `/technicians/[id]` public profile | `GET /api/technicians/:id` | Implemented |
| Technician profile booking form | `POST /api/bookings` | Implemented |
| `/dashboard/customer` booking history | `GET /api/bookings` | Implemented |
| Customer booking cancellation | `PATCH /api/bookings/:id/cancel` | Implemented |
| `/dashboard/customer/bookings/[id]/pay` booking review | `GET /api/bookings/:id` | Implemented |
| `/dashboard/customer/bookings/[id]/pay` checkout initiation | `POST /api/payments/create` | Implemented |
| `/dashboard/customer/payments` payment history | `GET /api/payments` | Implemented |
| Frontend SSLCommerz callback proxies | Backend `POST /api/payments/success`, `/fail`, `/cancel`, `/ipn` | Implemented |
| `/payment/success`, `/payment/cancel` | SSLCommerz result UI | Implemented |
| Completed booking review dialog | `POST /api/reviews` | Implemented |
| Technician profile workspace | `GET /api/technician/profile`, `PUT /api/technician/profile` | Implemented |
| Technician service management | `GET`, `POST`, `PATCH`, `DELETE /api/technician/services` | Implemented |
| Technician service category selector | `GET /api/categories` | Implemented |
| `/dashboard/technician/availability` scheduler | `GET`, `POST`, `PATCH`, `DELETE /api/technician/availability` | Implemented |
| `/dashboard/technician/bookings` booking workflow | `GET /api/technician/bookings`, `PATCH /api/technician/bookings/:id` | Implemented |
| `/dashboard/admin/users` user management | `GET /api/admin/users`, `PATCH /api/admin/users/:id` | Implemented |
| `/dashboard/admin` live statistics | `GET /api/admin/users`, `GET /api/admin/bookings` | Implemented |
| `/dashboard/admin/bookings` booking oversight | `GET /api/admin/bookings` | Implemented |
| `/dashboard/admin/categories` category management | `GET /api/admin/categories`, `POST /api/admin/categories`, `PATCH /api/admin/categories/:id` | Implemented |

All browser request failures are normalized by `src/lib/api/client.ts` and displayed through the shared toast provider. Public discovery routes also provide skeleton loading, empty-result feedback and App Router `error.tsx` fallbacks.

## SSLCommerz callback flow

1. The customer starts payment from `/dashboard/customer/bookings/[id]/pay`.
2. `POST /api/payments/create` returns the SSLCommerz hosted checkout URL.
3. The browser redirects to SSLCommerz.
4. SSLCommerz posts its result to the deployed frontend callback route under `/api/payments/*`.
5. The Next.js route handler forwards the original callback payload to the Render backend for authoritative validation.
6. The frontend route redirects the browser to `/payment/success` or `/payment/cancel`.

The backend Render environment variable `APP_BASE_URL` must therefore point to the deployed Vercel frontend origin after the frontend is deployed.

## Route protection

Authenticated dashboard routes are guarded by `src/proxy.ts` using a lightweight session marker and role cookie. A client-side dashboard guard also checks the locally stored authenticated user before rendering a role workspace. Backend JWT authorization remains authoritative for protected API calls.
