import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useAuthUser } from "../hooks/useAuthUser";
import { useInactivityLogout } from "../hooks/useInactivityLogout";
import { cerrarSesion, actualizarHeartbeat } from "../services/historialService";
import app from "../firebase";

const auth = getAuth(app);

const NAV_ITEMS = [
  { route: "/dashboard",   icon: "🏠", label: "Dashboard" },
  { route: "/perfil",      icon: "🔐", label: "Historial de sesiones" },
  { route: "/usuarios",    icon: "👥", label: "Gestión de usuarios" },
  { route: "/productos",   icon: "📦", label: "Gestión de productos" },
  { route: "/proveedores", icon: "🚚", label: "Gestión de proveedores" },
];

const formatTimer = (ms) => {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const CSS = `
  .sb-sidebar { width:240px; min-width:240px; flex-shrink:0; display:flex; flex-direction:column;
                background:#1a1035; padding:28px 12px 20px; box-sizing:border-box;
                box-shadow:4px 0 24px rgba(0,0,0,.15); position:relative; overflow:hidden; }
  .sb-topbar  { display:none; }

  @media (max-width:768px) {
    .sb-sidebar { display:none; }
    .sb-topbar  { display:flex; align-items:center; justify-content:space-between;
                  padding:14px 18px; background:#1a1035; flex-shrink:0;
                  box-shadow:0 2px 12px rgba(0,0,0,.2); z-index:10; }
  }

  .sb-nav-btn { display:flex; align-items:center; gap:10px; width:100%; padding:10px 14px;
                border-radius:10px; background:transparent; border:none;
                color:rgba(255,255,255,.55); font-size:13px; font-weight:500;
                cursor:pointer; text-align:left; }
  .sb-nav-btn:hover { background:rgba(255,255,255,.07); }
  .sb-nav-active { background:rgba(99,102,241,.22) !important; border-left:3px solid #6366f1;
                   color:#a5b4fc !important; font-weight:600 !important; }
`;

function Avatar({ name, photo, size = 40 }) {
  const [err, setErr] = useState(false);
  const initial = (name || "?").charAt(0).toUpperCase();
  const base = { width: size, height: size, borderRadius: "50%", flexShrink: 0, border: "2px solid rgba(255,255,255,.2)" };
  if (photo && !err)
    return <img src={photo} alt="av" onError={() => setErr(true)} style={{ ...base, objectFit: "cover" }} />;
  return (
    <div style={{ ...base, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, color: "#fff" }}>
      {initial}
    </div>
  );
}

function TimerBox({ remaining, color }) {
  return (
    <div style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
      <p style={{ margin: "0 0 2px", fontSize: 10, color: "rgba(255,255,255,.35)", letterSpacing: ".3px" }}>⏱ Sesión activa por</p>
      <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>{formatTimer(remaining)}</p>
    </div>
  );
}

/**
 * Barra lateral compartida por todas las vistas internas (post-login).
 * Incluye la versión de escritorio, la top bar móvil, el menú móvil,
 * el contador de sesión por inactividad y el modal de aviso de expiración.
 */
export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuthUser();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = async () => {
    await cerrarSesion();
    await signOut(auth);
    navigate("/");
  };

  const { remaining, reset } = useInactivityLogout(handleLogout);
  const showWarning = remaining <= 60_000 && remaining > 0;
  const timerColor  = remaining <= 60_000 ? "#ef4444" : remaining <= 120_000 ? "#f59e0b" : "#22c55e";

  useEffect(() => {
    const id = setInterval(actualizarHeartbeat, 60_000);
    return () => clearInterval(id);
  }, []);

  const displayName = user?.displayName || "Usuario";
  const activo = NAV_ITEMS.find((it) => it.route === pathname);

  const irA = (route) => {
    setMenuAbierto(false);
    if (route !== pathname) navigate(route);
  };

  return (
    <>
      <style>{CSS}</style>

      {/* ── MODAL INACTIVIDAD ── */}
      {showWarning && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, backdropFilter: "blur(2px)", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "36px 32px", maxWidth: 340, width: "100%", textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,.2)" }}>
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

      {/* ── MENÚ MÓVIL ── */}
      {menuAbierto && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200 }} onClick={() => setMenuAbierto(false)}>
          <div style={{ position: "absolute", top: 56, left: 0, right: 0, background: "#1a1035", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,.3)" }} onClick={(e) => e.stopPropagation()}>
            {NAV_ITEMS.map((it) => (
              <button key={it.route} className={`sb-nav-btn ${it.route === pathname ? "sb-nav-active" : ""}`} onClick={() => irA(it.route)}>
                <span>{it.icon}</span> {it.label}
              </button>
            ))}
            <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "4px 0" }} />
            <TimerBox remaining={remaining} color={timerColor} />
            <button onClick={handleLogout} style={{ marginTop: 4, padding: "10px 14px", borderRadius: 10, border: "none", background: "rgba(239,68,68,.18)", color: "#f87171", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cerrar sesión</button>
          </div>
        </div>
      )}

      {/* ── TOP BAR MÓVIL ── */}
      <div className="sb-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={displayName} photo={user?.photoURL} size={34} />
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>
            {activo ? `${activo.icon} ${activo.label}` : "Menú"}
          </span>
        </div>
        <button onClick={() => setMenuAbierto(!menuAbierto)} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 8, width: 36, height: 36, cursor: "pointer", fontSize: 18, color: "#fff" }}>☰</button>
      </div>

      {/* ══ SIDEBAR ESCRITORIO ══ */}
      <aside className="sb-sidebar">
        <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", top: -50, right: -50, background: "rgba(99,102,241,.1)", pointerEvents: "none" }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20, zIndex: 1 }}>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <Avatar name={displayName} photo={user?.photoURL} size={72} />
            <span style={{ position: "absolute", bottom: 2, right: 2, width: 13, height: 13, background: "#22c55e", borderRadius: "50%", border: "2px solid #1a1035" }} />
          </div>
          <h3 style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "#fff", textAlign: "center", wordBreak: "break-word" }}>{displayName}</h3>
          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,.4)", textAlign: "center", wordBreak: "break-all", lineHeight: 1.4 }}>{user?.email}</p>
        </div>

        <div style={{ marginBottom: 20, zIndex: 1 }}>
          <TimerBox remaining={remaining} color={timerColor} />
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,.08)", marginBottom: 12, zIndex: 1 }} />

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, zIndex: 1 }}>
          {NAV_ITEMS.map((it) => (
            <button key={it.route} className={`sb-nav-btn ${it.route === pathname ? "sb-nav-active" : ""}`} onClick={() => irA(it.route)}>
              <span style={{ fontSize: 16 }}>{it.icon}</span> {it.label}
            </button>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        <button onClick={handleLogout}
          style={{ width: "100%", padding: 11, borderRadius: 10, border: "none", background: "rgba(239,68,68,.18)", color: "#f87171", fontSize: 13, fontWeight: 600, cursor: "pointer", zIndex: 1 }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,.32)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,.18)")}>
          Cerrar sesión
        </button>
      </aside>
    </>
  );
}
