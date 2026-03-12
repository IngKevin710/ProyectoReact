import { createContext, useContext, useState, useSyncExternalStore } from "react";
import Header from "../utils/Header";
import { themeStore } from "../utils/stores";

const ThemeContext = createContext();

function ContextProvider({ children }) {
  const [fontSize, setFontSize] = useState("1rem");
  return (
    <ThemeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

function NestedComponent() {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const { fontSize } = useContext(ThemeContext);
  const sub = isDark ? "#94a3b8" : "#64748b";

  return (
    <div style={{ color: sub, fontSize, padding: "1rem", background: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 8, border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` }}>
      📝 Texto con tamaño: <strong>{fontSize}</strong>
    </div>
  );
}

export default function HookUseContext() {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";

  return (
    <Header title="useContext" emoji="🌍" category="State" categoryColor="#ec4899">
      <div style={{ color: text, fontFamily: "'IBM Plex Mono', monospace" }}>
        <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
          <code style={{ color: "#ec4899" }}>useContext</code> permite acceder a valores compartidos sin prop drilling. El Provider envuelve los componentes que lo necesitan.
        </p>
        <ContextProvider>
          <div style={{ marginBottom: "1.5rem" }}>
            <NestedComponent />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <FontButton size="0.8rem">Pequeño</FontButton>
            <FontButton size="1rem">Medio</FontButton>
            <FontButton size="1.3rem">Grande</FontButton>
          </div>
        </ContextProvider>
        <p style={{ fontSize: "0.78rem", color: sub, marginTop: "1rem", fontFamily: "sans-serif" }}>💡 El contexto evita pasar props a través de muchos niveles (prop drilling).</p>
      </div>
    </Header>
  );
}

function FontButton({ size, children }) {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const { setFontSize } = useContext(ThemeContext);
  
  return (
    <button onClick={() => setFontSize(size)} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${isDark ? "#ec4899" : "#ec4899"}`, background: "transparent", color: "#ec4899", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}>
      {children}
    </button>
  );
}
