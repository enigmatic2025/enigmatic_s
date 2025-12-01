# Flow Studio Implementation Plan

## Goal Description
Implement the Flow Studio designer using React Flow, allowing users to visually design workflows. This includes setting up the canvas, adding a "Schedule" trigger node, and defining the necessary database schema in Supabase.

## User Review Required
> [!IMPORTANT]
> This plan involves creating new database tables. Please review the SQL script before running it against your production database.

## Proposed Changes

### Frontend (Flow Studio)
#### [MODIFY] [sidebar.tsx](file:///d:/Repository/enigmatic_s/apps/web/components/dashboard/sidebar.tsx)
-   Add conditional rendering for "Designer Mode" when path includes `/flow-studio/design`.
-   Hide standard navigation links in this mode.
-   Render "Triggers" and "Actions" groups with draggable items.
-   Use HTML5 `draggable` attribute and `onDragStart` to pass node type data.

#### [MODIFY] [flow-designer.tsx](file:///d:/Repository/enigmatic_s/apps/web/components/flow-studio/flow-designer.tsx)
-   Add `onDrop` and `onDragOver` handlers to the React Flow wrapper.
-   Implement logic to calculate drop position and create new nodes.
-   Remove the temporary "Add Node" panel.

#### [NEW] [schedule-node.tsx](file:///d:/Repository/enigmatic_s/apps/web/components/flow-studio/nodes/schedule-node.tsx)
-   (Already created) Ensure it works with the new DnD system.

#### [NEW] [action-node.tsx](file:///d:/Repository/enigmatic_s/apps/web/components/flow-studio/nodes/action-node.tsx)
-   Create a generic "Action" node component for things like HTTP Request, Email, etc.

#### [NEW] [types/flow.ts](file:///d:/Repository/enigmatic_s/apps/web/types/flow.ts)
-   (Completed) Define TypeScript interfaces for Flow, NodeData, and NodeConfig.

#### [NEW] [apps/backend/internal/handlers/flow.go](file:///d:/Repository/enigmatic_s/apps/backend/internal/handlers/flow.go)
-   Create `FlowHandler` struct.
-   Implement `CreateFlow` and `UpdateFlow` methods.
-   Use `database.GetClient()` to interact with Supabase `flows` table.

#### [MODIFY] [apps/backend/internal/server/server.go](file:///d:/Repository/enigmatic_s/apps/backend/internal/server/server.go)
-   Register `/flows` routes with `FlowHandler`.

#### [MODIFY] [flow-designer.tsx](file:///d:/Repository/enigmatic_s/apps/web/components/flow-studio/flow-designer.tsx)
-   Update to use `Node<NodeData>` from the new types.
-   Implement `onSave` to call the Go backend API (`http://localhost:8080/flows`).

### Database
#### [NEW] [supabase_schema.sql](file:///d:/Repository/enigmatic_s/.agent/supabase_schema.sql)
-   (Completed)

## Verification Plan

### Automated Tests
- None for this phase (visual and schema focus).

### Manual Verification
1.  **Flow Designer**:
    -   Navigate to `/nodal/[slug]/dashboard/flow-studio/design`.
    -   Verify the React Flow canvas is visible.
    -   Verify the "Schedule" node is present on the canvas (or can be added).
    -   Test basic interaction (moving the node).
2.  **Database**:
    -   Review the generated SQL script.
    -   (User action) Run the script in the Supabase SQL editor.
