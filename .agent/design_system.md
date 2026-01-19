# Nodal Design System

## 1. Core Visual Philosophy
- **Subtle Over Solid**: Use `bg-color/10` and `text-color` for backgrounds instead of solid blocks. Solid colors are reserved for primary interactions (buttons) or specific emphasis.
- **Visual Consistency**: All visual elements (Nodes, Sidebar Items, Icons) must share the same color coding and iconography.
- **Clean & Modern**: Minimal padding, rounded corners (`rounded-xl`), and smooth transitions.

## 2. Color Coding System

| Category | Role | Color | Tailwind Class | Icon |
| :--- | :--- | :--- | :--- | :--- |
| **Triggers** | Events that start flows | **Emerald Green** | `emerald-500` | `Zap` |
| **Actions** | External side effects | **Orange** | `orange-500` | `Globe` (HTTP), `Mail` |
| **Data Ops** | Transformations | **Indigo** | `indigo-500` | `Table` (Map), `ListFilter` (Filter) |
| **Logic** | Control Flow | **Slate/Gray** | `slate-500` | `Split` (Switch), `Repeat` (Loop) |
| **Variables** | Mutable State | **Teal/Cyan** | `cyan-500` | `Braces` |

## 3. Component Standards

### 3.1. Flow Nodes
 Nodes in the Designer must follow the "Subtle" aesthetic:

- **Border**: `border-2`. Default `border-border/50`. Selected: `border-{color}-500`.
- **Header Background**: Gradient `from-{color}-500/10 to-transparent`.
- **Icon Container**:
    - **Background**: `bg-{color}-500/10` (NOT solid `bg-{color}-500`).
    - **Icon Color**: `text-{color}-500` (NOT `text-white`).
- **Typography**:
    - Title: `text-sm font-semibold`.
    - Subtitle: `text-[10px] uppercase tracking-wider font-medium text-muted-foreground`.

### 3.2. Sidebar Config
- **Width**: `400px` expanded, `64px` collapsed.
- **Visuals**: Matches the Node's color theme.
- **Layout**: "Floating Inspector" style (Shadow XS, Rounded, Non-blocking).

## 4. UI Patterns

### 4.1. Variable Reference
- **Syntax**: `{{ variable_name }}`
- **Context Awareness**: The UI should suggest variables available from *previous steps only*.
- **Visuals**: Code blocks or inputs highlighting variables in a distinct color.

### 4.2. Empty States
- Use `text-muted-foreground`.
- Provide a clear "Call to Action" (e.g., "Configure Schema").

## 5. Future Implementation Rules
- Always check this Design System before creating new Nodes.
- If a new Category is needed, define its Color and Icon here first.
