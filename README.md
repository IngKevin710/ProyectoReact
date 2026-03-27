# 👥 Integrantes del Grupo

| Nombre          | Código |
| --------------- | ------ |
| Kevin Peñaranda | 192212 |
| Diego Rodriguez | 192269 |
| Luisa Ovallos   | 192245 |

---

# 🔐 Sistema de Autenticación con React

Aplicación desarrollada con **React** que implementa un flujo completo de autenticación en el frontend:

* Inicio de sesión
* Registro de usuario
* Recuperación de contraseña
* Restablecimiento de contraseña

---

## 🚀 Tecnologías utilizadas

* React
* React Router DOM
* JavaScript (ES6+)
* Hooks:

  * useState
  * useNavigate

---

## 📂 Estructura del proyecto

```bash
src/
│
├── pages/
│   ├── LoginPage.jsx
│   ├── RegistroUsuario.jsx
│   ├── ForgotPage.jsx
│   └── ResetPage.jsx
│
├── App.jsx
└── main.jsx
```

---

## 🧭 Rutas disponibles

| Ruta               | Descripción                 |
| ------------------ | --------------------------- |
| `/login`           | Página de inicio de sesión  |
| `/registrousuario` | Registro de nuevos usuarios |
| `/forgot`          | Recuperación de contraseña  |
| `/reset`           | Restablecer contraseña      |

---

## 🔑 Funcionalidades

### 🟣 Login

* Validación de email y contraseña
* Mostrar/ocultar contraseña 👁️
* Modal de confirmación
* Navegación a registro y recuperación

---

### 🔵 Registro de usuario

* Formulario de creación de cuenta
* Navegación desde login

---

### 🟡 Recuperar contraseña (`ForgotPage`)

* Validación de correo
* Modal de confirmación
* Redirección a `/reset`

📌 Flujo:

1. Usuario ingresa email
2. Se valida
3. Se muestra modal
4. Redirige

---

### 🔴 Restablecer contraseña (`ResetPage`)

* Validación de contraseña
* Confirmación de contraseña
* Modal de éxito
* Redirección a login

📌 Flujo:

1. Nueva contraseña
2. Confirmación
3. Validación
4. Guardado
5. Redirección

---

## 🧠 Conceptos aplicados

* Formularios controlados
* useState
* Validaciones
* Manejo de errores
* Navegación SPA
* UX con modales

---

## 🎨 Diseño

* Layout en 2 paneles
* UI moderna tipo dashboard
* Colores:

  * Morado (#6366f1)
  * Gris (#f1f5f9)

---

## ⚠️ Buenas prácticas

✅ SPA sin recarga
✅ useNavigate
✅ Validaciones
✅ Feedback visual

---

## ⚙️ Instrucciones de Ejecución

### ✅ Requisitos

* Node.js (16+)
* npm
* Git

Verificar:

```bash
node -v
npm -v
git --version
```

---

## ▶️ Ejecutar proyecto

1. Clonar repositorio:

```bash
git clone https://github.com/IngKevin710/ProyectoReact.git
```

2. Entrar al proyecto:

```bash
cd ProyectoReact
```

3. Instalar dependencias:

```bash
npm install
```

4. Ejecutar en local:

```bash
npm run dev
```
