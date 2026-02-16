import { DocSection, SidebarGroup } from "./types";

export const enSidebar: SidebarGroup[] = [
    {
        title: "Getting Started",
        items: [
            { id: "overview", label: "Overview" },
            { id: "concepts", label: "Core Concepts" },
        ],
    },
    {
        title: "Triggers",
        items: [
            { id: "trigger-api", label: "API Trigger" },
        ],
    },
    {
        title: "Human Interaction",
        items: [
            { id: "human-task", label: "Human Task" },
        ],
    },
    {
        title: "External Systems",
        items: [
            { id: "wait-for-event", label: "Wait for Event" },
            { id: "http-request", label: "HTTP Request" },
            { id: "correlation", label: "Correlation Signals" },
        ],
    },
    {
        title: "Data Operations",
        items: [
            { id: "set-variable", label: "Set Variable" },
            { id: "condition", label: "Condition (If/Else)" },
            { id: "switch", label: "Switch" },
            { id: "loop", label: "Loop" },
            { id: "filter", label: "Filter" },
            { id: "map", label: "Map (Transform)" },
        ],
    },
    {
        title: "Expressions",
        items: [
            { id: "expressions", label: "Expression Syntax" },
        ],
    },
];

export const enDocs: DocSection[] = [
    {
        id: "overview",
        title: "Overview",
        iconName: "BookOpen",
        description: "Nodal is an operational orchestration platform. It connects your people, systems, and processes into automated flows that run your business.",
        blocks: [
            {
                type: "h3",
                content: "What is Flow Studio?"
            },
            {
                type: "prose",
                content: "Flow Studio is the visual designer where you build business process flows. Each flow is a sequence of steps — triggers that start the process, tasks assigned to people, data transformations, API calls to external systems, and decision logic that routes work based on conditions."
            },
            {
                type: "h3",
                content: "What are Action Flows?"
            },
            {
                type: "prose",
                content: "Action Flows are <strong>running instances</strong> of a flow. When a flow is triggered — by an API call, a schedule, or a manual start — it creates an Action Flow that tracks the execution through each step. Team members see their assigned tasks in the Action Flows dashboard and complete them to advance the process."
            },
            {
                type: "h3",
                content: "How a flow runs"
            },
            {
                type: "stepList",
                steps: [
                    {
                        title: "Trigger fires",
                        desc: "A flow starts when its trigger activates — an API call, a schedule, or a manual start.",
                    },
                    {
                        title: "Steps execute in sequence",
                        desc: "Each node runs in order. Data flows from one step to the next. Conditions and switches route the path.",
                    },
                    {
                        title: "Pauses when needed",
                        desc: "Human Tasks wait for a person to respond. Wait for Event nodes wait for an external webhook. The flow resumes automatically when the input arrives.",
                    },
                    {
                        title: "Completes or fails",
                        desc: "The flow reaches the end and completes, or an error occurs and it fails. All execution data is logged.",
                    },
                ]
            },
            {
                type: "navLinks",
                links: [
                    { label: "Learn about triggers", url: "trigger-api" },
                    { label: "Human Tasks", url: "human-task" },
                    { label: "Expression syntax", url: "expressions" },
                ]
            }
        ]
    },
    {
        id: "concepts",
        title: "Core Concepts",
        iconName: "Layers",
        description: "Key ideas to understand before building flows.",
        blocks: [
            {
                type: "conceptGrid",
                concepts: [
                    { iconName: "Play", color: "text-blue-500", title: "Nodes", desc: "The building blocks of a flow. Each node performs one action — triggering, transforming data, calling an API, assigning a task, or making a decision." },
                    { iconName: "ArrowRight", color: "text-gray-500", title: "Edges", desc: "Connections between nodes that define the execution order. Data flows along edges from one node to the next." },
                    { iconName: "Variable", color: "text-purple-500", title: "Expressions", desc: "Dynamic references to data from previous steps. Written as {{ steps.NodeId.output.field }} to pass data between nodes." },
                    { iconName: "Layers", color: "text-orange-500", title: "Action Flows", desc: "A running instance of a flow. Each trigger creates a new Action Flow that progresses through the steps until completion." },
                    { iconName: "User", color: "text-green-500", title: "Human-in-the-Loop", desc: "Flows can pause and wait for human input. Human Task nodes assign work to team members who complete it through the Action Flows dashboard." },
                    { iconName: "Webhook", color: "text-red-500", title: "Webhooks", desc: "External systems can resume paused flows by sending data to a unique webhook URL. No API keys or IDs required." },
                ]
            },
            {
                type: "navLinks",
                links: [
                    { label: "Expression syntax", url: "expressions" }
                ]
            }
        ]
    },
    {
        id: "trigger-api",
        title: "API Trigger",
        iconName: "Globe",
        description: "Start a flow via HTTP POST. Use this to integrate external systems, build automation pipelines, or create event-driven workflows.",
        blocks: [
            {
                type: "h3",
                content: "Endpoint"
            },
            {
                type: "code",
                id: "api-trigger-endpoint",
                label: "HTTP",
                code: `POST https://enigmatic.works/api/flows/{flowId}/execute\nAuthorization: Bearer <your-jwt-token>\nContent-Type: application/json`
            },
            {
                type: "prose",
                content: "The <code class='text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground'>flowId</code> is the unique identifier of the published flow. You can find it in the Flow Studio URL or the flow settings."
            },
            {
                type: "h3",
                content: "Request body"
            },
            {
                type: "prose",
                content: "Send any JSON payload. The fields you send become available to all downstream steps via expressions."
            },
            {
                type: "code",
                id: "api-trigger-body",
                label: "JSON",
                code: `{\n  "order_id": "ORD-12345",\n  "customer_name": "Acme Corp",\n  "total": 2499.00,\n  "priority": "high"\n}`
            },
            {
                type: "h3",
                content: "Configuration options"
            },
            {
                type: "paramTable",
                rows: [
                    { name: "schema", type: "SchemaField[]", desc: "Define expected payload fields with types and required flags." },
                    { name: "instanceNameTemplate", type: "string", desc: "Dynamic title for the Action Flow instance. Supports expressions." },
                    { name: "defaultPriority", type: "enum", desc: "Priority level: low, medium, high, or critical." },
                    { name: "instanceDescriptionTemplate", type: "string", desc: "Instructions displayed to users in the Action Flow dashboard." },
                ]
            },
            {
                type: "h3",
                content: "Accessing trigger data"
            },
            {
                type: "code",
                id: "api-trigger-access",
                code: `{{ steps.trigger.data.order_id }}     // "ORD-12345"\n{{ steps.trigger.data.customer_name }} // "Acme Corp"\n{{ steps.trigger.data.total }}         // 2499.00`
            },
            {
                type: "h3",
                content: "Example: cURL"
            },
            {
                type: "code",
                id: "api-trigger-curl",
                label: "Bash",
                code: `curl -X POST https://enigmatic.works/api/flows/YOUR_FLOW_ID/execute \\\n  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "order_id": "ORD-12345",\n    "customer_name": "Acme Corp"\n  }'`
            },
            {
                type: "callout",
                content: "The API Trigger requires authentication. The JWT token comes from Supabase Auth. For unauthenticated external webhooks, use the <a href='#' data-nav='wait-for-event' class='underline underline-offset-2 hover:text-primary'>Wait for Event</a> node instead."
            }
        ]
    },
    {
        id: "human-task",
        title: "Human Task",
        iconName: "User",
        description: "Pause the flow and assign work to a person. The flow resumes when the assignee completes the task through the Action Flows dashboard.",
        blocks: [
            {
                type: "h3",
                content: "How it works"
            },
            {
                type: "stepList",
                steps: [
                    { title: "Flow reaches the Human Task node", desc: "The flow pauses and creates a task record. The task appears in the assignee's Action Flows dashboard." },
                    { title: "Assignee reviews and responds", desc: "The assignee sees the task title, instructions, and a form to fill out. They can review context from previous steps." },
                    { title: "Flow resumes with the response", desc: "When the assignee submits their response, the flow continues. The form data is available to downstream steps." },
                ]
            },
            {
                type: "h3",
                content: "Configuration"
            },
            {
                type: "paramTable",
                rows: [
                    { name: "title", type: "string", desc: "Task title shown to the assignee. Supports expressions for dynamic titles." },
                    { name: "instructions", type: "rich text", desc: "Detailed instructions in HTML. Explain what the assignee needs to do." },
                    { name: "assignments", type: "User[]", desc: "One or more team members who will see and can complete the task." },
                    { name: "schema", type: "FormField[]", desc: "Form fields the assignee must fill out (text, number, date, rating, signature, etc.)." },
                ]
            },
            {
                type: "h3",
                content: "Form field types"
            },
            {
                type: "prose",
                content: "The following field types are supported: Text, Long Text, Number, Rating, Boolean, Date, Time, DateTime, File, Multiple Choice, Checkboxes, Signature."
            },
            {
                type: "h3",
                content: "Dynamic titles with expressions"
            },
            {
                type: "prose",
                content: "Use expressions to create context-aware task titles:"
            },
            {
                type: "code",
                id: "ht-title",
                code: `Review order {{ steps.trigger.data.order_id }} for {{ steps.trigger.data.customer_name }}`
            },
            {
                type: "prose",
                content: "This produces titles like <strong>&ldquo;Review order ORD-12345 for Acme Corp&rdquo;</strong>."
            },
            {
                type: "h3",
                content: "Accessing task responses"
            },
            {
                type: "code",
                id: "ht-output",
                code: `// The assignee's form responses are available as:\n{{ steps.ReviewTask.output.approval }}    // "approved"\n{{ steps.ReviewTask.output.comments }}    // "Looks good"\n{{ steps.ReviewTask.output.rating }}      // 5`
            },
            {
                type: "callout",
                content: "Human Tasks are the core of human-in-the-loop automation. Use them for approvals, quality checks, data entry, document review, or any step that requires human judgment."
            }
        ]
    },
    {
        id: "wait-for-event",
        title: "Wait for Event",
        iconName: "Webhook",
        description: "Pause the flow and wait for an external system to send data via a unique webhook URL. No authentication, IDs, or complex payloads required.",
        blocks: [
            {
                type: "h3",
                content: "How it works"
            },
            {
                type: "stepList",
                steps: [
                    { title: "Flow reaches the Wait for Event node", desc: "The flow pauses and generates a unique, single-use webhook URL." },
                    { title: "Webhook URL is sent to the external system", desc: "Use an upstream HTTP Request or Email node to pass the webhook URL to the external system." },
                    { title: "External system POSTs data", desc: "The external system sends a POST request with JSON data to the webhook URL." },
                    { title: "Flow resumes", desc: "The flow continues with the received data available to all downstream steps." },
                ]
            },
            {
                type: "h3",
                content: "Endpoint"
            },
            {
                type: "code",
                id: "wfe-endpoint",
                label: "HTTP",
                code: `POST https://enigmatic.works/api/webhooks/{token}`
            },
            {
                type: "prose",
                content: "The <code class='text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground'>{token}</code> is a unique UUID generated for each flow execution. No authentication headers are required — the token itself authenticates the request. Each URL is single-use."
            },
            {
                type: "h3",
                content: "Request format"
            },
            {
                type: "prose",
                content: "Send any JSON body. The entire payload becomes available to downstream steps."
            },
            {
                type: "code",
                id: "wfe-payload",
                label: "JSON",
                code: `{\n  "payment_status": "confirmed",\n  "amount": 149.99,\n  "transaction_id": "txn_abc123"\n}`
            },
            {
                type: "h3",
                content: "Response"
            },
            {
                type: "code",
                id: "wfe-response",
                label: "Response 200",
                code: `{\n  "status": "ok",\n  "message": "Workflow resumed successfully"\n}`
            },
            {
                type: "h3",
                content: "Example: cURL"
            },
            {
                type: "code",
                id: "wfe-curl",
                label: "Bash",
                code: `curl -X POST https://enigmatic.works/api/webhooks/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "payment_status": "confirmed",\n    "amount": 149.99\n  }'`
            },
            {
                type: "h3",
                content: "Accessing the webhook URL in your flow"
            },
            {
                type: "prose",
                content: "When the node pauses, it outputs the unique webhook URL. Reference it in upstream steps to pass it to the external system:"
            },
            {
                type: "code",
                id: "wfe-var",
                code: `{{ steps.WaitForPayment.output.webhook_url }}`
            },
            {
                type: "callout",
                content: "For advanced use cases where multiple flows listen for the same event type, see <a href='#' data-nav='correlation' class='underline underline-offset-2 hover:text-primary'>Correlation Signals</a>."
            }
        ]
    },
    {
        id: "http-request",
        title: "HTTP Request",
        iconName: "Send",
        description: "Make HTTP requests to external APIs. Call third-party services, fetch data, or send notifications as part of your flow.",
        blocks: [
            {
                type: "h3",
                content: "Configuration"
            },
            {
                type: "paramTable",
                rows: [
                    { name: "method", type: "enum", desc: "HTTP method: GET, POST, PUT, DELETE, or PATCH." },
                    { name: "url", type: "string", desc: "The endpoint URL. Supports expressions for dynamic URLs." },
                    { name: "headers", type: "KeyValue[]", desc: "Custom HTTP headers (e.g., Authorization, API keys)." },
                    { name: "params", type: "KeyValue[]", desc: "URL query parameters." },
                    { name: "body", type: "JSON", desc: "Request body for POST/PUT/PATCH. Supports expressions." },
                ]
            },
            {
                type: "h3",
                content: "Example: Call an external API"
            },
            {
                type: "code",
                id: "http-example",
                label: "Configuration",
                code: `Method:  POST\nURL:     https://api.example.com/orders/{{ steps.trigger.data.order_id }}\nHeaders: Authorization: Bearer {{ steps.GetToken.output.token }}\nBody:    {\n           "status": "confirmed",\n           "amount": {{ steps.trigger.data.total }}\n         }`
            },
            {
                type: "h3",
                content: "Output"
            },
            {
                type: "prose",
                content: "The response is parsed automatically and available to downstream steps:"
            },
            {
                type: "code",
                id: "http-output",
                code: `{{ steps.CallAPI.output.status }}       // 200\n{{ steps.CallAPI.output.data }}         // Parsed JSON response body\n{{ steps.CallAPI.output.data.result }}  // Nested field access`
            },
            {
                type: "callout",
                content: "HTTP Request nodes have a 10-second timeout. For long-running external operations, use Wait for Event with a callback pattern instead."
            }
        ]
    },
    {
        id: "correlation",
        title: "Correlation Signals",
        iconName: "Globe",
        description: "For advanced use cases where multiple flow instances listen for the same event type. Use correlation matching to target the correct instance.",
        blocks: [
            {
                type: "h3",
                content: "When to use"
            },
            {
                type: "stepList",
                steps: [
                    { title: "Multiple instances", desc: "Multiple flow instances waiting for the same event type (e.g., 'OrderPaid')" },
                    { title: "Broadcast", desc: "The external system broadcasts events without knowing which flow to target" },
                    { title: "Matching", desc: "You need to match on business keys (e.g., order_id, customer_id)" },
                ]
            },
            {
                type: "callout",
                content: "For most integrations, the <a href='#' data-nav='wait-for-event' class='underline underline-offset-2 hover:text-primary'>webhook URL approach</a> is simpler and recommended. Use correlation only when the external system cannot call a specific URL."
            },
            {
                type: "h3",
                content: "Endpoint"
            },
            {
                type: "code",
                id: "sig-endpoint",
                label: "HTTP",
                code: `POST https://enigmatic.works/api/automation/signal\nAuthorization: Bearer <your-jwt-token>\nContent-Type: application/json`
            },
            {
                type: "h3",
                content: "Request format"
            },
            {
                type: "code",
                id: "sig-payload",
                label: "JSON",
                code: `{\n  "event": "OrderPaid",\n  "data": {\n    "order_id": "ORD-12345",\n    "customer_id": "CUST-789"\n  }\n}`
            },
            {
                type: "paramTable",
                rows: [
                    { name: "event", type: "string", desc: "The event name configured in the Wait for Event node. Defaults to \"default\"." },
                    { name: "data", type: "object", desc: "Key-value pairs matched against the flow's correlation criteria. All criteria must match (AND logic)." },
                ]
            },
            {
                type: "h3",
                content: "Matching logic"
            },
            {
                type: "stepList",
                steps: [
                    { title: "Find active subscriptions", desc: "The system finds all active subscriptions matching the event name." },
                    { title: "Check criteria", desc: "For each subscription, every configured criteria key must exist in the signal data with the same value." },
                    { title: "Resume matches", desc: "All matching flows are resumed. One signal can resume multiple flow instances." },
                ]
            },
            {
                type: "h3",
                content: "Response"
            },
            {
                type: "code",
                id: "sig-response",
                label: "Response 200",
                code: `{\n  "status": "ok",\n  "resumed": 1\n}`
            }
        ]
    },
    {
        id: "set-variable",
        title: "Set Variable",
        iconName: "Variable",
        description: "Create or update variables within the flow. Store computed values, rename fields, or prepare data for downstream steps.",
        blocks: [
            {
                type: "h3",
                content: "Single variable"
            },
            {
                type: "prose",
                content: "Set one variable with a name and value. The value can be static or an expression."
            },
            {
                type: "code",
                id: "var-single",
                label: "Configuration",
                code: `Variable Name:  total_with_tax\nValue:          {{ steps.trigger.data.total * 1.13 }}`
            },
            {
                type: "h3",
                content: "Multiple variables"
            },
            {
                type: "prose",
                content: "Set several variables at once in a single node:"
            },
            {
                type: "code",
                id: "var-multi",
                label: "Configuration",
                code: `customer_name  →  {{ steps.trigger.data.name }}\norder_total    →  {{ steps.trigger.data.total }}\nstatus         →  "pending_review"`
            },
            {
                type: "h3",
                content: "Output"
            },
            {
                type: "prose",
                content: "Variables are available to all downstream steps:"
            },
            {
                type: "code",
                id: "var-output",
                code: `{{ steps.SetVars.output.total_with_tax }}  // 2823.87\n{{ steps.SetVars.output.customer_name }}   // "Acme Corp"`
            }
        ]
    },
    {
        id: "condition",
        title: "Condition (If/Else)",
        iconName: "GitBranch",
        description: "Branch the flow based on a logical condition. Route work down the True path or the False path.",
        blocks: [
            {
                type: "h3",
                content: "Configuration"
            },
            {
                type: "prose",
                content: "Define a condition with a left value, an operator, and a right value. All values support expressions."
            },
            {
                type: "code",
                id: "cond-example",
                label: "Example",
                code: `Left:      {{ steps.trigger.data.amount }}\nOperator:  >\nRight:     1000`
            },
            {
                type: "h3",
                content: "Operators"
            },
            {
                type: "paramTable",
                rows: [
                    { name: "==", type: "equals", desc: "Values are equal (strings or numbers)." },
                    { name: "!=", type: "not equals", desc: "Values are not equal." },
                    { name: ">", type: "greater than", desc: "Left is greater than right (numeric)." },
                    { name: "<", type: "less than", desc: "Left is less than right (numeric)." },
                    { name: ">=", type: "greater or equal", desc: "Left is greater than or equal to right." },
                    { name: "<=", type: "less or equal", desc: "Left is less than or equal to right." },
                    { name: "contains", type: "substring", desc: "Left string contains right string." },
                    { name: "matches", type: "regex", desc: "Left string matches the right regex pattern." },
                ]
            },
            {
                type: "h3",
                content: "Branching"
            },
            {
                type: "prose",
                content: "The Condition node has two output paths: <strong>True</strong> and <strong>False</strong>. Connect different nodes to each path to create branching logic. The result is also available as output:"
            },
            {
                type: "code",
                id: "cond-output",
                code: `{{ steps.CheckAmount.output.result }}  // true or false`
            }
        ]
    },
    {
        id: "switch",
        title: "Switch",
        iconName: "GitBranch",
        description: "Route the flow to different paths based on a variable's value. Like a multi-way if/else — cleaner when you have more than two branches.",
        blocks: [
            {
                type: "h3",
                content: "Configuration"
            },
            {
                type: "prose",
                content: "Set the variable to evaluate, then define case values for each branch:"
            },
            {
                type: "code",
                id: "switch-example",
                label: "Example",
                code: `Variable:  {{ steps.trigger.data.department }}\n\nCase "engineering"  →  Engineering Review path\nCase "finance"      →  Finance Approval path\nCase "legal"        →  Legal Review path\nDefault             →  General Processing path`
            },
            {
                type: "h3",
                content: "Behavior"
            },
            {
                type: "stepList",
                steps: [
                    { title: "Variable comparison", desc: "The variable is compared against each case value in order." },
                    { title: "First match", desc: "The first matching case path is followed." },
                    { title: "Default path", desc: "If no cases match, the Default path is followed." },
                    { title: "Output edge", desc: "Each case creates a separate output edge in the flow designer." },
                ]
            }
        ]
    },
    {
        id: "loop",
        title: "Loop",
        iconName: "Repeat",
        description: "Iterate over an array of items and run a set of steps for each one. Process lists of orders, users, records, or any collection.",
        blocks: [
            {
                type: "h3",
                content: "Configuration"
            },
            {
                type: "prose",
                content: "Point the loop at an array variable:"
            },
            {
                type: "code",
                id: "loop-config",
                label: "Configuration",
                code: `Items:  {{ steps.FetchOrders.output.data }}`
            },
            {
                type: "h3",
                content: "Inside the loop"
            },
            {
                type: "prose",
                content: "Access the current item using the <code class='text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground'>item</code> variable:"
            },
            {
                type: "code",
                id: "loop-item",
                code: `{{ steps.MyLoop.item }}           // The current item object\n{{ steps.MyLoop.item.order_id }}  // A field on the current item\n{{ steps.MyLoop.item.total }}     // Another field`
            },
            {
                type: "callout",
                content: "Nodes placed inside the loop body run once per item in the array. This is useful for sending individual notifications, processing records, or calling APIs for each item."
            }
        ]
    },
    {
        id: "filter",
        title: "Filter",
        iconName: "Layers",
        description: "Filter an array based on conditions, creating a new array with only matching items.",
        blocks: [
            {
                type: "prose",
                content: "Filters are essential for processing subsets of data, like selecting only active users or high-value orders."
            },
            {
                type: "code",
                id: "filter-example",
                label: "Example",
                code: `Items: {{ steps.GetUsers.output.data }}\nCondition: item.status == "active"`
            }
        ]
    },
    {
        id: "map",
        title: "Map (Transform)",
        iconName: "Variable",
        description: "Transform each item in an array to a new structure.",
        blocks: [
            {
                type: "prose",
                content: "Use Map to reshape data before sending it to an API or another system."
            },
            {
                type: "code",
                id: "map-example",
                label: "Example",
                code: `Items: {{ steps.GetUsers.output.data }}\nTransform: { "id": item.id, "fullName": item.first + " " + item.last }`
            }
        ]
    },
    {
        id: "expressions",
        title: "Expression Syntax",
        iconName: "Variable",
        description: "Learn how to write dynamic expressions to access data and perform calculations.",
        blocks: [
            {
                type: "h3",
                content: "Basics"
            },
            {
                type: "prose",
                content: "Expressions are wrapped in double curly braces <code class='text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground'>{{ }}</code>. They support JavaScript-like syntax for accessing object properties and array elements."
            },
            {
                type: "code",
                id: "expr-basic",
                code: `{{ steps.trigger.data.id }}\n{{ steps.MyStep.output.result }}\n{{ steps.MyStep.output.items[0] }}`
            }
        ]
    }
];
