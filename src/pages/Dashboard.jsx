import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import app from "../firebase";

const auth = getAuth(app);

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", background: "#f1f5f9", margin: 0, padding: 0 }}>

      {/* Navbar */}
      <div style={{ width: "100%", height: 60, background: "#1a1035", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", boxSizing: "border-box", boxShadow: "0 2px 12px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(99,102,241,0.3)", border: "1.5px solid rgba(99,102,241,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚛️</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>React App</span>
        </div>
        <button onClick={handleLogout}
          style={{ padding: "7px 16px", borderRadius: 7, border: "none", background: "rgba(239,68,68,0.2)", color: "#f87171", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Cerrar sesión
        </button>
      </div>

      {/* Contenido */}
      <div style={{ flex: 1, padding: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, boxSizing: "border-box", alignContent: "start" }}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ height: 120, background: "#e2e8f0", borderRadius: 8, marginBottom: 10 }} />
              <h3 style={{ margin: "0 0 5px", fontSize: 15, color: "#0f172a" }}>Producto {item}</h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>Descripción breve del producto</p>
            </div>
            <button style={{ marginTop: 10, padding: 10, borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Comprar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
