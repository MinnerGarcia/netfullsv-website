# NETFULL 3.0 — Inventario de assets de Fase 3

Inventario levantado desde disco durante el hardening. Los pesos son bytes del archivo versionado; ninguna cifra es estimada.

## Imágenes activas

| Path | Formato | Dimensiones | Peso | Uso | Carga | Procedencia / decisión |
| --- | --- | ---: | ---: | --- | --- | --- |
| `assets/logo-netfull.png` | PNG | 120×120 | 18,677 B | Header, footer y Schema | inmediata; tamaño intrínseco 50×50 en HTML | Activo vigente de identidad NETFULL; no alterado visualmente en Fase 3. |
| `assets/favicon.png` | PNG | 192×192 | 68,466 B | favicon | navegador | Activo de identidad existente; conservado sin rediseño. |
| `assets/apple-touch-icon.png` | PNG | 180×180 | 77,793 B | Apple touch icon | navegador | Activo de identidad existente; conservado sin rediseño. |
| `assets/netfull-20-share.jpg` | JPEG | 1200×630 | 147,674 B | Open Graph/Twitter | solo al compartir | Inspeccionado: composición azul de hogar, empresa y conectividad compatible con NETFULL 3.0. No reemplazado automáticamente. |
| `assets/tv-futbol-internacional-generico.webp` | WebP | 1536×1024 | 117,598 B | Sección de deportes de TV | `lazy`, 1536×1024 reservado | **Generado específicamente para NETFULL** como escena ficticia, sin liga, club, escudo, jugador, evento o transmisión identificable. Autorizado como activo genérico del proyecto y documentado también en `AUDITORIA_DERECHOS_TV.md`. |

## Assets técnicos activos

| Path | Tipo | Peso | Uso / carga | Decisión |
| --- | --- | ---: | --- | --- |
| `assets/fonts/InterVariable.woff2` | WOFF2 | 352,240 B | Fuente local precargada; `font-display: swap` | Se conserva un único archivo variable, sin CDN. |
| `assets/icons/netfull-icons.svg` | SVG sprite | 5,618 B | Iconos mediante `<use>` | Sistema propio/genérico; QA verifica símbolos visibles. |
| `assets/site.css` | CSS fuente | 103,011 B en el candidato | Único stylesheet cache-busteado | Legible y reproducible; no se introduce build/minificación obligatoria. |
| `assets/site.js` | JavaScript | 7,200 B en el candidato | Menú, analytics local y formularios | Sin dependencias runtime y sin inserción HTML de parámetros. |

## Material retirado

Se eliminaron de la rama Fase 3 porque estaban sin uso público y no era necesario mantenerlos accesibles en un hosting estático:

- `assets/brands/`: logos de competiciones.
- `assets/cinema/`: dos artes de tráiler.
- `assets/tv-futbol-europeo.webp` y los visuales antiguos `tv-digital-*`.
- `assets/business/`: cuatro visuales históricos sin referencia.
- `assets/netfull-brand.webp`, `assets/netfull-hero.webp`, `assets/netfull-share.jpg`: identidad histórica reemplazada por activos vigentes.
- `assets/site-init.js`: script sin referencia.

La eliminación es recuperable mediante Git. La superficie pública conserva únicamente activos necesarios, propios o genéricos documentados.

## Política de CLS y carga

Las imágenes HTML significativas declaran `width` y `height` o tienen proporción reservada. El logo visible se carga de inmediato por estar en la cabecera; el visual de TV está bajo el primer pliegue y usa carga diferida. La imagen social y los iconos de navegador no participan en el layout del documento.
