-- Automation Configs Table
-- Stores recurring automation configurations

-- First, create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create automation_configs table
CREATE TABLE IF NOT EXISTS public.automation_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  config JSONB NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  next_run TIMESTAMP WITH TIME ZONE,
  last_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_automation_configs_user_id ON public.automation_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_configs_status ON public.automation_configs(status);
CREATE INDEX IF NOT EXISTS idx_automation_configs_next_run ON public.automation_configs(next_run);

-- Enable Row Level Security
ALTER TABLE public.automation_configs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own automation configs" ON public.automation_configs;
DROP POLICY IF EXISTS "Users can insert own automation configs" ON public.automation_configs;
DROP POLICY IF EXISTS "Users can update own automation configs" ON public.automation_configs;
DROP POLICY IF EXISTS "Users can delete own automation configs" ON public.automation_configs;

-- Create RLS Policies
CREATE POLICY "Users can view own automation configs"
  ON public.automation_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own automation configs"
  ON public.automation_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own automation configs"
  ON public.automation_configs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own automation configs"
  ON public.automation_configs FOR DELETE
  USING (auth.uid() = user_id);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_automation_configs_updated_at ON public.automation_configs;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_automation_configs_updated_at
  BEFORE UPDATE ON public.automation_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
