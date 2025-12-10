# Quick Start - Fix Network Error

## The Problem
You're getting "Network request failed" because:
1. ❌ Backend server is not running
2. ❌ No `.env` file configured

## Quick Fix (2 minutes)

### Step 1: Start Backend Server

```bash
# Open a new terminal window/tab
cd backend

# Install dependencies (if not done)
npm install

# Create database (if not done)
createdb zones_db

# Set up environment
cp .env.example .env
# Edit .env and add your database URL

# Run migrations
npx prisma migrate dev --name init

# Start backend
npm run dev
```

You should see: `Server started on port 3000`

### Step 2: Verify Backend is Running

```bash
# In another terminal, test:
curl http://localhost:3000/api/health
```

Should return JSON with status "ok"

### Step 3: Configure Frontend

The `.env` file has been created. 

**For iOS Simulator / Android Emulator:**
- Already configured: `EXPO_PUBLIC_API_URL=http://localhost:3000/api`
- ✅ Ready to go!

**For Expo Go on Physical Device:**
- You need your computer's IP address
- Find it: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Update `.env`: `EXPO_PUBLIC_API_URL=http://YOUR_IP:3000/api`
- Example: `EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api`

### Step 4: Restart Expo

```bash
# Stop Expo (Ctrl+C if running)
# Then restart
npm start
```

## Testing

1. Backend should be running on port 3000
2. Frontend should connect to backend
3. Try registering/login - should work now!

## Still Getting Errors?

### Check Backend Logs
Look at the backend terminal - you should see:
- Request logs for each API call
- Any errors will be shown there

### Check Network Tab
In Expo DevTools, check Network tab to see:
- What URL is being called
- What error is returned

### Common Issues:

**"Cannot connect to localhost"**
- You're using Expo Go on a physical device
- Solution: Use your computer's IP address instead

**"Connection refused"**
- Backend is not running
- Solution: Start backend with `cd backend && npm run dev`

**"CORS error"**
- Backend CORS not configured
- Solution: Add frontend URL to `ALLOWED_ORIGINS` in backend `.env`

## Need Help?

See `TROUBLESHOOTING.md` for detailed troubleshooting steps.

