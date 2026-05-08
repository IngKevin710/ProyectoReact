import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../firebase";

const auth = getAuth(app);

export function useAuthUser() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
}
