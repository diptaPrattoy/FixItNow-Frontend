# FixItNow API Integration

Backend base URL:

```text
https://fixitnow-qemf.onrender.com
```

The frontend reads the base URL from `NEXT_PUBLIC_API_URL`.

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
| Technician profile workspace | `GET /api/technician/profile`, `PUT /api/technician/profile` | Implemented |
| Technician service management | `GET`, `POST`, `PATCH`, `DELETE /api/technician/services` | Implemented |
| Technician service category selector | `GET /api/categories` | Implemented |
| `/dashboard/technician/availability` scheduler | `GET`, `POST`, `PATCH`, `DELETE /api/technician/availability` | Implemented |
| `/dashboard/technician/bookings` booking workflow | `GET /api/technician/bookings`, `PATCH /api/technician/bookings/:id` | Implemented |

All request failures are normalized by `src/lib/api/client.ts` and displayed through the shared toast provider. Public discovery routes also provide skeleton loading, empty-result feedback and App Router `error.tsx` fallbacks.

## Planned mapping

| Frontend route | Backend endpoint |
| --- | --- |
| `/dashboard/customer` payment history | `GET /api/payments` |
| `/dashboard/customer/bookings/[id]/pay` | `POST /api/payments/create` |
| `/dashboard/admin` | `GET /api/admin/users`, `GET /api/admin/bookings` |
| `/dashboard/admin/categories` | `GET /api/admin/categories`, `POST /api/admin/categories`, `PATCH /api/admin/categories/:id` |
| `/payment/success`, `/payment/cancel` | SSLCommerz redirect result UI |

## Route protection

Authenticated dashboard routes are guarded by `src/proxy.ts` using a lightweight session marker and role cookie. A client-side dashboard guard also checks the locally stored authenticated user before rendering a role workspace. Backend JWT authorization remains authoritative for protected API calls.
