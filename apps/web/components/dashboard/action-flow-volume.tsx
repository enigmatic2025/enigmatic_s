"use client"

import { Bar, ResponsiveContainer, XAxis, YAxis, Legend, BarChart } from "recharts"
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
          <BarChart data={data}>
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
            <Legend iconType="circle" iconSize={8} />
            <Bar 
                dataKey="requests" 
                name="New Requests" 
                stackId="a"
                fill="#3b82f6" 
                radius={[0, 0, 4, 4]}
            />
            <Bar 
                dataKey="completed" 
                name="Completed" 
                stackId="a"
                fill={isDark ? "#3f3f46" : "#000000"}
                radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
