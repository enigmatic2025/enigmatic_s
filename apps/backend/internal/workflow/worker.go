package workflow

import (
	"log"
	"os"

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

	c, err := client.Dial(client.Options{
		HostPort: hostPort,
	})
	if err != nil {
		log.Fatalln("Unable to create client", err)
	}
	defer c.Close()

	w := worker.New(c, "nodal-task-queue", worker.Options{})

	w.RegisterWorkflow(NodalWorkflow)
	w.RegisterActivity(NodeExecutionActivity)

	err = w.Run(worker.InterruptCh())
	if err != nil {
		log.Fatalln("Unable to start worker", err)
	}
}
