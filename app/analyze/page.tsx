"use client";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { resumeSchema } from "@/app/api/analyze/schema";
import { parsePdf, saveAnalysis, saveGuestAnalysis } from "../actions/actions";
import { z } from "zod";
import ResumeScanner from "@/components/ResumeScanner";

type ResumeAnalysis = z.infer<typeof resumeSchema>;

export default function AnalyzePage() {
  const [resume, setResume] = useState("");
  const [jd, setJD] = useState("");
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const { submit, error, object, isLoading } = useObject({
    api: "/api/analyze",
    schema: resumeSchema,
    onFinish: ({ object }) => {
      // Stream done → show results
      if (object?.matchScore) setShowResults(true);
    },
  });

  const scoreColor = (s: number) =>
    s >= 75 ? "#22C55E" : s >= 50 ? "#F59E0B" : "#EF4444";

  const handleFileUpload = async (file: File) => {
    setParseError("");
    setFileName(file.name);
    setShowResults(false); // reset results on new file
    try {
      const data = await parsePdf(file);
      setResume(data);
    } catch {
      setParseError("Failed to parse PDF. Try a different file.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) return;
    setShowResults(false); // reset on re-analyze
    submit({
      resumeText: resume.slice(0, 3000),
      jobDescription: jd,
      targetType: jd ? "jd" : "general",
    });
  };

  const handleOptimize = async () => {
    if (!object?.matchScore) return;
    setOptimizeLoading(true);

    if (!session?.user) {
      try {
        const token = await saveGuestAnalysis({
          filename: fileName,
          rawText: resume,
          score: object.matchScore as number,
          resultJson: object,
          targetText: jd || undefined,
        });
        const callbackUrl = encodeURIComponent(`/dashboard?claim=${token}`);
        router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
      } catch (e) {
        console.error(e);
        setOptimizeLoading(false);
      }
      return;
    }

    try {
      const result = await saveAnalysis({
        filename: fileName,
        rawText: resume,
        role: "general",
        level: "Mid",
        targetType: jd ? "jd" : "general",
        targetText: jd || undefined,
        score: object.matchScore as number,
        resultJson: object,
      });

      // Go directly to the analysis editor, not just dashboard
      router.push(`/dashboard/${result?.analysisId}`);
    } catch (e) {
      console.error(e);
      setOptimizeLoading(false);
    }
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
        }}
      >
        {/* Loading overlay */}
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

        {/* Form — always visible so user can re-analyze with different JD */}
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
                        style={{ fontSize: 11, color: "rgba(136,146,164,0.6)" }}
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
              {error && (
                <p
                  style={{
                    color: "#EF4444",
                    fontSize: 13,
                    textAlign: "center",
                    marginBottom: 12,
                  }}
                >
                  {error.message}
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
                ) : showResults ? (
                  "Re-analyze →"
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

        {/* Results — shown on same page, no redirect */}
        {showResults && object && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Result header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "Space Grotesk,sans-serif",
                    fontSize: 24,
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  Analysis Results
                </h2>
                <p style={{ fontSize: 13, color: "var(--slate)" }}>
                  📄 {fileName}
                </p>
              </div>
              {jd && (
                <span
                  style={{
                    fontSize: 12,
                    padding: "4px 12px",
                    borderRadius: 8,
                    background: "rgba(99,102,241,0.12)",
                    color: "#818CF8",
                    border: "1px solid rgba(99,102,241,0.2)",
                  }}
                >
                  Targeted: Custom JD
                </span>
              )}
            </div>

            {/* Score row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              <ScoreCard
                label="Match Score"
                score={object?.matchScore}
                scoreColor={scoreColor}
                description={object?.summary}
              />
              <ScoreCard
                label="ATS Score"
                score={object?.atsScore?.overall}
                scoreColor={scoreColor}
                sub={[
                  {
                    label: "Keyword Match",
                    val: object?.atsScore?.keywordMatch,
                  },
                  { label: "Format Score", val: object?.atsScore?.formatScore },
                ]}
              />
            </div>

            {/* Top recommendation */}
            {object?.topRecommendation && (
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: 12,
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  borderLeft: "3px solid #6366F1",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#818CF8",
                  }}
                >
                  Top priority:{" "}
                </span>
                <span style={{ fontSize: 14, color: "var(--white)" }}>
                  {object.topRecommendation}
                </span>
              </div>
            )}

            {/* Strengths + Weaknesses */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              <div
                style={{
                  background: "var(--bg-card)",
                  borderRadius: 16,
                  border: "1px solid rgba(34,197,94,0.2)",
                  padding: 24,
                }}
              >
                <h3
                  style={{
                    fontFamily: "Space Grotesk,sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "rgba(34,197,94,0.15)",
                      color: "#22C55E",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                    }}
                  >
                    ✓
                  </span>
                  Strengths
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {object?.strengths?.map(
                    (
                      s: { point?: string; reason?: string } | undefined,
                      i: number,
                    ) => (
                      <div
                        key={i}
                        style={{
                          paddingLeft: 12,
                          borderLeft: "2px solid rgba(34,197,94,0.3)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            marginBottom: 2,
                            color: "var(--white)",
                          }}
                        >
                          {s?.point}
                        </p>
                        <p style={{ fontSize: 12, color: "var(--slate)" }}>
                          {s?.reason}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div
                style={{
                  background: "var(--bg-card)",
                  borderRadius: 16,
                  border: "1px solid rgba(239,68,68,0.2)",
                  padding: 24,
                }}
              >
                <h3
                  style={{
                    fontFamily: "Space Grotesk,sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "rgba(239,68,68,0.15)",
                      color: "#EF4444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                    }}
                  >
                    ✗
                  </span>
                  Needs Work
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {object?.strengths?.map(
                    (
                      s: { point?: string; reason?: string } | undefined,
                      i: number,
                    ) => (
                      <div
                        key={i}
                        style={{
                          paddingLeft: 12,
                          borderLeft: "2px solid rgba(34,197,94,0.3)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            marginBottom: 2,
                            color: "var(--white)",
                          }}
                        >
                          {s?.point}
                        </p>
                        <p style={{ fontSize: 12, color: "var(--slate)" }}>
                          {s?.reason}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* ATS Issues */}
            {object?.atsScore?.issues && object.atsScore.issues.length > 0 && (
              <div
                style={{
                  background: "var(--bg-card)",
                  borderRadius: 16,
                  border: "1px solid rgba(245,158,11,0.2)",
                  padding: 24,
                }}
              >
                <h3
                  style={{
                    fontFamily: "Space Grotesk,sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                    marginBottom: 16,
                    color: "#F59E0B",
                  }}
                >
                  ⚠ ATS Issues
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {object.atsScore.issues.map(
                    (issue: string | undefined, i: number) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 10,
                          fontSize: 13,
                          color: "var(--slate)",
                        }}
                      >
                        <span style={{ color: "#F59E0B", flexShrink: 0 }}>
                          •
                        </span>
                        {issue}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Missing Keywords */}
            {object?.missingKeywords && object.missingKeywords.length > 0 && (
              <div
                style={{
                  background: "var(--bg-card)",
                  borderRadius: 16,
                  border: "1px solid rgba(99,102,241,0.2)",
                  padding: 24,
                }}
              >
                <h3
                  style={{
                    fontFamily: "Space Grotesk,sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                    marginBottom: 16,
                  }}
                >
                  Missing Keywords
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {object.missingKeywords.map(
                    (kw: string | undefined, i: number) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 12,
                          padding: "5px 12px",
                          borderRadius: 8,
                          background: "rgba(99,102,241,0.12)",
                          color: "#818CF8",
                          border: "1px solid rgba(99,102,241,0.22)",
                          fontWeight: 500,
                        }}
                      >
                        {kw}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Optimize CTA */}
            <div style={{ textAlign: "center", padding: "20px 0 40px" }}>
              <button
                onClick={handleOptimize}
                disabled={optimizeLoading}
                style={{
                  padding: "16px 40px",
                  borderRadius: 14,
                  border: "none",
                  background: "linear-gradient(135deg,#6366F1,#818CF8)",
                  color: "white",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: optimizeLoading ? "not-allowed" : "pointer",
                  fontFamily: "Space Grotesk,sans-serif",
                  boxShadow: "0 4px 28px rgba(99,102,241,0.45)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {optimizeLoading ? (
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
                    Saving...
                  </>
                ) : session ? (
                  "✨ Optimize My Resume →"
                ) : (
                  "🔐 Sign in to Optimize Resume →"
                )}
              </button>
              {!session && (
                <p
                  style={{ fontSize: 12, color: "var(--slate)", marginTop: 10 }}
                >
                  Free account required — saves your analysis and unlocks AI
                  improvements
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
function ScoreCard({
  label,
  score,
  scoreColor,
  description,
  sub,
}: {
  label: string;
  score: number | undefined;
  scoreColor: (s: number) => string;
  description?: string;
  sub?: { label: string; val: number | undefined }[];
}) {
  const s = score ?? 0;
  const color = scoreColor(s);

  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderRadius: 16,
        border: `1px solid ${color}30`,
        padding: 20,
      }}
    >
      {/* Top: circle + label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: description || sub ? 16 : 0,
        }}
      >
        <div
          style={{
            flexShrink: 0,
            width: 72,
            height: 72,
            borderRadius: "50%",
            border: `3px solid ${color}`,
            boxShadow: `0 0 20px ${color}30`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color,
              fontFamily: "Space Grotesk,sans-serif",
              lineHeight: 1,
            }}
          >
            {score !== undefined ? `${s}%` : "—"}
          </span>
        </div>
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--slate)",
            margin: 0,
          }}
        >
          {label}
        </p>
      </div>

      {/* Description below on all screen sizes */}
      {description && (
        <p
          style={{
            fontSize: 13,
            color: "var(--slate)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {description}
        </p>
      )}

      {/* Sub scores */}
      {sub && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginTop: description ? 12 : 0,
          }}
        >
          {sub.map(
            ({ label: l, val }) =>
              val !== undefined && (
                <div key={l}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 12, color: "var(--slate)" }}>
                      {l}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: scoreColor(val),
                      }}
                    >
                      {val}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 999,
                        width: `${val}%`,
                        background: scoreColor(val),
                        transition: "width 1s ease",
                      }}
                    />
                  </div>
                </div>
              ),
          )}
        </div>
      )}
    </div>
  );
}
