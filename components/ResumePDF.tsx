"use client";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Line,
  Svg,
} from "@react-pdf/renderer";

// Shared type inline to avoid import issues in this example
type SkillGroup = { category: string; items: string[] };
type Experience = {
  company: string;
  title: string;
  duration: string;
  location: string;
  bullets: string[];
};
type Education = { school: string; degree: string; duration: string };
type Project = {
  name: string;
  description: string;
  tech: string[];
  bullets: string[];
};

export type StructuredResume = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  location: string;
  summary: string;
  experience: Experience[];
  skills: SkillGroup[];
  education: Education[];
  projects: Project[];
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 44,
    paddingRight: 44,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1a1a1a",
    backgroundColor: "#ffffff",
  },

  // ── Header ────────────────────────────────────────────────────────────────
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 5,
    color: "#111",
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 0,
    marginBottom: 12,
  },
  contactItem: {
    fontSize: 8,
    color: "#444",
  },
  contactSep: {
    fontSize: 8,
    color: "#aaa",
    marginHorizontal: 5,
  },

  // ── Section ───────────────────────────────────────────────────────────────
  section: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#111",
    marginRight: 8,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#222",
  },

  // ── Experience ────────────────────────────────────────────────────────────
  expBlock: {
    marginBottom: 7,
  },
  expTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 1,
  },
  expTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#111",
  },
  expDuration: {
    fontSize: 8,
    color: "#555",
    fontFamily: "Helvetica-Oblique",
  },
  expBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 3,
  },
  expCompany: {
    fontSize: 8.5,
    color: "#444",
    fontFamily: "Helvetica-Oblique",
  },
  expLocation: {
    fontSize: 8,
    color: "#666",
  },

  // ── Bullet ────────────────────────────────────────────────────────────────
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2,
    alignItems: "flex-start",
    paddingLeft: 4,
  },
  bulletDot: {
    width: 9,
    fontSize: 9,
    color: "#333",
    marginTop: 0.5,
  },
  bulletText: {
    flex: 1,
    fontSize: 8.5,
    lineHeight: 1.4,
    color: "#222",
  },

  // ── Skills ────────────────────────────────────────────────────────────────
  skillRow: {
    flexDirection: "row",
    marginBottom: 2.5,
    alignItems: "flex-start",
  },
  skillCategory: {
    width: 80,
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#111",
    flexShrink: 0,
  },
  skillColon: {
    width: 8,
    fontSize: 8.5,
    color: "#555",
  },
  skillItems: {
    flex: 1,
    fontSize: 8.5,
    color: "#333",
    lineHeight: 1.4,
  },

  // ── Projects ──────────────────────────────────────────────────────────────
  projectBlock: {
    marginBottom: 6,
  },
  projectTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 1,
  },
  projectName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#111",
  },
  projectTech: {
    fontSize: 7.5,
    color: "#555",
    fontFamily: "Helvetica-Oblique",
    maxWidth: 200,
    textAlign: "right",
  },
  projectDesc: {
    fontSize: 8.5,
    color: "#444",
    fontFamily: "Helvetica-Oblique",
    marginBottom: 2,
    lineHeight: 1.3,
  },

  // ── Education ─────────────────────────────────────────────────────────────
  eduBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  eduLeft: {
    flex: 1,
  },
  eduDegree: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#111",
    marginBottom: 1,
  },
  eduSchool: {
    fontSize: 8.5,
    color: "#444",
    fontFamily: "Helvetica-Oblique",
  },
  eduDuration: {
    fontSize: 8,
    color: "#555",
    fontFamily: "Helvetica-Oblique",
    marginTop: 1,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionLine} />
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={s.bulletRow}>
      <Text style={s.bulletDot}>{"\u2022"}</Text>
      <Text style={s.bulletText}>{text}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function ResumePDF({ data }: { data: StructuredResume }) {
  const contacts = [
    data.email,
    data.phone,
    data.linkedin,
    data.location,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <Text style={s.name}>{data.name}</Text>
        <View style={s.contactRow}>
          {contacts.map((c, i) => (
            <View key={i} style={{ flexDirection: "row" }}>
              {i > 0 && <Text style={s.contactSep}>|</Text>}
              <Text style={s.contactItem}>{c}</Text>
            </View>
          ))}
        </View>

        {/* Divider under header */}
        <View
          style={{ height: 1.5, backgroundColor: "#111", marginBottom: 10 }}
        />

        {/* ── SUMMARY ───────────────────────────────────────────────────── */}
        {data.summary ? (
          <View style={s.section}>
            <SectionHeader title="Professional Summary" />
            <Text style={{ fontSize: 8.5, color: "#333", lineHeight: 1.5 }}>
              {data.summary}
            </Text>
          </View>
        ) : null}

        {/* ── EXPERIENCE ────────────────────────────────────────────────── */}
        {data.experience?.length > 0 ? (
          <View style={s.section}>
            <SectionHeader title="Professional Experience" />
            {data.experience.map((exp, i) => (
              <View key={i} style={s.expBlock} wrap={false}>
                <View style={s.expTopRow}>
                  <Text style={s.expTitle}>{exp.title}</Text>
                  <Text style={s.expDuration}>{exp.duration}</Text>
                </View>
                <View style={s.expBottomRow}>
                  <Text style={s.expCompany}>{exp.company}</Text>
                  {exp.location ? (
                    <Text style={s.expLocation}>{exp.location}</Text>
                  ) : null}
                </View>
                {exp.bullets.map((b, j) => (
                  <Bullet key={j} text={b} />
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* ── SKILLS ────────────────────────────────────────────────────── */}
        {data.skills?.length > 0 ? (
          <View style={s.section} wrap={false}>
            <SectionHeader title="Technical Skills" />
            {data.skills.map((sg, i) => (
              <View key={i} style={s.skillRow}>
                <Text style={s.skillCategory}>{sg.category}</Text>
                <Text style={s.skillColon}>: </Text>
                <Text style={s.skillItems}>{sg.items.join(", ")}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* ── PROJECTS ──────────────────────────────────────────────────── */}
        {data.projects?.length > 0 ? (
          <View style={s.section}>
            <SectionHeader title="Key Projects" />
            {data.projects.map((proj, i) => (
              <View key={i} style={s.projectBlock} wrap={false}>
                <View style={s.projectTopRow}>
                  <Text style={s.projectName}>{proj.name}</Text>
                  {proj.tech?.length > 0 ? (
                    <Text style={s.projectTech}>{proj.tech.join(", ")}</Text>
                  ) : null}
                </View>
                {proj.description ? (
                  <Text style={s.projectDesc}>{proj.description}</Text>
                ) : null}
                {proj.bullets.map((b, j) => (
                  <Bullet key={j} text={b} />
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* ── EDUCATION ─────────────────────────────────────────────────── */}
        {data.education?.length > 0 ? (
          <View style={s.section} wrap={false}>
            <SectionHeader title="Education" />
            {data.education.map((edu, i) => (
              <View key={i} style={s.eduBlock}>
                <View style={s.eduLeft}>
                  <Text style={s.eduDegree}>{edu.degree}</Text>
                  {edu.school ? (
                    <Text style={s.eduSchool}>{edu.school}</Text>
                  ) : null}
                </View>
                <Text style={s.eduDuration}>{edu.duration}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
