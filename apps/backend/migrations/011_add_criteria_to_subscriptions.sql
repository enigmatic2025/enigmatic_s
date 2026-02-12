-- Add criteria column to automation_subscriptions
ALTER TABLE automation_subscriptions ADD COLUMN criteria JSONB DEFAULT '{}'::jsonb;
