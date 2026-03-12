export default function Header({ isDark, onBack, title, emoji, category, categoryColor, children }) {
  const bg = isDark ? "#0a0f1e" : "#f8fafc";
  const card = isDark ? "#0f172a" : "#ffffff";
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "#1e293b" : "#e2e8f0";

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'IBM Plex Mono', monospace", transition: "background 0.3s" }}>
      <div style={{ background: card, borderBottom: `1px solid ${border}`, padding: "1.5rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {onBack && (
            <button onClick={onBack} style={{ background: "none", border: `1px solid ${border}`, color: text, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: "0.85rem" }}>
              ← Home
            </button>
          )}
          <span style={{ color: "#6366f1", fontWeight: 700, fontSize: "1.3rem" }}>⚛ React Hooks</span>
          {title && <span style={{ color: sub }}>/ <span style={{ color: text, fontWeight: 700 }}>{title}</span></span>}
        </div>
        <div style={{ fontSize: "0.75rem", color: sub, background: isDark ? "#1e293b" : "#f1f5f9", padding: "4px 10px", borderRadius: 6 }}>
          {isDark ? "🌙 dark" : "☀️ light"}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "2rem" }}>{emoji}</span>
            <h2 style={{ color: text, margin: 0, fontSize: "1.8rem" }}>{title}</h2>
            <span style={{ fontSize: "0.75rem", background: `${categoryColor}22`, color: categoryColor, padding: "3px 10px", borderRadius: 10, fontWeight: 700 }}>
              {category}
            </span>
          </div>
          <hr style={{ border: "none", borderTop: `1px solid ${border}`, margin: "1.5rem 0" }} />
          {children}
        </div>
      </div>
    </div>
  );
}
