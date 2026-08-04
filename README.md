# Business API - NestJS + Prisma + PostgreSQL

A modern, production-ready NestJS backend API for a business marketplace platform with role-based access control, home page CMS, and contact form management.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User, Editor, Admin)
  - Secure password hashing with bcrypt

- **Database**
  - PostgreSQL with Prisma ORM
  - Type-safe database operations
  - Automated migrations

- **Modules**
  - Auth: User registration and login
  - Users: User management (admin only)
  - Home: Singleton CMS for homepage content
  - Contact: Public contact form with admin inbox

- **Security**
  - Helmet for security headers
  - CORS configuration
  - Rate limiting with `@nestjs/throttler`
  - Input validation with class-validator
  - Password exclusion from API responses

- **Code Quality**
  - TypeScript strict mode
  - ESLint + Prettier for code formatting
  - Consistent error handling
  - Structured logging

## Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL 12+

## Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd business-api
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/marketplace_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="1d"

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"

# Seed
SEED_ADMIN_EMAIL="admin@business-dev.com"
SEED_ADMIN_PASSWORD="ChangeMe123!"
SEED_ADMIN_FULLNAME="Super Admin"

# Throttling
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

4. **Run database migrations**

```bash
npm run prisma:migrate "init"
```

5. **Generate Prisma Client**

```bash
npm run prisma:generate
```

6. **Seed the database (optional)**

```bash
npm run seed
```

This will create a bootstrap admin user and populate home page content from seed data.

7. **Start development server**

```bash
npm run start:dev
```

Server will run at `http://localhost:3001`

## API Documentation

Health check: `GET http://localhost:3001/api/v1/health` (not versioned data, just liveness).

## API Reference

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

## Project Structure

```
src/
  common/            guards, decorators, filters, interceptors, enums
  config/            configuration + Prisma service
  database/
    migrations/      Prisma migrations (auto-generated)
    seeds/           seed.ts + copied data/*.json from the Next.js app
  modules/
    auth/            register/login, JWT strategy
    users/           user CRUD + role management (admin only)
    home/            singleton home page CMS (public read, editor/admin write)
    contact/         public contact form + admin inbox
  app.module.ts
  app.controller.ts  health check
  main.ts            bootstrap: helmet, cors, validation, prefix/versioning

prisma/
  schema.prisma      Prisma schema definition
```

## Security & Best Practices

- Passwords hashed with bcrypt (never returned in API responses — `password` is excluded via `class-transformer`'s `@Exclude`).
- JWT auth required globally by default (`JwtAuthGuard` + `@Public()` opt-out).
- Role-based access control via `@Roles()` + `RolesGuard`.
- `ValidationPipe` with `whitelist`/`forbidNonWhitelisted` — rejects any unexpected payload fields.
- Helmet security headers + configurable CORS allow-list.
- Basic rate limiting via `@nestjs/throttler`.
- Schema managed through Prisma migrations (declarative, type-safe).
- Consistent success/error response envelopes (`TransformInterceptor`, `HttpExceptionFilter`).

## Useful Scripts

```bash
# Development
npm run start:dev         # watch mode
npm run start:debug       # debug mode

# Building
npm run build             # compile to dist/
npm run start:prod        # run compiled app

# Database
npm run seed              # load data/*.json + bootstrap admin
npm run prisma:migrate    # create new migration from schema changes
npm run prisma:migrate:prod # deploy migrations in production
npm run prisma:generate   # regenerate Prisma Client
npm run prisma:studio     # open Prisma Studio to view/edit data
npm run prisma:format     # format Prisma schema

# Code Quality
npm run lint              # run ESLint with auto-fix
npm run format            # format code with Prettier
```

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/marketplace_db` |
| `JWT_SECRET` | Secret key for JWT signing | `dev-secret-change-me` |
| `JWT_EXPIRES_IN` | JWT expiration time | `1d` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `CORS_ORIGINS` | Comma-separated CORS allow-list | `http://localhost:3000` |
| `SEED_ADMIN_EMAIL` | Bootstrap admin email | `admin@business-dev.com` |
| `SEED_ADMIN_PASSWORD` | Bootstrap admin password | `ChangeMe123!` |
| `SEED_ADMIN_FULLNAME` | Bootstrap admin full name | `Super Admin` |
| `THROTTLE_TTL` | Rate limit time window (ms) | `60000` |
| `THROTTLE_LIMIT` | Max requests per time window | `100` |

## Development Workflow

1. **Make schema changes** in `prisma/schema.prisma`
2. **Create migration**:
   ```bash
   npm run prisma:migrate "describe-your-change"
   ```
3. **Review migration** in `prisma/migrations/`
4. **Generate types**:
   ```bash
   npm run prisma:generate
   ```
5. **Update services** to use new types
6. **Test locally**:
   ```bash
   npm run start:dev
   ```

## Deployment

### Production Checklist

- [ ] Update `.env` with production database URL
- [ ] Set strong `JWT_SECRET`
- [ ] Update `CORS_ORIGINS` to match your frontend domain
- [ ] Set `NODE_ENV=production`
- [ ] Build application: `npm run build`
- [ ] Deploy migrations: `npm run prisma:migrate:prod`
- [ ] Start server: `npm run start:prod`

### Deployment with Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build
RUN npm run prisma:generate

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
```

## Troubleshooting

### "DATABASE_URL is not set"
- Ensure `.env` file exists with `DATABASE_URL` variable
- Format: `postgresql://user:password@host:port/database`

### "Cannot find Prisma Client"
- Run `npm run prisma:generate` to regenerate

### Migration errors
- Check PostgreSQL is running
- Verify connection string is correct
- Ensure database exists

### Port already in use
- Change `PORT` in `.env` or use: `PORT=3002 npm run start:dev`

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Run `npm run lint` and `npm run format`
4. Create a pull request

## License

UNLICENSED
