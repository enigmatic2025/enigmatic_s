# Action Flows Mock Data Guidelines

This document outlines the structure and logic for creating mock data for Action Flows in the Enigmatic S application. Future agents should refer to this when generating or modifying flow data.

## 1. Data Structure

### Flow Object (High Level)
Located in `apps/web/components/dashboard/action-flows/data.ts`.
- **id**: Unique identifier (e.g., `AF-2024-001`).
- **name**: Display name (e.g., "Reefer Alert", "Drivers at Risk").
- **description**: Brief summary.
- **status**: "In Progress", "Complete", "Cancelled".
- **priority**: "Low", "Medium", "High", "Critical".
- **assignees**: Array of user objects `{ name, initials, image }`.
- **startedAt**: ISO timestamp.
- **currentAction**: Label of the current active step.
- **progress**: Integer (0-100).

### Timeline Step Object (Detail View)
Located in `apps/web/components/flow-detail/flow-detail-view.tsx` (inside `setSteps`).
- **id**: Unique string.
- **type**: 
  - `human`: Requires user interaction.
  - `action`: System action (often automated).
  - `ai`: AI-driven task.
  - `alarm`: Specific to hardware/IoT alerts.
- **label**: Title of the step.
- **description**: Subtitle/details.
- **status**: "completed", "running", "pending".
- **timestamp**: Time string (e.g., "10:00 AM" or "Dec 10, 10:00 AM").
- **duration**: String (e.g., "5m", "Active", "-").
- **comments**: Array of comment objects.
- **assignee**: (Optional) Object `{ name, initials }`. If present, restricts access.
- **isAutomated**: (Optional) Boolean. If `true`, marks the step as fully automated.

### Data Visuals (Header Stats)
Located in `apps/web/components/flow-detail/flow-detail-view.tsx` (inside `setDataVisual`).
Array of objects:
- **label**: Label text.
- **value**: Value text.
- **status**: "neutral", "positive", "warning", "normal".

## 2. Business Logic & UI Rules

### Execution Panel Logic
The right-hand panel in the Flow Detail View behaves as follows:

1.  **No Execution Required**:
    -   **Condition**: If `step.isAutomated === true` OR `step.type === 'alarm'`.
    -   **UI**: Displays a "Zap" icon with the message: "No execution is required for this Action."
    -   **Note**: This takes precedence over assignment logic for the execution panel view (though comments are still accessible).

2.  **Access Restricted**:
    -   **Condition**: If `step.assignee` exists AND `step.assignee.name` !== Current User (currently "Sam Tran").
    -   **UI**: Displays "Access Restricted" and the assignee's initials.

3.  **Action Execution**:
    -   **Condition**: Default case (Human steps assigned to current user or unassigned).
    -   **UI**: Renders `ActionExecutionPanel`.

### Specific Use Cases

#### A. Reefer Alert (IoT/Hardware)
-   **Context**: Temperature control units on trailers.
-   **Steps**: Usually `alarm` type steps (e.g., "Alarm 10 (High Pressure)").
-   **Data Visuals**: Trailer Temp, Set Point, Fuel Level, Return Air, Loaded (Yes/No).
-   **Logic**: Alarms are assigned to "Sam Tran" (or Road Assist) but show "No execution required" in the panel.

#### B. Drivers at Risk (HR/Retention)
-   **Context**: AI-driven retention workflow.
-   **Steps**: 
    1. Identify (Human/System)
    2. Fetch Tenstreet Data (Automated)
    3. Outreach Call (Human)
    4. Log Call Sentiment (AI - Pending)
    5. Manager Review (Human)
    6. Follow-up (Human)
    7. Final Outcome Log (AI)
-   **Data Visuals**: Driver Name, Tenure, Risk Score (Warning if high), Last Trip, Home Time.

#### C. Vendor Contract Renewal (Legal/Procurement)
-   **Context**: Managing expiring contracts.
-   **Steps**: Expiry Alert (Auto) -> Performance Review -> Legal Review -> Sign Contract -> Archive (Auto).
-   **Data Visuals**: Vendor, Contract Value, Expiry Date, Status, Renewal Type.

#### D. Customer Refund (Support/Finance)
-   **Context**: Processing returns.
-   **Steps**: Request Received -> Fraud Check (Auto) -> Finance Approval -> Process Payment (Auto) -> Notify Customer (Auto).
-   **Data Visuals**: Order ID, Amount, Reason, Customer, Method.

## 3. Implementation Notes
-   When adding new flows, ensure you update **BOTH** the high-level list in `data.ts` and the detailed conditional logic in `flow-detail-view.tsx`.
-   Use `useEffect` in `flow-detail-view.tsx` to listen for `flowId` changes and inject the correct mock data.
