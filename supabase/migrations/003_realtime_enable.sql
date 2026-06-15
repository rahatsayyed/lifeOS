-- Enable Realtime for live sync between connected users
ALTER PUBLICATION supabase_realtime ADD TABLE public.habit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
