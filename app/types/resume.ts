// types/resume.ts
import { z } from "zod";
import { structuredResumeSchema } from "../api/parse-resume/schema";

export type StructuredResume = z.infer<typeof structuredResumeSchema>;
