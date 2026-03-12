import { use, useState, Suspense, useSyncExternalStore } from "react";
import { fetchJoke, themeStore } from "../utils/stores";
import Header from "../utils/Header";

function JokeDisplay({ promise }) {
  const joke = use(promise);
  return (
    <div style={{ background: "#1e293b", padding: "1.2rem", borderRadius: 10, border: "1px solid #334155" }}>
      <p style={{ color: "#94a3b8", marginBottom: 6 }}>😄 <strong style={{ color: "#e2e8f0" }}>Setup:</strong> {joke.setup}</p>
      <p style={{ color: "#6366f1", fontWeight: 700 }}>🎭 {joke.punchline}</p>
    </div>
  );
}

export default function Use() {
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";

  const [currentPromise, setCurrentPromise] = useState(fetchJoke());

  return (
    <Header title="use" emoji="⚙️" category="Utility" categoryColor="#a855f7">
      <div style={{ color: text, fontFamily: "'IBM Plex Mono', monospace" }}>
        <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
          <code style={{ color: "#a855f7" }}>use()</code> lee una Promise directamente en el render. Funciona con <code>Suspense</code> para manejar la carga.
        </p>
        <Suspense fallback={<div style={{ color: "#a855f7", textAlign: "center", padding: "2rem" }}>⏳ Cargando chiste...</div>}>
          <JokeDisplay promise={currentPromise} />
        </Suspense>
        <button onClick={() => setCurrentPromise(fetchJoke())} style={{ marginTop: "1rem", padding: "8px 20px", borderRadius: 8, border: "1px solid #a855f7", background: "transparent", color: "#a855f7", fontWeight: 700, cursor: "pointer" }}>
          🔄 Nuevo chiste
        </button>
      </div>
    </Header>
  );
}


