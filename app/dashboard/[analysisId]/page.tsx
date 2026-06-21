// import { getUserAnalysisById } from "@/app/actions/actions";
import { redirect } from "next/navigation";
import React from "react";
import AnalysisClient from "./AnalysisClient";
import { getUserAnalysisById } from "@/app/actions/actions";

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
      rawText={analysis?.resume?.rawText as string}
      filename={analysis?.resume?.filename as string}
    />
  );
};

export default page;
