import { Skeleton } from "@/components/ui/skeleton";

export default function AnalysisLoading() {
  return (
    <main
      className="min-h-screen pt-20"
      style={{ background: "var(--bg-deep)" }}
    >
      {/* Top bar skeleton */}
      <div
        className="sticky top-16 z-40 border-b border-white/7 px-4 py-3 flex items-center justify-between"
        style={{ background: "rgba(10,15,30,0.95)" }}
      >
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-24 bg-white/10" />
          <Skeleton className="h-4 w-48 bg-white/5" />
        </div>
        <Skeleton className="h-8 w-20 rounded-full bg-white/10" />
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 h-[calc(100vh-128px)]">
        {/* Left — resume preview skeleton */}
        <div className="p-6 border-r border-white/7 overflow-hidden">
          <div className="bg-white rounded-xl p-8 h-full space-y-4">
            {/* Name */}
            <Skeleton className="h-7 w-48 mx-auto bg-gray-200" />
            <Skeleton className="h-3 w-64 mx-auto bg-gray-100" />
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <Skeleton className="h-4 w-32 bg-gray-200" />
              <Skeleton className="h-3 w-full bg-gray-100" />
              <Skeleton className="h-3 w-full bg-gray-100" />
              <Skeleton className="h-3 w-4/5 bg-gray-100" />
            </div>
            <div className="pt-2 space-y-2">
              <Skeleton className="h-4 w-40 bg-gray-200" />
              <Skeleton className="h-3 w-full bg-gray-100" />
              <Skeleton className="h-3 w-full bg-gray-100" />
              <Skeleton className="h-3 w-3/4 bg-gray-100" />
            </div>
            <div className="pt-2 space-y-2">
              <Skeleton className="h-4 w-28 bg-gray-200" />
              <Skeleton className="h-3 w-full bg-gray-100" />
              <Skeleton className="h-3 w-5/6 bg-gray-100" />
            </div>
          </div>
        </div>

        {/* Right — AI panel skeleton */}
        <div className="p-6 space-y-5 overflow-hidden">
          {/* Score card */}
          <div
            className="rounded-2xl p-5 border border-white/7"
            style={{ background: "var(--bg-card)" }}
          >
            <Skeleton className="h-5 w-36 bg-white/10 mb-4" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-16 rounded-xl bg-white/10" />
              <Skeleton className="h-16 rounded-xl bg-white/5" />
            </div>
          </div>

          {/* Get suggestions button skeleton */}
          <Skeleton className="h-12 w-full rounded-xl bg-indigo-500/20" />

          {/* Hint skeleton */}
          <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
        </div>
      </div>
    </main>
  );
}
