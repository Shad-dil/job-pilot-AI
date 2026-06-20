"use client";
// import { useObject } from "ai/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { resumeSchema } from "@/app/api/analyze/schema";
import { getAnalysisResume, parsePdf, saveAnalysis } from "../actions/actions";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { z } from "zod";
import ResumeScanner from "@/components/ResumeScanner";

type ResumeAnalysis = z.infer<typeof resumeSchema>;
export default function AnalyzePage() {
  const [resume, setResume] = useState<string>("");
  const { data: session } = useSession();
  const [jd, setJD] = useState("");
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [cachedResult, setCacheResult] = useState<ResumeAnalysis | null>(null);
  const hasRedirected = useRef(false);
  const router = useRouter();
  const { submit, error, object, isLoading } = useObject({
    api: "/api/analyze",
    schema: resumeSchema,
  });
  // In your page, save to localStorage after first analysis

  useEffect(() => {
    if (object?.matchScore && !isLoading) {
      if (hasRedirected.current) return; // ← prevent double run
      hasRedirected.current = true;

      const run = async () => {
        localStorage.setItem(
          "latestAnalysis",
          JSON.stringify({
            result: object,
            fileName,
            jd,
            rawText: resume,
          }),
        );

        if (session?.user) {
          try {
            const score = object.matchScore;
            if (!score) return;
            const result = await saveAnalysis({
              filename: fileName,
              rawText: resume,
              role: "general",
              level: "Mid",
              targetType: jd ? "jd" : "general",
              targetText: jd || undefined,
              score: score,
              resultJson: object,
            });

            if (result) {
              localStorage.setItem(
                "latestAnalysisIds",
                JSON.stringify({
                  resumeId: result.resumeId,
                  analysisId: result.analysisId,
                }),
              );
            }

            // localStorage.removeItem("latestAnalysis");
          } catch (e) {
            console.error("Failed to save to DB:", e);
          }
        }

        router.push("/analyze/result");
      };
      run();
    }
  }, [object, isLoading]);

  const handleFileUpload = async (file: File) => {
    setParseError("");
    setFileName(file.name);
    try {
      const data = await parsePdf(file);
      setResume(data);
      const key = `analysis_${data.slice(0, 50)}`;
      const cached = localStorage.getItem(key);
      if (cached) {
        setCacheResult(JSON.parse(cached));
      }
      const dbResult = await getAnalysisResume(file.name);
      if (dbResult) {
        setCacheResult(dbResult.resultJson as ResumeAnalysis);
        localStorage.setItem(key, JSON.stringify(dbResult.resultJson));
      }
    } catch {
      setParseError("Failed to parse PDF. Try a different file.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) return;

    hasRedirected.current = false; // ← reset for new analysis

    if (cachedResult) {
      localStorage.setItem(
        "latestAnalysis",
        JSON.stringify({
          result: cachedResult,
          fileName,
          jd,
        }),
      );
      router.push("/analyze/result");
      return;
    }

    submit({
      resumeText: resume,
      jobDescription: jd,
      targetType: jd ? "jd" : "general",
    });
  };

  return (
    <main
      style={{
        background: "var(--bg-deep)",
        minHeight: "100vh",
        color: "var(--white)",
        paddingTop: 80,
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "40px 24px",
          position: "relative",
          overflow: "hidden",
        }}
        // className="relative overflow-hidden rounded-[20px] border border-indigo-500/20 bg-[var(--bg-card)]"
      >
        {isLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[rgba(3,7,18,0.75)] backdrop-blur-sm">
            <div className="w-full max-w-xl">
              <ResumeScanner />
            </div>

            <div className="text-center">
              <p className="text-xl font-semibold text-white">
                Analyzing your resume...
              </p>
              <p className="mt-2 text-sm text-slate-400">
                This usually takes 10–20 seconds.
              </p>
            </div>
          </div>
        )}
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1
            style={{
              fontSize: 38,
              fontWeight: 700,
              fontFamily: "Space Grotesk,sans-serif",
              marginBottom: 10,
            }}
          >
            Resume Analysis
          </h1>

          <p style={{ color: "var(--slate)" }}>
            Upload your resume and optionally paste a job description for a
            targeted analysis.
          </p>
        </div>

        {/* Input Form */}
        {
          <form onSubmit={handleSubmit}>
            <div
              style={{
                background: "var(--bg-card)",
                borderRadius: 20,
                border: "1px solid rgba(99,102,241,0.2)",
                overflow: "hidden",
                marginBottom: 32,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  borderBottom: "1px solid rgba(99,102,241,0.12)",
                }}
              >
                {/* Resume upload */}
                <div
                  style={{
                    padding: 24,
                    borderRight: "1px solid rgba(99,102,241,0.12)",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#6366F1",
                      marginBottom: 12,
                    }}
                  >
                    Your Resume
                  </label>

                  <label
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 200,
                      borderRadius: 12,
                      cursor: "pointer",
                      gap: 12,
                      border: `2px dashed ${fileName ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
                      background: fileName
                        ? "rgba(99,102,241,0.06)"
                        : "rgba(255,255,255,0.02)",
                      transition: "all 0.2s",
                    }}
                  >
                    <input
                      type="file"
                      accept=".pdf"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f);
                      }}
                    />

                    {fileName ? (
                      <>
                        <span style={{ fontSize: 32 }}>📄</span>
                        <span
                          style={{
                            fontSize: 13,
                            color: "#22C55E",
                            fontWeight: 600,
                          }}
                        >
                          {fileName}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--slate)" }}>
                          Click to change
                        </span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 32 }}>📁</span>
                        <span style={{ fontSize: 13, color: "var(--slate)" }}>
                          Click to upload PDF
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "rgba(136,146,164,0.6)",
                          }}
                        >
                          PDF files only
                        </span>
                      </>
                    )}
                  </label>
                  {parseError && (
                    <p style={{ color: "#EF4444", fontSize: 12, marginTop: 8 }}>
                      {parseError}
                    </p>
                  )}
                  {/* {resume && !parseError && (
                    <p style={{ color: "#22C55E", fontSize: 12, marginTop: 8 }}>
                      ✓ your resume extracted successfully
                    </p>
                  )} */}
                </div>

                {/* JD textarea */}
                <div style={{ padding: 24 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#6366F1",
                      marginBottom: 12,
                    }}
                  >
                    Job Description{" "}
                    <span
                      style={{
                        color: "var(--slate)",
                        textTransform: "none",
                        letterSpacing: 0,
                        fontWeight: 400,
                      }}
                    >
                      (optional)
                    </span>
                  </label>
                  <textarea
                    value={jd}
                    onChange={(e) => setJD(e.target.value)}
                    placeholder="Paste the job description here for a targeted analysis. Leave empty for a general review."
                    style={{
                      width: "100%",
                      height: 200,
                      background: "rgba(255,255,255,0.04)",
                      color: "var(--white)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 13,
                      fontFamily: "Inter,sans-serif",
                      resize: "none",
                      outline: "none",
                      lineHeight: 1.6,
                    }}
                  />
                </div>
              </div>

              {/* Submit */}
              <div style={{ padding: 24 }}>
                {(error || parseError) && (
                  <p
                    style={{
                      color: "#EF4444",
                      fontSize: 13,
                      textAlign: "center",
                      marginBottom: 12,
                    }}
                  >
                    {error?.message || parseError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isLoading || !resume}
                  style={{
                    width: "100%",
                    padding: "14px 0",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg,#6366F1,#818CF8)",
                    color: "white",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: isLoading || !resume ? "not-allowed" : "pointer",
                    opacity: !resume ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontFamily: "Space Grotesk,sans-serif",
                    boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                    transition: "all 0.2s",
                  }}
                >
                  {isLoading ? (
                    <>
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "white",
                          borderRadius: "50%",
                          display: "inline-block",
                          animation: "spin 0.7s linear infinite",
                        }}
                      />{" "}
                      Analyzing...
                    </>
                  ) : (
                    "Run full analysis →"
                  )}
                </button>
                <p
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    color: "var(--slate)",
                    marginTop: 10,
                  }}
                >
                  {jd
                    ? "Targeted analysis against your job description"
                    : "General resume analysis — add a JD for better results"}
                </p>
              </div>
            </div>
          </form>
        }

        {/* ── RESULTS ── */}
      </div>
    </main>
  );
}

// ── Score Card Component ──────────────────────────────────────
