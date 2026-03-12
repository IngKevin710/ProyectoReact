import { useMemo, useState, useSyncExternalStore } from "react";
import Header from "../utils/Header";
import { themeStore } from "../utils/stores";

const expensiveCalculation = (num) => {
  let result = 0;
  for (let i = 0; i < 1000000000; i++) {
    result += num;
  }
  return result;
};

export default function HookUseMemo() {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";
  
  const [count, setCount] = useState(1);
  const [otherState, setOtherState] = useState(0);

  const memoizedValue = useMemo(() => {
    console.log("📊 Calculando...");
    return expensiveCalculation(count);
  }, [count]);

  return (
    <Header title="useMemo" emoji="⚡" category="Performance" categoryColor="#8b5cf6">
      <div style={{ color: text, fontFamily: "'IBM Plex Mono', monospace" }}>
        <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
          <code style={{ color: "#8b5cf6" }}>useMemo</code> memoriza un valor calculado para evitar recálculos costosos. Solo se recalcula si las dependencias cambian.
        </p>
        <div style={{ marginBottom: "1.5rem", padding: "1.5rem", background: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 12, border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` }}>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "#8b5cf6", fontWeight: 600 }}>🔢 Valor:</label>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#8b5cf6", marginBottom: "1rem" }}>{count}</div>
          <button onClick={() => setCount(count + 1)} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#8b5cf6", color: "#fff", fontWeight: 700, cursor: "pointer", marginRight: "0.5rem" }}>
            ➕ Incrementar
          </button>
        </div>
        <div style={{ marginBottom: "1.5rem", padding: "1.5rem", background: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 12, border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` }}>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "#8b5cf6", fontWeight: 600 }}>Otro estado (sin afectar el cálculo):</label>
          <button onClick={() => setOtherState(otherState + 1)} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#8b5cf6", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            🔄 Cambiar ({otherState})
          </button>
          <p style={{ color: sub, fontSize: "0.85rem", marginTop: "0.5rem", fontFamily: "sans-serif" }}>Abre la consola para ver cuándo se recalcula.</p>
        </div>
        <p style={{ fontSize: "0.78rem", color: sub, fontFamily: "sans-serif" }}>💡 El cálculo solo ocurre cuando <code>count</code> cambia, no cuando <code>otherState</code> cambia.</p>
      </div>
    </Header>
  );
}
