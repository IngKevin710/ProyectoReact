import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useAuthUser } from "../hooks/useAuthUser";
import { useInactivityLogout } from "../hooks/useInactivityLogout";
import { obtenerHistorial, cerrarSesion } from "../services/historialService";
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

export default function ProfilePage() {
  const navigate                        = useNavigate();
  const { user, loading: authLoading }  = useAuthUser();
  const [showHistorial, setShowHistorial] = useState(false);
  const [historial, setHistorial]         = useState([]);
  const [loadingHist, setLoadingHist]     = useState(false);
  const [imgError, setImgError]           = useState(false);
  const [search, setSearch]               = useState("");

  const handleLogout = async () => {
    await cerrarSesion();
    await signOut(auth);
    navigate("/");
  };

  const { remaining, reset } = useInactivityLogout(handleLogout);
  const showWarning = remaining <= 60_000 && remaining > 0;
  const timerColor  = remaining <= 60_000 ? "#ef4444" : remaining <= 120_000 ? "#f59e0b" : "#22c55e";

  useEffect(() => {
    if (!showHistorial) return;
    setLoadingHist(true);
    obtenerHistorial()
      .then(setHistorial)
      .finally(() => setLoadingHist(false));
  }, [showHistorial]);

  // ── Filtro de búsqueda ─────────────────────────────────────────
  const filtered = historial.filter((s) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const nombre  = `${s.nombre} ${s.apellido}`.toLowerCase();
    const metodo  = (s.metodo || "").toLowerCase();
    return nombre.includes(q) || metodo.includes(q);
  });

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#94a3b8", fontSize: 14 }}>Cargando...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const displayName = user?.displayName || "Usuario";
  const photoURL    = user?.photoURL;
  const email       = user?.email || "";
  const initials    = displayName.charAt(0).toUpperCase();

  const Avatar = ({ size }) => (
    photoURL && !imgError
      ? <img src={photoURL} alt="avatar" onError={() => setImgError(true)}
          style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.25)", display: "block" }} />
      : <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 700, color: "#fff", border: "3px solid rgba(255,255,255,0.25)", flexShrink: 0 }}>
          {initials}
        </div>
  );

  const TimerChip = ({ dark }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 14px", borderRadius: 12, background: dark ? "rgba(255,255,255,0.07)" : "#f8fafc", border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}`, width: "100%", boxSizing: "border-box" }}>
      <span style={{ fontSize: 10, color: dark ? "rgba(255,255,255,0.4)" : "#94a3b8", letterSpacing: "0.3px" }}>⏱ Sesión activa por</span>
      <span style={{ fontSize: 16, fontWeight: 800, color: timerColor, fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>{formatTimer(remaining)}</span>
      <span style={{ fontSize: 10, color: dark ? "rgba(255,255,255,0.25)" : "#cbd5e1", textAlign: "center" }}>antes de cerrar por inactividad</span>
    </div>
  );

  const WarningModal = () => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(2px)" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "36px 32px", maxWidth: 340, width: "90%", textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px" }}>⚠️</div>
        <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Sesión por expirar</h3>
        <p style={{ margin: "0 0 6px", fontSize: 13, color: "#64748b" }}>Tu sesión cerrará automáticamente por inactividad en:</p>
        <p style={{ margin: "0 0 28px", fontSize: 36, fontWeight: 800, color: "#ef4444", fontVariantNumeric: "tabular-nums" }}>{formatTimer(remaining)}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={reset} style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Continuar sesión
          </button>
          <button onClick={handleLogout} style={{ width: "100%", padding: "11px", borderRadius: 10, border: "1.5px solid #fecaca", background: "#fff5f5", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Cerrar sesión ahora
          </button>
        </div>
      </div>
    </div>
  );

  // ─── VISTA INICIAL (centrada) ──────────────────────────────────
  if (!showHistorial) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif", padding: "1rem" }}>
        {showWarning && <WarningModal />}
        <div style={{ background: "#fff", borderRadius: 24, padding: "48px 40px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.1)", maxWidth: 360, width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div style={{ position: "relative" }}>
              <Avatar size={90} />
              <span style={{ position: "absolute", bottom: 2, right: 2, width: 16, height: 16, background: "#22c55e", borderRadius: "50%", border: "2px solid #fff" }} />
            </div>
          </div>
          <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>{displayName}</h2>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#94a3b8" }}>{email}</p>
          <div style={{ marginBottom: 28 }}><TimerChip dark={false} /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => setShowHistorial(true)}
              style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.35)", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#4f46e5"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#6366f1"; e.currentTarget.style.transform = "translateY(0)"; }}>
              Ver historial de sesiones
            </button>
            <button onClick={handleLogout}
              style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1.5px solid #fecaca", background: "#fff5f5", color: "#ef4444", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.transform = "translateY(0)"; }}>
              Cerrar sesión
            </button>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── VISTA CON HISTORIAL (sidebar fijo + contenido con scroll) ─
  return (
    <div style={{ height: "100vh", display: "flex", fontFamily: "'Segoe UI', sans-serif", background: "#f1f5f9", overflow: "hidden" }}>
      {showWarning && <WarningModal />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ══ SIDEBAR FIJO ══ */}
      <aside style={{
        width: 240,
        minWidth: 240,
        height: "100vh",
        background: "#1a1035",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "36px 16px 24px",
        boxSizing: "border-box",
        boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}>
        {/* Decoración */}
        <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", top: -50, right: -50, background: "rgba(99,102,241,0.1)", pointerEvents: "none" }} />

        {/* Avatar */}
        <div style={{ position: "relative", marginBottom: 12, zIndex: 1 }}>
          <Avatar size={72} />
          <span style={{ position: "absolute", bottom: 2, right: 2, width: 13, height: 13, background: "#22c55e", borderRadius: "50%", border: "2px solid #1a1035" }} />
        </div>

        {/* Nombre y email */}
        <h3 style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "#fff", textAlign: "center", wordBreak: "break-word", zIndex: 1 }}>{displayName}</h3>
        <p style={{ margin: "0 0 16px", fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "center", wordBreak: "break-all", zIndex: 1, lineHeight: 1.4 }}>{email}</p>

        {/* Timer */}
        <div style={{ width: "100%", marginBottom: 16, zIndex: 1 }}>
          <TimerChip dark={true} />
        </div>

        {/* Divider */}
        <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 16, zIndex: 1 }} />

        {/* Nav activo */}
        <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(99,102,241,0.2)", borderLeft: "3px solid #6366f1", zIndex: 1 }}>
          <span style={{ fontSize: 15 }}>🔐</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#a5b4fc" }}>Historial</span>
        </div>

        {/* Empuja los botones al fondo */}
        <div style={{ flex: 1 }} />

        {/* Botones en fila */}
        <div style={{ display: "flex", gap: 8, width: "100%", zIndex: 1 }}>
          <button onClick={() => setShowHistorial(false)}
            style={{ flex: 1, padding: "10px 4px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}>
            ← Volver
          </button>
          <button onClick={handleLogout}
            style={{ flex: 1, padding: "10px 4px", borderRadius: 10, border: "none", background: "rgba(239,68,68,0.18)", color: "#f87171", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "background 0.2s", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.32)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.18)"}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ══ CONTENIDO CON SCROLL ══ */}
      <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "36px 32px", minWidth: 0 }}>

        {/* Encabezado */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Historial de autenticación</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Registro de todas las sesiones iniciadas</p>
        </div>

        {/* Buscador */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none" }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o método (google, email, github…)"
              style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, background: "#f8fafc", color: "#0f172a", outline: "none", boxSizing: "border-box", transition: "border 0.2s" }}
              onFocus={(e) => e.target.style.borderColor = "#6366f1"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {["google", "email", "github", "facebook"].map((m) => (
              <button key={m} onClick={() => setSearch(search === m ? "" : m)}
                style={{ padding: "6px 12px", borderRadius: 20, border: `1px solid ${search === m ? "#6366f1" : "#e2e8f0"}`, background: search === m ? "#ede9fe" : "#fff", color: search === m ? "#6366f1" : "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
            {search && (
              <button onClick={() => setSearch("")}
                style={{ padding: "6px 10px", borderRadius: 20, border: "1px solid #e2e8f0", background: "#fff", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>
                ✕ Limpiar
              </button>
            )}
          </div>
          <span style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Tabla */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          {loadingHist ? (
            <div style={{ padding: "4rem", textAlign: "center" }}>
              <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
              <p style={{ color: "#94a3b8", fontSize: 14 }}>Cargando historial...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
              <p style={{ color: "#94a3b8", fontSize: 14 }}>
                {historial.length === 0 ? "No hay sesiones registradas aún." : `Sin resultados para "${search}".`}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    {["Usuario", "Método", "Hora inicio", "Hora salida", "Estado"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#64748b", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => {
                    const badge = badgeMetodo[s.metodo] || { label: s.metodo, bg: "#f1f5f9", color: "#334155" };
                    return (
                      <tr key={s.id}
                        style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none", transition: "background 0.15s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "#0f172a", fontWeight: 500 }}>{s.nombre} {s.apellido}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ background: badge.bg, color: badge.color, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{badge.label}</span>
                        </td>
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
