-- Create user_settings table for storing user preferences and settings
-- This table has a 1:1 relationship with the users table

CREATE TABLE public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade unique,

  -- Profile settings
  first_name text,
  last_name text,
  company_size text,
  industry text,

  -- Notification preferences
  email_updates boolean not null default true,
  regulation_alerts boolean not null default true,
  deadline_reminders boolean not null default true,
  weekly_digest boolean not null default false,

  -- Privacy settings
  profile_visibility boolean not null default true,
  data_sharing boolean not null default false,
  analytics_opt_in boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast user lookups
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own settings
CREATE POLICY "Users can view their own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" ON public.user_settings
  FOR DELETE USING (auth.uid() = user_id);