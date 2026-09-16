---
name: Refactorizar modelo Rails
description: "Use when refactoring a Ruby on Rails model to clarify responsibilities, improve maintainability, or extract domain logic safely."
argument-hint: "Describe el objetivo del refactor y las restricciones del modelo"
agent: "Senior Rails Full-Stack"
tools: [read, search, edit, execute, todo]
---

Refactoriza el modelo Rails seleccionado o indicado: ${selection}${input:target: Modelo, archivo o contexto adicional}

Objetivo del refactor:
${input:goal: Describe el resultado esperado}

Sigue estas reglas:
- Lee el modelo, sus asociaciones, validaciones, callbacks, scopes, servicios relacionados y pruebas antes de editar.
- Mantén el comportamiento publico salvo que el objetivo pida cambiarlo.
- Conserva controladores delgados y extrae logica de dominio a service objects o concerns solo cuando exista una responsabilidad clara.
- Revisa N+1 queries, transacciones, validaciones, indices y riesgos de seguridad.
- Respeta RuboCop y las convenciones existentes.
- Actualiza o agrega pruebas enfocadas para los casos modificados.
- Ejecuta la validacion mas especifica disponible y resume los cambios, riesgos y comandos ejecutados.
