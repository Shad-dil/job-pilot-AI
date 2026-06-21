"use client";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { improvementSchema } from "@/app/api/analyze/schema";
import { getStructuredResume, updateResumeText } from "@/app/actions/actions";
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
  const [mobileTab, setMobileTab] = useState<"resume" | "suggestions">(
    "suggestions",
  );
  const {
    submit,
    object: suggestions,
    isLoading: suggestionsLoading,
  } = useObject({
    api: "/api/suggestions",
    schema: improvementSchema,
  });
  // app/dashboard/[analysisId]/AnalysisClient.tsx

  const [structuredLoading, setStructuredLoading] = useState(
    !analysis.resume.structuredJson, // ← true if null
  );

  // Poll for structuredJson if not ready yet
  useEffect(() => {
    if (liveStructured) return; // already have it

    let attempts = 0;
    const maxAttempts = 10;

    const poll = async () => {
      attempts++;
      try {
        const result = await getStructuredResume(analysis.resumeId);
        if (result) {
          setLiveStructured(result as StructuredResume);
          setStructuredLoading(false);
        } else if (attempts < maxAttempts) {
          setTimeout(poll, 2000); // retry every 2 seconds
        } else {
          setStructuredLoading(false); // give up after 20 seconds
        }
      } catch {
        if (attempts < maxAttempts) setTimeout(poll, 2000);
        else setStructuredLoading(false);
      }
    };

    poll();
  }, []);
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
      {/* ── TOP BAR ── */}
      <div
        style={{
          position: "sticky",
          top: 64,
          zIndex: 40,
          background: "rgba(10,15,30,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
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
              flexShrink: 0,
            }}
          >
            ← Dashboard
          </button>
          <span style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>
            |
          </span>
          <span
            style={{
              fontSize: 12,
              color: "var(--slate)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 160,
            }}
          >
            📄 {filename}
          </span>
          {/* Download — hidden on mobile, shown on desktop */}
          <div className="hide-mobile">
            {liveStructured && (
              <DownloadButton data={liveStructured} filename={filename} />
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {saveStatus === "saving" && (
            <span style={{ fontSize: 11, color: "var(--slate)" }}>
              Saving...
            </span>
          )}
          {saveStatus === "saved" && (
            <span style={{ fontSize: 11, color: "#22C55E" }}>✓ Saved</span>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
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
              <span style={{ fontSize: 10, color: "#22C55E" }}>
                +{appliedCount * 3} pts ↑
              </span>
            )}
          </div>
          {/* Download on mobile */}
          <div className="show-mobile">
            {liveStructured && (
              <DownloadButton data={liveStructured} filename={filename} />
            )}
          </div>
        </div>
      </div>

      {/* ── RESPONSIVE STYLES ── */}
      <style>{`
      .hide-mobile { display: flex; }
      .show-mobile { display: none; }
      .desktop-grid { display: grid; }
      .mobile-layout { display: none; }

      @media (max-width: 768px) {
        .hide-mobile  { display: none !important; }
        .show-mobile  { display: flex !important; }
        .desktop-grid { display: none !important; }
        .mobile-layout { display: flex !important; }
      }
    `}</style>

      {/* ── DESKTOP LAYOUT (unchanged) ── */}
      <div
        className="desktop-grid"
        style={{
          gridTemplateColumns: "1fr 1fr",
          height: "calc(100vh - 128px)",
        }}
      >
        {/* LEFT — Resume preview */}
        <div
          ref={resumeRef}
          style={{
            overflow: "auto",
            borderRight: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div style={{ padding: 32 }}>
            {structuredLoading ? (
              <div
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: 32,
                  minHeight: 600,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <span
                  className="spinner"
                  style={{
                    borderColor: "rgba(0,0,0,0.1)",
                    borderTopColor: "#6366F1",
                  }}
                />
                <p style={{ fontSize: 13, color: "#888" }}>
                  Generating resume preview...
                </p>
                <p style={{ fontSize: 11, color: "#aaa" }}>
                  This takes about 10 seconds
                </p>
              </div>
            ) : liveStructured ? (
              <ResumePreview
                data={liveStructured}
                highlightedBullet={highlightedBullet}
              />
            ) : (
              <div
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: 32,
                  minHeight: 600,
                }}
              >
                <pre
                  style={{
                    fontSize: 11,
                    color: "#333",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                  }}
                >
                  {rawText}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — AI Panel (your existing code, unchanged) */}
        <div
          style={{
            overflow: "auto",
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Score breakdown */}
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

          {!suggestions && !suggestionsLoading && (
            <div
              style={{
                textAlign: "center",
                padding: 16,
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

          {/* Bullet improvements */}
          {suggestions?.bulletImprovements &&
            suggestions.bulletImprovements.length > 0 && (
              <BulletImprovements
                bullets={suggestions.bulletImprovements}
                appliedBullets={appliedBulled}
                onApply={(orig, imp, i) => applyBullet(orig, imp, i)}
              />
            )}

          {/* Missing keywords */}
          {result?.missingKeywords && result.missingKeywords.length > 0 && (
            <MissingKeywords
              keywords={result.missingKeywords}
              onAdd={(kw) => setResumeText((prev) => prev + `\n${kw}`)}
            />
          )}

          {/* Section scores */}
          {suggestions?.sectionScores && (
            <SectionScores
              scores={suggestions.sectionScores}
              scoreColor={scoreColor}
            />
          )}
        </div>
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div
        className="mobile-layout"
        style={{ flexDirection: "column", height: "calc(100vh - 120px)" }}
      >
        {/* Tab switcher */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: "var(--bg-card)",
            flexShrink: 0,
          }}
        >
          {(["suggestions", "resume"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              style={{
                padding: "13px 0",
                border: "none",
                cursor: "pointer",
                background:
                  mobileTab === tab ? "rgba(99,102,241,0.12)" : "transparent",
                color: mobileTab === tab ? "#818CF8" : "var(--slate)",
                fontSize: 14,
                fontWeight: 600,
                borderBottom:
                  mobileTab === tab
                    ? "2px solid #6366F1"
                    : "2px solid transparent",
                transition: "all 0.2s",
              }}
            >
              {tab === "suggestions" ? "✨ AI Suggestions" : "📄 Resume"}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {/* Resume tab */}
          {mobileTab === "resume" && (
            <div style={{ padding: 12 }}>
              {structuredLoading ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 60,
                    gap: 12,
                  }}
                >
                  <span
                    className="spinner"
                    style={{
                      borderColor: "rgba(0,0,0,0.1)",
                      borderTopColor: "#6366F1",
                    }}
                  />
                  <p style={{ fontSize: 13, color: "var(--slate)" }}>
                    Generating preview...
                  </p>
                </div>
              ) : liveStructured ? (
                <div
                  style={{
                    transform: "scale(0.82)",
                    transformOrigin: "top left",
                    width: "122%",
                  }}
                >
                  <ResumePreview
                    data={liveStructured}
                    highlightedBullet={highlightedBullet}
                  />
                </div>
              ) : (
                <pre
                  style={{
                    fontSize: 11,
                    color: "#333",
                    background: "white",
                    padding: 16,
                    borderRadius: 8,
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                  }}
                >
                  {rawText}
                </pre>
              )}
            </div>
          )}

          {/* Suggestions tab */}
          {mobileTab === "suggestions" && (
            <div
              style={{
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Score cards — horizontal scroll */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  overflowX: "auto",
                  paddingBottom: 4,
                }}
              >
                {[
                  { label: "Match Score", val: currentScore },
                  { label: "ATS Score", val: result?.atsScore?.overall },
                ]
                  .filter((x) => x.val !== undefined)
                  .map(({ label, val }) => (
                    <div
                      key={label}
                      style={{
                        flexShrink: 0,
                        background: "var(--bg-card)",
                        borderRadius: 12,
                        padding: "14px 20px",
                        minWidth: 130,
                        border: `1px solid ${scoreColor(val!)}30`,
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 26,
                          fontWeight: 700,
                          color: scoreColor(val!),
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
                      {label === "Match Score" && appliedCount > 0 && (
                        <div
                          style={{
                            fontSize: 10,
                            color: "#22C55E",
                            marginTop: 2,
                          }}
                        >
                          +{appliedCount * 3} pts ↑
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Top priority */}
              {result?.topRecommendation && (
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "rgba(99,102,241,0.1)",
                    borderLeft: "3px solid #6366F1",
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#818CF8",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Priority:{" "}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--white)" }}>
                    {result.topRecommendation}
                  </span>
                </div>
              )}

              {/* Get suggestions */}
              {!suggestions && (
                <button
                  onClick={() =>
                    submit({ resumeText: resumeText.slice(0, 3000) })
                  }
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {suggestionsLoading ? (
                    <>
                      <span className="spinner" /> Generating...
                    </>
                  ) : (
                    "✨ Get AI Suggestions"
                  )}
                </button>
              )}

              {/* Bullet improvements */}
              {suggestions?.bulletImprovements?.map(
                (b, i) =>
                  b?.original &&
                  b?.improved && (
                    <div
                      key={i}
                      style={{
                        borderRadius: 12,
                        border: `1px solid ${appliedBulled.has(i) ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.07)"}`,
                        overflow: "hidden",
                        opacity: appliedBulled.has(i) ? 0.6 : 1,
                      }}
                    >
                      <div
                        style={{
                          padding: "6px 14px",
                          background: "rgba(255,255,255,0.03)",
                          fontSize: 10,
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
                            ✓ Applied — tap Resume tab to see
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              applyBullet(b.original!, b.improved!, i);
                              setTimeout(() => setMobileTab("resume"), 600);
                            }}
                            style={{
                              padding: "10px 0",
                              borderRadius: 8,
                              border: "none",
                              background: "rgba(34,197,94,0.15)",
                              color: "#22C55E",
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: "pointer",
                              width: "100%",
                            }}
                          >
                            ✓ Apply improvement
                          </button>
                        )}
                      </div>
                    </div>
                  ),
              )}

              {/* Missing keywords */}
              {result?.missingKeywords && result.missingKeywords.length > 0 && (
                <div
                  style={{
                    background: "var(--bg-card)",
                    borderRadius: 16,
                    border: "1px solid rgba(99,102,241,0.2)",
                    padding: 20,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "Space Grotesk,sans-serif",
                      fontSize: 14,
                      fontWeight: 700,
                      marginBottom: 12,
                    }}
                  >
                    Missing Keywords
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.missingKeywords.map((kw: string, i: number) => (
                      <span
                        key={i}
                        onClick={() =>
                          setResumeText((prev) => prev + `\n${kw}`)
                        }
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
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Section scores */}
              {suggestions?.sectionScores && (
                <div
                  style={{
                    background: "var(--bg-card)",
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.07)",
                    padding: 20,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "Space Grotesk,sans-serif",
                      fontSize: 14,
                      fontWeight: 700,
                      marginBottom: 14,
                    }}
                  >
                    Section Scores
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {Object.entries(suggestions.sectionScores).map(
                      ([section, data]: [string, any]) =>
                        data && (
                          <div key={section}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 4,
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
                                marginBottom: 3,
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

              {/* Download on mobile — bottom of suggestions */}
              {liveStructured && (
                <div style={{ paddingBottom: 24 }}>
                  <DownloadButton data={liveStructured} filename={filename} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// ── BulletImprovements ────────────────────────────────────────
function BulletImprovements({
  bullets,
  appliedBullets,
  onApply,
}: {
  bullets: any[];
  appliedBullets: Set<number>;
  onApply: (original: string, improved: string, index: number) => void;
}) {
  return (
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
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {bullets.map(
          (b, i) =>
            b?.original &&
            b?.improved && (
              <div
                key={i}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${appliedBullets.has(i) ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.07)"}`,
                  overflow: "hidden",
                  opacity: appliedBullets.has(i) ? 0.6 : 1,
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
                  {appliedBullets.has(i) ? (
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
                    <button
                      onClick={() => onApply(b.original!, b.improved!, i)}
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
  );
}

// ── MissingKeywords ───────────────────────────────────────────
function MissingKeywords({
  keywords,
  onAdd,
}: {
  keywords: string[];
  onAdd: (keyword: string) => void;
}) {
  const [added, setAdded] = useState<Set<number>>(new Set());

  const handleAdd = (kw: string, i: number) => {
    onAdd(kw);
    setAdded((prev) => new Set([...prev, i]));
  };

  return (
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
        {keywords.map((kw, i) => (
          <span
            key={i}
            onClick={() => !added.has(i) && handleAdd(kw, i)}
            style={{
              fontSize: 12,
              padding: "5px 12px",
              borderRadius: 8,
              fontWeight: 500,
              cursor: added.has(i) ? "default" : "pointer",
              background: added.has(i)
                ? "rgba(34,197,94,0.12)"
                : "rgba(99,102,241,0.12)",
              color: added.has(i) ? "#22C55E" : "#818CF8",
              border: added.has(i)
                ? "1px solid rgba(34,197,94,0.25)"
                : "1px solid rgba(99,102,241,0.22)",
              transition: "all 0.2s",
            }}
            title={added.has(i) ? "Added to resume" : "Click to add to resume"}
          >
            {added.has(i) ? `✓ ${kw}` : `+ ${kw}`}
          </span>
        ))}
      </div>
      <p style={{ fontSize: 11, color: "var(--slate)", marginTop: 10 }}>
        Click a keyword to add it to your resume
      </p>
    </div>
  );
}

// ── SectionScores ─────────────────────────────────────────────
function SectionScores({
  scores,
  scoreColor,
}: {
  scores: Record<
    string,
    { score: number; feedback: string } | null | undefined
  >;
  scoreColor: (s: number) => string;
}) {
  return (
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
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {Object.entries(scores).map(
          ([section, data]) =>
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
  );
}
