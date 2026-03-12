import { forwardRef, useImperativeHandle, useRef, useState, useSyncExternalStore } from "react";
import Header from "../utils/Header";
import { themeStore } from "../utils/stores";

const CustomInput = forwardRef((props, ref) => {
  const inputRef = useRef(null);
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => {
      if (inputRef.current) inputRef.current.value = "";
    },
    getValue: () => inputRef.current?.value || "",
  }));

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Escribe algo..."
      style={{
        padding: "8px 12px",
        borderRadius: 6,
        border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`,
        width: "100%",
        background: isDark ? "#0f172a" : "#ffffff",
        color: isDark ? "#f1f5f9" : "#0f172a",
        boxSizing: "border-box",
      }}
    />
  );
});
CustomInput.displayName = "CustomInput";

export default function HookUseImperativeHandle() {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";
  const customInputRef = useRef(null);
  const [value, setValue] = useState("");

  const handleGetValue = () => {
    const val = customInputRef.current?.getValue();
    setValue(val);
  };

  return (
    <Header title="useImperativeHandle" emoji="🎮" category="Advanced" categoryColor="#f59e0b">
      <div style={{ color: text, fontFamily: "'IBM Plex Mono', monospace" }}>
        <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
          <code style={{ color: "#f59e0b" }}>useImperativeHandle</code> personaliza la instancia expuesta por <code>forwardRef</code>. Permite controlar componentes hijos imperativa mente.
        </p>
        <div style={{ marginBottom: "1.5rem", padding: "1.5rem", background: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 12, border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` }}>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "#f59e0b", fontWeight: 600 }}>🎛️ Custom Input:</label>
          <CustomInput ref={customInputRef} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <button onClick={() => customInputRef.current?.focus()} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
            ✨ Enfocar
          </button>
          <button onClick={() => customInputRef.current?.clear()} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
            🗑️ Limpiar
          </button>
          <button onClick={handleGetValue} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
            📖 Leer valor
          </button>
        </div>
        {value && <div style={{ color: "#f59e0b", padding: "1rem", background: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 8, marginBottom: "1rem" }}>Valor: <strong>{value}</strong></div>}
        <p style={{ fontSize: "0.78rem", color: sub, fontFamily: "sans-serif" }}>💡 useImperativeHandle crea métodos personalizados para el componente hijo.</p>
      </div>
    </Header>
  );
}
