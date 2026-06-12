import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useAuthUser } from "../hooks/useAuthUser";
import { useInactivityLogout } from "../hooks/useInactivityLogout";
import { obtenerHistorial, cerrarSesion, actualizarHeartbeat, cerrarSesionesExpiradas } from "../services/historialService";
import app from "../firebase";

const auth = getAuth(app);

const badgeMetodo = {
  email:    { label: "✉️ Email",    bg: "#ede9fe", color: "#6d28d9" },
  google:   { label: "🔵 Google",   bg: "#dbeafe", color: "#1d4ed8" },
  github:   { label: "🐱 GitHub",   bg: "#f1f5f9", color: "#0f172a" },
  facebook: { label: "🔵 Facebook", bg: "#eff6ff", color: "#1877f2" },
};

const formatHora = (ts) => {
  if (!ts) return "—";
  return ts.toDate().toLocaleString("es-CO", { dateStyle: "short", timeStyle: "medium" });
};

const formatTimer = (ms) => {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

function Avatar({ displayName, photoURL, size = 40 }) {
  const [err, setErr] = useState(false);
  const initial = (displayName || "?").charAt(0).toUpperCase();
  if (photoURL && !err)
    return <img src={photoURL} alt="av" onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(255,255,255,0.2)" }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0, border: "2px solid rgba(255,255,255,0.2)" }}>
      {initial}
    </div>
  );
}

function Spinner() {
  return <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  useLocation(); // fuerza re-render al cambiar ruta
  const { user, loading: authLoading } = useAuthUser();

  const [historial, setHistorial]     = useState([]);
  const [loadingHist, setLoadingHist] = useState(true);
  const [histSearch, setHistSearch]   = useState("");

  const handleLogout = async () => {
    await cerrarSesion();
    await signOut(auth);
    navigate("/");
  };

  const { remaining, reset } = useInactivityLogout(handleLogout);
  const showWarning = remaining <= 60_000 && remaining > 0;
  const timerColor  = remaining <= 60_000 ? "#ef4444" : remaining <= 120_000 ? "#f59e0b" : "#22c55e";

  // Heartbeat cada 60 s — mantiene la sesión marcada como activa mientras el usuario está en la app
  useEffect(() => {
    const id = setInterval(actualizarHeartbeat, 60_000);
    return () => clearInterval(id);
  }, []);

  // Cargar historial: primero cerrar sesiones expiradas (sin heartbeat > 5 min), luego cargar
  useEffect(() => {
    cerrarSesionesExpiradas()
      .then(() => obtenerHistorial())
      .then(setHistorial)
      .finally(() => setLoadingHist(false));
  }, []);

  if (authLoading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Spinner />
    </div>
  );

  const displayName = user?.displayName || "Usuario";
  const photoURL    = user?.photoURL;
  const email       = user?.email || "";

  const historialFiltrado = historial.filter((s) => {
    const q = histSearch.toLowerCase().trim();
    if (!q) return true;
    return `${s.nombre} ${s.apellido}`.toLowerCase().includes(q) ||
           (s.metodo || "").toLowerCase().includes(q);
  });

  return (
    <div style={{ height: "100vh", display: "flex", fontFamily: "'Segoe UI', sans-serif", background: "#f1f5f9", overflow: "hidden" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── MODAL INACTIVIDAD ── */}
      {showWarning && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(2px)" }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "36px 32px", maxWidth: 340, width: "90%", textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px" }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Sesión por expirar</h3>
            <p style={{ margin: "0 0 6px", fontSize: 13, color: "#64748b" }}>Tu sesión cerrará por inactividad en:</p>
            <p style={{ margin: "0 0 28px", fontSize: 36, fontWeight: 800, color: "#ef4444", fontVariantNumeric: "tabular-nums" }}>{formatTimer(remaining)}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={reset} style={{ width: "100%", padding: 11, borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Continuar sesión</button>
              <button onClick={handleLogout} style={{ width: "100%", padding: 11, borderRadius: 10, border: "1.5px solid #fecaca", background: "#fff5f5", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cerrar sesión ahora</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ SIDEBAR ══ */}
      <aside style={{ width: 240, minWidth: 240, height: "100vh", background: "#1a1035", display: "flex", flexDirection: "column", padding: "28px 12px 20px", boxSizing: "border-box", boxShadow: "4px 0 24px rgba(0,0,0,0.15)", position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", top: -50, right: -50, background: "rgba(99,102,241,0.1)", pointerEvents: "none" }} />

        {/* Avatar + info */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20, zIndex: 1 }}>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <Avatar displayName={displayName} photoURL={photoURL} size={72} />
            <span style={{ position: "absolute", bottom: 2, right: 2, width: 13, height: 13, background: "#22c55e", borderRadius: "50%", border: "2px solid #1a1035" }} />
          </div>
          <h3 style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "#fff", textAlign: "center", wordBreak: "break-word" }}>{displayName}</h3>
          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "center", wordBreak: "break-all", lineHeight: 1.4 }}>{email}</p>
        </div>

        {/* Timer */}
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 12px", textAlign: "center", marginBottom: 20, zIndex: 1 }}>
          <p style={{ margin: "0 0 2px", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.3px" }}>⏱ Sesión activa por</p>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: timerColor, fontVariantNumeric: "tabular-nums" }}>{formatTimer(remaining)}</p>
        </div>

        {/* Divisor */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 12, zIndex: 1 }} />

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(99,102,241,0.2)", borderLeft: "3px solid #6366f1" }}>
            <span style={{ fontSize: 16 }}>🔐</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#a5b4fc" }}>Historial de sesiones</span>
          </div>
          <button onClick={() => navigate("/usuarios")}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "transparent", border: "none", color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 500, cursor: "pointer", textAlign: "left" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            <span style={{ fontSize: 16 }}>👥</span> Gestión de usuarios
          </button>
        </nav>

        {/* Empuja el botón al fondo */}
        <div style={{ flex: 1 }} />

        <button onClick={handleLogout} style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: "rgba(239,68,68,0.18)", color: "#f87171", fontSize: 13, fontWeight: 600, cursor: "pointer", zIndex: 1 }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.32)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.18)"}>
          Cerrar sesión
        </button>
      </aside>

      {/* ══ HISTORIAL GLOBAL ══ */}
      <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", minWidth: 0 }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Historial de autenticación</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Registro de todas las sesiones iniciadas</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: "14px 20px", marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none" }}>🔍</span>
            <input type="text" value={histSearch} onChange={(e) => setHistSearch(e.target.value)} placeholder="Buscar por nombre o método..."
              style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, background: "#f8fafc", color: "#0f172a", outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => e.target.style.borderColor = "#6366f1"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {["google", "email", "github", "facebook"].map((m) => (
              <button key={m} onClick={() => setHistSearch(histSearch === m ? "" : m)}
                style={{ padding: "6px 12px", borderRadius: 20, border: `1px solid ${histSearch === m ? "#6366f1" : "#e2e8f0"}`, background: histSearch === m ? "#ede9fe" : "#fff", color: histSearch === m ? "#6366f1" : "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
            {histSearch && <button onClick={() => setHistSearch("")} style={{ padding: "6px 10px", borderRadius: 20, border: "1px solid #e2e8f0", background: "#fff", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>✕ Limpiar</button>}
          </div>
          <span style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>{historialFiltrado.length} resultado{historialFiltrado.length !== 1 ? "s" : ""}</span>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          {loadingHist ? (
            <div style={{ padding: "4rem", textAlign: "center" }}><Spinner /></div>
          ) : historialFiltrado.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
              <p style={{ color: "#94a3b8", fontSize: 14 }}>{historial.length === 0 ? "No hay sesiones registradas aún." : `Sin resultados para "${histSearch}".`}</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    {["Usuario", "Método", "Hora inicio", "Hora salida", "Estado"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#64748b", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historialFiltrado.map((s, i) => {
                    const b = badgeMetodo[s.metodo] || { label: s.metodo, bg: "#f1f5f9", color: "#334155" };
                    return (
                      <tr key={s.id} style={{ borderBottom: i < historialFiltrado.length - 1 ? "1px solid #f1f5f9" : "none" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "#0f172a", fontWeight: 500 }}>{s.nombre} {s.apellido}</td>
                        <td style={{ padding: "14px 16px" }}><span style={{ background: b.bg, color: b.color, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{b.label}</span></td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>{formatHora(s.horaInicio)}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>{formatHora(s.horaSalida)}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ background: s.estado === "activo" ? "#dcfce7" : "#f1f5f9", color: s.estado === "activo" ? "#16a34a" : "#64748b", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                            {s.estado === "activo" ? "🟢 Activo" : "⚫ Finalizado"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
