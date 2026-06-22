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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const resetForm = () => {
    setResume("");
    setFileName("");
    setJD("");
    setParseError("");
    // setError(null);
    setShowResults(false);

    // Reset the actual file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      className="min-h-screen pt-20"
      style={{ background: "var(--bg-deep)", color: "var(--white)" }}
    >
      <div className="max-w-4xl mx-auto px-4 py-10 relative">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[rgba(3,7,18,0.75)] backdrop-blur-sm rounded-2xl">
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

        {/* ── FORM ── */}
        {(!object || !showResults) && (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1
                className="text-3xl md:text-5xl font-bold mb-3"
                style={{ fontFamily: "Space Grotesk,sans-serif" }}
              >
                Resume Analysis
              </h1>
              <p
                className="text-sm md:text-base"
                style={{ color: "var(--slate)" }}
              >
                Upload your resume and optionally paste a job description for a
                targeted analysis.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div
                className="rounded-2xl overflow-hidden mb-8 border border-indigo-500/20"
                style={{ background: "var(--bg-card)" }}
              >
                {/* Input grid — 2 cols on desktop, 1 col on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-indigo-500/10">
                  {/* Resume upload */}
                  <div className="p-5 md:p-6">
                    <label
                      className="block text-[11px] font-bold tracking-widest uppercase mb-3"
                      style={{ color: "#6366F1" }}
                    >
                      Your Resume
                    </label>
                    <label
                      className="flex flex-col items-center justify-center h-44 md:h-52 rounded-xl cursor-pointer gap-3 transition-all"
                      style={{
                        border: `2px dashed ${fileName ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
                        background: fileName
                          ? "rgba(99,102,241,0.06)"
                          : "rgba(255,255,255,0.02)",
                      }}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFileUpload(f);
                        }}
                      />
                      {fileName ? (
                        <>
                          <span className="text-3xl">📄</span>
                          <span
                            className="text-xs font-semibold text-center px-2 max-w-[180px] truncate"
                            style={{ color: "#22C55E" }}
                          >
                            {fileName}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--slate)" }}
                          >
                            Tap to change
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-3xl">📁</span>
                          <span
                            className="text-sm"
                            style={{ color: "var(--slate)" }}
                          >
                            Tap to upload PDF
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "rgba(136,146,164,0.6)" }}
                          >
                            PDF files only
                          </span>
                        </>
                      )}
                    </label>
                    {parseError && (
                      <p className="text-xs mt-2" style={{ color: "#EF4444" }}>
                        {parseError}
                      </p>
                    )}
                    {resume && !parseError && (
                      <p className="text-xs mt-2" style={{ color: "#22C55E" }}>
                        ✓ Resume parsed successfully
                      </p>
                    )}
                  </div>

                  {/* JD textarea */}
                  <div className="p-5 md:p-6">
                    <label
                      className="block text-[11px] font-bold tracking-widest uppercase mb-3"
                      style={{ color: "#6366F1" }}
                    >
                      Job Description{" "}
                      <span
                        className="normal-case tracking-normal font-normal"
                        style={{ color: "var(--slate)" }}
                      >
                        (optional)
                      </span>
                    </label>
                    <textarea
                      value={jd}
                      onChange={(e) => setJD(e.target.value)}
                      placeholder="Paste the job description here for a targeted analysis. Leave empty for a general review."
                      className="w-full h-44 md:h-52 rounded-xl p-3 text-sm resize-none outline-none leading-relaxed"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        color: "var(--white)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        fontFamily: "Inter,sans-serif",
                      }}
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="p-5 md:p-6 border-t border-indigo-500/10">
                  {error && (
                    <p
                      className="text-sm text-center mb-3"
                      style={{ color: "#EF4444" }}
                    >
                      {error.message}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading || !resume}
                    className="w-full py-4 rounded-xl font-semibold text-white text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg,#6366F1,#818CF8)",
                      boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                      fontFamily: "Space Grotesk,sans-serif",
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                        Analyzing...
                      </>
                    ) : showResults ? (
                      "Re-analyze →"
                    ) : (
                      "Run full analysis →"
                    )}
                  </button>
                  <p
                    className="text-center text-xs mt-2.5"
                    style={{ color: "var(--slate)" }}
                  >
                    {jd
                      ? "Targeted analysis against your job description"
                      : "General resume analysis — add a JD for better results"}
                  </p>
                </div>
              </div>
            </form>
          </>
        )}

        {/* ── RESULTS ── */}
        {showResults && object && (
          <div className="flex flex-col gap-5">
            {/* Result header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h2
                  className="text-2xl font-bold mb-1"
                  style={{ fontFamily: "Space Grotesk,sans-serif" }}
                >
                  Analysis Results
                </h2>
                <p className="text-sm" style={{ color: "var(--slate)" }}>
                  📄 {fileName}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {jd && (
                  <span
                    className="text-xs px-3 py-1 rounded-lg font-medium border"
                    style={{
                      background: "rgba(99,102,241,0.12)",
                      color: "#818CF8",
                      borderColor: "rgba(99,102,241,0.2)",
                    }}
                  >
                    Targeted: Custom JD
                  </span>
                )}
                <button
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{
                    background: "linear-gradient(135deg,#6366F1,#818CF8)",
                    boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                    fontFamily: "Space Grotesk,sans-serif",
                  }}
                >
                  + New Analysis
                </button>
              </div>
            </div>

            {/* Score cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="px-4 py-3 rounded-xl border-l-2"
                style={{
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  borderLeft: "3px solid #6366F1",
                }}
              >
                <span
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: "#818CF8" }}
                >
                  Top priority:{" "}
                </span>
                <span className="text-sm" style={{ color: "var(--white)" }}>
                  {object.topRecommendation}
                </span>
              </div>
            )}

            {/* Strengths + Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div
                className="rounded-2xl p-6 border border-green-500/20"
                style={{ background: "var(--bg-card)" }}
              >
                <h3
                  className="flex items-center gap-2 font-bold text-[15px] mb-4"
                  style={{ fontFamily: "Space Grotesk,sans-serif" }}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[11px]"
                    style={{
                      background: "rgba(34,197,94,0.15)",
                      color: "#22C55E",
                    }}
                  >
                    ✓
                  </span>
                  Strengths
                </h3>
                <div className="flex flex-col gap-3">
                  {object?.strengths?.map((s, i) => (
                    <div
                      key={i}
                      className="pl-3 border-l-2 border-green-500/30"
                    >
                      <p
                        className="text-[13px] font-semibold mb-0.5"
                        style={{ color: "var(--white)" }}
                      >
                        {s?.point}
                      </p>
                      <p className="text-xs" style={{ color: "var(--slate)" }}>
                        {s?.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div
                className="rounded-2xl p-6 border border-red-500/20"
                style={{ background: "var(--bg-card)" }}
              >
                <h3
                  className="flex items-center gap-2 font-bold text-[15px] mb-4"
                  style={{ fontFamily: "Space Grotesk,sans-serif" }}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[11px]"
                    style={{
                      background: "rgba(239,68,68,0.15)",
                      color: "#EF4444",
                    }}
                  >
                    ✗
                  </span>
                  Needs Work
                </h3>
                <div className="flex flex-col gap-3">
                  {object?.weaknesses?.map((w, i) => (
                    <div key={i} className="pl-3 border-l-2 border-red-500/30">
                      <p
                        className="text-[13px] font-semibold mb-0.5"
                        style={{ color: "var(--white)" }}
                      >
                        {w?.point}
                      </p>
                      <p className="text-xs" style={{ color: "#F59E0B" }}>
                        Fix: {w?.fix}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ATS Issues */}
            {object?.atsScore?.issues && object.atsScore.issues.length > 0 && (
              <div
                className="rounded-2xl p-6 border border-amber-500/20"
                style={{ background: "var(--bg-card)" }}
              >
                <h3
                  className="font-bold text-[15px] mb-4"
                  style={{
                    fontFamily: "Space Grotesk,sans-serif",
                    color: "#F59E0B",
                  }}
                >
                  ⚠ ATS Issues
                </h3>
                <div className="flex flex-col gap-2">
                  {object.atsScore.issues.map((issue, i) => (
                    <div
                      key={i}
                      className="flex gap-2.5 text-[13px]"
                      style={{ color: "var(--slate)" }}
                    >
                      <span className="shrink-0" style={{ color: "#F59E0B" }}>
                        •
                      </span>
                      {issue}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Keywords */}
            {object?.missingKeywords && object.missingKeywords.length > 0 && (
              <div
                className="rounded-2xl p-6 border border-indigo-500/20"
                style={{ background: "var(--bg-card)" }}
              >
                <h3
                  className="font-bold text-[15px] mb-4"
                  style={{ fontFamily: "Space Grotesk,sans-serif" }}
                >
                  Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {object.missingKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1 rounded-lg font-medium border"
                      style={{
                        background: "rgba(99,102,241,0.12)",
                        color: "#818CF8",
                        borderColor: "rgba(99,102,241,0.22)",
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Optimize CTA */}
            <div className="text-center py-6 pb-10">
              <button
                onClick={handleOptimize}
                disabled={optimizeLoading}
                className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-base text-white disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg,#6366F1,#818CF8)",
                  boxShadow: "0 4px 28px rgba(99,102,241,0.45)",
                  fontFamily: "Space Grotesk,sans-serif",
                }}
              >
                {optimizeLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                    Saving...
                  </>
                ) : session ? (
                  "✨ Optimize My Resume →"
                ) : (
                  "🔐 Sign in to Optimize Resume →"
                )}
              </button>
              {!session && (
                <p className="text-xs mt-2.5" style={{ color: "var(--slate)" }}>
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
