import { DocSection, SidebarGroup } from "./types";

export const viSidebar: SidebarGroup[] = [
    {
        title: "Bắt đầu",
        items: [
            { id: "overview", label: "Tổng Quan" },
            { id: "concepts", label: "Khái Niệm Cốt Lõi" },
            { id: "ai-agents", label: "AI Agents (MCP)" },
        ],
    },
    {
        title: "Kích hoạt (Triggers)",
        items: [
            { id: "trigger-api", label: "API Trigger" },
        ],
    },
    {
        title: "Tương tác người dùng",
        items: [
            { id: "human-task", label: "Human Task" },
        ],
    },
    {
        title: "Hệ thống bên ngoài",
        items: [
            { id: "wait-for-event", label: "Wait for Event" },
            { id: "http-request", label: "HTTP Request" },
            { id: "correlation", label: "Correlation Signals" },
        ],
    },
    {
        title: "Thao tác dữ liệu",
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
        title: "Biểu thức",
        items: [
            { id: "expressions", label: "Cú pháp Expression" },
        ],
    },
];

export const viDocs: DocSection[] = [
    {
        id: "overview",
        title: "Tổng Quan",
        iconName: "BookOpen",
        description: "Nodal là nền tảng điều phối vận hành toàn diện. Nó kết nối con người, hệ thống và quy trình của bạn thành các luồng tự động hóa giúp vận hành doanh nghiệp hiệu quả hơn.",
        blocks: [
            {
                type: "h3",
                content: "Flow Studio là gì?"
            },
            {
                type: "prose",
                content: "Flow Studio là trình thiết kế trực quan nơi bạn xây dựng các quy trình kinh doanh. Mỗi luồng (flow) là một chuỗi các bước — từ trigger (kích hoạt) để bắt đầu quy trình, các tác vụ được giao cho nhân sự, chuyển đổi dữ liệu, gọi API đến các hệ thống bên ngoài, cho đến các logic quyết định hướng xử lý dựa trên điều kiện cụ thể."
            },
            {
                type: "h3",
                content: "Action Flows là gì?"
            },
            {
                type: "prose",
                content: "Action Flows là các <strong>phiên bản đang chạy</strong> của một luồng. Khi một luồng được kích hoạt — qua API, lịch trình hoặc khởi chạy thủ công — nó tạo ra một Action Flow để theo dõi quá trình thực thi qua từng bước. Thành viên trong nhóm sẽ thấy các tác vụ được giao cho họ trong bảng điều khiển Action Flows và hoàn thành chúng để quy trình tiếp tục."
            },
            {
                type: "h3",
                content: "Cách một luồng hoạt động"
            },
            {
                type: "stepList",
                steps: [
                    {
                        title: "Trigger kích hoạt",
                        desc: "Một luồng bắt đầu khi trigger của nó được kích hoạt — ví dụ như qua API call, lịch trình định sẵn, hoặc khởi chạy thủ công.",
                    },
                    {
                        title: "Các bước thực thi tuần tự",
                        desc: "Mỗi node chạy theo thứ tự. Dữ liệu chạy từ bước này sang bước tiếp theo. Các node điều kiện và switch sẽ điều hướng luồng xử lý.",
                    },
                    {
                        title: "Tạm dừng khi cần thiết",
                        desc: "Human Task (Tác vụ con người) sẽ đợi người dùng phản hồi. Wait for Event (Đợi sự kiện) sẽ chờ webhook từ bên ngoài. Luồng sẽ tự động tiếp tục khi nhận được dữ liệu đầu vào.",
                    },
                    {
                        title: "Hoàn thành hoặc thất bại",
                        desc: "Luồng đi đến kết thúc và hoàn thành, hoặc gặp lỗi và thất bại. Tất cả dữ liệu thực thi đều được ghi log lại.",
                    },
                ]
            },

        ]
    },
    {
        id: "concepts",
        title: "Khái Niệm Cốt Lõi",
        iconName: "Layers",
        description: "Những ý tưởng chính cần nắm vững trước khi xây dựng luồng.",
        blocks: [
            {
                type: "conceptGrid",
                concepts: [
                    { iconName: "Play", color: "text-blue-500", title: "Nodes", desc: "Các khối xây dựng nên một luồng. Mỗi node thực hiện một hành động — kích hoạt, chuyển đổi dữ liệu, gọi API, giao việc, hoặc ra quyết định." },
                    { iconName: "ArrowRight", color: "text-gray-500", title: "Edges", desc: "Đường nối giữa các node xác định thứ tự thực thi. Dữ liệu chảy dọc theo các cạnh từ node này sang node tiếp theo." },
                    { iconName: "Variable", color: "text-purple-500", title: "Expressions", desc: "Tham chiếu động tới dữ liệu từ các bước trước. Viết dưới dạng {{ steps.NodeId.output.field }} để truyền dữ liệu giữa các node." },
                    { iconName: "Layers", color: "text-orange-500", title: "Action Flows", desc: "Một phiên bản đang chạy của luồng. Mỗi lần kích hoạt sẽ tạo ra một Action Flow mới tiến trình qua các bước cho đến khi hoàn thành." },
                    { iconName: "User", color: "text-green-500", title: "Human-in-the-Loop", desc: "Luồng có thể tạm dừng và đợi con người nhập liệu. Human Task node giao việc cho thành viên để họ hoàn thành trong dashboard." },
                    { iconName: "Webhook", color: "text-red-500", title: "Webhooks", desc: "Hệ thống bên ngoài có thể tiếp tục luồng đang tạm dừng bằng cách gửi dữ liệu tới một URL webhook duy nhất. Không cần API key hay ID phức tạp." },
                ]
            },

        ]
    },
    {
        id: "ai-agents",
        title: "AI Agents (MCP)",
        iconName: "Bot",
        description: "Kết nối các AI bot với tài liệu Nodal. Được xây dựng theo chuẩn Model Context Protocol (MCP) và hỗ trợ khám phá LLM.",
        blocks: [
            {
                type: "h3",
                content: "Discovery (llms.txt)"
            },
            {
                type: "prose",
                content: "Nodal triển khai tiêu chuẩn <code class='text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground'>/llms.txt</code>. Tệp này đóng vai trò như một bản kê khai (manifest), hướng dẫn các AI agent tìm đến tài liệu phù hợp nhất mà không cần phải thu thập dữ liệu HTML (crawl)."
            },
            {
                type: "code",
                id: "agent-llms",
                label: "Discovery URL",
                code: `https://enigmatic.works/llms.txt`
            },
            {
                type: "h3",
                content: "Static JSON API"
            },
            {
                type: "prose",
                content: "Để tiết kiệm dung lượng ngữ cảnh (context window) và giảm lỗi phân tích cú pháp, tài liệu sử dụng có sẵn dưới dạng JSON thô có cấu trúc. Các endpoint này được tạo tĩnh (statically generated) và cache tại edge để truy cập với độ trễ bằng không."
            },
            {
                type: "paramTable",
                rows: [
                    { name: "Tiếng Anh", type: "JSON", desc: "https://enigmatic.works/api/docs/en" },
                    { name: "Tiếng Việt", type: "JSON", desc: "https://enigmatic.works/api/docs/vi" },
                    { name: "Phồn thể", type: "JSON", desc: "https://enigmatic.works/api/docs/zh-TW" },
                ]
            },

        ]
    },
    {
        id: "trigger-api",
        title: "API Trigger",
        iconName: "Globe",
        description: "Bắt đầu một luồng thông qua HTTP POST. Sử dụng tính năng này để tích hợp hệ thống bên ngoài, xây dựng đường ống tự động hóa, hoặc tạo quy trình hướng sự kiện.",
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
                content: "<code class='text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground'>flowId</code> là định danh duy nhất của luồng đã được xuất bản (published). Bạn có thể tìm thấy nó trên URL của Flow Studio hoặc trong cài đặt luồng."
            },
            {
                type: "h3",
                content: "Request body"
            },
            {
                type: "prose",
                content: "Gửi bất kỳ JSON payload nào. Các trường bạn gửi sẽ khả dụng cho tất cả các bước phía sau thông qua expressions."
            },
            {
                type: "code",
                id: "api-trigger-body",
                label: "JSON",
                code: `{\n  "order_id": "ORD-12345",\n  "customer_name": "Acme Corp",\n  "total": 2499.00,\n  "priority": "high"\n}`
            },
            {
                type: "h3",
                content: "Tùy chọn cấu hình"
            },
            {
                type: "paramTable",
                rows: [
                    { name: "schema", type: "SchemaField[]", desc: "Định nghĩa các trường payload mong đợi cùng với kiểu dữ liệu và cờ bắt buộc." },
                    { name: "instanceNameTemplate", type: "string", desc: "Tiêu đề động cho instance Action Flow. Hỗ trợ expressions." },
                    { name: "defaultPriority", type: "enum", desc: "Mức độ ưu tiên: low (thấp), medium (trung bình), high (cao), hoặc critical (nghiêm trọng)." },
                    { name: "instanceDescriptionTemplate", type: "string", desc: "Hướng dẫn hiển thị cho người dùng trong dashboard Action Flow." },
                ]
            },
            {
                type: "h3",
                content: "Truy cập dữ liệu trigger"
            },
            {
                type: "code",
                id: "api-trigger-access",
                code: `{{ steps.trigger.data.order_id }}     // "ORD-12345"\n{{ steps.trigger.data.customer_name }} // "Acme Corp"\n{{ steps.trigger.data.total }}         // 2499.00`
            },
            {
                type: "h3",
                content: "Ví dụ: cURL"
            },
            {
                type: "code",
                id: "api-trigger-curl",
                label: "Bash",
                code: `curl -X POST https://enigmatic.works/api/flows/YOUR_FLOW_ID/execute \\\n  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "order_id": "ORD-12345",\n    "customer_name": "Acme Corp"\n  }'`
            },

        ]
    },
    {
        id: "human-task",
        title: "Human Task",
        iconName: "User",
        description: "Tạm dừng luồng và giao việc cho người phụ trách. Luồng sẽ tiếp tục khi người được giao hoàn thành tác vụ thông qua Action Flows dashboard.",
        blocks: [
            {
                type: "h3",
                content: "Cơ chế hoạt động"
            },
            {
                type: "stepList",
                steps: [
                    { title: "Luồng đi đến node Human Task", desc: "Luồng tạm dừng và tạo một bản ghi task. Task này xuất hiện trong dashboard của người được giao." },
                    { title: "Người được giao xem xét và phản hồi", desc: "Họ xem tiêu đề task, hướng dẫn, và điền vào biểu mẫu. Họ có thể xem lại ngữ cảnh từ các bước trước đó." },
                    { title: "Luồng tiếp tục với phản hồi mới", desc: "Khi người dùng gửi phản hồi, luồng tiếp tục chạy. Dữ liệu biểu mẫu sẽ khả dụng cho các bước tiếp theo." },
                ]
            },
            {
                type: "h3",
                content: "Cấu hình"
            },
            {
                type: "paramTable",
                rows: [
                    { name: "title", type: "string", desc: "Tiêu đề task hiển thị cho người làm. Hỗ trợ expressions để tạo tiêu đề động." },
                    { name: "instructions", type: "rich text", desc: "Hướng dẫn chi tiết dạng HTML. Giải thích những gì người làm cần thực hiện." },
                    { name: "assignments", type: "User[]", desc: "Một hoặc nhiều thành viên có quyền xem và hoàn thành task." },
                    { name: "schema", type: "FormField[]", desc: "Các trường biểu mẫu người làm cần điền (văn bản, số, ngày tháng, đánh giá, chữ ký, v.v.)." },
                ]
            },
            {
                type: "h3",
                content: "Các loại trường biểu mẫu"
            },
            {
                type: "prose",
                content: "Các loại trường sau được hỗ trợ: Text, Long Text, Number, Rating, Boolean, Date, Time, DateTime, File, Multiple Choice, Checkboxes, Signature."
            },
            {
                type: "h3",
                content: "Tiêu đề động với expressions"
            },
            {
                type: "prose",
                content: "Sử dụng expressions để tạo tiêu đề task dựa trên ngữ cảnh:"
            },
            {
                type: "code",
                id: "ht-title",
                code: `Review order {{ steps.trigger.data.order_id }} for {{ steps.trigger.data.customer_name }}`
            },
            {
                type: "prose",
                content: "Kết quả tạo ra các tiêu đề như <strong>&ldquo;Review order ORD-12345 for Acme Corp&rdquo;</strong>."
            },
            {
                type: "h3",
                content: "Truy cập phản hồi task"
            },
            {
                type: "code",
                id: "ht-output",
                code: `// Phản hồi biểu mẫu của người dùng được truy cập như sau:\n{{ steps.ReviewTask.output.approval }}    // "approved"\n{{ steps.ReviewTask.output.comments }}    // "Looks good"\n{{ steps.ReviewTask.output.rating }}      // 5`
            },

        ]
    },
    {
        id: "wait-for-event",
        title: "Wait for Event",
        iconName: "Webhook",
        description: "Tạm dừng luồng và chờ hệ thống bên ngoài gửi dữ liệu qua một URL webhook duy nhất. Không cần xác thực, ID hay payload phức tạp.",
        blocks: [
            {
                type: "h3",
                content: "Cơ chế hoạt động"
            },
            {
                type: "stepList",
                steps: [
                    { title: "Luồng đi đến node Wait for Event", desc: "Luồng tạm dừng và tạo ra một URL webhook duy nhất dùng một lần." },
                    { title: "Webhook URL được gửi ra ngoài", desc: "Sử dụng node HTTP Request hoặc Email phía trước để gửi URL này cho hệ thống bên ngoài." },
                    { title: "Hệ thống bên ngoài POST dữ liệu", desc: "Hệ thống bên ngoài gửi request POST với dữ liệu JSON tới webhook URL đó." },
                    { title: "Luồng tiếp tục", desc: "Luồng chạy tiếp với dữ liệu nhận được sẵn sàng cho các bước sau." },
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
                content: "<code class='text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground'>{token}</code> là UUID duy nhất được tạo cho mỗi lần chạy luồng. Không cần header xác thực — bản thân token đã là xác thực. Mỗi URL chỉ dùng được một lần."
            },
            {
                type: "h3",
                content: "Định dạng Request"
            },
            {
                type: "prose",
                content: "Gửi bất kỳ JSON body nào. Toàn bộ payload sẽ khả dụng cho các bước sau."
            },
            {
                type: "code",
                id: "wfe-payload",
                label: "JSON",
                code: `{\n  "payment_status": "confirmed",\n  "amount": 149.99,\n  "transaction_id": "txn_abc123"\n}`
            },
            {
                type: "h3",
                content: "Phản hồi (Response)"
            },
            {
                type: "code",
                id: "wfe-response",
                label: "Response 200",
                code: `{\n  "status": "ok",\n  "message": "Workflow resumed successfully"\n}`
            },
            {
                type: "h3",
                content: "Ví dụ: cURL"
            },
            {
                type: "code",
                id: "wfe-curl",
                label: "Bash",
                code: `curl -X POST https://enigmatic.works/api/webhooks/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "payment_status": "confirmed",\n    "amount": 149.99\n  }'`
            },
            {
                type: "h3",
                content: "Truy cập webhook URL trong luồng"
            },
            {
                type: "prose",
                content: "Khi node tạm dừng, nó xuất ra webhook URL duy nhất. Tham chiếu nó ở các bước trước để gửi cho hệ thống bên ngoài:"
            },
            {
                type: "code",
                id: "wfe-var",
                code: `{{ steps.WaitForPayment.output.webhook_url }}`
            },

        ]
    },
    {
        id: "http-request",
        title: "HTTP Request",
        iconName: "Send",
        description: "Thực hiện HTTP requests tới các API bên ngoài. Gọi dịch vụ thứ ba, lấy dữ liệu, hoặc gửi thông báo như một phần của luồng.",
        blocks: [
            {
                type: "h3",
                content: "Cấu hình"
            },
            {
                type: "paramTable",
                rows: [
                    { name: "method", type: "enum", desc: "HTTP method: GET, POST, PUT, DELETE, hoặc PATCH." },
                    { name: "url", type: "string", desc: "Endpoint URL. Hỗ trợ expressions cho URL động." },
                    { name: "headers", type: "KeyValue[]", desc: "HTTP headers tùy chỉnh (ví dụ: Authorization, API keys)." },
                    { name: "params", type: "KeyValue[]", desc: "URL query parameters." },
                    { name: "body", type: "JSON", desc: "Request body cho POST/PUT/PATCH. Hỗ trợ expressions." },
                ]
            },
            {
                type: "h3",
                content: "Ví dụ: Gọi API bên ngoài"
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
                content: "Phản hồi được tự động parse và khả dụng cho các bước sau:"
            },
            {
                type: "code",
                id: "http-output",
                code: `{{ steps.CallAPI.output.status }}       // 200\n{{ steps.CallAPI.output.data }}         // Parsed JSON response body\n{{ steps.CallAPI.output.data.result }}  // Truy cập trường lồng nhau`
            },

        ]
    },
    {
        id: "correlation",
        title: "Correlation Signals",
        iconName: "Globe",
        description: "Dành cho các trường hợp nâng cao khi nhiều instance của luồng cùng lắng nghe một loại sự kiện. Dùng tương quan (correlation) để khớp đúng instance cần xử lý.",
        blocks: [
            {
                type: "h3",
                content: "Khi nào cần dùng"
            },
            {
                type: "stepList",
                steps: [
                    { title: "Nhiều instances", desc: "Nhiều phiên bản luồng đang chờ cùng một loại sự kiện (ví dụ: 'OrderPaid')" },
                    { title: "Broadcast", desc: "Hệ thống bên ngoài phát sự kiện diện rộng mà không biết đích danh luồng nào cần nhận" },
                    { title: "Khớp dữ liệu", desc: "Bạn cần khớp dựa trên khóa nghiệp vụ (ví dụ: order_id, customer_id)" },
                ]
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
                content: "Định dạng Request"
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
                    { name: "event", type: "string", desc: "Tên sự kiện được cấu hình trong node Wait for Event. Mặc định là \"default\"." },
                    { name: "data", type: "object", desc: "Cặp Key-value được khớp với tiêu chí tương quan của luồng. Tất cả tiêu chí phải khớp (logic AND)." },
                ]
            },
            {
                type: "h3",
                content: "Logic khớp dữ liệu"
            },
            {
                type: "stepList",
                steps: [
                    { title: "Tìm các subscription đang hoạt động", desc: "Hệ thống tìm tất cả subscription đang chờ khớp với tên sự kiện." },
                    { title: "Kiểm tra tiêu chí", desc: "Với mỗi subscription, mọi khóa tiêu chí đã cấu hình phải tồn tại trong dữ liệu signal với giá trị y hệt." },
                    { title: "Tiếp tục các luồng khớp", desc: "Tất cả các luồng khớp điều kiện sẽ được tiếp tục. Một signal có thể kích hoạt nhiều luồng." },
                ]
            },
            {
                type: "h3",
                content: "Phản hồi"
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
        description: "Tạo hoặc cập nhật biến trong luồng. Lưu trữ giá trị tính toán, đổi tên trường, hoặc chuẩn bị dữ liệu cho bước sau.",
        blocks: [
            {
                type: "h3",
                content: "Biến đơn (Single variable)"
            },
            {
                type: "prose",
                content: "Đặt một biến với tên và giá trị. Giá trị có thể là tĩnh hoặc expression."
            },
            {
                type: "code",
                id: "var-single",
                label: "Configuration",
                code: `Variable Name:  total_with_tax\nValue:          {{ steps.trigger.data.total * 1.13 }}`
            },
            {
                type: "h3",
                content: "Nhiều biến (Multiple variables)"
            },
            {
                type: "prose",
                content: "Đặt nhiều biến cùng lúc trong một node:"
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
                content: "Biến khả dụng cho mọi bước phía sau:"
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
        description: "Rẽ nhánh luồng dựa trên điều kiện logic. Điều hướng công việc theo nhánh True hoặc False.",
        blocks: [
            {
                type: "h3",
                content: "Cấu hình"
            },
            {
                type: "prose",
                content: "Node Condition sử dụng trình tạo trực quan để định nghĩa logic. Nó so sánh hai giá trị bằng một toán tử."
            },
            {
                type: "paramTable",
                rows: [
                    { name: "Giá trị A", type: "expression", desc: " Vế trái của phép so sánh (ví dụ: {{ steps.trigger.data.amount }})." },
                    { name: "Toán tử", type: "select", desc: " Logic áp dụng (ví dụ: Bằng, Lớn hơn)." },
                    { name: "Giá trị B", type: "expression", desc: " Vế phải để so sánh (ví dụ: 100)." },
                ]
            },
            {
                type: "h3",
                content: "Các toán tử có sẵn"
            },
            {
                type: "paramTable",
                rows: [
                    { name: "==", type: "equals", desc: "Kiểm tra nếu giá trị bằng nhau." },
                    { name: "!=", type: "not equals", desc: "Kiểm tra nếu giá trị khác nhau." },
                    { name: ">", type: "greater than", desc: "Đúng nếu Giá trị A lớn hơn Giá trị B." },
                    { name: "<", type: "less than", desc: "Đúng nếu Giá trị A nhỏ hơn Giá trị B." },
                    { name: "contains", type: "includes", desc: "Đúng nếu Giá trị A (chuỗi/mảng) chứa Giá trị B." },
                    { name: "matches", type: "regex", desc: "Đúng nếu Giá trị A khớp mẫu Regex trong Giá trị B." },
                ]
            },
            {
                type: "h3",
                content: "Rẽ nhánh"
            },
            {
                type: "prose",
                content: "Luồng chia thành hai nhánh: <strong>True</strong> và <strong>False</strong>. Bạn có thể nối các hành động khác nhau vào mỗi nhánh."
            }
        ]
    },
    {
        id: "switch",
        title: "Switch",
        iconName: "GitBranch",
        description: "Điều hướng luồng tới các đường dẫn khác nhau dựa trên giá trị biến. Giống như if/else đa chiều — gọn gàng hơn khi có nhiều hơn 2 nhánh.",
        blocks: [
            {
                type: "h3",
                content: "Cấu hình"
            },
            {
                type: "prose",
                content: "Chọn biến để đánh giá, sau đó định nghĩa giá trị case cho mỗi nhánh:"
            },
            {
                type: "code",
                id: "switch-example",
                label: "Example",
                code: `Variable:  {{ steps.trigger.data.department }}\n\nCase "engineering"  →  Nhánh Engineering Review\nCase "finance"      →  Nhánh Finance Approval\nCase "legal"        →  Nhánh Legal Review\nDefault             →  Nhánh General Processing`
            },
            {
                type: "h3",
                content: "Hành vi"
            },
            {
                type: "stepList",
                steps: [
                    { title: "So sánh biến", desc: "Biến được so sánh lần lượt với từng giá trị case." },
                    { title: "Khớp đầu tiên", desc: "Đường dẫn của case khớp đầu tiên sẽ được chọn." },
                    { title: "Đường dẫn mặc định", desc: "Nếu không case nào khớp, đường dẫn Default sẽ được chọn." },
                    { title: "Đường ra", desc: "Mỗi case tạo ra một đường ra riêng biệt trong trình thiết kế." },
                ]
            }
        ]
    },
    {
        id: "loop",
        title: "Loop",
        iconName: "Repeat",
        description: "Lặp qua một mảng các item và chạy một tập hợp các bước cho mỗi item. Xử lý danh sách đơn hàng, người dùng, bản ghi, hoặc bất kỳ tập hợp nào.",
        blocks: [
            {
                type: "h3",
                content: "Cấu hình"
            },
            {
                type: "prose",
                content: "Trỏ vòng lặp tới một biến mảng:"
            },
            {
                type: "code",
                id: "loop-config",
                label: "Configuration",
                code: `Items:  {{ steps.FetchOrders.output.data }}`
            },
            {
                type: "h3",
                content: "Bên trong vòng lặp"
            },
            {
                type: "prose",
                content: "Truy cập item hiện tại sử dụng biến <code class='text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground'>item</code>:"
            },
            {
                type: "code",
                id: "loop-item",
                code: `{{ steps.MyLoop.item }}           // Đối tượng item hiện tại\n{{ steps.MyLoop.item.order_id }}  // Một trường trên item hiện tại\n{{ steps.MyLoop.item.total }}     // Trường khác`
            },

        ]
    },
    {
        id: "filter",
        title: "Filter",
        iconName: "Layers",
        description: "Lọc mảng dựa trên điều kiện, tạo ra một mảng mới chỉ chứa các item khớp điều kiện.",
        blocks: [
            {
                type: "prose",
                content: "Sử dụng node Filter để lọc danh sách các mục và chỉ giữ lại những mục khớp với tiêu chí của bạn."
            },
            {
                type: "h3",
                content: "Cấu hình"
            },
            {
                type: "paramTable",
                rows: [
                    { name: "Mảng đầu vào", type: "expression", desc: "Danh sách cần lọc (ví dụ: {{ steps.GetUsers.data }})." },
                    { name: "Loại khớp", type: "enum", desc: "ALL (AND) yêu cầu tất cả điều kiện phải đúng. ANY (OR) yêu cầu ít nhất một điều kiện đúng." },
                ]
            },
            {
                type: "h3",
                content: "Trình tạo điều kiện"
            },
            {
                type: "prose",
                content: "Thêm một hoặc nhiều điều kiện để xác định mục nào cần giữ lại. Với mỗi điều kiện, hãy chỉ định:"
            },
            {
                type: "stepList",
                steps: [
                    { title: "Trường Item", desc: "Thuộc tính trên item để kiểm tra (ví dụ: 'status' hoặc 'price')." },
                    { title: "Toán tử", desc: "Logic kiểm tra (Bằng, Chứa, Lớn hơn, v.v.)." },
                    { title: "Giá trị", desc: "Giá trị để so sánh." },
                ]
            }
        ]
    },
    {
        id: "map",
        title: "Map (Transform)",
        iconName: "Variable",
        description: "Chuyển đổi từng item trong mảng sang cấu trúc mới.",
        blocks: [
            {
                type: "prose",
                content: "Sử dụng Map để chuyển đổi hoặc định hình lại dữ liệu. Nó hoạt động như một trình ánh xạ trực quan, cho phép bạn định nghĩa chính xác cấu trúc đầu ra."
            },
            {
                type: "h3",
                content: "Cấu hình"
            },
            {
                type: "stepList",
                steps: [
                    { title: "Mảng đầu vào (Tùy chọn)", desc: "Nếu được cung cấp, thao tác Map chạy cho mỗi mục trong danh sách này. Nếu để trống, nó chạy một lần cho một đối tượng đơn lẻ." },
                    { title: "Các trường ánh xạ", desc: "Thêm các trường để định nghĩa đối tượng đầu ra. 'Key' là tên thuộc tính mới, và 'Value' là nguồn dữ liệu." },
                ]
            },
            {
                type: "h3",
                content: "Ví dụ"
            },
            {
                type: "paramTable",
                rows: [
                    { name: "Khóa (Đích)", type: "string", desc: "full_name" },
                    { name: "Giá trị (Nguồn)", type: "expression", desc: "{{ item.first_name }} {{ item.last_name }}" },
                ]
            }
        ]
    },
    {
        id: "expressions",
        title: "Cú pháp Expression",
        iconName: "Variable",
        description: "Học cách viết các biểu thức động (expressions) để truy cập dữ liệu và thực hiện tính toán.",
        blocks: [
            {
                type: "h3",
                content: "Cơ bản"
            },
            {
                type: "prose",
                content: "Expression được bao bởi hai dấu ngoặc nhọn <code class='text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground'>{{ }}</code>. Chúng hỗ trợ cú pháp giống JavaScript để truy cập thuộc tính object và phần tử mảng."
            },
            {
                type: "code",
                id: "expr-basic",
                code: `{{ steps.trigger.data.id }}\n{{ steps.MyStep.output.result }}\n{{ steps.MyStep.output.items[0] }}`
            }
        ]
    }
];
