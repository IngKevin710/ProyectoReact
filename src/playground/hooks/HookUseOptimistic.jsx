import { useState, useOptimistic, useSyncExternalStore } from "react";
import Header from "../utils/Header";
import { themeStore } from "../utils/stores";

export default function HookUseOptimistic() {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const [items, setItems] = useState(["Elemento 1"]);
  const [optimisticItems, addOptimisticItem] = useOptimistic(items, (state, newItem) => [...state, newItem]);
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";
  const card = isDark ? "#0f172a" : "#ffffff";
  const border = isDark ? "#1e293b" : "#e2e8f0";

  const handleAddItem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem = formData.get("item");
    addOptimisticItem(newItem);
    e.currentTarget.reset();
    await new Promise(r => setTimeout(r, 800));
    setItems([...items, newItem]);
  };

  return (
    <Header title="useOptimistic" emoji="⚡" category="Transition" categoryColor="#f59e0b">
      <div style={{ color: text, fontFamily: "'IBM Plex Mono', monospace" }}>
        <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
          <code style={{ color: "#f59e0b" }}>useOptimistic</code> actualiza la UI al instante, luego se sincroniza con el servidor.
        </p>
        <form onSubmit={handleAddItem} style={{ marginBottom: "1.5rem" }}>
          <input name="item" type="text" placeholder="Nuevo elemento..." style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${border}`, width: "100%", background: card, color: text, marginBottom: "0.75rem", boxSizing: "border-box", fontFamily: "sans-serif" }} />
          <button type="submit" style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" }}>Agregar</button>
        </form>
        <div style={{ padding: "1rem", borderRadius: 12, background: `${isDark ? "#1e293b" : "#f1f5f9"}`, border: `1px solid ${border}` }}>
          {optimisticItems.length === 0 ? (
            <p style={{ margin: 0, color: sub, fontFamily: "sans-serif" }}>Sin elementos</p>
          ) : (
            optimisticItems.map((item, i) => (
              <div key={i} style={{ padding: "0.5rem", color: sub, fontSize: "0.9rem", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ color: "#f59e0b", fontWeight: 700 }}>✓</span> {item}
              </div>
            ))
          )}
        </div>
        <p style={{ fontSize: "0.78rem", color: sub, marginTop: "1rem", fontFamily: "sans-serif" }}>💡 El elemento aparece al instante en la UI.</p>
      </div>
    </Header>
  );
}