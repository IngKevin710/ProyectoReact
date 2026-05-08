import { useEffect, useRef, useState, useCallback } from "react";

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos

export function useInactivityLogout(onLogout) {
  const [remaining, setRemaining] = useState(TIMEOUT_MS);
  const onLogoutRef     = useRef(onLogout);
  const lastActivityRef = useRef(Date.now());
  const timeoutRef      = useRef(null);

  useEffect(() => { onLogoutRef.current = onLogout; }, [onLogout]);

  const reset = useCallback(() => {
    lastActivityRef.current = Date.now();
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onLogoutRef.current(), TIMEOUT_MS);
  }, []);

  // Actualiza el contador cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      setRemaining(Math.max(0, TIMEOUT_MS - elapsed));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Escucha eventos de actividad del usuario
  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timeoutRef.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [reset]);

  return { remaining, reset };
}
