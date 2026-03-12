import { useCallback, useState, useSyncExternalStore, memo } from "react";
import Header from "../utils/Header";
import { themeStore } from "../utils/stores";

const ChildComponent = memo(({ onButtonClick, label }) => {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  
  return (
    <div style={{ padding: "1rem", background: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 8, border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, marginBottom: "1rem" }}>
      <p style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.85rem", margin: "0 0 0.5rem" }}>📌 {label}</p>
      <button onClick={onButtonClick} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#a855f7", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
        Clic aquí
      </button>
    </div>
  );
});
ChildComponent.displayName = "ChildComponent";

export default function HookUseCallback() {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";
  
  const [count, setCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);

  const memoizedCallback = useCallback(() => {
    setClickCount(prev => prev + 1);
  }, []);

  return (
    <Header title="useCallback" emoji="🔗" category="Performance" categoryColor="#a855f7">
      <div style={{ color: text, fontFamily: "'IBM Plex Mono', monospace" }}>
        <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
          <code style={{ color: "#a855f7" }}>useCallback</code> memoriza una función para evitar que componentes hijos se re-rendericen innecesariamente.
        </p>
        <div style={{ marginBottom: "1.5rem", padding: "1.5rem", background: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 12, border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` }}>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "#a855f7", fontWeight: 600 }}>Contador padre:</label>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#a855f7", marginBottom: "1rem" }}>{count}</div>
          <button onClick={() => setCount(count + 1)} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#a855f7", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            ➕ Incrementar
          </button>
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "#a855f7", fontWeight: 600 }}>Componentes hijos memorizados:</label>
          <ChildComponent onButtonClick={memoizedCallback} label="Con useCallback - no se re-renderiza" />
        </div>
        <div style={{ padding: "1rem", background: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 8, borderLeft: `4px solid #a855f7` }}>
          <p style={{ color: sub, fontSize: "0.85rem", fontFamily: "sans-serif", margin: 0 }}>Clics en hijo: <strong style={{ color: "#a855f7" }}>{clickCount}</strong></p>
        </div>
        <p style={{ fontSize: "0.78rem", color: sub, marginTop: "1rem", fontFamily: "sans-serif" }}>💡 Abre DevTools → Profiler para ver que el hijo no se re-renderiza.</p>
      </div>
    </Header>
  );
}
