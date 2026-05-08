# 👥 Integrantes del Grupo

| Nombre          | Código |
| --------------- | ------ |
| Kevin Peñaranda | 192212 |
| Diego Rodriguez | 192269 |
| Luisa Ovallos   | 192245 |

---

# 🔐 Sistema de Autenticación con React + Firebase

Aplicación desarrollada con **React** y **Firebase** que implementa un flujo completo de autenticación:

- Inicio de sesión con correo/contraseña
- Registro de usuario
- Autenticación social (Google, GitHub, Facebook)
- Recuperación y restablecimiento de contraseña
- Perfil de usuario con historial de sesiones
- Cierre de sesión por inactividad

---

## 🚀 Tecnologías utilizadas

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | Framework de UI |
| React Router DOM | 7 | Navegación SPA |
| Firebase Auth | 12 | Autenticación |
| Firebase Firestore | 12 | Base de datos |
| Vite | 7 | Bundler / Dev server |

### Hooks personalizados

| Hook | Descripción |
|---|---|
| `useAuthUser` | Suscripción al estado de autenticación de Firebase |
| `useInactivityLogout` | Cierre automático de sesión tras 5 minutos sin actividad |

---

## 📂 Estructura del proyecto

```
src/
├── pages/
│   ├── LandingPage.jsx          # Página de inicio / bienvenida
│   ├── LoginPage.jsx            # Inicio de sesión (email + social)
│   ├── RegistroUsuario.jsx      # Registro de cuenta
│   ├── ForgotPage.jsx           # Solicitud de recuperación de contraseña
│   ├── ResetPage.jsx            # Restablecimiento de contraseña (token)
│   ├── ProfilePage.jsx          # Perfil + historial de sesiones
│   └── HistorialAuth.jsx        # Vista pública del historial
│
├── components/
│   └── ProtectedRoute.jsx       # HOC: redirige si no hay sesión activa
│
├── hooks/
│   ├── useAuthUser.js           # Estado del usuario autenticado
│   └── useInactivityLogout.js   # Temporizador de inactividad
│
├── services/
│   └── historialService.js      # CRUD del historial en Firestore
│
├── firebase.js                  # Inicialización de Firebase
├── App.jsx                      # Definición de rutas
└── main.jsx                     # Punto de entrada
```

---

## 🧭 Rutas disponibles

| Ruta | Componente | Protegida | Descripción |
|---|---|---|---|
| `/` | `LandingPage` | No | Página de bienvenida |
| `/login` | `LoginPage` | No | Inicio de sesión |
| `/registrousuario` | `RegistroUsuario` | No | Crear cuenta |
| `/forgot` | `ForgotPage` | No | Recuperar contraseña |
| `/reset` | `ResetPage` | No | Restablecer contraseña (vía token del email) |
| `/perfil` | `ProfilePage` | Sí | Perfil + historial de sesiones |
| `/historial` | `HistorialAuth` | Sí | Historial global |

---

## 🔑 Métodos de autenticación

| Método | Archivo de referencia |
|---|---|
| Email / Contraseña | [`docs/auth-email.md`](docs/auth-email.md) |
| Google | [`docs/auth-google.md`](docs/auth-google.md) |
| GitHub | [`docs/auth-github.md`](docs/auth-github.md) |
| Facebook | [`docs/auth-facebook.md`](docs/auth-facebook.md) |

---

## 🧠 Funcionalidades destacadas

### Autenticación
- Login con email/contraseña y proveedores sociales (Google, GitHub, Facebook)
- Registro con `createUserWithEmailAndPassword` + `updateProfile`
- Recuperación de contraseña con `sendPasswordResetEmail` y verificación del proveedor vinculado
- Restablecimiento con `verifyPasswordResetCode` + `confirmPasswordReset`
- Cuentas sociales bloqueadas para cambio de contraseña (la contraseña la gestiona el proveedor)

### Sesiones
- Historial de sesiones guardado en Firestore (`historialAuth`)
- `lastHeartbeat` actualizado cada 60 s mientras el usuario está activo
- Sesiones sin heartbeat por más de 5 minutos se cierran automáticamente
- Cierre por inactividad con cuenta regresiva visible

### Perfil
- Foto de perfil desde el proveedor (Google, GitHub, Facebook)
- Para Facebook: URL construida con access token para garantizar carga
- Nombre y apellido almacenados en Firestore (`users/{uid}`)

---

## ⚙️ Configuración inicial

### 1. Clonar e instalar

```bash
git clone https://github.com/IngKevin710/ProyectoReact.git
cd ProyectoReact
npm install
```

### 2. Crear proyecto en Firebase

1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Crear un nuevo proyecto
3. Registrar una app web → copiar la configuración

### 3. Configurar `src/firebase.js`

```js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export default app;
```

### 4. Habilitar servicios en Firebase Console

- **Authentication** → Sign-in method → habilitar los proveedores deseados
- **Firestore Database** → crear base de datos en modo producción

### 5. Ejecutar

```bash
npm run dev
```

---

## 📋 Colecciones de Firestore

### `users`
Documento por `uid` del usuario.

| Campo | Tipo | Descripción |
|---|---|---|
| `nombre` | string | Nombre |
| `apellido` | string | Apellido |
| `email` | string | Correo |
| `provider` | string | `email` / `google` / `github` / `facebook` |
| `photoURL` | string | URL de foto de perfil |
| `createdAt` | timestamp | Fecha de registro |

### `historialAuth`
Un documento por sesión iniciada.

| Campo | Tipo | Descripción |
|---|---|---|
| `uid` | string | UID del usuario |
| `nombre` | string | Nombre al momento del login |
| `apellido` | string | Apellido al momento del login |
| `metodo` | string | `email` / `google` / `github` / `facebook` |
| `horaInicio` | timestamp | Hora de inicio de sesión |
| `horaSalida` | timestamp \| null | Hora de cierre (null si activa) |
| `estado` | string | `activo` / `finalizado` |
| `lastHeartbeat` | timestamp | Último ping de actividad (cada 60 s) |

---

## ✅ Requisitos del entorno

- Node.js 18+
- npm 9+
- Cuenta en [Firebase](https://firebase.google.com)

```bash
node -v   # >= 18
npm -v    # >= 9
```
