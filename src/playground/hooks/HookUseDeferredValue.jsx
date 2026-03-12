import { useState, useDeferredValue, useSyncExternalStore } from "react";
import Header from "../utils/Header";
import { themeStore } from "../utils/stores";

const SearchResults = ({ query }) => {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const sub = isDark ? "#94a3b8" : "#64748b";
  
  if (!query) return null;
  
  const results = Array.from({ length: 15 }, (_, i) => `Resultado ${i + 1} para "${query}"`);
  
  return (
    <div style={{ marginTop: "1rem" }}>
      <p style={{ color: sub, fontSize: "0.85rem", marginBottom: "0.5rem" }}>📊 {results.length} resultados:</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
        {results.map((result, i) => (
          <div key={i} style={{ padding: "0.75rem", background: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 6, border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, fontSize: "0.8rem", color: sub }}>
            ✓ {result}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function HookUseDeferredValue() {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";
  
  const [input, setInput] = useState("");
  const deferredValue = useDeferredValue(input);

  return (
    <Header title="useDeferredValue" emoji="📈" category="Concurrency" categoryColor="#10b981">
      <div style={{ color: text, fontFamily: "'IBM Plex Mono', monospace" }}>
        <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
          <code style={{ color: "#10b981" }}>useDeferredValue</code> diferencia un valor. Útil para mantener la UI responsiva cuando el valor cambia frecuentemente (como búsquedas).
        </p>
        <div style={{ marginBottom: "1.5rem", padding: "1.5rem", background: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 12, border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` }}>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "#10b981", fontWeight: 600 }}>🔍 Busca algo:</label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            placeholder="Escribe para buscar..."
            style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`, width: "100%", background: isDark ? "#0f172a" : "#ffffff", color: text, boxSizing: "border-box" }}
          />
          {input !== deferredValue && <div style={{ color: "#10b981", fontSize: "0.85rem", marginTop: "0.5rem" }}>⏳ Actualizando búsqueda...</div>}
        </div>
        <SearchResults query={deferredValue} />
        <p style={{ fontSize: "0.78rem", color: sub, marginTop: "1rem", fontFamily: "sans-serif" }}>💡 El input es urgente, los resultados se actualizan después cuando hay tiempo.</p>
      </div>
    </Header>
  );
}
