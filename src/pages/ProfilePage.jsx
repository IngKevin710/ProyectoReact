import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useAuthUser } from "../hooks/useAuthUser";
import { useInactivityLogout } from "../hooks/useInactivityLogout";
import { obtenerHistorial, cerrarSesion, actualizarHeartbeat, cerrarSesionesExpiradas } from "../services/historialService";
import app from "../firebase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

const CSS = `
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

  .pp-layout  { display:flex; height:100dvh; font-family:'Segoe UI',sans-serif; background:#f1f5f9; overflow:hidden; }

  .pp-sidebar { width:240px; min-width:240px; flex-shrink:0; display:flex; flex-direction:column;
                background:#1a1035; padding:28px 12px 20px; box-sizing:border-box;
                box-shadow:4px 0 24px rgba(0,0,0,.15); position:relative; overflow:hidden; }

  .pp-main    { flex:1; overflow-y:auto; padding:28px 32px; min-width:0; }
  .pp-topbar  { display:none; }

  .pp-table-wrap { display:block; }
  .pp-cards-wrap { display:none; }

  .pp-header  { display:flex; align-items:flex-start; justify-content:space-between;
                margin-bottom:20px; flex-wrap:wrap; gap:12px; }

  .pp-filters { background:#fff; border-radius:12px; padding:14px 20px; margin-bottom:16px;
                box-shadow:0 2px 8px rgba(0,0,0,.06); display:flex; align-items:center;
                gap:12px; flex-wrap:wrap; }

  @media (max-width:768px) {
    .pp-layout  { flex-direction:column; }
    .pp-sidebar { display:none; }
    .pp-topbar  { display:flex; align-items:center; justify-content:space-between;
                  padding:14px 18px; background:#1a1035; flex-shrink:0;
                  box-shadow:0 2px 12px rgba(0,0,0,.2); z-index:10; }
    .pp-main    { padding:14px; flex:1; height:0; overflow-y:auto; }
    .pp-table-wrap { display:none; }
    .pp-cards-wrap { display:flex; flex-direction:column; gap:12px; }
    .pp-header  { flex-direction:column; align-items:stretch; }
    .pp-filters { flex-direction:column; align-items:stretch; padding:12px 14px; }
  }

  .pp-nav-btn { display:flex; align-items:center; gap:10px; width:100%; padding:10px 14px;
                border-radius:10px; background:transparent; border:none;
                color:rgba(255,255,255,.55); font-size:13px; font-weight:500;
                cursor:pointer; text-align:left; }
  .pp-nav-btn:hover { background:rgba(255,255,255,.07); }
  .pp-nav-active { background:rgba(99,102,241,.22) !important; border-left:3px solid #6366f1; color:#a5b4fc !important; font-weight:600 !important; }

  .pp-row:hover { background:#f8fafc; }
`;

function Avatar({ displayName, photoURL, size = 40 }) {
  const [err, setErr] = useState(false);
  const initial = (displayName || "?").charAt(0).toUpperCase();
  const base = { width: size, height: size, borderRadius: "50%", flexShrink: 0, border: "2px solid rgba(255,255,255,.2)" };
  if (photoURL && !err)
    return <img src={photoURL} alt="av" onError={() => setErr(true)} style={{ ...base, objectFit: "cover" }} />;
  return (
    <div style={{ ...base, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * .38, fontWeight: 700, color: "#fff" }}>
      {initial}
    </div>
  );
}

function Spinner() {
  return <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto" }} />;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  useLocation(); // fuerza re-render al cambiar ruta
  const { user, loading: authLoading } = useAuthUser();

  const [historial, setHistorial]     = useState([]);
  const [loadingHist, setLoadingHist] = useState(true);
  const [histSearch, setHistSearch]   = useState("");
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

  useEffect(() => {
    cerrarSesionesExpiradas()
      .then(() => obtenerHistorial())
      .then(setHistorial)
      .finally(() => setLoadingHist(false));
  }, []);

  const historialFiltrado = historial.filter((s) => {
    const q = histSearch.toLowerCase().trim();
    if (!q) return true;
    return `${s.nombre} ${s.apellido}`.toLowerCase().includes(q) ||
           (s.metodo || "").toLowerCase().includes(q);
  });

  const exportarPDF = () => {
    const doc    = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const ahora  = new Date().toLocaleString("es-CO", { dateStyle: "full", timeStyle: "short" });
    const activas     = historial.filter((s) => s.estado === "activo").length;
    const finalizadas = historial.filter((s) => s.estado === "finalizado").length;

    doc.setFillColor(26, 16, 53);
    doc.rect(0, 0, 297, 38, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Auditoría — Historial de Autenticación", 14, 16);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(165, 180, 252);
    doc.text(`Generado el ${ahora}`, 14, 24);
    if (histSearch)
      doc.text(`Filtro: "${histSearch}"  ·  ${historialFiltrado.length} resultado(s)`, 14, 31);

    const stats = [
      { label: "Total sesiones", value: historial.length,  color: [99, 102, 241] },
      { label: "Activas",        value: activas,            color: [34, 197, 94]  },
      { label: "Finalizadas",    value: finalizadas,        color: [100, 116, 139] },
    ];
    stats.forEach((s, i) => {
      const x = 14 + i * 62;
      doc.setFillColor(...s.color);
      doc.roundedRect(x, 44, 55, 20, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(String(s.value), x + 8, 57);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(s.label, x + 8, 62);
    });

    autoTable(doc, {
      startY: 72,
      head: [["#", "Usuario", "Método", "Hora inicio", "Hora salida", "Estado"]],
      body: historialFiltrado.map((s, i) => [
        i + 1,
        `${s.nombre || ""} ${s.apellido || ""}`.trim(),
        (s.metodo || "—").charAt(0).toUpperCase() + (s.metodo || "").slice(1),
        formatHora(s.horaInicio),
        formatHora(s.horaSalida),
        s.estado === "activo" ? "Activo" : "Finalizado",
      ]),
      styles:             { fontSize: 9, cellPadding: 4, font: "helvetica" },
      headStyles:         { fillColor: [26, 16, 53], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 0: { halign: "center", cellWidth: 10 }, 5: { halign: "center" } },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 5) {
          const val   = data.cell.raw;
          const color = val === "Activo" ? [34, 197, 94] : [100, 116, 139];
          doc.setFillColor(...color);
          const { x, y, width, height } = data.cell;
          doc.roundedRect(x + 2, y + 2, width - 4, height - 4, 2, 2, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.text(val, x + width / 2, y + height / 2 + 1, { align: "center" });
        }
      },
    });

    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "normal");
      doc.text("ProyectoReact — Documento confidencial", 14, 205);
      doc.text(`Página ${p} de ${total}`, 283, 205, { align: "right" });
    }

    doc.save(`auditoria_historial_${Date.now()}.pdf`);
  };

  if (authLoading) return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
      <style>{CSS}</style>
      <Spinner />
    </div>
  );

  const displayName = user?.displayName || "Usuario";
  const photoURL    = user?.photoURL;
  const email       = user?.email || "";

  return (
    <div className="pp-layout">
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
            <button className="pp-nav-btn" onClick={() => { navigate("/dashboard"); setMenuAbierto(false); }}><span>🏠</span> Dashboard</button>
            <button className="pp-nav-btn pp-nav-active"><span>🔐</span> Historial de sesiones</button>
            <button className="pp-nav-btn" onClick={() => { navigate("/usuarios"); setMenuAbierto(false); }}><span>👥</span> Gestión de usuarios</button>
            <button className="pp-nav-btn" onClick={() => { navigate("/productos"); setMenuAbierto(false); }}><span>📦</span> Gestión de productos</button>
            <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "4px 0" }} />
            <div style={{ background: "rgba(255,255,255,.05)", borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
              <p style={{ margin: "0 0 2px", fontSize: 10, color: "rgba(255,255,255,.35)" }}>⏱ Sesión activa por</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: timerColor, fontVariantNumeric: "tabular-nums" }}>{formatTimer(remaining)}</p>
            </div>
            <button onClick={handleLogout} style={{ marginTop: 4, padding: "10px 14px", borderRadius: 10, border: "none", background: "rgba(239,68,68,.18)", color: "#f87171", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cerrar sesión</button>
          </div>
        </div>
      )}

      {/* ── TOP BAR MÓVIL ── */}
      <div className="pp-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar displayName={displayName} photoURL={photoURL} size={34} />
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>🔐 Historial</span>
        </div>
        <button onClick={() => setMenuAbierto(!menuAbierto)} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 8, width: 36, height: 36, cursor: "pointer", fontSize: 18, color: "#fff" }}>☰</button>
      </div>

      {/* ══ SIDEBAR ══ */}
      <aside className="pp-sidebar">
        <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", top: -50, right: -50, background: "rgba(99,102,241,.1)", pointerEvents: "none" }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20, zIndex: 1 }}>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <Avatar displayName={displayName} photoURL={photoURL} size={72} />
            <span style={{ position: "absolute", bottom: 2, right: 2, width: 13, height: 13, background: "#22c55e", borderRadius: "50%", border: "2px solid #1a1035" }} />
          </div>
          <h3 style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "#fff", textAlign: "center", wordBreak: "break-word" }}>{displayName}</h3>
          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,.4)", textAlign: "center", wordBreak: "break-all", lineHeight: 1.4 }}>{email}</p>
        </div>

        <div style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "8px 12px", textAlign: "center", marginBottom: 20, zIndex: 1 }}>
          <p style={{ margin: "0 0 2px", fontSize: 10, color: "rgba(255,255,255,.35)", letterSpacing: ".3px" }}>⏱ Sesión activa por</p>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: timerColor, fontVariantNumeric: "tabular-nums" }}>{formatTimer(remaining)}</p>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,.08)", marginBottom: 12, zIndex: 1 }} />

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, zIndex: 1 }}>
          <button className="pp-nav-btn" onClick={() => navigate("/dashboard")}><span style={{ fontSize: 16 }}>🏠</span> Dashboard</button>
          <button className="pp-nav-btn pp-nav-active"><span style={{ fontSize: 16 }}>🔐</span> Historial de sesiones</button>
          <button className="pp-nav-btn" onClick={() => navigate("/usuarios")}><span style={{ fontSize: 16 }}>👥</span> Gestión de usuarios</button>
          <button className="pp-nav-btn" onClick={() => navigate("/productos")}><span style={{ fontSize: 16 }}>📦</span> Gestión de productos</button>
        </nav>

        <div style={{ flex: 1 }} />

        <button onClick={handleLogout}
          style={{ width: "100%", padding: 11, borderRadius: 10, border: "none", background: "rgba(239,68,68,.18)", color: "#f87171", fontSize: 13, fontWeight: 600, cursor: "pointer", zIndex: 1 }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,.32)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239,68,68,.18)"}>
          Cerrar sesión
        </button>
      </aside>

      {/* ══ CONTENIDO ══ */}
      <main className="pp-main">

        {/* Encabezado */}
        <div className="pp-header">
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Historial de autenticación</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Registro de todas las sesiones iniciadas</p>
          </div>
          <button onClick={exportarPDF} disabled={historial.length === 0}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "none", background: historial.length === 0 ? "#e2e8f0" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: historial.length === 0 ? "#94a3b8" : "#fff", fontSize: 13, fontWeight: 600, cursor: historial.length === 0 ? "not-allowed" : "pointer", boxShadow: historial.length === 0 ? "none" : "0 4px 14px rgba(99,102,241,.4)", transition: "opacity .2s", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => { if (historial.length > 0) e.currentTarget.style.opacity = ".88"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}>
            📄 Exportar PDF
          </button>
        </div>

        {/* Filtros */}
        <div className="pp-filters">
          <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none" }}>🔍</span>
            <input type="text" value={histSearch} onChange={(e) => setHistSearch(e.target.value)}
              placeholder="Buscar por nombre o método..."
              style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, background: "#f8fafc", color: "#0f172a", outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => e.target.style.borderColor = "#6366f1"}
              onBlur={(e)  => e.target.style.borderColor = "#e2e8f0"} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {["google", "email", "github", "facebook"].map((m) => (
              <button key={m} onClick={() => setHistSearch(histSearch === m ? "" : m)}
                style={{ padding: "6px 12px", borderRadius: 20, border: `1.5px solid ${histSearch === m ? "#6366f1" : "#e2e8f0"}`, background: histSearch === m ? "#ede9fe" : "#fff", color: histSearch === m ? "#6366f1" : "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
            {histSearch && (
              <button onClick={() => setHistSearch("")} style={{ padding: "6px 10px", borderRadius: 20, border: "1px solid #e2e8f0", background: "#fff", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>✕ Limpiar</button>
            )}
          </div>
          <span style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>{historialFiltrado.length} resultado{historialFiltrado.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Contenido */}
        {loadingHist ? (
          <div style={{ padding: "4rem", textAlign: "center" }}><Spinner /></div>
        ) : historialFiltrado.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, padding: "3rem", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,.07)" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>
              {historial.length === 0 ? "No hay sesiones registradas aún." : `Sin resultados para "${histSearch}".`}
            </p>
          </div>
        ) : (
          <>
            {/* ── TABLA (desktop) ── */}
            <div className="pp-table-wrap" style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,.07)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    {["Usuario", "Método", "Hora inicio", "Hora salida", "Estado"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textAlign: "left", textTransform: "uppercase", letterSpacing: ".5px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historialFiltrado.map((s, i) => {
                    const b = badgeMetodo[s.metodo] || { label: s.metodo, bg: "#f1f5f9", color: "#334155" };
                    return (
                      <tr key={s.id} className="pp-row" style={{ borderBottom: i < historialFiltrado.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "#0f172a", fontWeight: 500 }}>{s.nombre} {s.apellido}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ background: b.bg, color: b.color, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{b.label}</span>
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

            {/* ── CARDS (móvil) ── */}
            <div className="pp-cards-wrap">
              {historialFiltrado.map((s) => {
                const b = badgeMetodo[s.metodo] || { label: s.metodo, bg: "#f1f5f9", color: "#334155" };
                return (
                  <div key={s.id} style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", boxShadow: "0 2px 10px rgba(0,0,0,.07)", animation: "fadeUp .25s ease" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{s.nombre} {s.apellido}</p>
                        <span style={{ background: b.bg, color: b.color, padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{b.label}</span>
                      </div>
                      <span style={{ background: s.estado === "activo" ? "#dcfce7" : "#f1f5f9", color: s.estado === "activo" ? "#16a34a" : "#64748b", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {s.estado === "activo" ? "🟢 Activo" : "⚫ Fin."}
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 10px" }}>
                        <p style={{ margin: "0 0 2px", fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Hora inicio</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#0f172a", fontWeight: 500 }}>{formatHora(s.horaInicio)}</p>
                      </div>
                      <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 10px" }}>
                        <p style={{ margin: "0 0 2px", fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Hora salida</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#0f172a", fontWeight: 500 }}>{formatHora(s.horaSalida)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
