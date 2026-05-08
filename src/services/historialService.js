
import { getFirestore, collection, addDoc, doc, updateDoc, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import app from "../firebase";

const db = getFirestore(app);

// Registra una nueva sesión cuando el usuario hace login
// Retorna el ID del documento para luego poder actualizarlo al logout
export const registrarSesion = async (nombre, apellido, metodo) => {
  const docRef = await addDoc(collection(db, "historialAuth"), {
    nombre,
    apellido,
    metodo,
    horaInicio: Timestamp.now(),
    horaSalida: null,
    estado: "activo",
  });
  // Guardamos el ID en sessionStorage para recuperarlo al hacer logout
  sessionStorage.setItem("sesionId", docRef.id);
  return docRef.id;
};

// Actualiza la sesión cuando el usuario hace logout
export const cerrarSesion = async () => {
  const sesionId = sessionStorage.getItem("sesionId");
  if (!sesionId) return;

  const ref = doc(db, "historialAuth", sesionId);
  await updateDoc(ref, {
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