"use client";

import { useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Loader2,
  Copy,
  KeyRound,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";

import { apiClient } from "@/lib/api-client";
import LoadingPage from "@/components/loading-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  apiKeyService,
  ApiKey,
  CreateApiKeyResponse,
} from "@/services/api-key-service";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Never";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function maskKey(key: string) {
  if (key.length <= 12) return key;
  return key.slice(0, 5) + "••••••••" + key.slice(-4);
}

export default function ApiKeysPage() {
  const { slug } = useParams();

  // ── State ──────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRevealOpen, setIsRevealOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [createdKey, setCreatedKey] = useState<CreateApiKeyResponse | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Data Fetching ──────────────────────────────────
  const { data: orgId, isLoading: loadingOrg } = useSWR(
    slug ? `/api/orgs/lookup?slug=${slug}` : null,
    async (url) => {
      const res = await apiClient.get(url);
      if (!res.ok) throw new Error("Failed to load organization");
      const data = await res.json();
      return data.id as string;
    }
  );

  const {
    data: keys = [],
    isLoading: loadingKeys,
    mutate: mutateKeys,
  } = useSWR<ApiKey[]>(
    orgId ? `/api/orgs/${orgId}/api-keys` : null,
    () => apiKeyService.getKeys(orgId!),
    { fallbackData: [] }
  );

  // ── Handlers ───────────────────────────────────────
  const handleCreate = async () => {
    if (!orgId || !newKeyLabel.trim()) return;
    setSubmitting(true);
    try {
      const result = await apiKeyService.createKey(orgId, { label: newKeyLabel.trim() });
      setCreatedKey(result);
      setIsCreateOpen(false);
      setIsRevealOpen(true);
      setNewKeyLabel("");
      setShowKey(false);
      setCopied(false);
      mutateKeys();
    } catch (err: any) {
      toast.error(err.message || "Failed to create API key");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!orgId || !keyToDelete) return;
    setSubmitting(true);
    try {
      await apiKeyService.deleteKey(orgId, keyToDelete.id);
      toast.success("API key revoked");
      setIsDeleteOpen(false);
      setKeyToDelete(null);
      mutateKeys();
    } catch {
      toast.error("Failed to revoke API key");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!createdKey) return;
    navigator.clipboard.writeText(createdKey.key);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Loading ────────────────────────────────────────
  if (loadingOrg || (loadingKeys && keys.length === 0)) {
    return <LoadingPage />;
  }

  return (
    <div className="h-full w-full space-y-6">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-4">
          <h1 className="text-xl font-medium tracking-tight text-foreground">API Keys</h1>
          <span className="text-secondary-foreground/60 text-sm font-medium">
            Manage keys for external integrations
          </span>
        </div>
        <Button
          size="sm"
          className="h-8 gap-1.5 shadow-none"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Create Key
        </Button>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-3 rounded-lg border p-3">
        <ShieldAlert className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <p className="font-medium text-foreground">Keep your API keys secure</p>
          <p className="mt-0.5">
            API keys grant access to trigger flows in your organization. Do not share them publicly,
            commit them to source control, or expose them in client-side code. Revoke compromised keys immediately.
          </p>
        </div>
      </div>

      {/* Keys Table */}
      {keys.length === 0 ? (
        <div className="border rounded-lg p-12 text-center bg-card/40">
          <KeyRound className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-foreground">No API keys yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create an API key to allow external systems to trigger your flows.
          </p>
          <Button
            size="sm"
            className="mt-4 gap-1.5 shadow-none"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Create Your First Key
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg bg-card/40 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="h-10 px-4 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                  Name
                </th>
                <th className="h-10 px-4 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                  Created
                </th>
                <th className="h-10 px-4 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                  Last Used
                </th>
                <th className="h-10 px-4 w-[50px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {keys.map((key) => (
                <tr key={key.id} className="group hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/50 border">
                        <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground text-sm">
                          {key.label || "Unnamed Key"}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">enig_••••••••</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">
                    {formatDate(key.created_at)}
                  </td>
                  <td className="p-4">
                    {key.last_used_at ? (
                      <span className="text-xs text-muted-foreground">{formatDate(key.last_used_at)}</span>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 font-normal text-muted-foreground border-dashed"
                      >
                        Never used
                      </Badge>
                    )}
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
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setKeyToDelete(key);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Revoke Key
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Usage hint */}
      {keys.length > 0 && (
        <div className="rounded-lg border border-dashed p-4">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Usage
          </p>
          <div className="bg-muted/50 rounded-md p-3 font-mono text-xs text-muted-foreground leading-relaxed">
            curl -X POST \<br />
            &nbsp;&nbsp;-H &quot;X-API-Key: enig_your_key_here&quot; \<br />
            &nbsp;&nbsp;-H &quot;Content-Type: application/json&quot; \<br />
            &nbsp;&nbsp;-d {`'{"payload": "data"}'`} \<br />
            &nbsp;&nbsp;{typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/flows/YOUR_FLOW_ID/execute
          </div>
        </div>
      )}

      {/* ── Create Dialog ─────────────────────────── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Generate a new API key for external systems to trigger flows in your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Name *</Label>
              <Input
                placeholder="e.g. Production Server, Zapier Integration"
                value={newKeyLabel}
                onChange={(e) => setNewKeyLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <p className="text-[11px] text-muted-foreground">
                Give this key a descriptive name so you can identify it later.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting || !newKeyLabel.trim()}>
              {submitting && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
              Generate Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reveal Key Dialog ─────────────────────── */}
      <Dialog
        open={isRevealOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsRevealOpen(false);
            setCreatedKey(null);
            setShowKey(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Your new API key</DialogTitle>
            <DialogDescription>
              Copy this key now. You won&apos;t be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <ShieldAlert className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                This is the only time this key will be displayed. Store it securely — we only store a
                hash and cannot recover it.
              </p>
            </div>
            {createdKey && (
              <div className="space-y-1.5">
                <Label className="text-xs">API Key</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-md border bg-muted/50 p-2.5 font-mono text-xs break-all">
                    {showKey ? createdKey.key : maskKey(createdKey.key)}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 shadow-none"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 shadow-none"
                    onClick={handleCopy}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setIsRevealOpen(false);
                setCreatedKey(null);
                setShowKey(false);
              }}
            >
              {copied ? "Done" : "I've saved this key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ────────────── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke <strong>{keyToDelete?.label || "this key"}</strong>?
              Any systems using this key will immediately lose access. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
