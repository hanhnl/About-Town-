# Vercel Deployment Guide

This app has been configured to deploy on Vercel's serverless platform.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. A PostgreSQL database (recommended: Vercel Postgres, Neon, or Supabase)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub** (if not already done)

2. **Go to Vercel Dashboard**
   - Visit https://vercel.com/new
   - Click "Import Project"
   - Select your GitHub repository

3. **Configure Environment Variables**
   - In the project settings, add these environment variables:
     ```
     DATABASE_URL=postgresql://user:password@host:5432/database
     ```
   - Optional variables:
     ```
     SEED_DATABASE=true  (only for first deployment to populate database)
     LEGISCAN_API_KEY=your_api_key_here  (for state legislature data)
     ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically:
     - Install dependencies
     - Build the frontend
     - Set up serverless functions
     - Deploy your app

5. **Run Database Migrations**
   - After first deployment, you may need to initialize your database schema
   - Use Drizzle Kit: `npm run db:push`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Database Setup

### Using Vercel Postgres (Recommended)

1. In your Vercel project dashboard, go to "Storage"
2. Click "Create Database" → "Postgres"
3. Vercel will automatically set the `DATABASE_URL` environment variable

### Using External Database (Neon, Supabase, etc.)

1. Create a PostgreSQL database with your provider
2. Get the connection string (should look like: `postgresql://user:password@host:5432/dbname`)
3. Add it as `DATABASE_URL` in Vercel environment variables

## Post-Deployment

### Initialize Database Schema

```bash
# If you set SEED_DATABASE=true, the schema will auto-create on first deploy
# Otherwise, run migrations manually:
npm run db:push
```

### Verify Deployment

1. Visit your deployed URL (e.g., `https://your-app.vercel.app`)
2. Check API endpoints work: `https://your-app.vercel.app/api/bills`
3. Check frontend loads properly

## Architecture

- **Frontend**: Static files served from `dist/public/`
- **API**: Serverless function at `/api/` (powered by `api/index.ts`)
- **Database**: PostgreSQL with connection pooling optimized for serverless

## Troubleshooting

### Build Fails

- Check the build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify DATABASE_URL is correct

### API Returns 500 Errors

- Check Vercel function logs
- Verify DATABASE_URL is accessible from Vercel's servers
- Ensure database accepts connections from Vercel's IP ranges

### Database Connection Errors

- Serverless functions have connection limits
- The app uses connection pooling (`max: 1` per function)
- Consider using a connection pooler like PgBouncer for high traffic

### Cold Start Issues

- First request after inactivity may be slow (cold start)
- This is normal for serverless architectures
- Consider Vercel Pro for reduced cold starts

## Cost Optimization

- **Hobby Plan** (Free):
  - 100GB bandwidth/month
  - Serverless function execution
  - Good for development/low-traffic apps

- **Pro Plan** ($20/month):
  - Faster builds
  - Better analytics
  - Team collaboration

## Local Development

To develop locally (not using Vercel):

```bash
# Use the normal dev command
npm run dev

# This runs the traditional Node.js server (not serverless)
```

## Monitoring

- View function logs: Vercel Dashboard → Your Project → Functions
- View analytics: Vercel Dashboard → Your Project → Analytics
- Set up error tracking: Add Sentry or similar

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord
- About Town Issues: https://github.com/your-repo/issues
