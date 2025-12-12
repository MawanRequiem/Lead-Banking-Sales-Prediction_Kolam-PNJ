# SalesCRM Frontend

A Vite + React frontend for SalesCRM. It provides dashboards, customer overview, call history, admin management, and localized UI (ID/EN). The project is structured with shared UI components, hooks, contexts, pages, and localization dictionaries.

## Project Structure

```
Frontend/
	components.json
	eslint.config.js
	index.html
	jsconfig.json
	package.json
	vite.config.js
	public/
	src/
		App.css
		App.jsx
		index.css
		main.jsx
		assets/
		components/
			ui/
				tables/
				dialogs/
				dropdown/
				header/
				cards/
				badges/
		contexts/
			theme-context.jsx
			theme-context-consts.jsx
		hooks/
			useLang.js
			useTable.js
			useCallHistory.js
			useAdmins.js
			useProfile.jsx
		lib/
			axios.js
			date-utils.js
			utils.js
			chart-strings.js
			langs.js
		pages/
			Dashboard.jsx
			CustomerOverviewPage.jsx
			CallHistoryPage.jsx
			AdminPage.jsx
			AssigmentPage.jsx
			NotFound.jsx
```

Key points:

- `src/lib/langs.js`: central i18n dictionaries. Use `useLang()` → `t(key)`.
- `src/components/ui/tables/data-table.jsx`: shared table with server-side pagination and debounced search.
- `src/components/ui/dialogs/*`: dialogs (customer details, export, verify, admin actions).
- `src/components/ui/dropdown/*`: filter controls (date range, grade, keyword) using localized labels.

## Prerequisites

- Node.js 18+ (recommended 18 or 20)
- npm 9+
- Backend server running (see Back-End setup below) on `http://localhost:3000` by default

## Quick Start (Windows PowerShell)

Install dependencies and run frontend dev server:

```powershell
cd Frontend
npm install
npm run dev
```

This starts Vite on a local port (usually 5173). The app expects the backend API at `http://localhost:3000`.

## Environment Configuration

The frontend reads API base URL from `src/lib/axios.js`. If you need to change it, adjust that file or set Vite envs.

Example `src/lib/axios.js` expectation:

- Base URL: `http://localhost:3000`
- Sends credentials when required

If you prefer Vite envs, create `.env` in `Frontend/`:

```
VITE_API_BASE_URL=http://localhost:3000
```

Then update the axios client to read `import.meta.env.VITE_API_BASE_URL`.

## Back-End Setup (for full replication)

The backend lives in `backend/` and uses Express + Prisma.

```powershell
cd backend
npm install
# Setup Prisma database (Postgres recommended). Configure DATABASE_URL in backend/.env
# Example .env:
# DATABASE_URL="postgresql://user:pass@localhost:5432/salescrm"
# JWT_SECRET="a-strong-secret"
# RATE_LIMIT_WINDOW_MS=60000
# RATE_LIMIT_MAX=60

# Initialize Prisma and seed (if provided)
npm run prisma:generate ; npm run prisma:migrate ; npm run seed

# Start backend (dev)
npm run dev
```

Common scripts may include (check `backend/package.json`):

- `dev`: start with nodemon
- `prisma:generate`: generate Prisma client
- `prisma:migrate`: run migrations
- `seed`: seed initial data

## Features Overview

- Dashboard cards and charts (deposit pie, sales bars, call history snippets)
- Customer Overview with server-side pagination, filters (grade, keyword), and localized columns
- Call History table with export dialog and note viewer
- Admin management table with bulk import and status toggles
- Authentication pages (Login, Change Password) with localized strings
- Profile dropdown: language toggle (ID/EN), theme toggle, logout

## Localization (ID/EN)

- Dictionaries in `src/lib/langs.js` under namespaces: `page.*`, `table.*`, `dialog.*`, `dropdown.*`, `header.*`, `auth.loginForm.*`.
- Use `const { t } = useLang();` and call `t("namespace.path")`.
- Missing keys fall back to provided default strings where used.

## Pagination & Search

- Tables use server-side pagination; `useTable()` sends `page`, `limit`, `search`, and filters to the backend.
- Search in the shared table is debounced (300ms) to reduce request bursts.
- Filters (grade, keyword, date range) are batched by the dropdown and applied via `onApply`.

## Rate Limits & Performance Tips

- Avoid rapid typing; debounce already applied.
- Add a minimum search length (2–3 chars) if your backend is strict.
- Consider caching responses for recent searches and pages.

## Development Tips

- Run frontend and backend in separate terminals.
- Ensure CORS is correctly configured on backend for the frontend origin.
- Verify `.env` values and Prisma database connectivity.

## Scripts

Frontend `npm` scripts (see `Frontend/package.json`):

- `dev`: start Vite dev server
- `build`: production build
- `preview`: preview built assets

## Troubleshooting

- 429 Too Many Requests: slow down interactions; the search input is debounced, but consider increasing the debounce or adding min length.
- Blank data: check backend is running and `VITE_API_BASE_URL` or axios base URL points correctly.
- Prisma errors: confirm database is reachable and migrations ran.

## License

Proprietary project for capstone. Use internally unless otherwise specified.
