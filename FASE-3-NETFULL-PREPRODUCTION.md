# NETFULL 3.0 — Fase 3, candidato de preproducción

Este documento describe el hardening de la rama candidata. No afirma que la rama esté desplegada. La evidencia ejecutable y el SHA autoritativo se generan desde el commit final en `qa-artifacts/netfull-3-phase-3/` y como artefacto privado de GitHub Actions.

## Baseline

- Fase 2: `feat/netfull-3-phase-2-redesign`.
- Commit base exacto: `0722043eb42bbe8968ee0b2422b32fac1bcf1471`.
- Fase 1 de referencia: `2b7476f6357028288cccc0ee0346ff87ee9ec1cd`.
- `main` y `origin/main` observados al inicio: `3d1e71271343ebed6a60724ef99bd6bd6deb1478`.
- Rama candidata: `feat/netfull-3-phase-3-hardening`.

## Cambios

- Se restauró el recorrido de conversión aprobado para planes residenciales.
- Se añadió validación estricta de parámetros, contexto del plan y cambio de selección.
- Se amplió el validador estático para SEO, claims, propiedad intelectual, imágenes, assets y seguridad estructural.
- Se creó QA de navegador con responsive matrix, axe, no-JS, teclado, formularios, XSS, zoom, impresión y evidencia visual.
- La inspección visual descubrió y corrigió contrastes insuficientes en el diagnóstico empresarial, el resultado de flujo, la etiqueta de arquitectura, la explicación y etiqueta de la ruta 404 y la muestra Brand 500 del Design System.
- Se configuraron dos pasadas independientes y comparación automática.
- Se retiraron assets históricos no utilizados o sin necesidad de exposición pública.

## Funnel Hogar → Cobertura → WhatsApp

Los planes 30/$28, 100/$33 y 200/$53 enlazan a `/cobertura/?servicio=hogar&plan=...`. Cobertura muestra el plan validado, permite cambiarlo y construye el mensaje final mediante `encodeURIComponent`. El formulario no transmite a un backend ni persiste entradas. Los eventos `seleccionar_plan`, `iniciar_cobertura` y `enviar_cobertura` contienen únicamente contexto genérico del funnel; no incluyen zona ni texto libre.

## Performance

- La fuente Inter se mantiene local en WOFF2, con `font-display: swap` y sin CDN.
- Las imágenes visibles reservan proporción mediante `width` y `height`; el visual de TV bajo el primer pliegue usa carga diferida.
- `site.css` permanece legible y cache-busteado por hash; gzip del hosting conserva la simplicidad del sitio estático.
- Critical CSS: **NO IMPLEMENTADO — COMPLEJIDAD > BENEFICIO**. El sitio tiene múltiples rutas estáticas, un único CSS cacheable y no existe evidencia de una mejora proporcional que justifique duplicar estilos en cada documento.
- Lighthouse se ejecutará solo cuando esté disponible en el entorno; no se inventan métricas.

## Accesibilidad

El control automatizado cubre un subconjunto WCAG 2.2 AA con 32 escaneos axe-core (16 rutas en 390×844 y 1440×900), landmarks, un H1, labels, navegación sin JavaScript, foco y teclado del menú, targets de 44 px, 200% de texto, `prefers-reduced-motion`, formularios y ausencia de solapamiento del WhatsApp flotante. La aprobación visual externa sigue siendo un control humano pendiente.

## SEO

El validador exige títulos, descriptions y canonical únicos para rutas indexables, Open Graph, Twitter Cards, un H1, `lang`, sitemap, robots y exclusión del Design System. La imagen `netfull-20-share.jpg` fue inspeccionada y todavía representa la identidad azul de NETFULL 3.0; no se reemplazó automáticamente.

## Seguridad

- CSP y headers continúan bajo validación estructural; no se relaja `script-src`, `object-src` ni `frame-src`.
- Los parámetros se leen con `URLSearchParams`, se resuelven por allowlist y nunca alcanzan `innerHTML`.
- El QA prueba cinco payloads XSS, planes inexistentes, consentimiento, zona obligatoria y URL final de WhatsApp.
- Los enlaces externos con nueva pestaña conservan `noopener noreferrer`.
- La validación externa de `netfullsv.com` representa **producción actual**, no esta rama candidata.

## QA

`run-phase3-pass.mjs` ejecuta validación estática, tests negativos, sincronización de shell, auditoría CSS, browser QA y postura externa. `qa-browser.mjs` verifica 16 rutas en nueve viewports, accesibilidad, conversión y 40 capturas por pasada.

## Double check

Pass A y Pass B corren en procesos Node separados, puertos distintos y browsers/contextos nuevos. Entre ambos se eliminan cachés y resultados de Pass B. `compare-phase3-passes.mjs` exige el mismo SHA, todos los controles en PASS y 40 capturas únicas por manifest. Los resultados finales no se escriben en este documento después del source freeze para no invalidar el SHA; quedan en `qa-pass-a.json`, `qa-pass-b.json` y `QA-DOUBLE-CHECK-REPORT.md`.

## Screenshots

Se generan 40 capturas por pasada: 15 rutas en 390×844 y 1440×900, más Home, Hogar, Empresas, TV y Cobertura en 360×800 y 1920×1080. Cada manifest registra ruta, viewport, archivo, fecha, SHA del candidato, resultado y SHA-256 de la imagen. `qa-artifacts/` está excluido del sitio productivo y se publica únicamente como artefacto de CI.

## CI

El workflow de validación instala únicamente dependencias de desarrollo, ejecuta Pass A, limpia estado, ejecuta Pass B, compara resultados y publica la evidencia con `if: always()`. El run ID, SHA, jobs y resultado se registran desde GitHub después del push del commit final.

## Riesgos

- La revisión visual humana externa y la autorización comercial continúan fuera del alcance automático.
- La disponibilidad y programación de TV puede variar; el sitio no promete ligas, canales ni transmisiones específicas.
- Los checks externos describen producción actual y no prueban que esta rama esté publicada.
- Design System permanece en el repositorio con `noindex, nofollow, noarchive` porque excluirlo requeriría un build que no existe; no contiene secretos.

## Go / No-Go

Go técnico exige Pass A, Pass B y CI en `SUCCESS` sobre el mismo SHA, más revisión visual externa. Merge y despliegue siguen expresamente prohibidos hasta autorización del owner. Si falla un control crítico, el candidato es No-Go.
