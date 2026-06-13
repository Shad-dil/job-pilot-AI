"use server";
import { extractText } from "unpdf";

export async function parsePdf(file: File) {
  const arrayBuffer = await file.arrayBuffer();

  const { text } = await extractText(new Uint8Array(arrayBuffer));

  return text;
}

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
