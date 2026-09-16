---
name: Crear controlador Stimulus
description: "Use when creating or improving a small reusable Stimulus controller for Rails and Hotwire interactions."
argument-hint: "Describe la interaccion, los elementos HTML y los estados esperados"
agent: "Senior Rails Full-Stack"
tools: [read, search, edit, execute, todo]
---

Crea o mejora un controlador Stimulus para esta interaccion:
${input:behavior: Describe el comportamiento esperado}

Contexto disponible:
${selection}
${input:context: Indica las vistas, partials, rutas o controladores relacionados}

Requisitos:
- Inspecciona la estructura JavaScript, el registro de controladores y los patrones Stimulus existentes.
- Usa targets, values y actions de Stimulus; evita variables globales y JavaScript inline.
- Define estados de carga, error, vacio y limpieza cuando correspondan.
- Mantiene la accesibilidad, navegacion por teclado y compatibilidad con Turbo.
- Usa JavaScript ES6+ claro y modular, sin mutaciones innecesarias.
- Actualiza las vistas y pruebas relevantes y ejecuta la validacion disponible.
- Entrega un resumen breve de archivos, comportamiento y validacion.
