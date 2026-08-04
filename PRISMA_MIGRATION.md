# Prisma Migration Guide

This project has been migrated from **TypeORM** to **Prisma ORM**.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Update your `.env` file with the `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/marketplace_db"
```

### 3. Run Migrations

Create and apply the initial Prisma migration:

```bash
# Create a new migration from schema changes
npm run prisma:migrate "init"

# Or in production, deploy existing migrations
npm run prisma:migrate:prod
```

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Seed the Database (Optional)

Populate the database with initial data:

```bash
npm run seed
```

### 6. View Database (Development Only)

Open Prisma Studio to browse/edit data:

```bash
npm run prisma:studio
```

## Key Changes

### Removed
- `@nestjs/typeorm` - TypeORM integration
- `typeorm` - TypeORM ORM
- TypeORM configuration files (`src/config/typeorm.config.ts`)
- TypeORM decorators from entities

### Added
- `@prisma/client` - Prisma Client
- `prisma` - Prisma CLI
- `src/config/prisma.service.ts` - Prisma service for NestJS
- `prisma/schema.prisma` - Prisma schema definition

### Modified
- `app.module.ts` - Now uses PrismaService instead of TypeOrmModule
- All service files - Replaced TypeORM Repository with Prisma Client
- Module files - Removed TypeOrmModule imports
- `package.json` - Updated dependencies and scripts
- `.env.example` - Added DATABASE_URL format

## Database Connection

The application reads the `DATABASE_URL` environment variable from `.env`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/marketplace_db"
```

## File Structure

```
project/
├── prisma/
│   └── schema.prisma          # Prisma schema definition
├── src/
│   ├── config/
│   │   └── prisma.service.ts  # Prisma service for NestJS
│   ├── database/
│   │   └── seeds/
│   │       └── seed.ts        # Seed script (now uses Prisma)
│   └── modules/
��       ├── users/
│       ├── home/
│       └── contact/
└── .env                        # Environment variables
```

## Common Commands

```bash
# Start development server
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Create a new migration
npm run prisma:migrate "add_column"

# Deploy migrations in production
npm run prisma:migrate:prod

# Generate Prisma Client
npm run prisma:generate

# Format Prisma schema
npm run prisma:format

# Open Prisma Studio
npm run prisma:studio

# Seed database
npm run seed
```

## Migration from TypeORM to Prisma

All TypeORM `Repository` patterns have been replaced with Prisma Client methods:

### Example: Finding a User

**TypeORM (old)**:
```typescript
const user = await this.usersRepository.findOne({
  where: { email }
});
```

**Prisma (new)**:
```typescript
const user = await this.prisma.user.findUnique({
  where: { email }
});
```

Refer to [Prisma Documentation](https://www.prisma.io/docs/) for more examples.
