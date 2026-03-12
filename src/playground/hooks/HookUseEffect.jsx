import { useState, useEffect, useSyncExternalStore } from "react";
import Header from "../utils/Header";
import { themeStore } from "../utils/stores";

export default function HookUseEffect() {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const [count, setCount] = useState(0);
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";

  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Clicks: ${count}`;
    
    return () => {
      document.title = prevTitle;
    };
  }, [count]);

  return (
    <Header title="useEffect" emoji="🔄" category="Side Effect" categoryColor="#3b82f6">
      <div style={{ color: text, fontFamily: "'IBM Plex Mono', monospace" }}>
        <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
          <code style={{ color: "#3b82f6" }}>useEffect</code> ejecuta efectos secundarios después del render (mantén abierto DevTools para verlo).
        </p>
        <div style={{ padding: "1.5rem", borderRadius: 12, background: isDark ? "#1e293b" : "#f1f5f9", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "3rem", fontWeight: 700, color: "#3b82f6", marginBottom: "1rem" }}>{count}</div>
          <button onClick={() => setCount(prev => prev + 1)} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#3b82f6", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Aumentar</button>
        </div>
        <p style={{ fontSize: "0.78rem", color: sub, fontFamily: "sans-serif" }}>💡 El título de la pestaña cambia con cada click (efecto secundario).</p>
      </div>
    </Header>
  );
}