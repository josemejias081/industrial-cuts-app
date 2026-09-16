---
name: Generador de UI con clases de Tailwind CSS
description: "Use when creating the index.html UI with responsive and accessible Tailwind CSS classes while preserving the visual style of tubular.html and linking to tubular.html and plate.html."
argument-hint: "Describe el objetivo de la interfaz, sus ventajas y posibles inconvenientes"
agent: "Senior Rails Full-Stack"
tools: [read, search, edit, execute, todo]
---

Crea la UI indicada en `index.html`:
${selection}
${input:target: Archivo o contexto adicional}

Objetivo de la creacion:
${input:goal: Describe el resultado esperado, sus ventajas y posibles inconvenientes}

Implementa la solucion con estas condiciones:

- Identifica si el proyecto usa Tailwind CSS, Bootstrap u otro sistema antes de escribir clases. Si Tailwind no esta disponible, no introduzcas una dependencia nueva sin justificarla.
- Usa clases de Tailwind CSS siempre que formen parte de la configuracion existente del proyecto.
- Conserva y reutiliza el lenguaje visual, colores, tipografia, espaciado y patrones de `tubular.html`.
- Incluye en `index.html` un boton o enlace accesible para acceder a `tubular.html` y otro para acceder a `plate.html`.
- Usa HTML5 semantico, labels asociados cuando existan formularios, foco visible, contraste suficiente y ARIA solo cuando sea necesario.
- Diseña mobile-first y responsive para movil, tablet y escritorio.
- Cubre los estados de carga, error, vacio, exito y deshabilitado cuando apliquen.
- Respeta los patrones, estilos y estructura existentes del proyecto.
- No modifiques `tubular.html` ni `plate.html` salvo que sea estrictamente necesario para conservar la consistencia visual.
- Agrega o actualiza pruebas de vista o interaccion si el proyecto tiene esa cobertura.
- Valida el resultado con las herramientas disponibles y reporta cualquier supuesto, mejora de rendimiento o riesgo de accesibilidad.
