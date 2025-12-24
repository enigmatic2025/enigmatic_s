import { TimelineStep } from "./timeline-item";

export const DEFAULT_STEPS: TimelineStep[] = [
    {
        id: "1",
        type: "schedule",
        label: "Review New Hire",
        description: "Listens for new entries in the HR system.",
        status: "completed",
        timestamp: "10:00 AM",
        duration: "0s",
        comments: [
            {
                id: "c1",
                author: { name: "System", initials: "SYS" },
                content: "Triggered by webhook ID: wh_12345",
                timestamp: "10:00 AM"
            }
        ],
        isAutomated: true,
    },
    {
        id: "2",
        type: "action",
        label: "Create Slack Account",
        description: "Provisions a new user in the corporate Slack workspace.",
        status: "completed",
        timestamp: "10:00 AM",
        duration: "2s",
        comments: [],
        isAutomated: true,
    },
    {
        id: "3",
        type: "ai",
        label: "Generate Welcome Email",
        description: "Uses GPT-4 to personalize the welcome message based on department.",
        status: "completed",
        timestamp: "10:00 AM",
        duration: "5s",
        comments: [
            {
                id: "c2",
                author: { name: "Sarah Connor", initials: "SC" },
                content: "The tone seems a bit too formal. Can we adjust the prompt?",
                timestamp: "10:05 AM"
            },
            {
                id: "c3",
                author: { name: "Bob Jones", initials: "BJ" },
                content: "Agreed, let's make it friendlier.",
                timestamp: "10:12 AM"
            }
        ],
        isAutomated: true,
    },
    {
        id: "4",
        type: "human",
        label: "Manager Approval",
        description: "Wait for the hiring manager to approve the equipment request.",
        status: "running",
        timestamp: "10:01 AM",
        duration: "Pending...",
        comments: [
            {
                id: "c4",
                author: { name: "Alice Smith", initials: "AS" },
                content: "Waiting on budget approval before I can sign off.",
                timestamp: "10:30 AM"
            }
        ],
        assignee: { name: "Alice Smith", initials: "AS" },
    },
    {
        id: "5",
        type: "action",
        label: "Send Welcome Packet",
        description: "Emails the final packet to the new employee.",
        status: "pending",
        comments: [],
        isAutomated: true,
    },
];

export const DEFAULT_VISUAL = [
    { label: "Region", value: "North America", status: "neutral" },
    { label: "Active Users", value: "1,240", status: "neutral" },
    { label: "Growth", value: "+12%", status: "positive" },
];

export const MOCK_FILES = [
    { id: "f1", name: "Offer_Letter_Draft.pdf", size: "2.4 MB", uploadedBy: "Sarah Connor", date: "2024-12-20", actionId: "3" },
    { id: "f2", name: "Equipment_Request_Form.docx", size: "1.1 MB", uploadedBy: "Alice Smith", date: "2024-12-20", actionId: "4" },
    { id: "f3", name: "New_Hire_Checklist.xlsx", size: "45 KB", uploadedBy: "System", date: "2024-12-20", actionId: "1" },
];

export function getFlowData(flowId: string, flowName: string) {
    let steps: TimelineStep[] = [];
    let dataVisual: any[] = [];

    if (flowName === "Reefer Alert") {
        // Reefer Alert Specific Data
        if (flowId === "AF-2024-004") {
            steps = [
                { 
                    id: "1", 
                    type: "alarm", 
                    label: "Alarm 10 (High Pressure)", 
                    description: "Reefer unit reporting high pressure discharge.", 
                    status: "running", 
                    timestamp: "11:20 AM", 
                    duration: "Active", 
                    comments: [
                        {
                            id: "c1",
                            author: { name: "Road Assist", initials: "RA" },
                            content: "Technician dispatched to inspect compressor discharge valve.",
                            timestamp: "11:25 AM"
                        },
                        {
                            id: "c2",
                            author: { name: "Dispatch", initials: "DP" },
                            content: "ETA 45 mins. Driver instructed to pull over safely.",
                            timestamp: "11:30 AM"
                        }
                    ], 
                    assignee: { name: "Sam Tran", initials: "ST" }
                }
            ];
            dataVisual = [
                { label: "Trailer Temp", value: "-10°F", status: "normal" },
                { label: "Set Point", value: "-10°F", status: "normal" },
                { label: "Fuel Level", value: "85%", status: "normal" },
                { label: "Return Air", value: "-8°F", status: "warning" },
                { label: "Loaded", value: "Yes", status: "neutral" },
            ];
        } else {
            steps = [
                { 
                    id: "1", 
                    type: "alarm", 
                    label: "Alarm 02 (Sensor Failure)", 
                    description: "Return air sensor failure detected.", 
                    status: "running", 
                    timestamp: "08:15 AM", 
                    duration: "Active", 
                    comments: [
                        {
                            id: "c1",
                            author: { name: "Road Assist", initials: "RA" },
                            content: "Remote diagnostics indicate sensor wiring issue. Scheduling shop visit.",
                            timestamp: "08:20 AM"
                        }
                    ], 
                    assignee: { name: "Sam Tran", initials: "ST" }
                },
                { 
                    id: "2", 
                    type: "alarm", 
                    label: "Alarm 15 (Check Battery)", 
                    description: "Unit battery voltage is low.", 
                    status: "running", 
                    timestamp: "08:16 AM", 
                    duration: "Active", 
                    comments: [], 
                    assignee: { name: "Sam Tran", initials: "ST" }
                }
            ];
            dataVisual = [
                { label: "Trailer Temp", value: "34°F", status: "normal" },
                { label: "Set Point", value: "34°F", status: "normal" },
                { label: "Fuel Level", value: "45%", status: "normal" },
                { label: "Return Air", value: "36°F", status: "warning" },
                { label: "Loaded", value: "No", status: "neutral" },
            ];
        }

    } else if (flowName === "Drivers at Risk") {
        steps = [
            { 
                id: "1", 
                type: "human", 
                label: "Identify At-Risk Driver", 
                description: "Retention team flagged driver based on predictive model.", 
                status: "completed", 
                timestamp: "08:30 AM", 
                duration: "5m", 
                comments: [
                    {
                        id: "c1",
                        author: { name: "System", initials: "SYS" },
                        content: "Risk Score increased to 85 (High). Triggering workflow.",
                        timestamp: "08:30 AM"
                    }
                ], 
                assignee: { name: "Retention Team", initials: "RT" }
            },
            { 
                id: "2", 
                type: "action", 
                label: "Fetch Tenstreet Data", 
                description: "Pulling employment history and safety records via API.", 
                status: "completed", 
                timestamp: "08:35 AM", 
                duration: "2s", 
                comments: [], 
                isAutomated: true 
            },
            { 
                id: "3", 
                type: "human", 
                label: "Initial Outreach Call", 
                description: "Contact driver to discuss concerns and current status.", 
                status: "running", 
                timestamp: "09:00 AM", 
                duration: "Active", 
                comments: [], 
                assignee: { name: "Sam Tran", initials: "ST" } 
            },
            { 
                id: "4", 
                type: "ai", 
                label: "Log Call Sentiment", 
                description: "Chat with AI to record call notes and sentiment rating.", 
                status: "pending", 
                timestamp: "-", 
                duration: "-", 
                comments: [], 
                isAutomated: true 
            },
            { 
                id: "5", 
                type: "human", 
                label: "Manager Review", 
                description: "Review retention offer and strategy.", 
                status: "pending", 
                timestamp: "-", 
                duration: "-", 
                comments: [], 
                assignee: { name: "Retention Manager", initials: "RM" } 
            },
            { 
                id: "6", 
                type: "human", 
                label: "Driver Follow-up", 
                description: "Secondary call to confirm satisfaction.", 
                status: "pending", 
                timestamp: "-", 
                duration: "-", 
                comments: [], 
                assignee: { name: "Sam Tran", initials: "ST" } 
            },
            { 
                id: "7", 
                type: "ai", 
                label: "Final Outcome Log", 
                description: "Record final status (Retained/Departed).", 
                status: "pending", 
                timestamp: "-", 
                duration: "-", 
                comments: [], 
                isAutomated: true 
            }
        ];
        dataVisual = [
            { label: "Driver Name", value: "John Smith", status: "neutral" },
            { label: "Tenure", value: "3.5 Years", status: "neutral" },
            { label: "Risk Score", value: "85/100", status: "warning" },
            { label: "Last Trip", value: "2 days ago", status: "neutral" },
            { label: "Home Time", value: "4 days", status: "neutral" },
        ];
    } else if (flowName === "Budget Approval") {
         steps = [
            { id: "1", type: "human", label: "Manager Review", description: "Review budget allocation request.", status: "running", timestamp: "09:45 AM", duration: "Pending...", comments: [], assignee: { name: "Alice Smith", initials: "AS" } },
            { id: "2", type: "action", label: "Update ERP", description: "Sync approved budget to SAP.", status: "pending", timestamp: "-", duration: "-", comments: [], isAutomated: true }
         ];
         dataVisual = [
             { label: "Requested", value: "$50,000", status: "neutral" },
             { label: "Department", value: "Marketing", status: "neutral" },
             { label: "Fiscal Year", value: "2024", status: "neutral" },
         ];
    } else if (flowName === "Vendor Contract Renewal") {
        steps = [
            { 
                id: "1", 
                type: "action", 
                label: "Contract Expiry Alert", 
                description: "System detected contract expiring in 30 days.", 
                status: "completed", 
                timestamp: "Dec 09, 02:30 PM", 
                duration: "0s", 
                comments: [], 
                isAutomated: true 
            },
            { 
                id: "2", 
                type: "human", 
                label: "Vendor Performance Review", 
                description: "Evaluate vendor performance against SLAs.", 
                status: "completed", 
                timestamp: "Dec 10, 10:00 AM", 
                duration: "2d", 
                comments: [
                    {
                        id: "c1",
                        author: { name: "Charlie Day", initials: "CD" },
                        content: "Performance has been solid. Recommend renewal.",
                        timestamp: "Dec 10, 10:15 AM"
                    }
                ], 
                assignee: { name: "Charlie Day", initials: "CD" } 
            },
            { 
                id: "3", 
                type: "human", 
                label: "Legal Review", 
                description: "Review renewal terms and conditions.", 
                status: "running", 
                timestamp: "Dec 10, 11:00 AM", 
                duration: "Active", 
                comments: [], 
                assignee: { name: "Legal Team", initials: "LT" } 
            },
            { 
                id: "4", 
                type: "human", 
                label: "Sign Contract", 
                description: "Execute the renewal agreement.", 
                status: "pending", 
                timestamp: "-", 
                duration: "-", 
                comments: [], 
                assignee: { name: "Charlie Day", initials: "CD" } 
            },
            { 
                id: "5", 
                type: "action", 
                label: "Archive Document", 
                description: "Store signed contract in document management system.", 
                status: "pending", 
                timestamp: "-", 
                duration: "-", 
                comments: [], 
                isAutomated: true 
            }
        ];
        dataVisual = [
            { label: "Vendor", value: "Acme Corp", status: "neutral" },
            { label: "Contract Value", value: "$120,000", status: "neutral" },
            { label: "Expiry Date", value: "2024-12-31", status: "warning" },
            { label: "Status", value: "Active", status: "positive" },
            { label: "Renewal Type", value: "Auto-renew", status: "neutral" },
        ];
    } else if (flowName === "Customer Refund") {
        steps = [
            { 
                id: "1", 
                type: "human", 
                label: "Refund Request Received", 
                description: "Customer requested refund for Order #9928.", 
                status: "completed", 
                timestamp: "Dec 10, 06:15 AM", 
                duration: "5m", 
                comments: [
                    {
                        id: "c1",
                        author: { name: "Support", initials: "SP" },
                        content: "Customer provided photos of damaged goods.",
                        timestamp: "Dec 10, 06:20 AM"
                    }
                ], 
                assignee: { name: "Support", initials: "SP" } 
            },
            { 
                id: "2", 
                type: "action", 
                label: "Fraud Check", 
                description: "Automated risk assessment for refund request.", 
                status: "completed", 
                timestamp: "Dec 10, 06:22 AM", 
                duration: "2s", 
                comments: [], 
                isAutomated: true 
            },
            { 
                id: "3", 
                type: "human", 
                label: "Finance Approval", 
                description: "Approve refund amount and method.", 
                status: "running", 
                timestamp: "Dec 10, 08:00 AM", 
                duration: "Active", 
                comments: [], 
                assignee: { name: "Finance Team", initials: "FT" } 
            },
            { 
                id: "4", 
                type: "action", 
                label: "Process Payment", 
                description: "Initiate refund transaction via payment gateway.", 
                status: "pending", 
                timestamp: "-", 
                duration: "-", 
                comments: [], 
                isAutomated: true 
            },
            { 
                id: "5", 
                type: "action", 
                label: "Notify Customer", 
                description: "Send refund confirmation email.", 
                status: "pending", 
                timestamp: "-", 
                duration: "-", 
                comments: [], 
                isAutomated: true 
            }
        ];
        dataVisual = [
            { label: "Order ID", value: "#9928", status: "neutral" },
            { label: "Amount", value: "$450.00", status: "neutral" },
            { label: "Reason", value: "Damaged Goods", status: "warning" },
            { label: "Customer", value: "Jane Doe", status: "neutral" },
            { label: "Method", value: "Original Payment", status: "neutral" },
        ];
    } else {
        // Default / Employee Onboarding
        steps = DEFAULT_STEPS;
        dataVisual = DEFAULT_VISUAL;
    }

    return { steps, dataVisual };
}
