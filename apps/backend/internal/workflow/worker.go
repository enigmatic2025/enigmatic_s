package workflow

import (
	"log"
	"os"
	"time"

	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
)

// StartWorker starts the Temporal worker
func StartWorker() {
	// The client and worker are heavyweight objects that should be created once per process.
	hostPort := os.Getenv("TEMPORAL_HOST_PORT")
	if hostPort == "" {
		hostPort = client.DefaultHostPort
	}

	var c client.Client
	var err error

	// Retry connection loop for ~60 seconds to allow Temporal container to start
	for i := 0; i < 30; i++ {
		c, err = client.Dial(client.Options{
			HostPort: hostPort,
		})
		if err == nil {
			break
		}
		log.Printf("Waiting for Temporal server... (%v)", err)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Printf("Failed to connect to Temporal after retries. Worker cannot start: %v", err)
		return
	}
	defer c.Close()

	w := worker.New(c, "nodal-task-queue", worker.Options{})

	w.RegisterWorkflow(NodalWorkflow)
	w.RegisterActivity(NodeExecutionActivity)
	w.RegisterActivity(RecordActionFlowActivity)

	err = w.Run(worker.InterruptCh())
	if err != nil {
		log.Fatalln("Unable to start worker", err)
	}
}
