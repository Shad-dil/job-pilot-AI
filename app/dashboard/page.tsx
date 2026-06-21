// app/dashboard/page.tsx
// import { getUserAnalyses } from "@/actions/analysis";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { claimGuestAnalysis, getUserAnalyses } from "../actions/actions";
import { Suspense } from "react";
type Analysis = {
  id: string;
  score: number;
  role: string;
  level: string;
  targetType: string;
  createdAt: Date;
  resultJson: any;
  resume: { filename: string };
};
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ claim?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const { claim: claimToken } = await searchParams;
  let claimedAnalysisId: string | null = null;

  if (claimToken) {
    try {
      claimedAnalysisId = await claimGuestAnalysis(claimToken);
    } catch (e) {
      console.error("Claim failed:", e instanceof Error ? e.message : e);
      // Don't throw — just continue to show dashboard
    }
  }

  // Redirect to analysis if claimed
  if (claimedAnalysisId) {
    redirect(`/dashboard/${claimedAnalysisId}`);
  }

  // If claim succeeded → go directly to that analysis

  const analyses = await getUserAnalyses();

  return (
    <Suspense
      fallback={
        <main
          style={{
            background: "var(--bg-deep)",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span className="spinner" />
        </main>
      }
    >
      <DashboardClient analyses={analyses} user={session.user} />
    </Suspense>
  );
}
