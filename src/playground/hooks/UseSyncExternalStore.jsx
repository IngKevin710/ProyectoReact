import { useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";

// Store externo simple
let listeners = [];
let darkMode = false;

const themeStore = {
  subscribe(listener) {
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  },
  getSnapshot() {
    return darkMode;
  },
  toggle() {
    darkMode = !darkMode;
    listeners.forEach(l => l());
  },
};

export default function UseSyncExternalStore() {
  const navigate = useNavigate();
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);

  return (
    <div style={{
      maxWidth: 500, margin: "2rem auto", fontFamily: "sans-serif", padding: "2rem",
      background: isDark ? "#0f172a" : "#fff",
      color: isDark ? "#f1f5f9" : "#0f172a",
      borderRadius: 12, minHeight: "60vh", transition: "all 0.3s"
    }}>
      <button onClick={() => navigate("/")} style={{ color: isDark ? "#94a3b8" : "#475569" }}>
        ← Volver al Home
      </button>
      <h1>useSyncExternalStore</h1>
      <p>Permite suscribirse a un store externo (fuera de React) de forma segura y consistente entre el servidor y el cliente.</p>
      <hr />
      <h3>Ejemplo: Tema global desde un store externo</h3>
      <p>Modo actual: <strong>{isDark ? "🌙 Oscuro" : "☀️ Claro"}</strong></p>
      <button
        onClick={themeStore.toggle}
        style={{
          padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer",
          background: isDark ? "#f1f5f9" : "#0f172a",
          color: isDark ? "#0f172a" : "#f1f5f9",
          fontWeight: 700
        }}
      >
        Cambiar tema
      </button>
      <p style={{ fontSize: "0.85rem", color: isDark ? "#94a3b8" : "#64748b", marginTop: "1rem" }}>
        El store vive fuera de React. <code>useSyncExternalStore</code> sincroniza el componente con él de forma segura.
      </p>
    </div>
  );
}