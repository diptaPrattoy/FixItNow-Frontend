# FixItNow API Integration

Backend base URL:

```text
https://fixitnow-qemf.onrender.com
```

The frontend reads the base URL from `NEXT_PUBLIC_API_URL`.

## Planned route mapping

| Frontend route | Backend endpoint |
| --- | --- |
| `/` and `/services` | `GET /api/services`, `GET /api/categories`, `GET /api/technicians` |
| `/technicians/[id]` | `GET /api/technicians/:id` |
| `/auth/register` | `POST /api/auth/register` |
| `/auth/login` | `POST /api/auth/login` |
| `/dashboard/customer` | `GET /api/bookings`, `GET /api/payments` |
| `/dashboard/customer/bookings/[id]/pay` | `POST /api/payments/create` |
| `/dashboard/technician` | `GET /api/technician/profile`, `GET /api/technician/availability` |
| `/dashboard/technician/bookings` | `GET /api/technician/bookings`, `PATCH /api/technician/bookings/:id` |
| `/dashboard/admin` | `GET /api/admin/users`, `GET /api/admin/bookings` |
| `/dashboard/admin/categories` | `GET /api/admin/categories`, `POST /api/admin/categories`, `PATCH /api/admin/categories/:id` |

This document will be updated as each frontend module is implemented.
