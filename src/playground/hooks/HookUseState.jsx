import { useState, useSyncExternalStore } from "react";
import Header from "../utils/Header";
import { themeStore } from "../utils/stores";

export default function HookUseState() {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const [count, setCount] = useState(0);
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";

  function aumentar() {
    setCount(count + 1);
  }

  function disminuir() {
    setCount(count - 1);
  }

  return (
    <Header title="useState" emoji="📌" category="State" categoryColor="#8b5cf6">
      <div style={{ color: text, fontFamily: "'IBM Plex Mono', monospace" }}>
        <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
          <code style={{ color: "#8b5cf6" }}>useState</code> permite manejar estado local en componentes funcionales.
        </p>
        <div style={{ padding: "1.5rem", borderRadius: 12, background: isDark ? "#1e293b" : "#f1f5f9", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "3rem", fontWeight: 700, color: "#8b5cf6", marginBottom: "1rem" }}>{count}</div>
          <button onClick={aumentar} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#8b5cf6", color: "#fff", fontWeight: 700, cursor: "pointer", marginRight: "0.5rem" }}>+</button>
          <button onClick={disminuir} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", fontWeight: 700, cursor: "pointer" }}>−</button>
        </div>
        <p style={{ fontSize: "0.78rem", color: sub, fontFamily: "sans-serif" }}>💡 Click en los botones para actualizar el estado del contador.</p>
      </div>
    </Header>
  );
}