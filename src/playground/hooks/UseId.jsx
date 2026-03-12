import { useId } from "react";
import { useNavigate } from "react-router-dom";

function FormField({ label, type = "text" }) {
  const id = useId();
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label htmlFor={id} style={{ display: "block", fontWeight: 600, marginBottom: "4px" }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", width: "100%" }}
      />
    </div>
  );
}

export default function UseId() {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", fontFamily: "sans-serif", padding: "2rem" }}>
      <button onClick={() => navigate("/")}>← Volver al Home</button>
      <h1>useId</h1>
      <p>Genera IDs únicos y estables para asociar labels con inputs de forma accesible, sin colisiones entre componentes.</p>
      <hr />
      <h3>Ejemplo: Formulario de registro</h3>
      <FormField label="Nombre" />
      <FormField label="Correo electrónico" type="email" />
      <FormField label="Contraseña" type="password" />
      <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
        Cada campo tiene un ID único generado por <code>useId()</code>, aunque el componente se reutilice varias veces.
      </p>
    </div>
  );
}