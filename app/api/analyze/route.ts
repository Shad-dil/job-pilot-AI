import { openai } from "@ai-sdk/openai";
import { streamObject, streamText } from "ai";
import { resumeSchema } from "./schema";

export async function POST(req: Request) {
  const { resumeText } = await req.json();

  try {
    const result = streamObject({
      model: openai("gpt-4.1-nano"),
      schema: resumeSchema,
      prompt: `You are a professional resume analyst. Analyze the resume return ONLY valid JSON, no markdown, no backticks.
RESUME:
${resumeText}`,
    });
    return result.toTextStreamResponse();
  } catch (e) {
    return new Response(e instanceof Error ? e.message : "not able to parse", {
      status: 500,
    });
  }
}
