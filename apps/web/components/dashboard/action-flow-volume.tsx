"use client"

import { Line, ResponsiveContainer, XAxis, YAxis, Legend, LineChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

const data = [
  { name: "Mon", completed: 12, new: 15 },
  { name: "Tue", completed: 18, new: 22 },
  { name: "Wed", completed: 15, new: 12 },
  { name: "Thu", completed: 25, new: 20 },
  { name: "Fri", completed: 22, new: 18 },
  { name: "Sat", completed: 8, new: 5 },
  { name: "Sun", completed: 5, new: 3 },
]

export function ActionFlowVolume({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <Card className={cn("shadow-none", className)}>
      <CardHeader>
        <CardTitle>Weekly Volume</CardTitle>
        <CardDescription>
          Actions completed (Black/White) vs. new Actions received (Blue).
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2 select-none pointer-events-none">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Line 
                type="basis"
                dataKey="new" 
                name="New" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
            />
            <Line 
                type="basis"
                dataKey="completed" 
                name="Completed" 
                stroke={isDark ? "#e4e4e7" : "#000000"}
                strokeWidth={2}
                dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
