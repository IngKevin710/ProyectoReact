import { useState, useEffect, useCallback } from "react";
import { useAuthUser } from "../hooks/useAuthUser";
import Sidebar from "../components/Sidebar";
import {
  crearProveedor,
  obtenerProveedores,
  actualizarProveedor,
  eliminarProveedor,
} from "../services/proveedoresService";

const ESTADOS    = ["Activo", "Inactivo"];
const FORM_VACIO = { nombre: "", nit: "", contacto: "", email: "", telefono: "", direccion: "", estado: "Activo" };

const REGEX_EMAIL    = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REGEX_NIT      = /^\d{5,15}(-\d)?$/;
const REGEX_TELEFONO = /^\+?\d{7,15}$/;

const CSS = `
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideIn { from { opacity:0; transform:scale(.96); } to { opacity:1; transform:scale(1); } }

  .gv-layout  { display:flex; height:100dvh; font-family:'Segoe UI',sans-serif; background:#f1f5f9; overflow:hidden; }
  .gv-main    { flex:1; overflow-y:auto; padding:28px 32px; min-width:0; }

  .gv-stats      { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
  .gv-table-wrap { display:block; }
  .gv-cards-wrap { display:none; }
  .gv-form-grid  { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

  @media (max-width:768px) {
    .gv-layout  { flex-direction:column; }
    .gv-main    { padding:14px; height:0; flex:1; overflow-y:auto; }
    .gv-stats   { grid-template-columns:1fr 1fr; }
    .gv-table-wrap { display:none; }
    .gv-cards-wrap { display:flex; flex-direction:column; gap:12px; }
    .gv-header-row { flex-direction:column !important; align-items:stretch !important; }
    .gv-search-bar { flex-wrap:wrap; }
  }
  @media (max-width:480px) {
    .gv-stats     { grid-template-columns:1fr; }
    .gv-form-grid { grid-template-columns:1fr; }
  }

  .gv-row:hover { background:#f8fafc; }

  .gv-action-btn { padding:5px 13px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; transition:all .15s; }
  .gv-edit-btn   { border:1.5px solid #e2e8f0; background:#fff; color:#6366f1; }
  .gv-edit-btn:hover { background:#ede9fe; border-color:#6366f1; }
  .gv-del-btn    { border:1.5px solid #fecaca; background:#fff5f5; color:#ef4444; }
  .gv-del-btn:hover  { background:#fee2e2; }
`;

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

function EstadoBadge({ estado }) {
  const activo = estado !== "Inactivo";
  return (
    <span style={{ background: activo ? "#dcfce7" : "#f1f5f9", color: activo ? "#16a34a" : "#64748b", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
      {activo ? "🟢 Activo" : "⚫ Inactivo"}
    </span>
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

export default function GestionProveedores() {
  const { loading: authLoading } = useAuthUser();

  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [busqueda, setBusqueda]       = useState("");
  const [form, setForm]               = useState(FORM_VACIO);
  const [editandoId, setEditandoId]   = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando]     = useState(false);
  const [errForm, setErrForm]         = useState({});
  const [confirmElim, setConfirmElim] = useState(null);
  const [eliminando, setEliminando]   = useState(false);
  const [toast, setToast]             = useState(null);

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3200);
  };

  const cargarProveedores = useCallback(async () => {
    setCargando(true);
    try {
      const data = await obtenerProveedores();
      setProveedores(data);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarProveedores(); }, [cargarProveedores]);

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio.";
    else if (form.nombre.trim().length < 2) e.nombre = "Mínimo 2 caracteres.";
    if (!form.nit.trim()) e.nit = "El NIT es obligatorio.";
    else if (!REGEX_NIT.test(form.nit.trim())) e.nit = "NIT inválido (ej: 900123456-7).";
    if (!form.contacto.trim()) e.contacto = "La persona de contacto es obligatoria.";
    else if (form.contacto.trim().length < 2) e.contacto = "Mínimo 2 caracteres.";
    if (!form.email.trim()) e.email = "El email es obligatorio.";
    else if (!REGEX_EMAIL.test(form.email.trim())) e.email = "Email inválido (ej: contacto@empresa.com).";
    if (!form.telefono.trim()) e.telefono = "El teléfono es obligatorio.";
    else if (!REGEX_TELEFONO.test(form.telefono.trim().replace(/[\s-]/g, ""))) e.telefono = "Teléfono inválido (7 a 15 dígitos).";
    if (!form.direccion.trim()) e.direccion = "La dirección es obligatoria.";
    else if (form.direccion.trim().length < 5) e.direccion = "Mínimo 5 caracteres.";
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
      nit: p.nit || "",
      contacto: p.contacto || "",
      email: p.email || "",
      telefono: p.telefono || "",
      direccion: p.direccion || "",
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
        nit: form.nit.trim(),
        contacto: form.contacto.trim(),
        email: form.email.trim().toLowerCase(),
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim(),
        estado: form.estado,
      };
      if (editandoId) {
        await actualizarProveedor(editandoId, datos);
        mostrarToast("Proveedor actualizado");
      } else {
        await crearProveedor(datos);
        mostrarToast("Proveedor creado");
      }
      cerrarForm();
      await cargarProveedores();
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
      await eliminarProveedor(confirmElim.id);
      mostrarToast("Proveedor eliminado");
      setConfirmElim(null);
      await cargarProveedores();
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

  const activos   = proveedores.filter((p) => p.estado !== "Inactivo").length;
  const inactivos = proveedores.length - activos;

  const filtrados = proveedores.filter((p) => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return [p.nombre, p.nit, p.contacto, p.email, p.telefono, p.direccion, p.estado]
      .some((campo) => String(campo ?? "").toLowerCase().includes(q));
  });

  return (
    <div className="gv-layout">
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
                  {editandoId ? "Editar proveedor" : "Nuevo proveedor"}
                </h2>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>
                  {editandoId ? "Modifica los datos del proveedor" : "Completa el formulario para crear"}
                </p>
              </div>
              <button onClick={cerrarForm} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            <form onSubmit={handleGuardar} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <FormField label="Nombre del proveedor" required error={errForm.nombre}>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Distribuciones El Norte S.A.S."
                  style={inputCss("nombre")}
                  onFocus={(e) => !errForm.nombre && (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e)  => !errForm.nombre && (e.target.style.borderColor = "#e2e8f0")}
                />
              </FormField>

              <div className="gv-form-grid">
                <FormField label="NIT" required error={errForm.nit}>
                  <input
                    value={form.nit}
                    onChange={(e) => setForm({ ...form, nit: e.target.value })}
                    placeholder="900123456-7"
                    style={inputCss("nit")}
                    onFocus={(e) => !errForm.nit && (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e)  => !errForm.nit && (e.target.style.borderColor = "#e2e8f0")}
                  />
                </FormField>
                <FormField label="Persona de contacto" required error={errForm.contacto}>
                  <input
                    value={form.contacto}
                    onChange={(e) => setForm({ ...form, contacto: e.target.value })}
                    placeholder="Ej: María Gómez"
                    style={inputCss("contacto")}
                    onFocus={(e) => !errForm.contacto && (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e)  => !errForm.contacto && (e.target.style.borderColor = "#e2e8f0")}
                  />
                </FormField>
              </div>

              <div className="gv-form-grid">
                <FormField label="Email" required error={errForm.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="contacto@empresa.com"
                    style={inputCss("email")}
                    onFocus={(e) => !errForm.email && (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e)  => !errForm.email && (e.target.style.borderColor = "#e2e8f0")}
                  />
                </FormField>
                <FormField label="Teléfono" required error={errForm.telefono}>
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder="3001234567"
                    style={inputCss("telefono")}
                    onFocus={(e) => !errForm.telefono && (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e)  => !errForm.telefono && (e.target.style.borderColor = "#e2e8f0")}
                  />
                </FormField>
              </div>

              <div className="gv-form-grid">
                <FormField label="Dirección" required error={errForm.direccion}>
                  <input
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                    placeholder="Ej: Calle 10 # 25-30, Ocaña"
                    style={inputCss("direccion")}
                    onFocus={(e) => !errForm.direccion && (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e)  => !errForm.direccion && (e.target.style.borderColor = "#e2e8f0")}
                  />
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

              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button type="button" onClick={cerrarForm} disabled={guardando}
                  style={{ flex: 1, padding: 11, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}
                  style={{ flex: 1, padding: 11, borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: guardando ? "not-allowed" : "pointer", opacity: guardando ? 0.7 : 1 }}>
                  {guardando ? "Guardando..." : editandoId ? "Actualizar" : "Crear proveedor"}
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
            <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Eliminar proveedor</h3>
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

      <Sidebar />

      {/* ══ CONTENIDO PRINCIPAL ══ */}
      <main className="gv-main">

        {/* Encabezado */}
        <div className="gv-header-row" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Gestión de proveedores</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Administra el directorio de proveedores de la organización</p>
          </div>
          <button onClick={abrirNuevo}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,.4)", whiteSpace: "nowrap", flexShrink: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = ".88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
            + Nuevo proveedor
          </button>
        </div>

        {/* Stats */}
        <div className="gv-stats">
          <StatCard label="Total proveedores" value={proveedores.length} icon="🚚" color="#6366f1" />
          <StatCard label="Activos"           value={activos}            icon="🟢" color="#22c55e" />
          <StatCard label="Inactivos"         value={inactivos}          icon="⚫" color="#64748b" />
        </div>

        {/* Barra de búsqueda */}
        <div className="gv-search-bar" style={{ background: "#fff", borderRadius: 12, padding: "14px 20px", marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,.06)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none" }}>🔍</span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, NIT, contacto, email, teléfono o dirección..."
              style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, background: "#f8fafc", color: "#0f172a", outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>
          {busqueda && (
            <button onClick={() => setBusqueda("")}
              style={{ padding: "5px 10px", borderRadius: 20, border: "1px solid #e2e8f0", background: "#fff", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>
              ✕ Limpiar
            </button>
          )}
          <span style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>
            {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Contenido */}
        {cargando ? (
          <div style={{ padding: "4rem", textAlign: "center" }}><Spinner /></div>
        ) : filtrados.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, padding: "3rem", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,.07)" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>🚚</p>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 16 }}>
              {proveedores.length === 0 ? "No hay proveedores registrados aún." : `Sin resultados para "${busqueda}".`}
            </p>
            {proveedores.length === 0 && (
              <button onClick={abrirNuevo}
                style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                + Crear primer proveedor
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── TABLA (desktop) ── */}
            <div className="gv-table-wrap" style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,.07)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    {["Proveedor", "NIT", "Contacto", "Email", "Teléfono", "Estado", "Acciones"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textAlign: h === "Acciones" ? "center" : "left", textTransform: "uppercase", letterSpacing: ".5px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((p, i) => (
                    <tr key={p.id} className="gv-row" style={{ borderBottom: i < filtrados.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>🚚</div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{p.nombre}</p>
                            {p.direccion && <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>📍 {p.direccion}</p>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "#475569", whiteSpace: "nowrap" }}>{p.nit}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#0f172a" }}>{p.contacto}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#6366f1" }}>{p.email}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569", whiteSpace: "nowrap" }}>{p.telefono}</td>
                      <td style={{ padding: "14px 16px" }}><EstadoBadge estado={p.estado} /></td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                          <button className="gv-action-btn gv-edit-btn" onClick={() => abrirEditar(p)}>Editar</button>
                          <button className="gv-action-btn gv-del-btn"  onClick={() => setConfirmElim(p)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── CARDS (móvil) ── */}
            <div className="gv-cards-wrap">
              {filtrados.map((p) => (
                <div key={p.id} style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", boxShadow: "0 2px 10px rgba(0,0,0,.07)", animation: "fadeUp .25s ease" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🚚</div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nombre}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>NIT: {p.nit}</p>
                      </div>
                    </div>
                    <EstadoBadge estado={p.estado} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 10px" }}>
                      <p style={{ margin: "0 0 2px", fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Contacto</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.contacto}</p>
                    </div>
                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 10px" }}>
                      <p style={{ margin: "0 0 2px", fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Teléfono</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{p.telefono}</p>
                    </div>
                  </div>
                  <p style={{ margin: "0 0 4px", fontSize: 12, color: "#6366f1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>✉️ {p.email}</p>
                  {p.direccion && (
                    <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>📍 {p.direccion}</p>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="gv-action-btn gv-edit-btn" style={{ flex: 1 }} onClick={() => abrirEditar(p)}>Editar</button>
                    <button className="gv-action-btn gv-del-btn"  style={{ flex: 1 }} onClick={() => setConfirmElim(p)}>Eliminar</button>
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
