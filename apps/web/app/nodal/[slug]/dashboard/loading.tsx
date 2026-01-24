
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex h-full flex-col gap-8 p-8 max-w-[1600px] mx-auto w-full animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <div className="flex gap-2">
           <Skeleton className="h-9 w-[100px]" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 border rounded-xl bg-card space-y-2">
             <Skeleton className="h-4 w-[100px]" />
             <Skeleton className="h-8 w-[60px]" />
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
         <Skeleton className="h-10 flex-1 max-w-sm" />
         <Skeleton className="h-10 w-[100px]" />
      </div>

      {/* List Items */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col gap-4 p-4 border rounded-lg bg-card md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                 <Skeleton className="h-5 w-5 rounded-full" />
                 <Skeleton className="h-5 w-[250px]" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-4 w-[80px] rounded-full" />
                <Skeleton className="h-4 w-[120px]" />
              </div>
            </div>
            <div className="flex items-start gap-4 md:items-center">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
