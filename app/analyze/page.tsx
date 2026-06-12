"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { resumeSchema } from "../api/analyze/schema";
import { parsePdf } from "../actions/parsePdf";

export default function AnalyzePage() {
  const [resume, setResume] = useState("");
  const [jd, setJD] = useState("");
  // const [result, setResult] = useState({});
  // const [isLoading, setLoading] = useState(false);
  const [result, setResult] = useState({});
  // const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (file: File) => {
    const data = await parsePdf(file);
    setResume(data);
    console.log(resume, data);
  };

  const { submit, error, object, isLoading, stop } = useObject({
    api: "/api/analyze",
    schema: resumeSchema,
  });

  const scoreColor = (score: number) =>
    score >= 75 ? "#22C55E" : score >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <main
      style={{
        background: "var(--bg-deep)",
        minHeight: "100vh",
        color: "var(--white)",
      }}
    >
      <nav
        className="border-b border-white/5 px-6 py-4"
        style={{
          background: "rgba(10,15,30,0.9)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{
                background: "linear-gradient(135deg, #6366F1, #818CF8)",
              }}
            >
              ✈
            </div>
            <span
              className="font-bold text-lg"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              JobPilot <span style={{ color: "#818CF8" }}>AI</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm transition-colors hover:text-white"
            style={{ color: "var(--slate)" }}
          >
            ← Back to home
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1
            className="text-4xl font-bold mb-3"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Resume Analysis
          </h1>
          <p style={{ color: "var(--slate)" }}>
            Paste your resume and job description for an instant diagnosis.
          </p>
        </div>

        {/* Input section */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit({ resumeText: resume });
            setResume("");
          }}
        >
          <div
            className="rounded-2xl border overflow-hidden mb-8"
            style={{
              background: "var(--bg-card)",
              borderColor: "rgba(99,102,241,0.2)",
            }}
          >
            <div
              className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x"
              style={{ borderColor: "rgba(99,102,241,0.15)" }}
            >
              <div className="p-6">
                <Label
                  className="block text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "#6366F1" }}
                >
                  Your Resume
                </Label>
                {/* <textarea
                value={resume}
                onChange={e => setResume(e.target.value)}
                className="w-full h-64 text-sm resize-none rounded-xl p-4 outline-none"
                placeholder="Paste your full resume text here..."
                style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'Inter, sans-serif' }}
              /> */}
                <Input
                  type="file"
                  className="w-full h-64 text-sm resize-none rounded-xl p-4 outline-none"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                />
              </div>
              <div className="p-6">
                <Label
                  className="block text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "#6366F1" }}
                >
                  Job Description
                </Label>
                <textarea
                  value={jd}
                  onChange={(e) => setJD(e.target.value)}
                  className="w-full h-64 text-sm resize-none rounded-xl p-4 outline-none"
                  placeholder="Paste the full job description here..."
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    color: "var(--white)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontFamily: "Inter, sans-serif",
                  }}
                />
              </div>
            </div>
            <div
              className="p-6 border-t"
              style={{ borderColor: "rgba(99,102,241,0.15)" }}
            >
              {error && (
                <p
                  className="text-sm mb-4 text-center"
                  style={{ color: "#EF4444" }}
                >
                  {error}
                </p>
              )}
              <button
                // onClick={analyze}
                disabled={isLoading}
                type={"submit"}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.01] disabled:opacity-60 disabled:scale-100"
                style={{
                  background: "linear-gradient(135deg, #6366F1, #818CF8)",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing your resume...
                  </>
                ) : (
                  "Run full analysis →"
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Results */}
        {object?.summary && <div>{object?.summary}</div>}
        {object?.skills &&
          object.skills.map((skill) => (
            <p key={skill} className="text-red-600">
              {skill}
            </p>
          ))}
        {object?.experience && <p>{object.experience}</p>}
      </div>
    </main>
  );
}
