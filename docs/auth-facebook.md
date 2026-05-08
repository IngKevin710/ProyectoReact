# 🔵 Autenticación con Facebook

La autenticación con Facebook requiere crear una app en **Meta for Developers** para obtener un App ID y App Secret, configurarlos en Firebase Console, y registrar la URL de callback de Firebase en la app de Facebook.

---

## Índice

1. [Paso 1 — Crear app en Meta for Developers](#paso-1--crear-app-en-meta-for-developers)
2. [Paso 2 — Habilitar Facebook en Firebase Console](#paso-2--habilitar-facebook-en-firebase-console)
3. [Paso 3 — Configurar la URL de callback en Facebook](#paso-3--configurar-la-url-de-callback-en-facebook)
4. [Paso 4 — Agregar el dominio de la app en Facebook](#paso-4--agregar-el-dominio-de-la-app-en-facebook)
5. [Paso 5 — Instalación del SDK](#paso-5--instalación-del-sdk)
6. [Paso 6 — Implementación — Registro](#paso-6--implementación--registro)
7. [Paso 7 — Implementación — Login](#paso-7--implementación--login)
8. [Problema de foto de perfil y solución](#problema-de-foto-de-perfil-y-solución)
9. [Datos que retorna Facebook](#datos-que-retorna-facebook)
10. [Manejo de errores](#manejo-de-errores)
11. [Archivos del proyecto](#archivos-del-proyecto)

---

## Paso 1 — Crear app en Meta for Developers

1. Ir a [developers.facebook.com](https://developers.facebook.com) e iniciar sesión.
2. Clic en **My Apps → Create App**.
3. Seleccionar el tipo **Consumer** → **Next**.
4. Completar:
   - **App name**: nombre de tu proyecto
   - **App contact email**: tu correo
5. Clic en **Create App**.
6. En el panel de la app, buscar el producto **Facebook Login** → clic en **Set Up**.
7. Seleccionar plataforma **Web**.
8. En el campo **Site URL** colocar: `http://localhost:5173` (para desarrollo).
9. Guardar.
10. En el menú lateral: **App settings → Basic**.
    - Copiar el **App ID**.
    - Clic en **Show** para ver el **App Secret** → copiarlo.

---

## Paso 2 — Habilitar Facebook en Firebase Console

1. Ir a [Firebase Console](https://console.firebase.google.com) → proyecto.
2. Menú lateral: **Build → Authentication → Sign-in method**.
3. Clic en **Facebook**.
4. Activar el interruptor **Enable**.
5. Pegar el **App ID** y **App Secret** obtenidos en el Paso 1.
6. Copiar la **OAuth redirect URI** que muestra Firebase:
   ```
   https://TU-PROYECTO.firebaseapp.com/__/auth/handler
   ```
7. Clic en **Save**.

---

## Paso 3 — Configurar la URL de callback en Facebook

1. En [developers.facebook.com](https://developers.facebook.com), abrir la app.
2. Menú lateral: **Facebook Login → Settings**.
3. En el campo **Valid OAuth Redirect URIs**, pegar la URL copiada de Firebase:
   ```
   https://TU-PROYECTO.firebaseapp.com/__/auth/handler
   ```
4. Clic en **Save Changes**.

> Este paso es obligatorio. Sin él, Facebook rechazará el intento de autenticación.

---

## Paso 4 — Agregar el dominio de la app en Facebook

Para evitar el error `Given URL is not allowed by the App's settings`:

1. En la app de Facebook: **App settings → Basic**.
2. En el campo **App Domains**, agregar: `localhost`
3. Guardar cambios.

> En producción reemplazar `localhost` por tu dominio real (ej. `miapp.com`).

---

## Paso 5 — Instalación del SDK

```bash
npm install firebase
```

---

## Paso 6 — Implementación — Registro

**`src/pages/RegistroUsuario.jsx`**

```js
import {
  getAuth,
  signInWithPopup,
  FacebookAuthProvider,
  updateProfile
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

const loginWithFacebook = async () => {
  // 1. Abrir popup de Facebook
  const result = await signInWithPopup(auth, new FacebookAuthProvider());

  const { uid, displayName, email } = result.user;
  const { nombre, apellido } = splitDisplayName(displayName);

  // 2. Construir URL de foto confiable con el access token
  //    (ver sección "Problema de foto de perfil" para la explicación)
  let photoURL = result.user.photoURL || "";
  const fbCredential = FacebookAuthProvider.credentialFromResult(result);
  if (fbCredential?.accessToken && photoURL) {
    const baseURL = photoURL.split("?")[0]; // quitar tokens anteriores
    photoURL = `${baseURL}?access_token=${fbCredential.accessToken}`;
    await updateProfile(result.user, { photoURL }); // actualizar en Auth
  }

  // 3. Guardar en Firestore si es nuevo, refrescar foto si ya existe
  const userRef = doc(db, "users", uid);
  const snap    = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      nombre, apellido,
      email:    email    || "",
      provider: "facebook",
      photoURL,
      createdAt: new Date(),
    });
  } else if (photoURL) {
    await setDoc(userRef, { photoURL }, { merge: true });
  }

  // 4. Registrar sesión en el historial
  await registrarSesion(nombre, apellido, "facebook", uid);

  navigate("/perfil");
};
```

---

## Paso 7 — Implementación — Login

**`src/pages/LoginPage.jsx`**

```js
import {
  getAuth,
  signInWithPopup,
  FacebookAuthProvider,
  updateProfile
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const handleFacebookLogin = () =>
  handleSocialLogin(new FacebookAuthProvider(), "facebook");

const handleSocialLogin = async (provider, metodo) => {
  const result = await signInWithPopup(auth, provider);
  const { uid, displayName, email } = result.user;

  const parts    = (displayName || "").split(" ").filter(Boolean);
  const nombre   = parts[0]                  || "Sin nombre";
  const apellido = parts.slice(1).join(" ") || "Sin apellido";

  // Para Facebook: construir URL de foto con access token
  let photoURL = result.user.photoURL || "";
  if (metodo === "facebook" && photoURL) {
    const fbCredential = FacebookAuthProvider.credentialFromResult(result);
    if (fbCredential?.accessToken) {
      const baseURL = photoURL.split("?")[0];
      photoURL = `${baseURL}?access_token=${fbCredential.accessToken}`;
      await updateProfile(result.user, { photoURL });
    }
  }

  const userRef = doc(db, "users", uid);
  const snap    = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      nombre, apellido,
      email: email || "", provider: metodo, photoURL, createdAt: new Date(),
    });
  } else if (metodo === "facebook" && photoURL) {
    await setDoc(userRef, { photoURL }, { merge: true });
  }

  await registrarSesion(nombre, apellido, metodo, uid);
  navigate("/perfil");
};
```

---

## Problema de foto de perfil y solución

### El problema

Firebase Auth guarda el `photoURL` de Facebook como:

```
https://graph.facebook.com/{facebook-user-id}/picture
```

Esta URL **sin token** puede fallar al cargar en un `<img>` según la configuración de privacidad del usuario en Facebook.

### La solución

Al hacer `signInWithPopup`, Facebook retorna un **access token** temporal. Se usa ese token para construir una URL confiable:

```js
const fbCredential = FacebookAuthProvider.credentialFromResult(result);
const accessToken  = fbCredential.accessToken;

// Construir desde la URL base (sin query string anterior)
const baseURL  = result.user.photoURL.split("?")[0];
const photoURL = `${baseURL}?access_token=${accessToken}`;
```

### Por qué usar `.split("?")[0]`

En logins posteriores, `result.user.photoURL` ya contiene el token del login anterior:

```
https://graph.facebook.com/123/picture?access_token=TOKEN_VIEJO
```

Si se agrega el nuevo token sin quitar el anterior, la URL queda inválida:

```
# ❌ Inválido
https://graph.facebook.com/123/picture?access_token=TOKEN_VIEJO?access_token=TOKEN_NUEVO

# ✅ Correcto
https://graph.facebook.com/123/picture?access_token=TOKEN_NUEVO
```

### Por qué actualizar en cada login

El access token de Facebook expira. Al llamar `updateProfile(user, { photoURL })` en cada login, el `user.photoURL` en Firebase Auth siempre tiene el token más reciente. Además, se guarda en Firestore con `setDoc(..., { merge: true })` para usarlo en otros lugares.

---

## Datos que retorna Facebook

Después de `signInWithPopup`, `result.user` contiene:

| Campo | Descripción | Ejemplo |
|---|---|---|
| `uid` | ID único en Firebase | `"abc123..."` |
| `displayName` | Nombre completo del perfil de Facebook | `"Kevin Peñaranda"` |
| `email` | Email de la cuenta (puede ser `null`) | `"kevin@gmail.com"` |
| `photoURL` | URL de la foto (requiere access token para cargar) | Ver sección anterior |

El `result` también contiene la credencial OAuth:

```js
const credential  = FacebookAuthProvider.credentialFromResult(result);
const accessToken = credential.accessToken; // token de acceso a la Graph API
```

---

## Manejo de errores

| Código | Causa | Solución |
|---|---|---|
| `auth/popup-blocked` | Navegador bloqueó el popup | Pedir permiso para ventanas emergentes |
| `auth/popup-closed-by-user` | Usuario cerró el popup | No mostrar error |
| `auth/account-exists-with-different-credential` | El correo ya está registrado con otro proveedor | Iniciar sesión con el método original |
| `Given URL is not allowed` | Dominio no registrado en la app de Facebook | Agregar dominio en Facebook → App Settings → App Domains |

---

## Archivos del proyecto

| Archivo | Responsabilidad |
|---|---|
| `src/pages/RegistroUsuario.jsx` | `loginWithFacebook` — registro/login desde la vista de registro |
| `src/pages/LoginPage.jsx` | `handleFacebookLogin` → `handleSocialLogin` — login desde login |
| `src/services/historialService.js` | `registrarSesion` — guarda la sesión en Firestore |

---

## Flujo completo

```
Usuario hace clic en "Facebook"
        │
        ▼
signInWithPopup(auth, new FacebookAuthProvider())
        │
        ├─► Firebase abre popup de Facebook
        │
        ▼
Facebook autentica y retorna result
        │
        ├─► Extraer access token de FacebookAuthProvider.credentialFromResult(result)
        ├─► Construir photoURL: baseURL + "?access_token=" + token
        ├─► updateProfile(user, { photoURL }) — actualizar en Firebase Auth
        │
        ├─► ¿existe doc en users/{uid}?
        │     ──No──► setDoc() crea el documento con photoURL
        │     ──Sí──► setDoc({ photoURL }, { merge: true }) actualiza solo la foto
        │
        ▼
registrarSesion(nombre, apellido, "facebook", uid)
        │
        ▼
navigate("/perfil")
```

---

## Resumen de configuración

```
Meta for Developers
  └─► App
        ├─► App ID         ──► Firebase Console → Facebook provider
        ├─► App Secret     ──► Firebase Console → Facebook provider
        ├─► OAuth Redirect ◄── Firebase Console (copiar de ahí)
        └─► App Domains    ──► localhost (desarrollo) / dominio real (producción)
```
