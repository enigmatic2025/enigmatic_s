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
import { Plus, Search, ArrowUpDown, MoreHorizontal } from "lucide-react";

const integrations = [
  {
    id: "google",
    name: "Google Workspace",
    description: "Connect Gmail, Drive, Calendar, and Sheets.",
    icon: "https://cdn.simpleicons.org/google",
    status: "active",
    category: "Productivity",
  },
  {
    id: "microsoft",
    name: "Microsoft 365",
    description: "Integration for Outlook, Teams, and OneDrive.",
    icon: "https://cdn.simpleicons.org/microsoft365",
    status: "active",
    category: "Productivity",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Send notifications and manage channels.",
    icon: "https://cdn.simpleicons.org/slack",
    status: "active",
    category: "Communication",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Sync databases and pages with your action flows.",
    icon: "https://cdn.simpleicons.org/notion",
    status: "active",
    category: "Productivity",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Trigger Zaps from your Nodal action flows.",
    icon: "https://cdn.simpleicons.org/zapier",
    status: "active",
    category: "Automation",
  },
  {
    id: "n8n",
    name: "n8n",
    description: "Connect to your self-hosted n8n instances.",
    icon: "https://cdn.simpleicons.org/n8n",
    status: "active",
    category: "Automation",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "CRM and customer success platform.",
    icon: "https://cdn.simpleicons.org/salesforce",
    status: "coming_soon",
    category: "CRM",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Marketing, sales, and service platform.",
    icon: "https://cdn.simpleicons.org/hubspot",
    status: "active",
    category: "CRM",
  },
];

const myIntegrations = [
  {
    id: "google-oauth",
    name: "Google Workspace – Admin",
    createdBy: "bubblematchatee@gmail.com",
    dateCreated: "1 second ago",
    icon: "https://cdn.simpleicons.org/google",
    status: "Connected",
  },
  {
    id: "slack-bot",
    name: "Slack – Nodal Bot",
    createdBy: "admin@nodal.com",
    dateCreated: "2 days ago",
    icon: "https://cdn.simpleicons.org/slack",
    status: "Disconnected",
  },
];

export default function IntegrationPage() {
  return (
    <div className="h-full w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium tracking-tight">Integrations</h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add integration
        </Button>
      </div>

      <Tabs defaultValue="discover" className="w-full space-y-6">
        <TabsList className="bg-muted p-1 rounded-lg h-auto inline-flex">
          <TabsTrigger
            value="discover"
            className="rounded-md px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Discover
          </TabsTrigger>
          <TabsTrigger
            value="mine"
            className="rounded-md px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
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
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {integrations.map((integration) => (
              <Card
                key={integration.id}
                className="shadow-none hover:bg-muted/50 transition-colors cursor-pointer border-border"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 p-3">
                  <div className="h-8 w-8 rounded-md border bg-background p-1.5 flex items-center justify-center">
                    <img
                      src={integration.icon}
                      alt={integration.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  {integration.status === "coming_soon" && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-5 px-1.5"
                    >
                      Coming soon
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex items-center justify-between mb-1">
                    <CardTitle className="text-sm font-medium">
                      {integration.name}
                    </CardTitle>
                    <span className="text-[10px] text-muted-foreground border px-1.5 py-0.5 rounded-full">
                      {integration.category}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2 text-xs">
                    {integration.description}
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
                placeholder="Search integrations..."
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
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border-none">
            <Table>
              <TableHeader className="border-none">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="w-[300px] pl-0">Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created by</TableHead>
                  <TableHead>Date created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myIntegrations.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-none hover:bg-muted/50"
                  >
                    <TableCell className="font-medium pl-0">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md border bg-background p-1.5 flex items-center justify-center">
                          <img
                            src={item.icon}
                            alt={item.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          item.status === "Connected"
                            ? "text-green-600 border-green-600/20 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                            : "text-muted-foreground"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.createdBy}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.dateCreated}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
