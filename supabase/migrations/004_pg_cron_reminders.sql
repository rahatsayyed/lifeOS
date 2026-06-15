-- Enable pg_cron and pg_net extensions (required for scheduled edge function calls)
-- Run this in the Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the send-reminders edge function to run every minute
-- Replace 'YOUR_PROJECT_REF' with your Supabase project reference (found in project settings)
SELECT cron.schedule(
  'send-reminders-every-minute',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://eqzzbmwhwqlyctbihycv.supabase.co/functions/v1/send-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer sb_publishable_IjJtcmC-qK_7cO56RP5qhA_sFpRaMhy"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
