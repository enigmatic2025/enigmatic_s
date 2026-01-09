---
description: Guide to new Map Node features and Smart Variable Context
---

# Map Node & Variable Explorer Guide

## Map Node

The Map Node has been enhanced to support **Hybrid Mode**:

1.  **Single Object Mode** (Default):
    *   Leave "Input Array" empty.
    *   Defines a single output object structure.
    *   Useful for reshaping data (e.g. `{ name: steps.trigger.body.user_name }`).

2.  **Loop Mode** (Iterate Array):
    *   Select an array in "Input Array (Optional)".
    *   The node automatically iterates over every item in that array.
    *   Inside the mapping configuration, use `{{ item }}` to reference the *current* item in the loop.

### Example
-   **Input Array**: `{{ steps.users.data }}`
-   **Mapping**: `{{ item.email }}`
-   **Output**: An array of emails.

---

## Smart Variable Explorer

The Sidebar Variable Explorer now features **Contextual Intelligence**:

1.  **Smart Loop Detection**:
    *   If you are configuring a Map Node (with Input Array set) or a Filter Node (with Variable to Filter set).
    *   The explorer detects if you are viewing that specific array.

2.  **Contextual Copy**:
    *   **Loop Context**: When dragging fields from the active array (e.g. `steps.users.data` while inside the Map node for it), the system automatically generates `{{ item.field }}` references.
        *   Visual Indicator: Highlighted in Purple with label `[Structure] (Loop Item)`.
    *   **Global Context**: When dragging from other arrays or outside a loop, it generates standard absolute paths: `{{ steps.users.data[0].field }}`.
        *   Visual Indicator: Standard text `[Structure] (First Item)`.

This ensures you never have to manually edit `[0]` to `item` again.
