# Design System Netfull 3.0

Versión: Fase 1  
Marca visible: **NETFULL**  
Dominio: `netfullsv.com`  
Lema: **Conectando lo que importa**

Este documento define el sistema visual y de interfaz que debe gobernar las siguientes fases del sitio. No autoriza cambios de producto, precios, cobertura, métricas, SLA, clientes o certificaciones.

## Brand principles

1. **Infraestructura con propósito.** Mostrar cómo una conexión sostiene hogares, aplicaciones, personas y operaciones.
2. **Precisión sin complejidad innecesaria.** Traducir conceptos técnicos a relaciones claras: nodo, enlace, ruta, destino.
3. **Autoridad cercana.** Hablar con criterio profesional sin exageraciones ni jerga que aleje al cliente.
4. **Evidencia antes que promesa.** No inventar claims, métricas, clientes, cobertura ni capacidades.
5. **Jerarquía antes que decoración.** Menos tarjetas, menos efectos y más espacio, lectura y estructura.

Lenguaje visual propietario: **NODOS + ENLACES + RUTAS + SEÑAL + INFRAESTRUCTURA**.

## Color palette

La identidad reconocible de Netfull se conserva: azul profundo como base, azul de marca para acciones y cian como señal. El cian no debe inundar superficies completas.

### Primary

| Token | Valor | Uso principal |
|---|---:|---|
| `--color-brand-50` | `#EFF8FF` | Fondo informativo muy suave |
| `--color-brand-100` | `#DCEFFF` | Foco y estados suaves |
| `--color-brand-200` | `#B9E0FF` | Bordes de componentes de marca |
| `--color-brand-300` | `#7FC7FF` | Acentos claros |
| `--color-brand-400` | `#38A7FF` | Acentos sobre fondos oscuros |
| `--color-brand-500` | `#0D7FF2` | Acción principal |
| `--color-brand-600` | `#0868DC` | Acción principal con contraste alto |
| `--color-brand-700` | `#0757B8` | Hover, CTA de marca |
| `--color-brand-800` | `#0A468F` | Superficies técnicas |
| `--color-brand-900` | `#0B3C73` | Profundidad de marca |

### Signal accent

| Token | Valor | Uso |
|---|---:|---|
| `--color-signal-300` | `#7DEAFF` | Texto/acento sobre fondo oscuro |
| `--color-signal-500` | `#1FD6F4` | Nodos activos, foco y conexión |
| `--color-signal-700` | `#087F9B` | Acento con mayor contraste |

### Neutral

Escala `--color-neutral-0` a `--color-neutral-950`: blanco, fondos, bordes, texto secundario y azul casi negro. El texto principal usa `--color-neutral-900`; el fondo técnico usa `--color-neutral-950`.

### Background

- `--color-bg-light`: contenido editorial.
- `--color-bg-soft`: agrupación y alternancia.
- `--color-bg-dark`: infraestructura y autoridad técnica.
- `--color-bg-elevated`: componentes sobre fondos claros.

### Text

- `--color-text-primary`: títulos y datos relevantes.
- `--color-text-secondary`: párrafos.
- `--color-text-muted`: ayudas, metadata y disclaimers.
- `--color-text-inverse`: texto sobre fondos oscuros.

### State colors

- `--color-success: #087D50`
- `--color-success-text`, `--color-success-border`, `--color-success-soft`: texto, borde y superficie de confirmación.
- `--color-warning: #9A6400`
- `--color-error: #B42318`
- `--color-information: var(--color-brand-600)`

Las superficies oscuras y de señal usan tokens semánticos (`--color-dark-*`,
`--color-signal-*` y `--color-network-*`) para que cards, badges, formularios y
diagramas no consuman valores `rgba(...)` arbitrarios.

El color nunca debe ser la única forma de comunicar un estado.

### Borders

- `--color-border-subtle`: separación casi invisible.
- `--color-border-standard`: estructura común.
- `--color-border-strong`: foco contextual o límites importantes.

## Typography

Familia principal: **Inter Variable 4.1 autohospedada**, seguida por `Inter`,
`ui-sans-serif`, `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`
y `sans-serif` como respaldo.

- Archivo: `assets/fonts/InterVariable.woff2`.
- Formato: WOFF2 variable, estilo normal, pesos 100–900.
- Carga: un solo archivo, `font-display: swap`, `font-optical-sizing: auto` y
  preload local en los documentos HTML.
- Privacidad y disponibilidad: el navegador solicita la fuente únicamente a
  `netfullsv.com`; no existe conexión a Google Fonts, CDN o API externa.
- Cobertura: se conserva la distribución completa, sin subset, para asegurar
  español, signos de apertura, símbolos monetarios y el repertorio actual.
- Licencia: SIL Open Font License 1.1, incluida en
  `assets/fonts/LICENSE-Inter.txt`.
- Procedencia y hashes: `assets/fonts/README.md`.

| Rol | Token / tamaño | Peso | Line-height | Tracking |
|---|---|---:|---:|---:|
| Display XL | `clamp(3rem, 7vw, 5.65rem)` | 800–900 | `.98` | `-.055em` |
| Display | `clamp(2.7rem, 5vw, 4.85rem)` | 800–900 | `1` | `-.05em` |
| H1 | `clamp(2.55rem, 4.6vw, 4.4rem)` | 800–900 | `1.08` | `-.035em` |
| H2 | `clamp(2rem, 3.6vw, 3.55rem)` | 800–900 | `1.08` | `-.035em` |
| H3 | `clamp(1.15rem, 1.8vw, 1.55rem)` | 750–850 | `1.08` | `-.035em` |
| H4 | `1.125rem` | 750–850 | `1.15` | `-.02em` |
| Body Large | `clamp(1.05rem, 1.5vw, 1.23rem)` | 400–600 | `1.6` | normal |
| Body | `1rem` | 400–600 | `1.65` | normal |
| Body Small | `.875rem` | 400–600 | `1.55` | normal |
| Label | `.8125rem` | 800 | `1.3` | normal |
| Caption | `.75rem` | 500–700 | `1.45` | normal |
| Overline | `.75rem` | 850 | `1.3` | `.16em` |

Reglas: titulares breves, cuerpo con máximo legible de `720px`, una sola jerarquía principal por bloque y `text-wrap: balance` en encabezados.

## Spacing

Escala: `4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 120, 160px`, expuesta como `--space-1` a `--space-12`.

- Sección estándar: `80–104px` según viewport.
- Sección compacta: `64–74px`.
- Padding de card: `24–36px`.
- Gap de grid: `16–32px` según densidad.
- Gutter: `clamp(20px, 4vw, 40px)`.
- Móvil: reducir jerarquía de espacio, nunca eliminarla.

No usar valores nuevos si uno de los tokens resuelve la relación.

## Grid

- Contenedor principal: `1180px`.
- Contenedor amplio: `1360px`.
- Ancho de lectura: `720px`.
- Desktop ≥ 1366: 12 columnas conceptuales, gutter 32–40px.
- Laptop 1024–1365: 12 columnas conceptuales, gutter 24–32px.
- Tablet 768–1023: 8 columnas conceptuales, gutter 24px.
- Mobile 360–767: 4 columnas conceptuales, gutter 14–20px.

Breakpoints de implementación actuales: `1040px`, `760px` y `430px`. Los componentes se validan además en 360, 375, 390, 430, 768, 1024, 1366, 1440 y 1920px.

## Buttons

- **Primary** `.button-primary`: conversión principal.
- **Secondary** `.button-secondary`: alternativa visible sin competir.
- **Tertiary** `.button-tertiary`: navegación contextual o acción ligera.
- **Dark** `.button-dark`: acción sobre fondos claros cuando se necesita autoridad.
- **Icon** `.button-icon`: requiere `aria-label`.
- **WhatsApp** `.button-whatsapp`: contacto por el canal existente.
- Tamaños: `.button-small`, base y `.button-large`.

Estados definidos: default, hover, active, focus visible, disabled y loading (`.is-loading`). En cada bloque debe existir como regla general un solo botón primario.

## Forms

Componentes: `input`, `textarea`, `select`, checkbox, radio, `label`, helper, error y success.

- Todo control necesita label persistente asociado con `for`/`id`.
- El placeholder no sustituye al label.
- Helper: `.helper`.
- Error: `.field.has-error`, `aria-invalid="true"` y mensaje descriptivo.
- Éxito: `.field.has-success` con texto cuando el significado no sea obvio.
- Fondo oscuro: `.form-shell-dark`.
- Foco: borde azul más halo de 3px, además del foco global cian.
- Objetivo táctil mínimo: 44px; controles de texto: 50px.

## Cards

- **Service Card** `.service-card`: opción de servicio con siguiente paso.
- **Plan Card** `.plan-card`: comparación de velocidades/precios reales.
- **Feature Card** `.feature-card`: máximo tres o cuatro capacidades comparables.
- **Case Study Card** `.case-study-card`: usar solo con caso real y verificable.
- **Technical Capability Card** `.technical-card`: explicar una capacidad técnica.
- **CTA Card** `.cta-card` / `.cta-band`: una decisión clara.
- **Dark Card** `.dark-card`: elevar una capacidad técnica, no decorar.

No usar cards para: párrafos consecutivos, títulos sin acción, listas simples, bloques legales o texto que funciona mejor en una columna editorial.

## Icons

Formato oficial: sprite SVG local `assets/icons/netfull-icons.svg`. Cada símbolo
utiliza `viewBox="0 0 24 24"`, `fill="none"`, trazo de `2px`, extremos y uniones
redondeados y `currentColor`. La caja visual `.nf-icon` mide 46px y mantiene el
lenguaje de nodos, enlaces, rutas, señal e infraestructura.

Disponibles como familia base: hogar, empresa, pantalla, red, enlace, nube,
seguridad, globo/Internet, soporte, señal, servidor, mensaje, usuario, ruta y
gráfica. El sprite también incluye símbolos auxiliares coherentes para
reproducción, familia, correo y menú.

- Usar `<svg><use href="...#nf-nombre"></use></svg>`; no recrear la geometría
  con `::before`, `::after`, bordes o sombras.
- El sprite se sirve desde el mismo origen, aprovecha caché y no requiere
  JavaScript ni una librería de terceros.
- Siempre acompañar el icono con texto o un nombre accesible.
- Si es decorativo: `aria-hidden="true"` y `focusable="false"`.
- Si comunica significado sin texto: `role="img"` y `aria-labelledby` asociado
  a un `<title>` único, o un mecanismo equivalente.
- No usar emojis, siglas como `OP`, `SC`, `S2S` ni mezclar estilos.
- Las siglas siguen siendo válidas dentro de contenido técnico cuando forman
  parte del nombre o explicación, no como adorno.

## Network diagrams

Componente base: `.network-diagram`; nodos `.diagram-node`; conexiones `.diagram-link`.

Variantes:

1. **Basic Connection:** Usuario → NETFULL → Internet.
2. **Site-to-Site:** Sede A ↔ NETFULL ↔ Sede B.
3. **Hub & Spoke:** Sucursales → HUB NETFULL.
4. **Cloud Access:** Empresa → NETFULL → Nube.
5. **Remote Worker:** Usuario remoto → Secure Connect → Empresa.

Cada diagrama debe incluir `role="img"` y `aria-label` que exprese la relación completa. En móvil se reorganiza verticalmente. No representar marcas de fabricante ni topologías que impliquen una promesa contractual.

## Photography

### Hogar

Fotografía editorial realista: trabajo remoto, estudio, entretenimiento y convivencia; espacios salvadoreños o latinoamericanos creíbles, luz natural y tecnología integrada sin posar.

### Empresas

Operación real: racks, fibra, técnicos, centros de operación, comercios, rutas, oficinas, sedes y equipos trabajando. La imagen debe responder “qué sostiene esta conexión”.

### Tecnología

Detalle de fibra, nodos, backbone, routers, mapas abstractos y datacenter. Evitar luces neón gamer y renders imposibles.

No usar ejecutivos stock sonriendo, manos apuntando pantallas, imágenes generativas obvias, fotografías bancarias genéricas ni activos sin licencia verificable.

## Section styles

- `.section-light`: lectura principal.
- `.section-soft`: alternancia y agrupación.
- `.section-dark`: autoridad y contenido técnico.
- `.section-brand`: llamada a la acción.
- `.section-network`: diagramas, rutas y señal.
- Sección editorial con imagen: imagen con propósito + bloque de texto, sin superponer párrafos largos.

El ritmo recomendado alterna dos o tres superficies como máximo por página. No crear una sucesión infinita de blanco/tarjeta/blanco/tarjeta.

## Navbar

- Fondo técnico oscuro, altura base de `82px` y estado sticky cuando ayude a mantener el recorrido.
- Marca visible **NETFULL**; `netfullsv.com` funciona como dominio, no como nombre principal.
- Desktop: enlaces breves, un CTA y estado activo mediante texto + línea, nunca solo color.
- Hasta `1040px`: menú nativo con `details/summary`, cierre al seleccionar y navegación utilizable sin JavaScript.
- El CTA de cobertura conserva una superficie mínima de 44px; en móvil puede abreviar su texto sin ocultar su propósito.
- No agregar dropdowns ni reorganizar la arquitectura durante Fase 1.

## Footer

- Superficie `--color-neutral-950`, marca y propuesta breve en la primera columna.
- Arquitectura objetivo: Hogar, Empresas, Soporte, Empresa y Legal. Mientras no existan más enlaces verificados, agrupar sin inventar destinos.
- Incluir dominio, teléfono, ubicación, privacidad y copyright cuando correspondan.
- No inventar redes sociales ni sellos.
- En tablet y móvil las columnas se reducen manteniendo orden de lectura y targets táctiles claros.

## Tokens

Los tokens viven en `:root` dentro de `assets/site.css`. Los nombres semánticos son la fuente de verdad. Los alias históricos (`--navy-*`, `--blue-*`, `--cyan-*`, `--ink`, `--slate-*`) existen solo para compatibilidad con Netfull 2.0 y deben retirarse gradualmente en Fase 2, no duplicarse en componentes nuevos.

Todo componente nuevo debe usar:

- `--color-*` para color y estados;
- `--space-*` para separación;
- `--radius-*` para bordes;
- `--shadow-*` para elevación;
- `--type-*` y `--font-*` para tipografía;
- `--motion-*` y `--ease-standard` para interacción.

Tokens semánticos de superficie añadidos al cierre de Fase 1:

- éxito: `--color-success-text`, `--color-success-border`,
  `--color-success-soft`;
- oscuridad: `--color-dark-border-subtle`,
  `--color-dark-border-standard`, `--color-dark-surface-soft`;
- señal: `--color-signal-border-faint`, `--color-signal-border-subtle`,
  `--color-signal-border-standard`, `--color-signal-surface-soft`,
  `--color-signal-grid`, `--color-signal-link-soft`;
- red: `--color-network-surface-start`, `--color-network-surface-end`,
  `--color-network-node`;
- foco: `--color-focus-ring`.

Los valores hexadecimales o `rgba(...)` se definen en la raíz del sistema; los
componentes nuevos consumen el token que describe su función. Transparencias
únicas, máscaras y sombras pueden conservar un valor directo cuando no forman
un patrón semántico reutilizable.

## Animations

Permitido: hover de `2–6px`, underline, fade corto, transición de color y pulso de nodo moderado.

- `--motion-fast: 160ms`
- `--motion-standard: 240ms`
- `--ease-standard: cubic-bezier(.2, .8, .2, 1)`

Prohibido: scroll hijacking, parallax intenso, rebotes, animaciones largas o fondos de alto consumo. `prefers-reduced-motion: reduce` debe reducir animaciones y scroll suave.

## Responsive rules

1. Diseñar el componente en 360px antes de cerrarlo en desktop.
2. No depender de hover para descubrir información.
3. Acciones táctiles de al menos 44px.
4. Grids pasan a una columna cuando la lectura o el orden semántico lo exigen.
5. Tablas conservan semántica y pueden usar scroll horizontal visible.
6. Diagramas se vuelven verticales en móvil.
7. Textos no deben cortarse ni usar tamaños fijos que causen overflow.
8. Navbar pasa a menú nativo `details/summary` antes de 1040px.

## Accessibility

Objetivo: WCAG 2.2 AA donde sea razonablemente aplicable.

- Contraste: 4.5:1 para texto normal y 3:1 para texto grande/componentes.
- Foco visible global de 3px; nunca eliminar `outline` sin reemplazo.
- Navegación completa por teclado.
- Un `h1` y un `main` por página; jerarquía de encabezados ordenada.
- Skip link en cada ruta.
- Alt descriptivo cuando la imagen aporta contenido; alt vacío cuando es decorativa.
- Labels asociados, errores textuales y consentimiento explícito.
- Estados no comunicados solo con color.
- Respetar `prefers-reduced-motion`.
- Evitar texto dentro de imágenes cuando deba leerse o traducirse.

## Do

- Mostrar relaciones: nodo → enlace → destino.
- Usar blanco y neutros como espacio de precisión.
- Mantener claims concretos y verificables.
- Priorizar una acción por bloque.
- Reutilizar tokens y componentes existentes.
- Verificar responsive, teclado, foco y contraste antes de publicar.

## Don't

- No convertir cada párrafo en una tarjeta.
- No usar neón, estética gamer, vidrio excesivo ni gradientes por defecto.
- No usar abreviaturas como decoración.
- No añadir bibliotecas por un solo icono o efecto.
- No inventar datos, SLA, cobertura, clientes o certificaciones.
- No duplicar valores mágicos que ya existen como tokens.
- No rediseñar navegación o contenido global sin el alcance de una fase posterior.

## Production considerations

- `/design-system/` permanece disponible, no indexable (`noindex`, `nofollow`,
  `noarchive`) y fuera del sitemap durante Fase 2. En Fase 3 deberá decidirse si
  se excluye por completo del despliegue de producción o si continúa como
  documentación técnica no indexable. Este cierre no implementa la exclusión.
- Header, navegación móvil y footer se generan desde
  `.github/scripts/site-shell.mjs` con
  `.github/scripts/sync-shell.mjs`. Las trece rutas comerciales conservan HTML
  estático final, pero ya no dependen de sincronización manual.
- `validate-site.mjs` compara cada shell publicado contra la fuente compartida.
  Una divergencia de cabecera o footer se considera una falla severa de CI.

## Phase 2 reusable UX patterns

La Fase 2 añade patrones reutilizables por función, no por apariencia:

- **Journey panel:** separa recorridos completos, como Hogar y Empresas.
- **Technical console:** representa demanda, acceso, impacto o cobertura sin
  simular telemetría ni resultados en tiempo real.
- **Editorial ledger:** ordena escenarios o criterios con ritmo lineal y evita
  convertir cada párrafo en una tarjeta.
- **Decision split:** relaciona una pregunta crítica con una acción y sus
  condiciones aplicables.
- **Category spectrum:** organiza familias de contenido con jerarquía variable,
  sin depender de marcas o materiales de terceros.
- **Closing panel:** una conclusión, un siguiente paso y microcopy prudente.
- **Shared site shell:** cabecera y footer declarados una vez, generados en HTML
  nativo y verificados en CI.

El patrón se usa solamente cuando el problema de información coincide. Las
páginas de solución conservan composiciones distintas para evitar monotonía y
para que la estructura responda al producto.
