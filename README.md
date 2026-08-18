# Netfull 2.0

Sitio estático multipágina de NetfullSV, construido con HTML, CSS y JavaScript nativos y publicado mediante GitHub Pages.

## Arquitectura pública

- `/` — portada
- `/hogar/` — planes residenciales
- `/empresas/` — catálogo empresarial
- `/internet-empresarial/`
- `/internet-dedicado/`
- `/vpn-empresarial/` — Netfull Secure Connect
- `/interconexion-sucursales/`
- `/ip-publica/`
- `/soporte-empresarial/`
- `/tv/`
- `/cobertura/`
- `/contacto/`
- `/nosotros/`
- `/privacidad.html`
- `/design-system/` — referencia interna no indexable de Netfull 3.0

## Sistema visual

- `DESIGN-SYSTEM-NETFULL.md` — principios, tokens, componentes y reglas de uso.
- `AUDITORIA-VISUAL-FASE-1.md` — diagnóstico del estado previo y deuda detectada.
- `/design-system/` — muestra visual responsive; no aparece en el sitemap ni debe indexarse.
- `assets/fonts/InterVariable.woff2` — Inter Variable 4.1 autohospedada; licencia y procedencia en `assets/fonts/`.
- `assets/icons/netfull-icons.svg` — sprite SVG local de la familia oficial Netfull.

## Controles preservados

- CSP estricta sin `unsafe-inline` ni `unsafe-eval`.
- HSTS, `nosniff`, bloqueo de framing y Permissions Policy.
- DNSSEC y CAA verificados por el flujo externo existente.
- GitHub Actions con permisos de solo lectura y dependencias fijadas.
- Rama principal protegida y commits firmados.
- Formularios sin backend: construyen un mensaje local y continúan en WhatsApp.

## Validación

```powershell
node .github/scripts/stamp-assets.mjs
node .github/scripts/validate-site.mjs
node .github/scripts/test-validator.mjs
```

La validación comprueba también la fuente local y su licencia, el sprite SVG y
su accesibilidad, el consumo de tokens semánticos en componentes nuevos, la
existencia del Design System, su estado `noindex` y la ausencia de emojis o
abreviaturas decorativas en la iconografía pública.

Los precios residenciales publicados son los valores vigentes encontrados en el proyecto: 30 Mbps por $28, 100 Mbps por $33 y 200 Mbps por $53 al mes. Cualquier cambio requiere confirmación comercial.
