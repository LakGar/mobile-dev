# Zones Backend API

Backend API for the Zones mobile app, built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- ✅ Structured logging with Winston
- ✅ Error handling middleware
- ✅ Request ID tracking
- ✅ Health check endpoints
- ✅ Security middleware (Helmet, CORS)
- 🔄 Authentication (in progress)
- 🔄 Database integration (in progress)
- 🔄 API endpoints (in progress)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up database:
```bash
# Create database
createdb zones_db

# Run migrations (when Prisma is set up)
npm run migrate
```

4. Start development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /api/health` - Simple health check
- `GET /api/health/detailed` - Detailed health check with service dependencies

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── repositories/    # Data access
│   ├── models/          # Database models
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utilities
│   ├── routes/          # Route definitions
│   └── app.ts           # Express app setup
├── tests/               # Test files
├── scripts/             # Utility scripts
└── logs/                # Log files
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code

## Environment Variables

See `.env.example` for all available environment variables.

## Logging

Logs are written to:
- Console (development)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)

Log levels: `error`, `warn`, `info`, `debug`, `verbose`

## License

ISC

