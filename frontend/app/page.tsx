"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const API = "http://localhost:8000";

interface Prediction { label: string; confidence: number; }
interface Result {
  predictions: Prediction[];
  top_prediction: string;
  ai_insight: string;
}
interface HistoryItem {
  id: string;
  preview: string;
  top: string;
  confidence: number;
  result: Result;
  ts: string;
}

// ── SVG Icons ─────────────────────────────────────────
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconSun = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
);
const IconMoon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const IconUpload = () => (
  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const IconBug = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2L12 6L16 2"/><path d="M12 6C9.24 6 7 8.24 7 11V15C7 17.76 9.24 20 12 20C14.76 20 17 17.76 17 15V11C17 8.24 14.76 6 12 6Z"/><path d="M7 12H3"/><path d="M17 12H21"/><path d="M7 16H4"/><path d="M17 16H20"/><path d="M7 9L4 7"/><path d="M17 9L20 7"/>
  </svg>
);
const IconZoom = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/>
  </svg>
);
const IconRepeat = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);
const IconCopy = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconX = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconWarning = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconCamera = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
  </svg>
);
const IconMonitor = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);
const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconLeaf = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);
const IconStar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const IconSpinner = () => (
  <span style={{
    width: 16, height: 16, borderRadius: "50%",
    border: "2.5px solid rgba(255,255,255,0.25)",
    borderTop: "2.5px solid currentColor",
    display: "inline-block",
  }} className="spin" />
);

// ── Skeleton ───────────────────────────────────────────
function SkeletonPrediction() {
  return (
    <div className="glass" style={{ padding: 22 }}>
      <div className="skeleton" style={{ height: 10, width: "38%", marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 26, width: "65%", marginBottom: 14 }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <div className="skeleton" style={{ height: 22, width: 120, borderRadius: 999 }} />
        <div className="skeleton" style={{ height: 22, width: 75, borderRadius: 999 }} />
      </div>
      <div className="skeleton" style={{ height: 10, width: "42%", marginBottom: 14 }} />
      {[75, 55, 30].map((w, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <div className="skeleton" style={{ height: 10, width: `${w * 0.55}%` }} />
            <div className="skeleton" style={{ height: 10, width: 32 }} />
          </div>
          <div className="skeleton" style={{ height: 8, width: `${w}%`, borderRadius: 999 }} />
        </div>
      ))}
    </div>
  );
}

function SkeletonInsight() {
  return (
    <div className="glass" style={{ padding: 22 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
        <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 8 }} />
        <div className="skeleton" style={{ width: 85, height: 14 }} />
        <div className="skeleton" style={{ width: 55, height: 20, borderRadius: 999, marginLeft: "auto" }} />
        <div className="skeleton" style={{ width: 62, height: 28, borderRadius: 10 }} />
      </div>
      {[100, 90, 96, 70, 85, 60, 78, 50].map((w, i) => (
        <div key={i} className="skeleton" style={{ height: 11, width: `${w}%`, marginBottom: 10 }} />
      ))}
    </div>
  );
}

// ── Confidence Bar ─────────────────────────────────────
function ConfidenceBar({ label, value, rank, animate }: {
  label: string; value: number; rank: number; animate: boolean;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setWidth(Math.min(value, 100)), 60 + rank * 130);
      return () => clearTimeout(t);
    } else {
      setWidth(0);
    }
  }, [animate, value, rank]);

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
        <span style={{
          fontSize: 13, textTransform: "capitalize",
          fontWeight: rank === 0 ? 600 : 400,
          color: rank === 0 ? "var(--accent)" : "var(--muted)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {rank === 0 && (
            <span style={{
              fontSize: 9, background: "var(--top-badge-bg)", borderRadius: 4,
              padding: "2px 7px", color: "#fff", fontWeight: 700, letterSpacing: 0.5,
            }}>TOP</span>
          )}
          {label}
        </span>
        <span style={{
          fontSize: 12, fontFamily: "monospace",
          color: rank === 0 ? "var(--accent)" : "var(--muted)",
          fontWeight: 600,
        }}>
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="confidence-bar-bg">
        <div
          className={rank === 0 ? "confidence-bar-fill" : "confidence-bar-fill-muted"}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

// ── Zoom Modal ─────────────────────────────────────────
function ZoomModal({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="zoom-overlay" onClick={onClose}>
      <img src={src} alt="zoom" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

// ── Main ───────────────────────────────────────────────
export default function HomePage() {
  const [theme, setTheme]         = useState<"dark" | "light">("dark");
  const [file, setFile]           = useState<File | null>(null);
  const [preview, setPreview]     = useState<string | null>(null);
  const [dragging, setDragging]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<Result | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [zoomed, setZoomed]       = useState(false);
  const [copied, setCopied]       = useState(false);
  const [history, setHistory]     = useState<HistoryItem[]>([]);
  const [barsReady, setBarsReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) { setError("File harus berupa gambar (JPG/PNG/WebP)."); return; }
    if (f.size > 10 * 1024 * 1024) { setError("Ukuran file maksimal 10 MB."); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null); setError(null); setBarsReady(false);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0]; if (f) handleFile(f);
  }, []);

  const analyze = async (targetFile?: File) => {
    const f = targetFile ?? file;
    if (!f) return;
    setLoading(true); setResult(null); setError(null); setBarsReady(false);
    const fd = new FormData();
    fd.append("file", f);
    try {
      const res = await fetch(`${API}/analyze`, { method: "POST", body: fd });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail ?? `Error ${res.status}`); }
      const data: Result = await res.json();
      setResult(data);
      setTimeout(() => setBarsReady(true), 50);
      const snap = preview ?? URL.createObjectURL(f);
      const item: HistoryItem = {
        id: Date.now().toString(),
        preview: snap,
        top: data.top_prediction,
        confidence: data.predictions[0].confidence,
        result: data,
        ts: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      setHistory((h) => [item, ...h].slice(0, 10));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menghubungi server. Pastikan backend berjalan.");
    } finally { setLoading(false); }
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null); setPreview(null); setResult(null); setError(null); setBarsReady(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.ai_insight);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadHistory = (item: HistoryItem) => {
    setResult(item.result);
    setPreview(item.preview);
    setFile(null);
    setBarsReady(false);
    setTimeout(() => setBarsReady(true), 80);
  };

  const confidenceColor = result
    ? result.predictions[0].confidence >= 70 ? "#10b981"
      : result.predictions[0].confidence >= 40 ? "#f59e0b" : "#ef4444"
    : "var(--accent)";

  return (
    <>
      {zoomed && preview && <ZoomModal src={preview} onClose={() => setZoomed(false)} />}

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>

        {/* ── Navbar ── */}
        <header style={{
          borderBottom: "1px solid var(--glass-border)",
          background: "var(--navbar-bg)",
          backdropFilter: "blur(24px)",
          position: "sticky", top: 0, zIndex: 30,
          padding: "11px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #047857, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(4,120,87,0.45)",
              color: "#fff",
            }} className="leaf-sway">
              <IconLeaf />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.5, color: "var(--text)" }}>
                Lens<span style={{ color: "var(--accent)" }}>Arthropoda</span>
              </span>
              <p style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1, marginTop: 1 }}>Smart Insect Identifier</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="badge badge-green">EfficientNetB3</span>
            <span className="badge badge-teal">Gemini AI</span>
            <button
              onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 10,
                border: "1px solid var(--glass-border)",
                background: "var(--glass)", color: "var(--text)",
                cursor: "pointer", fontSize: 12, fontWeight: 600,
                transition: "all 0.2s",
              }}
            >
              {theme === "dark" ? <IconSun /> : <IconMoon />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </header>

        {/* ── Hero ── */}
        <section style={{ textAlign: "center", padding: "44px 16px 28px" }}>
          <span className="badge badge-emerald" style={{ marginBottom: 14 }}>
            <IconStar /> Deep Learning + Generative AI
          </span>
          <h1 style={{
            fontSize: "clamp(26px,5vw,48px)", fontWeight: 800, lineHeight: 1.15,
            margin: "10px 0 12px",
            background: "var(--heading-grad)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Identifikasi Serangga<br />dengan Kecerdasan AI
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: 480, margin: "0 auto", lineHeight: 1.65, fontSize: 14 }}>
            Upload foto serangga dan dapatkan identifikasi akurat beserta taksonomi,
            habitat, dan fakta unik dari Google Gemini secara real-time.
          </p>
        </section>

        {/* ── Main Grid: 2-col [upload sticky | hasil scroll] ── */}
        <main style={{
          flex: 1, maxWidth: 1240, width: "100%",
          margin: "0 auto", padding: "0 20px 60px",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            alignItems: "stretch",
          }} className="three-col">

            {/* ── Kolom Upload (sticky) ── */}
            <div className="upload-sticky" style={{ display: "flex", flexDirection: "column", gap: 14, alignSelf: "start" }}>

              {/* Card foto — border & background sama dengan card hasil prediksi */}
              <div className="glass" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Upload zone di dalam card */}
                <div
                  className={`upload-zone${dragging ? " drag" : ""}`}
                  style={{
                    padding: 16, textAlign: "center",
                    minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 14,
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => !preview && inputRef.current?.click()}
                >
                  {preview ? (
                    <div style={{ position: "relative", width: "100%" }}>
                      <img
                        src={preview} alt="preview"
                        style={{
                          maxHeight: 230, borderRadius: 10, objectFit: "contain", width: "100%",
                          boxShadow: "0 8px 28px var(--accent-glow)", cursor: "zoom-in",
                        }}
                        onClick={(e) => { e.stopPropagation(); setZoomed(true); }}
                      />
                      <div style={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 5 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setZoomed(true); }}
                          className="btn-icon" style={{ padding: "4px 8px", fontSize: 11 }}
                        >
                          <IconZoom /> Zoom
                        </button>
                        <button onClick={clear} className="btn-icon" style={{ padding: "4px 7px" }} title="Hapus">
                          <IconX />
                        </button>
                      </div>
                      <p style={{
                        marginTop: 7, fontSize: 11, color: "var(--muted)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {file?.name ?? "Gambar dari riwayat"}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="float" style={{ display: "flex", justifyContent: "center", marginBottom: 10, color: "var(--accent)" }}>
                        <IconUpload />
                      </div>
                      <p style={{ fontWeight: 600, color: "var(--text)", fontSize: 13, marginBottom: 5 }}>
                        Seret & lepas gambar di sini
                      </p>
                      <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>atau klik untuk memilih file</p>
                      <span className="badge" style={{
                        background: "var(--glass)", border: "1px solid var(--border)",
                        color: "var(--muted)", fontSize: 10,
                      }}>JPG · PNG · WebP · Maks. 10 MB</span>
                    </div>
                  )}
                </div>

                {/* Tombol Ganti Gambar — muncul kalau sudah ada preview */}
                {preview && (
                  <button
                    className="btn-icon"
                    onClick={() => inputRef.current?.click()}
                    style={{ width: "100%", justifyContent: "center", padding: "8px 0", fontSize: 12 }}
                  >
                    <IconUpload /> Ganti Gambar
                  </button>
                )}
              </div>

              <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

              {/* Tombol Analisis + Ulang */}
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => analyze()} disabled={!file || loading}>
                  {loading ? <><IconSpinner /> Menganalisis...</> : <><IconSearch /> Analisis Serangga</>}
                </button>
                {result && !loading && file && (
                  <button className="btn-icon" onClick={() => analyze(file)} title="Analisis ulang" style={{ flexShrink: 0 }}>
                    <IconRepeat /> Ulang
                  </button>
                )}
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: "var(--error-bg)", border: "1px solid var(--error-border)",
                  borderRadius: 12, padding: "11px 14px", fontSize: 12, color: "var(--error-text)",
                  display: "flex", gap: 8, alignItems: "flex-start",
                }}>
                  <IconWarning />
                  <span>{error}</span>
                </div>
              )}

              {/* Tips (hanya kalau belum ada file) */}
              {!preview && (
                <div className="glass" style={{ padding: "13px 16px" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "var(--muted)", textTransform: "uppercase", marginBottom: 10 }}>
                    Tips foto terbaik
                  </p>
                  {([
                    [<IconCamera key="c" />, "Pastikan serangga terlihat jelas dan fokus"],
                    [<IconMonitor key="m" />, "Gunakan pencahayaan yang cukup, hindari backlight"],
                    [<IconZoom key="z" />, "Ambil dari atas atau samping untuk detail terbaik"],
                  ] as [React.ReactNode, string][]).map(([icon, tip], i) => (
                    <div key={i} style={{ display: "flex", gap: 9, marginBottom: 8, alignItems: "flex-start", color: "var(--muted)" }}>
                      <span style={{ flexShrink: 0, marginTop: 1 }}>{icon}</span>
                      <span style={{ fontSize: 12, lineHeight: 1.5 }}>{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Info Model */}
              {preview && (
                <div className="glass" style={{ padding: "13px 16px" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "var(--muted)", textTransform: "uppercase", marginBottom: 10 }}>
                    Info Model
                  </p>
                  {[
                    ["Model", "EfficientNetB3"],
                    ["Kelas", "118 spesies serangga"],
                    ["Backend", "FastAPI + PyTorch"],
                    ["AI", "Gemini 2.5 Flash Lite"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{k}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)" }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Riwayat Sesi — di bawah Info Model */}
              <div className="glass" style={{ padding: "13px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11, color: "var(--muted)" }}>
                  <IconClock />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text)", letterSpacing: 0.5, textTransform: "uppercase" }}>
                    Riwayat Sesi
                  </span>
                  {history.length > 0 && (
                    <span style={{
                      marginLeft: "auto", fontSize: 10, fontWeight: 600,
                      color: "var(--accent)", background: "var(--bar-bg)",
                      borderRadius: 999, padding: "1px 8px",
                    }}>{history.length}</span>
                  )}
                </div>
                {history.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "12px 4px" }}>
                    <div style={{ color: "var(--empty-icon)", display: "flex", justifyContent: "center", marginBottom: 6, opacity: 0.5 }}>
                      <IconBug />
                    </div>
                    <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>Belum ada analisis sesi ini</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {history.map((item) => (
                      <div key={item.id} className="history-item" onClick={() => loadHistory(item)}>
                        <img src={item.preview} alt={item.top}
                          style={{ width: 36, height: 36, borderRadius: 7, objectFit: "cover", flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <p style={{
                            fontSize: 11, fontWeight: 600, color: "var(--text)",
                            textTransform: "capitalize", whiteSpace: "nowrap",
                            overflow: "hidden", textOverflow: "ellipsis",
                          }}>{item.top}</p>
                          <p style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                            {item.confidence.toFixed(0)}% · {item.ts}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* ── Kolom Hasil (scroll panjang) ── */}
            <div style={{
              display: "flex", flexDirection: "column", gap: 16,
              /* Saat kosong: rentangkan penuh setinggi kolom kiri */
              alignSelf: !result && !loading ? "stretch" : "start",
            }}>

              {/* Skeleton */}
              {loading && (
                <>
                  <SkeletonPrediction />
                  <SkeletonInsight />
                </>
              )}

              {/* Hasil */}
              {result && !loading && (
                <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* Card Prediksi */}
                  <div className="glass" style={{ padding: 22, position: "relative", overflow: "hidden" }}>
                    <div style={{
                      position: "absolute", top: -40, right: -40, width: 140, height: 140,
                      background: `radial-gradient(circle, ${confidenceColor}1a 0%, transparent 70%)`,
                      borderRadius: "50%", pointerEvents: "none",
                    }} />
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: "var(--muted)", textTransform: "uppercase", marginBottom: 7 }}>
                      Hasil Prediksi Utama
                    </p>
                    <h2 style={{
                      fontSize: "clamp(18px,2.5vw,24px)", fontWeight: 800, textTransform: "capitalize",
                      background: "var(--heading-grad)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      marginBottom: 13, lineHeight: 1.2,
                    }}>
                      {result.top_prediction}
                    </h2>
                    <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
                      <span className="badge" style={{
                        background: `${confidenceColor}18`,
                        border: `1px solid ${confidenceColor}40`,
                        color: confidenceColor, fontSize: 11,
                      }}>
                        {result.predictions[0].confidence >= 70 ? "Keyakinan Tinggi"
                          : result.predictions[0].confidence >= 40 ? "Keyakinan Sedang" : "Keyakinan Rendah"
                        } {result.predictions[0].confidence.toFixed(1)}%
                      </span>
                      <span className="badge badge-green">118 Kelas</span>
                    </div>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "var(--muted)", textTransform: "uppercase", marginBottom: 12 }}>
                      Distribusi Probabilitas
                    </p>
                    {result.predictions.map((p, i) => (
                      <ConfidenceBar key={p.label} label={p.label} value={p.confidence} rank={i} animate={barsReady} />
                    ))}
                  </div>

                  {/* Card AI Insights */}
                  <div className="glass" style={{ padding: 22 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: "linear-gradient(135deg, #047857, #059669)",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                      }}>
                        <IconStar />
                      </div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>AI Insights</p>
                      <span className="badge badge-teal" style={{ marginLeft: "auto", fontSize: 10 }}>Gemini</span>
                      <button className="btn-icon" onClick={handleCopy} style={{ padding: "5px 10px", fontSize: 11 }}>
                        {copied ? <><IconCheck /> Tersalin!</> : <><IconCopy /> Salin</>}
                      </button>
                    </div>
                    <div className="divider" />
                    <div className="prose prose-sm" style={{ maxWidth: "none" }}>
                      <ReactMarkdown>{result.ai_insight}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State — tinggi mengikuti kolom kiri saat belum ada hasil */}
              {!result && !loading && (
                <div className="glass" style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  textAlign: "center", padding: "0 24px",
                  minHeight: "calc(100% - 0px)",
                  /* ikut tinggi kolom kiri secara visual */
                  flex: 1,
                  alignSelf: "stretch",
                }}>
                  <div className="float" style={{
                    display: "flex", justifyContent: "center", marginBottom: 14,
                    color: "var(--empty-icon)",
                  }}>
                    <IconBug />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "var(--empty-text)", marginBottom: 8 }}>
                    Menunggu gambar serangga
                  </p>
                  <p style={{ fontSize: 12, color: "var(--empty-sub)", lineHeight: 1.6 }}>
                    Upload gambar di kolom kiri<br />lalu klik Analisis Serangga
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ── Footer ── */}
        <footer style={{
          borderTop: "1px solid var(--glass-border)",
          padding: "16px 24px", textAlign: "center",
          background: "var(--footer-bg)",
        }}>
          <p style={{ fontSize: 12, color: "var(--footer-text)" }}>
            LensArthropoda · Tinsari Rauhana · 2308107010038 · Praktikum ML A
          </p>
          <p style={{ fontSize: 11, color: "var(--footer-sub)", marginTop: 3 }}>
            Next.js · FastAPI · EfficientNetB3 · Google Gemini 2.5 Flash Lite
          </p>
        </footer>
      </div>
    </>
  );
}