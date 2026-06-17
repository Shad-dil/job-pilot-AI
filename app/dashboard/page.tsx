// app/dashboard/page.tsx
// import { getUserAnalyses } from "@/actions/analysis";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { getUserAnalyses } from "../actions/actions";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const analyses = await getUserAnalyses();

  return <DashboardClient analyses={analyses} user={session.user} />;
}
