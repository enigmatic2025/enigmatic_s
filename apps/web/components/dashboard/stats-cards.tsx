import { Card } from "@/components/ui/card";
import { Activity, CheckCircle, Clock, ListTodo, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function StatsCards() {
  return (
    <Card className="shadow-none">
      <div className="grid md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 border-b md:border-r lg:border-b-0">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Actions Waiting</h3>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <ListTodo className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-red-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +2
              </span>
              since yesterday
            </p>
          </div>
        </div>

        <div className="p-6 border-b lg:border-r lg:border-b-0">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Actions Completed</h3>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-green-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +15%
              </span>
              from last week
            </p>
          </div>
        </div>

        <div className="p-6 border-b md:border-b-0 md:border-r">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Avg. Completion Time</h3>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold">2h 15m</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-green-500 flex items-center mr-1">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                -15m
              </span>
              from last week
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Active Action Flows</h3>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-blue-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +2
              </span>
              new today
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
