"use client";

import { useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  FileText,
  Users,
  TrendingUp,
  Truck,
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

import { Link } from "@/navigation";
import { FlowTable } from "@/components/flow-studio/flow-table";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useParams } from "next/navigation";

export default function FlowStudioPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
        fetchFlows();
    }
  }, [slug]);

  const fetchFlows = async () => {
    try {
        setLoading(true);
        const res = await apiClient.get(`/flows?slug=${slug}`);
        if (res.ok) {
            const data = await res.json();
            setFlows(data);
        } else {
            console.error("Failed to load flows", res.status);
            toast.error("Failed to load flows");
        }
    } catch (error) {
        console.error("Error loading flows", error);
        toast.error("Error loading flows");
    } finally {
        setLoading(false);
    }
  };

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

      <Tabs defaultValue="templates" className="w-full space-y-6">
        <TabsList className="bg-muted p-1 rounded-lg h-auto inline-flex">
          <TabsTrigger
            value="templates"
            className="rounded-md px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground shadow-none"
          >
            Templates
          </TabsTrigger>
          <TabsTrigger
            value="draft"
            className="rounded-md px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground shadow-none"
          >
            Draft
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="rounded-md px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground shadow-none"
          >
            Active
          </TabsTrigger>
          <TabsTrigger
            value="inactive"
            className="rounded-md px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground shadow-none"
          >
            Inactive
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

        <TabsContent value="draft" className="space-y-4">
            <FlowTable initialFlows={flows.filter((f: any) => !f.is_active && !f.published_at)} slug={slug} isLoading={loading} />
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
            <FlowTable initialFlows={flows.filter((f: any) => f.is_active)} slug={slug} isLoading={loading} />
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
            <FlowTable initialFlows={flows.filter((f: any) => !f.is_active && f.published_at)} slug={slug} isLoading={loading} />
        </TabsContent>

      </Tabs>
    </div>
  );
}
