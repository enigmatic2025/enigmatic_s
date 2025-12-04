# Flow Studio Progress

## Completed Features
- [x] **Canvas**: React Flow integration with custom node types.
- [x] **Node Registry**: Centralized registry for node types and configurations.
- [x] **Node Configuration**: Modal-based configuration with dynamic forms.
- [x] **Testing**: "Test Action" tab in configuration modal.
- [x] **Backend Execution**: Go backend with Temporal workflow engine (stub).
- [x] **API Proxy**: Next.js API Proxy to handle backend communication securely.
- [x] **Data Transformation**:
    - [x] **Parse Node**: JSON parsing with Schema Generation.
    - [x] **Map Node**: Data transformation/mapping.
    - [x] **Smart Features**: "Generate Schema from Sample" for Parse Node.

## In Progress / Next Steps
- [ ] **Variable Picker**: UI to easily select variables from previous steps (using generated schemas).
- [ ] **Expression Engine**: Backend support for complex expressions (e.g. `{{ steps.foo.bar }}`).
- [ ] **Workflow Engine**: Full implementation of the Temporal workflow execution logic.
- [ ] **Save/Load**: Persisting flow definitions to the database.

## Technical Notes
- **Frontend**: Next.js 15 (App Router), React Flow, Shadcn UI, Tailwind CSS.
- **Backend**: Go, Temporal, PostgreSQL.
- **Communication**: Frontend -> Next.js Proxy -> Go Backend (Port 8001).
