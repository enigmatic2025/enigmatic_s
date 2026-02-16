import { DocSection, SidebarGroup } from "./types";

export const esSidebar: SidebarGroup[] = [
    {
        title: "Primeros Pasos",
        items: [
            { id: "overview", label: "Descripcion General" },
            { id: "concepts", label: "Conceptos Clave" },
            { id: "ai-agents", label: "Agentes de IA (MCP)" },
        ],
    },
    {
        title: "Disparadores",
        items: [
            { id: "trigger-api", label: "Disparador API" },
        ],
    },
    {
        title: "Interaccion Humana",
        items: [
            { id: "human-task", label: "Tarea Humana" },
        ],
    },
    {
        title: "Sistemas Externos",
        items: [
            { id: "wait-for-event", label: "Esperar Evento" },
            { id: "http-request", label: "Solicitud HTTP" },
            { id: "correlation", label: "Senales de Correlacion" },
        ],
    },
    {
        title: "Operaciones de Datos",
        items: [
            { id: "set-variable", label: "Establecer Variable" },
            { id: "condition", label: "Condicion (If/Else)" },
            { id: "switch", label: "Switch" },
            { id: "loop", label: "Bucle" },
            { id: "filter", label: "Filtro" },
            { id: "map", label: "Map (Transformar)" },
        ],
    },
    {
        title: "Expresiones",
        items: [
            { id: "expressions", label: "Sintaxis de Expresiones" },
        ],
    },
];

export const esDocs: DocSection[] = [
    {
        id: "overview",
        title: "Descripcion General",
        iconName: "BookOpen",
        description: "Nodal es una plataforma de orquestacion operativa. Conecta a tu equipo, sistemas y procesos en flujos automatizados que gestionan tu negocio.",
        blocks: [
            {
                type: "h3",
                content: "¿Que es Flow Studio?"
            },
            {
                type: "prose",
                content: "Flow Studio es el disenador visual donde construyes flujos de procesos de negocio. Cada flujo es una secuencia de pasos — disparadores que inician el proceso, tareas asignadas a personas, transformaciones de datos, llamadas API a sistemas externos y logica de decision que dirige el trabajo segun condiciones."
            },
            {
                type: "h3",
                content: "¿Que son los Action Flows?"
            },
            {
                type: "prose",
                content: "Los Action Flows son <strong>instancias en ejecucion</strong> de un flujo. Cuando un flujo se activa — por una llamada API, una programacion o un inicio manual — se crea un Action Flow que rastrea la ejecucion a traves de cada paso. Los miembros del equipo ven sus tareas asignadas en el panel de Action Flows y las completan para avanzar el proceso."
            },
            {
                type: "h3",
                content: "Como se ejecuta un flujo"
            },
            {
                type: "stepList",
                steps: [
                    {
                        title: "El disparador se activa",
                        desc: "Un flujo comienza cuando su disparador se activa — una llamada API, una programacion o un inicio manual.",
                    },
                    {
                        title: "Los pasos se ejecutan en secuencia",
                        desc: "Cada nodo se ejecuta en orden. Los datos fluyen de un paso al siguiente. Las condiciones y switches dirigen la ruta.",
                    },
                    {
                        title: "Se pausa cuando es necesario",
                        desc: "Las Tareas Humanas esperan a que una persona responda. Los nodos Esperar Evento esperan un webhook externo. El flujo se reanuda automaticamente cuando llega la entrada.",
                    },
                    {
                        title: "Se completa o falla",
                        desc: "El flujo llega al final y se completa, o ocurre un error y falla. Todos los datos de ejecucion se registran.",
                    },
                ]
            },

        ]
    },
    {
        id: "concepts",
        title: "Conceptos Clave",
        iconName: "Layers",
        description: "Ideas fundamentales para comprender antes de construir flujos.",
        blocks: [
            {
                type: "conceptGrid",
                concepts: [
                    { iconName: "Play", color: "text-blue-500", title: "Nodos", desc: "Los bloques de construccion de un flujo. Cada nodo realiza una accion — disparar, transformar datos, llamar a una API, asignar una tarea o tomar una decision." },
                    { iconName: "ArrowRight", color: "text-gray-500", title: "Aristas", desc: "Conexiones entre nodos que definen el orden de ejecucion. Los datos fluyen a traves de las aristas de un nodo al siguiente." },
                    { iconName: "Variable", color: "text-purple-500", title: "Expresiones", desc: "Referencias dinamicas a datos de pasos anteriores. Se escriben como {{ steps.NodeId.output.field }} para pasar datos entre nodos." },
                    { iconName: "Layers", color: "text-orange-500", title: "Action Flows", desc: "Una instancia en ejecucion de un flujo. Cada disparador crea un nuevo Action Flow que avanza a traves de los pasos hasta completarse." },
                    { iconName: "User", color: "text-green-500", title: "Humano en el Proceso", desc: "Los flujos pueden pausarse y esperar entrada humana. Los nodos de Tarea Humana asignan trabajo a miembros del equipo que lo completan a traves del panel de Action Flows." },
                    { iconName: "Webhook", color: "text-red-500", title: "Webhooks", desc: "Los sistemas externos pueden reanudar flujos pausados enviando datos a una URL de webhook unica. No se requieren claves API ni IDs." },
                ]
            },

        ]
    },
    {
        id: "ai-agents",
        title: "Agentes de IA (MCP)",
        iconName: "Bot",
        description: "Conecta agentes de IA a la documentacion de Nodal. Disenado para el Model Context Protocol (MCP) y el descubrimiento por LLMs.",
        blocks: [
            {
                type: "h3",
                content: "Descubrimiento (llms.txt)"
            },
            {
                type: "prose",
                content: "Nodal implementa el estandar <code class='text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground'>/llms.txt</code>. Este archivo actua como un manifiesto, guiando a los agentes de IA hacia la documentacion mas relevante sin necesidad de rastrear HTML."
            },
            {
                type: "code",
                id: "agent-llms",
                label: "Discovery URL",
                code: `https://enigmatic.works/llms.txt`
            },
            {
                type: "h3",
                content: "Documentacion Completa (Texto Plano)"
            },
            {
                type: "prose",
                content: "Para LLMs que prefieren un unico archivo de texto plano con toda la documentacion aplanada, usa el endpoint <code class='text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground'>llms-full.txt</code>. Una sola solicitud, toda la documentacion, cero analisis requerido."
            },
            {
                type: "code",
                id: "agent-llms-full",
                label: "Full Docs URL",
                code: `https://enigmatic.works/llms-full.txt`
            },
            {
                type: "h3",
                content: "API JSON Estatica"
            },
            {
                type: "prose",
                content: "Para consumo estructurado, la documentacion esta disponible como archivos JSON estaticos almacenados en cache en el CDN para acceso con latencia cero. No se requieren claves API ni autenticacion."
            },
            {
                type: "paramTable",
                rows: [
                    { name: "Ingles", type: "JSON", desc: "https://enigmatic.works/docs/en.json" },
                    { name: "Vietnamita", type: "JSON", desc: "https://enigmatic.works/docs/vi.json" },
                    { name: "Chino Tradicional", type: "JSON", desc: "https://enigmatic.works/docs/zh-TW.json" },
                ]
            },

        ]
    },
    {
        id: "trigger-api",
        title: "Disparador API",
        iconName: "Globe",
        description: "Inicia un flujo mediante HTTP POST. Usa esto para integrar sistemas externos, construir pipelines de automatizacion o crear flujos de trabajo basados en eventos.",
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
                content: "El <code class='text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground'>flowId</code> es el identificador unico del flujo publicado. Puedes encontrarlo en la URL de Flow Studio o en la configuracion del flujo."
            },
            {
                type: "h3",
                content: "Cuerpo de la solicitud"
            },
            {
                type: "prose",
                content: "Envia cualquier payload JSON. Los campos que envies estaran disponibles para todos los pasos posteriores a traves de expresiones."
            },
            {
                type: "code",
                id: "api-trigger-body",
                label: "JSON",
                code: `{\n  "order_id": "ORD-12345",\n  "customer_name": "Acme Corp",\n  "total": 2499.00,\n  "priority": "high"\n}`
            },
            {
                type: "h3",
                content: "Opciones de configuracion"
            },
            {
                type: "paramTable",
                rows: [
                    { name: "schema", type: "SchemaField[]", desc: "Define los campos esperados del payload con tipos e indicadores de obligatoriedad." },
                    { name: "instanceNameTemplate", type: "string", desc: "Titulo dinamico para la instancia de Action Flow. Soporta expresiones." },
                    { name: "defaultPriority", type: "enum", desc: "Nivel de prioridad: low, medium, high o critical." },
                    { name: "instanceDescriptionTemplate", type: "string", desc: "Instrucciones mostradas a los usuarios en el panel de Action Flows." },
                ]
            },
            {
                type: "h3",
                content: "Acceder a los datos del disparador"
            },
            {
                type: "code",
                id: "api-trigger-access",
                code: `{{ steps.trigger.data.order_id }}     // "ORD-12345"\n{{ steps.trigger.data.customer_name }} // "Acme Corp"\n{{ steps.trigger.data.total }}         // 2499.00`
            },
            {
                type: "h3",
                content: "Ejemplo: cURL"
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
        title: "Tarea Humana",
        iconName: "User",
        description: "Pausa el flujo y asigna trabajo a una persona. El flujo se reanuda cuando el asignado completa la tarea a traves del panel de Action Flows.",
        blocks: [
            {
                type: "h3",
                content: "Como funciona"
            },
            {
                type: "stepList",
                steps: [
                    { title: "El flujo llega al nodo de Tarea Humana", desc: "El flujo se pausa y crea un registro de tarea. La tarea aparece en el panel de Action Flows del asignado." },
                    { title: "El asignado revisa y responde", desc: "El asignado ve el titulo de la tarea, las instrucciones y un formulario para completar. Puede revisar el contexto de pasos anteriores." },
                    { title: "El flujo se reanuda con la respuesta", desc: "Cuando el asignado envia su respuesta, el flujo continua. Los datos del formulario estan disponibles para los pasos posteriores." },
                ]
            },
            {
                type: "h3",
                content: "Configuracion"
            },
            {
                type: "paramTable",
                rows: [
                    { name: "title", type: "string", desc: "Titulo de la tarea mostrado al asignado. Soporta expresiones para titulos dinamicos." },
                    { name: "instructions", type: "rich text", desc: "Instrucciones detalladas en HTML. Explica lo que el asignado necesita hacer." },
                    { name: "assignments", type: "User[]", desc: "Uno o mas miembros del equipo que veran y podran completar la tarea." },
                    { name: "schema", type: "FormField[]", desc: "Campos del formulario que el asignado debe completar (texto, numero, fecha, calificacion, firma, etc.)." },
                ]
            },
            {
                type: "h3",
                content: "Tipos de campos de formulario"
            },
            {
                type: "prose",
                content: "Los siguientes tipos de campo son compatibles: Text, Long Text, Number, Rating, Boolean, Date, Time, DateTime, File, Multiple Choice, Checkboxes, Signature."
            },
            {
                type: "h3",
                content: "Titulos dinamicos con expresiones"
            },
            {
                type: "prose",
                content: "Usa expresiones para crear titulos de tareas con contexto:"
            },
            {
                type: "code",
                id: "ht-title",
                code: `Review order {{ steps.trigger.data.order_id }} for {{ steps.trigger.data.customer_name }}`
            },
            {
                type: "prose",
                content: "Esto produce titulos como <strong>&ldquo;Review order ORD-12345 for Acme Corp&rdquo;</strong>."
            },
            {
                type: "h3",
                content: "Acceder a las respuestas de la tarea"
            },
            {
                type: "code",
                id: "ht-output",
                code: `// The assignee's form responses are available as:\n{{ steps.ReviewTask.output.approval }}    // "approved"\n{{ steps.ReviewTask.output.comments }}    // "Looks good"\n{{ steps.ReviewTask.output.rating }}      // 5`
            },

        ]
    },
    {
        id: "wait-for-event",
        title: "Esperar Evento",
        iconName: "Webhook",
        description: "Pausa el flujo y espera a que un sistema externo envie datos a traves de una URL de webhook unica. No se requiere autenticacion, IDs ni payloads complejos.",
        blocks: [
            {
                type: "h3",
                content: "Como funciona"
            },
            {
                type: "stepList",
                steps: [
                    { title: "El flujo llega al nodo Esperar Evento", desc: "El flujo se pausa y genera una URL de webhook unica y de un solo uso." },
                    { title: "La URL del webhook se envia al sistema externo", desc: "Usa un nodo de Solicitud HTTP o Email previo para pasar la URL del webhook al sistema externo." },
                    { title: "El sistema externo envia datos por POST", desc: "El sistema externo envia una solicitud POST con datos JSON a la URL del webhook." },
                    { title: "El flujo se reanuda", desc: "El flujo continua con los datos recibidos disponibles para todos los pasos posteriores." },
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
                content: "El <code class='text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground'>{token}</code> es un UUID unico generado para cada ejecucion de flujo. No se requieren encabezados de autenticacion — el token en si mismo autentica la solicitud. Cada URL es de un solo uso."
            },
            {
                type: "h3",
                content: "Formato de la solicitud"
            },
            {
                type: "prose",
                content: "Envia cualquier cuerpo JSON. Todo el payload queda disponible para los pasos posteriores."
            },
            {
                type: "code",
                id: "wfe-payload",
                label: "JSON",
                code: `{\n  "payment_status": "confirmed",\n  "amount": 149.99,\n  "transaction_id": "txn_abc123"\n}`
            },
            {
                type: "h3",
                content: "Respuesta"
            },
            {
                type: "code",
                id: "wfe-response",
                label: "Response 200",
                code: `{\n  "status": "ok",\n  "message": "Workflow resumed successfully"\n}`
            },
            {
                type: "h3",
                content: "Ejemplo: cURL"
            },
            {
                type: "code",
                id: "wfe-curl",
                label: "Bash",
                code: `curl -X POST https://enigmatic.works/api/webhooks/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "payment_status": "confirmed",\n    "amount": 149.99\n  }'`
            },
            {
                type: "h3",
                content: "Acceder a la URL del webhook en tu flujo"
            },
            {
                type: "prose",
                content: "Cuando el nodo se pausa, genera la URL unica del webhook. Haz referencia a ella en pasos anteriores para pasarla al sistema externo:"
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
        title: "Solicitud HTTP",
        iconName: "Send",
        description: "Realiza solicitudes HTTP a APIs externas. Llama a servicios de terceros, obtiene datos o envia notificaciones como parte de tu flujo.",
        blocks: [
            {
                type: "h3",
                content: "Configuracion"
            },
            {
                type: "paramTable",
                rows: [
                    { name: "method", type: "enum", desc: "Metodo HTTP: GET, POST, PUT, DELETE o PATCH." },
                    { name: "url", type: "string", desc: "La URL del endpoint. Soporta expresiones para URLs dinamicas." },
                    { name: "headers", type: "KeyValue[]", desc: "Encabezados HTTP personalizados (ej., Authorization, claves API)." },
                    { name: "params", type: "KeyValue[]", desc: "Parametros de consulta de la URL." },
                    { name: "body", type: "JSON", desc: "Cuerpo de la solicitud para POST/PUT/PATCH. Soporta expresiones." },
                ]
            },
            {
                type: "h3",
                content: "Ejemplo: Llamar a una API externa"
            },
            {
                type: "code",
                id: "http-example",
                label: "Configuration",
                code: `Method:  POST\nURL:     https://api.example.com/orders/{{ steps.trigger.data.order_id }}\nHeaders: Authorization: Bearer {{ steps.GetToken.output.token }}\nBody:    {\n           "status": "confirmed",\n           "amount": {{ steps.trigger.data.total }}\n         }`
            },
            {
                type: "h3",
                content: "Salida"
            },
            {
                type: "prose",
                content: "La respuesta se analiza automaticamente y esta disponible para los pasos posteriores:"
            },
            {
                type: "code",
                id: "http-output",
                code: `{{ steps.CallAPI.output.status }}       // 200\n{{ steps.CallAPI.output.data }}         // Parsed JSON response body\n{{ steps.CallAPI.output.data.result }}  // Nested field access`
            },

        ]
    },
    {
        id: "correlation",
        title: "Senales de Correlacion",
        iconName: "Globe",
        description: "Para casos de uso avanzados donde multiples instancias de flujo escuchan el mismo tipo de evento. Usa coincidencia por correlacion para apuntar a la instancia correcta.",
        blocks: [
            {
                type: "h3",
                content: "Cuando usarlo"
            },
            {
                type: "stepList",
                steps: [
                    { title: "Multiples instancias", desc: "Multiples instancias de flujo esperando el mismo tipo de evento (ej., 'OrderPaid')" },
                    { title: "Difusion", desc: "El sistema externo difunde eventos sin saber a que flujo apuntar" },
                    { title: "Coincidencia", desc: "Necesitas hacer coincidencia por claves de negocio (ej., order_id, customer_id)" },
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
                content: "Formato de la solicitud"
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
                    { name: "event", type: "string", desc: "El nombre del evento configurado en el nodo Esperar Evento. Por defecto es \"default\"." },
                    { name: "data", type: "object", desc: "Pares clave-valor que se comparan con los criterios de correlacion del flujo. Todos los criterios deben coincidir (logica AND)." },
                ]
            },
            {
                type: "h3",
                content: "Logica de coincidencia"
            },
            {
                type: "stepList",
                steps: [
                    { title: "Buscar suscripciones activas", desc: "El sistema busca todas las suscripciones activas que coincidan con el nombre del evento." },
                    { title: "Verificar criterios", desc: "Para cada suscripcion, cada clave de criterio configurada debe existir en los datos de la senal con el mismo valor." },
                    { title: "Reanudar coincidencias", desc: "Todos los flujos que coincidan se reanudan. Una senal puede reanudar multiples instancias de flujo." },
                ]
            },
            {
                type: "h3",
                content: "Respuesta"
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
        title: "Establecer Variable",
        iconName: "Variable",
        description: "Crea o actualiza variables dentro del flujo. Almacena valores calculados, renombra campos o prepara datos para los pasos posteriores.",
        blocks: [
            {
                type: "h3",
                content: "Variable unica"
            },
            {
                type: "prose",
                content: "Establece una variable con un nombre y un valor. El valor puede ser estatico o una expresion."
            },
            {
                type: "code",
                id: "var-single",
                label: "Configuration",
                code: `Variable Name:  total_with_tax\nValue:          {{ steps.trigger.data.total * 1.13 }}`
            },
            {
                type: "h3",
                content: "Multiples variables"
            },
            {
                type: "prose",
                content: "Establece varias variables a la vez en un solo nodo:"
            },
            {
                type: "code",
                id: "var-multi",
                label: "Configuration",
                code: `customer_name  →  {{ steps.trigger.data.name }}\norder_total    →  {{ steps.trigger.data.total }}\nstatus         →  "pending_review"`
            },
            {
                type: "h3",
                content: "Salida"
            },
            {
                type: "prose",
                content: "Las variables estan disponibles para todos los pasos posteriores:"
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
        title: "Condicion (If/Else)",
        iconName: "GitBranch",
        description: "Bifurca el flujo segun una condicion logica. Dirige el trabajo por la ruta Verdadera o la ruta Falsa.",
        blocks: [
            {
                type: "h3",
                content: "Configuracion"
            },
            {
                type: "prose",
                content: "El nodo de Condicion usa un constructor visual para definir la logica. Compara dos valores usando un operador."
            },
            {
                type: "paramTable",
                rows: [
                    { name: "Valor A", type: "expression", desc: "El lado izquierdo de la comparacion (ej., {{ steps.trigger.data.amount }})." },
                    { name: "Operador", type: "select", desc: "La logica a aplicar (ej., Es Igual A, Es Mayor Que)." },
                    { name: "Valor B", type: "expression", desc: "El lado derecho con el que comparar (ej., 100)." },
                ]
            },
            {
                type: "h3",
                content: "Operadores disponibles"
            },
            {
                type: "paramTable",
                rows: [
                    { name: "==", type: "equals", desc: "Verifica si los valores son identicos." },
                    { name: "!=", type: "not equals", desc: "Verifica si los valores son diferentes." },
                    { name: ">", type: "greater than", desc: "Verdadero si el Valor A es estrictamente mayor que el Valor B." },
                    { name: "<", type: "less than", desc: "Verdadero si el Valor A es estrictamente menor que el Valor B." },
                    { name: "contains", type: "includes", desc: "Verdadero si el Valor A (cadena/arreglo) contiene el Valor B." },
                    { name: "matches", type: "regex", desc: "Verdadero si el Valor A coincide con la Expresion Regular en el Valor B." },
                ]
            },
            {
                type: "h3",
                content: "Bifurcacion"
            },
            {
                type: "prose",
                content: "El flujo se divide en dos rutas: <strong>Verdadera</strong> y <strong>Falsa</strong>. Puedes conectar diferentes acciones a cada ruta."
            }
        ]
    },
    {
        id: "switch",
        title: "Switch",
        iconName: "GitBranch",
        description: "Dirige el flujo a diferentes rutas segun el valor de una variable. Como un if/else multiple — mas limpio cuando tienes mas de dos ramas.",
        blocks: [
            {
                type: "h3",
                content: "Configuracion"
            },
            {
                type: "prose",
                content: "Establece la variable a evaluar, luego define los valores de caso para cada rama:"
            },
            {
                type: "code",
                id: "switch-example",
                label: "Example",
                code: `Variable:  {{ steps.trigger.data.department }}\n\nCase "engineering"  →  Engineering Review path\nCase "finance"      →  Finance Approval path\nCase "legal"        →  Legal Review path\nDefault             →  General Processing path`
            },
            {
                type: "h3",
                content: "Comportamiento"
            },
            {
                type: "stepList",
                steps: [
                    { title: "Comparacion de variable", desc: "La variable se compara con cada valor de caso en orden." },
                    { title: "Primera coincidencia", desc: "Se sigue la ruta del primer caso que coincida." },
                    { title: "Ruta por defecto", desc: "Si ningun caso coincide, se sigue la ruta por defecto." },
                    { title: "Arista de salida", desc: "Cada caso crea una arista de salida separada en el disenador de flujos." },
                ]
            }
        ]
    },
    {
        id: "loop",
        title: "Bucle",
        iconName: "Repeat",
        description: "Itera sobre un arreglo de elementos y ejecuta un conjunto de pasos para cada uno. Procesa listas de ordenes, usuarios, registros o cualquier coleccion.",
        blocks: [
            {
                type: "h3",
                content: "Configuracion"
            },
            {
                type: "prose",
                content: "Apunta el bucle a una variable de tipo arreglo:"
            },
            {
                type: "code",
                id: "loop-config",
                label: "Configuration",
                code: `Items:  {{ steps.FetchOrders.output.data }}`
            },
            {
                type: "h3",
                content: "Dentro del bucle"
            },
            {
                type: "prose",
                content: "Accede al elemento actual usando la variable <code class='text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground'>item</code>:"
            },
            {
                type: "code",
                id: "loop-item",
                code: `{{ steps.MyLoop.item }}           // The current item object\n{{ steps.MyLoop.item.order_id }}  // A field on the current item\n{{ steps.MyLoop.item.total }}     // Another field`
            },

        ]
    },
    {
        id: "filter",
        title: "Filtro",
        iconName: "Layers",
        description: "Filtra un arreglo segun condiciones, creando un nuevo arreglo con solo los elementos que coincidan.",
        blocks: [
            {
                type: "prose",
                content: "Usa el nodo Filtro para reducir una lista de elementos a solo aquellos que cumplan con tus criterios."
            },
            {
                type: "h3",
                content: "Configuracion"
            },
            {
                type: "paramTable",
                rows: [
                    { name: "Variable de Arreglo", type: "expression", desc: "La lista a filtrar (ej. {{ steps.GetUsers.data }})." },
                    { name: "Tipo de Coincidencia", type: "enum", desc: "ALL (AND) requiere que todas las condiciones sean verdaderas. ANY (OR) requiere al menos una." },
                ]
            },
            {
                type: "h3",
                content: "Constructor de Condiciones"
            },
            {
                type: "prose",
                content: "Agrega una o mas condiciones para definir que elementos conservar. Para cada condicion, especifica:"
            },
            {
                type: "stepList",
                steps: [
                    { title: "Campo del Elemento", desc: "La propiedad del elemento a verificar (ej. 'status' o 'price')." },
                    { title: "Operador", desc: "La logica (Igual, Contiene, Mayor Que, etc.)." },
                    { title: "Valor", desc: "El valor con el que comparar." },
                ]
            }
        ]
    },
    {
        id: "map",
        title: "Map (Transformar)",
        iconName: "Variable",
        description: "Transforma cada elemento de un arreglo a una nueva estructura.",
        blocks: [
            {
                type: "prose",
                content: "Usa Map para transformar o reestructurar datos. Actua como un mapeador visual, permitiendote definir exactamente como debe lucir la estructura de salida."
            },
            {
                type: "h3",
                content: "Configuracion"
            },
            {
                type: "stepList",
                steps: [
                    { title: "Arreglo de Entrada (Opcional)", desc: "Si se proporciona, la operacion Map se ejecuta para cada elemento de esta lista. Si se deja vacio, se ejecuta una vez para un solo objeto." },
                    { title: "Campos de Mapeo", desc: "Agrega campos para definir el objeto de salida. La 'Clave' es el nombre de tu nueva propiedad, y el 'Valor' es la fuente de datos." },
                ]
            },
            {
                type: "h3",
                content: "Ejemplo"
            },
            {
                type: "paramTable",
                rows: [
                    { name: "Clave (Destino)", type: "string", desc: "full_name" },
                    { name: "Valor (Fuente)", type: "expression", desc: "{{ item.first_name }} {{ item.last_name }}" },
                ]
            }
        ]
    },
    {
        id: "expressions",
        title: "Sintaxis de Expresiones",
        iconName: "Variable",
        description: "Aprende a escribir expresiones dinamicas para acceder a datos y realizar calculos.",
        blocks: [
            {
                type: "h3",
                content: "Conceptos basicos"
            },
            {
                type: "prose",
                content: "Las expresiones se envuelven en dobles llaves <code class='text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground'>{{ }}</code>. Soportan sintaxis similar a JavaScript para acceder a propiedades de objetos y elementos de arreglos."
            },
            {
                type: "code",
                id: "expr-basic",
                code: `{{ steps.trigger.data.id }}\n{{ steps.MyStep.output.result }}\n{{ steps.MyStep.output.items[0] }}`
            }
        ]
    }
];
