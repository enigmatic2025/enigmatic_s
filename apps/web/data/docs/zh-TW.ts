import { DocSection, SidebarGroup } from "./types";

export const zhTwSidebar: SidebarGroup[] = [
    {
        title: "快速入門",
        items: [
            { id: "overview", label: "總覽" },
            { id: "concepts", label: "核心概念" },
        ],
    },
    {
        title: "觸發器 (Triggers)",
        items: [
            { id: "trigger-api", label: "API Trigger" },
        ],
    },
    {
        title: "人機互動",
        items: [
            { id: "human-task", label: "Human Task" },
        ],
    },
    {
        title: "外部系統",
        items: [
            { id: "wait-for-event", label: "Wait for Event" },
            { id: "http-request", label: "HTTP Request" },
            { id: "correlation", label: "Correlation Signals" },
        ],
    },
    {
        title: "資料操作",
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
        title: "表達式",
        items: [
            { id: "expressions", label: "Expression 語法" },
        ],
    },
];

export const zhTwDocs: DocSection[] = [
    {
        id: "overview",
        title: "總覽 (Overview)",
        iconName: "BookOpen",
        description: "Nodal 是一個營運協作平台。它將您的人員、系統和流程連接成自動化流程，從而更高效地營運您的業務。",
        blocks: [
            {
                type: "h3",
                content: "什麼是 Flow Studio？"
            },
            {
                type: "prose",
                content: "Flow Studio 是一個視覺化設計器，您可以在其中構建業務流程。每個流程都是一系列步驟 — 從啟動流程的 Trigger (觸發器)、分配給人員的任務、資料轉換、到外部系統的 API 呼叫，以及根據條件路由工作的決策邏輯。"
            },
            {
                type: "h3",
                content: "什麼是 Action Flows？"
            },
            {
                type: "prose",
                content: "Action Flows 是流程的<strong>執行實例 (Running Instances)</strong>。當一個流程被觸發時 — 無論是透過 API 呼叫、排程或手動啟動 — 它都會建立一個 Action Flow 來追蹤每個步驟的執行情況。團隊成員會在 Action Flows 儀表板中看到分配給他們的任務，並完成這些任務以推動流程繼續。"
            },
            {
                type: "h3",
                content: "流程如何運行"
            },
            {
                type: "stepList",
                steps: [
                    {
                        title: "觸發器啟動",
                        desc: "當觸發器被啟動時（例如透過 API 呼叫、預定排程或手動啟動），流程即開始執行。",
                    },
                    {
                        title: "步驟依序執行",
                        desc: "每個節點 (Node) 依序運行。資料從一個步驟流向這一個步驟。條件 (Condition) 和分支 (Switch) 節點會決定執行路徑。",
                    },
                    {
                        title: "必要時暫停",
                        desc: "Human Task (人工任務) 會等待人員回應。Wait for Event (等待事件) 節點會等待外部 Webhook。當收到輸入後，流程會自動恢復執行。",
                    },
                    {
                        title: "完成或失敗",
                        desc: "流程執行到終點並完成，或者發生錯誤而失敗。所有的執行數據都會被記錄下來。",
                    },
                ]
            },
            {
                type: "navLinks",
                links: [
                    { label: "了解觸發器 (Triggers)", url: "trigger-api" },
                    { label: "人工任務 (Human Tasks)", url: "human-task" },
                    { label: "表達式語法 (Expressions)", url: "expressions" },
                ]
            }
        ]
    },
    {
        id: "concepts",
        title: "核心概念",
        iconName: "Layers",
        description: "在構建流程之前需要了解的關鍵概念。",
        blocks: [
            {
                type: "conceptGrid",
                concepts: [
                    { iconName: "Play", color: "text-blue-500", title: "節點 (Nodes)", desc: "流程的構建模組。每個節點執行一個動作 — 觸發、轉換資料、呼叫 API、分配任務或做出決策。" },
                    { iconName: "ArrowRight", color: "text-gray-500", title: "連線 (Edges)", desc: "節點之間的連接，定義了執行順序。資料沿著連線從一個節點流向這一個節點。" },
                    { iconName: "Variable", color: "text-purple-500", title: "表達式 (Expressions)", desc: "對先前步驟資料的動態引用。寫法如 {{ steps.NodeId.output.field }}，用於在節點之間傳遞資料。" },
                    { iconName: "Layers", color: "text-orange-500", title: "Action Flows", desc: "流程的執行實例。每次觸發都會建立一個新的 Action Flow，並依序執行各個步驟直到完成。" },
                    { iconName: "User", color: "text-green-500", title: "人機協作 (Human-in-the-Loop)", desc: "流程可以暫停並等待人工輸入。Human Task 節點會將工作分配給團隊成員，讓他們在儀表板中完成。" },
                    { iconName: "Webhook", color: "text-red-500", title: "Webhooks", desc: "外部系統可以透過向唯一的 Webhook URL 發送資料來恢復暫停的流程。無需 API 金鑰或複雜的 ID。" },
                ]
            },
            {
                type: "navLinks",
                links: [
                    { label: "表達式語法", url: "expressions" }
                ]
            }
        ]
    },
    {
        id: "trigger-api",
        title: "API Trigger",
        iconName: "Globe",
        description: "透過 HTTP POST 啟動流程。使用此功能整合外部系統、構建自動化管道或建立事件驅動的工作流。",
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
                content: "<code class='text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground'>flowId</code> 是已發布流程的唯一識別碼。您可以在 Flow Studio 的網址或流程設定中找到它。"
            },
            {
                type: "h3",
                content: "Request body"
            },
            {
                type: "prose",
                content: "發送任何 JSON payload。您發送的欄位將可透過表達式在所有後續步驟中使用。"
            },
            {
                type: "code",
                id: "api-trigger-body",
                label: "JSON",
                code: `{\n  "order_id": "ORD-12345",\n  "customer_name": "Acme Corp",\n  "total": 2499.00,\n  "priority": "high"\n}`
            },
            {
                type: "h3",
                content: "配置選項"
            },
            {
                type: "paramTable",
                rows: [
                    { name: "schema", type: "SchemaField[]", desc: "定義預期的 payload 欄位、類型及是否必填。" },
                    { name: "instanceNameTemplate", type: "string", desc: "Action Flow 實例的動態標題。支援表達式。" },
                    { name: "defaultPriority", type: "enum", desc: "優先級別: low (低), medium (中), high (高), 或 critical (緊急)。" },
                    { name: "instanceDescriptionTemplate", type: "string", desc: "在 Action Flow 儀表板中顯示給使用者的說明。" },
                ]
            },
            {
                type: "h3",
                content: "存取 Trigger 資料"
            },
            {
                type: "code",
                id: "api-trigger-access",
                code: `{{ steps.trigger.data.order_id }}     // "ORD-12345"\n{{ steps.trigger.data.customer_name }} // "Acme Corp"\n{{ steps.trigger.data.total }}         // 2499.00`
            },
            {
                type: "h3",
                content: "範例: cURL"
            },
            {
                type: "code",
                id: "api-trigger-curl",
                label: "Bash",
                code: `curl -X POST https://enigmatic.works/api/flows/YOUR_FLOW_ID/execute \\\n  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "order_id": "ORD-12345",\n    "customer_name": "Acme Corp"\n  }'`
            },
            {
                type: "callout",
                content: "API Trigger 需要驗證。JWT token 來自 Supabase Auth。對於無需驗證的外部 Webhook，請改用 <a href='#' data-nav='wait-for-event' class='underline underline-offset-2 hover:text-primary'>Wait for Event</a> 節點。"
            }
        ]
    },
    {
        id: "human-task",
        title: "Human Task",
        iconName: "User",
        description: "暫停流程並將工作分配給人員。當被分配者透過 Action Flows 儀表板完成任務時，流程將恢復執行。",
        blocks: [
            {
                type: "h3",
                content: "運作方式"
            },
            {
                type: "stepList",
                steps: [
                    { title: "流程到達 Human Task 節點", desc: "流程暫停並建立一個任務記錄。該任務會出現在被分配者的 Action Flows 儀表板中。" },
                    { title: "被分配者審閱並回應", desc: "被分配者查看任務標題、說明並填寫表單。他們可以查看先前步驟的背景資訊。" },
                    { title: "流程恢復執行", desc: "當使用者提交回應後，流程繼續執行。表單資料可用於後續步驟。" },
                ]
            },
            {
                type: "h3",
                content: "配置"
            },
            {
                type: "paramTable",
                rows: [
                    { name: "title", type: "string", desc: "顯示給被分配者的任務標題。支援表達式以建立動態標題。" },
                    { name: "instructions", type: "rich text", desc: "HTML 格式的詳細說明。解釋被分配者需要做什麼。" },
                    { name: "assignments", type: "User[]", desc: "一個或多個有權查看並完成任務的團隊成員。" },
                    { name: "schema", type: "FormField[]", desc: "被分配者需要填寫的表單欄位（文字、數字、日期、評分、簽名等）。" },
                ]
            },
            {
                type: "h3",
                content: "表單欄位類型"
            },
            {
                type: "prose",
                content: "支援以下欄位類型：Text (文字), Long Text (長文字), Number (數字), Rating (評分), Boolean (布林值), Date (日期), Time (時間), DateTime (日期時間), File (檔案), Multiple Choice (多選), Checkboxes (核取方塊), Signature (簽名)。"
            },
            {
                type: "h3",
                content: "使用表達式建立動態標題"
            },
            {
                type: "prose",
                content: "使用表達式根據上下文建立任務標題："
            },
            {
                type: "code",
                id: "ht-title",
                code: `Review order {{ steps.trigger.data.order_id }} for {{ steps.trigger.data.customer_name }}`
            },
            {
                type: "prose",
                content: "這將產生如 <strong>&ldquo;Review order ORD-12345 for Acme Corp&rdquo;</strong> 的標題。"
            },
            {
                type: "h3",
                content: "存取任務回應"
            },
            {
                type: "code",
                id: "ht-output",
                code: `// 被分配者的表單回應可透過以下方式存取：\n{{ steps.ReviewTask.output.approval }}    // "approved"\n{{ steps.ReviewTask.output.comments }}    // "Looks good"\n{{ steps.ReviewTask.output.rating }}      // 5`
            },
            {
                type: "callout",
                content: "Human Tasks 是「人機協作 (Human-in-the-Loop)」自動化的核心。將其用於審批、品質檢查、資料輸入、文件審閱或任何需要人工判斷的步驟。"
            }
        ]
    },
    {
        id: "wait-for-event",
        title: "Wait for Event",
        iconName: "Webhook",
        description: "暫停流程並等待外部系統透過唯一的 Webhook URL 發送資料。無需驗證、ID 或複雜的 payload。",
        blocks: [
            {
                type: "h3",
                content: "運作方式"
            },
            {
                type: "stepList",
                steps: [
                    { title: "流程到達 Wait for Event 節點", desc: "流程暫停並產生一個唯一的一次性 Webhook URL。" },
                    { title: "發送 Webhook URL", desc: "使用上游的 HTTP Request 或 Email 節點將此 URL 發送給外部系統。" },
                    { title: "外部系統 POST 資料", desc: "外部系統向該 Webhook URL 發送包含 JSON 資料的 POST 請求。" },
                    { title: "流程恢復", desc: "流程繼續執行，接收到的資料可用於所有後續步驟。" },
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
                content: "<code class='text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground'>{token}</code> 是為每次流程執行產生的唯一 UUID。無需驗證標頭 — token 本身即為驗證。每個 URL 僅能使用一次。"
            },
            {
                type: "h3",
                content: "Request 格式"
            },
            {
                type: "prose",
                content: "發送任何 JSON body。整個 payload 都將可用於後續步驟。"
            },
            {
                type: "code",
                id: "wfe-payload",
                label: "JSON",
                code: `{\n  "payment_status": "confirmed",\n  "amount": 149.99,\n  "transaction_id": "txn_abc123"\n}`
            },
            {
                type: "h3",
                content: "回應 (Response)"
            },
            {
                type: "code",
                id: "wfe-response",
                label: "Response 200",
                code: `{\n  "status": "ok",\n  "message": "Workflow resumed successfully"\n}`
            },
            {
                type: "h3",
                content: "範例: cURL"
            },
            {
                type: "code",
                id: "wfe-curl",
                label: "Bash",
                code: `curl -X POST https://enigmatic.works/api/webhooks/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "payment_status": "confirmed",\n    "amount": 149.99\n  }'`
            },
            {
                type: "h3",
                content: "在流程中存取 Webhook URL"
            },
            {
                type: "prose",
                content: "當節點暫停時，它會輸出唯一的 Webhook URL。在之前的步驟中引用它以發送給外部系統："
            },
            {
                type: "code",
                id: "wfe-var",
                code: `{{ steps.WaitForPayment.output.webhook_url }}`
            },
            {
                type: "callout",
                content: "對於多個流程監聽同一類型事件的進階案例，請參閱 <a href='#' data-nav='correlation' class='underline underline-offset-2 hover:text-primary'>Correlation Signals</a>。"
            }
        ]
    },
    {
        id: "http-request",
        title: "HTTP Request",
        iconName: "Send",
        description: "向外部 API 發出 HTTP 請求。呼叫第三方服務、獲取資料或發送通知作為流程的一部分。",
        blocks: [
            {
                type: "h3",
                content: "配置"
            },
            {
                type: "paramTable",
                rows: [
                    { name: "method", type: "enum", desc: "HTTP 方法: GET, POST, PUT, DELETE, 或 PATCH。" },
                    { name: "url", type: "string", desc: "Endpoint URL。支援動態 URL 表達式。" },
                    { name: "headers", type: "KeyValue[]", desc: "自定義 HTTP 標頭 (例如: Authorization, API keys)。" },
                    { name: "params", type: "KeyValue[]", desc: "URL 查詢參數 (query parameters)。" },
                    { name: "body", type: "JSON", desc: "用於 POST/PUT/PATCH 的 Request body。支援表達式。" },
                ]
            },
            {
                type: "h3",
                content: "範例: 呼叫外部 API"
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
                content: "回應會自動解析並可用於後續步驟："
            },
            {
                type: "code",
                id: "http-output",
                code: `{{ steps.CallAPI.output.status }}       // 200\n{{ steps.CallAPI.output.data }}         // 解析後的 JSON response body\n{{ steps.CallAPI.output.data.result }}  // 存取巢狀欄位`
            },
            {
                type: "callout",
                content: "HTTP Request 節點的逾時 (timeout) 時間為 10 秒。對於執行時間較長的外部操作，請改用 Wait for Event 搭配 Callback 模式。"
            }
        ]
    },
    {
        id: "correlation",
        title: "Correlation Signals",
        iconName: "Globe",
        description: "用於多個流程實例監聽同一類型事件的進階案例。使用關聯 (Correlation) 來匹配正確的實例。",
        blocks: [
            {
                type: "h3",
                content: "何時使用"
            },
            {
                type: "stepList",
                steps: [
                    { title: "多個實例", desc: "多個流程實例正在等待相同的事件類型 (例如 'OrderPaid')" },
                    { title: "廣播", desc: "外部系統廣播事件，但不知道目標是哪個特定流程" },
                    { title: "匹配", desc: "您需要根據業務鍵值 (如 order_id, customer_id) 進行匹配" },
                ]
            },
            {
                type: "callout",
                content: "對於大多數整合，<a href='#' data-nav='wait-for-event' class='underline underline-offset-2 hover:text-primary'>Webhook URL</a> 方法更簡單且被推薦使用。僅當外部系統無法呼叫特定 URL 時才使用 Correlation。"
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
                content: "Request 格式"
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
                    { name: "event", type: "string", desc: "在 Wait for Event 節點中配置的事件名稱。預設為 \"default\"。" },
                    { name: "data", type: "object", desc: "與流程關聯條件匹配的鍵值對。所有條件必須匹配 (AND 邏輯)。" },
                ]
            },
            {
                type: "h3",
                content: "匹配邏輯"
            },
            {
                type: "stepList",
                steps: [
                    { title: "尋找活躍訂閱", desc: "系統尋找所有等待該事件名稱的活躍訂閱。" },
                    { title: "檢查條件", desc: "對於每個訂閱，每個配置的條件鍵必須存在於 signal 資料中，且值必須相同。" },
                    { title: "恢復匹配", desc: "所有匹配的流程都會被恢復。一個 signal 可以恢復多個流程實例。" },
                ]
            },
            {
                type: "h3",
                content: "回應"
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
        description: "在流程中建立或更新變數。儲存計算值、重新命名欄位或為後續步驟準備資料。",
        blocks: [
            {
                type: "h3",
                content: "單一變數 (Single variable)"
            },
            {
                type: "prose",
                content: "設定一個變數的名稱與值。值可以是靜態的或 expression。"
            },
            {
                type: "code",
                id: "var-single",
                label: "Configuration",
                code: `Variable Name:  total_with_tax\nValue:          {{ steps.trigger.data.total * 1.13 }}`
            },
            {
                type: "h3",
                content: "多個變數 (Multiple variables)"
            },
            {
                type: "prose",
                content: "在一個節點中同時設定多個變數："
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
                content: "變數可用於所有後續步驟："
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
        description: "根據邏輯條件分支流程。將工作路由到 True 或 False 路徑。",
        blocks: [
            {
                type: "h3",
                content: "配置"
            },
            {
                type: "prose",
                content: "定義一個條件：左值、運算符和右值。所有值都支援 expressions。"
            },
            {
                type: "code",
                id: "cond-example",
                label: "Example",
                code: `Left:      {{ steps.trigger.data.amount }}\nOperator:  >\nRight:     1000`
            },
            {
                type: "h3",
                content: "運算符"
            },
            {
                type: "paramTable",
                rows: [
                    { name: "==", type: "equals", desc: "值相等 (字串或數字)。" },
                    { name: "!=", type: "not equals", desc: "值不相等。" },
                    { name: ">", type: "greater than", desc: "左大於右 (數字)。" },
                    { name: "<", type: "less than", desc: "左小於右 (數字)。" },
                    { name: ">=", type: "greater or equal", desc: "左大於或等於右。" },
                    { name: "<=", type: "less or equal", desc: "左小於或等於右。" },
                    { name: "contains", type: "substring", desc: "左字串包含右字串。" },
                    { name: "matches", type: "regex", desc: "左字串匹配右正則表達式。" },
                ]
            },
            {
                type: "h3",
                content: "分支"
            },
            {
                type: "prose",
                content: "Condition 節點有兩條輸出路徑：<strong>True</strong> 和 <strong>False</strong>。將不同的節點連接到每條路徑以建立分支邏輯。檢查結果也可作為輸出存取："
            },
            {
                type: "code",
                id: "cond-output",
                code: `{{ steps.CheckAmount.output.result }}  // true 或 false`
            }
        ]
    },
    {
        id: "switch",
        title: "Switch",
        iconName: "GitBranch",
        description: "根據變數值將流程路由到不同路徑。類似多路 if/else — 當分支超過兩個時更為簡潔。",
        blocks: [
            {
                type: "h3",
                content: "配置"
            },
            {
                type: "prose",
                content: "選擇要評估的變數，然後定義每個分支的 case 值："
            },
            {
                type: "code",
                id: "switch-example",
                label: "Example",
                code: `Variable:  {{ steps.trigger.data.department }}\n\nCase "engineering"  →  Engineering Review 路徑\nCase "finance"      →  Finance Approval 路徑\nCase "legal"        →  Legal Review 路徑\nDefault             →  General Processing 路徑`
            },
            {
                type: "h3",
                content: "行為"
            },
            {
                type: "stepList",
                steps: [
                    { title: "變數比較", desc: "變數會依序與每個 case 值進行比較。" },
                    { title: "首次匹配", desc: "第一個匹配的 case 路徑將被執行。" },
                    { title: "預設路徑", desc: "如果沒有 case 匹配，將執行 Default 路徑。" },
                    { title: "輸出邊", desc: "每個 case 在流程設計器中建立單獨的輸出邊。" },
                ]
            }
        ]
    },
    {
        id: "loop",
        title: "Loop",
        iconName: "Repeat",
        description: "迭代一個陣列項目，並為每個項目執行一組步驟。處理訂單列表、使用者清單、記錄或任何集合。",
        blocks: [
            {
                type: "h3",
                content: "配置"
            },
            {
                type: "prose",
                content: "將 Loop 指向一個陣列變數："
            },
            {
                type: "code",
                id: "loop-config",
                label: "Configuration",
                code: `Items:  {{ steps.FetchOrders.output.data }}`
            },
            {
                type: "h3",
                content: "在迴圈內部"
            },
            {
                type: "prose",
                content: "使用 <code class='text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground'>item</code> 變數存取當前項目："
            },
            {
                type: "code",
                id: "loop-item",
                code: `{{ steps.MyLoop.item }}           // 當前項目物件\n{{ steps.MyLoop.item.order_id }}  // 當前項目的一個欄位\n{{ steps.MyLoop.item.total }}     // 另一個欄位`
            },
            {
                type: "callout",
                content: "放置在迴圈主體內部的節點將為陣列中的每個項目執行一次。這對於發送個別通知、處理記錄或為每個項目呼叫 API 非常有用。"
            }
        ]
    },
    {
        id: "filter",
        title: "Filter",
        iconName: "Layers",
        description: "根據條件過濾陣列，建立一個僅包含匹配項目的新陣列。",
        blocks: [
            {
                type: "prose",
                content: "過濾對於處理數據子集非常重要，例如僅選擇活躍使用者或高價值訂單。"
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
        description: "將陣列中的每個項目轉換為新結構。",
        blocks: [
            {
                type: "prose",
                content: "使用 Map 在發送至 API 或其他系統之前重塑數據。"
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
        title: "Expression 語法",
        iconName: "Variable",
        description: "學習如何編寫動態表達式 (expressions) 以存取數據並執行計算。",
        blocks: [
            {
                type: "h3",
                content: "基本"
            },
            {
                type: "prose",
                content: "表達式包裹在雙大括號 <code class='text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground'>{{ }}</code> 中。它們支援類 JavaScript 語法來存取物件屬性和陣列元素。"
            },
            {
                type: "code",
                id: "expr-basic",
                code: `{{ steps.trigger.data.id }}\n{{ steps.MyStep.output.result }}\n{{ steps.MyStep.output.items[0] }}`
            }
        ]
    }
];
