'use client'

import useSWR from 'swr'
import { apiClient } from "@/lib/api-client"
import { Users, Building2, Bot, Shield, Activity } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Organization } from '@/types/admin'

interface User {
    id: string
    full_name: string
    email: string
}

interface AIStats {
    total_requests: number
    total_tokens: number
    blocked_count: number
    credits_used: number
}

export default function AdminOverviewPage() {
    const { data: orgs = [], isLoading: loadingOrgs } = useSWR<Organization[]>(
        '/api/admin/orgs',
        (url: string) => apiClient.get(url).then(res => res.json())
    )
    const { data: users = [], isLoading: loadingUsers } = useSWR<User[]>(
        '/api/admin/users',
        (url: string) => apiClient.get(url).then(res => res.json())
    )
    const { data: aiStats, isLoading: loadingAI } = useSWR<AIStats>(
        '/api/admin/ai-stats',
        (url: string) => apiClient.get(url).then(res => res.json())
    )

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
                <p className="text-sm text-muted-foreground mt-1">Platform metrics at a glance.</p>
            </div>

            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                <StatCard
                    icon={Users}
                    label="Total Users"
                    value={loadingUsers ? null : users.length}
                />
                <StatCard
                    icon={Building2}
                    label="Organizations"
                    value={loadingOrgs ? null : orgs.length}
                />
                <StatCard
                    icon={Bot}
                    label="AI Requests"
                    value={loadingAI ? null : (aiStats?.total_requests ?? 0)}
                />
                <StatCard
                    icon={Shield}
                    label="Blocked"
                    value={loadingAI ? null : (aiStats?.blocked_count ?? 0)}
                />
                <StatCard
                    icon={Activity}
                    label="Credits Used"
                    value={loadingAI ? null : (aiStats?.credits_used ?? 0)}
                />
            </div>
        </div>
    )
}

function StatCard({ icon: Icon, label, value, sublabel }: {
    icon: React.ElementType
    label: string
    value: number | null
    sublabel?: string
}) {
    return (
        <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
                <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
            {value === null ? (
                sublabel ? (
                    <span className="text-sm text-muted-foreground">{sublabel}</span>
                ) : (
                    <Spinner className="w-4 h-4" />
                )
            ) : (
                <span className="text-2xl font-bold">{value}</span>
            )}
        </div>
    )
}
