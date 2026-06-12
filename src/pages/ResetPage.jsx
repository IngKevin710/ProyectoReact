import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import app from "../firebase";

const auth = getAuth(app);

const passwordRules = (pwd) => ({
  length:    pwd.length >= 10,
  uppercase: /[A-Z]/.test(pwd),
  lowercase: /[a-z]/.test(pwd),
  number:    /[0-9]/.test(pwd),
  special:   /[^A-Za-z0-9]/.test(pwd),
});

const FIREBASE_ERRORS = {
  "auth/expired-action-code":  "El enlace ha expirado. Solicita uno nuevo.",
  "auth/invalid-action-code":  "El enlace no es válido o ya fue utilizado.",
  "auth/weak-password":        "La contraseña es demasiado débil.",
  "auth/network-request-failed":"Error de red. Verifica tu conexión e intenta de nuevo.",
};

export default function ResetPage() {
  const [searchParams]   = useSearchParams();
  const oobCode          = searchParams.get("oobCode");
  const navigate         = useNavigate();

  const [codeStatus, setCodeStatus]           = useState("verifying"); // "verifying" | "valid" | "invalid"
  const [accountEmail, setAccountEmail]       = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors]                   = useState({});
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [loading, setLoading]                 = useState(false);

  useEffect(() => {
    if (!oobCode) { setCodeStatus("invalid"); return; }
    // verifyPasswordResetCode resuelve con el correo registrado asociado al código
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => { setAccountEmail(email); setCodeStatus("valid"); })
      .catch(() => setCodeStatus("invalid"));
  }, [oobCode]);

  const rules = passwordRules(password);

  const validate = () => {
    const newErrors = {};
    if (!rules.length || !rules.uppercase || !rules.lowercase || !rules.number || !rules.special) {
      newErrors.password = "La contraseña no cumple los requisitos.";
    }
    if (!confirmPassword) {
      newErrors.confirm = "Debes confirmar la contraseña.";
    } else if (password !== confirmPassword) {
      newErrors.confirm = "Las contraseñas no coinciden.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await confirmPasswordReset(auth, oobCode, password);
      navigate("/login?reset=success");
    } catch (err) {
      setErrors({ general: FIREBASE_ERRORS[err.code] ?? "No se pudo actualizar la contraseña. Intenta de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  // ── ESTADO: verificando código ──
  if (codeStatus === "verifying") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif" }}>
        <p style={{ color: "#64748b", fontSize: 14 }}>Verificando enlace...</p>
      </div>
    );
  }

  // ── ESTADO: código inválido o expirado ──
  if (codeStatus === "invalid") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif", padding: "1rem" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "2.5rem", maxWidth: 380, width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.1)" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef2f2", border: "1.5px solid #fca5a5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontSize: 26 }}>⚠️</div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>Enlace inválido o expirado</h2>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            El enlace de restablecimiento no es válido o ya expiró. Los enlaces tienen una vigencia de 1 hora.
          </p>
          <Link
            to="/forgot"
            style={{ display: "inline-block", width: "100%", padding: "10px 0", borderRadius: 8, background: "#6366f1", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", boxSizing: "border-box" }}
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  // ── ESTADO: formulario activo ──
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
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(99,102,241,0.25)", border: "1.5px solid rgba(99,102,241,0.5)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: 28 }}>🔑</div>
            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Nueva contraseña</h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.6, maxWidth: 220, margin: "0 auto" }}>
              Define una contraseña segura para tu cuenta
            </p>
            <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
              {[
                { label: "Mínimo 10 caracteres",            ok: rules.length },
                { label: "Al menos una mayúscula",          ok: rules.uppercase },
                { label: "Al menos una minúscula",          ok: rules.lowercase },
                { label: "Al menos un número",              ok: rules.number },
                { label: "Al menos un carácter especial",   ok: rules.special },
              ].map(({ label, ok }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: ok ? "#4ade80" : "rgba(255,255,255,0.25)", flexShrink: 0, transition: "background 0.2s" }} />
                  <span style={{ color: ok ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)", fontSize: 12, transition: "color 0.2s" }}>{label}</span>
                </div>
              ))}
            </div>
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
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>Restablecer contraseña</h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: accountEmail ? "1rem" : "2rem" }}>Ingresa y confirma tu nueva contraseña</p>

            {accountEmail && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", border: "0.5px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: 16 }}>👤</span>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>Cuenta registrada</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: 0 }}>{accountEmail}</p>
                </div>
              </div>
            )}

            {errors.general && (
              <div style={{ background: "#fef2f2", border: "0.5px solid #fca5a5", borderRadius: 8, padding: "10px 12px", marginBottom: "1.25rem" }}>
                <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* NUEVA CONTRASEÑA */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 6, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  Nueva contraseña
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, pointerEvents: "none" }}>🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: "" }); }}
                    placeholder="Mínimo 10 caracteres"
                    style={{
                      width: "100%",
                      padding: "10px 40px 10px 36px",
                      borderRadius: 8,
                      border: errors.password ? "0.5px solid #ef4444" : "0.5px solid #e2e8f0",
                      fontSize: 14,
                      background: errors.password ? "#fef2f2" : "#f8fafc",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#94a3b8", padding: 2 }}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && (
                  <p style={{ fontSize: 12, color: "#ef4444", marginTop: 5 }}>{errors.password}</p>
                )}
              </div>

              {/* CONFIRMAR CONTRASEÑA */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 6, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  Confirmar contraseña
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, pointerEvents: "none" }}>🔒</span>
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors({ ...errors, confirm: "" }); }}
                    placeholder="Repite la contraseña"
                    style={{
                      width: "100%",
                      padding: "10px 40px 10px 36px",
                      borderRadius: 8,
                      border: errors.confirm ? "0.5px solid #ef4444" : "0.5px solid #e2e8f0",
                      fontSize: 14,
                      background: errors.confirm ? "#fef2f2" : "#f8fafc",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#94a3b8", padding: 2 }}
                  >
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.confirm && (
                  <p style={{ fontSize: 12, color: "#ef4444", marginTop: 5 }}>{errors.confirm}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: 11,
                  borderRadius: 8,
                  border: "none",
                  background: "#6366f1",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Guardando..." : "Guardar contraseña →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
