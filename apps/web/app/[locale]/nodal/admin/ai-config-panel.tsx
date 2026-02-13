'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Save, Lock, Cpu, Server, Bot, Shield, AlertTriangle } from 'lucide-react'
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
    Provider: string
    BaseURL:  string
    Model:    string
    APIKey:   string
    GuardrailEnabled: boolean
    GuardrailProvider: string
    GuardrailModel: string
}

export function AIConfigPanel() {
    const { data: config, mutate, isLoading } = useSWR<AIConfig>('/api/admin/ai-config', (url: string) => apiClient.get(url).then(res => res.json()))
    
    const [formData, setFormData] = useState<AIConfig>({
        Provider: 'openrouter',
        BaseURL: '',
        Model: '',
        APIKey: '',
        GuardrailEnabled: false,
        GuardrailProvider: 'openrouter',
        GuardrailModel: 'google/gemini-2.0-flash-001'
    })
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (config) {
            setFormData(prev => ({
                ...prev,
                ...config,
                GuardrailProvider: config.GuardrailProvider || 'openrouter',
                GuardrailModel: config.GuardrailModel || 'google/gemini-2.0-flash-001'
            }))
        }
    }, [config])

    const handleProviderChange = (value: string) => {
        let baseUrl = formData.BaseURL
        let model = formData.Model

        if (value === 'openrouter') {
            baseUrl = 'https://openrouter.ai/api/v1'
            model = 'google/gemini-2.0-flash-001'
        } else if (value === 'groq') {
            baseUrl = 'https://api.groq.com/openai/v1'
            model = 'llama3-70b-8192'
        } else if (value === 'openai') {
            baseUrl = 'https://api.openai.com/v1'
            model = 'gpt-4o'
        }

        setFormData(prev => ({ ...prev, Provider: value, BaseURL: baseUrl, Model: model }))
    }

    const saveField = async (key: string, value: string) => {
        const res = await apiClient.put('/api/admin/ai-config', { key, value })
        if (!res.ok) throw new Error(`Failed to save ${key}`)
    }

    const handleSaveAll = async () => {
        setIsSaving(true)
        try {
            await Promise.all([
                saveField('ai_provider', formData.Provider),
                saveField('ai_base_url', formData.BaseURL),
                saveField('ai_model', formData.Model),
                saveField('ai_api_key', formData.APIKey),
                saveField('ai_guardrail_enabled', String(formData.GuardrailEnabled)),
                saveField('ai_guardrail_provider', formData.GuardrailProvider),
                saveField('ai_guardrail_model', formData.GuardrailModel),
            ])
            toast.success("Configuration saved")
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
                    <p className="text-sm text-zinc-500 mt-1">Manage providers, models, and guardrails.</p>
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

            {/* Core Intelligence */}
            <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-zinc-500" />
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Core Intelligence</h2>
                    <span className="text-xs text-zinc-400 ml-auto">Primary reasoning model</span>
                </div>
                <div className="p-5 grid gap-4 sm:grid-cols-2">
                    <Field label="Provider">
                        <Select value={formData.Provider} onValueChange={handleProviderChange}>
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
                        <div className="relative">
                            <Server className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
                            <Input
                                className="h-9 pl-8 text-sm font-mono"
                                value={formData.BaseURL}
                                onChange={(e) => setFormData(prev => ({ ...prev, BaseURL: e.target.value }))}
                            />
                        </div>
                    </Field>
                    <Field label="Model ID">
                        <div className="relative">
                            <Cpu className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
                            <Input
                                className="h-9 pl-8 text-sm font-mono"
                                value={formData.Model}
                                onChange={(e) => setFormData(prev => ({ ...prev, Model: e.target.value }))}
                                placeholder="e.g. gpt-4o"
                            />
                        </div>
                    </Field>
                    <Field label="API Key">
                        <div className="relative">
                            <Lock className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
                            <Input
                                type="password"
                                className="h-9 pl-8 text-sm font-mono"
                                value={formData.APIKey}
                                onChange={(e) => setFormData(prev => ({ ...prev, APIKey: e.target.value }))}
                                placeholder="sk-..."
                            />
                        </div>
                    </Field>
                </div>
            </section>

            {/* Guardrails */}
            <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-zinc-500" />
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Guardrails</h2>
                    <span className="text-xs text-zinc-400 ml-auto">Filter non-work requests</span>
                    <Switch
                        checked={formData.GuardrailEnabled}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, GuardrailEnabled: c }))}
                    />
                </div>
                <div className="p-5">
                    {!formData.GuardrailEnabled && (
                        <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs mb-4">
                            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>Disabled — all requests go directly to the core model without filtering.</span>
                        </div>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Router Model">
                            <Select
                                value={formData.GuardrailModel}
                                onValueChange={(v) => setFormData(prev => ({ ...prev, GuardrailModel: v }))}
                                disabled={!formData.GuardrailEnabled}
                            >
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="google/gemini-2.0-flash-001">Gemini 2.0 Flash</SelectItem>
                                    <SelectItem value="meta-llama/llama-3-8b-instruct">Llama 3 8B</SelectItem>
                                    <SelectItem value="anthropic/claude-3-haiku">Claude 3 Haiku</SelectItem>
                                    <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Router Provider">
                            <Select
                                value={formData.GuardrailProvider}
                                onValueChange={(v) => setFormData(prev => ({ ...prev, GuardrailProvider: v }))}
                                disabled={!formData.GuardrailEnabled}
                            >
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="openrouter">OpenRouter</SelectItem>
                                    <SelectItem value="groq">Groq</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
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
