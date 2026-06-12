import { z } from "zod";

export const resumeSchema = z.object({
  summary: z.string().describe("Resume Top Summary or Profile Summary"),
  skills: z.array(z.string()).describe("list of all skills mention in resume"),
  experience: z.string().describe("experience in resume"),
});
