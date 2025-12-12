# SalesCRM Backend

Express + Prisma backend powering SalesCRM. Provides authentication, admin management, sales operations (assignments, leads, call history, log call), and rate limiting.

## Project Structure

```
backend/
  jest.config.js
  nodemon.json
  package.json
  test-connection.js
  prisma/
    schema.prisma
    schema.prisma.backup
    seed.js
  scripts/
    health-check.js
    seed.js
  src/
    app.js
    test.js
    config/
      env.js
      logger.js
      prisma.js
      security.config.js
    controllers/
      admin.controller.js
      assignment.controller.js
      authentication.controller.js
      sales-operation.controller.js
    jobs/
      scheduler.js
    middlewares/
      audit.middleware.js
      auth.middleware.js
      errorHandler.middleware.js
      rateLimiter.middleware.js
      role.middleware.js
      validation.middleware.js
    repositories/
      admin.repository.js
      assignment.repository.js
      nasabah.repository.js
      sales-operation.repository.js
      sales.repository.js
      token.repository.js
    routes/
      admin.routes.js
      authentication.routes.js
      sales-operation.routes.js
    services/
      admin.service.js
      assignment.service.js
      authentication.service.js
      sales-operation.service.js
      sales.service.js
    utils/
      encryption.util.js
      error.util.js
      password.util.js
      prismaEncryption.util.js
      response.util.js
      sanitizers.util.js
      security.util.js
      token.util.js
      validators.util.js
    validation/
      schemas/
        admin.schema.js
        auth.schema.js
    tests/
      setup.js
      integration/
        admin.routes.test.js
      postman/
        test.postman-collection.json
        test.postman-environment.example.json
      unit/
        services/
```

## Environment

Create `backend/.env`:

```
DATABASE_URL="postgresql://user:pass@localhost:5432/salescrm"
JWT_SECRET="a-strong-secret"
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60
PORT=3000
NODE_ENV=development
```

Adjust to your DB and security requirements.

## Setup & Run (Windows PowerShell)

```powershell
cd backend
npm install

# Prisma setup
npm run prisma:generate ; npm run prisma:migrate

# Seed data (optional if seed.js provided)
npm run seed

# Start dev server (nodemon)
npm run dev
```

The server listens on `http://localhost:3000` by default.

## Key Modules

- `middlewares/rateLimiter.middleware.js`: protects against bursts (returns 429). Configure via env.
- `middlewares/auth.middleware.js`: JWT auth; checks role via `role.middleware.js`.
- `repositories/*`: Prisma queries encapsulated per domain.
- `controllers/*`: HTTP layer handling requests and responses.
- `routes/*`: Route definitions wiring controllers and validation.
- `validation/schemas/*`: Joi/Zod-style request validation (e.g., admin, auth).

## Common Routes

- Auth: `POST /auth/login`, `POST /auth/change-password`
- Admins: `GET/POST/PUT/DELETE /admin` plus bulk import/reset/deactivate
- Sales Ops:
  - Leads: `GET /sales/leads` (supports `page`, `limit`, `search`, `grade`, etc.)
  - Call History: `GET /sales/call-history`
  - Log Call: `POST /sales/log-call`
  - Export: `GET /sales/export` (CSV)

## Testing

- Jest config present; run tests with:

```powershell
cd backend
npm test
```

Integration tests live under `src/tests/integration/`.

## Replication Notes

- Ensure DB is reachable and migrations succeed.
- CORS: allow frontend origin (Vite dev server) in `src/config/security.config.js`.
- Rate limits: tune `RATE_LIMIT_*` envs to match frontend behavior (debounced search already implemented).

## Troubleshooting

- 429 Too Many Requests: reduce client request rate, verify window/max env values.
- Prisma migration issues: check `schema.prisma` and run `prisma migrate reset` on dev DB if needed.
- JWT errors: confirm `JWT_SECRET` and token issuance/expiration in `authentication.service.js`.
