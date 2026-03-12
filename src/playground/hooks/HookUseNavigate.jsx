import { useNavigate } from "react-router-dom";
import { useSyncExternalStore } from "react";
import Header from "../utils/Header";
import { themeStore } from "../utils/stores";

export default function HookUseNavigate() {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const navigate = useNavigate();
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";
  const card = isDark ? "#0f172a" : "#ffffff";
  const border = isDark ? "#1e293b" : "#e2e8f0";

  const routes = [
    { name: "useState", path: "/usestate", emoji: "📌" },
    { name: "useReducer", path: "/usereducer", emoji: "🔀" },
    { name: "useEffect", path: "/useeffect", emoji: "🔄" },
    { name: "useLayoutEffect", path: "/uselayouteffect", emoji: "🎨" },
    { name: "Home", path: "/", emoji: "🏠" },
  ];

  return (
    <Header title="useNavigate" emoji="🧭" category="Navigation" categoryColor="#ef4444">
      <div style={{ color: text, fontFamily: "'IBM Plex Mono', monospace" }}>
        <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
          <code style={{ color: "#ef4444" }}>useNavigate</code> permite navegar programáticamente en React Router sin necesidad de enlaces.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          {routes.map(route => (
            <button key={route.path} onClick={() => navigate(route.path)} style={{ padding: "1rem", borderRadius: 8, border: `1px solid ${border}`, background: card, color: text, cursor: "pointer", transition: "transform 0.15s", textAlign: "center", fontFamily: "sans-serif" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{route.emoji}</div>
              <div style={{ fontWeight: 700, color: "#ef4444", fontSize: "0.9rem" }}>{route.name}</div>
            </button>
          ))}
        </div>
        <button onClick={() => navigate(-1)} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#6b7280", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" }}>↶ Volver atrás</button>
        <p style={{ fontSize: "0.78rem", color: sub, marginTop: "1rem", fontFamily: "sans-serif" }}>💡 Usa navigate(ruta) para ir a un destino o navigate(-1) para volver atrás.</p>
      </div>
    </Header>
  );
}