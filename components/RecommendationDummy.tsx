import React from "react";

const RecommendationDummy = () => {
  return (
    <div>
      RecommendationDummy
      {/* Section Scores */}
      {/* {object?.sectionScores && (
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
                    marginBottom: 20,
                  }}
                >
                  Section Scores
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {Object.entries(object.sectionScores).map(
                    ([section, data]) =>
                      data && (
                        <div key={section}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 6,
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
                                color: scoreColor(data.score ?? 0),
                              }}
                            >
                              {data.score}%
                            </span>
                          </div>
                          <div
                            style={{
                              height: 6,
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
                                background: `linear-gradient(90deg, ${scoreColor(data.score ?? 0)}, ${scoreColor(data.score ?? 0)}99)`,
                                transition: "width 1s ease",
                              }}
                            />
                          </div>
                          <p style={{ fontSize: 12, color: "var(--slate)" }}>
                            {data.feedback}
                          </p>
                        </div>
                      ),
                  )}
                </div>
              </div>
            )} */}
      {/* Bullet Improvements */}
      {/* {object?.bulletImprovements &&
              object.bulletImprovements.length > 0 && (
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
                      marginBottom: 6,
                    }}
                  >
                    ✍ Bullet Point Improvements
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--slate)",
                      marginBottom: 20,
                    }}
                  >
                    AI rewrites of your weakest bullet points
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {object.bulletImprovements.map((b, i) => (
                      <div
                        key={i}
                        style={{
                          borderRadius: 12,
                          border: "1px solid rgba(255,255,255,0.07)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            padding: "8px 14px",
                            background: "rgba(255,255,255,0.03)",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "var(--slate)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          {b?.section}
                        </div>
                        <div
                          style={{
                            padding: 14,
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                          }}
                        >
                          <div style={{ display: "flex", gap: 10 }}>
                            <span
                              style={{
                                fontSize: 11,
                                padding: "2px 8px",
                                borderRadius: 4,
                                background: "rgba(239,68,68,0.1)",
                                color: "#EF4444",
                                fontWeight: 600,
                                flexShrink: 0,
                                height: "fit-content",
                                marginTop: 1,
                              }}
                            >
                              Before
                            </span>
                            <p
                              style={{
                                fontSize: 13,
                                color: "var(--slate)",
                                margin: 0,
                                lineHeight: 1.5,
                              }}
                            >
                              {b?.original}
                            </p>
                          </div>
                          <div style={{ display: "flex", gap: 10 }}>
                            <span
                              style={{
                                fontSize: 11,
                                padding: "2px 8px",
                                borderRadius: 4,
                                background: "rgba(34,197,94,0.1)",
                                color: "#22C55E",
                                fontWeight: 600,
                                flexShrink: 0,
                                height: "fit-content",
                                marginTop: 1,
                              }}
                            >
                              After
                            </span>
                            <p
                              style={{
                                fontSize: 13,
                                color: "var(--white)",
                                margin: 0,
                                lineHeight: 1.5,
                                fontWeight: 500,
                              }}
                            >
                              {b?.improved}
                            </p>
                          </div>
                          <p
                            style={{
                              fontSize: 11,
                              color: "var(--slate)",
                              margin: 0,
                              paddingTop: 4,
                              borderTop: "1px solid rgba(255,255,255,0.05)",
                            }}
                          >
                            💡 {b?.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
    </div>
  );
};

export default RecommendationDummy;
