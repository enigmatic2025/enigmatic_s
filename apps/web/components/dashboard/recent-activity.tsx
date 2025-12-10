import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mockActivity = [
  {
    id: "act_1",
    user: {
      name: "Jessica Chen",
      initials: "JC",
      avatar: "/avatars/01.png",
    },
    action: "completed her Action",
    target: "Q4 Budget Approval",
    timestamp: "2 mins ago",
  },
  {
    id: "act_2",
    user: {
      name: "Alex Miller",
      initials: "AM",
      avatar: "/avatars/02.png",
    },
    action: "started a new Action Flow",
    target: "Incident Response #402",
    timestamp: "15 mins ago",
  },
  {
    id: "act_3",
    user: {
      name: "System",
      initials: "SYS",
      avatar: "",
    },
    action: "automatically approved",
    target: "Expense Report #9921",
    timestamp: "1 hour ago",
  },
  {
    id: "act_4",
    user: {
      name: "David Kim",
      initials: "DK",
      avatar: "/avatars/03.png",
    },
    action: "commented on",
    target: "New Hire: Alex M.",
    timestamp: "3 hours ago",
  },
  {
    id: "act_5",
    user: {
      name: "Sarah Wilson",
      initials: "SW",
      avatar: "/avatars/04.png",
    },
    action: "requested changes on",
    target: "Marketing Campaign Q1",
    timestamp: "5 hours ago",
  },
];

interface RecentActivityProps {
  className?: string;
}

export function RecentActivity({ className }: RecentActivityProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest updates from your team and Action Flows.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {mockActivity.map((activity) => (
            <div key={activity.id} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback>{activity.user.initials}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.user.name} <span className="text-muted-foreground font-normal">{activity.action}</span> <span className="font-semibold">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
