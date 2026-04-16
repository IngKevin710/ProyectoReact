import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import app from "../firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const auth = getAuth(app);

export default function Register() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmar: "",
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [touched, setTouched] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ── Fortaleza de contraseña ──────────────────────────────────
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: "Muy débil", color: "#ef4444" };
    if (score === 2) return { score: 2, label: "Débil", color: "#f97316" };
    if (score === 3) return { score: 3, label: "Media", color: "#f59e0b" };
    if (score === 4) return { score: 4, label: "Fuerte", color: "#22c55e" };
    return { score: 5, label: "Muy fuerte", color: "#16a34a" };
  };

  const strength = getPasswordStrength(form.password);

  // ── Validación ───────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!form.apellido.trim()) newErrors.apellido = "El apellido es obligatorio.";
    if (!form.email.trim()) newErrors.email = "El correo es obligatorio.";
    else if (!emailRegex.test(form.email)) newErrors.email = "El formato del correo no es válido.";
    if (!form.password.trim()) newErrors.password = "La contraseña es obligatoria.";
    else if (form.password.length < 6) newErrors.password = "Debe tener mínimo 6 caracteres.";
    if (!form.confirmar.trim()) newErrors.confirmar = "Confirma tu contraseña.";
    else if (form.password !== form.confirmar) newErrors.confirmar = "Las contraseñas no coinciden.";
    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ nombre: true, apellido: true, email: true, password: true, confirmar: true });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = userCredential.user;

      const db = getFirestore(app);

      await setDoc(doc(db, "users", user.uid), {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        createdAt: new Date()
      });

      setShowModal(true);

    } catch (error) {
      console.log(error);

      let errorMsg = "Error al registrar";

      if (error.code === "auth/email-already-in-use") {
        errorMsg = "El correo ya está registrado";
      } else if (error.code === "auth/invalid-email") {
        errorMsg = "Correo inválido";
      } else if (error.code === "auth/weak-password") {
        errorMsg = "La contraseña es muy débil";
      }

      setErrors({ email: errorMsg });
    }
  };

  // ── Helpers de estilo ────────────────────────────────────────
  const isValid = (field) => touched[field] && !errors[field] && form[field];

  const labelStyle = {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: "#64748b",
    marginBottom: 6,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  };

  const getInputStyle = (field, withIcon = true, withToggle = false) => ({
    width: "100%",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: withIcon ? 36 : 12,
    paddingRight: withToggle ? 40 : isValid(field) ? 32 : 12,
    borderRadius: 8,
    border: errors[field]
      ? "0.5px solid #ef4444"
      : isValid(field)
      ? "0.5px solid #22c55e"
      : "0.5px solid #e2e8f0",
    fontSize: 14,
    background: errors[field] ? "#fef2f2" : isValid(field) ? "#f0fdf4" : "#f8fafc",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s, background 0.2s",
  });

  const iconStyle = {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 14,
    pointerEvents: "none",
  };

  const checkStyle = {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 13,
    pointerEvents: "none",
    color: "#22c55e",
  };

  const toggleBtnStyle = {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    color: "#94a3b8",
    padding: 2,
  };

  const errorStyle = { fontSize: 12, color: "#ef4444", marginTop: 5 };

  const steps = ["Datos", "Acceso", "Listo"];
  const currentStep = 0;

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
        {/* ── Panel izquierdo ── */}
        <div
          style={{
            flex: 1,
            background: "#1a1035",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "3rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", top: -80, right: -80, background: "rgba(99,102,241,0.12)" }} />
          <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", bottom: -40, left: -40, background: "rgba(139,92,246,0.1)" }} />

          <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%" }}>
            <div
              style={{
                width: 64, height: 64, borderRadius: 18,
                background: "rgba(99,102,241,0.25)",
                border: "1.5px solid rgba(99,102,241,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1.5rem", fontSize: 28,
              }}
            >
              👤
            </div>

            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
              React App
            </h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.6, maxWidth: 220, margin: "0 auto 2rem" }}>
              Crea tu cuenta y accede a todos los recursos de la plataforma
            </p>

            {/* Stepper */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
              {steps.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div
                      style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: i === currentStep ? "#6366f1" : i < currentStep ? "#22c55e" : "transparent",
                        border: i > currentStep ? "1.5px solid rgba(255,255,255,0.2)" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <span style={{ color: i > currentStep ? "rgba(255,255,255,0.35)" : "#fff", fontSize: 12, fontWeight: 600 }}>
                        {i < currentStep ? "✓" : i + 1}
                      </span>
                    </div>
                    <span style={{ color: i === currentStep ? "#fff" : "rgba(255,255,255,0.3)", fontSize: 10 }}>{step}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.15)", marginBottom: 16 }} />
                  )}
                </div>
              ))}
            </div>

            {/* Features */}
            <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
              {[
                "Registro seguro con validaciones",
                "Contraseña encriptada y protegida",
                "Acceso inmediato tras registrarte",
                "Soporte y actualizaciones incluidas",
              ].map((feature, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1", flexShrink: 0 }} />
                  <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Panel derecho ── */}
        <div
          style={{
            flex: 1, background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "2.5rem",
          }}
        >
          <div style={{ width: "100%", maxWidth: 360 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>
              Crear cuenta
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: "2rem" }}>
              Completa los datos para registrarte
            </p>

            <form onSubmit={handleSubmit} noValidate>

              {/* Nombre + Apellido en 2 columnas */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1.25rem" }}>
                <div>
                  <label style={labelStyle}>Nombre</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text" name="nombre" value={form.nombre}
                      onChange={handleChange} onBlur={handleBlur}
                      placeholder="Tu nombre"
                      style={getInputStyle("nombre", false)}
                    />
                    {isValid("nombre") && <span style={checkStyle}>✓</span>}
                  </div>
                  {errors.nombre && <p style={errorStyle}>{errors.nombre}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Apellido</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text" name="apellido" value={form.apellido}
                      onChange={handleChange} onBlur={handleBlur}
                      placeholder="Tu apellido"
                      style={getInputStyle("apellido", false)}
                    />
                    {isValid("apellido") && <span style={checkStyle}>✓</span>}
                  </div>
                  {errors.apellido && <p style={errorStyle}>{errors.apellido}</p>}
                </div>
              </div>

              {/* Correo */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>Correo electrónico</label>
                <div style={{ position: "relative" }}>
                  <span style={iconStyle}>✉️</span>
                  <input
                    type="email" name="email" value={form.email}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="correo@ejemplo.com"
                    style={getInputStyle("email", true)}
                  />
                  {isValid("email") && <span style={checkStyle}>✓</span>}
                </div>
                {errors.email && <p style={errorStyle}>{errors.email}</p>}
              </div>

              {/* Contraseña */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>Contraseña</label>
                <div style={{ position: "relative" }}>
                  <span style={iconStyle}>🔑</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password" value={form.password}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="Mínimo 6 caracteres"
                    style={getInputStyle("password", true, true)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={toggleBtnStyle}>
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* Barra de fortaleza */}
                {form.password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1, height: 4, borderRadius: 2,
                            background: i <= strength.score ? strength.color : "#e2e8f0",
                            transition: "background 0.3s",
                          }}
                        />
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: strength.color, margin: 0, fontWeight: 500 }}>
                      Fortaleza: {strength.label}
                    </p>
                  </div>
                )}

                {errors.password && <p style={errorStyle}>{errors.password}</p>}
              </div>

              {/* Confirmar contraseña */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Confirmar contraseña</label>
                <div style={{ position: "relative" }}>
                  <span style={iconStyle}>🔒</span>
                  <input
                    type={showConfirmar ? "text" : "password"}
                    name="confirmar" value={form.confirmar}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="Repite tu contraseña"
                    style={getInputStyle("confirmar", true, true)}
                  />
                  <button type="button" onClick={() => setShowConfirmar(!showConfirmar)} style={toggleBtnStyle}>
                    {showConfirmar ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.confirmar && <p style={errorStyle}>{errors.confirmar}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                style={{
                  width: "100%", padding: 11, borderRadius: 8,
                  border: "none", background: "#6366f1",
                  color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
              >
                Registrarse →
              </button>

              {/* Separador */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "1.25rem 0" }}>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                <span style={{ fontSize: 12, color: "#94a3b8" }}>¿ya tienes cuenta?</span>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
              </div>

              <button
                type="button"
                onClick={() => navigate("/")}
                style={{
                    width: "100%",
                    padding: "11px",
                    borderRadius: 8,
                    border: "0.5px solid #e2e8f0",
                    background: "#ffffff",
                    color: "#0f172a",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.border = "0.5px solid #cbd5f5";
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = "#ffffff";
                    e.currentTarget.style.border = "0.5px solid #e2e8f0";
                }}
                >
                Iniciar sesión
                </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff", borderRadius: 16, padding: "1.75rem",
              width: "90%", maxWidth: 300, border: "0.5px solid #e2e8f0",
            }}
          >
            <div
              style={{
                width: 44, height: 44, borderRadius: "50%", background: "#f0fdf4",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1rem", fontSize: 20,
              }}
            >
              ✅
            </div>
            <h3 style={{ textAlign: "center", fontSize: 16, fontWeight: 600, marginBottom: 6, color: "#0f172a" }}>
              Cuenta creada
            </h3>
            <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginBottom: "1.25rem" }}>
              Así se enviarían al servidor:
            </p>

            {[
              { label: "Nombre", value: `${form.nombre} ${form.apellido}` },
              { label: "Correo", value: form.email },
              { label: "Contraseña", value: "●".repeat(form.password.length) },
            ].map((row, i, arr) => (
              <div
                key={i}
                style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "8px 0", fontSize: 13,
                  borderBottom: i < arr.length - 1 ? "0.5px solid #f1f5f9" : "none",
                }}
              >
                <span style={{ color: "#64748b" }}>{row.label}</span>
                <span style={{ color: "#0f172a", fontWeight: 600, maxWidth: 160, textAlign: "right", wordBreak: "break-all" }}>{row.value}</span>
              </div>
            ))}

            <button
              onClick={() => setShowModal(false)}
              style={{
                width: "100%", marginTop: "1.25rem", padding: 9, borderRadius: 8,
                border: "none", background: "#6366f1", color: "#fff",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
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