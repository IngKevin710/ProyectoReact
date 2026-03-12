# ⚛ React Hooks Playground
---

# 👥 Integrantes del Grupo

| Nombre          | Codigo |Hooks asignados                                                                                |
| --------------- | ------ |---------------------------------------------------------------------------------------------- |
| Kevin Peñaranda | 192212 |useCallback, useContext, useDeferredValue, useImperativeHandle, useMemo, useRef, useTransition |
| Diego Rodriguez | 192269 |useState, useReducer, useOptimistic, useEffect, useLayoutEffect, useInsertionEffect             |
| Estudiante 3    |        |                                                                                               |

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

## 👨‍💻 Estudiante 3

### Hooks desarrollados

*

### Explicación del ejercicio

*(Explicación del estudiante)*


---

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

