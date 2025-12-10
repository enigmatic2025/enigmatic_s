"use client"

import { Line, ResponsiveContainer, XAxis, YAxis, Legend, LineChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"

const data = [
  { name: "Mon", completed: 12, requests: 15 },
  { name: "Tue", completed: 18, requests: 22 },
  { name: "Wed", completed: 15, requests: 12 },
  { name: "Thu", completed: 25, requests: 20 },
  { name: "Fri", completed: 22, requests: 18 },
  { name: "Sat", completed: 8, requests: 5 },
  { name: "Sun", completed: 5, requests: 3 },
]

export function ActionFlowVolume() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Volume</CardTitle>
        <CardDescription>
          Actions completed vs. New requests received.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2 select-none pointer-events-none">
        <ResponsiveContainer width="100%" height={350}>
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
            <Legend 
              verticalAlign="top" 
              align="right"
              height={36}
              iconType="circle" 
              iconSize={6}
              wrapperStyle={{ fontSize: '10px', letterSpacing: '0.05em', opacity: 0.7 }}
            />
            <Line 
                type="basis"
                dataKey="requests" 
                name="New Requests" 
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
