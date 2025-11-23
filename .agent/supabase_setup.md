# Supabase Setup & Configuration

## Authentication (Hybrid Mode)
The backend (`apps/backend`) is configured to support **Hybrid Authentication** to handle both new (ECC) and legacy (HMAC) keys.

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

### Schema Notes
- **Organizations Table**: Contains `subscription_plan` (default 'free') and `subscription_status`.
- **Memberships Table**: Uses `org_id` as the foreign key to organizations.


## Frontend
- Uses `@supabase/supabase-js`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Publishable key (safe for browser).
- **Login Redirect**: Should redirect to the user's organization dashboard (`/nodal/[slug]/dashboard`).
