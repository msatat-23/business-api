# Marketplace Backend (NestJS + TypeScript + PostgreSQL)

Backend API for the Business Developer marketplace app. Built to pair with
the existing Next.js frontend (`nextjs-business`), replacing its static
`/data/*.json` files with a real, role-protected API backed by PostgreSQL.

## Stack

- **NestJS 10** (TypeScript)
- **PostgreSQL** via **TypeORM**
- **JWT auth** via `@nestjs/passport` + `passport-jwt`
- **class-validator / class-transformer** for DTO validation
- **Helmet** for security headers, **CORS** restricted to configured origins
- **@nestjs/throttler** for basic rate limiting
- **bcrypt** for password hashing

## Data model — 3 tables

| Table       | Purpose                                                                 |
|-------------|--------------------------------------------------------------------------|
| `users`     | `user`, `editor`, `admin` roles                                         |
| `home_page` | Singleton row (`id = 1`) holding every section of the home page as JSONB |
| `contacts`  | Contact form submissions (Fullname, Phone, Jobtitle, Email)             |

### Permissions

| Action                              | Anonymous | user | editor | admin |
|--------------------------------------|:---------:|:----:|:------:|:-----:|
| `GET /home` (read home page)         | ✅        | ✅   | ✅     | ✅    |
| `PATCH /home` (edit home page)       | ❌        | ❌   | ✅     | ✅    |
| `POST /contact` (submit contact form)| ✅        | ✅   | ✅     | ✅    |
| `GET /contact` (list submissions)    | ❌        | ❌   | ❌     | ✅    |
| `GET/POST/PATCH/DELETE /users/*`     | ❌        | ❌   | ❌     | ✅    |
| `POST /auth/register`                | ✅ (creates a `user`) | — | — | — |
| `POST /auth/login`                   | ✅        | ✅   | ✅     | ✅    |

All routes require a valid JWT **by default**; only routes explicitly
marked `@Public()` (register, login, `GET /home`, `POST /contact`) skip
authentication. This is enforced globally in `AppModule` (secure-by-default).

> Note: only admins can create `editor`/`admin` accounts (via `POST /users`).
> Public self sign-up (`POST /auth/register`) always creates a plain `user`.
> Reading contact submissions is restricted to admins (not specified in the
> original brief but a sensible default — change this in
> `contact.controller.ts` if you want editors to see leads too).

## Getting started

### 1. Prerequisites

- Node.js 18+
- A running PostgreSQL instance (local, Docker, or managed)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your PostgreSQL credentials, `JWT_SECRET`, allowed
`CORS_ORIGINS` (your Next.js app URL), and the bootstrap admin
credentials (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`).

### 4. Create the database

```bash
createdb marketplace_db
# or, in psql:
# CREATE DATABASE marketplace_db;
```

### 5. Run migrations (creates the 3 tables)

```bash
npm run migration:run
```

### 6. Seed the data

Loads the original `/data/*.json` content into `home_page` and creates the
bootstrap admin account:

```bash
npm run seed
```

### 7. Start the API

```bash
npm run start:dev
```

The API is served at `http://localhost:3001/api/v1`.
Health check: `GET http://localhost:3001/api/v1/health` (not versioned data,
just liveness).

## API reference

Base URL: `/api/v1`

### Auth

- `POST /auth/register` — `{ fullName, email, password }` → creates a `user`, returns `{ accessToken, user }`
- `POST /auth/login` — `{ email, password }` → `{ accessToken, user }`

Send the token on protected requests: `Authorization: Bearer <accessToken>`

### Home

- `GET /home` — public, returns the full home page document (all sections)
- `PATCH /home` — editor/admin only, body accepts any subset of:
  `site, heroSection, heroDashboard, chartData, navigation, services, capabilities, methodology, roadmap, portfolio, sectorPlaybooks`

### Contact

- `POST /contact` — public, body: `{ fullName, phone, jobTitle, email }`
- `GET /contact` — admin only, list all submissions
- `GET /contact/:id` — admin only

### Users (admin only)

- `POST /users` — `{ fullName, email, password, role? }`
- `GET /users` — list all users
- `GET /users/:id`
- `PATCH /users/:id` — `{ fullName?, email?, password?, isActive? }`
- `PATCH /users/:id/role` — `{ role: "user" | "editor" | "admin" }`
- `DELETE /users/:id`

## Project structure

```
src/
  common/            guards, decorators, filters, interceptors, enums
  config/            env config loader + TypeORM DataSource
  database/
    migrations/      SQL migrations (source of truth for schema)
    seeds/           seed.ts + copied data/*.json from the Next.js app
  modules/
    auth/            register/login, JWT strategy
    users/           user CRUD + role management (admin only)
    home/            singleton home page CMS (public read, editor/admin write)
    contact/         public contact form + admin inbox
  app.module.ts
  app.controller.ts  health check
  main.ts            bootstrap: helmet, cors, validation, prefix/versioning
```

## Security & best practices baked in

- Passwords hashed with bcrypt (never returned in API responses — `password`
  is excluded via `class-transformer`'s `@Exclude`).
- JWT auth required globally by default (`JwtAuthGuard` + `@Public()` opt-out).
- Role-based access control via `@Roles()` + `RolesGuard`.
- `ValidationPipe` with `whitelist`/`forbidNonWhitelisted` — rejects any
  unexpected payload fields.
- Helmet security headers + configurable CORS allow-list.
- Basic rate limiting via `@nestjs/throttler`.
- Schema managed through versioned TypeORM migrations
  (`DB_SYNCHRONIZE=false` by default — never auto-sync in production).
- Consistent success/error response envelopes (`TransformInterceptor`,
  `HttpExceptionFilter`).

## Useful scripts

```bash
npm run start:dev         # watch mode
npm run build              # compile to dist/
npm run start:prod         # run compiled app
npm run seed                # load data/*.json + bootstrap admin
npm run migration:generate  # generate a new migration from entity changes
npm run migration:run       # apply pending migrations
npm run migration:revert    # roll back the last migration
npm run lint
```
"# business-api" 
