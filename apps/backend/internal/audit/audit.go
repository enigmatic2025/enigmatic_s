package audit

import (
	"context"
	"time"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
)

type AuditLog struct {
	ID         string                 `json:"id,omitempty"`
	OrgID      string                 `json:"org_id"`
	UserID     *string                `json:"user_id,omitempty"`
	EventType  string                 `json:"event_type"`
	ResourceID *string                `json:"resource_id,omitempty"`
	Details    map[string]interface{} `json:"details"`
	IPAddress  string                 `json:"ip_address,omitempty"`
	CreatedAt  time.Time              `json:"created_at"`
}

// LogActivity inserts a new record into the audit_logs table.
// userID and resourceID are optional (pass nil if not applicable).
func LogActivity(ctx context.Context, orgID string, userID *string, eventType string, resourceID *string, details map[string]interface{}, ipAddress string) error {
	client := database.GetClient()

	logEntry := AuditLog{
		OrgID:      orgID,
		UserID:     userID,
		EventType:  eventType,
		ResourceID: resourceID,
		Details:    details,
		IPAddress:  ipAddress,
		CreatedAt:  time.Now(),
	}

	var result []interface{}
	err := client.DB.From("audit_logs").Insert(logEntry).Execute(&result)
	return err
}
