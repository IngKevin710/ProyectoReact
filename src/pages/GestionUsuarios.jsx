import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useAuthUser } from "../hooks/useAuthUser";
import { cerrarSesion } from "../services/historialService";
import {
  crearUsuario,
  obtenerUsuarios,
  actualizarUsuario,
  eliminarUsuario,
} from "../services/usuariosService";
import app from "../firebase";

const auth = getAuth(app);
const ROLES = ["Administrador", "Editor", "Visualizador"];
const FORM_VACIO = { nombre: "", apellido: "", email: "", telefono: "", rol: "Visualizador" };

const ROLE_STYLE = {
  Administrador: { bg: "#ede9fe", color: "#6d28d9", icon: "👑" },
  Editor:        { bg: "#dbeafe", color: "#1d4ed8", icon: "✏️" },
  Visualizador:  { bg: "#dcfce7", color: "#16a34a", icon: "👁️" },
};

const CSS = `
  @keyframes spin   { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideIn{ from { opacity:0; transform:scale(.96); } to { opacity:1; transform:scale(1); } }

  .gu-layout  { display:flex; height:100dvh; font-family:'Segoe UI',sans-serif; background:#f1f5f9; overflow:hidden; }
  .gu-sidebar { width:240px; min-width:240px; display:flex; flex-direction:column;
                background:#1a1035; padding:28px 12px 20px; box-sizing:border-box;
                box-shadow:4px 0 24px rgba(0,0,0,.15); position:relative; overflow:hidden; flex-shrink:0; }
  .gu-main    { flex:1; overflow-y:auto; padding:28px 32px; min-width:0; }
  .gu-topbar  { display:none; }

  .gu-stats      { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
  .gu-table-wrap { display:block; }
  .gu-cards-wrap { display:none; }
  .gu-form-grid  { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

  @media (max-width:768px) {
    .gu-layout  { flex-direction:column; }
    .gu-sidebar { display:none; }
    .gu-topbar  { display:flex; align-items:center; justify-content:space-between;
                  padding:14px 18px; background:#1a1035; flex-shrink:0;
                  box-shadow:0 2px 12px rgba(0,0,0,.2); z-index:10; }
    .gu-main    { padding:14px; height:0; flex:1; overflow-y:auto; }
    .gu-stats   { grid-template-columns:1fr 1fr; }
    .gu-table-wrap { display:none; }
    .gu-cards-wrap { display:flex; flex-direction:column; gap:12px; }
    .gu-header-row { flex-direction:column !important; align-items:stretch !important; }
    .gu-search-bar { flex-wrap:wrap; }
  }
  @media (max-width:480px) {
    .gu-stats     { grid-template-columns:1fr; }
    .gu-form-grid { grid-template-columns:1fr; }
  }

  .nav-btn { display:flex; align-items:center; gap:10px; width:100%; padding:10px 14px;
             border-radius:10px; background:transparent; border:none; color:rgba(255,255,255,.55);
             font-size:13px; font-weight:500; cursor:pointer; text-align:left; }
  .nav-btn:hover { background:rgba(255,255,255,.07); }
  .nav-btn.active { background:rgba(99,102,241,.22); border-left:3px solid #6366f1; color:#a5b4fc; font-weight:600; }

  .row-tr:hover { background:#f8fafc; }

  .action-btn { padding:5px 13px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; transition:all .15s; }
  .edit-btn   { border:1.5px solid #e2e8f0; background:#fff; color:#6366f1; }
  .edit-btn:hover { background:#ede9fe; border-color:#6366f1; }
  .del-btn    { border:1.5px solid #fecaca; background:#fff5f5; color:#ef4444; }
  .del-btn:hover  { background:#fee2e2; }
`;

function Avatar({ name, photo, size = 40 }) {
  const [err, setErr] = useState(false);
  const initial = (name || "?").charAt(0).toUpperCase();
  const base = { width: size, height: size, borderRadius: "50%", flexShrink: 0, border: "2px solid rgba(255,255,255,.2)" };
  if (photo && !err)
    return <img src={photo} alt="av" onError={() => setErr(true)} style={{ ...base, objectFit: "cover" }} />;
  return (
    <div style={{ ...base, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * .38, fontWeight: 700, color: "#fff" }}>
      {initial}
    </div>
  );
}

function Spinner() {
  return <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto" }} />;
}

function RoleBadge({ rol }) {
  const s = ROLE_STYLE[rol] || { bg: "#f1f5f9", color: "#334155", icon: "👤" };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {s.icon} {rol}
    </span>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(0,0,0,.07)", display: "flex", alignItems: "center", gap: 14, animation: "fadeUp .3s ease" }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>{value}</p>
        <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{label}</p>
      </div>
    </div>
  );
}

function ModalOverlay({ children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, backdropFilter: "blur(3px)", padding: 16 }}>
      <div style={{ animation: "slideIn .2s ease", width: "100%", display: "flex", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, required, error, children }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 5 }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
      {error && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#ef4444" }}>{error}</p>}
    </div>
  );
}

export default function GestionUsuarios() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthUser();

  const [usuarios, setUsuarios]         = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [busqueda, setBusqueda]         = useState("");
  const [form, setForm]                 = useState(FORM_VACIO);
  const [editandoId, setEditandoId]     = useState(null);
  const [mostrarForm, setMostrarForm]   = useState(false);
  const [guardando, setGuardando]       = useState(false);
  const [errForm, setErrForm]           = useState({});
  const [confirmElim, setConfirmElim]   = useState(null);
  const [eliminando, setEliminando]     = useState(false);
  const [toast, setToast]               = useState(null);
  const [menuAbierto, setMenuAbierto]   = useState(false);

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3200);
  };

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    try { setUsuarios(await obtenerUsuarios()); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarUsuarios(); }, [cargarUsuarios]);

  const handleLogout = async () => {
    await cerrarSesion();
    await signOut(auth);
    navigate("/");
  };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim())   e.nombre   = "Requerido";
    if (!form.apellido.trim()) e.apellido = "Requerido";
    if (!form.email.trim())    e.email    = "Requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Correo inválido";
    setErrForm(e);
    return !Object.keys(e).length;
  };

  const abrirCrear = () => { setForm(FORM_VACIO); setEditandoId(null); setErrForm({}); setMostrarForm(true); setMenuAbierto(false); };
  const abrirEditar = (u) => {
    setForm({ nombre: u.nombre || "", apellido: u.apellido || "", email: u.email || "", telefono: u.telefono || "", rol: u.rol || "Visualizador" });
    setEditandoId(u.id); setErrForm({}); setMostrarForm(true);
  };
  const cerrarForm = () => { setMostrarForm(false); setEditandoId(null); setErrForm({}); };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setGuardando(true);
    try {
      if (editandoId) { await actualizarUsuario(editandoId, form); mostrarToast("Usuario actualizado"); }
      else            { await crearUsuario(form);                   mostrarToast("Usuario creado"); }
      cerrarForm();
      await cargarUsuarios();
    } catch { mostrarToast("Error al guardar, intenta de nuevo", "err"); }
    finally { setGuardando(false); }
  };

  const handleEliminar = async () => {
    if (!confirmElim) return;
    setEliminando(true);
    try {
      await eliminarUsuario(confirmElim.id);
      mostrarToast("Usuario eliminado");
      setConfirmElim(null);
      await cargarUsuarios();
    } catch { mostrarToast("Error al eliminar", "err"); }
    finally { setEliminando(false); }
  };

  if (authLoading)
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
        <style>{CSS}</style><Spinner />
      </div>
    );

  const displayName = user?.displayName || "Usuario";
  const filtrados = usuarios.filter((u) => {
    const q = busqueda.toLowerCase().trim();
    return !q || `${u.nombre} ${u.apellido} ${u.email} ${u.rol}`.toLowerCase().includes(q);
  });

  const inputCss = (campo) => ({
    width: "100%", padding: "9px 12px", borderRadius: 8, boxSizing: "border-box",
    border: `1.5px solid ${errForm[campo] ? "#ef4444" : "#e2e8f0"}`,
    fontSize: 13, background: "#f8fafc", color: "#0f172a", outline: "none",
  });

  const countByRol = (r) => usuarios.filter((u) => u.rol === r).length;

  return (
    <div className="gu-layout">
      <style>{CSS}</style>

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 400, background: toast.tipo === "err" ? "#ef4444" : "#22c55e", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,.18)", animation: "fadeUp .2s" }}>
          {toast.tipo === "err" ? "✕ " : "✓ "}{toast.msg}
        </div>
      )}

      {/* ── MODAL ELIMINAR ── */}
      {confirmElim && (
        <ModalOverlay>
          <div style={{ background: "#fff", borderRadius: 20, padding: "36px 32px", maxWidth: 360, width: "100%", textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,.2)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px" }}>🗑️</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Eliminar usuario</h3>
            <p style={{ margin: "0 0 28px", fontSize: 13, color: "#64748b" }}>
              ¿Eliminar a <strong>{confirmElim.nombre} {confirmElim.apellido}</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmElim(null)} disabled={eliminando} style={{ flex: 1, padding: 11, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleEliminar} disabled={eliminando} style={{ flex: 1, padding: 11, borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontSize: 14, fontWeight: 600, cursor: eliminando ? "not-allowed" : "pointer", opacity: eliminando ? .7 : 1 }}>
                {eliminando ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ── MODAL FORMULARIO ── */}
      {mostrarForm && (
        <ModalOverlay>
          <div style={{ background: "#fff", borderRadius: 20, padding: "32px", maxWidth: 500, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,.2)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  {editandoId ? "Editar usuario" : "Nuevo usuario"}
                </h2>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>
                  {editandoId ? "Modifica los datos del usuario" : "Completa el formulario para crear"}
                </p>
              </div>
              <button onClick={cerrarForm} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            <form onSubmit={handleGuardar} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="gu-form-grid">
                <FormField label="Nombre" required error={errForm.nombre}>
                  <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" style={inputCss("nombre")} />
                </FormField>
                <FormField label="Apellido" required error={errForm.apellido}>
                  <input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} placeholder="Apellido" style={inputCss("apellido")} />
                </FormField>
              </div>
              <FormField label="Correo electrónico" required error={errForm.email}>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" style={inputCss("email")} />
              </FormField>
              <FormField label="Teléfono">
                <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Opcional" style={inputCss("telefono")} />
              </FormField>
              <FormField label="Rol">
                <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} style={{ ...inputCss("rol"), cursor: "pointer" }}>
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </FormField>

              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button type="button" onClick={cerrarForm} disabled={guardando} style={{ flex: 1, padding: 11, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
                <button type="submit" disabled={guardando} style={{ flex: 1, padding: 11, borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: guardando ? "not-allowed" : "pointer", opacity: guardando ? .7 : 1 }}>
                  {guardando ? "Guardando..." : editandoId ? "Actualizar" : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* ── MENÚ MÓVIL ── */}
      {menuAbierto && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200 }} onClick={() => setMenuAbierto(false)}>
          <div style={{ position: "absolute", top: 56, left: 0, right: 0, background: "#1a1035", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,.3)" }} onClick={(e) => e.stopPropagation()}>
            <button className="nav-btn" onClick={() => { navigate("/dashboard"); setMenuAbierto(false); }}><span>🏠</span> Dashboard</button>
            <button className="nav-btn" onClick={() => { navigate("/perfil"); setMenuAbierto(false); }}><span>🔐</span> Historial de sesiones</button>
            <button className="nav-btn active"><span>👥</span> Gestión de usuarios</button>
            <button className="nav-btn" onClick={() => { navigate("/productos"); setMenuAbierto(false); }}><span>📦</span> Gestión de productos</button>
            <button onClick={handleLogout} style={{ marginTop: 8, padding: "10px 14px", borderRadius: 10, border: "none", background: "rgba(239,68,68,.18)", color: "#f87171", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cerrar sesión</button>
          </div>
        </div>
      )}

      {/* ── TOP BAR MÓVIL ── */}
      <div className="gu-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={displayName} photo={user?.photoURL} size={34} />
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>👥 Usuarios</span>
        </div>
        <button onClick={() => setMenuAbierto(!menuAbierto)} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 8, width: 36, height: 36, cursor: "pointer", fontSize: 18, color: "#fff" }}>☰</button>
      </div>

      {/* ══ SIDEBAR ══ */}
      <aside className="gu-sidebar">
        <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", top: -50, right: -50, background: "rgba(99,102,241,.1)", pointerEvents: "none" }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20, zIndex: 1 }}>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <Avatar name={displayName} photo={user?.photoURL} size={72} />
            <span style={{ position: "absolute", bottom: 2, right: 2, width: 13, height: 13, background: "#22c55e", borderRadius: "50%", border: "2px solid #1a1035" }} />
          </div>
          <h3 style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "#fff", textAlign: "center", wordBreak: "break-word" }}>{displayName}</h3>
          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,.4)", textAlign: "center", wordBreak: "break-all", lineHeight: 1.4 }}>{user?.email}</p>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,.08)", marginBottom: 12, zIndex: 1 }} />

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, zIndex: 1 }}>
          <button className="nav-btn" onClick={() => navigate("/dashboard")}><span style={{ fontSize: 16 }}>🏠</span> Dashboard</button>
          <button className="nav-btn" onClick={() => navigate("/perfil")}><span style={{ fontSize: 16 }}>🔐</span> Historial de sesiones</button>
          <button className="nav-btn active"><span style={{ fontSize: 16 }}>👥</span> Gestión de usuarios</button>
          <button className="nav-btn" onClick={() => navigate("/productos")}><span style={{ fontSize: 16 }}>📦</span> Gestión de productos</button>
        </nav>

        <div style={{ flex: 1 }} />

        <button onClick={handleLogout} style={{ width: "100%", padding: 11, borderRadius: 10, border: "none", background: "rgba(239,68,68,.18)", color: "#f87171", fontSize: 13, fontWeight: 600, cursor: "pointer", zIndex: 1 }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,.32)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239,68,68,.18)"}>
          Cerrar sesión
        </button>
      </aside>

      {/* ══ CONTENIDO ══ */}
      <main className="gu-main">

        {/* Encabezado */}
        <div className="gu-header-row" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Gestión de usuarios</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Administra los usuarios del sistema</p>
          </div>
          <button onClick={abrirCrear} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,.4)", whiteSpace: "nowrap" }}>
            + Nuevo usuario
          </button>
        </div>

        {/* Stats */}
        <div className="gu-stats">
          <StatCard label="Total usuarios"    value={usuarios.length}               icon="👥" color="#6366f1" />
          <StatCard label="Administradores"   value={countByRol("Administrador")}   icon="👑" color="#8b5cf6" />
          <StatCard label="Editores"          value={countByRol("Editor")}          icon="✏️" color="#3b82f6" />
        </div>

        {/* Buscador */}
        <div className="gu-search-bar" style={{ background: "#fff", borderRadius: 12, padding: "12px 18px", marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,.06)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none" }}>🔍</span>
            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre, correo o rol..."
              style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, background: "#f8fafc", color: "#0f172a", outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => e.target.style.borderColor = "#6366f1"}
              onBlur={(e)  => e.target.style.borderColor = "#e2e8f0"} />
          </div>
          <span style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>{filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}</span>
          {busqueda && <button onClick={() => setBusqueda("")} style={{ padding: "6px 10px", borderRadius: 20, border: "1px solid #e2e8f0", background: "#fff", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>✕</button>}
        </div>

        {cargando ? (
          <div style={{ padding: "4rem", textAlign: "center" }}><Spinner /></div>
        ) : filtrados.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, padding: "3rem", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,.07)" }}>
            <p style={{ fontSize: 40, marginBottom: 8 }}>👥</p>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>
              {usuarios.length === 0 ? "No hay usuarios registrados. ¡Crea el primero!" : `Sin resultados para "${busqueda}".`}
            </p>
          </div>
        ) : (
          <>
            {/* ── TABLA (desktop) ── */}
            <div className="gu-table-wrap" style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,.07)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    {["Usuario", "Correo", "Teléfono", "Rol", "Acciones"].map((h) => (
                      <th key={h} style={{ padding: "13px 18px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textAlign: h === "Acciones" ? "center" : "left", textTransform: "uppercase", letterSpacing: ".5px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((u, i) => (
                    <tr key={u.id} className="row-tr" style={{ borderBottom: i < filtrados.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                            {(u.nombre || "?").charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{u.nombre} {u.apellido}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 18px", fontSize: 13, color: "#475569" }}>{u.email || "—"}</td>
                      <td style={{ padding: "14px 18px", fontSize: 13, color: "#475569" }}>{u.telefono || "—"}</td>
                      <td style={{ padding: "14px 18px" }}><RoleBadge rol={u.rol || "—"} /></td>
                      <td style={{ padding: "14px 18px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                          <button className="action-btn edit-btn" onClick={() => abrirEditar(u)}>Editar</button>
                          <button className="action-btn del-btn"  onClick={() => setConfirmElim(u)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── CARDS (móvil) ── */}
            <div className="gu-cards-wrap">
              {filtrados.map((u) => (
                <div key={u.id} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(0,0,0,.07)", animation: "fadeUp .25s ease" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {(u.nombre || "?").charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{u.nombre} {u.apellido}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email || "—"}</p>
                    </div>
                    <div style={{ marginLeft: "auto", flexShrink: 0 }}><RoleBadge rol={u.rol || "—"} /></div>
                  </div>
                  {u.telefono && (
                    <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b" }}>📞 {u.telefono}</p>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="action-btn edit-btn" style={{ flex: 1 }} onClick={() => abrirEditar(u)}>✏️ Editar</button>
                    <button className="action-btn del-btn"  style={{ flex: 1 }} onClick={() => setConfirmElim(u)}>🗑️ Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
