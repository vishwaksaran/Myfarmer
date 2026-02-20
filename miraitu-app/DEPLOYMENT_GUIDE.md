# Deployment Guide for Miraitu App

## Setup Status
- **App URL**: [https://miraitu.in](https://miraitu.in) (or your Vercel project URL)
- **Framework**: Next.js
- **Hosting**: Vercel

## Enables Auto-Deployment from GitHub
To enable automatic deployments whenever you push to the `master` branch, follow these steps in the Vercel Dashboard:

1.  **Connect GitHub Repository**:
    - Go to your Vercel Project Settings > **Git**.
    - Click **Connect Remote**.
    - Select the repository: `vishwaksaran/Myfarmer`.

2.  **Configure Root Directory**:
    - In Project Settings > **General** > **Root Directory**.
    - Ensure it is set to `miraitu-app`.
    - This tells Vercel that your Next.js app lives in the subdirectory, not the repository root.

3.  **Configure Environment Variables**:
    - Go to Project Settings > **Environment Variables**.
    - Add the following variables (use real values, not placeholders):
        - `NEXT_PUBLIC_SUPABASE_URL`
        - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
        - `NEXT_PUBLIC_FIREBASE_API_KEY`
        - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
        - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
        - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
        - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
        - `NEXT_PUBLIC_FIREBASE_APP_ID`

## Manual Deployment
You can always trigger a manual deployment from your terminal:

```bash
cd miraitu-app
npx vercel --prod
```

## Recent Fixes
- **Supabase Connectivity**: We updated `src/lib/supabase.ts` to handle missing environment variables gracefully during the build process. This prevents build failures when variables are not yet set in Vercel.
