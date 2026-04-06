# Finflow — Finance Dashboard System

A full-stack finance dashboard with role-based access control, built with Node.js, Express, Prisma, SQLite, and React.

---

## Quick start

```bash
# 1. Clone and install all dependencies
npm run install:all

# 2. Set up backend environment
cp backend/.env.example backend/.env

# 3. Run database migrations
npm run db:migrate

# 4. Seed the database with demo users and sample records
npm run db:seed

# 5. Start both frontend and backend together
npm run dev
```

The app will be available at:
- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:3000
- **Swagger docs** → http://localhost:3000/api-docs

---

## Demo accounts

| Role    | Email                   | Password    | Access                          |
|---------|-------------------------|-------------|---------------------------------|
| Admin   | admin@finflow.com       | admin123    | Full access — all features      |
| Analyst | analyst@finflow.com     | analyst123  | View records + trend analytics  |
| Viewer  | viewer@finflow.com      | viewer123   | View own records + summary      |

---

## Tech stack

**Backend**
- Node.js + Express — REST API framework
- TypeScript — type safety throughout
- Prisma ORM — database access layer
- SQLite — file-based database, zero setup
- JWT — stateless authentication
- Zod — request validation
- Swagger UI — interactive API documentation

**Frontend**
- React 18 + Vite — fast dev experience
- TypeScript — consistent with backend
- Tailwind CSS — utility-first styling
- React Router v6 — client-side routing
- Recharts — data visualisation
- Axios — HTTP client with interceptors

---

## Project structure

```
finflow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database models
│   │   └── seed.ts             # Demo data seeder
│   └── src/
│       ├── routes/             # Express route handlers (with Swagger JSDoc)
│       ├── services/           # Business logic layer
│       ├── middleware/         # authenticate, authorizeRole, validate
│       ├── schemas/            # Zod validation schemas
│       ├── utils/prisma.ts     # Prisma singleton
│       └── app.ts              # Express entry point
└── frontend/
    └── src/
        ├── pages/              # Login, Dashboard, Records, Users
        ├── components/
        │   ├── layout/         # Sidebar, AppLayout
        │   └── ui/             # StatCard, Modal, Badge, etc.
        ├── api/                # Axios API functions
        └── context/            # AuthContext — user + token state
```

---

## API endpoints

All protected endpoints require `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint            | Access  | Description                  |
|--------|---------------------|---------|------------------------------|
| POST   | /api/auth/register  | Public  | Register a new user          |
| POST   | /api/auth/login     | Public  | Login, receive JWT token     |
| GET    | /api/auth/me        | All     | Get current user profile     |

### Users (admin only)
| Method | Endpoint         | Access | Description                   |
|--------|------------------|--------|-------------------------------|
| GET    | /api/users       | Admin  | List all users                |
| GET    | /api/users/:id   | Admin  | Get user by ID                |
| PATCH  | /api/users/:id   | Admin  | Update role or active status  |
| DELETE | /api/users/:id   | Admin  | Deactivate a user             |

### Records
| Method | Endpoint          | Access        | Description                        |
|--------|-------------------|---------------|------------------------------------|
| GET    | /api/records      | All           | List records (paginated, filtered) |
| GET    | /api/records/:id  | All           | Get record by ID                   |
| POST   | /api/records      | Admin         | Create a new record                |
| PATCH  | /api/records/:id  | Admin         | Update a record                    |
| DELETE | /api/records/:id  | Admin         | Soft delete a record               |

### Dashboard
| Method | Endpoint                   | Access       | Description                      |
|--------|----------------------------|--------------|----------------------------------|
| GET    | /api/dashboard/summary     | All          | Income, expense, net balance     |
| GET    | /api/dashboard/trends      | Analyst+     | Monthly income vs expense trends |
| GET    | /api/dashboard/categories  | All          | Totals grouped by category       |

### Query parameters for GET /api/records
| Param    | Type   | Example        | Description           |
|----------|--------|----------------|-----------------------|
| type     | string | income         | Filter by type        |
| category | string | Salary         | Filter by category    |
| from     | string | 2026-01-01     | Filter from date      |
| to       | string | 2026-04-30     | Filter to date        |
| page     | number | 1              | Page number           |
| limit    | number | 10             | Records per page      |

---

## Architecture decisions

**Why SQLite over PostgreSQL?**
SQLite is file-based, requires zero installation or cloud credentials, and is perfectly capable for this scale. The entire database is a single `finance.db` file which makes the project truly self-contained. Switching to PostgreSQL only requires changing the `DATABASE_URL` in `.env` and updating the Prisma provider.

**Why Prisma over raw SQL or Knex?**
Prisma generates a fully typed client from the schema, which means query results are typed automatically — no manual interface definitions needed. The migration system also keeps schema changes auditable and reversible.

**Role hierarchy via numeric levels**
Instead of checking `role === 'ADMIN' || role === 'ANALYST'` everywhere, the `authorizeRole` middleware uses a numeric hierarchy (`VIEWER=1, ANALYST=2, ADMIN=3`). Calling `authorizeRole('ANALYST')` automatically allows admins too — one line, no logic duplication.

**Soft delete on records**
Records are never permanently removed. A `deletedAt` timestamp is set instead, and all queries filter `deletedAt: null`. This preserves data integrity and makes accidental deletion recoverable.

**Role-scoped record access**
Viewers and analysts only see their own records. Admins see all records. This is handled inside `recordService.getAll` based on `req.user.role` — same endpoint, different data, no duplicate routes.

**Monorepo with shared scripts**
Both apps live in one repository. The root `package.json` exposes `npm run dev` (starts both), `npm run build` (builds both), and `npm run start` (runs backend serving the built frontend). One repo, one deploy.

---

## Deployment (Render)

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Set build command: `npm run install:all && npm run db:migrate && npm run build`
4. Set start command: `npm run start`
5. Add environment variables:
   - `DATABASE_URL=file:./finance.db`
   - `JWT_SECRET=<your-secret>`
   - `NODE_ENV=production`
   - `PORT=3000`

The backend serves the built React app as static files in production.

---

## Assumptions made

- Roles are flat (viewer / analyst / admin) with a clear hierarchy — no custom role definitions needed for this scope.
- Financial records belong to one user (the creator). Admins can see all records; others see only their own.
- Soft delete is used for records; hard delete is used for nothing. User deactivation sets `isActive: false` rather than removing the row.
- Dates are stored as UTC `DateTime` in Prisma and formatted on the frontend for display.
- Authentication tokens expire after 7 days. No refresh token mechanism is implemented — considered out of scope for this assessment.
- Currency is displayed in Indian Rupees (INR) on the frontend. The backend stores plain floats with no currency metadata.
