import { useActionState } from "react";
import { useNavigate } from "react-router-dom";

async function enviarFormulario(prevState, formData) {
  const nombre = formData.get("nombre");
  await new Promise(r => setTimeout(r, 1500));
  if (!nombre || nombre.trim().length < 3) {
    return { error: "El nombre debe tener al menos 3 caracteres.", success: false };
  }
  return { error: null, success: true, nombre };
}

export default function UseActionState() {
  const navigate = useNavigate();
  const [state, formAction, isPending] = useActionState(enviarFormulario, { error: null, success: false });

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", fontFamily: "sans-serif", padding: "2rem" }}>
      <button onClick={() => navigate("/")}>← Volver al Home</button>
      <h1>useActionState</h1>
      <p>Gestiona el estado de una acción de formulario: el resultado anterior, si está pendiente, y el action para el form.</p>
      <hr />
      <h3>Ejemplo: Formulario con validación asíncrona</h3>

      {state.success ? (
        <div style={{ background: "#dcfce7", padding: "1rem", borderRadius: 8, color: "#166534" }}>
          ✅ ¡Hola, <strong>{state.nombre}</strong>! Formulario enviado correctamente.
        </div>
      ) : (
        <form action={formAction}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>Nombre:</label>
          <input
            name="nombre"
            type="text"
            placeholder="Escribe tu nombre..."
            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", width: "100%", marginBottom: "0.75rem" }}
          />
          {state.error && (
            <p style={{ color: "#dc2626", marginBottom: "0.5rem" }}>⚠️ {state.error}</p>
          )}
          <button
            type="submit"
            disabled={isPending}
            style={{
              padding: "8px 20px", borderRadius: 6, border: "none",
              background: isPending ? "#94a3b8" : "#0f172a",
              color: "#fff", cursor: isPending ? "not-allowed" : "pointer", fontWeight: 600
            }}
          >
            {isPending ? "Enviando..." : "Enviar"}
          </button>
        </form>
      )}
    </div>
  );
}