import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  { icon: "🔐", title: "Acceso seguro",       desc: "Autenticación con email, Google, GitHub y Facebook." },
  { icon: "⚡", title: "Rápido y moderno",    desc: "Interfaz construida con React para una experiencia fluida." },
  { icon: "📱", title: "Totalmente responsivo", desc: "Funciona perfecto en móvil, tablet y escritorio." },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{ background: "#1a1035", padding: "0 32px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 16px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(99,102,241,0.25)", border: "1.5px solid rgba(99,102,241,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>⚛️</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>React App</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => navigate("/login")}
            style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.18)", background: "transparent", color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            Iniciar sesión
          </button>
          <button onClick={() => navigate("/registrousuario")}
            style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 3px 10px rgba(99,102,241,0.4)", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#4f46e5"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#6366f1"; e.currentTarget.style.transform = "translateY(0)"; }}>
            Registrarse
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px 48px", textAlign: "center" }}>

        <div style={{ width: 68, height: 68, borderRadius: 20, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 28, boxShadow: "0 8px 28px rgba(99,102,241,0.35)" }}>
          ⚛️
        </div>

        <h1 style={{ margin: "0 0 16px", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, color: "#0f172a", lineHeight: 1.15, maxWidth: 600 }}>
          Bienvenido a<br />
          <span style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            nuestra plataforma
          </span>
        </h1>

        <p style={{ margin: "0 0 40px", fontSize: 16, color: "#64748b", maxWidth: 460, lineHeight: 1.7 }}>
          Una plataforma moderna para gestionar tu cuenta, proyectos y mucho más. Simple, segura y lista para usar.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 72 }}>
          <button onClick={() => navigate("/registrousuario")}
            style={{ padding: "13px 32px", borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(99,102,241,0.4)", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#4f46e5"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(99,102,241,0.45)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#6366f1"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(99,102,241,0.4)"; }}>
            Crear cuenta →
          </button>
          <button onClick={() => navigate("/login")}
            style={{ padding: "13px 32px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; e.currentTarget.style.transform = "translateY(0)"; }}>
            Iniciar sesión
          </button>
        </div>

        {/* ── Features ── */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", maxWidth: 860, width: "100%" }}>
          {FEATURES.map((f, i) => (
            <div key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                flex: "1 1 220px", maxWidth: 260,
                background: "#fff", borderRadius: 16, padding: "28px 24px",
                boxShadow: hovered === i ? "0 12px 36px rgba(99,102,241,0.14)" : "0 2px 10px rgba(0,0,0,0.06)",
                transform: hovered === i ? "translateY(-4px)" : "translateY(0)",
                transition: "all 0.25s ease",
                border: hovered === i ? "1px solid #e0e7ff" : "1px solid transparent",
              }}>
              <div style={{ fontSize: 30, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{f.title}</h3>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: "#1a1035", padding: "18px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>⚛️ React App © 2026</span>
        <div style={{ display: "flex", gap: 20 }}>
          {["Términos", "Privacidad", "Soporte"].map((l) => (
            <button key={l} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 12, cursor: "pointer", transition: "color 0.15s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
              {l}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
