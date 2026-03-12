import { useReducer, useSyncExternalStore } from "react";
import Header from "../utils/Header";
import { themeStore } from "../utils/stores";

function reducer(state, action) {
  switch (action.type) {
    case "sumar":
      return { count: state.count + 1 };
    case "restar":
      return { count: state.count - 1 };
    default:
      return state;
  }
}

export default function HookUseReducer() {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";

  return (
    <Header title="useReducer" emoji="🔀" category="State" categoryColor="#7c3aed">
      <div style={{ color: text, fontFamily: "'IBM Plex Mono', monospace" }}>
        <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
          <code style={{ color: "#7c3aed" }}>useReducer</code> permite manejar lógica compleja de estado mediante un reducer.
        </p>
        <div style={{ padding: "1.5rem", borderRadius: 12, background: isDark ? "#1e293b" : "#f1f5f9", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "3rem", fontWeight: 700, color: "#7c3aed", marginBottom: "1rem" }}>{state.count}</div>
          <button onClick={() => dispatch({ type: "sumar" })} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", fontWeight: 700, cursor: "pointer", marginRight: "0.5rem" }}>+</button>
          <button onClick={() => dispatch({ type: "restar" })} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#6d28d9", color: "#fff", fontWeight: 700, cursor: "pointer" }}>−</button>
        </div>
        <p style={{ fontSize: "0.78rem", color: sub, fontFamily: "sans-serif" }}>💡 useReducer es ideal para estados complejos con múltiples acciones.</p>
      </div>
    </Header>
  );
}