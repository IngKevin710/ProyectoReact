import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import app from "../firebase";

const db = getFirestore(app);
const COL = "proveedores";

export const crearProveedor = async (datos) => {
  const docRef = await addDoc(collection(db, COL), {
    ...datos,
    creadoEn: Timestamp.now(),
    actualizadoEn: Timestamp.now(),
  });
  return docRef.id;
};

export const obtenerProveedores = async () => {
  const q = query(collection(db, COL), orderBy("creadoEn", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const obtenerProveedorPorId = async (id) => {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const actualizarProveedor = async (id, datos) => {
  await updateDoc(doc(db, COL, id), {
    ...datos,
    actualizadoEn: Timestamp.now(),
  });
};

export const eliminarProveedor = async (id) => {
  await deleteDoc(doc(db, COL, id));
};
