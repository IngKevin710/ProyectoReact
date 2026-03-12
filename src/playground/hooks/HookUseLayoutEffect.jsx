import { useState, useLayoutEffect, useSyncExternalStore } from "react";
import Header from "../utils/Header";
import { themeStore } from "../utils/stores";

export default function HookUseLayoutEffect() {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const [width, setWidth] = useState(window.innerWidth);
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";

  useLayoutEffect(() => {
    function actualizar() {
      setWidth(window.innerWidth);
    }

    window.addEventListener("resize", actualizar);
    return () => window.removeEventListener("resize", actualizar);
  }, []);

  return (
    <Header title="useLayoutEffect" emoji="🎨" category="Side Effect" categoryColor="#06b6d4">
      <div style={{ color: text, fontFamily: "'IBM Plex Mono', monospace" }}>
        <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
          <code style={{ color: "#06b6d4" }}>useLayoutEffect</code> se ejecuta <strong>antes</strong> de que el navegador pinte (sincrónico con el DOM).
        </p>
        <div style={{ padding: "1.5rem", borderRadius: 12, background: isDark ? "#1e293b" : "#f1f5f9", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#06b6d4" }}>{width}</div>
          <p style={{ margin: "0.5rem 0 0", color: sub, fontFamily: "sans-serif" }}>px de ancho</p>
          <p style={{ margin: "0.5rem 0", color: sub, fontSize: "0.85rem", fontFamily: "sans-serif" }}>Redimensiona la ventana para actualizar en tiempo real</p>
        </div>
        <p style={{ fontSize: "0.78rem", color: sub, fontFamily: "sans-serif" }}>💡 El ancho se mide antes de pintar (diferente a useEffect).</p>
      </div>
    </Header>
  );
}