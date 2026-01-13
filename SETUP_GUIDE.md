# About Town - Setup Guide

This guide will help you set up the About Town application with all its features enabled, including the LegiScan API integration for real Maryland bill data.

## Quick Start (Without Database)

The application can run without a database using sample data:

```bash
npm install
npm run dev
```

Visit http://localhost:5000 to see the app with sample bill data.

## Full Setup (With LegiScan API & Database)

### 1. LegiScan API Key Setup

To get real Maryland state legislature data:

1. **Sign up for LegiScan API**:
   - Visit: https://legiscan.com/signup
   - Fill out the registration form
   - You'll need to provide organization details (you can use "Personal Project" or your organization name)

2. **Get Your API Key**:
   - After registration, log in to https://legiscan.com/user/login
   - Navigate to your account settings or API section
   - Copy your API key

3. **Add API Key to Environment**:
   - Open the `.env` file in the root directory
   - Add your API key:
     ```
     LEGISCAN_API_KEY=your_api_key_here
     ```
   - Save the file

4. **Verify API Connection**:
   ```bash
   npm run dev
   ```
   Then visit: http://localhost:5000/api/debug/status

   You should see:
   ```json
   {
     "legiScanConfigured": true,
     "legiScanTest": {
       "working": true,
       "billCount": 50
     }
   }
   ```

### 2. Database Setup (Optional but Recommended)

The database enables:
- User accounts and authentication
- Persistent comments and votes
- Newsletter subscriptions
- Bill starring/bookmarking
- User profiles

#### Option A: Local PostgreSQL

1. **Install PostgreSQL**:
   - macOS: `brew install postgresql@15`
   - Ubuntu: `sudo apt-get install postgresql`
   - Windows: Download from https://www.postgresql.org/download/

2. **Create Database**:
   ```bash
   psql postgres
   CREATE DATABASE abouttown;
   CREATE USER abouttown_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE abouttown TO abouttown_user;
   \q
   ```

3. **Update `.env` file**:
   ```
   DATABASE_URL=postgresql://abouttown_user:your_password@localhost:5432/abouttown
   ```

#### Option B: Hosted PostgreSQL (Recommended for Production)

Use one of these providers:
- **Vercel Postgres**: Free tier, automatic integration with Vercel
- **Supabase**: Free tier, includes authentication
- **Neon**: Free tier, serverless PostgreSQL
- **Railway**: Free tier, easy deployment

Example with Neon:
1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Add to `.env`:
   ```
   DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require
   ```

### 3. Database Migration

Once you have a database configured:

```bash
# Generate migration files from schema
npm run db:generate

# Apply migrations to database
npm run db:push

# Optional: Open Drizzle Studio to view your database
npm run db:studio
```

### 4. Seed Database (Optional)

To populate the database with sample data:

```bash
# Set in .env
SEED_DATABASE=true

# Then run the server
npm run dev
```

The database will be seeded with:
- Montgomery County jurisdiction
- 21 ZIP codes
- 11 council members
- Sample bills
- Campaign contribution data

## Environment Variables Reference

```bash
# Database (Optional - app works without it)
DATABASE_URL=postgresql://user:password@host:5432/database

# Seed database on first run (Optional)
SEED_DATABASE=false

# LegiScan API Key (Optional - falls back to sample data)
LEGISCAN_API_KEY=your_legiscan_api_key

# Node Environment (automatically set by hosting provider)
NODE_ENV=development
```

## Available Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm start             # Start production server
npm run check         # TypeScript type checking

npm run db:generate   # Generate migration files
npm run db:push       # Apply schema changes to database
npm run db:migrate    # Run migrations
npm run db:studio     # Open Drizzle Studio (database GUI)
```

## Testing the Features

### 1. Live Data Badge
- With LegiScan API configured, you'll see a green "Live Data" badge on the Landing and Dashboard pages
- Without it, you'll see "Sample Data" badge

### 2. Newsletter Signup
- Scroll to the newsletter section on the Landing page
- Enter an email and click "Subscribe"
- Check browser console and server logs to see the subscription recorded

### 3. Bill Sharing
- Click the share icon on any bill card
- Try sharing on different platforms
- Test the "Copy link" functionality

### 4. Advanced Search & Filters
- Use the search bar to find bills by keyword
- Filter by status (introduced, in_committee, passed)
- Filter by topic (education, housing, transportation, etc.)

### 5. Representative Contact
- The `ContactRepTemplate` component can be integrated into bill detail pages
- It provides pre-filled email templates for contacting representatives

### 6. Pagination (API Ready)
- The API supports pagination: `/api/bills?page=1&limit=20`
- Ready for implementation in the frontend when needed

## Deployment

### Vercel (Recommended)

1. **Connect Repository**:
   - Go to https://vercel.com
   - Import your GitHub repository

2. **Set Environment Variables**:
   - In Vercel project settings, add:
     - `LEGISCAN_API_KEY` (your API key)
     - `DATABASE_URL` (if using database)
     - `SEED_DATABASE` (true for first deploy, then false)

3. **Deploy**:
   - Vercel will automatically deploy
   - Visit your site at `your-project.vercel.app`

### Other Platforms

The app can be deployed to:
- Railway
- Render
- Fly.io
- DigitalOcean App Platform
- AWS/GCP/Azure

Just ensure you set the environment variables and use Node.js 18+.

## Troubleshooting

### "Database not configured" errors
- This is expected if you haven't set up a database
- The app will use NoOpStorage and continue working with limited features

### "LegiScan API key not set"
- This is expected if you haven't added your API key
- The app will fall back to sample Maryland bills

### TypeScript errors
- Run `npm run check` to see all type errors
- Run `npm install` to ensure all dependencies are installed

### Build fails
- Check Node.js version (requires 18+): `node --version`
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

## Support

For issues or questions:
- Check the documentation in `/design_guidelines.md`
- Review the codebase exploration in `/VERCEL_DEPLOYMENT.md`
- Open an issue on GitHub

## What's Next?

Once your environment is set up, you can:
1. Add more bill detail enhancements
2. Implement user authentication
3. Add more data sources
4. Expand to other Maryland counties
5. Add email notifications for bill updates
6. Implement comment threading
7. Add analytics and insights
