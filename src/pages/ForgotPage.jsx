import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function ForgotPage() {

  const [form, setForm] = useState({ email: "" });

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "El formato del correo no es válido.";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setShowModal(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f1f5f9",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          maxWidth: 860,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >

        {/* PANEL IZQUIERDO */}
        <div
          style={{
            flex: 1,
            background: "#1a1035",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "3rem",
            color: "#fff",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1>Recuperar acceso</h1>
            <p style={{ fontSize: 13, opacity: 0.6 }}>
              Ingresa tu correo para recibir instrucciones de recuperación
            </p>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2.5rem",
          }}
        >
          <div style={{ width: "100%", maxWidth: 360 }}>

            <h2 style={{ marginBottom: 6 }}>Recuperar contraseña</h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: "2rem" }}>
              Te enviaremos un enlace para restablecer tu contraseña
            </p>

            <form onSubmit={handleSubmit} noValidate>

              {/* EMAIL */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ fontSize: 12 }}>Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 8,
                    border: errors.email
                      ? "1px solid red"
                      : "1px solid #e2e8f0",
                    background: "#f8fafc",
                    color: "#1a1035",
                  }}
                />

                {errors.email && (
                  <p style={{ color: "red", fontSize: 12 }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* BOTÓN */}
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  background: "#6366f1",
                  color: "white",
                  border: "none",
                }}
              >
                Enviar enlace →
              </button>

                {/* VOLVER AL LOGIN */}
                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                    <Link to="/" style={{ fontSize: 12, color: "#6366f1", textDecoration: "none" }}>
                        Volver al inicio de sesión
                    </Link>
                </div>


            </form>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: 10,
              textAlign: "center",
              color: "#1a1035", 
            }}
          >
            <h3>Correo enviado</h3>
            <p style={{ fontSize: 13 }}>
              Se enviaron instrucciones a:
            </p>
            <strong>{form.email}</strong>

            <button
              onClick={() => navigate("/reset")}
              style={{
                marginTop: "1rem",
                marginLeft: "0.5rem",
                padding: "8px 16px",
                background: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: 6,
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
