"use server";
import { extractText } from "unpdf";

export async function parsePdf(file: File) {
  const arrayBuffer = await file.arrayBuffer();

  const { text } = await extractText(new Uint8Array(arrayBuffer));

  return Array.isArray(text) ? text.join("\n") : text;
}

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { structuredResumeSchema } from "../api/parse-resume/schema";

export async function registerUser(formData: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    const hashPassword = await bcrypt.hash(formData.password, 10);
    const user = await prisma.user.create({
      data: {
        name: formData.name,
        email: formData.email,
        password: hashPassword,
      },
    });

    return { success: true, user };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to Signup",
    };
  }
}

export async function getAnalysisResume(fileName: string) {
  return prisma.analysis.findFirst({
    where: {
      resume: { filename: fileName },
    },
    include: { resume: true },
    orderBy: { createdAt: "desc" },
  });
}
export async function getUserAnalyses() {
  const session = await auth();
  if (!session?.user) return [];

  const userId = (session.user as any).id as string;

  return prisma.analysis.findMany({
    where: { userId },
    include: {
      resume: {
        select: {
          filename: true,
          structuredJson: true, // ← for preview
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserAnalysisById(id: string) {
  const session = await auth();
  if (!session?.user) return;
  const userId = session.user.id;
  return prisma.analysis.findFirst({
    where: { id, userId },
    include: {
      resume: {
        select: { filename: true, rawText: true, structuredJson: true },
      },
    },
  });
}
export async function saveAnalysis(data: {
  filename: string;
  rawText: string;
  role: string;
  level: string;
  targetType: string;
  targetText?: string;
  score: number;
  resultJson: object;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Not Authenticated");

  const userId = (session.user as any).id as string;
  if (!userId) throw new Error("User ID not found");

  const resume = await prisma.resume.create({
    data: {
      userId, // ← use userId variable, not session!.user.id
      filename: data.filename,
      rawText: data.rawText,
    },
  });
  parseAndSaveStructuredResume(data.rawText, resume.id).catch(console.error);
  const analysis = await prisma.analysis.create({
    data: {
      userId, // ← use userId variable, not session?.user?.id
      resumeId: resume.id,
      role: data.role,
      level: data.level,
      targetType: data.targetType,
      targetText: data.targetText,
      score: data.score,
      resultJson: data.resultJson,
    },
  });

  revalidatePath("/dashboard");
  return { resumeId: resume.id, analysisId: analysis.id };
}

export async function updateResumeText(resumeId: string, rawText: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  await prisma.resume.update({
    where: {
      id: resumeId,
    },
    data: {
      rawText,
    },
  });
}

// Parsing Resume in structured JSON

export async function parseAndSaveStructuredResume(
  rawText: string,
  resumeId: string,
) {
  try {
    console.log("Calling parse resume");
    const { object } = await generateObject({
      model: openai("gpt-4.1-nano"),
      schema: structuredResumeSchema,
      prompt: `Extract all information from this resume into structured JSON.
Be precise — extract exact text, don't paraphrase bullets.
For skills, group them by category if possible.

RESUME:
${rawText.slice(0, 4000)}`,
    });

    await prisma.resume.update({
      where: { id: resumeId },
      data: { structuredJson: object },
    });
    return object;
  } catch (e) {
    console.log(e instanceof Error ? e.message : "Something went wrong");
  }
}

// ── Save guest analysis (not logged in) ──────────────────────
export async function saveGuestAnalysis(data: {
  filename: string;
  rawText: string;
  score: number;
  resultJson: object;
  targetText?: string;
}) {
  const tempToken = crypto.randomUUID();

  console.log("Saving guest analysis:", {
    filename: data.filename,
    rawTextLength: data.rawText?.length,
    score: data.score,
  });

  await prisma.analysis.create({
    data: {
      userId: null,
      resumeId: null,
      tempToken,
      role: "general",
      level: "Mid",
      targetType: data.targetText ? "jd" : "general",
      targetText: data.targetText,
      score: data.score,
      resultJson: data.resultJson,
      guestFilename: data.filename,
      guestRawText: data.rawText, // ← make sure this isn't empty
    },
  });

  console.log("Guest analysis saved with token:", tempToken);
  return tempToken;
}

// ── Claim guest analysis after login ─────────────────────────
export async function claimGuestAnalysis(tempToken: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const userId = (session.user as any).id as string;
  if (!userId) throw new Error("User ID not found");

  console.log("Claiming token:", tempToken, "for user:", userId);

  const guestAnalysis = await prisma.analysis.findUnique({
    where: { tempToken },
  });

  console.log("Found guest analysis:", {
    id: guestAnalysis?.id,
    hasRawText: !!guestAnalysis?.guestRawText,
    rawTextLength: guestAnalysis?.guestRawText?.length,
    filename: guestAnalysis?.guestFilename,
  });

  if (!guestAnalysis) {
    console.log("No guest analysis found for token:", tempToken);
    return null;
  }

  // Create resume
  const resume = await prisma.resume.create({
    data: {
      userId,
      filename: guestAnalysis.guestFilename ?? "resume.pdf",
      rawText: guestAnalysis.guestRawText ?? "",
    },
  });

  console.log("Resume created:", resume.id);

  // Parse structured resume — with explicit error handling
  if (guestAnalysis.guestRawText && guestAnalysis.guestRawText.length > 0) {
    console.log("Starting parseAndSaveStructuredResume for:", resume.id);
    parseAndSaveStructuredResume(guestAnalysis.guestRawText, resume.id)
      .then(() =>
        console.log("✅ Structured JSON saved for claimed resume:", resume.id),
      )
      .catch((e) =>
        console.error("❌ Parse failed for claimed resume:", e.message),
      );
  } else {
    console.log("⚠ No rawText to parse for resume:", resume.id);
  }

  // Update analysis
  const updated = await prisma.analysis.update({
    where: { tempToken },
    data: {
      userId,
      resumeId: resume.id,
      tempToken: null,
      guestFilename: null,
      guestRawText: null,
    },
  });

  console.log("Analysis claimed successfully:", updated.id);
  // revalidatePath("/dashboard");
  return updated.id;
}

// ── Get analysis by ID (for dashboard/[analysisId]) ──────────
export async function getAnalysisById(id: string) {
  const session = await auth();
  if (!session?.user) return null;

  const userId = (session.user as any).id as string;

  return prisma.analysis.findFirst({
    where: { id, userId },
    include: {
      resume: {
        select: {
          filename: true,
          rawText: true,
          structuredJson: true,
        },
      },
    },
  });
}

// actions/analysis.ts
export async function getStructuredResume(resumeId: string) {
  const session = await auth();
  if (!session?.user) return null;

  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    select: { structuredJson: true },
  });

  return resume?.structuredJson ?? null;
}
