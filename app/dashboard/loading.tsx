import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main
      className="min-h-screen pt-20"
      style={{ background: "var(--bg-deep)" }}
    >
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 bg-white/10" />
            <Skeleton className="h-4 w-32 bg-white/5" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl bg-white/10" />
        </div>

        {/* Cards grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-5 border border-white/7"
              style={{ background: "var(--bg-card)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded bg-white/10" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-36 bg-white/10" />
                    <Skeleton className="h-3 w-20 bg-white/5" />
                  </div>
                </div>
                <Skeleton className="w-11 h-11 rounded-full bg-white/10" />
              </div>
              <div className="flex gap-2 mb-3">
                <Skeleton className="h-6 w-16 rounded-lg bg-white/10" />
                <Skeleton className="h-6 w-20 rounded-lg bg-white/5" />
              </div>
              <Skeleton className="h-3 w-full bg-white/5" />
              <Skeleton className="h-3 w-3/4 bg-white/5 mt-1.5" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
