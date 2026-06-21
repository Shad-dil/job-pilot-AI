// app/dashboard/DashboardClient.tsx
"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  claimGuestAnalysis,
  getUserAnalyses,
  saveAnalysis,
} from "../actions/actions";
import { useEffect, useRef, useState } from "react";
import { RefreshCcw } from "lucide-react";

type Analysis = {
  id: string;
  score: number;
  role: string;
  level: string;
  targetType: string;
  createdAt: Date;
  resultJson: any;
  resume: { filename: string };
};

export default function DashboardClient({
  analyses,
  user,
}: {
  analyses: Analysis[];
  user: any;
}) {
  const router = useRouter();
  const [reload, setReload] = useState(false);
  const hasSaved = useRef(false);

  const handleReload = async () => {
    try {
      setReload(true);
      await getUserAnalyses();
    } catch (e) {
      console.log("Reload Error", e);
      setReload(false);
    } finally {
      setReload(false);
    }
  };

  const searchParams = useSearchParams();

  useEffect(() => {
    const claimToken = searchParams.get("claim");
    if (!claimToken) return;

    const claim = async () => {
      try {
        const analysisId = await claimGuestAnalysis(claimToken);
        // Remove claim param and go to the analysis directly
        if (analysisId) {
          router.replace(`/dashboard/${analysisId}`);
        } else {
          router.replace("/dashboard");
        }
      } catch (e) {
        console.error("Failed to claim:", e);
        router.replace("/dashboard");
      }
    };

    claim();
  }, []);

  const scoreColor = (s: number) =>
    s >= 75 ? "#22C55E" : s >= 50 ? "#F59E0B" : "#EF4444";

  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <main
      style={{
        background: "var(--bg-deep)",
        minHeight: "100vh",
        color: "var(--white)",
        paddingTop: 80,
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "Space Grotesk,sans-serif",
                fontSize: 32,
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              Welcome back, {user?.name}
            </h1>
            <p style={{ color: "var(--slate)", fontSize: 14 }}>
              {analyses.length === 0
                ? "No analyses yet — upload your first resume below"
                : `${analyses.length} resume${analyses.length > 1 ? "s" : ""} analyzed`}
            </p>
          </div>
          <div className="flex justify-between gap-2">
            <p className="cursor-pointer" onClick={handleReload}>
              <RefreshCcw
                className={`h-6 w-6 mt-3 ${reload ? "animate-spin" : ""}`}
              />
            </p>
            <Link
              href="/analyze"
              style={{
                padding: "12px 24px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg,#6366F1,#818CF8)",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                fontFamily: "Space Grotesk,sans-serif",
                boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
              }}
            >
              + New Analysis
            </Link>
          </div>
        </div>

        {/* Empty state */}
        {analyses.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 24px",
              background: "var(--bg-card)",
              borderRadius: 20,
              border: "1px dashed rgba(99,102,241,0.3)",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
            <h2
              style={{
                fontFamily: "Space Grotesk,sans-serif",
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              No analyses yet
            </h2>
            <p
              style={{ color: "var(--slate)", marginBottom: 24, fontSize: 14 }}
            >
              Upload your resume and get an instant AI-powered diagnosis
            </p>
            <Link
              href="/analyze"
              style={{
                padding: "12px 28px",
                borderRadius: 12,
                background: "linear-gradient(135deg,#6366F1,#818CF8)",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Analyze my resume →
            </Link>
          </div>
        )}

        {/* Analysis history grid */}
        {analyses.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {analyses.map((a) => (
              <div
                key={a.id}
                onClick={() => {
                  // Load this analysis into localStorage and go to result
                  localStorage.setItem(
                    "latestAnalysis",
                    JSON.stringify({
                      result: a.resultJson,
                      fileName: a.resume.filename,
                      jd: a.targetType,
                    }),
                  );
                  router.push(`/dashboard/${a.id}`);
                }}
                style={{
                  background: "var(--bg-card)",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.07)",
                  padding: 20,
                  cursor: "pointer",
                  transition: "border-color 0.2s, transform 0.15s",
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(99,102,241,0.35)";
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(0)";
                }}
              >
                {/* File + date */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ fontSize: 20 }}>📄</span>
                    <div>
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: "var(--white)",
                          margin: 0,
                          textWrap: "wrap",
                        }}
                      >
                        {a.resume.filename}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--slate)",
                          margin: 0,
                        }}
                      >
                        {formatDate(a.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Role + type */}
                <div className="flex justify-around gap-3">
                  <span
                    style={{
                      display: "inline-flex", // or "flex"
                      alignItems: "center",
                      fontSize: 11,
                      padding: "3px 3px",
                      borderRadius: 6,
                      fontWeight: 600,
                      background: "rgba(255,255,255,0.05)",
                      color: "var(--slate)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {a.targetType === "jd" ? "Custom JD" : "General"}
                  </span>

                  {/* Score badge */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      border: `2px solid ${scoreColor(a.score)}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: scoreColor(a.score),
                      }}
                    >
                      {a.score}%
                    </span>
                  </div>
                </div>

                {/* Quick strengths preview */}
                {a.resultJson?.strengths?.[0] && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--slate)",
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      lineHeight: 1.5,
                    }}
                  >
                    ✓ {a.resultJson.strengths[0].point}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
