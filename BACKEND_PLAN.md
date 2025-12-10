# Backend Architecture Plan

## Overview
This document outlines the backend architecture for the Zones mobile app, including API endpoints, database schema, authentication, and background services.

---

## Technology Stack Recommendations

### Option 1: Node.js/Express + PostgreSQL (Recommended)
- **Backend Framework**: Express.js / Fastify
- **Database**: PostgreSQL with PostGIS (for geospatial queries)
- **ORM**: Prisma / TypeORM
- **Authentication**: JWT tokens
- **File Storage**: AWS S3 / Cloudinary / Supabase Storage
- **Background Jobs**: BullMQ / Agenda.js
- **Real-time**: WebSockets (Socket.io) for live location updates
- **Hosting**: Railway / Render / AWS / Vercel

### Option 2: Python/FastAPI + PostgreSQL
- **Backend Framework**: FastAPI
- **Database**: PostgreSQL with PostGIS
- **ORM**: SQLAlchemy
- **Authentication**: JWT tokens
- **Background Jobs**: Celery
- **Hosting**: Railway / Render / AWS

### Option 3: Serverless (Firebase/Supabase)
- **Backend**: Firebase Functions / Supabase Edge Functions
- **Database**: Firestore / Supabase PostgreSQL
- **Authentication**: Firebase Auth / Supabase Auth
- **Storage**: Firebase Storage / Supabase Storage
- **Hosting**: Firebase / Supabase

---

## Database Schema

### Users Table
```sql
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
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

### Zones Table
```sql
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius INTEGER NOT NULL DEFAULT 200,
  icon VARCHAR(50) NOT NULL,
  color VARCHAR(20) NOT NULL,
  description TEXT,
  notification_option VARCHAR(10) NOT NULL DEFAULT 'both',
  notification_text VARCHAR(255) NOT NULL DEFAULT 'You have entered the zone',
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_zones_user_id ON zones(user_id);
CREATE INDEX idx_zones_location ON zones USING GIST (
  ST_MakePoint(longitude, latitude)
);
```

### Activities Table
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  zone_name VARCHAR(255) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('enter', 'exit')),
  timestamp BIGINT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_zone_id ON activities(zone_id);
CREATE INDEX idx_activities_timestamp ON activities(timestamp DESC);
```

### Sessions Table (for JWT refresh tokens)
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

---

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user
```json
Request Body:
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "username": "johndoe" // optional, auto-generated if not provided
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "username": "johndoe"
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

#### POST `/api/auth/login`
Login user
```json
Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

#### POST `/api/auth/refresh`
Refresh access token
```json
Request Body:
{
  "refreshToken": "jwt_refresh_token"
}

Response:
{
  "success": true,
  "data": {
    "token": "new_jwt_access_token"
  }
}
```

#### POST `/api/auth/logout`
Logout user (invalidate refresh token)
```json
Headers:
{
  "Authorization": "Bearer jwt_access_token"
}

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### User Endpoints

#### GET `/api/users/me`
Get current user profile
```json
Headers:
{
  "Authorization": "Bearer jwt_access_token"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "johndoe",
    "name": "John Doe",
    "bio": "Bio text",
    "profileImage": "https://...",
    "email": "user@example.com",
    "phone": "+1234567890",
    "gender": "male",
    "streak": 10
  }
}
```

#### PUT `/api/users/me`
Update user profile
```json
Headers:
{
  "Authorization": "Bearer jwt_access_token"
}

Request Body:
{
  "name": "John Updated",
  "bio": "New bio",
  "phone": "+1234567890",
  "gender": "male"
}

Response:
{
  "success": true,
  "data": { ...updated user }
}
```

#### POST `/api/users/me/profile-image`
Upload profile image
```json
Headers:
{
  "Authorization": "Bearer jwt_access_token",
  "Content-Type": "multipart/form-data"
}

Request Body:
FormData with "image" file

Response:
{
  "success": true,
  "data": {
    "profileImage": "https://..."
  }
}
```

#### PUT `/api/users/me/password`
Change password
```json
Headers:
{
  "Authorization": "Bearer jwt_access_token"
}

Request Body:
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}

Response:
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

### Zones Endpoints

#### GET `/api/zones`
Get all zones for authenticated user
```json
Headers:
{
  "Authorization": "Bearer jwt_access_token"
}

Query Parameters:
- filter: "all" | "home" | "location" | "map" | "pin" | "run" | "cafe" | "park" | "car"
- sort: "name" | "date" | "radius"
- limit: number
- offset: number

Response:
{
  "success": true,
  "data": {
    "zones": [
      {
        "id": "uuid",
        "title": "Home",
        "address": "123 Main St",
        "location": "San Francisco, CA",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "radius": 200,
        "icon": "house.fill",
        "color": "#ebecf8",
        "description": "...",
        "notificationOption": "both",
        "notificationText": "...",
        "image": "https://...",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 10
  }
}
```

#### GET `/api/zones/:id`
Get zone by ID
```json
Headers:
{
  "Authorization": "Bearer jwt_access_token"
}

Response:
{
  "success": true,
  "data": { ...zone }
}
```

#### POST `/api/zones`
Create a new zone
```json
Headers:
{
  "Authorization": "Bearer jwt_access_token",
  "Content-Type": "multipart/form-data" // if image included
}

Request Body:
{
  "title": "Home",
  "address": "123 Main St",
  "location": "San Francisco, CA",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "radius": 200,
  "icon": "house.fill",
  "color": "#ebecf8",
  "description": "...",
  "notificationOption": "both",
  "notificationText": "You have entered the zone",
  "image": File // optional
}

Response:
{
  "success": true,
  "data": { ...created zone }
}
```

#### PUT `/api/zones/:id`
Update zone
```json
Headers:
{
  "Authorization": "Bearer jwt_access_token"
}

Request Body:
{
  "title": "Updated Title",
  "radius": 300,
  ...
}

Response:
{
  "success": true,
  "data": { ...updated zone }
}
```

#### DELETE `/api/zones/:id`
Delete zone
```json
Headers:
{
  "Authorization": "Bearer jwt_access_token"
}

Response:
{
  "success": true,
  "message": "Zone deleted successfully"
}
```

---

### Activities Endpoints

#### GET `/api/activities`
Get activities for authenticated user
```json
Headers:
{
  "Authorization": "Bearer jwt_access_token"
}

Query Parameters:
- type: "all" | "enter" | "exit"
- zoneId: uuid (filter by zone)
- sort: "recent" | "oldest" | "zone"
- limit: number
- offset: number

Response:
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "uuid",
        "zoneId": "uuid",
        "zoneName": "Home",
        "type": "enter",
        "time": "2 hours ago",
        "timestamp": 1234567890,
        "icon": "house.fill"
      }
    ],
    "total": 50
  }
}
```

#### GET `/api/activities/stats`
Get activity statistics
```json
Headers:
{
  "Authorization": "Bearer jwt_access_token"
}

Query Parameters:
- period: "week" | "month" | "year" | "all"

Response:
{
  "success": true,
  "data": {
    "totalActivities": 150,
    "enterCount": 75,
    "exitCount": 75,
    "mostVisitedZone": {
      "id": "uuid",
      "name": "Home",
      "visitCount": 45
    },
    "activitiesByDay": [
      { "date": "2024-01-01", "count": 5 },
      ...
    ]
  }
}
```

#### POST `/api/activities`
Create activity (typically called by background service)
```json
Headers:
{
  "Authorization": "Bearer jwt_access_token"
}

Request Body:
{
  "zoneId": "uuid",
  "type": "enter" | "exit"
}

Response:
{
  "success": true,
  "data": { ...created activity }
}
```

---

### Statistics Endpoints

#### GET `/api/stats/overview`
Get overview statistics
```json
Headers:
{
  "Authorization": "Bearer jwt_access_token"
}

Response:
{
  "success": true,
  "data": {
    "totalZones": 5,
    "totalActivities": 150,
    "streak": 10,
    "recentActivity": {
      "lastEnter": "2024-01-01T10:00:00Z",
      "lastExit": "2024-01-01T09:00:00Z"
    }
  }
}
```

#### GET `/api/stats/zones/:id`
Get zone-specific statistics
```json
Headers:
{
  "Authorization": "Bearer jwt_access_token"
}

Response:
{
  "success": true,
  "data": {
    "zoneId": "uuid",
    "totalVisits": 45,
    "enterCount": 23,
    "exitCount": 22,
    "averageTimeSpent": 3600, // seconds
    "lastVisit": "2024-01-01T10:00:00Z",
    "visitsByDay": [...],
    "visitsByHour": [...]
  }
}
```

---

### File Upload Endpoints

#### POST `/api/upload/zone-image`
Upload zone map screenshot
```json
Headers:
{
  "Authorization": "Bearer jwt_access_token",
  "Content-Type": "multipart/form-data"
}

Request Body:
FormData with "image" file

Response:
{
  "success": true,
  "data": {
    "url": "https://storage.example.com/zones/image-uuid.jpg"
  }
}
```

#### POST `/api/upload/profile-image`
Upload profile image
```json
Headers:
{
  "Authorization": "Bearer jwt_access_token",
  "Content-Type": "multipart/form-data"
}

Request Body:
FormData with "image" file

Response:
{
  "success": true,
  "data": {
    "url": "https://storage.example.com/profiles/user-uuid.jpg"
  }
}
```

---

## Background Services

### Location Tracking Service
- **Purpose**: Monitor user location and detect zone enter/exit events
- **Technology**: Background location service (Expo Location Background)
- **Flow**:
  1. User grants background location permission
  2. App sends location updates to backend every X seconds/minutes
  3. Backend calculates distance to all user zones
  4. If user enters/exits a zone, create activity and send notification
  5. Update user streak if applicable

### Notification Service
- **Purpose**: Send push notifications for zone events
- **Technology**: Expo Push Notifications / FCM
- **Flow**:
  1. When zone enter/exit detected, check zone notification settings
  2. Send push notification to user's device
  3. Log notification in database

---

## Security Considerations

1. **Authentication**:
   - JWT tokens with expiration (15 min access, 7 days refresh)
   - Password hashing with bcrypt (salt rounds: 10-12)
   - Rate limiting on auth endpoints

2. **Authorization**:
   - All endpoints require authentication (except auth endpoints)
   - Users can only access their own data
   - Validate user_id matches authenticated user

3. **Data Validation**:
   - Validate all input data
   - Sanitize user inputs
   - Validate coordinates are within valid ranges
   - Validate file types and sizes for uploads

4. **API Security**:
   - HTTPS only
   - CORS configuration
   - Rate limiting per user/IP
   - Request size limits

---

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/zones_db

# JWT
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# File Storage
STORAGE_PROVIDER=s3|cloudinary|supabase
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...
AWS_REGION=...

# Push Notifications
EXPO_PUSH_TOKEN=...
FCM_SERVER_KEY=...

# CORS
ALLOWED_ORIGINS=https://your-app.com
```

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... } // optional
  }
}
```

### Common Error Codes
- `AUTH_REQUIRED`: Authentication required
- `AUTH_INVALID`: Invalid credentials
- `AUTH_EXPIRED`: Token expired
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `FORBIDDEN`: Access denied
- `SERVER_ERROR`: Internal server error

---

## Implementation Phases

### Phase 1: Core Backend Setup
1. Set up project structure
2. Database setup and migrations
3. Authentication endpoints
4. User CRUD endpoints
5. Basic zone CRUD endpoints

### Phase 2: Zone Management
1. Zone CRUD with image upload
2. Zone filtering and sorting
3. Zone statistics

### Phase 3: Activity Tracking
1. Activity creation endpoints
2. Activity querying and filtering
3. Activity statistics

### Phase 4: Background Services
1. Location tracking service
2. Geofencing logic
3. Notification service
4. Push notification integration

### Phase 5: Advanced Features
1. Real-time location updates (WebSockets)
2. Zone sharing between users
3. Analytics and reporting
4. Export functionality

---

## Database Indexes for Performance

```sql
-- Zones
CREATE INDEX idx_zones_user_location ON zones(user_id, latitude, longitude);
CREATE INDEX idx_zones_created_at ON zones(created_at DESC);

-- Activities
CREATE INDEX idx_activities_user_zone ON activities(user_id, zone_id);
CREATE INDEX idx_activities_user_timestamp ON activities(user_id, timestamp DESC);

-- Users
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

---

## API Rate Limits

- **Authentication endpoints**: 5 requests per minute per IP
- **General endpoints**: 100 requests per minute per user
- **File upload endpoints**: 10 requests per minute per user
- **Background location updates**: 60 requests per minute per user

---

## Next Steps

1. Choose technology stack
2. Set up development environment
3. Initialize database
4. Implement authentication endpoints
5. Implement user endpoints
6. Implement zone endpoints
7. Implement activity endpoints
8. Set up file storage
9. Implement background location service
10. Set up push notifications
11. Deploy backend
12. Update frontend to use API endpoints

