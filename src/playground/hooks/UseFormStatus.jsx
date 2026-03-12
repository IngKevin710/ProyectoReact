import { useFormStatus } from "react-dom";
import { useSyncExternalStore } from "react";
import Header from "../utils/Header";
import { themeStore } from "../utils/stores";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: pending ? "#94a3b8" : "#6366f1", color: "#fff", fontWeight: 700, cursor: pending ? "not-allowed" : "pointer", fontSize: "0.95rem" }}>
      {pending ? "⏳ Enviando..." : "Enviar comentario"}
    </button>
  );
}

export default function UseFormStatus() {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";

  return (
    <Header title="useFormStatus" emoji="📡" category="Form/Action" categoryColor="#ec4899">
      <div style={{ color: text, fontFamily: "'IBM Plex Mono', monospace" }}>
        <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
          <code style={{ color: "#ec4899" }}>useFormStatus</code> se usa en un componente <strong>hijo</strong> del form para leer si está pendiente. No puede usarse en el mismo componente del form.
        </p>
        <form action={async () => { await new Promise(r => setTimeout(r, 2000)); }}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", color: "#e2e8f0", fontWeight: 600, marginBottom: 4, fontFamily: "sans-serif" }}>Comentario:</label>
            <textarea name="comentario" rows={3} placeholder="Escribe algo..." style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #475569", background: "#1e293b", color: "#f1f5f9", resize: "vertical", fontFamily: "sans-serif", boxSizing: "border-box" }} />
          </div>
          <SubmitBtn />
        </form>
        <p style={{ fontSize: "0.78rem", color: sub, marginTop: "1rem", fontFamily: "sans-serif" }}>💡 <code>SubmitBtn</code> es un componente separado que usa <code>useFormStatus()</code> internamente.</p>
      </div>
    </Header>
  );
}