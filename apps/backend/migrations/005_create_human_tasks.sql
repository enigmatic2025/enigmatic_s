-- Create human_tasks table
CREATE TABLE IF NOT EXISTS human_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
    run_id TEXT NOT NULL, -- Temporal Run ID
    title TEXT NOT NULL,
    description TEXT,
    assignee TEXT NOT NULL, -- Email address or Role identifier
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, REJECTED, CANCELLED
    schema JSONB NOT NULL DEFAULT '{}'::jsonb, -- Defines the input fields required
    output JSONB, -- Stores the user-submitted data
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Inbox performance
CREATE INDEX IF NOT EXISTS idx_human_tasks_assignee ON human_tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_human_tasks_status ON human_tasks(status);
CREATE INDEX IF NOT EXISTS idx_human_tasks_run_id ON human_tasks(run_id);
