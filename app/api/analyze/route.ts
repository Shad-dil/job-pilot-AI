// app/api/analyze/route.ts
import { openai } from "@ai-sdk/openai";
import { generateObject, streamObject } from "ai";
import { resumeSchema, structuredJDSchema } from "./schema";

export async function POST(req: Request) {
  const {
    structuredResume,
    jobDescription,
    resumeText,
    targetType,
    role,
    level,
  } = await req.json();

  let structuredJD = null;
  if (jobDescription?.trim()) {
    try {
      const { object } = await generateObject({
        model: openai("gpt-4.1-nano"),
        schema: structuredJDSchema,
        prompt: `Extract structured info from this job description.
Return empty string or empty array if field not found.

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}`,
      });
      structuredJD = object;
    } catch (e) {
      console.error("JD parse failed:", e);
    }
  }
  const candidateContext = structuredResume
    ? `
CANDIDATE PROFILE:
Name: ${structuredResume.name}
Skills: ${structuredResume.skills
        ?.map((s: any) => `${s.category}: ${s.items.join(", ")}`)
        .join(" | ")}
Experience: ${structuredResume.experience
        ?.map(
          (e: any) =>
            `${e.title} at ${e.company} (${e.duration}): ${e.bullets?.join(". ")}`,
        )
        .join(" || ")}
Projects: ${structuredResume.projects
        ?.map((p: any) => `${p.name}: ${p.bullets?.join(". ")}`)
        .join(" || ")}
`
    : `RESUME:\n${resumeText}`;

  const jdContext = structuredJD
    ? `
JOB REQUIREMENTS:
Role: ${structuredJD.title} at ${structuredJD.company}
Required skills: ${structuredJD.requiredSkills.join(", ")}
Preferred skills: ${structuredJD.preferredSkills.join(", ")}
Experience: ${structuredJD.requiredExp}
Seniority: ${structuredJD.seniorityLevel}
Responsibilities: ${structuredJD.responsibilities.slice(0, 5).join(" | ")}
Keywords: ${structuredJD.keywords.join(", ")}
`
    : jobDescription
      ? `JOB DESCRIPTION:\n${jobDescription.slice(0, 2000)}`
      : "Do a general resume analysis.";

  try {
    const result = streamObject({
      model: openai("gpt-5-mini"),
      schema: resumeSchema,
      prompt: `You are a senior technical recruiter.

${candidateContext}

${jdContext}

Instructions:
- matchScore: strict % based on actual skills match (0-100)
- interviewChance: realistic % probability of getting interview
- strengths: ONLY direct matches between candidate and JD requirements
- weaknesses: ONLY gaps between JD requirements and candidate profile  
- missingKeywords: exact keywords from JD not found in candidate profile
- atsScore: ATS compatibility for this specific role
- topRecommendation: single most impactful change
- Be specific — use actual skill names, company names, job titles`,
    });

    return result.toTextStreamResponse();
  } catch (e) {
    return new Response(e instanceof Error ? e.message : "Analysis failed", {
      status: 500,
    });
  }
}
