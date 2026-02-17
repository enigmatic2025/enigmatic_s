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
  AlertTriangle,
  Eye,
  EyeOff,
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
  DropdownMenuSeparator,
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
  // Show prefix + last 4 chars: enig_****...****a1b2
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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-4">
          <h1 className="text-xl font-medium tracking-tight">API Keys</h1>
          <span className="text-secondary-foreground/60 text-sm font-medium">
            Manage keys for external integrations
          </span>
        </div>
        <Button size="sm" className="h-8 gap-1.5" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Create Key
        </Button>
      </div>

      {/* Security Warning */}
      <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/50">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div className="text-sm text-amber-800 dark:text-amber-200">
          <p className="font-medium">Keep your API keys secure</p>
          <p className="text-xs mt-0.5 text-amber-700 dark:text-amber-300">
            API keys grant full access to trigger flows in your organization. Never share them publicly, commit them to
            source control, or expose them in client-side code. If a key is compromised, revoke it immediately.
          </p>
        </div>
      </div>

      {/* Keys Table */}
      {keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-3 mb-3">
            <KeyRound className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No API keys yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create an API key to allow external systems to trigger your flows.
          </p>
          <Button size="sm" className="mt-4 gap-1.5" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Create Your First Key
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
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
                  <td className="h-14 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                        <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{key.label || "Unnamed Key"}</p>
                        <p className="text-xs text-muted-foreground font-mono">enig_••••••••</p>
                      </div>
                    </div>
                  </td>
                  <td className="h-14 px-4 text-xs text-muted-foreground">
                    {formatDate(key.created_at)}
                  </td>
                  <td className="h-14 px-4">
                    {key.last_used_at ? (
                      <span className="text-xs text-muted-foreground">{formatDate(key.last_used_at)}</span>
                    ) : (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal text-muted-foreground border-dashed">
                        Never used
                      </Badge>
                    )}
                  </td>
                  <td className="h-14 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
        <div className="rounded-md border border-dashed p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Usage</p>
          <div className="bg-muted/50 rounded-md p-3 font-mono text-xs text-muted-foreground">
            <span className="text-emerald-600 dark:text-emerald-400">curl</span> -X POST \<br />
            &nbsp;&nbsp;-H <span className="text-amber-600 dark:text-amber-400">&quot;X-API-Key: enig_your_key_here&quot;</span> \<br />
            &nbsp;&nbsp;-H <span className="text-amber-600 dark:text-amber-400">&quot;Content-Type: application/json&quot;</span> \<br />
            &nbsp;&nbsp;-d <span className="text-amber-600 dark:text-amber-400">{`'{"truck_number": "TX-9920"}'`}</span> \<br />
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
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={submitting || !newKeyLabel.trim()}>
              {submitting && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
              Generate Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reveal Key Dialog ─────────────────────── */}
      <Dialog open={isRevealOpen} onOpenChange={(open) => {
        if (!open) {
          setIsRevealOpen(false);
          setCreatedKey(null);
          setShowKey(false);
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Your new API key</DialogTitle>
            <DialogDescription>
              Copy this key now. You won&apos;t be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/50">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                This is the only time this key will be displayed. Store it securely — we only store a hash
                and cannot recover it.
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
                    className="h-9 w-9 shrink-0"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
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
              size="sm"
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
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={submitting}>
              {submitting && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
