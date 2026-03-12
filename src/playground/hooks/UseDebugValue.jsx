import { useEffect, useState, useSyncExternalStore } from "react";
import { useOnlineStatus } from "../utils/hooks";
import Header from "../utils/Header";
import { themeStore } from "../utils/stores";

export default function UseDebugValue() {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";
  const card = isDark ? "#0f172a" : "#ffffff";
  const border = isDark ? "#1e293b" : "#e2e8f0";
  const isOnline = useOnlineStatus();
  const [jsxUpdate, setJsxUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setJsxUpdate((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Header title="useDebugValue" emoji="🐛" category="Utility" categoryColor="#10b981">
      <div style={{ color: text, fontFamily: "'IBM Plex Mono', monospace" }}>
        <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
          <code style={{ color: "#10b981" }}>useDebugValue</code> etiqueta hooks personalizados en React DevTools. Aquí lo usamos en un hook de estado de red.
        </p>
        <div style={{ padding: "1.5rem", borderRadius: 12, background: isOnline ? "#052e16" : "#450a0a", border: `1px solid ${isOnline ? "#16a34a" : "#dc2626"}`, textAlign: "center" }}>
          <div style={{ fontSize: "3rem" }}>{isOnline ? "🟢" : "🔴"}</div>
          <div style={{ fontWeight: 700, fontSize: "1.2rem", color: isOnline ? "#4ade80" : "#f87171", marginTop: 8 }}>
            {isOnline ? "Conectado a internet" : "Sin conexión"}
          </div>
        </div>
        <p style={{ fontSize: "0.78rem", color: sub, marginTop: "1rem", fontFamily: "sans-serif" }}>💡 Abre React DevTools → Components → busca <code>useOnlineStatus</code></p>
      </div>
    </Header>
  );
}