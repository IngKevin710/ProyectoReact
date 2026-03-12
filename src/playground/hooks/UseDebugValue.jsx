import { useState, useEffect, useDebugValue } from "react";
import { useNavigate } from "react-router-dom";

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useDebugValue(isOnline ? "🟢 Conectado" : "🔴 Desconectado");

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export default function UseDebugValue() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", fontFamily: "sans-serif", padding: "2rem" }}>
      <button onClick={() => navigate("/")}>← Volver al Home</button>
      <h1>useDebugValue</h1>
      <p>Muestra una etiqueta personalizada en React DevTools para hooks personalizados. No afecta el comportamiento en producción.</p>
      <hr />
      <h3>Ejemplo: Hook de estado de conexión</h3>
      <div style={{
        padding: "1rem", borderRadius: 8,
        background: isOnline ? "#dcfce7" : "#fee2e2",
        color: isOnline ? "#166534" : "#991b1b",
        fontSize: "1.2rem", fontWeight: 700
      }}>
        {isOnline ? "🟢 Estás conectado a internet" : "🔴 Sin conexión a internet"}
      </div>
      <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "1rem" }}>
        Abre React DevTools y busca el hook <code>useOnlineStatus</code> para ver la etiqueta generada por <code>useDebugValue</code>.
      </p>
    </div>
  );
}