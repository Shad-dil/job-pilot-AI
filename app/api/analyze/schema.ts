// app/api/analyze/schema.ts
import { z } from "zod";

export const resumeSchema = z.object({
  matchScore: z.number(),

  interviewProbability: z.object({
    score: z.number(),
    level: z.enum(["Low", "Medium", "High"]),
    reason: z.string(),
  }),

  summary: z.string(),

  atsScore: z.object({
    overall: z.number(),
    keywordMatch: z.number(),
    formatScore: z.number(),
    experienceMatch: z.number(),
  }),

  strengths: z.array(
    z.object({
      point: z.string(),
      reason: z.string(),
    }),
  ),

  hardGaps: z.array(
    z.object({
      title: z.string(),
      impact: z.enum(["High", "Medium", "Low"]),
      reason: z.string(),
      recommendation: z.string(),
    }),
  ),

  skillGaps: z.array(
    z.object({
      skill: z.string(),
      importance: z.enum(["Required", "Preferred"]),
      fix: z.string(),
    }),
  ),

  evidenceGaps: z.array(
    z.object({
      skill: z.string(),
      reason: z.string(),
      suggestion: z.string(),
    }),
  ),

  requiredSkills: z.array(
    z.object({
      skill: z.string(),
      matched: z.boolean(),
    }),
  ),

  preferredSkills: z.array(
    z.object({
      skill: z.string(),
      matched: z.boolean(),
    }),
  ),

  scoreImprovement: z.array(
    z.object({
      action: z.string(),
      scoreIncrease: z.number(),
    }),
  ),

  recruiterFeedback: z.object({
    verdict: z.enum(["Strong Match", "Moderate Match", "Weak Match"]),
    feedback: z.string(),
  }),

  missingKeywords: z.array(z.string()),

  topRecommendation: z.string(),
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

export const structuredJDSchema = z.object({
  title: z.string().describe("Job title e.g. Senior Frontend Developer"),
  company: z.string().describe("Company name"),
  location: z.string().describe("Job location or Remote"),
  employmentType: z
    .string()
    .describe("Full-time, Part-time, Contract, Internship"),
  seniorityLevel: z.string().describe("Junior, Mid, Senior, Lead, Principal"),
  requiredExp: z
    .string()
    .describe("Required years of experience e.g. 3-5 years"),

  requiredSkills: z
    .array(z.string())
    .describe("Must-have skills explicitly stated as required"),
  preferredSkills: z
    .array(z.string())
    .describe("Nice-to-have skills mentioned as preferred or bonus"),

  responsibilities: z
    .array(z.string())
    .describe("Key job responsibilities and duties"),

  keywords: z
    .array(z.string())
    .describe(
      "Important ATS keywords including tools, frameworks, methodologies",
    ),

  qualifications: z.object({
    education: z
      .string()
      .describe("Required education e.g. Bachelor in CS or empty string"),
    certifications: z
      .array(z.string())
      .describe("Required or preferred certifications"),
  }),
});

export type StructuredJD = z.infer<typeof structuredJDSchema>;
