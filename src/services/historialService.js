import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, getDocs, orderBy, query, where, Timestamp } from "firebase/firestore";
import app from "../firebase";

const db = getFirestore(app);

// Registra una nueva sesión cuando el usuario hace login
export const registrarSesion = async (nombre, apellido, metodo, uid = null) => {
  const docRef = await addDoc(collection(db, "historialAuth"), {
    uid,
    nombre,
    apellido,
    metodo,
    horaInicio: Timestamp.now(),
    lastHeartbeat: Timestamp.now(),
    horaSalida: null,
    estado: "activo",
  });
  sessionStorage.setItem("sesionId", docRef.id);
  return docRef.id;
};

// Actualiza el heartbeat de la sesión activa — llamar cada 60 s mientras el usuario está en la app
export const actualizarHeartbeat = async () => {
  const sesionId = sessionStorage.getItem("sesionId");
  if (!sesionId) return;
  try {
    await updateDoc(doc(db, "historialAuth", sesionId), {
      lastHeartbeat: Timestamp.now(),
    });
  } catch {
    // No crítico
  }
};

// Cierra las sesiones activas cuyo heartbeat tiene más de 5 minutos sin actualizarse
// (el usuario cerró la ventana sin hacer logout)
export const cerrarSesionesExpiradas = async () => {
  const LIMITE_MS = 5 * 60 * 1000;
  const snap = await getDocs(
    query(collection(db, "historialAuth"), where("estado", "==", "activo"))
  );
  const ahora = Timestamp.now();
  for (const d of snap.docs) {
    const data = d.data();
    // Usar lastHeartbeat si existe, si no usar horaInicio como referencia
    const referencia = data.lastHeartbeat?.toMillis() ?? data.horaInicio?.toMillis() ?? 0;
    if (Date.now() - referencia > LIMITE_MS) {
      await updateDoc(d.ref, { horaSalida: ahora, estado: "finalizado" });
    }
  }
};

// Actualiza la sesión cuando el usuario hace logout explícito
export const cerrarSesion = async () => {
  const sesionId = sessionStorage.getItem("sesionId");
  if (!sesionId) return;

  await updateDoc(doc(db, "historialAuth", sesionId), {
    horaSalida: Timestamp.now(),
    estado: "finalizado",
  });
  sessionStorage.removeItem("sesionId");
};

// Obtiene todo el historial ordenado por hora de inicio
export const obtenerHistorial = async () => {
  const q = query(collection(db, "historialAuth"), orderBy("horaInicio", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Obtiene el historial de un usuario específico.
// Combina sesiones nuevas (filtradas por uid) con sesiones antiguas
// (anteriores al campo uid, filtradas por nombre+apellido desde Firestore users).
export const obtenerHistorialPorUsuario = async (uid) => {
  const userSnap = await getDoc(doc(db, "users", uid));
  const userData = userSnap.data() || {};
  const nombreUser   = (userData.nombre   || "").trim().toLowerCase();
  const apellidoUser = (userData.apellido || "").trim().toLowerCase();

  const snapshot = await getDocs(collection(db, "historialAuth"));
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((s) => {
      if (s.uid === uid) return true;
      if (s.uid) return false;
      return (
        (s.nombre   || "").trim().toLowerCase() === nombreUser &&
        (s.apellido || "").trim().toLowerCase() === apellidoUser
      );
    })
    .sort((a, b) => b.horaInicio?.toMillis() - a.horaInicio?.toMillis());
};
