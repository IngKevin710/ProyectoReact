import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthUser } from "../hooks/useAuthUser";
import Sidebar from "../components/Sidebar";
import { obtenerHistorial, cerrarSesionesExpiradas } from "../services/historialService";
import { obtenerUsuarios } from "../services/usuariosService";

const formatHora = (ts) => {
  if (!ts) return "—";
  return ts.toDate().toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
};

const BADGE_METODO = {
  email:    { label: "✉️ Email",    bg: "#ede9fe", color: "#6d28d9" },
  google:   { label: "🔵 Google",   bg: "#dbeafe", color: "#1d4ed8" },
  github:   { label: "🐱 GitHub",   bg: "#f1f5f9", color: "#0f172a" },
  facebook: { label: "🔵 Facebook", bg: "#eff6ff", color: "#1877f2" },
};

const PROVIDER_BADGE = {
  "password":    { label: "✉️ Email",    bg: "#ede9fe", color: "#6d28d9" },
  "google.com":  { label: "🔵 Google",   bg: "#dbeafe", color: "#1d4ed8" },
  "github.com":  { label: "🐱 GitHub",   bg: "#f1f5f9", color: "#0f172a" },
  "facebook.com":{ label: "🔵 Facebook", bg: "#eff6ff", color: "#1877f2" },
};

const MODULES = [
  {
    key: "historial",
    icon: "🔐",
    title: "Historial de sesiones",
    desc: "Consulta y exporta el registro completo de autenticaciones del sistema.",
    route: "/perfil",
    accent: "#6366f1",
    accentBg: "#ede9fe",
  },
  {
    key: "usuarios",
    icon: "👥",
    title: "Gestión de usuarios",
    desc: "Administra cuentas de usuario, asigna roles y gestiona permisos de acceso.",
    route: "/usuarios",
    accent: "#8b5cf6",
    accentBg: "#f3e8ff",
  },
  {
    key: "productos",
    icon: "📦",
    title: "Gestión de productos",
    desc: "Crea, edita y controla el catálogo de productos con precios y stock.",
    route: "/productos",
    accent: "#0891b2",
    accentBg: "#e0f2fe",
  },
  {
    key: "proveedores",
    icon: "🚚",
    title: "Gestión de proveedores",
    desc: "Administra el directorio de proveedores con sus datos de contacto.",
    route: "/proveedores",
    accent: "#16a34a",
    accentBg: "#dcfce7",
  },
];

const CSS = `
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

  .db-layout  { display:flex; height:100dvh; font-family:'Segoe UI',sans-serif; background:#f1f5f9; overflow:hidden; }
  .db-main   { flex:1; overflow-y:auto; padding:28px 32px; min-width:0; }

  .db-stats       { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:24px; }
  .db-modules     { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:16px; }
  .db-bottom-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:24px; }

  @media (max-width:960px) {
    .db-bottom-grid { grid-template-columns:1fr; }
  }
  @media (max-width:900px) {
    .db-stats { grid-template-columns:1fr 1fr; }
  }
  @media (max-width:768px) {
    .db-layout  { flex-direction:column; }
    .db-main    { padding:14px; flex:1; height:0; overflow-y:auto; }
    .db-stats   { grid-template-columns:1fr 1fr; }
    .db-modules { grid-template-columns:1fr; }
  }
  @media (max-width:480px) {
    .db-stats { grid-template-columns:1fr; }
  }

  .db-module-card { background:#fff; border-radius:16px; padding:24px;
                    box-shadow:0 2px 12px rgba(0,0,0,.07); cursor:pointer;
                    transition:all .2s; border:1.5px solid transparent; animation:fadeUp .3s ease; }
  .db-module-card:hover { transform:translateY(-3px); box-shadow:0 8px 28px rgba(99,102,241,.18);
                           border-color:#6366f1; }

  .db-stat-card { background:#fff; border-radius:14px; padding:18px 20px;
                  box-shadow:0 2px 10px rgba(0,0,0,.06); animation:fadeUp .25s ease; }

  .db-session-row:hover { background:#f8fafc; }
`;

function AvatarMain({ displayName, photoURL, size = 40 }) {
  const [err, setErr] = useState(false);
  const initial = (displayName || "?").charAt(0).toUpperCase();
  const base = { width: size, height: size, borderRadius: "50%", flexShrink: 0 };
  if (photoURL && !err)
    return <img src={photoURL} alt="av" onError={() => setErr(true)} style={{ ...base, objectFit: "cover" }} />;
  return (
    <div style={{ ...base, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, color: "#fff" }}>
      {initial}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto" }} />
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="db-stat-card">
      <div style={{ width: 40, height: 40, borderRadius: 10, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>
        {icon}
      </div>
      <p style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800, color: "#0f172a" }}>{value}</p>
      <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 500 }}>{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthUser();

  const [sesiones, setSesiones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    cerrarSesionesExpiradas()
      .then(() => Promise.all([obtenerHistorial(), obtenerUsuarios()]))
      .then(([hist, users]) => {
        setSesiones(hist);
        setUsuarios(users);
      })
      .finally(() => setLoadingData(false));
  }, []);

  if (authLoading)
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
        <style>{CSS}</style>
        <Spinner />
      </div>
    );

  const displayName = user?.displayName || "Usuario";
  const photoURL = user?.photoURL;
  const email = user?.email || "";
  const firstName = displayName.split(" ")[0];
  const providerId = user?.providerData?.[0]?.providerId ?? "password";
  const providerBadge = PROVIDER_BADGE[providerId] ?? PROVIDER_BADGE["password"];

  const sesionesActivas = sesiones.filter((s) => s.estado === "activo").length;

  const sesionesRecientes = [...sesiones]
    .sort((a, b) => {
      const aT = a.horaInicio?.toDate?.()?.getTime() ?? 0;
      const bT = b.horaInicio?.toDate?.()?.getTime() ?? 0;
      return bT - aT;
    })
    .slice(0, 5);

  const fecha = new Date().toLocaleDateString("es-CO", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="db-layout">
      <style>{CSS}</style>

      <Sidebar />

      {/* ══ CONTENIDO PRINCIPAL ══ */}
      <main className="db-main">

        {/* Banner de bienvenida */}
        <div style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 16, padding: "26px 32px", marginBottom: 24, color: "#fff", position: "relative", overflow: "hidden", animation: "fadeUp .3s ease" }}>
          <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", top: -70, right: -40, background: "rgba(255,255,255,.1)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: 130, height: 130, borderRadius: "50%", bottom: -40, right: 110, background: "rgba(255,255,255,.07)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ margin: "0 0 4px", fontSize: 12, opacity: 0.75, textTransform: "capitalize", letterSpacing: ".3px" }}>{fecha}</p>
            <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800 }}>Bienvenido, {firstName} 👋</h1>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>Aquí tienes un resumen de la actividad del sistema.</p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="db-stats">
          <StatCard icon="🔐" label="Sesiones totales" value={loadingData ? "—" : sesiones.length} color="#6366f1" />
          <StatCard icon="🟢" label="Sesiones activas" value={loadingData ? "—" : sesionesActivas} color="#22c55e" />
          <StatCard icon="👥" label="Usuarios registrados" value={loadingData ? "—" : usuarios.length} color="#8b5cf6" />
        </div>

        {/* Accesos rápidos */}
        <h2 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: ".1px" }}>Accesos rápidos</h2>
        <div className="db-modules">
          {MODULES.map((mod) => (
            <div key={mod.key} className="db-module-card" onClick={() => navigate(mod.route)}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: mod.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 }}>
                {mod.icon}
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{mod.title}</h3>
              <p style={{ margin: "0 0 18px", fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>{mod.desc}</p>
              <button
                style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: mod.accentBg, color: mod.accent, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                onClick={(e) => { e.stopPropagation(); navigate(mod.route); }}
              >
                Ir al módulo →
              </button>
            </div>
          ))}
        </div>

        {/* ── SECCIÓN INFERIOR: perfil + actividad reciente ── */}
        <div className="db-bottom-grid">

          {/* Card de perfil */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,.07)", animation: "fadeUp .35s ease" }}>
            <h2 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 700, color: "#0f172a", letterSpacing: ".1px" }}>Mi perfil</h2>

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <AvatarMain displayName={displayName} photoURL={photoURL} size={56} />
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</p>
              </div>
            </div>

            <div style={{ height: 1, background: "#f1f5f9", marginBottom: 16 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".4px" }}>Método de acceso</span>
                <span style={{ background: providerBadge.bg, color: providerBadge.color, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                  {providerBadge.label}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".4px" }}>Estado</span>
                <span style={{ background: "#dcfce7", color: "#16a34a", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>🟢 Activo</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".4px" }}>Sesiones propias</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                  {loadingData ? "—" : sesiones.filter(s => s.uid === user?.uid).length}
                </span>
              </div>
            </div>
          </div>

          {/* Actividad reciente */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,.07)", animation: "fadeUp .4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a", letterSpacing: ".1px" }}>Actividad reciente</h2>
              <button
                onClick={() => navigate("/perfil")}
                style={{ background: "none", border: "none", color: "#6366f1", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}
              >
                Ver todo →
              </button>
            </div>

            {loadingData ? (
              <div style={{ padding: "24px 0", textAlign: "center" }}><Spinner /></div>
            ) : sesionesRecientes.length === 0 ? (
              <div style={{ padding: "24px 0", textAlign: "center" }}>
                <p style={{ fontSize: 28, margin: "0 0 8px" }}>🔍</p>
                <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>No hay sesiones registradas aún.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {sesionesRecientes.map((s, i) => {
                  const b = BADGE_METODO[s.metodo] ?? { label: s.metodo, bg: "#f1f5f9", color: "#334155" };
                  const isLast = i === sesionesRecientes.length - 1;
                  return (
                    <div
                      key={s.id}
                      className="db-session-row"
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 8px", borderBottom: isLast ? "none" : "1px solid #f1f5f9", borderRadius: 8, gap: 8 }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.nombre} {s.apellido}
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{formatHora(s.horaInicio)}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <span style={{ background: b.bg, color: b.color, padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{b.label}</span>
                        <span style={{ background: s.estado === "activo" ? "#dcfce7" : "#f1f5f9", color: s.estado === "activo" ? "#16a34a" : "#64748b", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                          {s.estado === "activo" ? "Activo" : "Fin."}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
        {/* espaciado final */}
        <div style={{ height: 24 }} />
      </main>
    </div>
  );
}
