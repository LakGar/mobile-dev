# Backend Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Set Up Database

### Option A: Using PostgreSQL locally

1. **Create database:**
   ```bash
   createdb zones_db
   ```

2. **Or using psql:**
   ```bash
   psql postgres
   CREATE DATABASE zones_db;
   \q
   ```

### Option B: Using Docker

```bash
docker run --name zones-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=zones_db \
  -p 5432:5432 \
  -d postgres:14
```

## Step 3: Configure Environment Variables

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file:**
   ```env
   # Server
   PORT=3000
   NODE_ENV=development

   # Database - Update with your PostgreSQL connection string
   DATABASE_URL=postgresql://username:password@localhost:5432/zones_db

   # JWT Secrets - Generate strong random strings
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   # Redis (optional, for caching)
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # Logging
   LOG_LEVEL=info
   DEBUG=false

   # CORS - Add your frontend URL
   ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19006

   # Monitoring
   ENABLE_METRICS=true
   ```

## Step 4: Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Set up relationships and indexes
- Seed initial data (if configured)

## Step 5: Verify Database Schema

```bash
# Open Prisma Studio to view database
npx prisma studio
```

## Step 6: Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Step 7: Test API

### Test Health Endpoint

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 123.45,
  "environment": "development",
  "version": "1.0.0"
}
```

### Test Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "name": "Test User"
  }'
```

### Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

## Troubleshooting

### Database Connection Issues

1. **Check PostgreSQL is running:**
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. **Verify connection string:**
   - Check username, password, host, port, and database name
   - Test connection: `psql postgresql://username:password@localhost:5432/zones_db`

3. **Check firewall/network:**
   - Ensure PostgreSQL port (5432) is accessible

### Migration Issues

1. **Reset database (WARNING: Deletes all data):**
   ```bash
   npx prisma migrate reset
   ```

2. **Check migration status:**
   ```bash
   npx prisma migrate status
   ```

### Port Already in Use

If port 3000 is already in use:

1. **Change port in `.env`:**
   ```env
   PORT=3001
   ```

2. **Or kill process using port 3000:**
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   ```

## Production Deployment

1. **Set `NODE_ENV=production`**
2. **Use strong JWT secrets**
3. **Set up proper CORS origins**
4. **Configure database connection pooling**
5. **Set up logging aggregation**
6. **Configure monitoring and alerts**

## Next Steps

- Update frontend `.env` with `EXPO_PUBLIC_API_URL=http://localhost:3000/api`
- Test full authentication flow
- Test zone creation and management
- Test activity tracking

