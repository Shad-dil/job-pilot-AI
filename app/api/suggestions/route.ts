// app/api/suggestions/route.ts
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { improvementSchema } from "../analyze/schema";

export async function POST(req: Request) {
  const { resumeText, targetText, resultJson } = await req.json();

  // Extract context from stored analysis result
  const missingKeywords = resultJson?.missingKeywords ?? [];
  const skillGaps = resultJson?.skillGaps?.map((s: any) => s.skill) ?? [];
  const hardGaps = resultJson?.hardGaps?.map((g: any) => g.title) ?? [];
  const topRec = resultJson?.topRecommendation ?? "";

  const jdContext = targetText
    ? `TARGET JOB DESCRIPTION:\n${targetText.slice(0, 1500)}`
    : "";

  const gapContext =
    missingKeywords.length > 0 || skillGaps.length > 0
      ? `
GAPS IDENTIFIED FROM PREVIOUS ANALYSIS:
- Missing keywords: ${missingKeywords.join(", ")}
- Missing skills: ${skillGaps.join(", ")}
- Critical gaps: ${hardGaps.join(", ")}
- Top recommendation: ${topRec}
`
      : "";

  const result = streamObject({
    model: openai("gpt-4.1"),
    schema: improvementSchema,
    prompt: `You are an expert resume coach helping tailor a resume for a specific job.

${jdContext}

${gapContext}

RESUME:
${resumeText}

Instructions:
- Rewrite weak bullet points to DIRECTLY match the job description requirements
- Naturally weave in missing keywords: ${missingKeywords.slice(0, 5).join(", ")}
- For Summary section: rewrite to align with this specific role and company
- For Experience: focus on achievements that match JD responsibilities  
- For Projects: highlight aspects relevant to the target role
- Each improved bullet should sound natural — don't force keywords awkwardly
- Add specific metrics where possible (%, numbers, scale)
- Score each section based on how well it matches THIS specific JD

Return 5-8 bullet improvements covering Summary, Experience, and Projects sections.`,
  });

  return result.toTextStreamResponse();
}
