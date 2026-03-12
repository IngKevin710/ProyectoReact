import { useId } from "react";
import Header from "../utils/Header";

function Field({ label, type = "text" }) {
  const id = useId();
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label htmlFor={id} style={{ display: "block", fontWeight: 600, marginBottom: 4, color: "#e2e8f0" }}>{label}</label>
      <input id={id} type={type} placeholder={`Ingresa tu ${label.toLowerCase()}...`} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #475569", width: "100%", background: "#1e293b", color: "#f1f5f9", boxSizing: "border-box" }} />
    </div>
  );
}

export default function UseId({ isDark, onBack }) {
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";

  return (
    <Header isDark={isDark} onBack={onBack} title="useId" emoji="🪪" category="Utility" categoryColor="#f59e0b">
      <div style={{ color: text, fontFamily: "'IBM Plex Mono', monospace" }}>
        <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
          Cada campo recibe un ID único generado automáticamente por <code style={{ color: "#f59e0b" }}>useId()</code>, evitando colisiones aunque el componente se reutilice.
        </p>
        <Field label="Nombre" />
        <Field label="Correo electrónico" type="email" />
        <Field label="Contraseña" type="password" />
        <p style={{ fontSize: "0.78rem", color: sub, marginTop: "0.5rem", fontFamily: "sans-serif" }}>💡 Inspecciona el DOM y verás IDs como <code>:r0:</code>, <code>:r1:</code>...</p>
      </div>
    </Header>
  );
}