# 🐱 Autenticación con GitHub

GitHub OAuth requiere crear una **OAuth App** en GitHub Developer Settings para obtener un Client ID y Client Secret, que luego se configuran en Firebase Console.

---

## Índice

1. [Paso 1 — Crear OAuth App en GitHub](#paso-1--crear-oauth-app-en-github)
2. [Paso 2 — Habilitar GitHub en Firebase Console](#paso-2--habilitar-github-en-firebase-console)
3. [Paso 3 — Agregar la URL de callback en GitHub](#paso-3--agregar-la-url-de-callback-en-github)
4. [Paso 4 — Instalación del SDK](#paso-4--instalación-del-sdk)
5. [Paso 5 — Implementación — Registro](#paso-5--implementación--registro)
6. [Paso 6 — Implementación — Login](#paso-6--implementación--login)
7. [Datos que retorna GitHub](#datos-que-retorna-github)
8. [Manejo de errores](#manejo-de-errores)
9. [Archivos del proyecto](#archivos-del-proyecto)

---

## Paso 1 — Crear OAuth App en GitHub

1. Iniciar sesión en [github.com](https://github.com).
2. Ir a **Settings** (menú de perfil, esquina superior derecha).
3. En el menú lateral izquierdo, ir a **Developer settings**.
4. Clic en **OAuth Apps** → **New OAuth App**.
5. Completar el formulario:

| Campo | Valor |
|---|---|
| **Application name** | Nombre de tu app (ej. `ProyectoReact`) |
| **Homepage URL** | `http://localhost:5173` (en desarrollo) |
| **Authorization callback URL** | Se completa en el Paso 3 |

6. Clic en **Register application**.
7. En la página de la app creada:
   - Copiar el **Client ID**.
   - Clic en **Generate a new client secret** → copiar el **Client Secret**.

> Guarda el Client Secret en un lugar seguro; GitHub solo lo muestra una vez.

---

## Paso 2 — Habilitar GitHub en Firebase Console

1. Ir a [Firebase Console](https://console.firebase.google.com) → proyecto.
2. Menú lateral: **Build → Authentication → Sign-in method**.
3. Clic en **GitHub**.
4. Activar el interruptor **Enable**.
5. Pegar el **Client ID** y **Client Secret** obtenidos en el Paso 1.
6. Copiar la **Authorization callback URL** que muestra Firebase (la necesitarás en el siguiente paso).
   - Formato: `https://TU-PROYECTO.firebaseapp.com/__/auth/handler`
7. Clic en **Save**.

---

## Paso 3 — Agregar la URL de callback en GitHub

1. Volver a [github.com → Settings → Developer settings → OAuth Apps](https://github.com/settings/developers).
2. Seleccionar la app creada en el Paso 1.
3. En el campo **Authorization callback URL**, pegar la URL copiada de Firebase:
   ```
   https://TU-PROYECTO.firebaseapp.com/__/auth/handler
   ```
4. Clic en **Update application**.

> Este paso es obligatorio. Sin él, GitHub rechazará la autenticación con error de callback inválido.

---

## Paso 4 — Instalación del SDK

```bash
npm install firebase
```

---

## Paso 5 — Implementación — Registro

**`src/pages/RegistroUsuario.jsx`**

```js
import {
  getAuth,
  signInWithPopup,
  GithubAuthProvider
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { registrarSesion } from "../services/historialService";
import app from "../firebase";

const auth = getAuth(app);
const db   = getFirestore(app);

// Divide "Nombre Apellido" en partes
const splitDisplayName = (displayName = "") => {
  const partes = displayName.trim().split(" ").filter(Boolean);
  if (partes.length === 0) return { nombre: "", apellido: "" };
  if (partes.length === 1) return { nombre: partes[0], apellido: "" };
  if (partes.length === 2) return { nombre: partes[0], apellido: partes[1] };
  return {
    nombre:   partes.slice(0, -2).join(" "),
    apellido: partes.slice(-2).join(" "),
  };
};

// Guarda en Firestore solo si el documento aún no existe
const guardarUsuarioSiNuevo = async (uid, datos) => {
  const userRef = doc(db, "users", uid);
  const snap    = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, { ...datos, createdAt: new Date() });
  }
};

const loginWithGithub = async () => {
  // 1. Abrir popup de GitHub
  const result = await signInWithPopup(auth, new GithubAuthProvider());

  const { uid, displayName, email, photoURL } = result.user;
  const { nombre, apellido } = splitDisplayName(displayName);

  // 2. Guardar en Firestore si es la primera vez
  await guardarUsuarioSiNuevo(uid, {
    nombre,
    apellido,
    email:    email    || "",
    provider: "github",
    photoURL: photoURL || "",
  });

  // 3. Registrar sesión en el historial
  await registrarSesion(nombre, apellido, "github", uid);

  navigate("/perfil");
};
```

---

## Paso 6 — Implementación — Login

**`src/pages/LoginPage.jsx`**

```js
import {
  getAuth,
  signInWithPopup,
  GithubAuthProvider
} from "firebase/auth";

const handleGithubLogin = () =>
  handleSocialLogin(new GithubAuthProvider(), "github");

// handleSocialLogin es el mismo helper genérico de social login
// Ver src/pages/LoginPage.jsx para la implementación completa
```

---

## Datos que retorna GitHub

Después de `signInWithPopup`, `result.user` contiene:

| Campo | Descripción | Ejemplo |
|---|---|---|
| `uid` | ID único en Firebase | `"abc123..."` |
| `displayName` | Nombre público del perfil de GitHub | `"Kevin Peñaranda"` |
| `email` | Email del perfil (puede ser `null` si es privado) | `"kevin@gmail.com"` |
| `photoURL` | URL del avatar de GitHub | CDN de GitHub (estable) |
| `emailVerified` | `true` si el email fue verificado en GitHub | `true` / `false` |

> **Atención:** GitHub permite que el email sea privado. Si `email` es `null`, guardarlo como `""` en Firestore para no generar errores.

---

## Manejo de errores

| Código | Causa | Solución |
|---|---|---|
| `auth/popup-blocked` | Navegador bloqueó el popup | Pedir permiso para ventanas emergentes |
| `auth/popup-closed-by-user` | Usuario cerró el popup | No mostrar error |
| `auth/account-exists-with-different-credential` | El correo ya está registrado con otro proveedor | Iniciar sesión con el método original |

---

## Archivos del proyecto

| Archivo | Responsabilidad |
|---|---|
| `src/pages/RegistroUsuario.jsx` | `loginWithGithub` — registro/login desde la vista de registro |
| `src/pages/LoginPage.jsx` | `handleGithubLogin` → `handleSocialLogin` — login desde la vista de login |
| `src/services/historialService.js` | `registrarSesion` — guarda la sesión en Firestore |

---

## Flujo completo

```
Usuario hace clic en "GitHub"
        │
        ▼
signInWithPopup(auth, new GithubAuthProvider())
        │
        ├─► Firebase redirige al popup de GitHub
        │
        ▼
GitHub autentica y retorna al callback de Firebase
        │
        ▼
Firebase retorna result.user con datos del perfil
        │
        ├─► ¿existe doc en users/{uid}? ──No──► setDoc() crea el documento
        │                               ──Sí──► (no sobreescribir)
        │
        ▼
registrarSesion(nombre, apellido, "github", uid)
        │
        ▼
navigate("/perfil")
```

---

## Resumen de configuración

```
GitHub Developer Settings
  └─► OAuth App
        ├─► Client ID       ──► Firebase Console → GitHub provider
        ├─► Client Secret   ──► Firebase Console → GitHub provider
        └─► Callback URL    ◄── Firebase Console (copiar de ahí)
```
