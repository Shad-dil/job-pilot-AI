"use client";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { improvementSchema } from "@/app/api/analyze/schema";
import { updateResumeText } from "@/app/actions/actions";
import { StructuredResume } from "@/app/types/resume";
import ResumePreview from "@/components/ResumePreview";
import DownloadButton from "@/components/DownloadButton";

type Props = {
  analysis: any;
  rawText: string;
  filename: string;
};

export default function AnalysisClient({ analysis, rawText, filename }: Props) {
  const router = useRouter();
  const result = analysis.resultJson as any;
  const [resumeText, setResumeText] = useState(rawText);
  const [appliedBulled, setAppliedBullet] = useState<Set<number>>(new Set());
  const [currentScore, setCurrentScore] = useState(analysis.score);
  const [appliedCount, setAppliedCount] = useState(0);
  const [highlightedBullet, setHighlightedBullet] = useState<string | null>(
    null,
  );
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeRef = useRef(null);
  const structured = analysis.resume.structuredJson as StructuredResume | null;
  const [liveStructured, setLiveStructured] = useState(structured);
  const {
    submit,
    object: suggestions,
    isLoading: suggestionsLoading,
  } = useObject({
    api: "/api/suggestions",
    schema: improvementSchema,
  });

  const scoreColor = (s: number) =>
    s >= 75 ? "#22C55E" : s >= 50 ? "#F59E0B" : "#EF4444";

  // Apply a bullet improvement
  const applyBullet = async (
    original: string,
    improved: string,
    index: number,
  ) => {
    setResumeText((prev) => prev.replace(original, improved));
    setLiveStructured((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        experience: prev.experience.map((exp) => ({
          ...exp,
          bullets: exp.bullets.map((b) => (b === original ? improved : b)),
        })),
        projects: prev.projects?.map((proj) => ({
          ...proj,
          bullets: proj.bullets.map((b) => (b === original ? improved : b)),
        })),
      };
    });

    setAppliedBullet((prev) => new Set([...prev, index]));
    // Animate score up
    const boost = Math.floor(Math.random() * 3) + 2; // +2 to +4 points
    setCurrentScore((s: number) => Math.min(100, s + boost));
    setAppliedCount((c) => c + 1);
    setHighlightedBullet(improved);
    setTimeout(() => setHighlightedBullet(null), 2000);

    // Debounced save to DB
    setSaveStatus("saving");
    //clearTimeout(saveTimer.current);
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    const updated = resumeText.replace(original, improved);
    saveTimer.current = setTimeout(async () => {
      try {
        await updateResumeText(analysis.resumeId, updated);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("idle");
      }
    }, 1500);
  };

  return (
    <main
      style={{
        background: "var(--bg-deep)",
        minHeight: "100vh",
        color: "var(--white)",
        paddingTop: 72,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: "sticky",
          top: 64,
          zIndex: 40,
          background: "rgba(10,15,30,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              background: "none",
              border: "none",
              color: "var(--slate)",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            ← Dashboard
          </button>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
          <span style={{ fontSize: 13, color: "var(--slate)" }}>
            📄 {filename}
          </span>
          <div>
            {liveStructured && (
              <DownloadButton data={liveStructured} filename={filename} />
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Save status */}
          {saveStatus === "saving" && (
            <span style={{ fontSize: 12, color: "var(--slate)" }}>
              Saving...
            </span>
          )}
          {saveStatus === "saved" && (
            <span style={{ fontSize: 12, color: "#22C55E" }}>✓ Saved</span>
          )}

          {/* Score pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 999,
              background: `${scoreColor(currentScore)}15`,
              border: `1px solid ${scoreColor(currentScore)}40`,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: scoreColor(currentScore),
              }}
            >
              {currentScore}%
            </span>
            {appliedCount > 0 && (
              <span style={{ fontSize: 11, color: "#22C55E" }}>
                +{appliedCount * 3} pts ↑
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          height: "calc(100vh - 128px)",
        }}
      >
        {/* LEFT — Resume text editor */}
        <div ref={resumeRef} style={{ overflow: "auto" }}>
          {liveStructured ? (
            <ResumePreview
              data={liveStructured}
              highlightedBullet={highlightedBullet}
            />
          ) : (
            <pre
              style={{ whiteSpace: "pre-wrap", fontSize: 12, color: "#1a1a1a" }}
            >
              {resumeText}
            </pre>
          )}
        </div>

        {/* RIGHT — AI Panel */}
        <div
          style={{
            overflow: "auto",
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Score breakdown from DB */}
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
              Analysis Summary
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {[
                { label: "Match Score", val: currentScore },
                { label: "ATS Score", val: result?.atsScore?.overall },
              ].map(
                ({ label, val }) =>
                  val !== undefined && (
                    <div
                      key={label}
                      style={{
                        textAlign: "center",
                        padding: "12px 0",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 700,
                          color: scoreColor(val),
                          fontFamily: "Space Grotesk,sans-serif",
                        }}
                      >
                        {val}%
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--slate)",
                          marginTop: 2,
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  ),
              )}
            </div>

            {result?.topRecommendation && (
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "rgba(99,102,241,0.08)",
                  borderLeft: "2px solid #6366F1",
                }}
              >
                <span
                  style={{ fontSize: 11, color: "#818CF8", fontWeight: 700 }}
                >
                  TOP PRIORITY:{" "}
                </span>
                <span style={{ fontSize: 12, color: "var(--white)" }}>
                  {result.topRecommendation}
                </span>
              </div>
            )}
          </div>

          {/* Get AI Suggestions button */}
          {!suggestions && (
            <button
              onClick={() => submit({ resumeText: resumeText.slice(0, 3000) })}
              disabled={suggestionsLoading}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg,#6366F1,#818CF8)",
                color: "white",
                fontSize: 15,
                fontWeight: 600,
                cursor: suggestionsLoading ? "not-allowed" : "pointer",
                fontFamily: "Space Grotesk,sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {suggestionsLoading ? (
                <>
                  <span className="spinner" /> Generating suggestions...
                </>
              ) : (
                "✨ Get AI Suggestions"
              )}
            </button>
          )}

          {/* Score booster hint */}
          {!suggestions && !suggestionsLoading && (
            <div
              style={{
                textAlign: "center",
                padding: "16px",
                borderRadius: 12,
                border: "1px dashed rgba(99,102,241,0.3)",
                background: "rgba(99,102,241,0.05)",
              }}
            >
              <p style={{ fontSize: 13, color: "var(--slate)", margin: 0 }}>
                🎯 Apply AI suggestions to boost your score up to{" "}
                <span style={{ color: "#818CF8", fontWeight: 700 }}>
                  +15 points
                </span>
              </p>
            </div>
          )}

          {/* Bullet improvements — stream in */}
          {suggestions?.bulletImprovements &&
            suggestions.bulletImprovements.length > 0 && (
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
                  ✍ Bullet Improvements
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {suggestions.bulletImprovements.map(
                    (b, i) =>
                      b?.original &&
                      b?.improved && (
                        <div
                          key={i}
                          style={{
                            borderRadius: 12,
                            border: `1px solid ${appliedBulled.has(i) ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.07)"}`,
                            overflow: "hidden",
                            opacity: appliedBulled.has(i) ? 0.6 : 1, // ← dim applied cards
                            transition: "opacity 0.3s, border-color 0.3s",
                          }}
                        >
                          <div
                            style={{
                              padding: "6px 14px",
                              background: "rgba(255,255,255,0.03)",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "var(--slate)",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            {b.section}
                          </div>
                          <div
                            style={{
                              padding: 14,
                              display: "flex",
                              flexDirection: "column",
                              gap: 10,
                            }}
                          >
                            <div>
                              <span
                                style={{
                                  fontSize: 10,
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                  background: "rgba(239,68,68,0.1)",
                                  color: "#EF4444",
                                  fontWeight: 600,
                                }}
                              >
                                Before
                              </span>
                              <p
                                style={{
                                  fontSize: 12,
                                  color: "var(--slate)",
                                  margin: "6px 0 0",
                                  lineHeight: 1.5,
                                }}
                              >
                                {b.original}
                              </p>
                            </div>
                            <div>
                              <span
                                style={{
                                  fontSize: 10,
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                  background: "rgba(34,197,94,0.1)",
                                  color: "#22C55E",
                                  fontWeight: 600,
                                }}
                              >
                                After
                              </span>
                              <p
                                style={{
                                  fontSize: 12,
                                  color: "var(--white)",
                                  margin: "6px 0 0",
                                  lineHeight: 1.5,
                                  fontWeight: 500,
                                }}
                              >
                                {b.improved}
                              </p>
                            </div>
                            <p
                              style={{
                                fontSize: 11,
                                color: "var(--slate)",
                                margin: 0,
                                paddingTop: 8,
                                borderTop: "1px solid rgba(255,255,255,0.05)",
                              }}
                            >
                              💡 {b.reason}
                            </p>
                            {appliedBulled.has(i) ? (
                              // Applied state
                              <div
                                style={{
                                  padding: "8px 0",
                                  borderRadius: 8,
                                  background: "rgba(34,197,94,0.08)",
                                  color: "#22C55E",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  textAlign: "center",
                                  border: "1px solid rgba(34,197,94,0.2)",
                                }}
                              >
                                ✓ Applied
                              </div>
                            ) : (
                              // Apply button
                              <button
                                onClick={() =>
                                  applyBullet(b.original!, b.improved!, i)
                                } // ← pass index
                                style={{
                                  padding: "8px 0",
                                  borderRadius: 8,
                                  border: "none",
                                  background: "rgba(34,197,94,0.15)",
                                  color: "#22C55E",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  width: "100%",
                                }}
                                onMouseOver={(e) =>
                                  (e.currentTarget.style.background =
                                    "rgba(34,197,94,0.25)")
                                }
                                onMouseOut={(e) =>
                                  (e.currentTarget.style.background =
                                    "rgba(34,197,94,0.15)")
                                }
                              >
                                ✓ Apply this improvement
                              </button>
                            )}
                          </div>
                        </div>
                      ),
                  )}
                </div>
              </div>
            )}

          {/* Missing keywords */}
          {result?.missingKeywords && result.missingKeywords.length > 0 && (
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
                  marginBottom: 14,
                }}
              >
                Missing Keywords
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {result.missingKeywords.map((kw: string, i: number) => (
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
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      // Add keyword to skills section
                      const updated = resumeText + `\n${kw}`;
                      setResumeText(updated);
                    }}
                    title="Click to add to resume"
                  >
                    + {kw}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "var(--slate)", marginTop: 10 }}>
                Click a keyword to add it to your resume
              </p>
            </div>
          )}

          {/* Section scores */}
          {suggestions?.sectionScores && (
            <div
              style={{
                background: "var(--bg-card)",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.07)",
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
                Section Scores
              </h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {Object.entries(suggestions.sectionScores).map(
                  ([section, data]: [string, any]) =>
                    data && (
                      <div key={section}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 5,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              textTransform: "capitalize",
                            }}
                          >
                            {section}
                          </span>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: scoreColor(data.score),
                            }}
                          >
                            {data.score}%
                          </span>
                        </div>
                        <div
                          style={{
                            height: 5,
                            borderRadius: 999,
                            background: "rgba(255,255,255,0.08)",
                            marginBottom: 4,
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              borderRadius: 999,
                              width: `${data.score}%`,
                              background: scoreColor(data.score),
                              transition: "width 1s ease",
                            }}
                          />
                        </div>
                        <p style={{ fontSize: 11, color: "var(--slate)" }}>
                          {data.feedback}
                        </p>
                      </div>
                    ),
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
