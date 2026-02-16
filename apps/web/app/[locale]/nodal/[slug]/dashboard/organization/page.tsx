"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";

import { apiClient } from "@/lib/api-client";
import {
  Shield,
  Search,
  Plus,
  MoreHorizontal,
  Building2,
  Trash2,
  Loader2,
  UserPlus,
  ChevronRight,
  Crown,
  X,
} from "lucide-react";
import LoadingPage from "@/components/loading-page";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  organizationService,
  OrganizationMember,
  Team,
  TeamMember,
} from "@/services/organization-service";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ─── Helpers ──────────────────────────────────────────
function getInitials(name?: string) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

const statusStyles: Record<string, string> = {
  active: "text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950",
  inactive: "text-zinc-500 border-zinc-200 bg-zinc-50 dark:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900",
  suspended: "text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950",
};

const roleLabels: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

// ─── Main Page ────────────────────────────────────────
export default function OrganizationPage() {
  const { slug } = useParams();

  const [activeTab, setActiveTab] = useState("members");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(null);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isTeamDetailOpen, setIsTeamDetailOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isAddTeamMemberOpen, setIsAddTeamMemberOpen] = useState(false);

  // Form state
  const [newMember, setNewMember] = useState({ email: "", password: "", full_name: "", role: "member", supervisor_id: "", job_title: "" });
  const [newTeam, setNewTeam] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch Org ID by slug
  const { data: orgId } = useSWR(
    slug ? `/api/orgs/lookup?slug=${slug}` : null,
    async (url) => {
      const res = await apiClient.get(url);
      if (res.ok) {
        const data = await res.json();
        return data.id as string;
      }
      return null;
    },
    { onError: () => toast.error("Failed to load organization") }
  );

  // 2. Fetch Members & Teams
  const {
    data: members = [],
    isLoading: loadingMembers,
    mutate: mutateMembers,
  } = useSWR<OrganizationMember[]>(
    orgId ? `/api/orgs/${orgId}/members` : null,
    () => organizationService.getMembers(orgId!),
    { fallbackData: [] }
  );

  const {
    data: teams = [],
    isLoading: loadingTeams,
    mutate: mutateTeams,
  } = useSWR<Team[]>(
    orgId ? `/api/orgs/${orgId}/teams` : null,
    () => organizationService.getTeams(orgId!),
    { fallbackData: [] }
  );

  // Team members for detail sheet
  const {
    data: teamMembers = [],
    mutate: mutateTeamMembers,
  } = useSWR<TeamMember[]>(
    orgId && selectedTeam?.id ? `/api/orgs/${orgId}/teams/${selectedTeam.id}/members` : null,
    () => organizationService.getTeamMembers(orgId!, selectedTeam!.id),
    { fallbackData: [] }
  );

  const loading = !orgId || loadingMembers || loadingTeams;

  // Filtered members
  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.profiles?.full_name?.toLowerCase().includes(q) ||
        m.profiles?.email?.toLowerCase().includes(q) ||
        m.role?.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  // Filtered teams
  const filteredTeams = useMemo(() => {
    if (!searchQuery) return teams;
    const q = searchQuery.toLowerCase();
    return teams.filter(
      (t) => t.name?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    );
  }, [teams, searchQuery]);

  // ─── Handlers ─────────────────────────────────────────
  const handleCreateMember = async () => {
    if (!orgId || !newMember.email || !newMember.password || !newMember.full_name) return;
    setSubmitting(true);
    try {
      await organizationService.createMember(orgId, {
        email: newMember.email,
        password: newMember.password,
        full_name: newMember.full_name,
        role: newMember.role,
        supervisor_id: newMember.supervisor_id || undefined,
        job_title: newMember.job_title || undefined,
      });
      toast.success("Member added successfully");
      setIsAddMemberOpen(false);
      setNewMember({ email: "", password: "", full_name: "", role: "member", supervisor_id: "", job_title: "" });
      mutateMembers();
    } catch (e: any) {
      toast.error(e.message || "Failed to add member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMember = async (userId: string, data: Record<string, any>) => {
    if (!orgId) return;
    try {
      await organizationService.updateMember(orgId, userId, data);
      toast.success("Member updated");
      mutateMembers();
      setIsEditMemberOpen(false);
    } catch {
      toast.error("Failed to update member");
    }
  };

  const handleRemoveMember = async (member: OrganizationMember) => {
    if (!orgId) return;
    if (!confirm(`Remove ${member.profiles?.full_name} from this organization?`)) return;
    try {
      await organizationService.removeMember(orgId, member.user_id);
      toast.success("Member removed");
      mutateMembers();
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleCreateTeam = async () => {
    if (!orgId || !newTeam.name) return;
    setSubmitting(true);
    try {
      await organizationService.createTeam(orgId, newTeam);
      toast.success("Team created");
      setIsCreateTeamOpen(false);
      setNewTeam({ name: "", description: "" });
      mutateTeams();
    } catch {
      toast.error("Failed to create team");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    if (!orgId) return;
    if (!confirm(`Delete team "${team.name}"? This cannot be undone.`)) return;
    try {
      await organizationService.deleteTeam(orgId, team.id);
      toast.success("Team deleted");
      mutateTeams();
      if (selectedTeam?.id === team.id) {
        setIsTeamDetailOpen(false);
        setSelectedTeam(null);
      }
    } catch {
      toast.error("Failed to delete team");
    }
  };

  const handleAddTeamMember = async (userId: string, role: string) => {
    if (!orgId || !selectedTeam) return;
    try {
      await organizationService.addTeamMember(orgId, selectedTeam.id, { user_id: userId, role });
      toast.success("Added to team");
      mutateTeamMembers();
      mutateTeams();
      setIsAddTeamMemberOpen(false);
    } catch {
      toast.error("Failed to add to team");
    }
  };

  const handleRemoveTeamMember = async (userId: string) => {
    if (!orgId || !selectedTeam) return;
    try {
      await organizationService.removeTeamMember(orgId, selectedTeam.id, userId);
      toast.success("Removed from team");
      mutateTeamMembers();
      mutateTeams();
    } catch {
      toast.error("Failed to remove from team");
    }
  };

  const handleToggleTeamSupervisor = async (userId: string, currentRole: string) => {
    if (!orgId || !selectedTeam) return;
    const newRole = currentRole === "supervisor" ? "member" : "supervisor";
    try {
      await organizationService.updateTeamMemberRole(orgId, selectedTeam.id, userId, newRole);
      toast.success(newRole === "supervisor" ? "Promoted to supervisor" : "Changed to member");
      mutateTeamMembers();
      mutateTeams();
    } catch {
      toast.error("Failed to update role");
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="h-full w-full space-y-6">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-4">
          <h1 className="text-xl font-medium tracking-tight text-foreground">People & Teams</h1>
          <span className="text-secondary-foreground/60 text-sm font-medium">
            Manage your organization members and teams
          </span>
        </div>

        <Button
          size="sm"
          className="h-8 gap-1.5 shadow-none"
          onClick={() => (activeTab === "members" ? setIsAddMemberOpen(true) : setIsCreateTeamOpen(true))}
        >
          <Plus className="h-3.5 w-3.5" />
          {activeTab === "members" ? "Add Member" : "Create Team"}
        </Button>
      </div>

      <Tabs defaultValue="members" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-muted/50 p-1 h-auto rounded-lg gap-1">
            <TabsTrigger
              value="members"
              className="px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              Members ({members.length})
            </TabsTrigger>
            <TabsTrigger
              value="teams"
              className="px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              Teams ({teams.length})
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

        {/* ─── Members Tab ───────────────────────────────── */}
        <TabsContent value="members" className="outline-none">
          <div className="border rounded-lg bg-card/40 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="h-10 px-4 font-medium text-muted-foreground text-[11px] uppercase tracking-wider w-[250px]">
                    User
                  </th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                    Role
                  </th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                    Supervisor
                  </th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                    Teams
                  </th>
                  <th className="h-10 px-4 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="h-10 px-4 w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredMembers.map((member) => (
                  <tr key={member.user_id} className="group hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border bg-muted/50">
                          <AvatarImage src={member.profiles?.avatar_url || undefined} />
                          <AvatarFallback className="text-[10px] text-muted-foreground font-medium">
                            {getInitials(member.profiles?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-foreground">
                            {member.profiles?.full_name || "Unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground">{member.profiles?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground border px-2 py-1 rounded-md w-fit bg-background">
                        <Shield className="h-3 w-3" />
                        {roleLabels[member.role] || member.role}
                      </div>
                    </td>
                    <td className="p-4">
                      {member.supervisor_name ? (
                        <span className="text-xs text-foreground">{member.supervisor_name}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">None</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {member.teams && member.teams.length > 0 ? (
                          member.teams.map((t) => (
                            <Badge
                              key={t.team_id}
                              variant="secondary"
                              className="text-[10px] font-normal px-1.5 py-0"
                            >
                              {t.team_name}
                              {t.role === "supervisor" && (
                                <Crown className="h-2.5 w-2.5 ml-0.5 text-amber-500" />
                              )}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">None</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={`font-normal rounded-sm px-2 capitalize ${statusStyles[member.status] || statusStyles.active}`}
                      >
                        {member.status || "active"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Manage</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingMember(member);
                              setIsEditMemberOpen(true);
                            }}
                          >
                            Edit Member
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleRemoveMember(member)}
                          >
                            Remove from Org
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">
                      {searchQuery ? "No members match your search." : "No members yet. Add your first member."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ─── Teams Tab ─────────────────────────────────── */}
        <TabsContent value="teams" className="outline-none">
          {filteredTeams.length === 0 ? (
            <div className="border rounded-lg p-12 text-center bg-card/40">
              <Building2 className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No teams match your search." : "No teams yet. Create your first team to organize members."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeams.map((team) => (
                <div
                  key={team.id}
                  className="group flex flex-col justify-between border rounded-lg p-5 bg-card hover:border-primary/50 transition-all cursor-pointer space-y-4"
                  onClick={() => {
                    setSelectedTeam(team);
                    setIsTeamDetailOpen(true);
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground tracking-tight">{team.name}</h3>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {team.description || "No description."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-dashed">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                        {team.member_count || 0} Members
                      </span>
                      {(team.supervisor_count || 0) > 0 && (
                        <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide flex items-center gap-0.5">
                          <Crown className="h-2.5 w-2.5" />
                          {team.supervisor_count} Supervisors
                        </span>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteTeam(team)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete Team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════════════════
          DIALOGS & SHEETS
          ═══════════════════════════════════════════════════ */}

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>Create a new user account and add them to this organization.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name *</Label>
                <Input
                  value={newMember.full_name}
                  onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email *</Label>
                <Input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="john@company.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Password *</Label>
                <Input
                  type="password"
                  value={newMember.password}
                  onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                  placeholder="Min. 6 characters"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Role</Label>
                <Select value={newMember.role} onValueChange={(v) => setNewMember({ ...newMember, role: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Job Title</Label>
                <Input
                  value={newMember.job_title}
                  onChange={(e) => setNewMember({ ...newMember, job_title: e.target.value })}
                  placeholder="e.g. Project Manager"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Supervisor</Label>
                <Select
                  value={newMember.supervisor_id || "none"}
                  onValueChange={(v) => setNewMember({ ...newMember, supervisor_id: v === "none" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No supervisor</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.profiles?.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMember} disabled={submitting}>
              {submitting && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditMemberOpen} onOpenChange={setIsEditMemberOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update {editingMember?.profiles?.full_name}&apos;s organization settings.
            </DialogDescription>
          </DialogHeader>
          {editingMember && (
            <EditMemberForm
              member={editingMember}
              members={members}
              onSave={(data) => handleUpdateMember(editingMember.user_id, data)}
              onClose={() => setIsEditMemberOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Team Dialog */}
      <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
            <DialogDescription>Create a new team to organize your people.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Team Name *</Label>
              <Input
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                placeholder="e.g. Engineering"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={newTeam.description}
                onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                placeholder="What is this team for?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTeamOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTeam} disabled={submitting}>
              {submitting && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
              Create Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Detail Sheet */}
      <Sheet open={isTeamDetailOpen} onOpenChange={setIsTeamDetailOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {selectedTeam?.name}
            </SheetTitle>
            <SheetDescription>{selectedTeam?.description || "No description."}</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Add member to team */}
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">
                Team Members ({teamMembers.length})
              </h4>
              <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => setIsAddTeamMemberOpen(true)}>
                <UserPlus className="h-3 w-3" />
                Add
              </Button>
            </div>

            {/* Members list */}
            <div className="space-y-2">
              {teamMembers.map((tm) => (
                <div
                  key={tm.user_id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-background group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border">
                      <AvatarFallback className="text-[10px]">{getInitials(tm.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{tm.full_name}</span>
                        {tm.role === "supervisor" && (
                          <Badge className="text-[9px] px-1 py-0 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                            Supervisor
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{tm.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleToggleTeamSupervisor(tm.user_id, tm.role)}
                    >
                      {tm.role === "supervisor" ? "Demote" : "Make Supervisor"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleRemoveTeamMember(tm.user_id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {teamMembers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No members yet. Add members from your organization.
                </p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Team Member Dialog */}
      <Dialog open={isAddTeamMemberOpen} onOpenChange={setIsAddTeamMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to {selectedTeam?.name}</DialogTitle>
            <DialogDescription>Select an organization member to add to this team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[300px] overflow-y-auto py-2">
            {members
              .filter((m) => !teamMembers.some((tm) => tm.user_id === m.user_id))
              .map((m) => (
                <div
                  key={m.user_id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border">
                      <AvatarFallback className="text-[10px]">{getInitials(m.profiles?.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-sm font-medium">{m.profiles?.full_name}</span>
                      <p className="text-xs text-muted-foreground">{m.profiles?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleAddTeamMember(m.user_id, "member")}>
                      Add
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleAddTeamMember(m.user_id, "supervisor")}>
                      <Crown className="h-3 w-3 text-amber-500" />
                      As Supervisor
                    </Button>
                  </div>
                </div>
              ))}
            {members.filter((m) => !teamMembers.some((tm) => tm.user_id === m.user_id)).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">All organization members are already in this team.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Edit Member Sub-Component ────────────────────────
function EditMemberForm({
  member,
  members,
  onSave,
  onClose,
}: {
  member: OrganizationMember;
  members: OrganizationMember[];
  onSave: (data: Record<string, any>) => void;
  onClose: () => void;
}) {
  const [role, setRole] = useState(member.role);
  const [supervisorId, setSupervisorId] = useState(member.supervisor_id || "none");
  const [status, setStatus] = useState(member.status || "active");
  const [jobTitle, setJobTitle] = useState(member.job_title || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const data: Record<string, any> = {};
    if (role !== member.role) data.role = role;
    if ((supervisorId === "none" ? null : supervisorId) !== member.supervisor_id) {
      data.supervisor_id = supervisorId === "none" ? "" : supervisorId;
    }
    if (status !== member.status) data.status = status;
    if (jobTitle !== (member.job_title || "")) data.job_title = jobTitle;

    if (Object.keys(data).length === 0) {
      onClose();
      return;
    }
    onSave(data);
    setSaving(false);
  };

  return (
    <>
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Job Title</Label>
            <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Project Manager" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Supervisor</Label>
            <Select value={supervisorId} onValueChange={setSupervisorId}>
              <SelectTrigger>
                <SelectValue placeholder="Select supervisor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No supervisor</SelectItem>
                {members
                  .filter((m) => m.user_id !== member.user_id)
                  .map((m) => (
                    <SelectItem key={m.user_id} value={m.user_id}>
                      {m.profiles?.full_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </DialogFooter>
    </>
  );
}
