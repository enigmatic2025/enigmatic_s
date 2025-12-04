import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  ArrowUpDown,
  LayoutTemplate,
  FileText,
  Users,
  CreditCard,
  MoreHorizontal,
  PlayCircle,
  Truck,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

const templates = [
  {
    id: "driver-retention",
    name: "Driver Retention Monitor",
    description:
      "Analyze driver satisfaction and hours to predict turnover risk.",
    icon: Users,
    category: "Workforce",
  },
  {
    id: "delay-alerts",
    name: "Shipment Delay Alerts",
    description:
      "Notify customers via SMS/Email when a shipment is flagged as delayed.",
    icon: Truck,
    category: "Operations",
  },
  {
    id: "bol-extraction",
    name: "BOL Data Extraction",
    description: "Extract key data from Bill of Lading PDFs and sync to TMS.",
    icon: FileText,
    category: "Automation",
  },
  {
    id: "spot-rate",
    name: "Spot Rate Calculator",
    description:
      "Auto-calculate spot quotes based on lane history and market indices.",
    icon: TrendingUp,
    category: "Sales",
  },
];

const myFlows = [
  {
    id: "flow-1",
    name: "New Order Sync",
    status: "Running",
    lastRun: "2 mins ago",
    trigger: "Shopify Webhook",
  },
  {
    id: "flow-2",
    name: "Weekly Report Generation",
    status: "Scheduled",
    lastRun: "5 days ago",
    trigger: "Schedule (Weekly)",
  },
  {
    id: "flow-3",
    name: "Lead Enrichment",
    status: "Disabled",
    lastRun: "1 hour ago",
    trigger: "HubSpot Event",
  },
  {
    id: "flow-4",
    name: "Draft: Invoice Processing",
    status: "Draft",
    lastRun: "Never",
    trigger: "Manual",
  },
];

import Link from "next/link";

import { FlowTable } from "@/components/flow-studio/flow-table";

export default async function FlowStudioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch flows from backend
  let flows = [];
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8001";
    const res = await fetch(`${backendUrl}/flows?slug=${slug}`, {
      cache: "no-store",
    });
    if (res.ok) {
      flows = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch flows:", error);
  }

  return (
    <div className="h-full w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium tracking-tight">Flow Studio</h1>
        <Link href={`/nodal/${slug}/dashboard/flow-studio/design`}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Flow
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="mine" className="w-full space-y-6">
        <TabsList className="bg-muted p-1 rounded-lg h-auto inline-flex">
          <TabsTrigger
            value="templates"
            className="rounded-md px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Templates
          </TabsTrigger>
          <TabsTrigger
            value="mine"
            className="rounded-md px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Flows
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-9 bg-background border-input shadow-none"
              />
            </div>
            <Select defaultValue="popular">
              <SelectTrigger className="w-[180px] bg-background shadow-none">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="shadow-none hover:bg-muted/50 transition-colors cursor-pointer group border-border"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 p-3">
                  <div className="h-8 w-8 rounded-md border bg-background p-1.5 flex items-center justify-center text-primary group-hover:text-foreground transition-colors">
                    <template.icon className="h-full w-full" />
                  </div>
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                    {template.category}
                  </Badge>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <CardTitle className="text-sm font-medium mb-1">
                    {template.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">
                    {template.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mine" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search flows..."
                className="pl-9 bg-background border-input shadow-none"
              />
            </div>
            <Select defaultValue="recent">
              <SelectTrigger className="w-[180px] bg-background shadow-none">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <FlowTable initialFlows={flows} slug={slug} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
