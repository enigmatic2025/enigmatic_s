'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Save, Lock, Server, Shield, AlertTriangle, Zap, Brain, ArrowRight, Info } from 'lucide-react'
import { apiClient } from "@/lib/api-client"
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"

interface AIConfig {
    provider: string
    base_url: string
    model: string
    api_key: string
    api_key_configured?: boolean
    reasoning_model: string
    guardrail_enabled: boolean
    guardrail_model: string
}

const PROVIDER_DEFAULTS: Record<string, string> = {
    openrouter: 'https://openrouter.ai/api/v1',
    groq: 'https://api.groq.com/openai/v1',
    openai: 'https://api.openai.com/v1',
    anthropic: 'https://api.anthropic.com/v1',
}

export function AIConfigPanel() {
    const { data: config, mutate, isLoading } = useSWR<AIConfig>('/api/admin/ai-config', (url: string) => apiClient.get(url).then(res => res.json()))

    const [formData, setFormData] = useState<AIConfig>({
        provider: 'openrouter',
        base_url: 'https://openrouter.ai/api/v1',
        model: 'google/gemini-2.0-flash-001',
        api_key: '',
        reasoning_model: '',
        guardrail_enabled: true,
        guardrail_model: 'google/gemini-2.0-flash-lite-001',
    })
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (config) {
            setFormData(prev => ({
                ...prev,
                provider: config.provider || 'openrouter',
                base_url: config.base_url || 'https://openrouter.ai/api/v1',
                model: config.model || 'google/gemini-2.0-flash-001',
                reasoning_model: config.reasoning_model || '',
                guardrail_enabled: config.guardrail_enabled ?? true,
                guardrail_model: config.guardrail_model || 'google/gemini-2.0-flash-lite-001',
            }))
        }
    }, [config])

    const handleProviderChange = (value: string) => {
        const baseUrl = PROVIDER_DEFAULTS[value] || ''
        setFormData(prev => ({ ...prev, provider: value, base_url: baseUrl }))
    }

    const saveField = async (key: string, value: string) => {
        const res = await apiClient.put('/api/admin/ai-config', { key, value })
        if (!res.ok) throw new Error(`Failed to save ${key}`)
    }

    const handleSaveAll = async () => {
        setIsSaving(true)
        try {
            const promises = [
                saveField('ai_provider', formData.provider),
                saveField('ai_base_url', formData.base_url),
                saveField('ai_model', formData.model),
                saveField('ai_reasoning_model', formData.reasoning_model),
                saveField('ai_guardrail_enabled', String(formData.guardrail_enabled)),
                saveField('ai_guardrail_model', formData.guardrail_model),
            ]

            if (formData.api_key) {
                promises.push(saveField('ai_api_key', formData.api_key))
            }

            await Promise.all(promises)
            toast.success("Configuration saved")
            setFormData(prev => ({ ...prev, api_key: '' }))
            mutate()
        } catch {
            toast.error("Failed to save")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) return <div className="py-12 flex justify-center"><Spinner /></div>

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">AI Configuration</h1>
                    <p className="text-sm text-zinc-500 mt-1">Manage connection, model routing, and guardrails.</p>
                </div>
                <Button
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                    {isSaving ? <Spinner className="mr-2 h-3.5 w-3.5" /> : <Save className="mr-2 h-3.5 w-3.5" />}
                    Save
                </Button>
            </div>

            {/* Routing Overview */}
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4">
                <div className="flex items-start gap-2 mb-3">
                    <Info className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                    <div>
                        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Model Routing</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">Natalie routes requests through the pipeline below. All models share the same provider connection.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-500 flex-wrap">
                    <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">Guardrail (free)</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">Reasoning (5x credits)</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">Primary (1x credits)</span>
                </div>
            </div>

            {/* Connection */}
            <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                    <Server className="w-4 h-4 text-zinc-500" />
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Connection</h2>
                    <span className="text-xs text-zinc-400 ml-auto">Shared across all models</span>
                </div>
                <div className="p-5 grid gap-4 sm:grid-cols-3">
                    <Field label="Provider">
                        <Select value={formData.provider} onValueChange={handleProviderChange}>
                            <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="openrouter">OpenRouter</SelectItem>
                                <SelectItem value="groq">Groq</SelectItem>
                                <SelectItem value="openai">OpenAI</SelectItem>
                                <SelectItem value="anthropic">Anthropic</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label="Base URL">
                        <Input
                            className="h-9 text-sm font-mono"
                            value={formData.base_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, base_url: e.target.value }))}
                        />
                    </Field>
                    <Field label="API Key">
                        <div className="relative">
                            <Lock className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
                            <Input
                                type="password"
                                autoComplete="new-password"
                                className="h-9 pl-8 text-sm font-mono"
                                value={formData.api_key}
                                onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                                placeholder={config?.api_key_configured ? "••••••••  (configured)" : "sk-or-..."}
                            />
                        </div>
                    </Field>
                </div>
            </section>

            {/* Model Selection */}
            <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Models</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Assign a model ID for each role in the routing pipeline.</p>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {/* Primary */}
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="sm:w-48 shrink-0">
                            <div className="flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5 text-green-500" />
                                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Primary</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-0.5 ml-5.5">Fast streaming &amp; final answers</p>
                        </div>
                        <Input
                            className="h-9 text-sm font-mono flex-1"
                            value={formData.model}
                            onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                            placeholder="google/gemini-2.0-flash-001"
                        />
                    </div>

                    {/* Reasoning */}
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="sm:w-48 shrink-0">
                            <div className="flex items-center gap-2">
                                <Brain className="w-3.5 h-3.5 text-blue-500" />
                                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Reasoning</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-0.5 ml-5.5">Tool calls &amp; data analysis</p>
                        </div>
                        <div className="flex-1 space-y-2">
                            <Input
                                className="h-9 text-sm font-mono"
                                value={formData.reasoning_model}
                                onChange={(e) => setFormData(prev => ({ ...prev, reasoning_model: e.target.value }))}
                                placeholder="Leave empty to use primary model"
                            />
                            {!formData.reasoning_model && (
                                <p className="text-[11px] text-blue-500 dark:text-blue-400 flex items-center gap-1">
                                    <Info className="w-3 h-3 shrink-0" />
                                    Falls back to primary model. Set a stronger model for better tool-calling.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Guardrail */}
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="sm:w-48 shrink-0">
                            <div className="flex items-center gap-2">
                                <Shield className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Guardrail</span>
                                <Switch
                                    checked={formData.guardrail_enabled}
                                    onCheckedChange={(c) => setFormData(prev => ({ ...prev, guardrail_enabled: c }))}
                                    className="ml-auto sm:ml-0"
                                />
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-0.5 ml-5.5">Filters off-topic requests</p>
                        </div>
                        <div className="flex-1">
                            {formData.guardrail_enabled ? (
                                <Select
                                    value={formData.guardrail_model}
                                    onValueChange={(v) => setFormData(prev => ({ ...prev, guardrail_model: v }))}
                                >
                                    <SelectTrigger className="h-9 text-sm">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="google/gemini-2.0-flash-lite-001">Gemini 2.0 Flash Lite (cheapest)</SelectItem>
                                        <SelectItem value="google/gemini-2.0-flash-001">Gemini 2.0 Flash</SelectItem>
                                        <SelectItem value="meta-llama/llama-3-8b-instruct">Llama 3 8B</SelectItem>
                                        <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="flex items-center gap-2 h-9 px-3 text-xs text-amber-600 dark:text-amber-400">
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                    Disabled — all requests go directly to the model.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</Label>
            {children}
        </div>
    )
}
