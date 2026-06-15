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

### Cron Secret
Set `CRON_SECRET` to any random string — add it in Vercel env vars too.

## 2. Database

Run migrations in order in the Supabase SQL editor:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_realtime_enable.sql`

## 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

## 4. Deploy to Vercel

```bash
npx vercel
```

Add all `.env.local` variables as Vercel environment variables. The `vercel.json` cron runs `/api/push/send` every minute to fire reminders.

## 5. PWA Icons

Add your icons to `public/icons/`:
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)
- `icon-512-maskable.png` (512×512, with safe zone)

Placeholder icons can be generated at [maskable.app](https://maskable.app).
