# 🚀 Production Deployment Guide

Complete guide for deploying About Town to production with LegiScan API integration.

## Quick Start: Vercel Deployment (Recommended)

Vercel offers the fastest and easiest deployment for this application.

### Step 1: Push to GitHub

Your code is already on GitHub in branch: `claude/about-town-api-integration-IUWVH`

### Step 2: Create Pull Request

1. Go to: https://github.com/hanhnl/About-Town-/pulls
2. Click **"New Pull Request"**
3. Set:
   - **Base**: `main`
   - **Compare**: `claude/about-town-api-integration-IUWVH`
4. Click **"Create Pull Request"**
5. Copy the contents from `PR_DESCRIPTION.md` into the description
6. Click **"Create Pull Request"**

### Step 3: Merge Pull Request

1. Review the changes
2. Click **"Merge Pull Request"**
3. Confirm merge
4. Delete branch (optional)

### Step 4: Deploy to Vercel

#### Option A: New Deployment

1. **Go to Vercel**: https://vercel.com/new
2. **Import Git Repository**:
   - Click "Import Git Repository"
   - Select your GitHub account
   - Choose `About-Town-` repository
3. **Configure Project**:
   - Framework Preset: **Vite** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)

4. **Add Environment Variables**:
   Click "Environment Variables" and add:
   ```
   Key: LEGISCAN_API_KEY
   Value: 34a46ef5f092e98f8c02ab088934dc9c
   Environments: Production, Preview, Development (all checked)
   ```

   Optional (for full features):
   ```
   Key: DATABASE_URL
   Value: your_postgresql_connection_string
   Environments: Production (check only production)
   ```

5. **Click "Deploy"**

#### Option B: Existing Vercel Project

If you already have the project on Vercel:

1. Go to your project on Vercel
2. Go to **Settings** → **Environment Variables**
3. Add:
   ```
   LEGISCAN_API_KEY = 34a46ef5f092e98f8c02ab088934dc9c
   ```
4. Go to **Deployments** tab
5. Click the three dots on the latest deployment
6. Click **"Redeploy"**

### Step 5: Verify Deployment

Once deployed, test your application:

1. **Check API Status**:
   ```
   https://your-app.vercel.app/api/debug/status
   ```
   Should return:
   ```json
   {
     "legiScanConfigured": true,
     "legiScan": {
       "working": true,
       "billCount": 50
     }
   }
   ```

2. **Visit Homepage**:
   - Should see green **"Live Data"** badge
   - Bills should display real Maryland legislation
   - Click bills to see details

3. **Test Features**:
   - ✅ Newsletter signup
   - ✅ Share buttons on bills
   - ✅ Search and filter functionality
   - ✅ View bill details

## Alternative Deployment Options

### Netlify

1. **Connect Repository**: https://app.netlify.com/start
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment Variables**:
   - Add `LEGISCAN_API_KEY` in Site Settings → Environment Variables
4. **Deploy**

### Railway

1. **New Project**: https://railway.app/new
2. **Deploy from GitHub repo**
3. **Add Environment Variables**:
   - `LEGISCAN_API_KEY`
4. **Deploy automatically**

### Render

1. **New Web Service**: https://dashboard.render.com/
2. **Connect Repository**
3. **Settings**:
   - Build Command: `npm run build`
   - Start Command: `npm start`
4. **Environment Variables**:
   - Add `LEGISCAN_API_KEY`
5. **Create Web Service**

## Database Setup (Optional)

For full features (user accounts, comments, stars, etc.):

### Option 1: Vercel Postgres

1. Go to your Vercel project
2. Click **"Storage"** tab
3. Click **"Create Database"** → **"Postgres"**
4. Follow the setup wizard
5. Environment variables are automatically added
6. In your project terminal:
   ```bash
   npm run db:push
   ```

### Option 2: Neon (Free Tier)

1. Sign up at https://neon.tech
2. Create new project
3. Copy connection string
4. Add to Vercel environment variables:
   ```
   DATABASE_URL = postgresql://user:pass@host.neon.tech/db?sslmode=require
   ```
5. Redeploy

### Option 3: Supabase (Free Tier)

1. Sign up at https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy connection string (Session Pooler mode)
5. Add to environment variables
6. Run migrations

## Environment Variables Reference

### Required

```bash
# LegiScan API Key (Required for live bill data)
LEGISCAN_API_KEY=34a46ef5f092e98f8c02ab088934dc9c
```

### Optional

```bash
# PostgreSQL Database (For full features)
DATABASE_URL=postgresql://user:password@host:5432/database

# Seed database on first deploy
SEED_DATABASE=true

# Node Environment (automatically set by hosting)
NODE_ENV=production
```

## Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] API status shows LegiScan configured and working
- [ ] Green "Live Data" badge visible on homepage
- [ ] Bills display with real Maryland data
- [ ] Newsletter signup works
- [ ] Share buttons function correctly
- [ ] Search and filters work
- [ ] Bill detail pages load
- [ ] No console errors in browser

## Troubleshooting

### Issue: "Sample Data" badge instead of "Live Data"

**Check:**
1. Environment variable `LEGISCAN_API_KEY` is set correctly
2. No typos in the key
3. Deployment was redeployed after adding the variable

**Fix:**
- Redeploy the application after adding environment variable

### Issue: Bills not loading

**Check:**
1. `/api/debug/status` endpoint
2. Browser console for errors
3. Vercel function logs

**Fix:**
- Check Vercel Functions logs for errors
- Verify environment variables

### Issue: Database features not working

**Check:**
1. `DATABASE_URL` is set
2. Database is accessible from Vercel
3. Migrations have been run

**Fix:**
```bash
npm run db:push
```

## Monitoring

### Vercel Analytics

Enable in Vercel dashboard:
1. Go to your project
2. Click **"Analytics"** tab
3. Enable Web Analytics

### API Monitoring

Monitor these endpoints:
- `/api/debug/status` - System health
- `/api/bills` - Bill data
- `/api/stats` - Platform statistics

## Scaling Considerations

As your application grows:

1. **Database Connection Pooling**: Use Supabase or Neon for auto-scaling
2. **CDN**: Vercel automatically provides global CDN
3. **Caching**: LegiScan responses are cached for 15 minutes
4. **Rate Limiting**: Consider implementing for newsletter signup

## Security Best Practices

- ✅ API keys in environment variables (never in code)
- ✅ `.env` file is gitignored
- ✅ Database credentials never exposed
- ✅ HTTPS enforced (automatic on Vercel)
- ✅ Input validation on all forms
- ✅ SQL injection protection via Drizzle ORM

## Support

If you encounter issues:

1. Check `LEGISCAN_STATUS.md` for troubleshooting
2. Review Vercel function logs
3. Test `/api/debug/status` endpoint
4. Run `./test-legiscan.sh` locally

## Success! 🎉

Your About Town application is now live with:
- ✅ Real Maryland legislative data
- ✅ 50+ live state bills
- ✅ Newsletter subscription
- ✅ Bill sharing features
- ✅ Advanced search and filters
- ✅ Production-ready infrastructure

**Share your deployment URL and start engaging your community!**
