import Navbar from "@/components/Navbar";
import ResumeScanner from "@/components/ResumeScanner";
import SignInButton from "@/components/SignInButton";
import Link from "next/link";

const features = [
  {
    icon: "🎯",
    title: "Keyword Gap Analysis",
    desc: "We compare your resume against the job description word-by-word, surfacing missing skills and terminology recruiters are scanning for.",
    status: "live",
  },
  {
    icon: "📊",
    title: "Impact Score",
    desc: "Every bullet point gets rated on specificity and measurability. Vague claims get flagged; strong achievements get highlighted.",
    status: "live",
  },
  {
    icon: "✍️",
    title: "Rewrite Suggestions",
    desc: "Don't just know what's wrong — get AI-written alternatives for weak bullet points, ready to paste in.",
    status: "live",
  },
  {
    icon: "📨",
    title: "Cover Letter Generator",
    desc: "Auto-generate a tailored cover letter based on your resume and the specific JD, matching tone and company voice.",
    status: "coming",
  },
  {
    icon: "🔍",
    title: "ATS Compatibility Check",
    desc: "Scan your resume for formatting issues that Applicant Tracking Systems reject before a human ever reads it.",
    status: "coming",
  },
  {
    icon: "📈",
    title: "Application Tracker",
    desc: "Track every application, follow-up, and outcome in one place. JobPilot learns from your results over time.",
    status: "coming",
  },
];

const steps = [
  {
    step: "01",
    title: "Upload your resume",
    desc: "Upload a PDF,We handle the parsing.",
  },
  {
    step: "02",
    title: "Add the job description",
    desc: "Copy the full JD from any job board. The more detail, the better the analysis.",
  },
  {
    step: "03",
    title: "Get your diagnosis",
    desc: "JobPilot returns a structured report: what's strong, what's missing, and what to fix first.",
  },
];

export default function Home() {
  return (
    <main style={{ background: "var(--bg-deep)", color: "var(--white)" }}>
      <section className="relative pt-32 pb-24 px-6 bg-grid overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.12), transparent)",
          }}
        />

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 border"
              style={{
                background: "rgba(99,102,241,0.1)",
                borderColor: "rgba(99,102,241,0.25)",
                color: "#818CF8",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Analyze your resume like a senior technical recruiter.
            </div>

            <h1
              className="text-5xl md:text-6xl font-bold leading-tight mb-6"
              style={{
                letterSpacing: "-0.02em",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              Know exactly why
              <br />
              <span className="gradient-text">you didn&apos;t get</span>
              <br />
              the interview.
            </h1>

            <p
              className="text-lg leading-relaxed mb-10"
              style={{ color: "var(--slate)", maxWidth: 480 }}
            >
              Upload your resume and any job description. Get an ATS score,
              missing keywords, recruiter feedback, and AI-powered improvements
              in under 30 seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/analyze"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105 hover:shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #6366F1, #818CF8)",
                  boxShadow: "0 4px 24px rgba(99,102,241,0.4)",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                Get My ATS Score →
              </Link>
              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium transition-all hover:bg-white/5"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--slate)",
                }}
              >
                See how it works
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6">
              {[
                ["✓ Free to start", "#22C55E"],
                ["✓ AI Insights", "#22C55E"],
                ["✓ Instant results", "#22C55E"],
              ].map(([text, color]) => (
                <span
                  key={text as string}
                  className="text-sm"
                  style={{ color: color as string }}
                >
                  {text as string}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mt-0">
            <ResumeScanner />
            {/* <HeroDemo /> */}
          </div>
        </div>
      </section>

      {/* <HeroDemo /> */}
      {/* Stats strip */}
      <div
        className="border-y border-white/5 py-10 px-6"
        style={{ background: "var(--bg-card)" }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            ["94%", "of resumes have at least one critical gap"],
            ["3×", "more interviews after JobPilot optimization"],
            ["< 30s", "to get your full analysis"],
            ["2.5k+", "resumes analyzed this month"],
          ].map(([stat, label]) => (
            <div key={stat}>
              <div
                className="text-3xl font-bold mb-1 gradient-text"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                {stat}
              </div>
              <div
                className="text-xs leading-tight"
                style={{ color: "var(--slate)" }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-xs uppercase tracking-widest mb-3 font-medium"
              style={{ color: "#6366F1" }}
            >
              the process
            </p>
            <h2
              className="text-4xl font-bold"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Three steps to clarity
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div
                key={s.step}
                className="relative p-8 rounded-2xl border transition-all hover:border-indigo-500/30"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="text-5xl font-bold mb-6 leading-none"
                  style={{
                    color: "rgba(99,102,241,0.2)",
                    fontFamily: "Space Grotesk, sans-serif",
                    letterSpacing: "-0.04em",
                  }}
                >
                  {s.step}
                </div>
                <h3
                  className="text-xl font-semibold mb-3"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {s.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--slate)" }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analyze tool */}
      {/* <section id="analyze" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p
              className="text-xs uppercase tracking-widest mb-3 font-medium"
              style={{ color: "#6366F1" }}
            >
              try it now
            </p>
            <h2
              className="text-4xl font-bold mb-4"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Analyze your resume
            </h2>
            <p style={{ color: "var(--slate)" }}>
              Paste both below and get a full breakdown in seconds.
            </p>
          </div>

          <AnalyzerTool />
        </div>
      </section> */}

      {/* Features */}
      <section id="features" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-xs uppercase tracking-widest mb-3 font-medium"
              style={{ color: "#6366F1" }}
            >
              capabilities
            </p>
            <h2
              className="text-4xl font-bold mb-4"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Built to get you hired
            </h2>
            <p style={{ color: "var(--slate)" }}>
              Live features available now. More launching soon.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-7 rounded-2xl border transition-all group hover:border-indigo-500/30"
                style={{
                  background: "var(--bg-card)",
                  borderColor:
                    f.status === "live"
                      ? "rgba(99,102,241,0.2)"
                      : "rgba(255,255,255,0.06)",
                  opacity: f.status === "coming" ? 0.7 : 1,
                }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: "rgba(99,102,241,0.12)" }}
                  >
                    {f.icon}
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={
                      f.status === "live"
                        ? {
                            background: "rgba(34,197,94,0.12)",
                            color: "#22C55E",
                            border: "1px solid rgba(34,197,94,0.25)",
                          }
                        : {
                            background: "rgba(245,158,11,0.1)",
                            color: "#F59E0B",
                            border: "1px solid rgba(245,158,11,0.2)",
                          }
                    }
                  >
                    {f.status === "live" ? "Live" : "Coming soon"}
                  </span>
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--slate)" }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="relative p-12 rounded-3xl overflow-hidden border border-indigo-500/20"
            style={{ background: "var(--bg-card)" }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15), transparent 60%)",
              }}
            />
            <div className="relative">
              <div className="text-4xl mb-4">🚀</div>
              <h2
                className="text-3xl font-bold mb-4"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                Ready to get more interviews?
              </h2>
              <p className="mb-8" style={{ color: "var(--slate)" }}>
                Stop guessing what recruiters want. Start with a free analysis
              </p>
              <a
                href="#analyze"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #6366F1, #818CF8)",
                  boxShadow: "0 4px 28px rgba(99,102,241,0.45)",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                Analyze my resume — it&apos;s free →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
              style={{
                background: "linear-gradient(135deg, #6366F1, #818CF8)",
              }}
            >
              ✈
            </div>
            <span
              className="font-semibold text-sm"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              JobPilot AI
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--slate)" }}>
            © 2026 JobPilot AI. Built to get you hired.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-xs transition-colors hover:text-white"
                style={{ color: "var(--slate)" }}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}

function AnalyzerTool() {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "var(--bg-card)",
        borderColor: "rgba(99,102,241,0.2)",
      }}
    >
      {/* <div
        className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x"
        style={{ borderColor: "rgba(99,102,241,0.15)" }}
      >
        <div className="p-6">
          <label
            className="block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#6366F1" }}
          >
            Your Resume
          </label>
          <textarea
            className="w-full h-56 text-sm resize-none rounded-xl p-4 outline-none transition-all focus:ring-1"
            placeholder="Paste your resume text here..."
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "var(--white)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: "Inter, sans-serif",
            }}
          />
        </div>
        <div className="p-6">
          <label
            className="block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#6366F1" }}
          >
            Job Description
          </label>
          <textarea
            className="w-full h-56 text-sm resize-none rounded-xl p-4 outline-none transition-all"
            placeholder="Paste the job description here..."
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "var(--white)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: "Inter, sans-serif",
            }}
          />
        </div>
      </div> */}
      <div
        className="p-6 border-t"
        style={{ borderColor: "rgba(99,102,241,0.15)" }}
      >
        <Link
          href="/analyze"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.01] hover:shadow-xl"
          style={{
            background: "linear-gradient(135deg, #6366F1, #818CF8)",
            boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          Run analysis →
        </Link>
        <p
          className="text-center text-xs mt-3"
          style={{ color: "var(--slate)" }}
        >
          Analysis takes about 20 seconds · Free · No account needed
        </p>
      </div>
    </div>
  );
}
