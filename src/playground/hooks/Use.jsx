import { use, useState } from "react";
import { useNavigate } from "react-router-dom";

// Componente que simula una promesa
function UserProfile({ userPromise }) {
  // El hook 'use' suspende hasta que la promesa se resuelva
  const user = use(userPromise);
  
  return (
    <div style={{
      padding: "1rem",
      background: "#f0f9ff",
      borderRadius: 8,
      border: "1px solid #bae6fd"
    }}>
      <h4 style={{ margin: "0 0 0.5rem 0", color: "#0369a1" }}>
        👤 {user.name}
      </h4>
      <p style={{ margin: 0, color: "#0c4a6e", fontSize: "0.9rem" }}>
        📧 {user.email}
      </p>
    </div>
  );
}

// Función que devuelve una promesa simulada
function fetchUser(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: userId,
        name: userId === "1" ? "Juan Pérez" : "María García",
        email: userId === "1" ? "juan@ejemplo.com" : "maria@ejemplo.com"
      });
    }, 1500);
  });
}

export default function Use() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("1");
  
  // Creamos una nueva promesa cada vez que cambia el userId
  const userPromise = fetchUser(userId);

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", fontFamily: "sans-serif", padding: "2rem" }}>
      <button onClick={() => navigate("/")}>← Volver al Home</button>
      <h1>use</h1>
      <p>Es un hook de React 19 que permite usar recursos asíncronos (promesas) directamente en componentes. Suspende el renderizado hasta que la promesa se resuelva.</p>
      <hr />
      <h3>Ejemplo: Cargar datos de usuario</h3>
      
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: "4px" }}>
          Seleccionar usuario:
        </label>
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #cbd5e1",
            width: "100%",
            fontSize: "1rem"
          }}
        >
          <option value="1">Usuario 1 (Juan)</option>
          <option value="2">Usuario 2 (María)</option>
        </select>
      </div>

      {/* El componente UserProfile usa 'use' para esperar la promesa */}
      <UserProfile userPromise={userPromise} />

      <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "1rem" }}>
        El hook <code>use</code> suspende el componente mientras la promesa está pendiente y muestra el contenido final cuando se resuelve. Es ideal para cargar datos de forma asíncrona.
      </p>
    </div>
  );
}

