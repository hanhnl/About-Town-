# Troubleshooting: Blank Page Issue

## Quick Fix

If you're seeing a blank page when visiting http://localhost:5000:

### Solution 1: Hard Refresh
1. Open http://localhost:5000 in your browser
2. Press **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac)
3. This clears the cache and forces a full reload

### Solution 2: Clear Browser Cache
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Solution 3: Check Browser Console
1. Press **F12** to open DevTools
2. Click **Console** tab
3. Look for any red error messages
4. Share the errors if you see any

## Common Causes & Fixes

### Issue 1: Cached Old Build
**Symptoms:** Page loads but shows nothing or old content

**Fix:**
```bash
# Stop server
# Kill any running processes
pkill -f "tsx server/index.ts"

# Clean and rebuild
rm -rf dist/ node_modules/.vite/
npm run dev
```

### Issue 2: Port Already in Use
**Symptoms:** Server won't start or page won't load

**Check:**
```bash
lsof -i :5000
```

**Fix:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Restart server
npm run dev
```

### Issue 3: Missing Dependencies
**Symptoms:** Console shows module not found errors

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue 4: React Not Mounting
**Symptoms:** HTML loads but React app doesn't render

**Check in Browser Console:**
- Look for errors mentioning "root"
- Check if document.getElementById("root") exists

**Fix:**
```bash
# Rebuild client
cd /home/user/About-Town-
npm run build
npm run dev
```

## Detailed Diagnostics

Run these commands to diagnose:

```bash
# 1. Check if server is running
curl http://localhost:5000/api/debug/status

# 2. Check if bills API works
curl http://localhost:5000/api/bills

# 3. Check if HTML is served
curl http://localhost:5000 | grep "root"

# 4. Check server logs
tail -50 /tmp/server.log
```

Expected results:
1. Should return JSON with status
2. Should return array of bills
3. Should show `<div id="root"></div>`
4. Should show "serving on port 5000"

## Browser-Specific Issues

### Chrome/Edge
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear storage"
4. Check all boxes
5. Click "Clear site data"
6. Reload page

### Firefox
1. Open DevTools (F12)
2. Go to Storage tab
3. Right-click on domain
4. Select "Delete All"
5. Reload page

### Safari
1. Safari menu → Preferences → Advanced
2. Check "Show Develop menu"
3. Develop → Empty Caches
4. Reload page

## Still Blank? Try This

### Complete Reset:

```bash
# 1. Stop everything
pkill -f "tsx server/index.ts"
pkill -f "node"

# 2. Clean everything
cd /home/user/About-Town-
rm -rf dist/ node_modules/.vite/

# 3. Reinstall
npm install

# 4. Start fresh
npm run dev
```

### Access via Different Method:

If localhost:5000 doesn't work, try:
- http://127.0.0.1:5000
- http://0.0.0.0:5000

## Check If It's Actually Working

The page might not be blank - it might just be loading! Check:

1. **Open Browser DevTools** (F12)
2. Go to **Network** tab
3. Reload the page
4. Look for:
   - `main.tsx` - Should load (200 status)
   - `index.css` - Should load (200 status)
   - Multiple requests to `/@vite/` - These are normal

If you see these loading successfully, the app IS working - it might just be:
- White background (by design)
- Content not visible due to CSS issue
- Need to scroll down

## Visual Check

If the page appears blank but DevTools shows no errors:

1. Press **Ctrl+A** (Select All)
2. If you see text get highlighted, content IS there
3. Check if theme is set to light mode (matches white background)

## Get Help

If still having issues, provide:
1. Browser console errors (screenshot)
2. Network tab status (screenshot)
3. Output of: `curl http://localhost:5000/api/bills`
4. Server logs: `tail -50 /tmp/server.log`

## Known Working State

Your server should show:
```
⚠️  DATABASE_URL not set - running in API-only mode with LegiScan
⚠️  Database not configured - skipping seed
[time] [express] serving on port 5000
```

If you see this, the server is running correctly!
