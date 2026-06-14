// app/api/analyze/schema.ts
import { z } from "zod";

export const resumeSchema = z.object({
  matchScore: z.number().describe("Overall match score 0-100"),
  summary: z.string().describe("2 sentence overall assessment"),

  atsScore: z.object({
    overall: z.number().describe("ATS compatibility score 0-100"),
    keywordMatch: z.number().describe("Keyword match score 0-100"),
    formatScore: z.number().describe("Format friendliness score 0-100"),
    issues: z.array(z.string()).describe("Specific ATS problems found"),
  }),

  strengths: z
    .array(
      z.object({
        point: z.string(),
        reason: z.string(),
      }),
    )
    .describe("3-5 things done well"),

  weaknesses: z
    .array(
      z.object({
        point: z.string(),
        fix: z.string(),
      }),
    )
    .describe("3-5 gaps or weak points"),

  missingKeywords: z
    .array(z.string())
    .describe("5-8 keywords missing from resume"),

  topRecommendation: z.string().describe("Single most important fix"),
});

export const improvementSchema = z.object({
  bulletImprovements: z
    .array(
      z.object({
        original: z.string().describe("Exact original bullet from resume"),
        improved: z.string().describe("Rewritten with metrics and impact"),
        reason: z.string().describe("Why this version is stronger"),
        section: z.string().describe("Which section this bullet is from"),
      }),
    )
    .describe("5-8 weak bullets with AI rewrites"),
  sectionScores: z.object({
    summary: z.object({ score: z.number(), feedback: z.string() }),
    experience: z.object({ score: z.number(), feedback: z.string() }),
    skills: z.object({ score: z.number(), feedback: z.string() }),
    education: z.object({ score: z.number(), feedback: z.string() }),
  }),
});
