# Life OS — Setup Guide

## 1. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

### Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings → API → copy `Project URL` and `anon public` key
3. Enable Google OAuth: Authentication → Providers → Google → add your Google OAuth credentials
4. Set redirect URL in Google Console: `https://your-project.supabase.co/auth/v1/callback`

### VAPID Keys (for push notifications)
```bash
npx web-push generate-vapid-keys
```
Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT=mailto:you@email.com`

## 2. Database

Run migrations in order in the Supabase SQL editor:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_realtime_enable.sql`
3. `supabase/migrations/004_pg_cron_reminders.sql`

## 3. Reminder Push Notifications (Supabase Edge Function + pg_cron)

Vercel Hobby only allows daily cron jobs. Reminders use a Supabase Edge Function triggered by `pg_cron` instead (free, runs every minute).

### Deploy the Edge Function

```bash
npx supabase functions deploy send-reminders --project-ref YOUR_PROJECT_REF
```

Set these secrets on the Edge Function (Supabase Dashboard → Edge Functions → send-reminders → Secrets):
- `VAPID_PUBLIC_KEY` — your VAPID public key (without `NEXT_PUBLIC_` prefix)
- `VAPID_PRIVATE_KEY` — your VAPID private key
- `VAPID_SUBJECT` — e.g. `mailto:you@email.com`

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically injected by Supabase.

### Set Up pg_cron

Edit `supabase/migrations/004_pg_cron_reminders.sql`, replace:
- `YOUR_PROJECT_REF` with your Supabase project ref (found in Settings → General)
- `YOUR_ANON_KEY` with your `anon public` key

Then run it in the Supabase SQL editor.

> **Note:** `pg_cron` and `pg_net` must be enabled. Go to Database → Extensions and enable them if not already active.

## 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

## 5. Deploy to Vercel

```bash
npx vercel
```

Add these environment variables in Vercel Dashboard (or via `vercel env add`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

## 6. PWA Icons

Add your icons to `public/icons/`:
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)
- `icon-512-maskable.png` (512×512, with safe zone)

Placeholder icons can be generated at [maskable.app](https://maskable.app).
