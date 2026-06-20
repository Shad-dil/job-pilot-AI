// components/DownloadButton.tsx
"use client";
import { pdf } from "@react-pdf/renderer";
import { ResumePDF } from "./ResumePDF";
// import { StructuredResume } from "@/types/resume";
import { useState } from "react";
import { StructuredResume } from "@/app/types/resume";

export default function DownloadButton({
  data,
  filename,
}: {
  data: StructuredResume;
  filename: string;
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await pdf(<ResumePDF data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename.replace(".pdf", "_optimized.pdf");
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF generation failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      style={{
        width: "100%",
        padding: "12px 5px",
        borderRadius: 12,
        border: "none",
        background: downloading
          ? "rgba(255,255,255,0.05)"
          : "linear-gradient(135deg,#6366F1,#818CF8)",
        color: "white",
        fontSize: 14,
        fontWeight: 600,
        cursor: downloading ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontFamily: "Space Grotesk,sans-serif",
        boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
      }}
    >
      {downloading ? (
        <>
          <span className="spinner" /> Generating PDF...
        </>
      ) : (
        "⬇ Download Optimized Resume"
      )}
    </button>
  );
}
