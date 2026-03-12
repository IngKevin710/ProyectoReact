import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useNavigate } from "react-router-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        padding: "10px 24px", borderRadius: 8, border: "none",
        background: pending ? "#94a3b8" : "#6366f1",
        color: "#fff", cursor: pending ? "not-allowed" : "pointer",
        fontWeight: 700, fontSize: "1rem", transition: "background 0.3s"
      }}
    >
      {pending ? "⏳ Enviando..." : "Enviar comentario"}
    </button>
  );
}

export default function UseFormStatus() {
  const navigate = useNavigate();
  const [comentarios, setComentarios] = useState([]);
  const [error, setError] = useState("");

  async function enviarComentario(formData) {
    const texto = formData.get("comentario");
    await new Promise(r => setTimeout(r, 2000));

    if (!texto || texto.trim().length < 3) {
      setError("⚠️ El comentario debe tener al menos 3 caracteres.");
      return;
    }

    setError("");
    setComentarios(prev => [
      ...prev,
      { id: Date.now(), texto: texto.trim() }
    ]);
  }

  return (
    <div style={{ maxWidth: 540, margin: "2rem auto", fontFamily: "sans-serif", padding: "2rem" }}>
      <button
        onClick={() => navigate("/")}
        style={{ marginBottom: "1rem", padding: "6px 14px", borderRadius: 6, border: "1px solid #cbd5e1", cursor: "pointer", background: "#f8fafc" }}
      >
        ← Volver al Home
      </button>

      <h1 style={{ margin: "0 0 0.25rem" }}>useFormStatus</h1>
      <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
        Provee información sobre el estado del formulario padre desde un componente hijo. El botón sabe si el form está pendiente sin necesidad de estado externo.
      </p>
      <hr style={{ marginBottom: "1.5rem" }} />

      <form action={enviarComentario}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
          Comentario:
        </label>
        <textarea
          name="comentario"
          rows={4}
          placeholder="Escribe tu comentario... (mínimo 3 caracteres)"
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 8,
            border: "1px solid #cbd5e1", marginBottom: "0.75rem",
            resize: "vertical", fontSize: "0.95rem", boxSizing: "border-box"
          }}
        />
        {error && (
          <p style={{ color: "#dc2626", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
            {error}
          </p>
        )}
        <SubmitButton />
      </form>

      {/* Lista de comentarios enviados */}
      {comentarios.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ marginBottom: "0.75rem" }}>
            ✅ Comentarios enviados ({comentarios.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {comentarios.map(c => (
              <div
                key={c.id}
                style={{
                  background: "#f0fdf4", border: "1px solid #86efac",
                  borderRadius: 8, padding: "0.75rem 1rem",
                  color: "#166534", fontSize: "0.95rem"
                }}
              >
                💬 {c.texto}
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "1.5rem" }}>
        💡 <code>SubmitButton</code> es un componente separado que usa <code>useFormStatus()</code> internamente. Mientras el form procesa, el botón se deshabilita solo.
      </p>
    </div>
  );
}