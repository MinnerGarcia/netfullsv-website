# Auditoría visual Netfull 3.0 — Fase 1

Fecha de corte: 18 de agosto de 2026.

## Estado actual

### Arquitectura

- Sitio estático multipágina en HTML5, CSS y JavaScript nativos.
- Publicación mediante GitHub Pages con dominio `netfullsv.com`.
- 15 documentos HTML públicos antes de esta fase.
- Hoja global `assets/site.css`; comportamiento global `assets/site.js`.
- Sin framework, Tailwind, bundler, gestor de paquetes ni dependencias de runtime.
- Rutas, canonicals, sitemap, robots, JSON-LD, Open Graph y metadatos ya establecidos.
- CSP estricta, headers documentados y validadores propios en GitHub Actions.

### Fortalezas

- Identidad reconocible en azul marino, azul y cian.
- Jerarquía de titulares clara y copy comercial prudente.
- Arquitectura Hogar / Empresas separada con rutas semánticas.
- Layouts responsive mediante Grid y breakpoints centralizados.
- Navegación móvil con HTML nativo y experiencia utilizable sin JavaScript.
- Focus visible, skip links y `prefers-reduced-motion` ya presentes.
- Formularios minimizan datos y continúan en WhatsApp sin backend.
- Imágenes locales optimizadas en WebP en los casos principales.

### Debilidades e inconsistencias

- Paleta reducida a variables aisladas; faltaban escalas 50–900, estados, fondos y bordes semánticos.
- Tipografía sin roles explícitos para Display XL, H4, label, caption y overline.
- Espaciado consistente por criterio, pero sin escala completa documentada.
- Grid y anchos existían en CSS sin reglas editoriales documentadas.
- Botones carecían de variantes secondary/tertiary/icon, loading y estados completos.
- Formularios carecían de helper, error, success y variante oscura normalizados.
- Iconografía basada repetidamente en abreviaturas: `H`, `OP`, `SC`, `IE`, `ID`, `S2S`, `H&S`, entre otras.
- El sistema de cards era funcional, pero no indicaba cuándo evitar una card.
- Diagramas de red existían como soluciones puntuales, no como familia reutilizable.
- No había criterio formal de fotografía, secciones, microinteracciones o accesibilidad.
- No existía una muestra interna consolidada del sistema.

### Deuda visual y técnica

- Header y footer se repiten en cada HTML; una futura edición global requiere modificar múltiples archivos.
- Muchas páginas están compactadas en pocas líneas, lo que dificulta revisar diferencias de componentes.
- Los alias históricos de color (`--navy-*`, `--blue-*`, `--cyan-*`) mezclaban intención y valor.
- Algunos componentes usan valores directos de color que deberán migrarse gradualmente a tokens semánticos durante Fase 2.
- La familia vectorial oficial vive en un sprite SVG local. Su revisión futura debe conservar el sistema de 24 × 24, trazo de 2px y lenguaje de nodos/red.

### Componentes duplicados o repetitivos

- Cabecera, navegación móvil, footer, CTA flotante y metadatos se duplican entre rutas.
- Hero de páginas interiores y `hero-panel` repiten la misma estructura con contenido diferente.
- Feature cards y service cards se repiten correctamente, pero antes usaban símbolos inconsistentes.
- CTA bands y formularios son reutilizables visualmente, aunque están copiados como HTML.

### Problemas de escala

- Mantener nuevos componentes mediante copias HTML aumentará el riesgo de divergencia.
- Cambiar una URL, enlace legal o regla de navegación exige múltiples ediciones.
- Una migración tecnológica no es necesaria en Fase 1, pero conviene evaluar includes estáticos o generación de plantillas en una fase futura sin cambiar URLs.

### Oportunidades de simplificación

- Adoptar exclusivamente los tokens Netfull 3.0 para todo componente nuevo.
- Reducir cards donde una estructura editorial o lista sea suficiente.
- Reutilizar cinco patrones de diagramas en lugar de crear topologías por página.
- Mantener la iconografía dentro de una sola familia de nodos/red.
- Incorporar nuevas páginas mediante una plantilla que centralice cabecera, footer, CSP y metadata.

## Alcance ejecutado en Fase 1

- Se amplió la raíz de tokens manteniendo alias compatibles con Netfull 2.0.
- Se normalizaron tipografía, spacing, grid, radios, sombras, estados y movimiento.
- Se completaron variantes de botones, formularios, cards, badges y superficies.
- Se creó una familia de iconos SVG local y se retiraron la geometría CSS, emojis y abreviaturas decorativas de los componentes públicos existentes.
- Se autohospedó Inter Variable 4.1 en WOFF2 con licencia OFL, procedencia verificable y carga desde el mismo origen.
- Se completaron tokens semánticos para estados, superficies oscuras, señal, red y foco en los componentes Netfull 3.0.
- Se creó una familia accesible de cinco diagramas de red.
- Se añadió `/design-system/` como referencia no indexable y se excluyó del sitemap.
- Se documentaron reglas de fotografía, accesibilidad, responsive y uso/no uso.

## Fuera de alcance

- Rediseño integral de páginas.
- Reescritura de contenido.
- Reorganización de navegación.
- Cambios de rutas, productos, precios, cobertura, métricas o afirmaciones comerciales.
- Migración de framework o plataforma de publicación.

## Consideraciones de producción para fases siguientes

- `/design-system/` se mantiene no indexable y fuera del sitemap durante Fase 2. En Fase 3 debe decidirse si se excluye del artefacto de producción o permanece como documentación técnica no indexable.
- Header, navegación móvil y footer continúan duplicados entre HTML. Durante Fase 2 se debe verificar que no diverjan; una solución de generación estática o validación centralizada podrá evaluarse en Fase 3 sin migrar de framework por este motivo.
