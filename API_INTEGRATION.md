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

Authentication errors are normalized by `src/lib/api/client.ts`. Structured backend validation errors are shown inline and all request failures are also displayed through the shared toast provider.

## Planned mapping

| Frontend route | Backend endpoint |
| --- | --- |
| `/` and `/services` | `GET /api/services`, `GET /api/categories`, `GET /api/technicians` |
| `/technicians/[id]` | `GET /api/technicians/:id` |
| `/dashboard/customer` | `GET /api/bookings`, `GET /api/payments` |
| `/dashboard/customer/bookings/[id]/pay` | `POST /api/payments/create` |
| `/dashboard/technician` | `GET /api/technician/profile`, `GET /api/technician/availability` |
| `/dashboard/technician/bookings` | `GET /api/technician/bookings`, `PATCH /api/technician/bookings/:id` |
| `/dashboard/admin` | `GET /api/admin/users`, `GET /api/admin/bookings` |
| `/dashboard/admin/categories` | `GET /api/admin/categories`, `POST /api/admin/categories`, `PATCH /api/admin/categories/:id` |
| `/payment/success`, `/payment/cancel` | SSLCommerz redirect result UI |
