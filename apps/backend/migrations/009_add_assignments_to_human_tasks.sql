-- Add assignments column to human_tasks
ALTER TABLE human_tasks 
ADD COLUMN IF NOT EXISTS assignments JSONB DEFAULT '[]';
