// app/api/analyze/route.ts
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { resumeSchema } from "./schema";

export async function POST(req: Request) {
  const { resumeText, jobDescription, targetType, role, level } =
    await req.json();

  const targetContext =
    targetType === "jd" && jobDescription
      ? `The candidate is applying for this specific job:\n${jobDescription}`
      : role
        ? `The candidate is targeting a ${level ?? "Mid"} level ${role} role. Evaluate against industry standards.`
        : `Do a general resume analysis focusing on clarity, impact, and professionalism.`;

  try {
    const result = streamObject({
      model: openai("gpt-4.1-nano"),
      schema: resumeSchema,
      prompt: `You are an expert technical recruiter and resume analyst.

${targetContext}

Analyze the resume below. Be specific — reference actual content from the resume, not generic advice.

For bulletImprovements: find weak bullets that lack metrics or impact. Rewrite them to be stronger.
For atsScore: evaluate if the resume would pass automated screening systems.
For missingKeywords: only include keywords relevant to the target role.

RESUME:
${resumeText}`,
    });

    return result.toTextStreamResponse();
  } catch (e) {
    return new Response(e instanceof Error ? e.message : "Analysis failed", {
      status: 500,
    });
  }
}
