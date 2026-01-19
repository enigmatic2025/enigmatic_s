-- Migration to ensure action_flows table matches Go struct RecordActionFlowActivity
-- Run this in Supabase SQL Editor

ALTER TABLE action_flows 
ADD COLUMN IF NOT EXISTS run_id UUID, -- or TEXT depending on format, usually UUID from Temporal
ADD COLUMN IF NOT EXISTS temporal_id TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'RUNNING',
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NOW();

-- Note: input_data was added in 002, but include here just in case (IF NOT EXISTS handles duplication)
ALTER TABLE action_flows 
ADD COLUMN IF NOT EXISTS input_data JSONB DEFAULT '{}'::jsonb;
