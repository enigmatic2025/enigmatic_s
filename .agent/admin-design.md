# Nodal Admin Interface Design

## Overview

The `/nodal/admin` page serves as the control center for Super Admins to manage the system's core entities: Organizations and Users. This interface must adhere strictly to the Enigmatic Design System, focusing on minimalism, high usability, and a "glass" aesthetic where appropriate.

## Layout & Structure

### Container
- **Width**: `max-w-7xl` (Wide container)
- **Padding**: `px-4 md:px-6 py-12` (Compact section padding)
- **Background**: `bg-background`

### Header
- **Title**: "System Administration" (Section Headline: `text-2xl md:text-4xl font-normal`)
- **Subtitle**: "Manage organizations, users, and system settings." (Muted Text: `text-muted-foreground`)

### Navigation (Tabs)
- Two main tabs: **Organizations** and **Users**.
- **Style**: Minimalist pills or underlined tabs.
    - Active: `text-foreground border-b-2 border-primary`
    - Inactive: `text-muted-foreground hover:text-foreground`

## Components

### 1. Organizations Panel

#### List View (Table)
- **Columns**: Name, Slug, Plan, Created At, Actions.
- **Style**:
    - Header: `text-muted-foreground text-sm font-normal`
    - Row: `border-b border-border hover:bg-muted/50 transition-colors`
    - Actions: Edit (Pencil Icon), Delete (Trash Icon).

#### Actions
- **Create Organization**: Button (`variant="default"`) top-right of the panel.
    - Opens a Modal/Dialog.
    - **Fields**: Name (Input), Slug (Input, auto-generated from Name), Plan (Select: Free, Pro, Enterprise).

### 2. Users Panel

#### List View (Table)
- **Columns**: Full Name, Email, Organization, Role, Status (Active/Blocked), Actions.
- **Style**: Same as Organizations table.

#### Actions
- **Create User**: Button (`variant="default"`) top-right.
    - Opens a Modal/Dialog.
    - **Fields**: Email, Full Name, Password, Organization (Select), Role (Select).
- **User Actions (Dropdown/Row Actions)**:
    - **Edit Details**: Change Name, Email.
    - **Change Organization**: Reassign user to a different org.
    - **Reset Password**: Prompt for new password.
    - **Reset MFA**: Trigger MFA reset.
    - **Block/Unblock**: Toggle user access.
    - **Delete**: Remove user (with confirmation).

## UI Elements

### Modals / Dialogs
- **Overlay**: `bg-black/40` backdrop blur.
- **Content**: `bg-card border border-border rounded-2xl p-6 shadow-2xl`.
- **Typography**:
    - Title: `text-xl font-normal`
    - Labels: `text-sm text-muted-foreground`

### Forms
- **Inputs**: `bg-background border border-input rounded-md px-3 py-2 focus:ring-1 focus:ring-ring`.
- **Buttons**:
    - Primary: `bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2`.
    - Ghost/Cancel: `hover:bg-accent hover:text-accent-foreground rounded-md px-4 py-2`.

## Implementation Notes

- **Data Fetching**: Use client-side fetching (React `useEffect` or SWR/TanStack Query) connecting to the Go backend endpoints.
- **Authentication**: Ensure requests include necessary auth headers (cookies/tokens) as required by the backend `middleware.Auth`.
- **Error Handling**: Display clear error messages (Toasts or inline alerts) if API calls fail (e.g., "Requires Supabase Admin API integration").

## Design System Compliance
- **Fonts**: Use `font-light` for large headings, `font-normal` for body.
- **Colors**: Use `text-foreground`, `text-muted-foreground`, `bg-background`, `border-border`.
- **Shadows**: No shadows on buttons.
