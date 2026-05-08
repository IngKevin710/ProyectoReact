# 🔵 Autenticación con Google

Google es el proveedor OAuth más sencillo de configurar en Firebase. No requiere crear una app externa; Firebase se encarga de toda la integración con Google Identity.

---

## Índice

1. [Configuración en Firebase Console](#1-configuración-en-firebase-console)
2. [Instalación del SDK](#2-instalación-del-sdk)
3. [Implementación — Registro](#3-implementación--registro)
4. [Implementación — Login](#4-implementación--login)
5. [Datos que retorna Google](#5-datos-que-retorna-google)
6. [Manejo de errores](#6-manejo-de-errores)
7. [Archivos del proyecto](#7-archivos-del-proyecto)

---

## 1. Configuración en Firebase Console

1. Ir a [Firebase Console](https://console.firebase.google.com) → seleccionar el proyecto.
2. Menú lateral: **Build → Authentication → Sign-in method**.
3. Clic en **Google**.
4. Activar el interruptor **Enable**.
5. Seleccionar un **correo de soporte del proyecto** (requerido).
6. Clic en **Save**.

> No se necesita ninguna clave externa. Firebase usa automáticamente las credenciales del proyecto de Google Cloud subyacente.

---

## 2. Instalación del SDK

```bash
npm install firebase
```

---

## 3. Implementación — Registro

**`src/pages/RegistroUsuario.jsx`**

```js
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { registrarSesion } from "../services/historialService";
import app from "../firebase";

const auth         = getAuth(app);
const db           = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Divide "Nombre Apellido" en partes
const splitDisplayName = (displayName = "") => {
  const partes = displayName.trim().split(" ").filter(Boolean);
  if (partes.length === 0) return { nombre: "", apellido: "" };
  if (partes.length === 1) return { nombre: partes[0], apellido: "" };
  if (partes.length === 2) return { nombre: partes[0], apellido: partes[1] };
  return { nombre: partes.slice(0, -2).join(" "), apellido: partes.slice(-2).join(" ") };
};

// Guarda en Firestore solo si el documento aún no existe
const guardarUsuarioSiNuevo = async (uid, datos) => {
  const userRef = doc(db, "users", uid);
  const snap    = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, { ...datos, createdAt: new Date() });
  }
};

const handleGoogleSignIn = async () => {
  // 1. Abrir popup de Google
  const result = await signInWithPopup(auth, googleProvider);

  const { uid, displayName, email, photoURL } = result.user;
  const { nombre, apellido } = splitDisplayName(displayName);

  // 2. Guardar en Firestore si es la primera vez
  await guardarUsuarioSiNuevo(uid, {
    nombre,
    apellido,
    email:    email    || "",
    provider: "google",
    photoURL: photoURL || "",
  });

  // 3. Registrar sesión en el historial
  await registrarSesion(nombre, apellido, "google", uid);

  navigate("/perfil");
};
```

---

## 4. Implementación — Login

**`src/pages/LoginPage.jsx`**

```js
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { registrarSesion } from "../services/historialService";

const handleGoogleLogin = () =>
  handleSocialLogin(new GoogleAuthProvider(), "google");

const handleSocialLogin = async (provider, metodo) => {
  const result = await signInWithPopup(auth, provider);
  const { uid, displayName, email, photoURL } = result.user;

  const parts    = (displayName || "").split(" ").filter(Boolean);
  const nombre   = parts[0]                  || "Sin nombre";
  const apellido = parts.slice(1).join(" ") || "Sin apellido";

  // Guardar en Firestore si es la primera vez
  const userRef = doc(db, "users", uid);
  const snap    = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      nombre, apellido,
      email:    email    || "",
      provider: metodo,
      photoURL: photoURL || "",
      createdAt: new Date(),
    });
  }

  await registrarSesion(nombre, apellido, metodo, uid);
  navigate("/perfil");
};
```

---

## 5. Datos que retorna Google

Después de `signInWithPopup`, `result.user` contiene:

| Campo | Descripción | Ejemplo |
|---|---|---|
| `uid` | ID único en Firebase | `"abc123..."` |
| `displayName` | Nombre completo de la cuenta Google | `"Kevin Peñaranda"` |
| `email` | Correo de Gmail | `"kevin@gmail.com"` |
| `photoURL` | URL de la foto de perfil | CDN de Google (estable) |
| `emailVerified` | Siempre `true` en cuentas Google | `true` |

---

## 6. Manejo de errores

```js
const SOCIAL_ERROR_MESSAGES = {
  "auth/popup-closed-by-user":                     null, // silencioso
  "auth/cancelled-popup-request":                  null, // silencioso
  "auth/popup-blocked":
    "El navegador bloqueó la ventana emergente. Permite ventanas emergentes e intenta de nuevo.",
  "auth/account-exists-with-different-credential":
    "Este correo ya está registrado con otro método de inicio de sesión.",
  "auth/network-request-failed":
    "Error de red. Verifica tu conexión e intenta de nuevo.",
};

try {
  // ... signInWithPopup
} catch (error) {
  const mensaje = SOCIAL_ERROR_MESSAGES[error.code];
  if (mensaje !== null) {
    setSocialError(mensaje ?? "No se pudo iniciar sesión. Intenta de nuevo.");
  }
}
```

### Errores frecuentes

| Código | Causa | Solución |
|---|---|---|
| `auth/popup-blocked` | El navegador bloqueó el popup | Pedir al usuario que permita ventanas emergentes |
| `auth/account-exists-with-different-credential` | El correo ya está registrado con email/password | Iniciar sesión con el método original |
| `auth/popup-closed-by-user` | El usuario cerró el popup | No mostrar error (flujo cancelado intencionalmente) |

---

## 7. Archivos del proyecto

| Archivo | Responsabilidad |
|---|---|
| `src/pages/RegistroUsuario.jsx` | `handleGoogleSignIn` — registro/login desde la vista de registro |
| `src/pages/LoginPage.jsx` | `handleGoogleLogin` → `handleSocialLogin` — login desde la vista de login |
| `src/services/historialService.js` | `registrarSesion` — guarda la sesión en Firestore |

---

## Flujo completo

```
Usuario hace clic en "Google"
        │
        ▼
signInWithPopup(auth, googleProvider)
        │
        ├─► Firebase abre popup de Google
        │
        ▼
Google autentica y retorna result.user
        │
        ├─► ¿existe doc en users/{uid}? ──No──► setDoc() crea el documento
        │                               ──Sí──► (no sobreescribir)
        │
        ▼
registrarSesion(nombre, apellido, "google", uid)
        │
        ▼
navigate("/perfil")
```
