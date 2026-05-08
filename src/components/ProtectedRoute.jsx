import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../firebase";

const auth = getAuth(app);

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined); // undefined = cargando

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  if (user === undefined) return <p>Cargando...</p>;

  return user ? children : <Navigate to="/" />;
}