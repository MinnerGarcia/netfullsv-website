# Auditoría de transición UX — NETFULL 3.0 / Fase 2

Fecha de corte: 18 de agosto de 2026
Rama de trabajo: `feat/netfull-3-phase-2-redesign`
Base aprobada: `2b7476f6357028288cccc0ee0346ff87ee9ec1cd`

## Criterios de transición

La auditoría revisa propósito, audiencia, recorrido, jerarquía, repetición visual,
claridad comercial, accesibilidad y riesgo de afirmaciones no verificadas. Cada
bloque se clasifica como **conservar**, **mejorar**, **reestructurar**,
**fusionar**, **mover** o **eliminar**. Se preservan precios, rutas, canales de
contacto, condiciones prudentes, SEO, consentimiento y mensajes de privacidad.

## Hallazgos globales

- **Conservar:** HTML estático, URLs, metadatos, fuente local, iconografía SVG,
  tokens, CSP, formularios locales, WhatsApp y contenido comercial comprobable.
- **Mejorar:** jerarquía editorial, ritmo, contraste entre Hogar y Empresas,
  claridad de recorridos, microcopy de conversión y orientación del usuario.
- **Reestructurar:** la secuencia repetida `hero + tres cards + CTA`; demasiadas
  páginas parecen variaciones de una misma plantilla.
- **Fusionar:** mensajes repetidos sobre atención, contexto y “siguiente paso”
  para convertirlos en bloques más breves y específicos.
- **Mover:** comparaciones y explicaciones secundarias después de la propuesta
  principal; la acción primaria debe aparecer antes.
- **Eliminar:** redundancias, abreviaturas visuales, claims sin evidencia y
  recursos promocionales de terceros sin licencia demostrada.
- **Navegación:** seis enlaces más CTA compiten en desktop. Se conserva la
  arquitectura, pero se simplifica la etiqueta visual y se refuerza Home como
  destino explícito mediante la marca.
- **Footer:** tres columnas mezclan producto, empresa y soporte. Se reorganiza
  en Hogar, Empresas, Soporte, Empresa y Legal sin inventar destinos.
- **Conversión:** Hogar debe terminar en cobertura; Empresas debe terminar en
  evaluación consultiva. Actualmente varios CTAs usan verbos distintos para la
  misma acción.
- **Evidencia:** no existen casos, métricas, SLA, uptime, testimonios o
  certificaciones documentadas. No se mostrará una sección de evidencia falsa.

## 1. Home `/`

- **Propósito:** orientar en segundos hacia Hogar o Empresas y presentar a
  Netfull como especialista en conectividad.
- **Usuario:** visitante residencial, responsable de negocio o persona todavía
  insegura de qué servicio necesita.
- **Acción primaria:** explorar Hogar o Empresas.
- **Acción secundaria:** solicitar verificación de cobertura.
- **Problemas actuales:** H1 funcional pero poco distintivo; dos rutas parecen
  tarjetas; la sección de capacidades repite tres cards; proceso limitado a
  tres pasos; teaser de TV depende de una imagen genérica; falta una composición
  editorial fuerte para Empresas.
- **Nueva estructura:** hero propietario de red; dos recorridos de gran escala;
  resumen residencial con planes reales; bloque empresarial editorial; proceso
  en cuatro momentos; módulo TV propio; cierre de cobertura.
- **Preservar:** propósito dual, enlaces, precios solo en Hogar, prudencia
  comercial, visual de nodos y datos de contacto.
- **Clasificación:** hero **reestructurar**; rutas **reestructurar**; capacidades
  **fusionar**; proceso **mejorar**; Empresas **mejorar**; TV **reestructurar**;
  CTA final **conservar y mejorar**.

## 2. Hogar `/hogar/`

- **Propósito:** facilitar elección entre 30, 100 y 200 Mbps.
- **Usuario:** hogar de Nuevo Lourdes que compara capacidad y precio.
- **Acción primaria:** elegir plan y solicitar cobertura.
- **Acción secundaria:** explorar TV Digital.
- **Problemas actuales:** las tres tarjetas tienen exceso de listas; el hero
  explica el proceso antes de generar deseo; los usos se presentan en cuatro
  bloques iguales; el CTA “Contratar” se adelanta a la confirmación de cobertura.
- **Nueva estructura:** hero residencial; selector visual de uso; comparativa de
  planes compacta; recomendación editorial “Recomendado”; guía de simultaneidad;
  puente hacia TV; CTA de cobertura.
- **Preservar:** 30 Mbps/$28, 100 Mbps/$33, 200 Mbps/$53, notas de condiciones,
  WhatsApp y texto prudente sobre rendimiento.
- **Clasificación:** hero **mejorar**; planes **reestructurar**; usos **fusionar**;
  TV **mejorar**; CTA **conservar**.

## 3. Empresas `/empresas/`

- **Propósito:** mostrar capacidad consultiva y distribuir hacia seis soluciones.
- **Usuario:** dueño, administrador, responsable de operaciones o TI.
- **Acción primaria:** solicitar diagnóstico comercial.
- **Acción secundaria:** explorar una solución específica.
- **Problemas actuales:** seis tarjetas iguales convierten la página en catálogo;
  aplicaciones sensibles son demasiado genéricas; el proceso solo tiene tres
  pasos; falta jerarquía entre conectividad base, continuidad y arquitectura.
- **Nueva estructura:** hero técnico oscuro; mapa de dependencias; arquitectura
  editorial en tres niveles; índice de soluciones con tratamientos diferentes;
  método de diseño en cinco variables; CTA consultivo.
- **Preservar:** seis productos, casos POS/VoIP/nube/CCTV/sedes, ausencia de SLA
  inventado y alcance sujeto a propuesta.
- **Clasificación:** hero **mejorar**; catálogo **reestructurar**; aplicaciones
  **fusionar**; proceso **reestructurar**; CTA **conservar y precisar**.

## 4. Internet Empresarial `/internet-empresarial/`

- **Propósito:** explicar para quién sirve y cómo se dimensiona.
- **Usuario:** empresa cuya conectividad sostiene trabajo cotidiano.
- **Acción primaria:** evaluar necesidad.
- **Acción secundaria:** comparar con Internet Dedicado.
- **Problemas actuales:** ecuación correcta pero visualmente plana; casos de uso
  vuelven al patrón de tres cards; falta responder “cuándo conviene” de inmediato.
- **Nueva estructura:** hero de demanda; flujo Usuarios → Aplicaciones → Demanda
  → Enlace; escenarios operativos en lista editorial; criterios de decisión;
  relación clara con Dedicado.
- **Preservar:** dimensionamiento por contexto, aplicaciones reales y ausencia de
  promesas técnicas no comprobadas.
- **Clasificación:** hero **mejorar**; ecuación **reestructurar**; casos **fusionar**;
  cierre **mejorar**.

## 5. Internet Dedicado `/internet-dedicado/`

- **Propósito:** explicar criticidad y diferenciar alternativas.
- **Usuario:** operación donde una interrupción tiene impacto comercial.
- **Acción primaria:** solicitar propuesta.
- **Acción secundaria:** comparar servicios.
- **Problemas actuales:** hero largo; tabla correcta pero densa; tres señales de
  decisión repiten cards; falta priorizar el costo operativo de la interrupción.
- **Nueva estructura:** hero de criticidad; indicador conceptual de impacto;
  comparación simplificada; señales de decisión; condiciones según propuesta.
- **Preservar:** tabla conceptual, disclaimer, ningún claim de SLA/simetría/
  redundancia/monitoreo no verificado.
- **Clasificación:** hero **reestructurar**; tabla **mejorar**; señales **fusionar**;
  CTA **conservar**.

## 6. Secure Connect `/vpn-empresarial/`

- **Propósito:** posicionar un producto propio y explicar VPN sin jerga excesiva.
- **Usuario:** empresa con sedes, nube o usuarios remotos.
- **Acción primaria:** evaluar sedes.
- **Acción secundaria:** conocer arquitecturas.
- **Problemas actuales:** topología útil pero genérica; resultados y arquitecturas
  repiten dos grillas de tres; el producto no tiene suficiente identidad propia.
- **Nueva estructura:** hero de producto; visual Casa matriz–Netfull–Sucursal;
  selector editorial de Site-to-Site, Hub & Spoke y Remote Access; beneficios;
  límites y tecnología como decisión posterior.
- **Preservar:** nombre Netfull Secure Connect, conceptos IPsec/WireGuard/MikroTik
  como posibilidades y no como garantía.
- **Clasificación:** hero **mejorar**; resultados **fusionar**; arquitecturas
  **reestructurar**; cierre técnico **conservar y compactar**.

## 7. Interconexión `/interconexion-sucursales/`

- **Propósito:** explicar cómo compartir recursos entre ubicaciones autorizadas.
- **Usuario:** organización con dos o más sedes.
- **Acción primaria:** evaluar sedes.
- **Acción secundaria:** conocer Secure Connect.
- **Problemas actuales:** diferencia con Secure Connect poco visible; tres cards y
  tres pasos generan monotonía; falta mostrar flujo entre sedes y servicios.
- **Nueva estructura:** problema/arquitectura/beneficio; diagrama vertical y
  horizontal responsive; casos de uso; proceso breve; relación con Secure Connect.
- **Preservar:** acceso autorizado, topología según caso, crecimiento condicionado.
- **Clasificación:** hero **mejorar**; arquitectura **reestructurar**; beneficios
  **fusionar**; proceso **mejorar**.

## 8. IP Pública `/ip-publica/`

- **Propósito:** explicar qué es, para quién sirve, qué permite y cuándo no aplica.
- **Usuario:** empresa con necesidad técnica específica.
- **Acción primaria:** evaluar el caso.
- **Acción secundaria:** revisar usos.
- **Problemas actuales:** responde tres de cuatro preguntas; no explica claramente
  cuándo probablemente no se necesita; casos vuelven a tres cards.
- **Nueva estructura:** cuatro respuestas visibles; casos de uso en flujo;
  advertencia de seguridad; bloque honesto “probablemente no la necesita si…”.
- **Preservar:** no sustituye seguridad, compatibilidad y arquitectura sujetas a
  evaluación.
- **Clasificación:** hero **mejorar**; casos **reestructurar**; añadir bloque de
  no-aplicación; CTA **conservar**.

## 9. Soporte Empresarial `/soporte-empresarial/`

- **Propósito:** explicar qué ocurre después de contratar.
- **Usuario:** prospecto empresarial que evalúa acompañamiento.
- **Acción primaria:** solicitar asesoría.
- **Acción secundaria:** conocer proceso.
- **Problemas actuales:** lenguaje prudente pero abstracto; tres cards repiten el
  patrón; no distingue reporte, contexto, revisión y seguimiento.
- **Nueva estructura:** recorrido posterior a la contratación; responsabilidades
  y alcance; información útil para reportar; CTA a diseñar soporte con la solución.
- **Preservar:** no prometer NOC, 24/7, tiempos, monitoreo o ingeniero dedicado.
- **Clasificación:** hero **mejorar**; proceso **reestructurar**; cards **fusionar**;
  CTA **conservar**.

## 10. TV Digital `/tv/`

- **Propósito:** generar interés y dirigir a consulta de programación vigente.
- **Usuario:** hogar interesado en entretenimiento.
- **Acción primaria:** consultar TV Digital.
- **Acción secundaria:** explorar categorías.
- **Problemas actuales:** fútbol domina la página; cuatro mercados parecen una
  lista de ligas; tres categorías son bloques oscuros repetitivos; faltan noticias
  e internacional; la página depende de una fotografía aunque existe dirección
  visual propia posible.
- **Nueva estructura:** hero de pantallas abstractas; seis categorías propias;
  deportes como una escena, no toda la propuesta; guía de experiencia; disclaimer
  visible; CTA de programación.
- **Preservar:** visual deportivo generado para Netfull, términos genéricos,
  disclaimers y ausencia de marcas/pósteres/personajes.
- **Clasificación:** hero **reestructurar**; deportes **mejorar**; categorías
  **reestructurar**; eliminar abreviaturas visuales; CTA **conservar**.

## 11. Nosotros `/nosotros/`

- **Propósito:** explicar identidad, criterio y forma de trabajar.
- **Usuario:** prospecto que busca confianza antes de contactar.
- **Acción primaria:** contactar a Netfull.
- **Acción secundaria:** explorar Hogar o Empresas.
- **Problemas actuales:** copy correcto pero genérico; no existe una narrativa
  diferenciada; tres cards vuelven a repetir Claridad/Cercanía/Criterio.
- **Nueva estructura:** manifiesto breve “Ingeniería local. Conectividad con
  propósito”; principios verificables; cómo piensa Netfull; dos ámbitos de trabajo;
  espacios documentados para historia/evidencia futura.
- **Preservar:** proveedor local, Nuevo Lourdes, enfoque residencial/empresarial,
  claridad y atención directa.
- **Clasificación:** hero **reestructurar**; principios **fusionar**; añadir nota
  interna de evidencia pendiente; CTA **mejorar**.

## 12. Cobertura `/cobertura/`

- **Propósito:** preparar una solicitud de verificación por WhatsApp.
- **Usuario:** interesado que ya conoce el servicio o plan.
- **Acción primaria:** enviar solicitud de cobertura.
- **Acción secundaria:** revisar privacidad o contactar directamente.
- **Problemas actuales:** “Verificar cobertura” puede sugerir resultado automático;
  formulario ordena servicio antes de zona; hero y panel repiten explicación;
  Contacto se siente casi idéntico.
- **Nueva estructura:** Paso 1 Zona → Paso 2 Servicio → Paso 3 Necesidad → Resultado
  “Continuar con asesor”; explicación explícita de que no es consulta en tiempo real.
- **Preservar:** zona aproximada, consentimiento, minimización de datos, WhatsApp,
  correo y advertencias de seguridad.
- **Clasificación:** hero **reestructurar**; panel **fusionar**; formulario
  **reordenar y mejorar**; copy **precisar**.

## 13. Contacto `/contacto/`

- **Propósito:** enrutar ventas residenciales, empresas, TV y soporte.
- **Usuario:** visitante que necesita hablar con Netfull, con o sin servicio elegido.
- **Acción primaria:** seleccionar motivo y continuar por WhatsApp.
- **Acción secundaria:** correo directo.
- **Problemas actuales:** replica el formulario de Cobertura; no distingue ventas,
  empresas y soporte; “Atención” usa ubicación como si fuera canal.
- **Nueva estructura:** cuatro rutas de contacto; canales verificables; formulario
  de contexto; cobertura enlazada como experiencia separada.
- **Preservar:** teléfono, correo, ubicación general, opciones actuales,
  consentimiento y no recolección de datos sensibles.
- **Clasificación:** hero **mejorar**; rutas **añadir**; formulario **mejorar**;
  duplicidad con Cobertura **eliminar**.

## 14. Página 404 `/404.html`

- **Propósito:** recuperar navegación desde una ruta inexistente.
- **Usuario:** visitante que llegó por enlace roto o URL incorrecta.
- **Acción primaria:** volver al inicio.
- **Acción secundaria:** solicitar cobertura.
- **Problemas actuales:** visual muy básico y sin navegación contextual.
- **Nueva estructura:** composición de ruta interrumpida; enlaces a Home, Hogar,
  Empresas y Contacto; mantener `noindex`.
- **Preservar:** status 404, canonical actual, CSP sin scripts y acciones seguras.
- **Clasificación:** **reestructurar visualmente**.

## 15. Privacidad y `/design-system/`

- **Propósito:** información legal y referencia visual interna.
- **Clasificación:** **conservar** contenido y metadatos; ajustar únicamente shell
  global si corresponde. `/design-system/` permanece `noindex` y fuera del sitemap.

## Mapa de conversión aprobado para implementación

### Hogar

`Home → Hogar → Plan → Solicitud de cobertura → WhatsApp / contacto`

### Empresas

`Home → Empresas → Solución → Evaluación comercial → WhatsApp / contacto`

## Límites de contenido

- No se usarán métricas, casos, clientes, SLA, uptime, testimonios, certificaciones
  o capacidades operativas sin evidencia en el repositorio.
- Los nombres de productos, precios y velocidades existentes se preservan.
- Los activos deportivos y cinematográficos sin uso público continúan fuera del
  frontend; su eventual eliminación del historial pertenece a una tarea separada.
- La composición visual se construirá con CSS, iconografía SVG oficial y activos
  propios ya documentados. No se incorporará fotografía de procedencia dudosa.
