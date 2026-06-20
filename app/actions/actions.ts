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

  const userId = session?.user.id;

  return prisma.analysis.findMany({
    where: { userId },
    include: { resume: { select: { filename: true } } },
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

  const existing = await prisma.analysis.findFirst({
    where: {
      userId,
      score: data.score,
      resume: { filename: data.filename },
    },
  });

  if (existing) {
    console.log("⏭ Already exists, skipping save");
    return { resumeId: existing.resumeId, analysisId: existing.id };
  }

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
