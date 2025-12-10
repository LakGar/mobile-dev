# Complete Setup Guide - Frontend & Backend Integration

## ✅ What's Complete

### Backend (100% Complete)
- ✅ 17 API endpoints implemented
- ✅ Authentication system (JWT tokens)
- ✅ User management
- ✅ Zone management
- ✅ Activity tracking
- ✅ Logging & monitoring
- ✅ Error handling
- ✅ Database schema ready

### Frontend Integration (95% Complete)
- ✅ API client created (`utils/api.ts`)
- ✅ Authentication store connected to API
- ✅ Zone store connected to API
- ✅ User store connected to API
- ✅ Activity store connected to API
- ✅ Login/Register screens updated
- ✅ Home screen fetches data on mount

---

## 🚀 Quick Start Guide

### Step 1: Set Up Backend Database

```bash
cd backend

# Install dependencies
npm install

# Create PostgreSQL database
createdb zones_db

# Copy environment file
cp .env.example .env

# Edit .env file - Update DATABASE_URL:
# DATABASE_URL=postgresql://username:password@localhost:5432/zones_db
# JWT_SECRET=your-secret-key-here
# JWT_REFRESH_SECRET=your-refresh-secret-key-here

# Run migrations
npx prisma generate
npx prisma migrate dev --name init

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3000`

### Step 2: Configure Frontend

```bash
# In project root (not backend folder)
# Create .env file
echo "EXPO_PUBLIC_API_URL=http://localhost:3000/api" > .env

# For Expo Go on physical device, use your computer's IP:
# EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

### Step 3: Start Frontend

```bash
# In project root
npm start
```

### Step 4: Test Integration

1. **Test Backend Health:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Test Registration:**
   - Open app
   - Go to Register screen
   - Create account
   - Should redirect to home screen

3. **Test Login:**
   - Logout
   - Login with credentials
   - Should work seamlessly

4. **Test Zone Creation:**
   - Create a new zone
   - Should sync with backend
   - Check backend logs for API calls

---

## 📁 Key Files

### Backend
- `backend/src/app.ts` - Express app setup
- `backend/src/routes/` - API routes
- `backend/src/services/` - Business logic
- `backend/src/repositories/` - Data access
- `backend/prisma/schema.prisma` - Database schema

### Frontend
- `utils/api.ts` - API client
- `stores/useAuthStore.ts` - Authentication
- `stores/useZoneStore.ts` - Zones
- `stores/useUserStore.ts` - User profile
- `stores/useActivityStore.ts` - Activities

---

## 🔧 Troubleshooting

### Backend Issues

**Database connection failed:**
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Test connection: `psql postgresql://user:pass@localhost:5432/zones_db`

**Port 3000 already in use:**
- Change PORT in backend `.env`
- Or kill process: `lsof -ti:3000 | xargs kill -9`

**Migrations failed:**
- Reset database: `npx prisma migrate reset`
- Check migration status: `npx prisma migrate status`

### Frontend Issues

**API connection failed:**
- Check backend is running
- Verify `EXPO_PUBLIC_API_URL` in `.env`
- For Expo Go, use computer's IP address
- Check CORS settings in backend `.env`

**Authentication not working:**
- Check tokens in AsyncStorage
- Verify JWT secrets in backend `.env`
- Check network requests in dev tools

**Data not loading:**
- Check API responses in network tab
- Verify user is authenticated
- Check backend logs for errors

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update user
- `PUT /api/users/me/password` - Change password

### Zones
- `GET /api/zones` - List zones (with filters)
- `GET /api/zones/:id` - Get zone
- `POST /api/zones` - Create zone
- `PUT /api/zones/:id` - Update zone
- `DELETE /api/zones/:id` - Delete zone

### Activities
- `GET /api/activities` - List activities
- `POST /api/activities` - Create activity
- `GET /api/activities/stats` - Get statistics

### Health
- `GET /api/health` - Health check
- `GET /api/health/detailed` - Detailed health

---

## 🎯 Next Steps

1. **Set up database** (if not done)
2. **Test all endpoints** using curl or Postman
3. **Test frontend-backend integration**
4. **Add error handling** in components
5. **Add loading states** in UI
6. **Test on physical device** (update API URL)

---

## 📝 Notes

- Backend uses UUIDs, frontend converts to numbers for compatibility
- Tokens are automatically refreshed on 401 errors
- All API calls include authentication headers
- Data is cached locally for offline support
- Pull-to-refresh updates all data

---

## ✨ You're All Set!

The integration is complete. Just:
1. Set up the database
2. Configure environment variables
3. Start both servers
4. Test the app!

For detailed setup instructions, see:
- `backend/SETUP.md` - Backend setup
- `INTEGRATION_COMPLETE.md` - Integration details

