-- Migration to allow flow_id to be NULL in action_flows
-- (Enables recording logs for "Test Runs" of unsaved flows)

ALTER TABLE action_flows 
ALTER COLUMN flow_id DROP NOT NULL;
