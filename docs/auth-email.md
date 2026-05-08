# 📧 Autenticación con Email y Contraseña

Firebase Authentication permite crear y autenticar usuarios con correo electrónico y contraseña sin necesidad de un servidor propio.

---

## Índice

1. [Configuración en Firebase Console](#1-configuración-en-firebase-console)
2. [Instalación del SDK](#2-instalación-del-sdk)
3. [Inicialización de Firebase](#3-inicialización-de-firebase)
4. [Registro de usuario](#4-registro-de-usuario)
5. [Inicio de sesión](#5-inicio-de-sesión)
6. [Recuperación de contraseña](#6-recuperación-de-contraseña)
7. [Restablecimiento de contraseña](#7-restablecimiento-de-contraseña)
8. [Cierre de sesión](#8-cierre-de-sesión)
9. [Archivos del proyecto](#9-archivos-del-proyecto)

---

## 1. Configuración en Firebase Console

1. Ir a [Firebase Console](https://console.firebase.google.com) y abrir el proyecto.
2. En el menú lateral: **Build → Authentication**.
3. Clic en **Get started** si es la primera vez.
4. Ir a la pestaña **Sign-in method**.
5. Clic en **Email/Password**.
6. Activar el primer interruptor (**Email/Password**).
7. El segundo interruptor (**Email link**) dejarlo desactivado.
8. Clic en **Save**.

> **Nota:** El proveedor aparecerá como **Enabled** en la lista.

---

## 2. Instalación del SDK

```bash
npm install firebase
```

---

## 3. Inicialización de Firebase

**`src/firebase.js`**

```js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
export default app;
```

---

## 4. Registro de usuario

**`src/pages/RegistroUsuario.jsx`**

```js
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import app from "../firebase";

const auth = getAuth(app);
const db   = getFirestore(app);

const handleSubmit = async (e) => {
  e.preventDefault();

  // 1. Crear usuario en Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    form.email,
    form.password
  );
  const user = userCredential.user;

  // 2. Sincronizar displayName en Firebase Auth
  await updateProfile(user, {
    displayName: `${form.nombre} ${form.apellido}`.trim(),
  });

  // 3. Guardar datos adicionales en Firestore
  await setDoc(doc(db, "users", user.uid), {
    nombre:    form.nombre,
    apellido:  form.apellido,
    email:     form.email,
    provider:  "email",
    createdAt: new Date(),
  });
};
```

### Errores comunes

| Código Firebase | Mensaje sugerido |
|---|---|
| `auth/email-already-in-use` | El correo ya está registrado |
| `auth/invalid-email` | Formato de correo inválido |
| `auth/weak-password` | La contraseña es muy débil (mínimo 6 caracteres) |

---

## 5. Inicio de sesión

**`src/pages/LoginPage.jsx`**

```js
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { registrarSesion } from "../services/historialService";

const auth = getAuth(app);
const db   = getFirestore(app);

const handleSubmit = async (e) => {
  e.preventDefault();

  // 1. Autenticar con Firebase Auth
  const credential = await signInWithEmailAndPassword(
    auth,
    form.email,
    form.password
  );

  // 2. Leer nombre y apellido desde Firestore
  const snap = await getDoc(doc(db, "users", credential.user.uid));
  const data = snap.data() || {};

  // 3. Registrar sesión en el historial
  await registrarSesion(
    data.nombre   || "Sin nombre",
    data.apellido || "Sin apellido",
    "email",
    credential.user.uid
  );

  navigate("/perfil");
};
```

---

## 6. Recuperación de contraseña

Firebase envía un correo con un enlace que contiene un `oobCode` (token de un solo uso).

**`src/pages/ForgotPage.jsx`**

```js
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const handleSubmit = async (e) => {
  e.preventDefault();

  // 1. Verificar en Firestore si la cuenta usa proveedor social
  const snap = await getDocs(
    query(collection(db, "users"), where("email", "==", email.trim().toLowerCase()))
  );
  if (!snap.empty) {
    const provider = snap.docs[0].data().provider;
    if (provider && provider !== "email") {
      // Mostrar mensaje: esta cuenta usa Google/GitHub/Facebook
      return;
    }
  }

  // 2. Enviar email de recuperación
  await sendPasswordResetEmail(auth, email.trim());
  // Mostrar confirmación al usuario
};
```

> **Importante:** Si la cuenta inicia sesión con Google, GitHub o Facebook, la contraseña la gestiona ese proveedor. No se debe permitir el restablecimiento desde la app.

---

## 7. Restablecimiento de contraseña

El enlace del email incluye `?oobCode=XXX` en la URL. Con ese código se verifica y actualiza la contraseña.

**`src/pages/ResetPage.jsx`**

```js
import {
  getAuth,
  verifyPasswordResetCode,
  confirmPasswordReset
} from "firebase/auth";
import { useSearchParams } from "react-router-dom";

const [searchParams] = useSearchParams();
const oobCode = searchParams.get("oobCode");

// 1. Al montar: verificar que el código sea válido
useEffect(() => {
  if (!oobCode) { setStatus("invalid"); return; }
  verifyPasswordResetCode(auth, oobCode)
    .then((email) => {
      setAccountEmail(email); // Mostrar el correo de la cuenta
      setStatus("valid");
    })
    .catch(() => setStatus("invalid"));
}, [oobCode]);

// 2. Al enviar el formulario: confirmar la nueva contraseña
const handleSubmit = async (e) => {
  e.preventDefault();
  await confirmPasswordReset(auth, oobCode, password);
  navigate("/login?reset=success");
};
```

### Reglas de contraseña recomendadas

- Mínimo 8 caracteres
- Al menos 1 letra mayúscula
- Al menos 1 número

---

## 8. Cierre de sesión

```js
import { getAuth, signOut } from "firebase/auth";
import { cerrarSesion } from "../services/historialService";

const handleLogout = async () => {
  await cerrarSesion();   // Actualiza el historial en Firestore
  await signOut(auth);    // Cierra sesión en Firebase Auth
  navigate("/");
};
```

---

## 9. Archivos del proyecto

| Archivo | Responsabilidad |
|---|---|
| `src/firebase.js` | Inicialización de la app Firebase |
| `src/pages/RegistroUsuario.jsx` | Creación de cuenta |
| `src/pages/LoginPage.jsx` | Inicio de sesión |
| `src/pages/ForgotPage.jsx` | Solicitud de recuperación |
| `src/pages/ResetPage.jsx` | Confirmación de nueva contraseña |
| `src/services/historialService.js` | Registro del historial de sesiones |
| `src/hooks/useAuthUser.js` | Suscripción al estado de auth |

---

## Flujo completo

```
Registro ──► Firebase Auth crea el usuario
          ──► updateProfile guarda displayName
          ──► Firestore guarda nombre/apellido/provider

Login ────► signInWithEmailAndPassword
         ──► Lee datos de Firestore
         ──► registrarSesion() guarda en historialAuth
         ──► Navega a /perfil

Olvidé ──► Verifica provider en Firestore
contraseña  (si es social → bloquea con mensaje)
         ──► sendPasswordResetEmail → correo con link

Reset ───► verifyPasswordResetCode(oobCode) → valida token
         ──► confirmPasswordReset(oobCode, newPassword)
         ──► Navega a /login?reset=success
```
