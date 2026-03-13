# ⚛ React Hooks Playground
---

# 👥 Integrantes del Grupo

| Nombre          | Codigo |Hooks asignados                                                                                |
| --------------- | ------ |---------------------------------------------------------------------------------------------- |
| Kevin Peñaranda | 192212 |useCallback, useContext, useDeferredValue, useImperativeHandle, useMemo, useRef, useTransition |
| Diego Rodriguez | 192269 |useState, useReducer, useOptimistic, useEffect, useLayoutEffect, useInsertionEffect             |
|  Luisa Ovallos | 192245  | useId, useDebugValue, useSyncExternalStore, use, useActionState, useFormStatus |

---

# 🧠 Explicación de los Ejercicios por Estudiante

## 👨‍💻 Kevin Peñaranda

### Hooks desarrollados

* useCallback
* useContext
* useDeferredValue
* useImperativeHandle
* useMemo
* useRef
* useTransition
---

**useCallback**

En este ejercicio utilicé useCallback para evitar que un componente hijo se actualice cada vez que cambia algo en el componente padre.
Lo que hice fue crear un botón dentro de un componente hijo que recibe una función desde el componente principal. Con useCallback logré que esa función se mantenga igual mientras no cambie lo importante, evitando que el componente hijo se vuelva a cargar innecesariamente. De esta manera la aplicación puede funcionar de forma más eficiente.

---

**useContext**

En este caso utilicé useContext para compartir información entre varios componentes sin tener que enviar datos manualmente de uno a otro.
En el ejercicio creé un contexto que controla el tamaño del texto. Luego agregué algunos botones que permiten cambiar ese tamaño. Gracias a este hook, cualquier componente dentro del contexto puede usar ese valor sin necesidad de pasarlo por muchos niveles de componentes.

---

**useDeferredValue**

Para este ejercicio utilicé useDeferredValue para manejar mejor la actualización de una búsqueda.
Cuando el usuario escribe en el campo de texto, el valor del input se actualiza inmediatamente, pero los resultados de la búsqueda se muestran un poco después. Esto permite que la interfaz se sienta más rápida y fluida mientras el usuario sigue escribiendo.

---

**useImperativeHandle**

En este ejemplo utilicé useImperativeHandle para darle al componente padre la capacidad de controlar algunas acciones del componente hijo.
Creé un input personalizado al que se le pueden ejecutar funciones como enfocar el campo, limpiar el contenido o leer el valor que tiene escrito. De esta manera el componente padre puede interactuar directamente con ese input cuando sea necesario.

---

**useMemo**

En este ejercicio utilicé useMemo para evitar repetir un cálculo pesado cada vez que la aplicación se actualiza.
Simulé un cálculo que depende de un contador. Con este hook logré que ese cálculo solo se vuelva a hacer cuando el contador cambia, y no cuando cambian otras cosas en la interfaz. Esto ayuda a mejorar el rendimiento de la aplicación.

---

**useRef**

Para este ejemplo utilicé useRef para guardar referencias y valores que se mantienen aunque el componente se vuelva a renderizar.
Lo utilicé para dos cosas: primero para poder enfocar un campo de texto con un botón, y segundo para crear un contador interno que aumenta cada vez que se presiona un botón, pero sin provocar que toda la interfaz se vuelva a actualizar.

---

**useTransition**

En este ejercicio utilicé useTransition para manejar tareas que pueden tardar un poco más en ejecutarse.
Cuando el usuario escribe en un campo de texto, se genera una lista de elementos. Con este hook logré que la interfaz siga respondiendo rápidamente mientras esa lista se genera en segundo plano, evitando que la aplicación se sienta lenta.

---

## 👨‍💻 Diego Rodriguez

### Hooks desarrollados

* useState
* useReducer
* useOptimistic
* useEffect
* useLayoutEffect
* useInsertionEffect

---

**useState**

En este ejercicio utilicé useState para manejar estado local en un componente funcional. Lo que hice fue crear un contador simple que aumenta o disminuye cuando el usuario hace clic en los botones. Con useState logré que el valor del contador se mantenga aunque el componente se vuelva a renderizar. De esta manera, puedo guardar y actualizar información importante del componente de forma muy sencilla.

---

**useReducer**

Para este ejercicio utilicé useReducer para manejar lógica de estado más estructurada. Creé un reducer que maneja diferentes acciones como sumar y restar. Lo que hace especial este hook es que centraliza toda la lógica en un solo lugar, lo que facilita entender cómo cambia el estado. Esto es muy útil cuando tengo múltiples acciones que afectan el mismo estado, manteniendo el código organizado y fácil de mantener.

---

**useOptimistic**

En este caso utilicé useOptimistic para mejorar la experiencia del usuario cuando agrega elementos a una lista. Lo que logré fue mostrar el elemento en la interfaz al instante, sin esperar a que se complete una operación del servidor. Mientras se procesa en segundo plano, el usuario ya ve el resultado. Si algo falla, la interfaz se revierte automáticamente, pero en la mayoría de los casos el usuario tiene una experiencia fluida y rápida.

---

**useEffect**

Implementé useEffect para ejecutar un efecto secundario que cambia el título de la página cada vez que el contador aumenta. Lo que hice fue agregar un listener que actualiza el documento.title según el valor actual. También incluí una función de limpieza que restaura el título anterior cuando el componente se desmonta. Esto demuestra cómo los efectos secundarios pueden interactuar con el DOM del navegador de forma segura.

---

**useLayoutEffect**

Para este ejemplo utilicé useLayoutEffect para detectar cambios en el tamaño de la ventana. A diferencia de useEffect, este hook se ejecuta antes de que el navegador pinte la pantalla, lo que es importante para evitar parpadeos. Agregué un event listener que actualiza el ancho de la ventana en tiempo real. La diferencia es notoria cuando necesitas hacer cálculos de layout que deben ser síncronos con el DOM.

---

**useInsertionEffect**

En este ejercicio utilicé useInsertionEffect para inyectar estilos CSS dinámicos en el documento. Lo que hago es crear elementos `<style>` automáticamente en el head del documento según cambia el estado interno. Este hook es especial porque se ejecuta antes de que React actualice el DOM, lo que es perfecto para librerías de CSS-in-JS. Esto permite generar clases dinámicas con colores y propiedades que cambian según interactúa el usuario.

---

## 👨‍💻 Luisa Fernanda Ovallos Carrascal

### Hooks desarrollados

* useId
* useDebugValue
* useSyncExternalStore
* use
* useActionState
* useFormStatus

---

**useId**

En este ejercicio utilicé useId para generar identificadores únicos automáticamente. Lo que hice fue crear un formulario de registro con tres campos: nombre, correo y contraseña. Cada campo recibe un ID único generado por este hook, lo que permite conectar correctamente el label con su input sin tener que inventar nombres de ID manualmente ni preocuparme por colisiones cuando el componente se reutiliza.


**useDebugValue**

Para este ejercicio utilicé useDebugValue para agregar una etiqueta visible en React DevTools a un hook personalizado. Creé un hook llamado useOnlineStatus que detecta si el usuario tiene conexión a internet. Con useDebugValue logré que en las DevTools aparezca un mensaje claro que indica si está conectado o desconectado, facilitando el proceso de depuración sin afectar nada en la interfaz.


**useSyncExternalStore**

En este caso utilicé useSyncExternalStore para conectar React con un store que vive completamente fuera del árbol de componentes. Creé un store global que controla el tema de la aplicación entre modo claro y oscuro. Gracias a este hook, el componente se suscribe al store y se actualiza automáticamente cada vez que el tema cambia, de forma segura y sin inconsistencias.


**use**

Para este ejercicio utilicé el hook use para leer una Promise directamente dentro del renderizado. Lo implementé cargando chistes desde una API externa. En lugar de usar useEffect y useState para manejar la carga, simplemente paso la Promise al hook y React espera la respuesta usando Suspense. También agregué un botón para recargar y obtener un nuevo chiste.


**useActionState**

En este ejercicio utilicé useActionState para gestionar el estado completo de un formulario con acción asíncrona. Creé un formulario que valida el nombre ingresado. Este hook me dio tres cosas: el resultado de la última acción, si está pendiente y el handler para el form. Mientras procesa muestra un mensaje de carga, si hay error lo muestra en rojo y si todo sale bien muestra un mensaje de éxito con el nombre ingresado.


**useFormStatus**

Para este ejemplo utilicé useFormStatus para leer el estado del formulario padre desde un componente hijo. Creé un botón de submit como componente separado llamado SubmitButton que usa este hook internamente. Cuando el formulario está siendo procesado, el botón se deshabilita automáticamente y cambia su texto a "Enviando...", sin necesidad de manejar ese estado manualmente desde el componente padre. Los comentarios enviados se acumulan en una lista visible debajo del formulario.



# 📚 Tabla General de React Hooks

| Hook                 | Categoría   | Descripción                                                                          |
| -------------------- | ----------- | ------------------------------------------------------------------------------------ |
| useState             | State       | Permite manejar estado local dentro de un componente funcional.                      |
| useReducer           | State       | Maneja estados complejos usando un patrón similar a Redux.                           |
| useEffect            | Side Effect | Permite ejecutar efectos secundarios como peticiones o suscripciones.                |
| useLayoutEffect      | Side Effect | Similar a useEffect pero se ejecuta antes de que el navegador pinte la UI.           |
| useInsertionEffect   | Side Effect | Se usa principalmente para insertar estilos antes del layout.                        |
| useOptimistic        | Transition  | Permite actualizar la UI de forma optimista antes de recibir respuesta del servidor. |
| useNavigate          | Navigation  | Permite navegar entre rutas usando React Router.                                     |
| useId                | Utility     | Genera identificadores únicos para componentes accesibles.                           |
| useDebugValue        | Utility     | Permite mostrar información personalizada en React DevTools.                         |
| useSyncExternalStore | Utility     | Permite suscribirse a stores externos fuera del árbol de React.                      |
| use                  | Utility     | Permite leer promesas directamente en el render usando Suspense.                     |
| useActionState       | Form/Action | Maneja el estado y resultado de acciones en formularios.                             |
| useFormStatus        | Form/Action | Permite conocer el estado de un formulario desde componentes hijos.                  |
| useContext           | State       | Permite acceder a valores compartidos entre componentes.                             |
| useRef               | Advanced    | Permite persistir valores entre renders sin causar re-render.                        |
| useImperativeHandle  | Advanced    | Permite personalizar la referencia expuesta por un componente hijo.                  |
| useMemo              | Performance | Memoriza cálculos costosos para mejorar el rendimiento.                              |
| useCallback          | Performance | Memoriza funciones para evitar re-renderizados innecesarios.                         |
| useTransition        | Concurrency | Permite manejar actualizaciones de baja prioridad.                                   |
| useDeferredValue     | Concurrency | Diferencia valores para mantener la interfaz responsiva.                             |

