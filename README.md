# SalesCRM (Frontend + Backend)

SalesCRM is a full-stack application consisting of a Vite + React frontend and an Express + Prisma backend. It provides dashboards, customer overview, call history, admin management, authentication, and localized UI (ID/EN).

## Team

| Student-ID  | Name                            | Path                     | Status |
| ----------- | ------------------------------- | ------------------------ | ------ |
| R128D5Y1308 | Muhammad Kemal Syah Rafi        | React & Back-End with AI | Aktif  |
| R128D5Y0470 | Dharmawan Surya Kusuma          | React & Back-End with AI | Aktif  |
| M128D5Y1294 | Muhammad Ikhlas Hilmi Nurrabban | Machine Learning         | Aktif  |
| R128D5Y1057 | Mahdi Shidqi                    | Machine Learning         | Aktif  |
| R128D5Y1206 | Muhammad Akram Daffa            | React & Back-End with AI | Aktif  |

## Repository Structure

```
Lead-Banking-Sales-Prediction_Kolam-PNJ/
  Frontend/
    package.json
    vite.config.js
    src/
      components/
        ui/
          tables/
          dialogs/
          dropdown/
          header/
          cards/
          badges/
      contexts/
      hooks/
      lib/
        langs.js
        axios.js
      pages/
  backend/
    package.json
    prisma/
      schema.prisma
    src/
      app.js
      routes/
      controllers/
      services/
      repositories/
      middlewares/
      config/
      utils/
      validation/
```

## Prerequisites

- Node.js 18+ (recommended 18 or 20)
- npm 9+
- Postgres (or your chosen database supported by Prisma)

## Environment Setup

Create `backend/.env` and adjust to your environment:

```
DATABASE_URL="postgresql://user:pass@localhost:5432/salescrm"
JWT_SECRET="a-strong-secret"
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60
PORT=3000
NODE_ENV=development
```

Optional Frontend env (if using Vite env for API base URL): create `Frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:3000
```

By default, the frontend axios client points to `http://localhost:3000`.

## Install & Run (Windows PowerShell)

Backend:

```powershell
cd backend
npm install
npm run prisma:generate ; npm run prisma:migrate
npm run seed
npm run dev
```

Frontend:

```powershell
cd Frontend
npm install
npm run dev
```

Open the frontend (usually http://localhost:5173). The API should be available at http://localhost:3000.

## Features Overview

- Dashboard cards and charts (deposit pie, sales bars, call history)
- Customer Overview with server-side pagination, filters (grade, keyword), and localized columns
- Call History table with export dialog and note viewer
- Admin management (list, bulk import, activate/deactivate, reset password)
- Authentication (Login, Change Password)
- Profile dropdown: language toggle (ID/EN), theme toggle, logout

## Localization (ID/EN)

- Dictionaries in `Frontend/src/lib/langs.js` under namespaces: `page.*`, `table.*`, `dialog.*`, `dropdown.*`, `header.*`, `auth.loginForm.*`.
- Use `const { t } = useLang();` and call `t("namespace.path")` in components.

## Data Tables, Search & Pagination

- Shared table component: `Frontend/src/components/ui/tables/data-table.jsx`.
- Server-side pagination via `useTable()` (sends `page`, `limit`, `search`, filters).
- Debounced search input (300ms) to reduce burst requests.
- Filters are batched and applied via dropdown components.

## Backend Modules

- Routes: `src/routes/*` (auth, admin, sales operations)
- Controllers: `src/controllers/*`
- Services: `src/services/*`
- Repositories: `src/repositories/*` (Prisma queries)
- Middlewares: auth, role, rate limiter, validation, error handler
- Config: env, prisma client, security (CORS)

Common endpoints:

- Auth: `POST /auth/login`, `POST /auth/change-password`
- Admins: `GET/POST/PUT/DELETE /admin`, bulk import, reset, deactivate
- Sales Ops: `GET /sales/leads`, `GET /sales/call-history`, `POST /sales/log-call`, `GET /sales/export`

## Replication Notes

- Ensure DB is reachable and Prisma migrations succeed.
- Configure CORS to allow the frontend origin in `backend/src/config/security.config.js`.
- Tune rate limits via env to match frontend behavior (search is debounced).

## Troubleshooting

- 429 Too Many Requests: slow down interactions; increase debounce or add minimum search length.
- Blank data: confirm backend is running and frontend API base URL is correct.
- Prisma errors: verify `schema.prisma`, run migrations, and check DB connectivity.

## Scripts

Frontend (`Frontend/package.json`): `dev`, `build`, `preview`.
Backend (`backend/package.json`): `dev`, `prisma:generate`, `prisma:migrate`, `seed`, `test`.

## 📸 Screenshots

|                                                            |                                                            |                                                        |
| :--------------------------------------------------------: | :--------------------------------------------------------: | :----------------------------------------------------: |
|    ![Dashboard](assets/screenshots/sales-dashboard.png)    |           ![Login](assets/screenshots/login.png)           | ![Customer List](assets/screenshots/customer-list.png) |
| ![Assignment List](assets/screenshots/assignment-list.png) |    ![Call History](assets/screenshots/call-history.png)    |         ![Admin](assets/screenshots/admin.png)         |
|        ![Add User](assets/screenshots/add-user.png)        | ![Change Password](assets/screenshots/change-password.png) |                                                        |

### Screenshots Index

| Name             | File                                   |
| ---------------- | -------------------------------------- |
| Dashboard        | assets/screenshots/sales-dashboard.png |
| Login            | assets/screenshots/login.png           |
| Customer List    | assets/screenshots/customer-list.png   |
| Assignment List  | assets/screenshots/assignment-list.png |
| Call History     | assets/screenshots/call-history.png    |
| Admin Management | assets/screenshots/admin.png           |
| Admin Add User   | assets/screenshots/add-user.png        |
| Change Password  | assets/screenshots/change-password.png |

## License

Proprietary project for capstone. Use internally unless otherwise specified.
