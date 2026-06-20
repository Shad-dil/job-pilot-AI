import { getUserAnalysisById } from "@/app/actions/actions";
import { redirect } from "next/navigation";
import React from "react";
import AnalysisClient from "./AnalysisClient";

const page = async ({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) => {
  const { analysisId } = await params;
  const analysis = await getUserAnalysisById(analysisId);
  if (!analysis) redirect("/dashboard");
  return (
    <AnalysisClient
      analysis={analysis}
      rawText={analysis.resume.rawText}
      filename={analysis.resume.filename}
    />
  );
};

export default page;
