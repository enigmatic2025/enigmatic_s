-- Migration to add input_data column to action_flows table
-- Run this in your Supabase SQL Editor

-- 1. Add input_data column
ALTER TABLE action_flows 
ADD COLUMN IF NOT EXISTS input_data JSONB DEFAULT '{}'::jsonb;
