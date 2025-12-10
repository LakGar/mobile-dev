# Zones API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### Register
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe",
  "username": "johndoe" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "name": "John Doe",
      "bio": null,
      "profileImageUrl": null,
      "streak": 0
    },
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token"
  },
  "requestId": "uuid"
}
```

---

### Login
**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token"
  },
  "requestId": "uuid"
}
```

---

### Refresh Token
**POST** `/auth/refresh`

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token"
  },
  "requestId": "uuid"
}
```

---

### Logout
**POST** `/auth/logout`

Logout and invalidate refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  },
  "requestId": "uuid"
}
```

---

## User Endpoints

### Get Current User
**GET** `/users/me`

Get authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "bio": "Bio text",
    "profileImageUrl": "https://...",
    "phone": "+1234567890",
    "gender": "male",
    "streak": 10,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "requestId": "uuid"
}
```

---

### Update Current User
**PUT** `/users/me`

Update authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "bio": "New bio",
  "phone": "+1234567890",
  "gender": "male",
  "profileImageUrl": "https://..."
}
```

**Response:**
```json
{
  "success": true,
  "data": { ...updated user },
  "requestId": "uuid"
}
```

---

### Change Password
**PUT** `/users/me/password`

Change user password.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Password updated successfully"
  },
  "requestId": "uuid"
}
```

---

## Zone Endpoints

### Get All Zones
**GET** `/zones`

Get all zones for authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `filter` (optional): Filter by icon type
- `sort` (optional): Sort by `name`, `date`, or `radius` (default: `date`)
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
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
      "notificationText": "You have entered the zone",
      "image": "https://...",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 100,
    "total": 10,
    "totalPages": 1
  },
  "requestId": "uuid"
}
```

---

### Get Zone by ID
**GET** `/zones/:id`

Get a specific zone.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": { ...zone },
  "requestId": "uuid"
}
```

---

### Create Zone
**POST** `/zones`

Create a new zone.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Home",
  "address": "123 Main St",
  "location": "San Francisco, CA",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "radius": 200,
  "icon": "house.fill",
  "color": "#ebecf8",
  "description": "My home",
  "notificationOption": "both",
  "notificationText": "You have entered the zone",
  "imageUrl": "https://..." // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": { ...created zone },
  "requestId": "uuid"
}
```

---

### Update Zone
**PUT** `/zones/:id`

Update a zone.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "radius": 300,
  ...
}
```

**Response:**
```json
{
  "success": true,
  "data": { ...updated zone },
  "requestId": "uuid"
}
```

---

### Delete Zone
**DELETE** `/zones/:id`

Delete a zone (soft delete).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Zone deleted successfully"
  },
  "requestId": "uuid"
}
```

---

## Activity Endpoints

### Get Activities
**GET** `/activities`

Get activities for authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `zoneId` (optional): Filter by zone ID
- `type` (optional): Filter by type (`enter` or `exit`)
- `sort` (optional): Sort by `recent`, `oldest`, or `zone` (default: `recent`)
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "zoneId": "uuid",
      "zoneName": "Home",
      "type": "enter",
      "time": "2 hours ago",
      "timestamp": 1234567890,
      "icon": "house.fill",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 100,
    "total": 50,
    "totalPages": 1
  },
  "requestId": "uuid"
}
```

---

### Create Activity
**POST** `/activities`

Create a new activity (typically called by background service).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "zoneId": "uuid",
  "type": "enter"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ...created activity },
  "requestId": "uuid"
}
```

---

### Get Activity Statistics
**GET** `/activities/stats`

Get activity statistics.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `zoneId` (optional): Get statistics for specific zone

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "enterCount": 75,
    "exitCount": 75,
    "mostVisitedZone": {
      "id": "uuid",
      "name": "Home",
      "visitCount": 45
    }
  },
  "requestId": "uuid"
}
```

---

## Health Check Endpoints

### Simple Health Check
**GET** `/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0"
}
```

---

### Detailed Health Check
**GET** `/health/detailed`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "ok"
    }
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... } // optional, for validation errors
  },
  "requestId": "uuid"
}
```

### Common Error Codes
- `VALIDATION_ERROR` (400): Invalid input
- `UNAUTHORIZED_ERROR` (401): Authentication required or invalid token
- `FORBIDDEN_ERROR` (403): Access denied
- `NOT_FOUND_ERROR` (404): Resource not found
- `CONFLICT_ERROR` (409): Resource conflict (e.g., email already exists)
- `INTERNAL_ERROR` (500): Server error

---

## Rate Limiting

- Authentication endpoints: 5 requests per minute per IP
- General endpoints: 100 requests per minute per user
- File upload endpoints: 10 requests per minute per user

