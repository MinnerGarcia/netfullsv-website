# NETFULL 3.0 — Informe de Go-Live

Fecha de cierre: 18 de agosto de 2026, zona `America/El_Salvador`.

## Identidad de la publicación

- Repositorio: `MinnerGarcia/netfullsv-website`.
- Commit candidato y productivo: `9fbe27a1059377b5f51f100f11bd4c8ad3f5eb7c`.
- Commit anterior de `main`: `3d1e71271343ebed6a60724ef99bd6bd6deb1478`.
- Release firmada: `netfull-3.0.0`.
- Tag de rollback firmado: `netfull-2.0-pre-netfull-3-go-live`.
- Dominio productivo: `https://netfullsv.com/`.

## Baseline y rollback

Antes del Go-Live, `main` local y remoto coincidían en `3d1e71271343ebed6a60724ef99bd6bd6deb1478`; la rama candidata local y remota coincidían en `9fbe27a1059377b5f51f100f11bd4c8ad3f5eb7c`; el worktree estaba limpio. Se creó y publicó el tag firmado `netfull-2.0-pre-netfull-3-go-live`, que apunta exactamente al commit anterior. GitHub validó su firma. No fue necesario ejecutar el rollback.

## CI previo al merge

- Workflow: `Validate site`.
- Run: `32201496839`.
- Job: `95916104610`.
- Resultado: `success` sobre el SHA candidato exacto.
- Artefacto: `9347709350`.
- Digest: `sha256:cc0b62745b87fca5e6c60c64c2ef9d45fc4861a7022ebc4103726bdfe1f776e5`.

La solicitud de cambios `#10` pasó External DNS security, CodeQL para Actions y JavaScript/TypeScript, y el doble QA de NETFULL Fase 3.

## Merge controlado

El ruleset de `main` exigía historial lineal, commits firmados, PR y checks, pero conservaba el nombre obsoleto `Static security checks` y solo permitía squash. Para preservar los nueve commits firmados del candidato se aplicó una excepción administrativa temporal, se corrigió el nombre requerido a `NETFULL Phase 3 double QA`, se realizó un fast-forward exacto y se retiró inmediatamente la excepción. El ruleset terminó con cero bypasses y conservó las demás protecciones.

`main`, `origin/main` y el commit productivo quedaron exactamente en `9fbe27a1059377b5f51f100f11bd4c8ad3f5eb7c`. GitHub registró la PR `#10` como merged sin generar un SHA distinto.

## Despliegue

- GitHub Pages deployment: run `32205127527`, `success`.
- Pages build: `1160315196`, estado `built`.
- Commit desplegado: `9fbe27a1059377b5f51f100f11bd4c8ad3f5eb7c`.
- HTTPS forzado y certificado del dominio personalizado aprobado.
- CNAME: `netfullsv.com`.

## CI posterior al merge

- Validate site: run `32205128335`, job `95926765100`, `success`.
- External security posture: run `32205128415`, `success`.
- CodeQL: run `32205128053`, `success`.
- Pages deployment: run `32205127527`, `success`.

La única observación de CI es un aviso no bloqueante de deprecación futura de Node 20 en una acción de GitHub.

## Smoke productivo

Se probaron 15 rutas públicas, assets activos y retirados, formularios, navegación, planes, WhatsApp, SEO, CSP y sesiones independientes. Resultado final:

- 218 checks.
- 10 screenshots productivos.
- 0 errores.
- 15 advertencias conocidas y no funcionales.
- JSON de evidencia: SHA-256 `5d63080783db97e7df6259067ca022544e41812c0c46498ea5a37988d447257b`.
- Manifest: SHA-256 `c236a8ff92e44cc6d3492181786c3b18e28d2387621d5186c489a748f7e0f018`.

La portada, Hogar, Empresas, TV Digital y Cobertura se validaron en `390×844` y `1440×900`. No hubo desbordamiento horizontal, recortes ni superposición del contacto flotante.

## Funcionalidad y funnel

- Plan 30 Mbps: `$28/mes`.
- Plan 100 Mbps: `$33/mes`.
- Plan 200 Mbps: `$53/mes`.
- La preselección de los tres planes funciona.
- Valores inexistentes y payloads XSS se neutralizan sin ejecutar diálogos.
- El selector permite cambiar de plan.
- El formulario de cobertura exige zona, servicio y consentimiento.
- La URL final de WhatsApp incluye servicio, plan, precio, zona y necesidad, sin enviar automáticamente el mensaje.

## SEO y accesibilidad

Las rutas indexables conservan título, description, canonical, Open Graph, Twitter Card, un H1 y `lang`. `sitemap.xml` incluye las rutas correctas y excluye el Design System; `robots.txt` permite buscadores normales y publica la URL del sitemap. El Design System mantiene `noindex, nofollow, noarchive`.

La matriz previa al merge cubrió landmarks, labels, teclado, foco, navegación sin JavaScript, targets táctiles, texto a 200%, reduced motion y axe-core. La inspección humana posterior confirmó la composición productiva móvil y de escritorio.

## Seguridad

La validación externa posterior al despliegue aprobó 27/27 controles: HTTPS, redirección segura, HSTS, CSP, `nosniff`, DNS autoritativo de Cloudflare, DNSSEC, DS, DNSKEY, CAA, registros A y rutas de correo Zoho, tanto desde Cloudflare 1.1.1.1 como desde Google Public DNS.

El CSP entregado por el servidor no contiene dominios de Kaspersky. Las referencias a Kaspersky observadas en Edge proceden de la inspección HTTPS local del endpoint administrativo, no del sitio productivo.

## Rendimiento observado

Las respuestas HTTP directas estuvieron aproximadamente entre 41 y 276 ms para los recursos medidos. El documento principal respondió en unos 254 ms al primer byte y 258 ms total desde el equipo de prueba. Los tiempos de navegación de Edge mostraron variación por la inspección HTTPS de Kaspersky y scripts inyectados por Cloudflare, por lo que no se presentan como medición global de usuarios ni como Lighthouse.

## Incidencias menores y seguimiento

1. Cloudflare Browser Insights intenta cargar un beacon que el CSP estricto bloquea. No rompe la web; genera ruido de consola. Recomendación: deshabilitar Browser Insights o definir una política específica después de revisar privacidad.
2. Cloudflare Email Address Obfuscation reescribe el correo de la página de privacidad e inyecta `email-decode.min.js`; el CSP `script-src 'none'` de esa página bloquea el decodificador. El correo se visualiza protegido, pero conviene desactivar Email Address Obfuscation para esa ruta o globalmente antes de relajar el CSP.
3. Kaspersky inspecciona HTTPS en el equipo administrativo. No es una falla de NETFULL; se recomienda mantener el endpoint actualizado, con acceso administrativo mínimo y revisión periódica de certificados raíz y extensiones.
4. Actualizar las acciones de GitHub que aún dependan de Node 20 antes del retiro anunciado por GitHub.

Estas observaciones se clasifican como P2: no afectan disponibilidad, conversión, integridad del contenido ni seguridad del servidor. No justificaron rollback.

## Veredicto

**NETFULL 3.0 — GO-LIVE CON INCIDENCIAS MENORES**

Producción opera con el SHA aprobado, CI y despliegue en verde, rollback disponible, release firmada, 0 errores de smoke y 27/27 controles externos aprobados.
