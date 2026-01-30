"use client";

import { useState } from "react";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

import { Link } from "@/navigation";
import { FlowTable } from "@/components/flow-studio/flow-table";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function FlowStudioPage() {
  const t = useTranslations("FlowStudio");
  const params = useParams();
  const slug = params?.slug as string;
  const { data: flows = [], isLoading: loading } = useSWR(
    slug ? `/flows?slug=${slug}` : null,
    (url) => apiClient.get(url).then(async (res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load flows");
    }),
    {
        onError: () => toast.error("Failed to load flows")
    }
  );


  return (
    <div className="h-full w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium tracking-tight">{t("title")}</h1>
        <Link href={`/nodal/${slug}/dashboard/flow-studio/design`}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("newFlow")}
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="active" className="w-full space-y-6">
        <TabsList className="bg-muted p-1 rounded-lg h-auto inline-flex">
          <TabsTrigger
            value="active"
            className="rounded-md px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground shadow-none"
          >
            {t("tabs.active")}
          </TabsTrigger>
          <TabsTrigger
            value="draft"
            className="rounded-md px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground shadow-none"
          >
            {t("tabs.draft")}
          </TabsTrigger>
          <TabsTrigger
            value="inactive"
            className="rounded-md px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground shadow-none"
          >
            {t("tabs.inactive")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
            <FlowTable initialFlows={flows.filter((f: any) => f.is_active)} slug={slug} isLoading={loading} />
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
            <FlowTable initialFlows={flows.filter((f: any) => !f.is_active && !f.published_at)} slug={slug} isLoading={loading} />
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
            <FlowTable initialFlows={flows.filter((f: any) => !f.is_active && f.published_at)} slug={slug} isLoading={loading} />
        </TabsContent>

      </Tabs>
    </div>
  );
}
