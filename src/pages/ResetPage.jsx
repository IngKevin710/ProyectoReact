import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ResetPage() {

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!form.password.trim()) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (form.password.length < 6) {
      newErrors.password = "Debe tener mínimo 6 caracteres.";
    }

    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = "Debes confirmar la contraseña.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
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
            <h1>Nueva contraseña</h1>
            <p style={{ fontSize: 13, opacity: 0.6 }}>
              Define una contraseña segura para tu cuenta
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

            <h2 style={{ marginBottom: 6 }}>Restablecer contraseña</h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: "2rem" }}>
              Ingresa tu nueva contraseña
            </p>

            <form onSubmit={handleSubmit} noValidate>

              {/* PASSWORD */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ fontSize: 12 }}>Nueva contraseña</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 8,
                      border: errors.password
                        ? "1px solid red"
                        : "1px solid #e2e8f0",
                        background: "#f8fafc",
                        color: "#1a1035",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && (
                  <p style={{ color: "red", fontSize: 12 }}>{errors.password}</p>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ fontSize: 12 }}>Confirmar contraseña</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repite la contraseña"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 8,
                      border: errors.confirmPassword
                        ? "1px solid red"
                        : "1px solid #e2e8f0",
                        background: "#f8fafc",
                        color: "#1a1035",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p style={{ color: "red", fontSize: 12 }}>
                    {errors.confirmPassword}
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
                Guardar contraseña →
              </button>

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
            color: "#1a1035",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: 10,
              textAlign: "center",
            }}
          >
            <h3>Contraseña actualizada</h3>
            <p style={{ fontSize: 13 }}>
              Tu contraseña fue restablecida correctamente.
            </p>

            <button
              onClick={() => navigate("/")}
              style={{
                marginTop: "1rem",
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
