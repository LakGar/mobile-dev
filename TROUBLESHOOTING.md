# Troubleshooting Network Errors

## Error: "Network request failed"

This error means the frontend cannot connect to the backend API.

### Quick Fixes:

#### 1. Check Backend is Running

```bash
# Check if backend is running
curl http://localhost:3000/api/health

# If not running, start it:
cd backend
npm run dev
```

#### 2. Check API URL Configuration

**For Expo Go (Physical Device):**
- You CANNOT use `localhost` or `127.0.0.1`
- You MUST use your computer's IP address

**Find your computer's IP:**
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Or
ipconfig getifaddr en0  # macOS WiFi
ipconfig getifaddr en1  # macOS Ethernet
```

**Update `.env` file:**
```env
# For iOS Simulator / Android Emulator
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# For Expo Go on physical device (use your computer's IP)
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

**Important:** After changing `.env`, restart Expo:
```bash
# Stop Expo (Ctrl+C)
# Then restart
npm start
```

#### 3. Check Firewall

Make sure your firewall allows connections on port 3000:

**macOS:**
```bash
# Check firewall status
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Allow Node.js through firewall if needed
```

#### 4. Check Backend CORS Settings

Make sure backend `.env` includes your frontend URL:

```env
# backend/.env
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19006,exp://192.168.1.100:8081
```

#### 5. Test Backend Directly

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test from your computer's IP (if using Expo Go)
curl http://YOUR_COMPUTER_IP:3000/api/health
```

### Common Issues:

#### Issue: "Cannot connect to localhost"
**Solution:** Use your computer's IP address instead of localhost when testing on a physical device.

#### Issue: "Connection refused"
**Solution:** Backend is not running. Start it with `cd backend && npm run dev`

#### Issue: "CORS error"
**Solution:** Add your frontend URL to `ALLOWED_ORIGINS` in backend `.env`

#### Issue: "Timeout"
**Solution:** Check if backend is actually running and accessible. Try accessing it in a browser.

### Step-by-Step Debugging:

1. **Verify backend is running:**
   ```bash
   cd backend
   npm run dev
   # Should see: "Server started on port 3000"
   ```

2. **Test backend health endpoint:**
   ```bash
   curl http://localhost:3000/api/health
   # Should return JSON response
   ```

3. **Check API URL in frontend:**
   ```bash
   # Check .env file
   cat .env
   # Should have: EXPO_PUBLIC_API_URL=http://...
   ```

4. **Restart Expo after changing .env:**
   ```bash
   # Stop Expo (Ctrl+C)
   npm start
   ```

5. **Check network tab in Expo DevTools:**
   - Open Expo DevTools
   - Check Network tab
   - See what URL is being called
   - Check for CORS errors

### For Expo Go on Physical Device:

1. Make sure phone and computer are on the same WiFi network
2. Use computer's IP address (not localhost)
3. Check firewall allows port 3000
4. Restart Expo after changing `.env`

### Example Configuration:

**Frontend `.env` (for Expo Go on device):**
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

**Backend `.env`:**
```env
PORT=3000
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19006,exp://192.168.1.100:8081
```

### Still Not Working?

1. Check backend logs for errors
2. Check Expo logs for network errors
3. Try accessing backend URL directly in browser
4. Verify both devices are on same network
5. Try using `10.0.2.2` for Android emulator instead of localhost

