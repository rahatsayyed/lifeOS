# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test suite is configured.

## Architecture

**Life OS** is a Next.js 16 App Router PWA for personal productivity (habits, goals, tasks, recipes, reminders). It uses Supabase as the backend and Dexie (IndexedDB) for offline-first local storage.

### Route groups

- `/(app)/` — protected routes (auth required): habits, goals, tasks, recipes, reminders, settings
- `/(auth)/` — login, OAuth callback
- `/(legal)/` — privacy policy, terms of service
- `/api/push/` — push notification subscription and send endpoints

### Data flow

All mutations go through **Server Actions** in `/actions/` (one file per feature). These write to Supabase. On the client, `useRealtimeSubscription` keeps the UI in sync via Supabase Realtime. Offline writes go to the local Dexie store (mirrored schema) and the `useOfflineSync` hook replays them when connectivity returns.

### Key directories

| Path | Purpose |
|------|---------|
| `/actions/` | Server Actions for all features |
| `/lib/supabase/` | Supabase client (browser), server client (cookies), and generated types |
| `/lib/dexie/` | Dexie (IndexedDB) schema — mirrors Supabase tables for offline support |
| `/hooks/` | `useOfflineSync`, `useNetworkStatus`, `usePushNotifications`, `useRealtimeSubscription` |
| `/components/ui/` | shadcn/ui components (base-nova style, TailwindCSS v4) |
| `/supabase/migrations/` | SQL migrations — run in order in the Supabase SQL editor |

### Reminder notifications

Reminders are sent via a **Supabase Edge Function** (`send-reminders`) triggered by `pg_cron` every minute — not Vercel Cron — because the Vercel Hobby plan only allows daily cron jobs. See `SETUP.md` for deployment steps.

### Environment variables

Required in `.env.local` (copy from `.env.local.example`):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`

### Database

Supabase PostgreSQL. Migrations live in `/supabase/migrations/` and must be run manually in the Supabase SQL editor (no CLI migration runner is configured). RLS is enforced on all tables. `pg_cron` and `pg_net` extensions must be enabled for reminders.
