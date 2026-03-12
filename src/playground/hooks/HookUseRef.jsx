import { useRef, useSyncExternalStore } from "react";
import Header from "../utils/Header";
import { themeStore } from "../utils/stores";

export default function HookUseRef() {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";
  const inputRef = useRef(null);
  const countRef = useRef(0);

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  const incrementCount = () => {
    countRef.current += 1;
    alert(`Contador (sin re-render): ${countRef.current}`);
  };

  return (
    <Header title="useRef" emoji="📍" category="Advanced" categoryColor="#06b6d4">
      <div style={{ color: text, fontFamily: "'IBM Plex Mono', monospace" }}>
        <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
          <code style={{ color: "#06b6d4" }}>useRef</code> persiste un valor mutable entre renders sin causar re-renders. Útil para acceder a elementos DOM directamente.
        </p>
        <div style={{ marginBottom: "1.5rem", padding: "1.5rem", background: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 12, border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` }}>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "#06b6d4", fontWeight: 600 }}>📌 Enfoca el input:</label>
          <input ref={inputRef} type="text" placeholder="Haz clic en el botón..." style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`, width: "100%", background: isDark ? "#0f172a" : "#ffffff", color: text, marginBottom: "1rem", boxSizing: "border-box" }} />
          <button onClick={handleFocus} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#06b6d4", color: "#fff", fontWeight: 700, cursor: "pointer", marginBottom: "1rem" }}>
            ✨ Enfocar input
          </button>
        </div>
        <div style={{ padding: "1.5rem", background: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 12, border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` }}>
          <p style={{ color: sub, marginBottom: "0.5rem", fontFamily: "sans-serif" }}>⚡ Contador que NO causa re-render:</p>
          <button onClick={incrementCount} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#06b6d4", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            📊 Incrementar
          </button>
        </div>
        <p style={{ fontSize: "0.78rem", color: sub, marginTop: "1rem", fontFamily: "sans-serif" }}>💡 Los refs no causan re-renders (a diferencia de setState).</p>
      </div>
    </Header>
  );
}
