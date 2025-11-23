"use client";

import { ChartNoAxesColumnIcon } from "lucide-react";
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";

import {
  Widget,
  WidgetContent,
  WidgetHeader,
  WidgetTitle,
} from "@/components/ui/widget";
import { Label } from "@/components/ui/label";

// Using logo colors: Purple, Pink, Blue
const chartData = [
  { name: "Complete", value: 100, fill: "#3b82f6" }, // Blue
  { name: "In Progress", value: 75, fill: "#8b5cf6" }, // Purple
  { name: "Incomplete", value: 45, fill: "#d946ef" }, // Pink
];

export function NodalDashboard() {
  return (
    <Widget
      size="md"
      className="h-full border bg-card w-full mx-auto shadow-sm"
    >
      <WidgetHeader className="w-full pb-2">
        <WidgetTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ChartNoAxesColumnIcon className="w-4 h-4" />
          <Label className="text-sm font-normal cursor-pointer">
            Action Flow Performance
          </Label>
        </WidgetTitle>
      </WidgetHeader>
      <WidgetContent className="flex flex-col sm:flex-row items-center justify-between gap-8 p-6 h-full">
        <div className="w-full sm:w-1/2 h-[180px] flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="30%"
              outerRadius="100%"
              barSize={24}
              data={chartData}
              startAngle={90}
              endAngle={450}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background
                dataKey="value"
                cornerRadius={12}
                className="stroke-transparent stroke-2"
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-lg font-semibold tracking-tight text-foreground">
                98%
              </span>
            </div>
          </div>
        </div>
        <div className="flex w-full sm:w-1/2 flex-col items-start justify-center gap-6">
          <div className="flex items-center gap-3 w-full">
            <div className="bg-blue-500 size-3 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <div className="flex flex-col">
              <span className="text-sm font-bold">1,248</span>
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium">
                Complete
              </span>
            </div>
            <div className="ml-auto text-xs font-mono text-green-500">+12%</div>
          </div>
          <div className="flex items-center gap-3 w-full">
            <div className="bg-violet-500 size-3 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
            <div className="flex flex-col">
              <span className="text-sm font-bold">156</span>
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium">
                In Progress
              </span>
            </div>
            <div className="ml-auto text-xs font-mono text-green-500">+8%</div>
          </div>
          <div className="flex items-center gap-3 w-full">
            <div className="bg-fuchsia-500 size-3 rounded-full shadow-[0_0_8px_rgba(217,70,239,0.5)]" />
            <div className="flex flex-col">
              <span className="text-sm font-bold">42</span>
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium">
                Incomplete
              </span>
            </div>
            <div className="ml-auto text-xs font-mono text-yellow-500">-2%</div>
          </div>
        </div>
      </WidgetContent>
    </Widget>
  );
}
