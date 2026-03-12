import { useActionState, useSyncExternalStore } from "react";
import Header from "../utils/Header";
import { themeStore } from "../utils/stores";

export default function UseActionState() {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";

  const [actionState, formAction, isPending] = useActionState(async (prev, data) => {
    const nombre = data.get("nombre");
    await new Promise(r => setTimeout(r, 1500));
    if (!nombre || nombre.trim().length < 3) return { error: "Mínimo 3 caracteres.", success: false };
    return { error: null, success: true, nombre };
  }, { error: null, success: false });

  return (
    <Header title="useActionState" emoji="📋" category="Form/Action" categoryColor="#ef4444">
      <div style={{ color: text, fontFamily: "'IBM Plex Mono', monospace" }}>
        <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
          Gestiona el estado de una acción de formulario: resultado anterior, estado pendiente y action handler.
        </p>
        {actionState.success ? (
          <div style={{ background: "#052e16", padding: "1.2rem", borderRadius: 10, border: "1px solid #16a34a", color: "#4ade80", fontFamily: "sans-serif" }}>
            ✅ ¡Hola <strong>{actionState.nombre}</strong>! Formulario enviado con éxito.
          </div>
        ) : (
          <form action={formAction}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#e2e8f0", fontWeight: 600, marginBottom: 4, fontFamily: "sans-serif" }}>Nombre:</label>
              <input name="nombre" type="text" placeholder="Mínimo 3 caracteres..." style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #475569", width: "100%", background: "#1e293b", color: "#f1f5f9", boxSizing: "border-box", fontFamily: "sans-serif" }} />
            </div>
            {actionState.error && <p style={{ color: "#f87171", marginBottom: "0.75rem", fontFamily: "sans-serif" }}>⚠️ {actionState.error}</p>}
            <button type="submit" disabled={isPending} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: isPending ? "#475569" : "#ef4444", color: "#fff", fontWeight: 700, cursor: isPending ? "not-allowed" : "pointer", fontFamily: "sans-serif" }}>
              {isPending ? "⏳ Validando..." : "Enviar"}
            </button>
          </form>
        )}
      </div>
    </Header>
  );
}