import { useState } from "react";
import { useNavigate } from "react-router-dom";
import app from "../firebase";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider } from "firebase/auth";

const auth = getAuth(app);

// Componente principal de la página de login
// Acá manejo todo el formulario, las validaciones y el modal de confirmación
export default function LoginPage() {
  const navigate = useNavigate();

  const socialBtn = {
    width: 55,
    height: 55,
    borderRadius: "50%",
    border: "1px solid #e2e8f0",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    transition: "all 0.2s ease",
  };
  // Guardo los dos campos del formulario en un solo estado
  // así es más limpio que tener un useState por cada campo
  const [form, setForm] = useState({ email: "", password: "" });

  // Acá voy guardando los errores según el campo que falle
  // si errors.email tiene algo, significa que ese campo está mal
  const [errors, setErrors] = useState({});

  // Controlo si el modal está abierto o cerrado
  const [showModal, setShowModal] = useState(false);

  // Para el ojito que muestra y oculta la contraseña
  const [showPassword, setShowPassword] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Función que revisa si los campos están bien llenados
  // retorna un objeto con los errores que encuentre
  // si el objeto viene vacío, significa que todo está correcto
  const validate = () => {
    const newErrors = {};

    // Verifico que el correo no esté vacío y que tenga formato válido
    if (!form.email.trim()) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "El formato del correo no es válido.";
    }

    // Verifico que la contraseña no esté vacía y que tenga mínimo 6 caracteres
    if (!form.password.trim()) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (form.password.length < 6) {
      newErrors.password = "Debe tener mínimo 6 caracteres.";
    }

    return newErrors;
  };

  // Cada vez que el usuario escribe en un campo,
  // actualizo el valor en el estado y limpio el error de ese campo
  // para que no le siga molestando mientras está escribiendo
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Cuando el usuario hace clic en "Iniciar sesión"
  // primero valido, si hay errores los muestro y me detengo
  // si todo está bien, abro el modal con los datos ingresados

  // 🔐 Login normal con email/password
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      setErrors({ email: "Credenciales incorrectas" });
    }
  };

  // 🔵 Google
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  // 🐱 GitHub
  const handleGithubLogin = async () => {
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  // 🔵 Facebook
  const handleFacebookLogin = async () => {
    try {
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    // Contenedor principal que ocupa toda la pantalla
    // con fondo gris claro y centrado en el medio
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
      {/* Card principal dividida en dos columnas:
          izquierda decorativa y derecha con el formulario */}
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

        {/* ── PANEL IZQUIERDO ──
            Es puramente decorativo, muestra el nombre de la app
            y una lista de características */}
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
          {/* Círculo decorativo arriba a la derecha
              le da profundidad al fondo oscuro */}
          <div
            style={{
              position: "absolute",
              width: 320,
              height: 320,
              borderRadius: "50%",
              top: -80,
              right: -80,
              background: "rgba(99,102,241,0.12)",
            }}
          />

          {/* Círculo decorativo abajo a la izquierda */}
          <div
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: "50%",
              bottom: -40,
              left: -40,
              background: "rgba(139,92,246,0.1)",
            }}
          />

          {/* Contenido del panel izquierdo
              el zIndex lo pongo para que quede por encima de los círculos */}
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>

            {/* Ícono de la aplicación */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: "rgba(99,102,241,0.25)",
                border: "1.5px solid rgba(99,102,241,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                fontSize: 28,
              }}
            >
              ⚛️
            </div>

            {/* Nombre de la app */}
            <h1
              style={{ color: "#fff", fontSize: 22, fontWeight: 600, marginBottom: 8 }}
            >
              React App
            </h1>

            {/* Descripción corta */}
            <p
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 13,
                lineHeight: 1.6,
                maxWidth: 220,
                margin: "0 auto",
              }}
            >
              Una plataforma moderna construida con React y arquitectura SPA
            </p>

            {/* Lista de características de la app
                uso un array y .map() para no repetir el mismo HTML 4 veces */}
            <div
              style={{
                marginTop: "2.5rem",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                textAlign: "left",
              }}
            >
              {[
                "Navegación con React Router",
                "Formularios controlados con useState",
                "Validaciones en tiempo real",
                "Diseño responsivo y accesible",
              ].map((feature, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Punto morado decorativo antes de cada feature */}
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#6366f1",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PANEL DERECHO ──
            Acá vive el formulario de inicio de sesión */}
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

            {/* Título y subtítulo del formulario */}
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#0f172a",
                marginBottom: 6,
              }}
            >
              Iniciar sesión
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: "2rem" }}>
              Ingresa tus datos para acceder a tu cuenta
            </p>

            <form onSubmit={handleSubmit} noValidate>

              {/* ── Campo de correo electrónico ── */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#64748b",
                    marginBottom: 6,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Correo electrónico
                </label>

                {/* Contenedor relativo para poder poner el ícono dentro del input */}
                <div style={{ position: "relative" }}>
                  {/* Ícono del sobre dentro del input */}
                  <span
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 14,
                      pointerEvents: "none", // que no bloquee los clics al input
                    }}
                  >
                    ✉️
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 36px", // el padding izquierdo le da espacio al ícono
                      borderRadius: 8,
                      // Si hay error el borde se pone rojo, si no va gris suave
                      border: errors.email
                        ? "0.5px solid #ef4444"
                        : "0.5px solid #e2e8f0",
                      fontSize: 14,
                      // El fondo también cambia a rosado cuando hay error
                      background: errors.email ? "#fef2f2" : "#f8fafc",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Mensaje de error del correo, solo aparece si hay error */}
                {errors.email && (
                  <p style={{ fontSize: 12, color: "#ef4444", marginTop: 5 }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* ── Campo de contraseña ── */}
              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#64748b",
                    marginBottom: 6,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Contraseña
                </label>

                <div style={{ position: "relative" }}>
                  {/* Ícono de la llave dentro del input */}
                  <span
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 14,
                      pointerEvents: "none",
                    }}
                  >
                    🔑
                  </span>
                  <input
                    // Cambio el type entre password y text según el estado del ojito
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    style={{
                      width: "100%",
                      padding: "10px 40px 10px 36px", // padding derecho para el ojito
                      borderRadius: 8,
                      border: errors.password
                        ? "0.5px solid #ef4444"
                        : "0.5px solid #e2e8f0",
                      fontSize: 14,
                      background: errors.password ? "#fef2f2" : "#f8fafc",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />

                  {/* Botón ojito para mostrar u ocultar la contraseña */}
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
                      fontSize: 14,
                      color: "#94a3b8",
                      padding: 2,
                    }}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* Mensaje de error de la contraseña */}
                {errors.password && (
                  <p style={{ fontSize: 12, color: "#ef4444", marginTop: 5 }}>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Link para ir a recuperar contraseña */}
              <div style={{ textAlign: "right", marginBottom: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => navigate("/forgot")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6366f1",
                    cursor: "pointer",
                    fontSize: 12
                  }}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Botón principal de submit */}
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: 11,
                  borderRadius: 8,
                  border: "none",
                  background: "#6366f1",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Iniciar sesión →
              </button>

              {/* Separador */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: "1.5rem 0",
              }}>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  o continúa con
                </span>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
              </div>

              {/* BOTONES SOCIALES */}
              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: 16,
              }}>

                {/* GOOGLE */}
                <button type="button" onClick={handleGoogleLogin} style={socialBtn}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="28" height="28">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.7 29.4 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.4 0 19-7.6 19-20 0-1.3-.1-2.5-.4-3.5z" />
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z" />
                    <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.6-5.3l-6.3-5.2C29.3 35.5 26.8 36 24 36c-5.4 0-9.9-3.3-11.7-8l-6.5 5C9.2 39.5 16 44 24 44z" />
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.5 5.3-6.5 6.5l6.3 5.2C38.5 36.1 44 29.9 44 20c0-1.3-.1-2.5-.4-3.5z" />
                  </svg>
                </button>

                {/* GITHUB */}
                <button type="button" onClick={handleGithubLogin} style={socialBtn}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="#000">
                    <path d="M12 .5C5.7.5.9 5.3.9 11.6c0 5 3.2 9.2 7.7 10.7.6.1.8-.3.8-.6v-2.2c-3.1.7-3.7-1.5-3.7-1.5-.5-1.2-1.1-1.6-1.1-1.6-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.5 2.4 1.1 3 .9.1-.6.4-1.1.7-1.4-2.5-.3-5.2-1.3-5.2-5.7 0-1.2.4-2.2 1-3-.1-.3-.4-1.4.1-2.9 0 0 .8-.3 2.9 1.1.8-.2 1.7-.3 2.6-.3s1.8.1 2.6.3c2.1-1.4 2.9-1.1 2.9-1.1.5 1.5.2 2.6.1 2.9.6.8 1 1.8 1 3 0 4.4-2.7 5.3-5.3 5.6.4.4.8 1 .8 2v3c0 .3.2.7.8.6 4.5-1.5 7.7-5.7 7.7-10.7C23.1 5.3 18.3.5 12 .5z" />
                  </svg>
                </button>

                {/* FACEBOOK */}
                <button type="button" onClick={handleFacebookLogin} style={socialBtn}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="#1877f2">
                    <path d="M22 12a10 10 0 1 0-11.5 9.87v-6.99H7.9V12h2.6V9.8c0-2.56 1.52-3.98 3.85-3.98 1.11 0 2.27.2 2.27.2v2.5h-1.28c-1.26 0-1.65.78-1.65 1.58V12h2.8l-.45 2.88h-2.35v6.99A10 10 0 0 0 22 12z" />
                  </svg>
                </button>

              </div>

              {/* Separador visual entre los dos botones */}
              
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  margin: "1.25rem 0",
                }}
              >
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  ¿no tienes cuenta?
                </span>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
              </div>

              {/* Botón secundario para ir a la página de registro */}
              <button
                type="button"
                onClick={() => navigate("/registrousuario")}
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  border: "0.5px solid #e2e8f0",
                  background: "transparent",
                  color: "#64748b",
                  fontSize: 14,
                  cursor: "pointer",
                }}>
                Crear cuenta nueva
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── MODAL DE CONFIRMACIÓN ──
          Solo aparece cuando el formulario se envía correctamente
          muestra los datos que se enviarían al servidor */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)", // fondo oscuro semitransparente
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "1.75rem",
              width: "90%",
              maxWidth: 300,
              border: "0.5px solid #e2e8f0",
            }}
          >
            {/* Ícono de éxito */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#f0fdf4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                fontSize: 20,
              }}
            >
              ✅
            </div>

            <h3
              style={{
                textAlign: "center",
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 6,
                color: "#0f172a",
              }}
            >
              Datos recibidos
            </h3>
            <p
              style={{
                textAlign: "center",
                fontSize: 13,
                color: "#64748b",
                marginBottom: "1.25rem",
              }}
            >
              Así se enviarían al servidor:
            </p>

            {/* Fila del correo */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "0.5px solid #f1f5f9",
                fontSize: 13,
              }}
            >
              <span style={{ color: "#64748b" }}>Correo</span>
              <span style={{ color: "#0f172a", fontWeight: 600 }}>{form.email}</span>
            </div>

            {/* Fila de la contraseña
                muestro puntos en vez de la contraseña real por seguridad */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                fontSize: 13,
              }}
            >
              <span style={{ color: "#64748b" }}>Contraseña</span>
              <span style={{ color: "#0f172a", fontWeight: 600 }}>
                {"●".repeat(form.password.length)}
              </span>
            </div>

            {/* Botón para cerrar el modal */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                width: "100%",
                marginTop: "1.25rem",
                padding: 9,
                borderRadius: 8,
                border: "none",
                background: "#6366f1",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
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