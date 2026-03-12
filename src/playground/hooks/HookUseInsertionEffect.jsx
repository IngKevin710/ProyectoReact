import { useState, useInsertionEffect, useSyncExternalStore } from "react";
import Header from "../utils/Header";
import { themeStore } from "../utils/stores";

export default function HookUseInsertionEffect() {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const [styleCount, setStyleCount] = useState(0);
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";

  useInsertionEffect(() => {
    const style = document.createElement("style");
    style.textContent = `.dynamic-text-${styleCount} { color: hsl(${styleCount * 30}, 80%, 50%); font-weight: 700; }`;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [styleCount]);

  return (
    <Header title="useInsertionEffect" emoji="💉" category="Side Effect" categoryColor="#10b981">
      <div style={{ color: text, fontFamily: "'IBM Plex Mono', monospace" }}>
        <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
          <code style={{ color: "#10b981" }}>useInsertionEffect</code> inyecta estilos <strong>antes</strong> de que React actualice el DOM.
        </p>
        <div style={{ padding: "1.5rem", borderRadius: 12, background: isDark ? "#1e293b" : "#f1f5f9", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, textAlign: "center", marginBottom: "1.5rem" }}>
          <p className={`dynamic-text-${styleCount}`} style={{ margin: 0, fontSize: "1.5rem", fontFamily: "sans-serif" }}>Estilo dinámico #{styleCount}</p>
          <p style={{ color: sub, marginTop: "0.5rem", fontFamily: "sans-serif", fontSize: "0.9rem" }}>Estilos inyectados: {styleCount}</p>
        </div>
        <button onClick={() => setStyleCount(styleCount + 1)} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" }}>Agregar estilo</button>
        <p style={{ fontSize: "0.78rem", color: sub, marginTop: "1rem", fontFamily: "sans-serif" }}>💡 Los estilos se inyectan antes de React pinte el componente.</p>
      </div>
    </Header>
  );
}