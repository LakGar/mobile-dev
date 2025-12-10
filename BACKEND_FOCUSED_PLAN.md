# Backend Implementation Plan - Focused on Architecture, Scaling, Logging & Monitoring

## Core Focus Areas
Based on feedback, this plan emphasizes:
1. **Software Architecture & Design** - Proper structure, patterns, scalability
2. **Scaling** - Performance optimization, handling growth
3. **Logging** - Comprehensive logging system
4. **Monitoring** - Health checks, metrics, observability
5. **Debugging** - Error handling, debugging tools, troubleshooting

---

## 1. Software Architecture & Design

### Architecture Pattern: Layered Architecture
```
┌─────────────────────────────────────┐
│         API Layer (Routes)          │
├─────────────────────────────────────┤
│      Controller Layer (Logic)       │
├─────────────────────────────────────┤
│      Service Layer (Business)       │
├─────────────────────────────────────┤
│      Repository Layer (Data)        │
├─────────────────────────────────────┤
│         Database Layer              │
└─────────────────────────────────────┘
```

### Project Structure (Node.js/Express Example)
```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── logger.ts
│   │   └── env.ts
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── zone.controller.ts
│   │   ├── activity.controller.ts
│   │   └── user.controller.ts
│   ├── services/            # Business logic
│   │   ├── auth.service.ts
│   │   ├── zone.service.ts
│   │   ├── activity.service.ts
│   │   ├── notification.service.ts
│   │   └── location.service.ts
│   ├── repositories/       # Data access
│   │   ├── user.repository.ts
│   │   ├── zone.repository.ts
│   │   └── activity.repository.ts
│   ├── models/              # Database models
│   │   ├── user.model.ts
│   │   ├── zone.model.ts
│   │   └── activity.model.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── logging.middleware.ts
│   │   └── validation.middleware.ts
│   ├── utils/               # Utilities
│   │   ├── logger.ts
│   │   ├── errors.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   ├── routes/              # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── zone.routes.ts
│   │   ├── activity.routes.ts
│   │   └── user.routes.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   └── app.ts               # Express app setup
├── tests/                   # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/                 # Utility scripts
│   ├── migrate.ts
│   └── seed.ts
├── .env.example
├── package.json
└── tsconfig.json
```

### Design Principles

#### 1. Separation of Concerns
- **Controllers**: Handle HTTP requests/responses, validate input
- **Services**: Contain business logic, orchestrate operations
- **Repositories**: Handle database operations, abstract data access
- **Models**: Define data structure and relationships

#### 2. Dependency Injection
```typescript
// Example: Service depends on Repository
class ZoneService {
  constructor(
    private zoneRepository: ZoneRepository,
    private logger: Logger
  ) {}
}
```

#### 3. Error Handling Strategy
```typescript
// Custom error classes
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}
```

---

## 2. Logging System

### Logging Levels
```typescript
enum LogLevel {
  ERROR = 0,    // Critical errors
  WARN = 1,     // Warnings
  INFO = 2,     // General information
  DEBUG = 3,    // Debug information
  VERBOSE = 4   // Very detailed logs
}
```

### Structured Logging Implementation
```typescript
// utils/logger.ts
import winston from 'winston';
import { Request, Response } from 'express';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'zones-api' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
        })
      ),
    }),
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: Function) => {
  const start = Date.now();
  
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger.log(logLevel, 'Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id,
    });
  });

  next();
};

// Error logging
export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    ...context,
  });
};
```

### What to Log

#### Request/Response Logging
- All incoming requests (method, URL, IP, user agent)
- Request duration
- Response status codes
- User ID (if authenticated)

#### Business Logic Logging
- Zone creation/updates/deletions
- Activity events (enter/exit)
- Authentication attempts (success/failure)
- Notification sends

#### Error Logging
- Full error stack traces
- Request context (user, IP, body)
- Database query errors
- External API failures

#### Performance Logging
- Slow database queries (>100ms)
- API response times
- Background job execution times

### Log Aggregation (Production)
- **Development**: Console + File logs
- **Production**: Send to centralized service
  - **Options**: 
    - Datadog
    - LogRocket
    - Sentry
    - CloudWatch (AWS)
    - Google Cloud Logging

---

## 3. Monitoring & Observability

### Health Check Endpoint
```typescript
// routes/health.routes.ts
router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      storage: await checkStorage(),
    },
  };

  const isHealthy = Object.values(health.checks).every(check => check.status === 'ok');
  res.status(isHealthy ? 200 : 503).json(health);
});
```

### Metrics Collection

#### Key Metrics to Track
1. **Request Metrics**
   - Request rate (requests/second)
   - Response times (p50, p95, p99)
   - Error rate (4xx, 5xx)
   - Endpoint-specific metrics

2. **Business Metrics**
   - Active users
   - Zones created per day
   - Activities logged per day
   - Notification delivery rate

3. **System Metrics**
   - CPU usage
   - Memory usage
   - Database connection pool usage
   - Cache hit rate

4. **Database Metrics**
   - Query execution time
   - Slow queries
   - Connection pool status
   - Replication lag (if applicable)

### Implementation with Prometheus
```typescript
// utils/metrics.ts
import client from 'prom-client';

// Create a Registry
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

export const zonesCreated = new client.Counter({
  name: 'zones_created_total',
  help: 'Total number of zones created',
});

export const activitiesLogged = new client.Counter({
  name: 'activities_logged_total',
  help: 'Total number of activities logged',
  labelNames: ['type'], // 'enter' or 'exit'
});

// Metrics middleware
export const metricsMiddleware = (req: Request, res: Response, next: Function) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.observe(
      { method: req.method, route: req.route?.path || req.path, status_code: res.statusCode },
      duration
    );
  });
  
  next();
};

// Metrics endpoint
export const metricsRoute = async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};
```

### APM (Application Performance Monitoring)
- **Options**: 
  - New Relic
  - Datadog APM
  - Elastic APM
  - Sentry Performance

### Alerting Rules
```yaml
# Example alerting rules
alerts:
  - name: HighErrorRate
    condition: error_rate > 0.05  # 5% error rate
    duration: 5m
    action: notify_team
    
  - name: SlowResponseTime
    condition: p95_response_time > 2000ms  # 2 seconds
    duration: 5m
    action: notify_team
    
  - name: DatabaseConnectionPoolExhausted
    condition: db_connections_used / db_connections_max > 0.9
    duration: 2m
    action: page_oncall
```

---

## 4. Error Handling & Debugging

### Global Error Handler
```typescript
// middleware/error.middleware.ts
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: Function
) => {
  // Log error
  logError(err, {
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
    userId: req.user?.id,
  });

  // Determine status code
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  
  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error'
    : err.message;

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.name,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
```

### Debugging Tools

#### 1. Request ID Tracking
```typescript
// middleware/request-id.middleware.ts
import { v4 as uuidv4 } from 'uuid';

export const requestIdMiddleware = (req: Request, res: Response, next: Function) => {
  const requestId = uuidv4();
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

// Include request ID in all logs
logger.info('Operation started', { requestId: req.id, ... });
```

#### 2. Database Query Logging
```typescript
// Enable query logging in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug('Database query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}
```

#### 3. Debug Mode
```typescript
// Enable debug mode via environment variable
if (process.env.DEBUG === 'true') {
  // Log all database queries
  // Log all service method calls
  // Log all external API calls
  // Include full stack traces in responses
}
```

#### 4. Error Context
```typescript
// Always include context when logging errors
try {
  await zoneService.createZone(zoneData, userId);
} catch (error) {
  logError(error, {
    operation: 'createZone',
    userId,
    zoneData: sanitizeZoneData(zoneData), // Remove sensitive data
    timestamp: new Date().toISOString(),
  });
  throw error;
}
```

---

## 5. Scaling Strategies

### Database Scaling

#### 1. Indexing Strategy
```sql
-- Critical indexes for performance
CREATE INDEX idx_zones_user_location ON zones(user_id, latitude, longitude);
CREATE INDEX idx_zones_user_created ON zones(user_id, created_at DESC);
CREATE INDEX idx_activities_user_timestamp ON activities(user_id, timestamp DESC);
CREATE INDEX idx_activities_zone_timestamp ON activities(zone_id, timestamp DESC);

-- Geospatial index for location queries
CREATE INDEX idx_zones_location_gist ON zones USING GIST (
  ST_MakePoint(longitude, latitude)
);
```

#### 2. Query Optimization
- Use `SELECT` only needed columns
- Implement pagination for large datasets
- Use database views for complex queries
- Implement query result caching

#### 3. Connection Pooling
```typescript
// config/database.ts
const pool = new Pool({
  max: 20, // Maximum connections
  min: 5,  // Minimum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Caching Strategy

#### 1. Redis for Caching
```typescript
// Cache frequently accessed data
- User profiles (TTL: 1 hour)
- Zone lists per user (TTL: 5 minutes)
- Activity statistics (TTL: 15 minutes)
- Overview stats (TTL: 10 minutes)
```

#### 2. Cache Invalidation
- Invalidate on updates
- Use cache tags for related data
- Implement cache warming for critical data

### API Rate Limiting
```typescript
// middleware/rate-limit.middleware.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit auth endpoints to 5 requests
  skipSuccessfulRequests: true,
});
```

### Background Job Processing

#### 1. Job Queue (BullMQ)
```typescript
// services/queue.service.ts
import { Queue, Worker } from 'bullmq';

// Create queues
export const activityQueue = new Queue('activities', {
  connection: { host: process.env.REDIS_HOST },
});

export const notificationQueue = new Queue('notifications', {
  connection: { host: process.env.REDIS_HOST },
});

// Process jobs
const worker = new Worker('activities', async (job) => {
  await processActivity(job.data);
}, {
  connection: { host: process.env.REDIS_HOST },
});
```

#### 2. Background Tasks
- Location tracking processing
- Notification sending
- Statistics calculation
- Image processing/resizing

### Horizontal Scaling

#### Load Balancing
- Use reverse proxy (Nginx/HAProxy)
- Implement sticky sessions if needed
- Health check endpoints for load balancer

#### Stateless Design
- No server-side sessions
- Use JWT tokens
- Store state in database/cache

---

## 6. Database Design (PostgreSQL with PostGIS)

### Optimized Schema
```sql
-- Users table with proper constraints
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  phone VARCHAR(20),
  gender VARCHAR(20),
  streak INTEGER DEFAULT 0 CHECK (streak >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL -- Soft delete
);

-- Zones table with geospatial support
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude DECIMAL(11, 8) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  radius INTEGER NOT NULL DEFAULT 200 CHECK (radius > 0),
  icon VARCHAR(50) NOT NULL,
  color VARCHAR(20) NOT NULL,
  description TEXT,
  notification_option VARCHAR(10) NOT NULL DEFAULT 'both' 
    CHECK (notification_option IN ('enter', 'exit', 'both')),
  notification_text VARCHAR(255) NOT NULL DEFAULT 'You have entered the zone',
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL -- Soft delete
);

-- Activities table with partitioning for scale
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  zone_name VARCHAR(255) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('enter', 'exit')),
  timestamp BIGINT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE activities_2024_01 PARTITION OF activities
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE activities_2024_02 PARTITION OF activities
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- ... continue for each month
```

### Database Migrations
```typescript
// Use Prisma Migrate or TypeORM migrations
// Version control all schema changes
// Test migrations on staging before production
```

---

## 7. API Design Best Practices

### RESTful Endpoints
```
GET    /api/zones           # List zones
GET    /api/zones/:id       # Get zone
POST   /api/zones           # Create zone
PUT    /api/zones/:id       # Update zone
DELETE /api/zones/:id       # Delete zone
```

### Response Format
```typescript
// Success response
{
  "success": true,
  "data": { ... },
  "meta": { // Optional pagination
    "page": 1,
    "limit": 20,
    "total": 100
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "requestId": "uuid" // For debugging
}
```

### API Versioning
```
/api/v1/zones
/api/v2/zones
```

---

## 8. Security Best Practices

### Authentication
- JWT tokens with short expiration (15 min)
- Refresh tokens with longer expiration (7 days)
- Token rotation on refresh
- Secure password hashing (bcrypt, 10+ rounds)

### Authorization
- Role-based access control (RBAC)
- Resource ownership validation
- API key for background services

### Input Validation
- Validate all inputs
- Sanitize user inputs
- Use parameterized queries (prevent SQL injection)
- Rate limiting

### Data Protection
- Encrypt sensitive data at rest
- Use HTTPS only
- Implement CORS properly
- Sanitize error messages (don't expose internals)

---

## 9. Testing Strategy

### Unit Tests
- Test individual functions/methods
- Mock external dependencies
- Aim for >80% code coverage

### Integration Tests
- Test API endpoints
- Test database operations
- Test service layer

### E2E Tests
- Test complete user flows
- Test authentication flow
- Test zone creation flow

### Load Testing
- Use tools like Artillery, k6, or JMeter
- Test API under load
- Identify bottlenecks

---

## 10. Deployment & DevOps

### Environment Setup
```env
# Development
NODE_ENV=development
LOG_LEVEL=debug
DEBUG=true

# Production
NODE_ENV=production
LOG_LEVEL=info
DEBUG=false
```

### CI/CD Pipeline
1. **Build**: Compile TypeScript, run tests
2. **Test**: Run unit, integration, E2E tests
3. **Deploy**: Deploy to staging/production
4. **Monitor**: Health checks, metrics

### Docker Setup
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/app.js"]
```

### Monitoring Dashboard
- Set up Grafana dashboards
- Monitor key metrics
- Set up alerts
- Track error rates

---

## Implementation Priority

### Phase 1: Foundation (Week 1)
1. ✅ Set up project structure
2. ✅ Database schema and migrations
3. ✅ Basic logging system
4. ✅ Error handling middleware
5. ✅ Health check endpoint

### Phase 2: Core Features (Week 2)
1. ✅ Authentication endpoints
2. ✅ User CRUD endpoints
3. ✅ Zone CRUD endpoints
4. ✅ Request logging middleware
5. ✅ Basic metrics collection

### Phase 3: Advanced Features (Week 3)
1. ✅ Activity tracking endpoints
2. ✅ Statistics endpoints
3. ✅ File upload endpoints
4. ✅ Caching implementation
5. ✅ Background job processing

### Phase 4: Production Ready (Week 4)
1. ✅ Comprehensive monitoring
2. ✅ Alerting setup
3. ✅ Performance optimization
4. ✅ Load testing
5. ✅ Documentation

---

## Tools & Libraries

### Recommended Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js / Fastify
- **Database**: PostgreSQL 14+ with PostGIS
- **ORM**: Prisma / TypeORM
- **Logging**: Winston
- **Metrics**: Prometheus + Grafana
- **Caching**: Redis
- **Queue**: BullMQ
- **Validation**: Zod / Joi
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI

---

## Key Takeaways

1. **Architecture**: Use layered architecture for separation of concerns
2. **Logging**: Log everything with proper context and levels
3. **Monitoring**: Track metrics, set up alerts, use APM tools
4. **Error Handling**: Centralized error handling with proper logging
5. **Scaling**: Design for scale from the start (indexes, caching, queues)
6. **Security**: Implement proper auth, validation, and data protection
7. **Testing**: Write tests at all levels
8. **Documentation**: Document APIs, architecture decisions, and runbooks

