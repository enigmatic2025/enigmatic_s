-- Migration to add Draft vs Published support
-- Run this in your Supabase SQL Editor

-- 1. Add new columns
ALTER TABLE flows 
ADD COLUMN IF NOT EXISTS draft_definition JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS published_definition JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- 2. Migrate existing data (optional but recommended)
-- Set draft to current definition so we don't lose work
UPDATE flows 
SET draft_definition = definition 
WHERE draft_definition = '{}'::jsonb OR draft_definition IS NULL;

-- 3. (Optional) You can choose to deprecate the old 'definition' column later
-- ALTER TABLE flows DROP COLUMN definition;
