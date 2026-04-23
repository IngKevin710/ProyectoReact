import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import app from "../firebase";

const auth = getAuth(app);

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // redirige al login
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f1f5f9",
        margin: 0,
        padding: 0,
      }}
    >
      {/* 🔹 Navbar */}
      <div
        style={{
          width: "100%",
          height: 60,
          background: "#1e293b",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ margin: 0 }}>🛍️ Mi Tienda</h2>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 14px",
            borderRadius: 6,
            border: "none",
            background: "#ef4444",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </div>

      {/* 🔹 Contenido */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          boxSizing: "border-box",
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  height: 120,
                  background: "#e2e8f0",
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              />
              <h3 style={{ margin: "0 0 5px" }}>Producto {item}</h3>
              <p style={{ margin: 0, color: "#64748b" }}>
                Descripción breve del producto
              </p>
            </div>

            <button
              style={{
                marginTop: 10,
                padding: 10,
                borderRadius: 8,
                border: "none",
                background: "#6366f1",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Comprar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}