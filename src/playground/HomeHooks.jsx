import { useState, useSyncExternalStore } from "react";
import { themeStore } from "./utils/stores";
import UseId from "./hooks/UseId";
import UseDebugValue from "./hooks/UseDebugValue";
import UseSyncExternalStore from "./hooks/UseSyncExternalStore";
import Use from "./hooks/Use";
import UseActionState from "./hooks/UseActionState";
import UseFormStatus from "./hooks/UseFormStatus";

const hooks = [
  { id: "useId",                 emoji: "🪪", category: "Utility",     color: "#f59e0b" },
  { id: "useDebugValue",         emoji: "🐛", category: "Utility",     color: "#10b981" },
  { id: "useSyncExternalStore",  emoji: "🔄", category: "Utility",     color: "#3b82f6" },
  { id: "use",                   emoji: "⚡", category: "Utility",     color: "#a855f7" },
  { id: "useActionState",        emoji: "📋", category: "Form/Action", color: "#ef4444" },
  { id: "useFormStatus",         emoji: "📡", category: "Form/Action", color: "#ec4899" },
];

const hookComponents = {
  useId: UseId,
  useDebugValue: UseDebugValue,
  useSyncExternalStore: UseSyncExternalStore,
  use: Use,
  useActionState: UseActionState,
  useFormStatus: UseFormStatus,
};

export default function HomeHooks() {
  const [active, setActive] = useState(null);
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);

  const bg = isDark ? "#0a0f1e" : "#f8fafc";
  const card = isDark ? "#0f172a" : "#ffffff";
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "#1e293b" : "#e2e8f0";

  // Si hay un hook activo, renderizar su componente
  if (active) {
    const Component = hookComponents[active];
    return <Component isDark={isDark} onBack={() => setActive(null)} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'IBM Plex Mono', monospace", transition: "background 0.3s" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: card, borderBottom: `1px solid ${border}`, padding: "1.5rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "#6366f1", fontWeight: 700, fontSize: "1.3rem" }}>⚛ React Hooks</span>
          </div>
          <p style={{ color: sub, margin: "4px 0 0", fontSize: "0.8rem" }}>Hooks #14–19 · Playground</p>
        </div>
        <div style={{ fontSize: "0.75rem", color: sub, background: isDark ? "#1e293b" : "#f1f5f9", padding: "4px 10px", borderRadius: 6 }}>
          {isDark ? "🌙 dark" : "☀️ light"}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
        <h2 style={{ color: text, fontWeight: 700, fontSize: "1.6rem", marginBottom: "0.5rem" }}>Mis Hooks Asignados</h2>
        <p style={{ color: sub, marginBottom: "2rem", fontSize: "0.85rem" }}>Haz clic en cualquier hook para ver su descripción y ejercicio interactivo.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
          {hooks.map(h => (
            <div key={h.id} onClick={() => setActive(h.id)} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: "1.5rem", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${h.color}33`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "1.8rem" }}>{h.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, color: h.color, fontSize: "1rem" }}>{h.id}</div>
                  <span style={{ fontSize: "0.7rem", background: `${h.color}22`, color: h.color, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{h.category}</span>
                </div>
              </div>
              <p style={{ color: sub, fontSize: "0.8rem", margin: 0, lineHeight: 1.5 }}>
                {{
                  useId: "Genera IDs únicos para vincular labels con inputs de forma accesible.",
                  useDebugValue: "Etiqueta hooks personalizados en React DevTools.",
                  useSyncExternalStore: "Se suscribe a stores externos fuera del árbol de React.",
                  use: "Lee Promises directamente en el render con Suspense.",
                  useActionState: "Gestiona estado, pendiente y resultado de acciones de form.",
                  useFormStatus: "Lee el estado del formulario padre desde un componente hijo.",
                }[h.id]}
              </p>
              <div style={{ marginTop: "1rem", color: h.color, fontSize: "0.8rem", fontWeight: 600 }}>Ver ejercicio →</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}