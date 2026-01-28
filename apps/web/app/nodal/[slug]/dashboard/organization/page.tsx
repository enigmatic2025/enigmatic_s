"use client";


import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { 
  Users, 
  Shield, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Mail,
  Building2,
  Trash2,
  Settings,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { organizationService, OrganizationMember, Team } from "@/services/organization-service";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function OrganizationPage() {
  const { slug } = useParams(); // Start simple, assume slug maps to org (frontend context usually has currentOrg object too)
  
  const [activeTab, setActiveTab] = useState("members");
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Team State
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");

  // Helper to resolve org ID from slug (Quick Hack for MVP)
  // Ideally this is in a context
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
      // Fetch Org ID by slug
      // We can use the admin/orgs list filtered? No.
      // Let's generic fetch "/api/admin/orgs" and find matches? (Inefficient)
      // BETTER: Add an endpoint /api/orgs/by-slug/:slug.
      // OR: Just assume the user context has it. 
      // Let's try to fetch user profile, which has memberships, find the org with this slug.
      // This is complicated for a single file edit.
      // I will assume for now we can get it or I will query `flowService.getFlows` which returns flow data... no.
      
      // Let's just fetch all orgs (standard user might not be able to).
      // I will add a special useEffect to "bootstrap" the org ID.
      async function load() {
          try {
             // 1. Get Org ID
             // Hack: use existing flows endpoint or similar to infer? 
             // Or better: Use the `useFlowStore` or similar?
             // Let's assume there is a `/api/organization/lookup?slug=` endpoint. 
             // I'll add this endpoint quickly or just fetch specific known org.
             // Wait, I can't easily add an endpoint without recompiling backend.
             // Backend is Go. 
             
             // ALTERNATIVE: Use the `ActionFlowList` page logic? 
             // It fetches `/api/action-flows`.
             // Maybe I can fetch `/api/admin/orgs` if I'm admin? 
             
             // Simplest: Find org by Slug from the client side `currentOrg` if accessible?
             // `sidebar-navigation` received `currentOrg` as prop.
             // `layout.tsx` likely fetches it.
             // Can I use `useOutletContext`? 
             
             // NOTE: If this fails with syntax error, it's likely the backend is returning the "Hello World" text 200 OK 
             // because the new route isn't registered yet (restart backend!).
             const orgRes = await apiClient.get(`/api/orgs/lookup?slug=${slug}`);
             
             if(orgRes.ok) {
                 const contentType = orgRes.headers.get("content-type");
                 if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Backend returned non-JSON response. Please restart your backend server to apply the new routes.");
                 }
                 const orgData = await orgRes.json();
                 setOrgId(orgData.id);
                 
                 // 2. Fetch Members & Teams
                 const [m, t] = await Promise.all([
                     organizationService.getMembers(orgData.id),
                     organizationService.getTeams(orgData.id)
                 ]);
                 setMembers(m);
                 setTeams(t);
             }
          } catch(e) {
              console.error(e);
          } finally {
              setLoading(false);
          }
      }
      if(slug) load();
  }, [slug]);

  const handleCreateTeam = async () => {
      if(!orgId || !newTeamName) return;
      try {
          await organizationService.createTeam(orgId, { name: newTeamName, description: newTeamDesc });
          toast.success("Team created");
          setIsTeamModalOpen(false);
          // Refresh
          const t = await organizationService.getTeams(orgId);
          setTeams(t);
      } catch(e) {
          toast.error("Failed to create team");
      }
  };

  if(loading) return <div className="h-full w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="h-full w-full space-y-6">
       {/* Header */}
       <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-4">
            <h1 className="text-xl font-medium tracking-tight text-foreground">
                Organization
            </h1>
            <span className="text-secondary-foreground/60 text-sm font-medium">
                Manage your people and teams
            </span>
          </div>
          
          <Dialog open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1.5 shadow-none">
                    <Plus className="h-3.5 w-3.5" />
                    {activeTab === "members" ? "Invite Member" : "Create Team"}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{activeTab === "members" ? "Invite Member" : "Create Team"}</DialogTitle>
                    <DialogDescription>
                        {activeTab === "members" ? "Send an invitation to a new member." : "Create a new team to organize your people."}
                    </DialogDescription>
                </DialogHeader>
                
                {activeTab === "teams" && (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Team Name</Label>
                            <Input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="e.g. Engineering" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={newTeamDesc} onChange={e => setNewTeamDesc(e.target.value)} placeholder="What is this team for?" />
                        </div>
                    </div>
                )}
                
                <DialogFooter>
                    <Button onClick={handleCreateTeam}>Create</Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
       </div>

       <Tabs defaultValue="members" className="w-full" onValueChange={setActiveTab}>
          {/* ... (Keep TabsList same) ... */}
          <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-muted/50 p-1 h-auto rounded-lg gap-1">
                  <TabsTrigger 
                    value="members" 
                    className="px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                  >
                    Members
                  </TabsTrigger>
                  <TabsTrigger 
                    value="teams" 
                    className="px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                  >
                    Teams
                  </TabsTrigger>
              </TabsList>

              <div className="relative w-64">
                 <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                 <Input 
                    placeholder={activeTab === "members" ? "Search members..." : "Search teams..."} 
                    className="pl-8 h-8 text-xs bg-background border-input shadow-none focus-visible:ring-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
          </div>

          <TabsContent value="members" className="outline-none">
             <div className="border rounded-lg bg-card/40 overflow-hidden">
                <table className="w-full text-left text-sm">
                   <thead>
                      <tr className="border-b bg-muted/40">
                         <th className="h-10 px-4 font-medium text-muted-foreground text-[11px] uppercase tracking-wider w-[300px]">User</th>
                         <th className="h-10 px-4 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Role</th>
                         <th className="h-10 px-4 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Teams</th>
                         <th className="h-10 px-4 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Status</th>
                         <th className="h-10 px-4 w-[50px]"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y">
                      {members.map((member, i) => (
                         <tr key={i} className="group hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                   <Avatar className="h-8 w-8 border bg-muted/50">
                                      {/* Parse Initials */}
                                      <AvatarFallback className="text-[10px] text-muted-foreground font-medium">
                                          {member.profiles?.full_name?.split(' ').map(n => n[0]).join('').substring(0,2) || "??"}
                                      </AvatarFallback>
                                   </Avatar>
                                   <div className="flex flex-col gap-0.5">
                                      <span className="font-medium text-foreground">{member.profiles?.full_name || "Unknown"}</span>
                                      <span className="text-xs text-muted-foreground">{member.profiles?.email}</span>
                                   </div>
                                </div>
                            </td>
                            <td className="p-4">
                               <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground border px-2 py-1 rounded-md w-fit bg-background">
                                  <Shield className="h-3 w-3" />
                                  {member.role}
                               </div>
                            </td>
                            <td className="p-4">
                               <div className="flex flex-wrap gap-1.5">
                                  {/* Placeholder for member teams until we fetch them */}
                                  <span className="text-xs text-muted-foreground italic">None</span>
                               </div>
                            </td>
                            <td className="p-4">
                               <Badge variant="outline" className="font-normal rounded-sm px-2 text-emerald-600 border-emerald-200 bg-emerald-50">
                                  Active
                               </Badge>
                            </td>
                            <td className="p-4 text-right">
                               <DropdownMenu>
                                 <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                       <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                 </DropdownMenuTrigger>
                                 <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem>Edit Role</DropdownMenuItem>
                                    <DropdownMenuItem>Manage Teams</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive focus:text-destructive">Remove</DropdownMenuItem>
                                 </DropdownMenuContent>
                               </DropdownMenu>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </TabsContent>

          <TabsContent value="teams" className="outline-none">
             <div className="grid grid-cols-3 gap-4">
                 {teams.map(team => (
                    <div key={team.id} className="group flex flex-col justify-between border rounded-lg p-5 bg-card hover:border-primary/50 transition-all cursor-pointer space-y-4">
                        <div className="space-y-2">
                           <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-foreground tracking-tight">{team.name}</h3>
                              <Building2 className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                           </div>
                           <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {team.description || "No description."}
                           </p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-dashed">
                           <div className="flex items-center gap-2">
                              {/* Member Avatars placeholder */}
                              <div className="flex -space-x-2 overflow-hidden">
                                  {[...Array(0)].map((_, i) => (
                                      <div key={i} className="" />
                                  ))}
                              </div>
                              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                  {team.member_count || 0} Members
                              </span>
                           </div>
                           <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                               <Settings className="h-3.5 w-3.5" />
                           </Button>
                        </div>
                    </div>
                 ))}
             </div>
          </TabsContent>
       </Tabs>
    </div>
  );
}
