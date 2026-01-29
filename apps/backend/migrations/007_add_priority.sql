-- Add priority column to action_flows
ALTER TABLE action_flows 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';

-- Optional: Add check constraint for valid priorities
-- ALTER TABLE action_flows ADD CONSTRAINT check_priority CHECK (priority IN ('low', 'medium', 'high', 'critical'));
