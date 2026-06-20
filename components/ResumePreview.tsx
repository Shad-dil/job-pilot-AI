// components/ResumePreview.tsx
// import { StructuredResume } from "@/types/resume";

import { StructuredResume } from "@/app/types/resume";

type Props = {
  data: StructuredResume;
  highlightedBullet?: string | null;
};

export default function ResumePreview({ data, highlightedBullet }: Props) {
  const isHighlighted = (text: string) =>
    highlightedBullet ? text.includes(highlightedBullet.slice(0, 40)) : false;

  return (
    <div
      style={{
        background: "white",
        color: "#1a1a1a",
        fontFamily: "'Georgia', serif",
        fontSize: 13,
        lineHeight: 1.6,
        padding: "40px 48px",
        minHeight: 900,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: "2px solid #1a1a1a",
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            margin: "0 0 6px",
            fontFamily: "Arial, sans-serif",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {data.name}
        </h1>
        <p
          style={{
            fontSize: 11,
            color: "#444",
            margin: 0,
            fontFamily: "Arial, sans-serif",
          }}
        >
          {[data.email, data.phone, data.linkedin, data.location]
            .filter(Boolean)
            .join("  |  ")}
        </p>
      </div>

      {/* Summary */}
      {data.summary && (
        <Section title="Professional Summary">
          <p
            style={{ margin: 0, fontSize: 12, color: "#333", lineHeight: 1.7 }}
          >
            {data.summary}
          </p>
        </Section>
      )}

      {/* Experience */}
      {data.experience?.length > 0 && (
        <Section title="Professional Experience">
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  {exp.title}
                </span>
                <span style={{ fontSize: 11, color: "#555" }}>
                  {exp.duration}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{ fontSize: 12, color: "#555", fontStyle: "italic" }}
                >
                  {exp.company}
                </span>
                {exp.location && (
                  <span style={{ fontSize: 11, color: "#777" }}>
                    {exp.location}
                  </span>
                )}
              </div>
              {exp.bullets.map((bullet, j) => (
                <div
                  key={j}
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 4,
                    padding: "2px 4px",
                    borderRadius: 3,
                    background: isHighlighted(bullet)
                      ? "rgba(34,197,94,0.15)"
                      : "transparent",
                    transition: "background 0.5s ease",
                  }}
                >
                  <span style={{ flexShrink: 0, color: "#333" }}>•</span>
                  <span
                    style={{ fontSize: 12, color: "#333", lineHeight: 1.6 }}
                  >
                    {bullet}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </Section>
      )}

      {/* Skills */}
      {data.skills?.length > 0 && (
        <Section title="Technical Skills">
          {data.skills.map((skillGroup, i) => (
            <div
              key={i}
              style={{ display: "flex", gap: 8, marginBottom: 5, fontSize: 12 }}
            >
              {skillGroup.category && (
                <span
                  style={{
                    fontWeight: 700,
                    fontFamily: "Arial,sans-serif",
                    minWidth: 90,
                    flexShrink: 0,
                  }}
                >
                  {skillGroup.category}:
                </span>
              )}
              <span style={{ color: "#333" }}>
                {skillGroup.items.join(", ")}
              </span>
            </div>
          ))}
        </Section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <Section title="Key Projects">
          {data.projects.map((project, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    fontFamily: "Arial,sans-serif",
                  }}
                >
                  {project.name}
                </span>
                {project.tech.length > 0 && (
                  <span
                    style={{ fontSize: 10, color: "#666", fontStyle: "italic" }}
                  >
                    {project.tech.join(", ")}
                  </span>
                )}
              </div>
              {project.description && (
                <p
                  style={{
                    fontSize: 12,
                    color: "#555",
                    margin: "3px 0 5px",
                    fontStyle: "italic",
                  }}
                >
                  {project.description}
                </p>
              )}
              {project.bullets.map((bullet, j) => (
                <div
                  key={j}
                  style={{ display: "flex", gap: 8, marginBottom: 3 }}
                >
                  <span style={{ flexShrink: 0 }}>▪</span>
                  <span
                    style={{ fontSize: 12, color: "#333", lineHeight: 1.6 }}
                  >
                    {bullet}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </Section>
      )}

      {/* Education */}
      {data.education?.length > 0 && (
        <Section title="Education">
          {data.education.map((edu, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 6,
              }}
            >
              <div>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    fontFamily: "Arial,sans-serif",
                  }}
                >
                  {edu.degree}
                </span>
                {edu.school && (
                  <span
                    style={{ fontSize: 12, color: "#555", fontStyle: "italic" }}
                  >
                    {" "}
                    — {edu.school}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11, color: "#555" }}>
                {edu.duration}
              </span>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2
        style={{
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          fontFamily: "Arial, sans-serif",
          borderBottom: "1px solid #1a1a1a",
          paddingBottom: 4,
          marginBottom: 10,
          margin: "0 0 10px",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}
