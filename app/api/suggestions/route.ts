import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { improvementSchema } from "../analyze/schema";

export async function POST(req: Request) {
  const { resumeText } = await req.json();
  const result = streamObject({
    model: openai("gpt-4.1-mini"),
    schema: improvementSchema,
    prompt: `Analyze this resume. Find 5 weak bullet points that lack metrics or impact and rewrite them to be stronger with specific numbers. Also score each section 0-100.
RESUME:
${resumeText}`,
  });

  return result.toTextStreamResponse();
}
