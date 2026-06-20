// components/ResumePDF.tsx
"use client";
import { StructuredResume } from "@/app/types/resume";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
// import { StructuredResume } from "@/types/resume";

const s = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 48,
    paddingRight: 48,
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: "#1a1a1a",
    lineHeight: 1.6,
  },

  // Header
  header: {
    textAlign: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "2px solid #1a1a1a",
  },
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  contact: { fontSize: 9, color: "#444" },

  // Section
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    borderBottom: "1px solid #1a1a1a",
    paddingBottom: 3,
    marginBottom: 8,
    marginTop: 14,
  },

  // Experience
  jobRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  jobTitle: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  jobDuration: { fontSize: 9, color: "#555" },
  jobCompany: {
    fontSize: 10,
    color: "#555",
    fontFamily: "Times-Italic",
    marginBottom: 4,
  },
  jobLocation: { fontSize: 9, color: "#777" },

  // Bullet
  bulletRow: { flexDirection: "row", marginBottom: 3, paddingLeft: 4 },
  bulletDot: { width: 10, fontSize: 10 },
  bulletText: { flex: 1, fontSize: 10, lineHeight: 1.6 },

  // Skills
  skillRow: { flexDirection: "row", marginBottom: 4 },
  skillCategory: { fontFamily: "Helvetica-Bold", fontSize: 10, width: 90 },
  skillItems: { flex: 1, fontSize: 10, color: "#333" },

  // Projects
  projectName: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  projectTech: { fontSize: 9, color: "#666", fontFamily: "Times-Italic" },
  projectDesc: {
    fontSize: 10,
    color: "#555",
    fontFamily: "Times-Italic",
    marginBottom: 4,
    marginTop: 2,
  },

  // Education
  eduRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  eduDegree: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  eduSchool: { fontSize: 10, color: "#555", fontFamily: "Times-Italic" },
  eduDuration: { fontSize: 9, color: "#555" },
});

export function ResumePDF({ data }: { data: StructuredResume }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.name}>{data.name}</Text>
          <Text style={s.contact}>
            {[data.email, data.phone, data.linkedin, data.location]
              .filter(Boolean)
              .join("  |  ")}
          </Text>
        </View>

        {/* Summary */}
        {data.summary && (
          <View>
            <Text style={s.sectionTitle}>Professional Summary</Text>
            <Text style={{ fontSize: 10, color: "#333", lineHeight: 1.7 }}>
              {data.summary}
            </Text>
          </View>
        )}

        {/* Experience */}
        {data.experience?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Professional Experience</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={{ marginBottom: 12 }}>
                <View style={s.jobRow}>
                  <Text style={s.jobTitle}>{exp.title}</Text>
                  <Text style={s.jobDuration}>{exp.duration}</Text>
                </View>
                <View style={[s.jobRow, { marginBottom: 5 }]}>
                  <Text style={s.jobCompany}>{exp.company}</Text>
                  {exp.location && (
                    <Text style={s.jobLocation}>{exp.location}</Text>
                  )}
                </View>
                {exp.bullets.map((bullet, j) => (
                  <View key={j} style={s.bulletRow}>
                    <Text style={s.bulletDot}>•</Text>
                    <Text style={s.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Technical Skills</Text>
            {data.skills.map((sg, i) => (
              <View key={i} style={s.skillRow}>
                {sg.category && (
                  <Text style={s.skillCategory}>{sg.category}:</Text>
                )}
                <Text style={s.skillItems}>{sg.items.join(", ")}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Key Projects</Text>
            {data.projects.map((project, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <View style={s.jobRow}>
                  <Text style={s.projectName}>{project.name}</Text>
                  {project.tech.length > 0 && (
                    <Text style={s.projectTech}>{project.tech.join(", ")}</Text>
                  )}
                </View>
                {project.description && (
                  <Text style={s.projectDesc}>{project.description}</Text>
                )}
                {project.bullets.map((bullet, j) => (
                  <View key={j} style={s.bulletRow}>
                    <Text style={s.bulletDot}>▪</Text>
                    <Text style={s.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={s.eduRow}>
                <View>
                  <Text style={s.eduDegree}>{edu.degree}</Text>
                  {edu.school && <Text style={s.eduSchool}>{edu.school}</Text>}
                </View>
                <Text style={s.eduDuration}>{edu.duration}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
