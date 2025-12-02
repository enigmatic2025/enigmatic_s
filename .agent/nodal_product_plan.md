# Nodal - Official Product Requirement Document (PRD)

## 1. Executive Summary
Nodal is a Business Process Platform (BPP) designed to bridge the gap between visual diagramming (LucidChart), automation (Power Automate, n8n), and simulation (Sim.ai). It empowers users to design complex business workflows that integrate automation, human-in-the-loop interactions, and AI agents.

## 2. Core Philosophy
-   **Visual First**: The design experience should feel like drawing a process map.
-   **Hybrid Workflows**: Seamlessly mix automated steps, human tasks, and AI reasoning.
-   **Observability**: Non-technical users must understand where a process is, who is responsible, and identify bottlenecks.
-   **Testability**: Every component and the entire flow must be verifiable.

## 2.1. Terminology
-   **Flow**: The blueprint/design of the business process.
-   **Action Flow**: An active, running instance of a Flow.
-   **Action**: A single job within an Action Flow. Can be:
    -   **Human Action**: A task requiring user input (Approval, Form).
    -   **Automation Action**: A system task (HTTP Request, DB Insert).
    -   **Automation Action**: A system task (HTTP Request, DB Insert).

## 3. Key Features

### 3.1. The Designer (Builder Experience)
-   **Interface**: A canvas-based UI (likely built with **React Flow**) for dragging and dropping nodes.
-   **Visual Language (Color Coding)**:
    -   **Triggers**: **Blue** (e.g., Schedule, Webhook) - The start of every flow.
    -   **Actions**: **Orange** (e.g., HTTP Request, Email) - External side effects.

    -   **Human**: **Green** (e.g., Approval, Form) - User interaction.
    -   **Logic**: **Gray** (e.g., If/Else, Loop) - Control flow.
-   **Node Types**:
    -   **Triggers**: Events that start a process (Form submission, Webhook, Schedule).
        -   *Schedule*: Supports Cron expressions, specific intervals, and timezone-aware execution (US Timezones + UTC).
    -   **Actions (Automation)**: API calls, Database operations (SQL insert), Email sending.
    -   **Human-in-the-Loop**: Approval steps, Form filling tasks. The workflow *pauses* here.

    -   **Logic**: Conditionals, Loops, Parallel branches (Fork/Join).
-   **Variables**: Global and local scope variables to pass data between nodes.
-   **Authentication**: Integrated OAuth management for third-party services (Google, Microsoft, etc.).
-   **Environments**: Support for Dev/Staging/Prod values for variables (e.g., Stripe Test Key vs Live Key).

### 3.2. The User View (Participant Experience)
-   **Action Center**:
    -   Users see the process map visualized, but with a focus on *their* **Actions**.
    -   **AI-Assisted Interaction**: Instead of just static forms, users interact via an **AI Chat** interface.
        -   Ask questions about the task (RAG-enabled knowledge base).
        -   Submit documents/files.
        -   Complete the Action via conversation or UI widgets.
    -   **Collaboration**: Commenting on nodes, attaching files.
    -   **Status Tracking**: See exactly where the Action Flow is, historical timeline, and blockers.

### 3.3. Execution Engine
-   **State Management**: Must support long-running processes (days/weeks).
    -   Persistence of workflow state during "wait" phases.
-   **Concurrency**: Support for parallel execution paths.
-   **Error Handling**: Retry mechanisms and manual intervention capabilities.

### 3.4. Data Transformation (The "Glue")
**Core Requirement**: Robust data manipulation similar to Power Automate/n8n.

#### Core Functions
1.  **Select (Map)**: Transform lists (e.g., extract names from a user list).
2.  **Filter**: Remove items based on conditions (e.g., `role == "admin"`).
3.  **Compose**: Create new JSON/Text objects from variables.
4.  **Time Conversion**: Timezone conversion (`convertTimezone`), formatting (`formatDate`), and arithmetic (`addDays`).
5.  **Collection Operations**:
    -   **Join**: Merge datasets (e.g., SQL rows + API results).
    -   **Sort/Unique/Group By**: Organize data.
6.  **Parsing & Serialization**: JSON, CSV, XML conversion.
7.  **Binary & String**: Base64 encoding (for files), Regex extraction.

#### Implementation Strategy: Visual First (Low-Code)
-   **Primary Interface**: **Visual Builders**.
    -   **Select Node**: A UI table mapping "Source" to "Target".
    -   **Filter Node**: A "Query Builder" (e.g., `[Price] [>] [100]`).
    -   **Expression Language**: Simple syntax like `{{ steps.trigger.id }}` for basic variable insertion.
-   **Secondary (Advanced)**: **Code Node** (Optional/Future).
    -   We can add a "Run Script" node later for developers, but the core experience should be no-code to avoid overwhelming users.

### 3.5. Handling Large Data (The "100k Rows" Problem)
-   **Problem**: Storing 100k rows of JSON in the database execution state will bloat the DB and slow down the UI.
-   **Solution: The "Claim Check" Pattern**.
    -   **Small Data (< 100KB)**: Stored directly in the Execution State (DB).
    -   **Large Data (> 100KB)**: Automatically offloaded to **Blob Storage** (S3/MinIO).
    -   **Reference**: The Execution State only stores a pointer: `{"$ref": "s3://bucket/execution_id/step_b_output.json"}`.
    -   **UI**: When the user views the step, we fetch the data on-demand (with pagination) instead of loading it all at once.

### 3.6. Templates & Reusability
-   Pre-built templates for common organizational processes.
-   Ability to save custom workflows as templates.

### 3.7. Enterprise Features (Industry Standard)
-   **RBAC (Role-Based Access Control)**:
    -   **Viewer**: Can see status but not edit.
    -   **Editor**: Can change Flow design.
    -   **Admin**: Can manage API keys and Billing.
-   **Flow Lifecycle**:
    -   **Draft**: Work in progress.
    -   **Versioned**: Immutable snapshot (v1, v2).
    -   **Published**: The version currently receiving traffic.
-   **Testing & Simulation**:
    -   **Dry Run**: Execute a flow with "Mock" outputs for actions (don't actually send the email).
    -   **Replay**: Re-run a failed execution from a specific step with corrected data.

## 4. Technical Architecture

### 4.1. Frontend
-   **Framework**: React.
-   **Library**: **React Flow** for the canvas.
-   **State**: Robust local state management (Zustand/Redux) synced with backend.

### 4.2. Backend
-   **Language**: **Go (Golang)**.
-   **Workflow Engine**: **Temporal.io** (Go SDK).
    -   **Implemented**: The backend is fully integrated with Temporal for durable execution.
    -   **Infrastructure**: Runs via Docker Compose, including:
        -   **Temporal Server**: The core engine.
        -   **PostgreSQL**: Stores Temporal's internal state (Tasks, Workflow History).
        -   **Elasticsearch**: Powers Temporal's advanced visibility features.
-   **Node Execution**:
    -   **Registry Pattern**: All nodes are registered in `internal/nodes/registry.go`.
    -   **Dynamic Loading**: The `NodeExecutionActivity` dynamically looks up the correct executor based on the node type.

### 4.3. Modularity Strategy
-   **Node Registry**: To add a new node, simply implement the `NodeExecutor` interface and add it to the `Registry` map.
-   **Testing**:
    -   **Unit Tests**: `POST /api/test/node` allows testing individual node logic without running a full workflow.
    -   **Integration Tests**: `POST /api/test/flow` triggers a real Temporal workflow for end-to-end verification.

---

## 5. Detailed Data Model & Schema

### 5.1. Strategy: Hybrid (Columns + JSONB)
-   **Why?**: We need the **flexibility** of NoSQL (for evolving node configs) but the **query power** of SQL (for "Find all pending tasks").
-   **Rule**:
    -   **Columns**: Fields we need to `ORDER BY`, `FILTER`, or `JOIN` (e.g., `status`, `assignee_id`, `created_at`).
    -   **JSONB**: Everything else (e.g., specific form data, node configuration, complex AI results).

### 5.2. SQL Schema (PostgreSQL)

```sql
-- 1. Organizations & Users
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    settings JSONB DEFAULT '{}', -- Feature flags, branding
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL, -- 'admin', 'editor', 'viewer'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Secrets & Connectors
CREATE TABLE connectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    name TEXT NOT NULL, -- "My Google Drive"
    type TEXT NOT NULL, -- "google_drive", "slack", "postgres"
    -- Encrypted credentials or reference to Vault path
    credentials_encrypted TEXT NOT NULL, 
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Flow Design
CREATE TABLE flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
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
CREATE TABLE action_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_id UUID REFERENCES flows(id),
    org_id UUID REFERENCES organizations(id),
    status TEXT NOT NULL, -- 'RUNNING', 'COMPLETED', 'FAILED', 'PAUSED'
    temporal_workflow_id TEXT, -- Link to Temporal
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    -- Snapshot of global variables at end of run
    final_state JSONB 
);

-- 5. Unified Actions (Human, Auto, AI)
CREATE TABLE actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_flow_id UUID REFERENCES action_flows(id),
    org_id UUID REFERENCES organizations(id),
    
    -- Definition Links
    node_id TEXT NOT NULL, -- "step_1" from JSON definition
    type TEXT NOT NULL, -- 'HUMAN', 'AUTOMATION'
    
    -- Execution State
    status TEXT NOT NULL, -- 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED'
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    
    -- Human Specifics (Indexed for Inbox)
    assignee_id UUID REFERENCES users(id), -- Nullable (if Auto/AI)
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
CREATE TABLE rag_knowledge_bases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id), -- NULL = System Global
    name TEXT NOT NULL,
    vector_collection_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id UUID REFERENCES actions(id), -- Linked to a specific task
    user_id UUID REFERENCES users(id),
    history JSONB DEFAULT '[]', -- Message history
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Audit Logs (Industry Standard)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    event_type TEXT NOT NULL, -- 'FLOW_CREATED', 'ACTION_COMPLETED'
    resource_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.3. JSON Structures (Node Definitions)

#### Human Action (Form)
Stored in `flows.definition.nodes[].data`:
```json
{
  "type": "HUMAN",
  "title": "Approve Expense",
  "config": {
    "assignee_mode": "static", // or "dynamic" from variable
    "assignee_id": "user_123",
    "form_schema": [
      {
        "id": "reason",
        "type": "textarea",
        "label": "Reason for Approval",
        "required": true
      },
      {
        "id": "receipt",
        "type": "file_upload",
        "label": "Upload Receipt"
      }
    ]
  }
}
```

#### Automation Action (HTTP)
```json
{
  "type": "AUTOMATION",
  "subtype": "HTTP_REQUEST",
  "config": {
    "method": "POST",
    "url": "https://api.stripe.com/v1/charges",
    "headers": {
      "Authorization": "Bearer {{ secrets.stripe_key }}"
    },
    "body": {
      "amount": "{{ steps.trigger.amount }}",
      "currency": "usd"
    }
  }
}
```



---

## 6. Technical Specifications (Go)

### 6.1. Core Interfaces

All nodes in Nodal implement the `NodeExecutor` interface. This ensures the Temporal workflow can execute them uniformly.

```go
package nodes

import (
	"context"
)

// NodeContext contains all the data available to the node during execution.
type NodeContext struct {
	WorkflowID string
	StepID     string
	// InputData is the resolved data from previous steps or variables.
	InputData  map[string]interface{}
	// Config is the static configuration from the Flow definition.
	Config     map[string]interface{}
}

// NodeResult is the output of a node execution.
type NodeResult struct {
	Status string                 // "SUCCESS", "FAILED", "PAUSED"
	Output map[string]interface{} // The data produced by this node
	Error  error
}

// NodeExecutor is the interface that all node types must implement.
type NodeExecutor interface {
	Execute(ctx context.Context, input NodeContext) (*NodeResult, error)
}
```

### 6.2. Visual Transformation Nodes

#### Select Node (Mapper)
Maps fields from source to target.

```go
type SelectNodeConfig struct {
	// Mappings is a list of "Target Field" -> "Source Expression"
	Mappings []struct {
		TargetField string `json:"target_field"`
		// Expression is a simple string like "{{ steps.trigger.id }}"
		Expression  string `json:"expression"`
	} `json:"mappings"`
}

type SelectNode struct{}

func (n *SelectNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// 1. Parse Config
	// 2. For each mapping:
	//    a. Evaluate Expression using the Expression Engine
	//    b. Set result[TargetField] = evaluated_value
	// 3. Return result
}
```

#### Filter Node
Filters a list or checks a condition.

```go
type FilterNodeConfig struct {
	// Conditions is a list of criteria (AND logic by default)
	Conditions []struct {
		LeftOperand  string `json:"left_operand"`  // e.g., "{{ item.price }}"
		Operator     string `json:"operator"`      // e.g., ">", "==", "contains"
		RightOperand string `json:"right_operand"` // e.g., "100"
	} `json:"conditions"`
}

type FilterNode struct{}

func (n *FilterNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// 1. Parse Config
	// 2. Evaluate LeftOperand and RightOperand
	// 3. Compare using Operator
	// 4. Return boolean result (or filtered list if input was a list)
}
```

#### HTTP Request Node (Action)
Standard API caller.

```go
type HTTPNodeConfig struct {
	Method  string            `json:"method"` // GET, POST, etc.
	URL     string            `json:"url"`
	Headers map[string]string `json:"headers"`
	Body    interface{}       `json:"body"`
}
```

### 6.3. Expression Engine Interface
This is the helper that evaluates `{{ variable }}` strings.

```go
type ExpressionEngine interface {
	// Evaluate resolves a string expression against the given context data.
	Evaluate(expression string, data map[string]interface{}) (interface{}, error)
}
```

---

## 7. Next Steps (Execution Phase)
1.  **Initialize Repository**: Git, Go Module, Next.js.
2.  **Setup Infrastructure**: Docker Compose (Postgres + Temporal).
### 7.1. Go Backend API
-   **Base URL**: `http://localhost:8080` (Local)
-   **Endpoints**:
    -   `POST /flows`: Create a new flow.
    -   `PUT /flows/{id}`: Update an existing flow definition.
    -   `GET /flows/{id}`: Get flow details.
    -   `GET /flows`: List flows for an organization.

