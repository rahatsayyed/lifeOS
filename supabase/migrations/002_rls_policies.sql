-- Helper function: check if two users are connected with accepted status
CREATE OR REPLACE FUNCTION are_connected(a UUID, b UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.connections
    WHERE status = 'accepted'
      AND ((user_a_id = a AND user_b_id = b) OR (user_a_id = b AND user_b_id = a))
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function: check sharing level between two users for a category
CREATE OR REPLACE FUNCTION sharing_level(viewer UUID, owner UUID, cat TEXT) RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT ss.level
     FROM public.sharing_settings ss
     JOIN public.connections c ON ss.connection_id = c.id
     WHERE ss.owner_id = owner
       AND ss.category = cat
       AND c.status = 'accepted'
       AND (c.user_a_id = viewer OR c.user_b_id = viewer)),
    'none'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- =====================
-- USERS
-- =====================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own" ON public.users FOR ALL USING (auth.uid() = id);
CREATE POLICY "users_connected_read" ON public.users FOR SELECT USING (
  are_connected(auth.uid(), id)
);

-- =====================
-- CONNECTIONS
-- =====================
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "connections_participant_read" ON public.connections FOR SELECT USING (
  auth.uid() = user_a_id OR auth.uid() = user_b_id
);
CREATE POLICY "connections_insert" ON public.connections FOR INSERT WITH CHECK (
  auth.uid() = user_a_id
);
CREATE POLICY "connections_accept" ON public.connections FOR UPDATE USING (
  auth.uid() = user_b_id
) WITH CHECK (status = 'accepted');

-- =====================
-- SHARING SETTINGS
-- =====================
ALTER TABLE public.sharing_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sharing_own" ON public.sharing_settings FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "sharing_partner_read" ON public.sharing_settings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.connections c
    WHERE c.id = sharing_settings.connection_id
      AND c.status = 'accepted'
      AND (c.user_a_id = auth.uid() OR c.user_b_id = auth.uid())
  )
);

-- =====================
-- HABITS
-- =====================
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habits_own" ON public.habits FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "habits_partner_read" ON public.habits FOR SELECT USING (
  sharing_level(auth.uid(), owner_id, 'habits') != 'none'
);

-- =====================
-- HABIT LOGS
-- =====================
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habit_logs_own" ON public.habit_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "habit_logs_partner_read" ON public.habit_logs FOR SELECT USING (
  sharing_level(auth.uid(), user_id, 'habits') != 'none'
);

-- =====================
-- WEEKLY GOALS
-- =====================
ALTER TABLE public.weekly_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weekly_goals_own" ON public.weekly_goals FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "weekly_goals_partner_read" ON public.weekly_goals FOR SELECT USING (
  sharing_level(auth.uid(), owner_id, 'goals') != 'none'
);

-- =====================
-- REWARDS
-- =====================
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rewards_own" ON public.rewards FOR ALL USING (auth.uid() = owner_id);

-- =====================
-- TASKS
-- =====================
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_own" ON public.tasks FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "tasks_partner_read" ON public.tasks FOR SELECT USING (
  sharing_level(auth.uid(), owner_id, 'tasks') != 'none'
);

-- =====================
-- RECIPES
-- =====================
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipes_own" ON public.recipes FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "recipes_partner_read" ON public.recipes FOR SELECT USING (
  sharing_level(auth.uid(), owner_id, 'recipes') != 'none'
);

-- =====================
-- REMINDERS
-- =====================
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reminders_own" ON public.reminders FOR ALL USING (auth.uid() = owner_id);

-- =====================
-- PUSH SUBSCRIPTIONS
-- =====================
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_own" ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id);
