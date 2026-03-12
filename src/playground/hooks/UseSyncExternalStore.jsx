import { useSyncExternalStore } from "react";
import { themeStore } from "../utils/stores";
import Header from "../utils/Header";

export default function UseSyncExternalStore({ isDark, onBack }) {
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "#1e293b" : "#e2e8f0";

  return (
    <Header isDark={isDark} onBack={onBack} title="useSyncExternalStore" emoji="🔄" category="Utility" categoryColor="#3b82f6">
      <div style={{ color: text, fontFamily: "'IBM Plex Mono', monospace" }}>
        <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
          Se suscribe a un store externo fuera de React. El tema vive en una variable global y este hook lo sincroniza.
        </p>
        <div style={{ padding: "1.5rem", borderRadius: 12, background: isDark ? "#1e293b" : "#f1f5f9", border: `1px solid ${border}`, textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>{isDark ? "🌙" : "☀️"}</div>
          <div style={{ fontWeight: 700, color: text }}>Modo: {isDark ? "Oscuro" : "Claro"}</div>
          <button onClick={themeStore.toggle} style={{ marginTop: "1rem", padding: "8px 20px", borderRadius: 8, border: "none", background: isDark ? "#f1f5f9" : "#0f172a", color: isDark ? "#0f172a" : "#f1f5f9", fontWeight: 700, cursor: "pointer" }}>
            Cambiar tema
          </button>
        </div>
        <p style={{ fontSize: "0.78rem", color: sub, marginTop: "1rem", fontFamily: "sans-serif" }}>💡 El store vive fuera del árbol de React. <code>useSyncExternalStore</code> lo conecta.</p>
      </div>
    </Header>
  );
}