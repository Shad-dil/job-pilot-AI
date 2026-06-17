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
// actions/analysis.ts — add this
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
