"use client";
import { useEffect, useState } from "react";

const resumeLines = [
  { width: 72, tag: "good", tagText: "Strong title match", delay: 800 },
  { width: 58, tag: "good", tagText: "Skills align", delay: 1200 },
  { width: 52, tag: "bad", tagText: "Add impact metrics", delay: 1600 },
  { width: 60, tag: "bad", tagText: "Missing numbers", delay: 2000 },
  { width: 65, tag: "good", tagText: "Education verified", delay: 2400 },
  { width: 44, tag: "neutral", tagText: "Quantify further", delay: 2800 },
];

export default function ResumeScanner() {
  const [scanning, setScanning] = useState(false);
  const [visibleTags, setVisibleTags] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const startScan = () => {
      setScanning(true);
      setVisibleTags([]);
      setScore(0);
      resumeLines.forEach((_, i) => {
        setTimeout(() => {
          setVisibleTags(prev => [...prev, i]);
          if (i === resumeLines.length - 1) setScore(67);
        }, resumeLines[i].delay);
      });
      setTimeout(() => {
        setScanning(false);
        setTimeout(startScan, 2000);
      }, 3800);
    };
    const t = setTimeout(startScan, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto float-card">
      <div className="absolute -inset-1 rounded-2xl opacity-60 blur-xl" style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.3), transparent 70%)' }} />
      <div className="relative rounded-2xl overflow-hidden border border-indigo-500/20" style={{ background: 'var(--bg-card)' }}>
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
          <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444', opacity: 0.7 }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B', opacity: 0.7 }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#22C55E', opacity: 0.7 }} />
          <span className="ml-3 text-xs font-mono" style={{ color: 'var(--slate)' }}>resume.pdf — analyzing</span>
          {scanning && <span className="ml-auto text-xs animate-pulse" style={{ color: '#6366F1' }}>● scanning</span>}
        </div>

        <div className="p-6 relative overflow-hidden" style={{ minHeight: 280 }}>
          {scanning && (
            <div
              className="scan-line absolute left-0 right-0 h-px pointer-events-none z-10"
              style={{
                background: 'linear-gradient(90deg, transparent, #6366F1, #818CF8, #6366F1, transparent)',
                boxShadow: '0 0 20px 6px rgba(99,102,241,0.6)',
                top: '0%',
              }}
            />
          )}

          <div className="space-y-4">
            {resumeLines.map((line, i) => (
              <div key={i} className="flex items-center gap-3 h-7">
                <div
                  className="h-2.5 rounded-full flex-shrink-0 transition-all duration-700"
                  style={{
                    width: `${line.width}%`,
                    background: visibleTags.includes(i)
                      ? line.tag === 'good'
                        ? 'linear-gradient(90deg, #22C55E, #16a34a)'
                        : line.tag === 'bad'
                        ? 'linear-gradient(90deg, #EF4444, #dc2626)'
                        : 'linear-gradient(90deg, #F59E0B, #d97706)'
                      : 'rgba(136,146,164,0.15)',
                    boxShadow: visibleTags.includes(i)
                      ? line.tag === 'good' ? '0 0 8px rgba(34,197,94,0.4)' : line.tag === 'bad' ? '0 0 8px rgba(239,68,68,0.4)' : '0 0 8px rgba(245,158,11,0.4)'
                      : 'none',
                  }}
                />
                {visibleTags.includes(i) && (
                  <span
                    className="tag-appear text-xs px-2.5 py-0.5 rounded-full whitespace-nowrap font-medium"
                    style={{
                      background: line.tag === 'good' ? 'rgba(34,197,94,0.12)' : line.tag === 'bad' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                      color: line.tag === 'good' ? '#22C55E' : line.tag === 'bad' ? '#EF4444' : '#F59E0B',
                      border: `1px solid ${line.tag === 'good' ? 'rgba(34,197,94,0.25)' : line.tag === 'bad' ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
                    }}
                  >
                    {line.tag === 'good' ? '✓' : line.tag === 'bad' ? '✗' : '~'} {line.tagText}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/5" style={{ background: 'var(--bg-elevated)' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--slate)' }}>Match Score</span>
            <span className="text-sm font-bold transition-all duration-700" style={{ color: score > 0 ? '#818CF8' : 'var(--slate)' }}>
              {score > 0 ? `${score}%` : '—'}
            </span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'rgba(136,146,164,0.12)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${score}%`,
                background: 'linear-gradient(90deg, #6366F1, #818CF8)',
                boxShadow: '0 0 10px rgba(99,102,241,0.5)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
