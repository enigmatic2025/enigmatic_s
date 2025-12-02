package nodes

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type HttpNode struct{}

func (n *HttpNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// 1. Parse Config
	method, _ := input.Config["method"].(string)
	url, _ := input.Config["url"].(string)
	if method == "" {
		method = "GET"
	}
	if url == "" {
		return nil, fmt.Errorf("URL is required")
	}

	// 2. Prepare Body
	var bodyReader io.Reader
	if input.Config["body"] != nil {
		bodyStr, ok := input.Config["body"].(string)
		if ok {
			bodyReader = bytes.NewBufferString(bodyStr)
		} else {
			// Try to marshal if it's an object
			jsonBody, err := json.Marshal(input.Config["body"])
			if err == nil {
				bodyReader = bytes.NewBuffer(jsonBody)
			}
		}
	}

	// 3. Create Request
	req, err := http.NewRequestWithContext(ctx, method, url, bodyReader)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// 4. Add Headers
	if headers, ok := input.Config["headers"].(map[string]interface{}); ok {
		for k, v := range headers {
			if val, ok := v.(string); ok {
				req.Header.Set(k, val)
			}
		}
	}

	// 5. Execute Request
	client := &http.Client{
		Timeout: 10 * time.Second,
	}
	resp, err := client.Do(req)
	if err != nil {
		return &NodeResult{
			Status: "FAILED",
			Output: map[string]interface{}{
				"error": err.Error(),
			},
		}, nil
	}
	defer resp.Body.Close()

	// 6. Read Response
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return &NodeResult{
			Status: "FAILED",
			Output: map[string]interface{}{
				"error": fmt.Sprintf("failed to read body: %v", err),
			},
		}, nil
	}

	// 7. Parse Response (try JSON, fallback to string)
	var responseData interface{}
	if err := json.Unmarshal(respBody, &responseData); err != nil {
		responseData = string(respBody)
	}

	return &NodeResult{
		Status: "SUCCESS",
		Output: map[string]interface{}{
			"status":  resp.StatusCode,
			"headers": resp.Header,
			"data":    responseData,
		},
	}, nil
}
