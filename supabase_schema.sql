-- Migration Script for Nodal Flow Studio
-- This script respects existing tables (organizations, profiles, memberships, etc.)
-- and adds the necessary new tables for the Flow Studio features.

-- 1. Update Organizations
-- Add 'settings' column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'settings') THEN
        ALTER TABLE organizations ADD COLUMN settings JSONB DEFAULT '{}';
    END IF;
END $$;

-- 2. Connectors
CREATE TABLE IF NOT EXISTS connectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "My Google Drive"
    type TEXT NOT NULL, -- "google_drive", "slack", "postgres"
    -- Encrypted credentials or reference to Vault path
    credentials_encrypted TEXT NOT NULL, 
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Flow Design
CREATE TABLE IF NOT EXISTS flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    -- The Graph: Nodes, Edges, Viewport coordinates
    definition JSONB NOT NULL, 
    -- Global variables schema for this flow
    variables_schema JSONB DEFAULT '[]', 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Execution History (The "Action Flow")
CREATE TABLE IF NOT EXISTS action_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_id UUID REFERENCES flows(id) ON DELETE SET NULL,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    status TEXT NOT NULL, -- 'RUNNING', 'COMPLETED', 'FAILED', 'PAUSED'
    temporal_workflow_id TEXT, -- Link to Temporal
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    -- Snapshot of global variables at end of run
    final_state JSONB 
);

-- 5. Unified Actions (Human, Auto, AI)
CREATE TABLE IF NOT EXISTS actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_flow_id UUID REFERENCES action_flows(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Definition Links
    node_id TEXT NOT NULL, -- "step_1" from JSON definition
    type TEXT NOT NULL, -- 'HUMAN', 'AUTOMATION', 'AI'
    
    -- Execution State
    status TEXT NOT NULL, -- 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED'
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    
    -- Human Specifics (Indexed for Inbox)
    -- References 'profiles' instead of 'users' to match existing schema
    assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL, 
    due_date TIMESTAMPTZ,
    priority TEXT DEFAULT 'medium',
    
    -- Idempotency (Industry Standard)
    idempotency_key TEXT, -- Unique key to prevent double-execution
    
    -- The Flexible Data
    config_snapshot JSONB, -- Copy of node config at runtime
    input_data JSONB, -- Inputs passed to this node
    output_data JSONB, -- Result (or Form Submission)
    metadata JSONB -- AI tokens, HTTP status, etc.
);

-- 6. AI Knowledge & Chat
CREATE TABLE IF NOT EXISTS rag_knowledge_bases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL = System Global
    name TEXT NOT NULL,
    vector_collection_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id UUID REFERENCES actions(id) ON DELETE CASCADE, -- Linked to a specific task
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- References 'profiles'
    history JSONB DEFAULT '[]', -- Message history
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Audit Logs (Industry Standard)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- References 'profiles'
    event_type TEXT NOT NULL, -- 'FLOW_CREATED', 'ACTION_COMPLETED'
    resource_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
