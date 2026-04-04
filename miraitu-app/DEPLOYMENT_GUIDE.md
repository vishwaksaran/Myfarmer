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
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (required for secure server-side order/payment writes) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `RAZORPAY_KEY_ID` | Razorpay live/test key id used by server APIs |
| `RAZORPAY_KEY_SECRET` | Razorpay live/test key secret (server-only) |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook signing secret |
| `RESEND_API_KEY` | Resend API key for transactional email updates |
| `RESEND_FROM_EMAIL` | Verified sender email for order/payment emails |
| `TWILIO_ACCOUNT_SID` | Twilio account sid for WhatsApp/SMS updates |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_WHATSAPP_FROM` | Twilio WhatsApp sender (example: `whatsapp:+14155238886`) |
| `TWILIO_SMS_FROM` | Optional SMS sender number (only if SMS channel is enabled) |

> ⚠️ Make sure to select **All Environments** (Production, Preview, Development) when adding variables.

### Step 5: Configure Razorpay Webhook
1. Open Razorpay Dashboard → **Settings** → **Webhooks**.
2. Add endpoint URL: `https://miraitu.in/api/razorpay/webhook`.
3. Set the webhook secret and store the same value in `RAZORPAY_WEBHOOK_SECRET` on Vercel.
4. Enable at least these events:
	- `payment.captured`
	- `payment.failed`
5. Save and test the webhook from Razorpay dashboard.

### Step 6: Razorpay Live Key Cutover (When You Move From Test to Live)
Use this exact sequence to avoid payment downtime or signature mismatch:

1. **Complete Razorpay Live activation** (KYC + bank details + website/app review).
2. In Razorpay, switch to **Live Mode**.
3. Generate/copy Live credentials:
	- `RAZORPAY_KEY_ID`
	- `RAZORPAY_KEY_SECRET`
4. Create a **separate Live webhook** for `https://miraitu.in/api/razorpay/webhook`.
5. Set a new strong live `RAZORPAY_WEBHOOK_SECRET` (do not reuse test webhook secret).
6. In Vercel Project → **Settings → Environment Variables** (Production):
	- Replace `RAZORPAY_KEY_ID` with live key id
	- Replace `RAZORPAY_KEY_SECRET` with live key secret
	- Replace `RAZORPAY_WEBHOOK_SECRET` with live webhook secret
7. Redeploy production (`git push origin master` or `vercel --prod`).
8. Run a low-value live payment to verify:
	- Checkout opens and payment succeeds
	- `/api/razorpay/verify-payment` marks order as paid
	- Webhook event is accepted (signature valid)
	- Order appears in admin and user orders timeline
9. Keep test keys for non-production environments only.

#### Quick Rollback (If Any Issue Appears)
1. Restore previous env values in Vercel.
2. Redeploy immediately.
3. Temporarily disable live checkout entry point until fixed.

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
