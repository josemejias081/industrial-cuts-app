# CutMaster Pro

CutMaster Pro es una herramienta web para planificar cortes industriales sobre barras, perfiles, placas y tableros. Permite distribuir piezas, considerar el kerf de corte, visualizar los planos de trabajo y exportar reportes PDF para producción.

La aplicación está diseñada como una interfaz estática, ligera y orientada al uso diario en computadoras de escritorio y laptops.

## Estado actual

El proyecto se encuentra en fase de MVP funcional. Las herramientas principales, la persistencia local, la visualización de cortes y la exportación PDF están implementadas. Todavía no es una plataforma multiusuario ni utiliza un servidor o una base de datos.

## Funcionalidades

### Inicio

- Acceso centralizado a las herramientas de corte lineal y corte 2D.
- Navegación consistente entre las páginas de la aplicación.
- Interfaz responsive para escritorio, laptop, tablet y móvil.

### Barras y perfiles

Disponible en [`tubular.html`](tubular.html).

- Configuración de la longitud de la barra base.
- Carga de medidas y cantidades de cortes.
- Distribución automática de cortes sobre las barras disponibles.
- Cálculo del kerf entre cortes.
- Visualización proporcional de cortes y espacios de kerf.
- Cálculo del sobrante por barra y del sobrante total.
- Persistencia local del proyecto.
- Exportación de un reporte PDF con:
  - Encabezado del proyecto.
  - Kerf y longitud de barra.
  - Tabla de barras, cantidades, medidas y sobrantes.
  - Recuadro para observaciones.
  - Espacio para firma del operario y fecha.

### Placas y tableros

Disponible en [`plate.html`](plate.html).

- Selección de medidas comerciales:
  - `3000 x 1500 mm`.
  - `2000 x 1000 mm`.
- Configuración de costo y kerf.
- Opción para permitir o impedir la rotación de piezas.
- Carga de descripción, largo, ancho y cantidad de piezas.
- Distribución automática sobre una o varias chapas.
- Validación de piezas que no caben en la medida seleccionada.
- Visualización de planos rectangulares proporcionales.
- Identificación de retazos recuperables.
- Persistencia local del pedido y del tipo de chapa.
- Exportación de reportes PDF con:
  - Encabezado consistente con el reporte de perfiles.
  - Tabla superior de cantidad, descripción, largo y ancho.
  - Plano de corte por tablero.
  - Recuadro para observaciones.
  - Firma del operario y fecha.

### Sistema visual

- Modo claro y modo oscuro.
- Preferencia inicial basada en `prefers-color-scheme`.
- Preferencia elegida por el usuario persistida en `localStorage`.
- Contraste de color cuidado para facilitar la lectura de los textos principales.
- Navegación por teclado y estados de foco visibles.
- Iconos de Lucide para acciones y estados.

## Requisitos

- Navegador moderno con soporte para:
  - JavaScript ES6+.
  - `localStorage`.
  - CSS Grid y Flexbox.
  - `window.matchMedia`.
- Conexión a internet para cargar las dependencias externas desde CDN.
- No se requiere Node.js, Ruby, Rails ni un proceso de compilación para ejecutar la aplicación actual.

## Ejecución local

La aplicación puede abrirse directamente desde el sistema de archivos. Para una experiencia más consistente, se recomienda usar un servidor HTTP local.

### Opción 1: servidor con Python

Desde la raíz del proyecto:

```bash
python3 -m http.server 8000
```

Después abre:

```text
http://localhost:8000/
```

## Demo online

La aplicación está preparada para publicarse automáticamente mediante GitHub Pages:

```text
https://josemejias081.github.io/industrial-cuts-app/
```

Cada cambio enviado a la rama `main` dispara el workflow de publicación definido en [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

### Opción 2: servidor con Ruby

Si Ruby está disponible:

```bash
ruby -run -e httpd . -p 8000
```

Después abre:

```text
http://localhost:8000/
```

## Estructura del proyecto

```text
industrial-cuts-app/
├── index.html
├── tubular.html
├── plate.html
├── css/
│   ├── common.css
│   ├── index.css
│   ├── plate.css
│   └── tubular.css
├── js/
│   ├── common.js
│   ├── plate.js
│   └── tubular.js
└── .github/
    ├── agents/
    │   └── senior-rails-full-stack.agent.md
    └── prompts/
        ├── create-stimulus-controller.prompt.md
        ├── generate-ui-component.prompt.md
        ├── improve-interface.prompt.md
        └── refactor-rails-model.prompt.md
```

## Dependencias externas

Las páginas cargan estas bibliotecas mediante CDN:

- [Tailwind CSS](https://cdn.tailwindcss.com): utilidades CSS.
- [Lucide](https://unpkg.com/lucide@latest): iconos de interfaz.
- [jsPDF](https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js): generación de PDF.
- [jsPDF AutoTable](https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js): tablas en PDF.
- [html2canvas](https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js): captura de planos para el PDF de placas.
- [Inter](https://fonts.googleapis.com): tipografía de la interfaz.

Para un entorno de producción con requisitos estrictos de disponibilidad o privacidad, conviene fijar versiones y servir las dependencias localmente.

## Persistencia local

La aplicación no utiliza una base de datos. Los datos se guardan en el navegador mediante `localStorage`.

Claves principales:

| Clave | Uso |
| --- | --- |
| `cutmaster-theme` | Preferencia de modo claro u oscuro. |
| `wf_longitud` | Longitud de barra base. |
| `wf_kerf` | Kerf utilizado para barras y perfiles. |
| `wf_cortes` | Pedido de cortes lineales. |
| `wf_tipo_chapa` | Medida comercial de chapa seleccionada. |
| `wf_biz_2d` | Pedido de piezas para placas y tableros. |

La información es específica del navegador y del dispositivo. Limpiar los datos del sitio elimina los proyectos almacenados localmente.

Los proyectos no se sincronizan entre dispositivos y no se recuperan automáticamente después de borrar los datos del navegador. Antes de una operación de producción conviene conservar el PDF exportado o implementar una estrategia de respaldo.

## Criterios de cálculo

### Cortes lineales

La longitud ocupada por una barra se calcula como:

```text
suma de las medidas de corte + (cantidad de cortes - 1) x kerf
```

El kerf se aplica entre cortes, pero no se suma después del último corte de la barra.

### Placas y tableros

El algoritmo utiliza espacios libres rectangulares y considera el kerf al determinar si una pieza cabe en orientación normal o rotada. Cuando una pieza no cabe en la chapa actual, se crea una nueva chapa y se conserva la orientación válida de la pieza.

Las coordenadas `X` e `Y` de los reportes representan la posición de cada pieza dentro del tablero seleccionado, expresada en milímetros.

## Flujo recomendado

1. Abre `index.html`.
2. Selecciona barras y perfiles o placas y tableros.
3. Define las medidas de material y el kerf antes de cargar el pedido.
4. Agrega las piezas y revisa el plano generado.
5. Comprueba sobrantes, retazos y distribución.
6. Exporta el PDF para producción.
7. Completa las observaciones y la firma del operario en el reporte.

## Validación y mantenimiento

Antes de entregar cambios:

1. Comprueba que las tres páginas se abren sin errores en la consola del navegador.
2. Prueba el cambio de tema en modo claro y oscuro.
3. Verifica la navegación entre `index.html`, `tubular.html` y `plate.html`.
4. Prueba el kerf con valor cero y con un valor positivo.
5. En placas, valida ambas medidas comerciales y piezas rotadas.
6. Comprueba que una pieza que no cabe genere un mensaje claro.
7. Genera los dos tipos de PDF y revisa tablas, planos, observaciones y firma.
8. Prueba el layout en una pantalla de escritorio y una ventana reducida.

## Limitaciones actuales

- La persistencia es local y no permite colaboración entre usuarios.
- No existe autenticación ni control de permisos.
- Las dependencias principales se cargan desde CDN.
- La distribución utiliza heurísticas de empaquetado; no garantiza una solución matemáticamente óptima para todos los pedidos.
- Las validaciones de producción deben confirmar tolerancias, sentido del corte, material, herramienta y margen técnico antes de fabricar.

## Próximos pasos

- Añadir importación y exportación de pedidos en un formato estructurado.
- Incorporar historial de trabajos y copias de seguridad.
- Servir las dependencias con versiones fijadas o integrarlas en un proceso de compilación.
- Añadir pruebas automatizadas para los algoritmos de distribución y generación de PDF.
- Validar los resultados con talleres y operadores de producción.
- Evaluar usuarios, permisos y almacenamiento remoto para una futura versión multiusuario.

## Personalización del agente de desarrollo

El proyecto incluye configuraciones reutilizables para VS Code:

- [`Senior Rails Full-Stack`](.github/agents/senior-rails-full-stack.agent.md): agente especializado en Rails, JavaScript, Hotwire, Tailwind, Bootstrap y HTML5.
- [`Prompts reutilizables`](.github/prompts/): tareas para refactorizar modelos Rails, crear controladores Stimulus, generar componentes UI y mejorar interfaces.

## Licencia

No se ha definido todavía una licencia para este proyecto.
