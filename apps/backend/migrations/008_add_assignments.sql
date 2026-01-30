-- Add assignments column to action_flows
ALTER TABLE action_flows 
ADD COLUMN IF NOT EXISTS assignments JSONB DEFAULT '[]';
