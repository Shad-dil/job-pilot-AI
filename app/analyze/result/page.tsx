"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ResultPage() {
  const { data: session } = useSession();
  const [data, setData] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("latestAnalysis");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("latestAnalysis");

    if (!stored) {
      // Nothing in localStorage → send back to form
      router.push("/analyze");
      return;
    }

    // Found it → parse and set
    setData(JSON.parse(stored));
  }, []);

  const handleOptimize = () => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/dashboard");
      return;
    }
    router.push("/dashboard");
  };
  if (!data)
    return (
      <main
        style={{
          background: "var(--bg-deep)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="spinner" />
      </main>
    );

  const { result, fileName } = data;

  const scoreColor = (s: number) =>
    s >= 75 ? "#22C55E" : s >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <main
      style={{
        background: "var(--bg-deep)",
        minHeight: "100vh",
        color: "var(--white)",
        paddingTop: 80,
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 16px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "Space Grotesk,sans-serif",
                fontSize: 28,
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              Analysis Results
            </h1>
            <p style={{ fontSize: 13, color: "var(--slate)" }}>📄 {fileName}</p>
          </div>
          <button
            onClick={() => router.push("/analyze")}
            style={{
              fontSize: 13,

              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "var(--slate)",
              cursor: "pointer",
            }}
            className="md:px-2 md:py-3 px-1 py-1 text-nowrap mr-1"
          >
            ← Analyze another
          </button>
        </div>

        {/* Paste all your results UI here — ScoreCard, strengths, weaknesses etc */}
        {/* Just replace `object` with `result` */}
        {data && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
                score={result?.matchScore}
                scoreColor={scoreColor}
                description={result?.summary}
              />
              <ScoreCard
                label="ATS Score"
                score={result?.atsScore?.overall}
                scoreColor={scoreColor}
                sub={[
                  {
                    label: "Keyword Match",
                    val: result?.atsScore?.keywordMatch,
                  },
                  { label: "Format Score", val: result?.atsScore?.formatScore },
                ]}
              />
            </div>

            {/* Top recommendation */}
            {result?.topRecommendation && (
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
                  {result.topRecommendation}
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
                  {result?.strengths?.map(
                    (s: { point: string; reason: string }, i: number) => (
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
                  {result?.weaknesses?.map(
                    (w: { point: string; fix: string }, i: number) => (
                      <div
                        key={i}
                        style={{
                          paddingLeft: 12,
                          borderLeft: "2px solid rgba(239,68,68,0.3)",
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
                          {w?.point}
                        </p>
                        <p style={{ fontSize: 12, color: "#F59E0B" }}>
                          Fix: {w?.fix}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* ATS Issues */}
            {result?.atsScore?.issues && result.atsScore.issues.length > 0 && (
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
                  {result.atsScore.issues.map((issue: string, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        fontSize: 13,
                        color: "var(--slate)",
                      }}
                    >
                      <span style={{ color: "#F59E0B", flexShrink: 0 }}>•</span>
                      {issue}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Keywords */}
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
                    marginBottom: 16,
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
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Optimize CTA */}
            {
              <div style={{ textAlign: "center", padding: "20px 0 40px" }}>
                <button
                  onClick={handleOptimize}
                  style={{
                    padding: "16px 40px",
                    borderRadius: 14,
                    border: "none",
                    background: "linear-gradient(135deg,#6366F1,#818CF8)",
                    color: "white",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "Space Grotesk,sans-serif",
                    boxShadow: "0 4px 28px rgba(99,102,241,0.45)",
                  }}
                >
                  {session
                    ? "✨ Optimize My Resume →"
                    : "🔐 Sign in to Optimize Resume →"}
                </button>
                {!session && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--slate)",
                      marginTop: 10,
                    }}
                  >
                    Free account required — takes 30 seconds
                  </p>
                )}
              </div>
            }
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
  score: number;
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
