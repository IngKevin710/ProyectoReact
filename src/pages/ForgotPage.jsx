import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import app from "../firebase";

const auth = getAuth(app);
const db   = getFirestore(app);

const FIREBASE_ERRORS = {
  "auth/invalid-email":          "El formato del correo no es válido.",
  "auth/network-request-failed": "Error de red. Verifica tu conexión e intenta de nuevo.",
  "auth/too-many-requests":      "Demasiados intentos. Espera unos minutos e intenta de nuevo.",
};

// Firebase Auth devuelve IDs como "google.com", "github.com", "facebook.com"
const AUTH_PROVIDER_MAP = {
  "google.com":   "google",
  "github.com":   "github",
  "facebook.com": "facebook",
};

const PROVIDER_META = {
  google:   { label: "Google",   color: "#4285f4", bg: "#dbeafe",
    icon: <svg width="22" height="22" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.7 29.4 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.4 0 19-7.6 19-20 0-1.3-.1-2.5-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"/><path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.6-5.3l-6.3-5.2C29.3 35.5 26.8 36 24 36c-5.4 0-9.9-3.3-11.7-8l-6.5 5C9.2 39.5 16 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.5 5.3-6.5 6.5l6.3 5.2C38.5 36.1 44 29.9 44 20c0-1.3-.1-2.5-.4-3.5z"/></svg> },
  github:   { label: "GitHub",   color: "#0f172a", bg: "#f1f5f9",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="#0f172a"><path d="M12 .5C5.7.5.9 5.3.9 11.6c0 5 3.2 9.2 7.7 10.7.6.1.8-.3.8-.6v-2.2c-3.1.7-3.7-1.5-3.7-1.5-.5-1.2-1.1-1.6-1.1-1.6-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.5 2.4 1.1 3 .9.1-.6.4-1.1.7-1.4-2.5-.3-5.2-1.3-5.2-5.7 0-1.2.4-2.2 1-3-.1-.3-.4-1.4.1-2.9 0 0 .8-.3 2.9 1.1.8-.2 1.7-.3 2.6-.3s1.8.1 2.6.3c2.1-1.4 2.9-1.1 2.9-1.1.5 1.5.2 2.6.1 2.9.6.8 1 1.8 1 3 0 4.4-2.7 5.3-5.3 5.6.4.4.8 1 .8 2v3c0 .3.2.7.8.6 4.5-1.5 7.7-5.7 7.7-10.7C23.1 5.3 18.3.5 12 .5z"/></svg> },
  facebook: { label: "Facebook", color: "#1877f2", bg: "#eff6ff",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877f2"><path d="M22 12a10 10 0 1 0-11.5 9.87v-6.99H7.9V12h2.6V9.8c0-2.56 1.52-3.98 3.85-3.98 1.11 0 2.27.2 2.27.2v2.5h-1.28c-1.26 0-1.65.78-1.65 1.58V12h2.8l-.45 2.88h-2.35v6.99A10 10 0 0 0 22 12z"/></svg> },
};

const COOLDOWN_SECONDS = 60;

// Tras restablecer la contraseña, el botón "Continuar" de la página de
// Firebase regresa al login de la app (funciona en localhost y producción)
const actionCodeSettings = () => ({ url: `${window.location.origin}/login` });

export default function ForgotPage() {
  const [email, setEmail]           = useState("");
  const [emailError, setEmailError] = useState("");
  const [sent, setSent]             = useState(false);
  const [loading, setLoading]       = useState(false);
  const [cooldown, setCooldown]     = useState(0);
  const [socialBlock, setSocialBlock] = useState(null); // { label, color, bg, icon }
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const validate = () => {
    if (!email.trim()) return "El correo es obligatorio.";
    if (!emailRegex.test(email)) return "El formato del correo no es válido.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setEmailError(err); return; }

    setLoading(true);
    setEmailError("");
    setSocialBlock(null);

    // VALIDACIÓN 1: Firestore — datos registrados en nuestra base de datos
    try {
      const snap = await getDocs(
        query(collection(db, "users"), where("email", "==", email.trim().toLowerCase()))
      );
      if (!snap.empty) {
        const provider = snap.docs[0].data().provider;
        if (provider && provider !== "email") {
          setSocialBlock(PROVIDER_META[provider] ?? { label: provider, color: "#6366f1", bg: "#ede9fe", icon: "🔗" });
          setLoading(false);
          return;
        }
      }
    } catch {
      // Error de Firestore — continuar con la segunda validación
    }

    // VALIDACIÓN 2: Firebase Auth — información en tiempo real del proveedor vinculado
    // Complementa la validación anterior: detecta cambios de proveedor no reflejados en Firestore
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email.trim());
      if (methods.length > 0 && !methods.includes("password")) {
        // Identificar qué proveedor social está vinculado
        const providerKey = methods
          .map((m) => AUTH_PROVIDER_MAP[m])
          .find((k) => k && PROVIDER_META[k]);
        setSocialBlock(
          PROVIDER_META[providerKey] ?? { label: "red social", color: "#6366f1", bg: "#ede9fe", icon: "🔗" }
        );
        setLoading(false);
        return;
      }
    } catch {
      // fetchSignInMethodsForEmail puede estar deshabilitado en Firebase Console
      // (Email Enumeration Protection activo) — se continúa con el flujo normal
    }

    try {
      await sendPasswordResetEmail(auth, email.trim(), actionCodeSettings());
      setSent(true);
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setSent(true);
        setCooldown(COOLDOWN_SECONDS);
      } else {
        setEmailError(FIREBASE_ERRORS[err.code] ?? "Ocurrió un error. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim(), actionCodeSettings());
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      setEmailError(FIREBASE_ERRORS[err.code] ?? "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif", padding: "1rem" }}>
      <div style={{ display: "flex", width: "100%", maxWidth: 860, borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>

        {/* PANEL IZQUIERDO */}
        <div style={{ flex: 1, background: "#1a1035", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "3rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", top: -80, right: -80, background: "rgba(99,102,241,0.12)" }} />
          <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", bottom: -40, left: -40, background: "rgba(139,92,246,0.1)" }} />
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(99,102,241,0.25)", border: "1.5px solid rgba(99,102,241,0.5)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: 28 }}>🔒</div>
            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Recuperar acceso</h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.6, maxWidth: 220, margin: "0 auto" }}>
              Ingresa tu correo para recibir un enlace de restablecimiento
            </p>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div style={{ flex: 1, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "2.5rem" }}>
          <div style={{ width: "100%", maxWidth: 360 }}>

            {/* ── VISTA: CUENTA SOCIAL — no permite cambiar contraseña ── */}
            {socialBlock && (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: socialBlock.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                  {socialBlock.icon}
                </div>
                <h2 style={{ fontSize: 19, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
                  Cuenta vinculada a {socialBlock.label}
                </h2>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 20 }}>
                  Esta cuenta inicia sesión a través de <strong style={{ color: socialBlock.color }}>{socialBlock.label}</strong>.
                  La contraseña es administrada directamente por {socialBlock.label}, por lo que no es posible restablecerla desde aquí.
                </p>
                <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", marginBottom: 24, textAlign: "left" }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
                    💡 <strong>¿Olvidaste el acceso?</strong> Dirígete a{" "}
                    <strong style={{ color: socialBlock.color }}>{socialBlock.label}</strong> y usa la opción
                    de recuperación de cuenta de esa plataforma.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/login")}
                  style={{ width: "100%", padding: 11, borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  Volver al inicio de sesión
                </button>
                <button
                  onClick={() => { setSocialBlock(null); setEmail(""); }}
                  style={{ width: "100%", marginTop: 10, padding: 10, borderRadius: 8, border: "0.5px solid #e2e8f0", background: "transparent", color: "#64748b", fontSize: 13, cursor: "pointer" }}
                >
                  Intentar con otro correo
                </button>
              </div>
            )}

            {/* ── VISTA: FORMULARIO ── */}
            {!sent && !socialBlock && (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>Recuperar contraseña</h2>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: "2rem" }}>
                  Te enviaremos un enlace para restablecer tu contraseña
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 6, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                      Correo electrónico
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, pointerEvents: "none" }}>✉️</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                        placeholder="correo@ejemplo.com"
                        style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 8, border: emailError ? "0.5px solid #ef4444" : "0.5px solid #e2e8f0", fontSize: 14, background: emailError ? "#fef2f2" : "#f8fafc", color: "#0f172a", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                    {emailError && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 5 }}>{emailError}</p>}
                  </div>

                  <button type="submit" disabled={loading}
                    style={{ width: "100%", padding: 11, borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                    {loading ? "Verificando..." : "Enviar enlace →"}
                  </button>

                  <div style={{ marginTop: "1rem", textAlign: "center" }}>
                    <Link to="/login" style={{ fontSize: 12, color: "#6366f1", textDecoration: "none" }}>
                      Volver al inicio de sesión
                    </Link>
                  </div>
                </form>
              </>
            )}

            {/* ── VISTA: CONFIRMACIÓN ── */}
            {sent && !socialBlock && (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0fdf4", border: "1.5px solid #86efac", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontSize: 26 }}>📧</div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>Revisa tu correo</h2>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>
                  Si el correo está registrado, recibirás el enlace en:
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 16 }}>{email}</p>
                <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: "1.5rem" }}>
                  Revisa también la carpeta de spam.
                </p>

                {emailError && <p style={{ fontSize: 12, color: "#ef4444", marginBottom: "0.75rem" }}>{emailError}</p>}

                <button onClick={handleReenviar} disabled={cooldown > 0 || loading}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "0.5px solid #e2e8f0", background: "transparent", color: cooldown > 0 ? "#94a3b8" : "#6366f1", fontSize: 13, cursor: cooldown > 0 ? "not-allowed" : "pointer" }}>
                  {cooldown > 0 ? `Reenviar enlace en ${cooldown}s` : loading ? "Enviando..." : "Reenviar enlace"}
                </button>

                <button onClick={() => navigate("/login")}
                  style={{ width: "100%", marginTop: 10, padding: 11, borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Volver al login
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
