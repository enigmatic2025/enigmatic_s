# Nodal Technical Plan

## 1. Architecture Overview
- **Frontend**: Next.js 14+ (React), React Flow, Tailwind CSS.
- **Backend**: Go (Golang), Temporal IO (Workflow Engine), Supabase (PostgreSQL).
- **Communication**: REST API (via Next.js Proxy `/api/proxy`).
- **Deployment**:
    - **Current**: All-in-One Container (Go + Temporal Dev Server) on Koyeb (Free Tier).
    - **Future**: Split services + Temporal Cloud.

## 2. Database Schema (Supabase)
Mixed Relational + JSONB approach for flexibility.

### Core Tables
- **organizations**: `{ id, name, settings(jsonb) }`
- **users**: `{ id, org_id, email, role }`
- **flows**: `{ id, org_id, name, definition(jsonb), draft_definition(jsonb), is_active }`
- **action_flows**: `{ id, flow_id, status, temporal_workflow_id, input_data(jsonb) }` - Running instances.
- **actions**: `{ id, action_flow_id, type, status, output_data(jsonb) }` - Individual steps.

## 3. API Contract
Prefix: `/api/v1` (Proxied from Frontend)

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/flows` | GET/POST | List/Create flows |
| `/flows/{id}` | GET/PUT | Get/Update flow definition |
| `/flows/{id}/unique-validate` | POST | Validate naming uniqueness |
| `/flows/{id}/execute` | POST | **Trigger Flow** (Public/API Trigger) |
| `/test/flow` | POST | Test Run (Draft version) |

## 4. Implementation Status (Completed)
- [x] **Flow Designer**: React Flow w/ Drag & Drop.
- [x] **Node Execution**: Go Backend w/ Temporal.
- [x] **Deployment**: Dockerized All-in-One on Koyeb.
- [x] **API Trigger**: Dynamic URL & execution (`POST /execute`).
- [x] **Visuals**: Design System v1 (Subtle Colors).
- [x] **Validation Framework**: Strict Save Guards + UI Indicators (Ready/Incomplete).
- [x] **Data Ops**: Map, Filter, Switch, Loop Nodes implemented.
- [x] **Process Studio**: Human Task Node, Validation, & Configurator.

## 5. Technical Roadmap
### Phase 1: MVP Polish (Current)
- [x] **Debug Save**: Verify full round-trip of complex flows.
- [x] **Process Studio**: "Human-in-the-Loop" Nodes (Forms/Approvals).
- [x] **Data Ops**: "Map" and "Filter" nodes robust implementation.
- [ ] **Inbox UI**: Frontend interface for executing Human Tasks.

### Phase 2: Signal Studio (Event Driven)
- [ ] **Run Workflow Node**: Fire-and-forget sub-flows.
- [ ] **High Frequency**: optimize for 100+ events/sec.

### Phase 3: Enterprise Scale
- [ ] **Temporal Cloud Migration**: Remove dev server.
- [ ] **RBAC**: Implement Role-Based Access.
- [ ] **Blob Storage**: Use S3 for payloads > 100KB (Claim Check Pattern).

## 6. Development Guidelines
- **Proxies**: All external requests must go through `apps/web/app/api/proxy`.
- **Validation**: Validate node inputs both Frontend (Zod) and Backend (Go Structs).
- **Versioning**: Always modify `draft_definition`. Publish copies Draft -> Active.
- **Database Schema**:
    - **Strict Migrations**: Every Go struct change in `internal/database` that affects storage MUST have a corresponding `.sql` migration file in `migrations/`.
    - **No Manual DDL**: Do not run `ALTER TABLE` manually in production without checking in the migration file first.
