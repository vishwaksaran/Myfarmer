# Deployment Guide for Miraitu App

## Overview
- **App URL**: [https://miraitu.in](https://miraitu.in)
- **Framework**: Next.js 16
- **Hosting**: Vercel
- **Repository**: [vishwaksaran/Myfarmer](https://github.com/vishwaksaran/Myfarmer)
- **Production Branch**: `master`
- **Root Directory**: `miraitu-app` (subdirectory of the repo)

---

## 🚀 Auto-Deployment Setup (GitHub → Vercel)

Vercel has a **native Git integration** that automatically deploys your app whenever you push to GitHub. No CI/CD scripts or GitHub Actions needed!

### Step 1: Connect GitHub Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and log in.
2. Click on your **miraitu-app** project.
3. Navigate to **Settings** → **Git**.
4. Under **Git Repository**, click **Connect Git Repository**.
5. Select **GitHub** and authorize Vercel if prompted.
6. Search for and select: **`vishwaksaran/Myfarmer`**.
7. Click **Connect**.

### Step 2: Configure Root Directory
Since the Next.js app is in a subdirectory (`miraitu-app/`), not the repo root:
1. Go to **Settings** → **General**.
2. Under **Root Directory**, set it to: `miraitu-app`.
3. Click **Save**.

### Step 3: Set Production Branch
1. In **Settings** → **Git**, ensure the **Production Branch** is set to `master`.
2. This means every push to `master` triggers a **production deployment**.

### Step 4: Configure Environment Variables
1. Go to **Settings** → **Environment Variables**.
2. Add the following variables (copy values from your `.env.local` file):

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

> ⚠️ Make sure to select **All Environments** (Production, Preview, Development) when adding variables.

---

## 🔄 How Auto-Deployment Works

Once the GitHub integration is connected:

| Action | Result |
|---|---|
| `git push origin master` | ✅ **Production deployment** triggered automatically |
| Push to any other branch | ✅ **Preview deployment** created (unique URL) |
| Open a Pull Request | ✅ **Preview deployment** with a comment on the PR |

### Deployment Workflow
```
Code Change → git add . → git commit → git push origin master → Vercel auto-deploys 🚀
```

### Quick Deploy Commands
```bash
# Stage all changes
git add .

# Commit with a message
git commit -m "your change description"

# Push to master → triggers auto-deployment
git push origin master
```

---

## 🛠️ Manual Deployment

If you need to deploy without pushing to GitHub:

```bash
cd miraitu-app
npx vercel --prod
```

---

## 🔧 Troubleshooting

### Build Fails on Vercel
- Check the **Deployments** tab in Vercel Dashboard for error logs.
- Ensure all environment variables are set correctly.
- Verify the **Root Directory** is set to `miraitu-app`.

### Supabase Connectivity Issues
- `src/lib/supabase.ts` handles missing environment variables gracefully during build.
- Ensure Supabase environment variables are set in Vercel's Environment Variables settings.

### Changes Not Deploying
- Verify the GitHub integration is connected: **Settings** → **Git**.
- Check that you're pushing to the correct branch (`master`).
- Look at the **Deployments** tab to see if a build was triggered.

---

## 📋 Vercel Project Info
- **Project Name**: `miraitu-app`
- **Project ID**: `prj_jrlbfRoTzxphGA0jDYPjdjfkOlef`
- **Org/Team ID**: `team_PbL23XfyTRFdzY4NsCRCYxLT`
