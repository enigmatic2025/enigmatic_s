import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="h-full w-full space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-muted animate-pulse rounded-md" />
        <div className="h-10 w-28 bg-muted animate-pulse rounded-md" />
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <div className="h-9 w-64 bg-muted animate-pulse rounded-md" />

        {/* Search Bar Skeleton */}
        <div className="h-10 w-full max-w-sm bg-muted animate-pulse rounded-md" />

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="shadow-none border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
                <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
                <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-3 w-full bg-muted animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
