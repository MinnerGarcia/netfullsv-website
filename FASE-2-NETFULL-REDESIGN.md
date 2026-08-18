# NETFULL 3.0 — Fase 2: Rediseño UX/UI completo

Fecha de cierre técnico: 18 de agosto de 2026
Rama: `feat/netfull-3-phase-2-redesign`
Base aprobada de Fase 1: `2b7476f6357028288cccc0ee0346ff87ee9ec1cd`
Estado: listo para revisión externa; no fusionado ni desplegado.

## Objetivo

Transformar el sitio estático en una experiencia comercial diferenciada,
confiable y responsive, sin alterar precios, inventar evidencia ni ampliar el
alcance hacia pagos u otras funciones de Fase 3.

## Principios aplicados

- Hogar y Empresas tienen recorridos, lenguaje y acciones distintos.
- Las soluciones empresariales explican una decisión operativa, no una lista de
  tecnologías.
- El contenido comercial conserva condiciones y disclaimers verificables.
- No se publican SLA, métricas, clientes, certificaciones, cobertura o
  programación sin respaldo.
- HTML, CSS y JavaScript continúan siendo nativos y progresivamente mejorables.
- Diseño responsive desde 360 px, navegación por teclado y reducción de movimiento.

## Cambios globales

- Cabecera, navegación móvil y footer compartidos entre trece rutas públicas.
- Fuente única en `.github/scripts/site-shell.mjs` y sincronizador mecánico en
  `.github/scripts/sync-shell.mjs`.
- CI rechaza una divergencia severa del header o footer.
- Footer reorganizado en Hogar, Empresas, Soporte, Empresa y Legal.
- Componentes nuevos utilizan tokens semánticos y el sprite SVG local.
- No se añadieron bibliotecas, fuentes remotas, trackers ni scripts de terceros.

## Arquitectura y decisiones por página

| Página | Arquitectura UX | Decisión visual |
|---|---|---|
| Inicio | Orientación → Hogar/Empresas → propuesta resumida → método → TV → cobertura | Red propietaria y recorridos de gran escala |
| Hogar | Uso → planes → actividades → TV → cobertura | Selección residencial y planes editoriales |
| Empresas | Dependencias → soluciones → método → diagnóstico | Consola de operación y directorio irregular |
| Internet Empresarial | Demanda → flujo → escenarios → decisión | Barras conceptuales y ledger operativo |
| Internet Dedicado | Impacto → alternativas → señales → propuesta | Medidor conceptual y continuo de elección |
| Secure Connect | Acceso → resultados → arquitecturas → evaluación | Núcleo privado y stacks de topología |
| Interconexión | Mapa → inventario → diseño → asesoría | Mapa radial de sedes y flujo de arquitectura |
| IP Pública | Propósito → cuándo sí/no → capas → orientación | Recurso protegido y split de decisión |
| Soporte | Contexto → organización → buen reporte → alcance | Ruta de atención y checklist editorial |
| TV Digital | Categorías → deportes → experiencia → consulta | Pantallas abstractas y espectro de contenido |
| Nosotros | Manifiesto → principios → Hogar/Empresas → contacto | Composición de marca y ledger de principios |
| Cobertura | Zona → servicio → necesidad → asesor | Pulso de zona sin mapa ni falso resultado |
| Contacto | Motivo → ruta → mensaje → WhatsApp | Cuatro rutas y canales verificables |
| 404 | Explicación → recuperación → destinos | Ruta visual interrumpida sin JavaScript |

## Inicio

- Hero propietario de infraestructura y mensaje transversal de conectividad.
- Dos recorridos de gran escala: Hogar y Empresas.
- Resumen residencial con precios existentes, bloque empresarial editorial,
  método en cuatro momentos, módulo TV propio y cierre de cobertura.

## Hogar

- Hero orientado a uso y simultaneidad.
- Planes de 30 Mbps/$28, 100 Mbps/$33 y 200 Mbps/$53 conservados sin cambios.
- CTA corregido a solicitud de cobertura, guía de actividades y puente a TV.

## Empresas

- Hero de operación conectada, mapa de dependencias y directorio jerárquico de
  seis soluciones.
- Método de diseño basado en usuarios, aplicaciones, simultaneidad, criticidad
  y crecimiento.

## Soluciones empresariales

- Internet Empresarial: demanda, simultaneidad y escenarios de trabajo.
- Internet Dedicado: impacto operativo y comparación orientativa.
- Secure Connect: accesos autorizados y arquitecturas posibles.
- Interconexión: inventario de sedes, recursos, usuarios y flujos.
- IP Pública: propósito, casos de no aplicación y advertencia de seguridad.
- Soporte Empresarial: contexto, información útil para reportar y alcance prudente.

## TV Digital

- Hero abstracto y seis categorías propias: en vivo, deportes, cine, familiar,
  noticias e internacional.
- Se conserva únicamente la escena deportiva genérica creada para Netfull.
- No se usan marcas, escudos, pósteres, personajes ni claims de disponibilidad
  permanente.
- La programación se presenta como variable y sujeta a consulta vigente.

## Nosotros

- Manifiesto “Ingeniería local. Conectividad con propósito”.
- Principios verificables sin inventar historia, métricas o clientes.
- Explicación clara de los recorridos Hogar y Empresas.

## Cobertura

- Se aclara que no existe un resultado automático en tiempo real.
- Flujo reordenado: zona aproximada, servicio y necesidad general.
- Continúan la minimización de datos, el consentimiento y la salida controlada a
  WhatsApp.

## Contacto

- Cuatro rutas: ventas hogar, empresas, TV Digital y soporte.
- Canales verificables: WhatsApp, correo y ubicación general.
- El formulario solo prepara el mensaje en el navegador y no solicita datos
  sensibles.

## Página 404

- Composición de ruta interrumpida, acciones seguras y destinos de recuperación.
- Continúa sin JavaScript y con `noindex`.

## Design System

- Documenta Journey panel, Technical console, Editorial ledger, Decision split,
  Category spectrum, Closing panel y Shared site shell.
- `/design-system/` permanece `noindex`, `nofollow`, `noarchive` y fuera del
  sitemap.

## Componentes reutilizados y nuevos

Se reutilizaron tipografía Inter local, tokens, botones, formularios, iconos SVG,
secciones, tablas, foco, menú nativo y patrones de red de Fase 1.

Componentes nuevos documentados:

- Journey panel.
- Technical console.
- Editorial ledger.
- Decision split.
- Category spectrum.
- Closing panel.
- Shared site shell.

Se crearon variantes específicas —por ejemplo `branch-map`, `exposure-console`
y `coverage-pulse`— solamente cuando la relación visual representada era distinta.

## Copy modificado

- Inicio pasó de una pregunta de selección a una propuesta de marca.
- Hogar habla de actividades y simultaneidad, sin garantizar rendimiento.
- Empresas prioriza impacto y operación antes que velocidad.
- Dedicado evita SLA, simetría, redundancia o monitoreo no documentados.
- IP Pública incorpora de forma explícita cuándo probablemente no aplica.
- TV evita marcas y remite a programación vigente.
- Cobertura distingue solicitud asistida de verificación automática.
- Contacto cambia de formulario genérico a rutas por motivo.

## Contenido eliminado, fusionado o conservado

Eliminado o fusionado:

- secuencias repetidas de tres tarjetas;
- abreviaturas decorativas y listas de mercados en TV;
- paneles que repetían el texto del hero;
- llamadas “Contratar” antes de comprobar cobertura;
- duplicación manual del shell global.

Conservado:

- precios y velocidades residenciales;
- rutas, títulos SEO, descripciones, canonical y sitemap;
- productos empresariales existentes;
- teléfono, correo y ubicación general;
- consentimiento, privacidad y minimización de datos;
- disclaimers de disponibilidad, programación y propuesta.

## Verificación

- Validador estático: 2,200 comprobaciones superadas.
- Pruebas negativas del validador: 9 casos superados, incluida la detección de
  divergencias graves del shell compartido.
- QA de navegador en 16 rutas y 9 viewports: 144 combinaciones superadas.
- Evidencia visual temporal: 139 capturas para las trece rutas comerciales,
  404, Design System, secciones y footer; no se versionan en Git.
- Contrato de accesibilidad, fuente local, iconos SVG, no-JS, formularios y
  ausencia de overflow verificados automáticamente.
- Revisión humana de jerarquía, composición, responsive y convivencia del botón
  flotante con el footer.
- Control externo de la configuración publicada existente: 27 comprobaciones de
  DNS y cabeceras superadas, sin modificar producción.

## Presupuesto técnico observado

- CSS: 101,167 bytes sin comprimir y 17,153 bytes con gzip.
- JavaScript principal: 2,901 bytes sin comprimir y 1,145 bytes con gzip.
- Fuente Inter local: 352,240 bytes, sin solicitudes a proveedores externos.
- Sin frameworks, video de fondo, WebGL, canvas ni dependencias JavaScript
  externas.

## Límites deliberados

- No hubo cambios en `main`, DNS, Cloudflare ni producción.
- No se implementaron pagos, backend, autenticación o captura de transacciones.
- No se publicaron testimonios, casos, certificaciones o métricas sin evidencia.
- La aprobación final visual y comercial corresponde a una revisión externa.

## Riesgos y pendientes de Fase 3

- El CSS sin minificar creció por la biblioteca visual de Fase 2; debe evaluarse
  extracción crítica y depuración de estilos heredados sin romper rutas.
- El sitio todavía no contiene backend, autenticación, pagos ni controles de una
  plataforma transaccional.
- Casos, proyectos, sectores, métricas y evidencia comercial requieren fuentes
  aprobadas antes de publicarse.
- Programación de TV debe seguir confirmándose con la fuente contractual vigente.
- Debe decidirse si `/design-system/` se excluye físicamente del artefacto final.
- Fase 3 deberá repetir seguridad, performance, accesibilidad y SEO antes de
  cualquier despliegue.

## Siguiente paso autorizado

Revisar la rama y sus capturas, solicitar ajustes si corresponden y decidir por
separado si se aprueba la fusión. Esta entrega no autoriza merge ni despliegue.
