# Supabase Setup & Configuration

## Authentication (Hybrid Mode)
The backend (`apps/backend`) is configured to support **Hybrid Authentication** to handle both both new (ECC) and legacy (HMAC) keys.

### Backend Logic
- **Primary Method**: JWKS (JSON Web Key Sets). The backend fetches public keys from `<SUPABASE_URL>/auth/v1/.well-known/jwks.json`.
- **Fallback Method**: HMAC (HS256). If JWKS verification fails (e.g., for tokens signed with the legacy secret), it falls back to verifying with the `SUPABASE_JWT_SECRET`.

### Environment Variables
- `SUPABASE_URL`: Required for fetching JWKS.
- `SUPABASE_JWT_SECRET`: The **Legacy JWT Secret** (starts with `Es3...` in this project). Required for the fallback mechanism.
- `SUPABASE_KEY`: Service Role Key. Used for admin database access.

## Row Level Security (RLS)
RLS is strictly enforced.

### Critical Policies
1.  **Organization Creation**: Restricted to System Admins only (`is_system_admin(auth.uid())`).
2.  **Organization Access**:
    - Users can view organizations they are members of.
    - System Admins can view ALL organizations.
3.  **Infinite Recursion Prevention**:
    - Uses `security definer` functions (e.g., `get_user_org_ids`) to bypass RLS when checking permissions within policies.

## Role Hierarchy (Dual-Layer)

### 1. System Level ("God Mode")
- **Storage**: `profiles` table -> `system_role` column.
- **Values**: `'user'` (default) or `'admin'`.
- **Scope**: The entire Nodal Platform.
- **Capabilities**:
    - View/Edit ALL organizations.
    - Create NEW organizations.
    - Promote other System Admins.
    - Access `/nodal/admin`.

### 2. Organization Level ("Tenant Mode")
- **Storage**: `memberships` table -> `role` column.
- **Foreign Keys**: `user_id` (profiles.id) and `org_id` (organizations.id).
- **Values**: `'owner'`, `'admin'`, `'member'`.
- **Scope**: Single Organization only.
- **Capabilities**:
    - **Owner**: Billing, deletion, full control of THAT org.
    - **Admin**: Invite members, change settings for THAT org.
    - **Member**: Standard access within THAT org.

## Database Schema

### Existing Tables
The following tables are present in the database:

```sql
-- Profiles (Users)
create table public.profiles (
  id uuid not null,
  email text null,
  full_name text null,
  avatar_url text null,
  system_role text null default 'user'::text,
  updated_at timestamp with time zone null,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_system_role_check check ((system_role = any (array['user'::text, 'admin'::text]))),
  constraint username_length check ((char_length(full_name) >= 3))
) TABLESPACE pg_default;

-- Organizations
create table public.organizations (
  id uuid not null default gen_random_uuid (),
  name text not null,
  slug text not null,
  billing_email text null,
  stripe_customer_id text null,
  subscription_plan text null default 'free'::text,
  subscription_status text null default 'active'::text,
  settings JSONB DEFAULT '{}', -- Added for Flow Studio
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  created_by uuid null default auth.uid (),
  constraint organizations_pkey primary key (id),
  constraint organizations_slug_key unique (slug),
  constraint organizations_created_by_fkey foreign KEY (created_by) references auth.users (id)
) TABLESPACE pg_default;

-- Memberships (Org Users)
create table public.memberships (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  org_id uuid not null,
  role text null default 'member'::text,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint memberships_pkey primary key (id),
  constraint memberships_user_id_org_id_key unique (user_id, org_id),
  constraint memberships_org_id_fkey foreign KEY (org_id) references organizations (id) on delete CASCADE,
  constraint memberships_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE,
  constraint memberships_role_check check ((role = any (array['owner'::text, 'admin'::text, 'member'::text])))
) TABLESPACE pg_default;

-- Invitations
create table public.invitations (
  id uuid not null default gen_random_uuid (),
  org_id uuid not null,
  email text not null,
  role text null default 'member'::text,
  token text not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint invitations_pkey primary key (id),
  constraint invitations_org_id_email_key unique (org_id, email),
  constraint invitations_token_key unique (token),
  constraint invitations_org_id_fkey foreign KEY (org_id) references organizations (id) on delete CASCADE,
  constraint invitations_role_check check ((role = any (array['owner'::text, 'admin'::text, 'member'::text])))
) TABLESPACE pg_default;

-- API Keys
create table public.api_keys (
  id uuid not null default gen_random_uuid (),
  org_id uuid not null,
  key_hash text not null,
  label text null,
  last_used_at timestamp with time zone null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint api_keys_pkey primary key (id),
  constraint api_keys_key_hash_key unique (key_hash),
  constraint api_keys_org_id_fkey foreign KEY (org_id) references organizations (id) on delete CASCADE
) TABLESPACE pg_default;

-- Connectors
CREATE TABLE connectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    credentials_encrypted TEXT NOT NULL, 
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flows
CREATE TABLE flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    definition JSONB NOT NULL, 
    variables_schema JSONB DEFAULT '[]', 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Action Flows (Execution History)
CREATE TABLE action_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_id UUID REFERENCES flows(id) ON DELETE SET NULL,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    temporal_workflow_id TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    final_state JSONB 
);

-- Actions (Unified)
CREATE TABLE actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_flow_id UUID REFERENCES action_flows(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL, 
    due_date TIMESTAMPTZ,
    priority TEXT DEFAULT 'medium',
    idempotency_key TEXT,
    config_snapshot JSONB,
    input_data JSONB,
    output_data JSONB,
    metadata JSONB
);

-- AI Knowledge Bases
CREATE TABLE rag_knowledge_bases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    vector_collection_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Sessions
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id UUID REFERENCES actions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    history JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Frontend
- Uses `@supabase/supabase-js`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Publishable key (safe for browser).
- **Login Redirect**: Should redirect to the user's organization dashboard (`/nodal/[slug]/dashboard`).
