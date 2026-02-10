"use client"

import { Search } from "lucide-react"
import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "@/navigation"

interface DashboardSearchProps {
  slug: string
}

export function DashboardSearch({ slug }: DashboardSearchProps) {
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim()) {
        // Navigate to action flows with search query
        router.push(`/nodal/${slug}/dashboard/action-flows?search=${encodeURIComponent(query.trim())}`)
      }
    },
    [query, slug, router]
  )

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div
        className={`flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5 transition-colors ${
          focused ? "border-foreground/20" : "border-border"
        }`}
      >
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search action flows, tasks..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
    </form>
  )
}
