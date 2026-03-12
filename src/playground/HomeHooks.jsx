import { useState, useId, useDebugValue, useSyncExternalStore, useActionState, Suspense, use, useEffect } from "react";
import { useFormStatus } from "react-dom";

// ─── useSyncExternalStore: theme store externo ───
let themeListeners = [];
let isDarkMode = false;
const themeStore = {
  subscribe(cb) { themeListeners.push(cb); return () => { themeListeners = themeListeners.filter(l => l !== cb); }; },
  getSnapshot() { return isDarkMode; },
  toggle() { isDarkMode = !isDarkMode; themeListeners.forEach(l => l()); },
};

// ─── use: promise de chiste ───
const fetchJoke = () => fetch("https://official-joke-api.appspot.com/random_joke").then(r => r.json());
let jokePromise = fetchJoke();

// ─── useDebugValue: hook personalizado ───
function useOnlineStatus() {
  // eslint-disable-next-line no-unused-vars
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  useDebugValue(online ? "🟢 Conectado" : "🔴 Desconectado");
  return online;
}

// ─── useFormStatus: botón hijo ───
function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: pending ? "#94a3b8" : "#6366f1", color: "#fff", fontWeight: 700, cursor: pending ? "not-allowed" : "pointer", fontSize: "0.95rem" }}>
      {pending ? "⏳ Enviando..." : "Enviar comentario"}
    </button>
  );
}

// ─── useId: campo de formulario ───
function Field({ label, type = "text" }) {
  const id = useId();
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label htmlFor={id} style={{ display: "block", fontWeight: 600, marginBottom: 4, color: "#e2e8f0" }}>{label}</label>
      <input id={id} type={type} placeholder={`Ingresa tu ${label.toLowerCase()}...`} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #475569", width: "100%", background: "#1e293b", color: "#f1f5f9", boxSizing: "border-box" }} />
    </div>
  );
}

// ─── Joke con use() ───
function JokeDisplay({ promise }) {
  const joke = use(promise);
  return (
    <div style={{ background: "#1e293b", padding: "1.2rem", borderRadius: 10, border: "1px solid #334155" }}>
      <p style={{ color: "#94a3b8", marginBottom: 6 }}>😄 <strong style={{ color: "#e2e8f0" }}>Setup:</strong> {joke.setup}</p>
      <p style={{ color: "#6366f1", fontWeight: 700 }}>🎯 {joke.punchline}</p>
    </div>
  );
}

const hooks = [
  { id: "useId",                 emoji: "🪪", category: "Utility",     color: "#f59e0b" },
  { id: "useDebugValue",         emoji: "🐛", category: "Utility",     color: "#10b981" },
  { id: "useSyncExternalStore",  emoji: "🔄", category: "Utility",     color: "#3b82f6" },
  { id: "use",                   emoji: "⚡", category: "Utility",     color: "#a855f7" },
  { id: "useActionState",        emoji: "📋", category: "Form/Action", color: "#ef4444" },
  { id: "useFormStatus",         emoji: "📡", category: "Form/Action", color: "#ec4899" },
];

export default function HomeHooks() {
  const [active, setActive] = useState(null);
  const isDark = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  const isOnline = useOnlineStatus();
  const [actionState, formAction, isPending] = useActionState(async (prev, data) => {
    const nombre = data.get("nombre");
    await new Promise(r => setTimeout(r, 1500));
    if (!nombre || nombre.trim().length < 3) return { error: "Mínimo 3 caracteres.", success: false };
    return { error: null, success: true, nombre };
  }, { error: null, success: false });

  const [currentPromise, setCurrentPromise] = useState(jokePromise);

  const bg = isDark ? "#0a0f1e" : "#f8fafc";
  const card = isDark ? "#0f172a" : "#ffffff";
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "#1e293b" : "#e2e8f0";

  const renderDemo = (hookId) => {
    const s = { color: text, fontFamily: "'IBM Plex Mono', monospace" };
    switch (hookId) {
      case "useId": return (
        <div style={s}>
          <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
            Cada campo recibe un ID único generado automáticamente por <code style={{ color: "#f59e0b" }}>useId()</code>, evitando colisiones aunque el componente se reutilice.
          </p>
          <Field label="Nombre" />
          <Field label="Correo electrónico" type="email" />
          <Field label="Contraseña" type="password" />
          <p style={{ fontSize: "0.78rem", color: sub, marginTop: "0.5rem", fontFamily: "sans-serif" }}>💡 Inspecciona el DOM y verás IDs como <code>:r0:</code>, <code>:r1:</code>...</p>
        </div>
      );
      case "useDebugValue": return (
        <div style={s}>
          <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
            <code style={{ color: "#10b981" }}>useDebugValue</code> etiqueta hooks personalizados en React DevTools. Aquí lo usamos en un hook de estado de red.
          </p>
          <div style={{ padding: "1.5rem", borderRadius: 12, background: isOnline ? "#052e16" : "#450a0a", border: `1px solid ${isOnline ? "#16a34a" : "#dc2626"}`, textAlign: "center" }}>
            <div style={{ fontSize: "3rem" }}>{isOnline ? "🟢" : "🔴"}</div>
            <div style={{ fontWeight: 700, fontSize: "1.2rem", color: isOnline ? "#4ade80" : "#f87171", marginTop: 8 }}>
              {isOnline ? "Conectado a internet" : "Sin conexión"}
            </div>
          </div>
          <p style={{ fontSize: "0.78rem", color: sub, marginTop: "1rem", fontFamily: "sans-serif" }}>💡 Abre React DevTools → Components → busca <code>useOnlineStatus</code></p>
        </div>
      );
      case "useSyncExternalStore": return (
        <div style={s}>
          <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
            Se suscribe a un store externo fuera de React. El tema vive en una variable global y este hook lo sincroniza.
          </p>
          <div style={{ padding: "1.5rem", borderRadius: 12, background: isDark ? "#1e293b" : "#f1f5f9", border: `1px solid ${border}`, textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>{isDark ? "🌙" : "☀️"}</div>
            <div style={{ fontWeight: 700, color: text }}>Modo: {isDark ? "Oscuro" : "Claro"}</div>
            <button onClick={themeStore.toggle} style={{ marginTop: "1rem", padding: "8px 20px", borderRadius: 8, border: "none", background: isDark ? "#f1f5f9" : "#0f172a", color: isDark ? "#0f172a" : "#f1f5f9", fontWeight: 700, cursor: "pointer" }}>
              Cambiar tema
            </button>
          </div>
          <p style={{ fontSize: "0.78rem", color: sub, marginTop: "1rem", fontFamily: "sans-serif" }}>💡 El store vive fuera del árbol de React. <code>useSyncExternalStore</code> lo conecta.</p>
        </div>
      );
      case "use": return (
        <div style={s}>
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
      );
      case "useActionState": return (
        <div style={s}>
          <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
            Gestiona el estado de una acción de formulario: resultado anterior, estado pendiente y action handler.
          </p>
          {actionState.success ? (
            <div style={{ background: "#052e16", padding: "1.2rem", borderRadius: 10, border: "1px solid #16a34a", color: "#4ade80", fontFamily: "sans-serif" }}>
              ✅ ¡Hola <strong>{actionState.nombre}</strong>! Formulario enviado con éxito.
            </div>
          ) : (
            <form action={formAction}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", color: "#e2e8f0", fontWeight: 600, marginBottom: 4, fontFamily: "sans-serif" }}>Nombre:</label>
                <input name="nombre" type="text" placeholder="Mínimo 3 caracteres..." style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #475569", width: "100%", background: "#1e293b", color: "#f1f5f9", boxSizing: "border-box", fontFamily: "sans-serif" }} />
              </div>
              {actionState.error && <p style={{ color: "#f87171", marginBottom: "0.75rem", fontFamily: "sans-serif" }}>⚠️ {actionState.error}</p>}
              <button type="submit" disabled={isPending} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: isPending ? "#475569" : "#ef4444", color: "#fff", fontWeight: 700, cursor: isPending ? "not-allowed" : "pointer", fontFamily: "sans-serif" }}>
                {isPending ? "⏳ Validando..." : "Enviar"}
              </button>
            </form>
          )}
        </div>
      );
      case "useFormStatus": return (
        <div style={s}>
          <p style={{ color: sub, marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
            <code style={{ color: "#ec4899" }}>useFormStatus</code> se usa en un componente <strong>hijo</strong> del form para leer si está pendiente. No puede usarse en el mismo componente del form.
          </p>
          <form action={async () => { await new Promise(r => setTimeout(r, 2000)); }}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#e2e8f0", fontWeight: 600, marginBottom: 4, fontFamily: "sans-serif" }}>Comentario:</label>
              <textarea name="comentario" rows={3} placeholder="Escribe algo..." style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #475569", background: "#1e293b", color: "#f1f5f9", resize: "vertical", fontFamily: "sans-serif", boxSizing: "border-box" }} />
            </div>
            <SubmitBtn />
          </form>
          <p style={{ fontSize: "0.78rem", color: sub, marginTop: "1rem", fontFamily: "sans-serif" }}>💡 <code>SubmitBtn</code> es un componente separado que usa <code>useFormStatus()</code> internamente.</p>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'IBM Plex Mono', monospace", transition: "background 0.3s" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: card, borderBottom: `1px solid ${border}`, padding: "1.5rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {active && (
              <button onClick={() => setActive(null)} style={{ background: "none", border: `1px solid ${border}`, color: text, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: "0.85rem" }}>
                ← Home
              </button>
            )}
            <span style={{ color: "#6366f1", fontWeight: 700, fontSize: "1.3rem" }}>⚛ React Hooks</span>
            {active && <span style={{ color: sub }}>/ <span style={{ color: text, fontWeight: 700 }}>{active}</span></span>}
          </div>
          {!active && <p style={{ color: sub, margin: "4px 0 0", fontSize: "0.8rem" }}>Hooks #14–19 · Playground</p>}
        </div>
        <div style={{ fontSize: "0.75rem", color: sub, background: isDark ? "#1e293b" : "#f1f5f9", padding: "4px 10px", borderRadius: 6 }}>
          {isDark ? "🌙 dark" : "☀️ light"}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
        {!active ? (
          <>
            <h2 style={{ color: text, fontWeight: 700, fontSize: "1.6rem", marginBottom: "0.5rem" }}>Mis Hooks Asignados</h2>
            <p style={{ color: sub, marginBottom: "2rem", fontSize: "0.85rem" }}>Haz clic en cualquier hook para ver su descripción y ejercicio interactivo.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
              {hooks.map(h => (
                <div key={h.id} onClick={() => setActive(h.id)} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: "1.5rem", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${h.color}33`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "1.8rem" }}>{h.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: h.color, fontSize: "1rem" }}>{h.id}</div>
                      <span style={{ fontSize: "0.7rem", background: `${h.color}22`, color: h.color, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{h.category}</span>
                    </div>
                  </div>
                  <p style={{ color: sub, fontSize: "0.8rem", margin: 0, lineHeight: 1.5 }}>
                    {{
                      useId: "Genera IDs únicos para vincular labels con inputs de forma accesible.",
                      useDebugValue: "Etiqueta hooks personalizados en React DevTools.",
                      useSyncExternalStore: "Se suscribe a stores externos fuera del árbol de React.",
                      use: "Lee Promises directamente en el render con Suspense.",
                      useActionState: "Gestiona estado, pendiente y resultado de acciones de form.",
                      useFormStatus: "Lee el estado del formulario padre desde un componente hijo.",
                    }[h.id]}
                  </p>
                  <div style={{ marginTop: "1rem", color: h.color, fontSize: "0.8rem", fontWeight: 600 }}>Ver ejercicio →</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "2rem" }}>{hooks.find(h => h.id === active)?.emoji}</span>
              <h2 style={{ color: text, margin: 0, fontSize: "1.8rem" }}>{active}</h2>
              <span style={{ fontSize: "0.75rem", background: `${hooks.find(h => h.id === active)?.color}22`, color: hooks.find(h => h.id === active)?.color, padding: "3px 10px", borderRadius: 10, fontWeight: 700 }}>
                {hooks.find(h => h.id === active)?.category}
              </span>
            </div>
            <hr style={{ border: "none", borderTop: `1px solid ${border}`, margin: "1.5rem 0" }} />
            {renderDemo(active)}
          </div>
        )}
      </div>
    </div>
  );
}