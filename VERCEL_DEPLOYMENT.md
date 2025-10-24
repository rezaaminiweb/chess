# Vercel Deployment Guide

This guide will help you deploy your chess game to Vercel successfully.

## Required Environment Variables

Add these environment variables in your Vercel dashboard (Project Settings → Environment Variables):

### Database
```
DATABASE_URL=postgresql://username:password@host:port/database
```

### NextAuth.js (Required)
```
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-super-secret-nextauth-key-minimum-32-characters
```

### JWT Secret (Required)
```
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
```

### OAuth Providers (Optional - only add if you want social login)
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret

TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

## Database Setup

### Option 1: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Postgres
3. Copy the connection string and use it as `DATABASE_URL`

### Option 2: External Database
- Use services like Supabase, PlanetScale, or Railway
- Get the connection string and use it as `DATABASE_URL`

## Deployment Steps

1. **Set up environment variables** in Vercel dashboard
2. **Connect your GitHub repository** to Vercel
3. **Deploy** - Vercel will automatically run the build process

## Build Process

The build process will:
1. Install dependencies (`npm install`)
2. Generate Prisma client (`prisma generate`)
3. Build the Next.js application (`next build`)

## Troubleshooting

### Common Issues:

1. **"Failed to collect page data"** - Usually caused by missing environment variables
2. **Database connection errors** - Check your `DATABASE_URL`
3. **NextAuth errors** - Ensure `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set

### After Deployment:

1. Run database migrations:
   ```bash
   npx prisma db push
   ```
   Or use Vercel's CLI:
   ```bash
   vercel env pull .env.local
   npx prisma db push
   ```

2. Verify your deployment by visiting your Vercel URL

## Security Notes

- Never commit `.env` files to your repository
- Use strong, unique secrets for production
- Update OAuth redirect URIs to your production domain
- Consider using Vercel's environment variable encryption

## Support

If you encounter issues:
1. Check Vercel's build logs
2. Verify all environment variables are set
3. Ensure your database is accessible from Vercel
4. Check that all OAuth redirect URIs are updated for production
