# Social Login Setup Guide

This guide will help you set up social login providers for the chess game.

## Environment Variables

Add these to your `.env.local` file:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production

# JWT Secret (for custom auth)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OAuth Providers
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
```

## Setting Up OAuth Providers

### 1. Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to your `.env.local`

### 2. GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to your `.env.local`

### 3. Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Set Valid OAuth Redirect URIs: `http://localhost:3000/api/auth/callback/facebook`
5. Copy App ID and App Secret to your `.env.local`

### 4. Instagram OAuth (Optional)

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Instagram Basic Display product
4. Set Valid OAuth Redirect URIs: `http://localhost:3000/api/auth/callback/instagram`
5. Copy Client ID and Client Secret to your `.env.local`

### 5. Telegram Login (Optional)

1. Create a bot with [@BotFather](https://t.me/botfather)
2. Get your bot token
3. Add `TELEGRAM_BOT_TOKEN=your-bot-token` to your `.env.local`

## Testing

1. Start the development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click "Sign In" or "Create Account"
4. Try the social login buttons

## Production Setup

For production, make sure to:

1. Update `NEXTAUTH_URL` to your production domain
2. Update OAuth redirect URIs to your production domain
3. Use strong, unique secrets for `NEXTAUTH_SECRET` and `JWT_SECRET`
4. Set up proper environment variables in your hosting platform

## Troubleshooting

- Make sure all environment variables are set correctly
- Check that redirect URIs match exactly
- Verify OAuth app settings in provider dashboards
- Check browser console for any errors
