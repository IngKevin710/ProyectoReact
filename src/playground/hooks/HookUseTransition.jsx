import { useState, useTransition, useSyncExternalStore } from "react";
import Header from "../utils/Header";
import { themeStore } from "../utils/stores";

export default function HookUseTransition() {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";
  
  const [input, setInput] = useState("");
  const [items, setItems] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
    
    startTransition(() => {
      const newItems = Array.from({ length: 10 }, (_, i) => `${value}-${i}`);
      setItems(newItems);
    });
  };

  return (
    <Header title="useTransition" emoji="⏳" category="Concurrency" categoryColor="#06b6d4">
      <div style={{ color: text, fontFamily: "'IBM Plex Mono', monospace" }}>
        <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
          <code style={{ color: "#06b6d4" }}>useTransition</code> marca actualizaciones como no urgentes. Mantiene la UI responsiva durante operaciones pesadas.
        </p>
        <div style={{ marginBottom: "1.5rem", padding: "1.5rem", background: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 12, border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` }}>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "#06b6d4", fontWeight: 600 }}>📝 Escribe (genera 10 items):</label>
          <input
            value={input}
            onChange={handleChange}
            type="text"
            placeholder="Escribe algo..."
            style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`, width: "100%", background: isDark ? "#0f172a" : "#ffffff", color: text, boxSizing: "border-box", marginBottom: "0.5rem" }}
          />
          {isPending && <div style={{ color: "#06b6d4", fontSize: "0.85rem" }}>⏳ Procesando...</div>}
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "#06b6d4", fontWeight: 600 }}>Items generados:</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
            {items.map((item, i) => (
              <div key={i} style={{ padding: "0.75rem", background: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 6, border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, fontSize: "0.85rem", color: sub }}>
                ✓ {item}
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: "0.78rem", color: sub, fontFamily: "sans-serif" }}>💡 La UI sigue siendo responsive mientras se procesan los items en background.</p>
      </div>
    </Header>
  );
}
