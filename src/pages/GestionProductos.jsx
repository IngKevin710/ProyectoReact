import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useAuthUser } from "../hooks/useAuthUser";
import { cerrarSesion } from "../services/historialService";
import {
  crearProducto,
  obtenerProductos,
  actualizarProducto,
  eliminarProducto,
} from "../services/productosService";
import app from "../firebase";

const auth = getAuth(app);

const CATEGORIAS = ["Electrónica", "Ropa", "Alimentos", "Hogar", "Deportes", "Otros"];
const ESTADOS    = ["Activo", "Inactivo"];
const FORM_VACIO = { nombre: "", descripcion: "", precio: "", stock: "", categoria: "Electrónica", estado: "Activo" };

const CATEGORIA_STYLE = {
  "Electrónica": { bg: "#dbeafe", color: "#1d4ed8", icon: "💻" },
  "Ropa":        { bg: "#fce7f3", color: "#be185d", icon: "👕" },
  "Alimentos":   { bg: "#dcfce7", color: "#15803d", icon: "🍎" },
  "Hogar":       { bg: "#fef3c7", color: "#b45309", icon: "🏠" },
  "Deportes":    { bg: "#e0e7ff", color: "#4338ca", icon: "⚽" },
  "Otros":       { bg: "#f1f5f9", color: "#475569", icon: "📦" },
};

const formatPrecio = (v) =>
  `$${Number(v || 0).toLocaleString("es-CO")}`;

const CSS = `
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideIn { from { opacity:0; transform:scale(.96); } to { opacity:1; transform:scale(1); } }

  .gp-layout  { display:flex; height:100dvh; font-family:'Segoe UI',sans-serif; background:#f1f5f9; overflow:hidden; }
  .gp-sidebar { width:240px; min-width:240px; display:flex; flex-direction:column;
                background:#1a1035; padding:28px 12px 20px; box-sizing:border-box;
                box-shadow:4px 0 24px rgba(0,0,0,.15); position:relative; overflow:hidden; flex-shrink:0; }
  .gp-main    { flex:1; overflow-y:auto; padding:28px 32px; min-width:0; }
  .gp-topbar  { display:none; }

  .gp-stats      { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
  .gp-table-wrap { display:block; }
  .gp-cards-wrap { display:none; }
  .gp-form-grid  { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

  @media (max-width:768px) {
    .gp-layout  { flex-direction:column; }
    .gp-sidebar { display:none; }
    .gp-topbar  { display:flex; align-items:center; justify-content:space-between;
                  padding:14px 18px; background:#1a1035; flex-shrink:0;
                  box-shadow:0 2px 12px rgba(0,0,0,.2); z-index:10; }
    .gp-main    { padding:14px; height:0; flex:1; overflow-y:auto; }
    .gp-stats   { grid-template-columns:1fr 1fr; }
    .gp-table-wrap { display:none; }
    .gp-cards-wrap { display:flex; flex-direction:column; gap:12px; }
    .gp-header-row { flex-direction:column !important; align-items:stretch !important; }
    .gp-search-bar { flex-wrap:wrap; }
  }
  @media (max-width:480px) {
    .gp-stats     { grid-template-columns:1fr; }
    .gp-form-grid { grid-template-columns:1fr; }
  }

  .gp-nav-btn { display:flex; align-items:center; gap:10px; width:100%; padding:10px 14px;
                border-radius:10px; background:transparent; border:none; color:rgba(255,255,255,.55);
                font-size:13px; font-weight:500; cursor:pointer; text-align:left; }
  .gp-nav-btn:hover { background:rgba(255,255,255,.07); }
  .gp-nav-active { background:rgba(99,102,241,.22) !important; border-left:3px solid #6366f1;
                   color:#a5b4fc !important; font-weight:600 !important; }

  .gp-row:hover { background:#f8fafc; }

  .gp-action-btn { padding:5px 13px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; transition:all .15s; }
  .gp-edit-btn   { border:1.5px solid #e2e8f0; background:#fff; color:#6366f1; }
  .gp-edit-btn:hover { background:#ede9fe; border-color:#6366f1; }
  .gp-del-btn    { border:1.5px solid #fecaca; background:#fff5f5; color:#ef4444; }
  .gp-del-btn:hover  { background:#fee2e2; }
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

function Spinner() {
  return <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto" }} />;
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

function ModalOverlay({ children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(3px)", padding: 16 }}>
      <div style={{ animation: "slideIn .2s ease", width: "100%", display: "flex", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

function CategoriaBadge({ categoria }) {
  const s = CATEGORIA_STYLE[categoria] ?? CATEGORIA_STYLE["Otros"];
  return (
    <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
      {s.icon} {categoria}
    </span>
  );
}

function EstadoBadge({ estado }) {
  const activo = estado === "Activo";
  return (
    <span style={{ background: activo ? "#dcfce7" : "#f1f5f9", color: activo ? "#16a34a" : "#64748b", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {activo ? "🟢 Activo" : "⚫ Inactivo"}
    </span>
  );
}

export default function GestionProductos() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthUser();

  const [productos, setProductos]   = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [busqueda, setBusqueda]     = useState("");
  const [filtroCat, setFiltroCat]   = useState("");
  const [form, setForm]             = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando]   = useState(false);
  const [errForm, setErrForm]       = useState({});
  const [confirmElim, setConfirmElim] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [toast, setToast]           = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = async () => {
    await cerrarSesion();
    await signOut(auth);
    navigate("/");
  };

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3200);
  };

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    try {
      const data = await obtenerProductos();
      setProductos(data);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarProductos(); }, [cargarProductos]);

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio.";
    else if (form.nombre.trim().length < 2) e.nombre = "Mínimo 2 caracteres.";
    if (form.precio === "" || form.precio === null) e.precio = "El precio es obligatorio.";
    else if (isNaN(form.precio) || Number(form.precio) < 0) e.precio = "Precio inválido (número ≥ 0).";
    if (form.stock === "" || form.stock === null) e.stock = "El stock es obligatorio.";
    else if (isNaN(form.stock) || Number(form.stock) < 0 || !Number.isInteger(Number(form.stock))) e.stock = "Stock inválido (entero ≥ 0).";
    return e;
  };

  const inputCss = (campo) => ({
    width: "100%", padding: "9px 12px", borderRadius: 8, boxSizing: "border-box",
    border: `1.5px solid ${errForm[campo] ? "#ef4444" : "#e2e8f0"}`,
    fontSize: 13, background: "#f8fafc", color: "#0f172a", outline: "none",
  });

  const abrirNuevo = () => {
    setForm(FORM_VACIO);
    setEditandoId(null);
    setErrForm({});
    setMostrarForm(true);
  };

  const abrirEditar = (p) => {
    setForm({
      nombre: p.nombre || "",
      descripcion: p.descripcion || "",
      precio: p.precio ?? "",
      stock: p.stock ?? "",
      categoria: p.categoria || "Electrónica",
      estado: p.estado || "Activo",
    });
    setEditandoId(p.id);
    setErrForm({});
    setMostrarForm(true);
  };

  const cerrarForm = () => {
    setMostrarForm(false);
    setEditandoId(null);
    setErrForm({});
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    const errores = validar();
    if (Object.keys(errores).length > 0) { setErrForm(errores); return; }
    setGuardando(true);
    try {
      const datos = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precio: Number(form.precio),
        stock: Number(form.stock),
        categoria: form.categoria,
        estado: form.estado,
      };
      if (editandoId) {
        await actualizarProducto(editandoId, datos);
        mostrarToast("Producto actualizado");
      } else {
        await crearProducto(datos);
        mostrarToast("Producto creado");
      }
      cerrarForm();
      await cargarProductos();
    } catch {
      mostrarToast("Error al guardar, intenta de nuevo.", "err");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirmElim) return;
    setEliminando(true);
    try {
      await eliminarProducto(confirmElim.id);
      mostrarToast("Producto eliminado");
      setConfirmElim(null);
      await cargarProductos();
    } catch {
      mostrarToast("Error al eliminar, intenta de nuevo.", "err");
    } finally {
      setEliminando(false);
    }
  };

  if (authLoading) return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
      <style>{CSS}</style>
      <Spinner />
    </div>
  );

  const displayName = user?.displayName || "Usuario";
  const stockTotal  = productos.reduce((acc, p) => acc + Number(p.stock || 0), 0);
  const activos     = productos.filter((p) => p.estado === "Activo").length;

  const filtrados = productos.filter((p) => {
    const q = busqueda.toLowerCase().trim();
    const matchQ = !q || p.nombre?.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q);
    const matchCat = !filtroCat || p.categoria === filtroCat;
    return matchQ && matchCat;
  });

  return (
    <div className="gp-layout">
      <style>{CSS}</style>

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 400, background: toast.tipo === "err" ? "#ef4444" : "#22c55e", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,.18)", animation: "fadeUp .2s" }}>
          {toast.tipo === "err" ? "✕ " : "✓ "}{toast.msg}
        </div>
      )}

      {/* ── MODAL FORMULARIO ── */}
      {mostrarForm && (
        <ModalOverlay>
          <div style={{ background: "#fff", borderRadius: 20, padding: "32px", maxWidth: 520, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,.2)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  {editandoId ? "Editar producto" : "Nuevo producto"}
                </h2>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>
                  {editandoId ? "Modifica los datos del producto" : "Completa el formulario para crear"}
                </p>
              </div>
              <button onClick={cerrarForm} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            <form onSubmit={handleGuardar} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <FormField label="Nombre del producto" required error={errForm.nombre}>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Laptop HP 15"
                  style={inputCss("nombre")}
                  onFocus={(e) => !errForm.nombre && (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e)  => !errForm.nombre && (e.target.style.borderColor = "#e2e8f0")}
                />
              </FormField>

              <div className="gp-form-grid">
                <FormField label="Precio (COP)" required error={errForm.precio}>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    placeholder="0"
                    style={inputCss("precio")}
                    onFocus={(e) => !errForm.precio && (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e)  => !errForm.precio && (e.target.style.borderColor = "#e2e8f0")}
                  />
                </FormField>
                <FormField label="Stock (unidades)" required error={errForm.stock}>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="0"
                    style={inputCss("stock")}
                    onFocus={(e) => !errForm.stock && (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e)  => !errForm.stock && (e.target.style.borderColor = "#e2e8f0")}
                  />
                </FormField>
              </div>

              <div className="gp-form-grid">
                <FormField label="Categoría" required>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    style={{ ...inputCss("categoria"), cursor: "pointer" }}
                  >
                    {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </FormField>
                <FormField label="Estado" required>
                  <select
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                    style={{ ...inputCss("estado"), cursor: "pointer" }}
                  >
                    {ESTADOS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </FormField>
              </div>

              <FormField label="Descripción">
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Descripción opcional del producto..."
                  rows={3}
                  style={{ ...inputCss("descripcion"), resize: "vertical", lineHeight: 1.5 }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")}
                />
              </FormField>

              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button type="button" onClick={cerrarForm} disabled={guardando}
                  style={{ flex: 1, padding: 11, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}
                  style={{ flex: 1, padding: 11, borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: guardando ? "not-allowed" : "pointer", opacity: guardando ? 0.7 : 1 }}>
                  {guardando ? "Guardando..." : editandoId ? "Actualizar" : "Crear producto"}
                </button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* ── MODAL CONFIRMAR ELIMINACIÓN ── */}
      {confirmElim && (
        <ModalOverlay>
          <div style={{ background: "#fff", borderRadius: 20, padding: "36px 32px", maxWidth: 360, width: "100%", textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,.2)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px" }}>🗑️</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Eliminar producto</h3>
            <p style={{ margin: "0 0 28px", fontSize: 13, color: "#64748b" }}>
              ¿Eliminar <strong>{confirmElim.nombre}</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmElim(null)} disabled={eliminando}
                style={{ flex: 1, padding: 11, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleEliminar} disabled={eliminando}
                style={{ flex: 1, padding: 11, borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontSize: 14, fontWeight: 600, cursor: eliminando ? "not-allowed" : "pointer", opacity: eliminando ? 0.7 : 1 }}>
                {eliminando ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ── MENÚ MÓVIL ── */}
      {menuAbierto && (
        <div style={{ position: "fixed", inset: 0, zIndex: 150 }} onClick={() => setMenuAbierto(false)}>
          <div style={{ position: "absolute", top: 56, left: 0, right: 0, background: "#1a1035", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,.3)" }} onClick={(e) => e.stopPropagation()}>
            <button className="gp-nav-btn" onClick={() => { navigate("/dashboard"); setMenuAbierto(false); }}><span>🏠</span> Dashboard</button>
            <button className="gp-nav-btn" onClick={() => { navigate("/perfil"); setMenuAbierto(false); }}><span>🔐</span> Historial de sesiones</button>
            <button className="gp-nav-btn" onClick={() => { navigate("/usuarios"); setMenuAbierto(false); }}><span>👥</span> Gestión de usuarios</button>
            <button className="gp-nav-btn gp-nav-active"><span>📦</span> Gestión de productos</button>
            <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "4px 0" }} />
            <button onClick={handleLogout} style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: "rgba(239,68,68,.18)", color: "#f87171", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cerrar sesión</button>
          </div>
        </div>
      )}

      {/* ── TOP BAR MÓVIL ── */}
      <div className="gp-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={displayName} photo={user?.photoURL} size={34} />
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>📦 Productos</span>
        </div>
        <button onClick={() => setMenuAbierto(!menuAbierto)} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 8, width: 36, height: 36, cursor: "pointer", fontSize: 18, color: "#fff" }}>☰</button>
      </div>

      {/* ══ SIDEBAR ══ */}
      <aside className="gp-sidebar">
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
          <button className="gp-nav-btn" onClick={() => navigate("/dashboard")}><span style={{ fontSize: 16 }}>🏠</span> Dashboard</button>
          <button className="gp-nav-btn" onClick={() => navigate("/perfil")}><span style={{ fontSize: 16 }}>🔐</span> Historial de sesiones</button>
          <button className="gp-nav-btn" onClick={() => navigate("/usuarios")}><span style={{ fontSize: 16 }}>👥</span> Gestión de usuarios</button>
          <button className="gp-nav-btn gp-nav-active"><span style={{ fontSize: 16 }}>📦</span> Gestión de productos</button>
        </nav>

        <div style={{ flex: 1 }} />

        <button onClick={handleLogout}
          style={{ width: "100%", padding: 11, borderRadius: 10, border: "none", background: "rgba(239,68,68,.18)", color: "#f87171", fontSize: 13, fontWeight: 600, cursor: "pointer", zIndex: 1 }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,.32)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,.18)")}>
          Cerrar sesión
        </button>
      </aside>

      {/* ══ CONTENIDO PRINCIPAL ══ */}
      <main className="gp-main">

        {/* Encabezado */}
        <div className="gp-header-row" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Gestión de productos</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Administra el catálogo de productos del sistema</p>
          </div>
          <button onClick={abrirNuevo}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,.4)", whiteSpace: "nowrap", flexShrink: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = ".88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
            + Nuevo producto
          </button>
        </div>

        {/* Stats */}
        <div className="gp-stats">
          <StatCard label="Total productos"  value={productos.length} icon="📦" color="#6366f1" />
          <StatCard label="Activos"          value={activos}          icon="🟢" color="#22c55e" />
          <StatCard label="Unidades en stock" value={stockTotal}      icon="📊" color="#8b5cf6" />
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="gp-search-bar" style={{ background: "#fff", borderRadius: 12, padding: "14px 20px", marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,.06)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none" }}>🔍</span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o descripción..."
              style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, background: "#f8fafc", color: "#0f172a", outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIAS.map((cat) => (
              <button key={cat} onClick={() => setFiltroCat(filtroCat === cat ? "" : cat)}
                style={{ padding: "5px 11px", borderRadius: 20, border: `1.5px solid ${filtroCat === cat ? "#6366f1" : "#e2e8f0"}`, background: filtroCat === cat ? "#ede9fe" : "#fff", color: filtroCat === cat ? "#6366f1" : "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {CATEGORIA_STYLE[cat]?.icon} {cat}
              </button>
            ))}
            {(busqueda || filtroCat) && (
              <button onClick={() => { setBusqueda(""); setFiltroCat(""); }}
                style={{ padding: "5px 10px", borderRadius: 20, border: "1px solid #e2e8f0", background: "#fff", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>
                ✕ Limpiar
              </button>
            )}
          </div>
          <span style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>
            {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Contenido */}
        {cargando ? (
          <div style={{ padding: "4rem", textAlign: "center" }}><Spinner /></div>
        ) : filtrados.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, padding: "3rem", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,.07)" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>📦</p>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 16 }}>
              {productos.length === 0 ? "No hay productos registrados aún." : `Sin resultados para "${busqueda || filtroCat}".`}
            </p>
            {productos.length === 0 && (
              <button onClick={abrirNuevo}
                style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                + Crear primer producto
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── TABLA (desktop) ── */}
            <div className="gp-table-wrap" style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,.07)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    {["Producto", "Categoría", "Precio", "Stock", "Estado", "Acciones"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textAlign: h === "Acciones" ? "center" : "left", textTransform: "uppercase", letterSpacing: ".5px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((p, i) => (
                    <tr key={p.id} className="gp-row" style={{ borderBottom: i < filtrados.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: (CATEGORIA_STYLE[p.categoria] ?? CATEGORIA_STYLE["Otros"]).bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
                            {(CATEGORIA_STYLE[p.categoria] ?? CATEGORIA_STYLE["Otros"]).icon}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{p.nombre}</p>
                            {p.descripcion && <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{p.descripcion}</p>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}><CategoriaBadge categoria={p.categoria} /></td>
                      <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{formatPrecio(p.precio)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ background: p.stock > 0 ? "#f0fdf4" : "#fef2f2", color: p.stock > 0 ? "#16a34a" : "#dc2626", padding: "3px 10px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                          {p.stock}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}><EstadoBadge estado={p.estado} /></td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                          <button className="gp-action-btn gp-edit-btn" onClick={() => abrirEditar(p)}>Editar</button>
                          <button className="gp-action-btn gp-del-btn"  onClick={() => setConfirmElim(p)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── CARDS (móvil) ── */}
            <div className="gp-cards-wrap">
              {filtrados.map((p) => (
                <div key={p.id} style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", boxShadow: "0 2px 10px rgba(0,0,0,.07)", animation: "fadeUp .25s ease" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: (CATEGORIA_STYLE[p.categoria] ?? CATEGORIA_STYLE["Otros"]).bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                        {(CATEGORIA_STYLE[p.categoria] ?? CATEGORIA_STYLE["Otros"]).icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nombre}</p>
                        <CategoriaBadge categoria={p.categoria} />
                      </div>
                    </div>
                    <EstadoBadge estado={p.estado} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 10px" }}>
                      <p style={{ margin: "0 0 2px", fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Precio</p>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{formatPrecio(p.precio)}</p>
                    </div>
                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 10px" }}>
                      <p style={{ margin: "0 0 2px", fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Stock</p>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: p.stock > 0 ? "#16a34a" : "#dc2626" }}>{p.stock} uds.</p>
                    </div>
                  </div>
                  {p.descripcion && (
                    <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>{p.descripcion}</p>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="gp-action-btn gp-edit-btn" style={{ flex: 1 }} onClick={() => abrirEditar(p)}>Editar</button>
                    <button className="gp-action-btn gp-del-btn"  style={{ flex: 1 }} onClick={() => setConfirmElim(p)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <div style={{ height: 24 }} />
      </main>
    </div>
  );
}
