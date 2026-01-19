# Nodal Business & Product Plan

## 1. Vision
**Nodal** bridges the gap between:
1.  **Visual Diagramming** (e.g., LucidChart) - Ease of use.
2.  **Automation** (e.g., n8n/Zapier) - Connectivity.
3.  **Process Management** (e.g., BPM tools) - Human tasks & state.

**Goal**: Empower operations teams to build, automate, and participate in complex business processes without coding.

## 2. Core Terminology
- **Flow**: The blueprint/design.
- **Action Flow**: A running instance (a "Case").
- **Action**: A single step (can be Human or System).
- **Signal**: An event that triggers a flow.

## 3. Product Structure: "Two Studios"
### 3.1. Process Studio (The "How")
*   **Focus**: Long-running lifecycles (Employee Onboarding, User Verification).
*   **Key Nodes**: Human Forms, Approvals, Delays.
*   **User**: Business Operations, HR.

### 3.2. Signal Studio (The "When")
*   **Focus**: Event detection and dispatching.
*   **Key Nodes**: Webhooks, Cron Schedules, iterators.
*   **User**: IT / Data Engineers.

## 4. User Experience Strategy
- **Visual First**: If you can draw it, it should run.
- **Hybrid**: Mix Humans and Robots in the same flow.
- **Traceability**: "X-Ray" vision into every step's execution (Input/Output).

## 5. Feature Hierarchy
1.  **Designer** (Canvas, Sidebar, Config).
2.  **Execution Engine** (Temporal + Go).
3.  **Action Center** (Tasks for humans - Future).
4.  **Admin Console** (Users, billing, settings).

## 6. Deprecation Policy
- Old "Schedule" triggers are replaced by unified "Triggers" section.
- "Solid Block" visual design is deprecated in favor of "Subtle/Tinted" design.
