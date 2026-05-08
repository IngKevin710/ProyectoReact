
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerHistorial, cerrarSesion } from "../services/historialService";
import { getAuth, signOut } from "firebase/auth";
import app from "../firebase";

const auth = getAuth(app);

// Etiquetas visuales según el método de login
const badgeMetodo = {
  email:    { label: "✉️ Email",    bg: "#ede9fe", color: "#6d28d9" },
  google:   { label: "🔵 Google",   bg: "#dbeafe", color: "#1d4ed8" },
  github:   { label: "🐱 GitHub",   bg: "#f1f5f9", color: "#0f172a" },
  facebook: { label: "🔵 Facebook", bg: "#eff6ff", color: "#1877f2" },
};

// Formatea un Timestamp de Firestore a hora legible
const formatHora = (ts) => {
  if (!ts) return "—";
  return ts.toDate().toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "medium",
  });
};

export default function HistorialAuth() {
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    obtenerHistorial()
      .then(setHistorial)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await cerrarSesion();
    await signOut(auth);
    navigate("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif", padding: "2rem" }}>

      {/* Encabezado */}
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              🔐 Historial de Autenticación
            </h1>
            <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
              Registro de todas las sesiones iniciadas
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "9px 18px", borderRadius: 8, border: "none",
              background: "#ef4444", color: "#fff", fontSize: 13,
              fontWeight: 600, cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        </div>

        {/* Tabla */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          {loading ? (
            <p style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Cargando historial...</p>
          ) : historial.length === 0 ? (
            <p style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>No hay sesiones registradas aún.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  {["Usuario", "Método", "Hora inicio", "Hora salida", "Estado"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700,
                      color: "#64748b", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historial.map((s, i) => {
                  const badge = badgeMetodo[s.metodo] || { label: s.metodo, bg: "#f1f5f9", color: "#334155" };
                  return (
                    <tr key={s.id} style={{ borderBottom: i < historial.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <td style={{ padding: "14px 16px", fontSize: 14, color: "#0f172a", fontWeight: 500 }}>
                        {s.nombre} {s.apellido}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ background: badge.bg, color: badge.color,
                          padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>
                        {formatHora(s.horaInicio)}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>
                        {formatHora(s.horaSalida)}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          background: s.estado === "activo" ? "#dcfce7" : "#f1f5f9",
                          color: s.estado === "activo" ? "#16a34a" : "#64748b",
                          padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                        }}>
                          {s.estado === "activo" ? "🟢 Activo" : "⚫ Finalizado"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}