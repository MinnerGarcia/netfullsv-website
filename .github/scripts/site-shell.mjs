export const publicPages = [
  { file: "index.html", prefix: "", active: "", ctaHref: "cobertura/", ctaLabel: "Verificar cobertura" },
  { file: "hogar/index.html", prefix: "../", active: "hogar", ctaHref: "../cobertura/", ctaLabel: "Consultar cobertura" },
  { file: "empresas/index.html", prefix: "../", active: "empresas", ctaHref: "../contacto/?servicio=empresa", ctaLabel: "Solicitar asesoría" },
  { file: "internet-empresarial/index.html", prefix: "../", active: "empresas", ctaHref: "../contacto/?servicio=internet-empresarial", ctaLabel: "Solicitar asesoría" },
  { file: "internet-dedicado/index.html", prefix: "../", active: "empresas", ctaHref: "../contacto/?servicio=internet-dedicado", ctaLabel: "Solicitar propuesta" },
  { file: "vpn-empresarial/index.html", prefix: "../", active: "empresas", ctaHref: "../contacto/?servicio=secure-connect", ctaLabel: "Evaluar mis sedes" },
  { file: "interconexion-sucursales/index.html", prefix: "../", active: "empresas", ctaHref: "../contacto/?servicio=interconexion", ctaLabel: "Evaluar sedes" },
  { file: "ip-publica/index.html", prefix: "../", active: "empresas", ctaHref: "../contacto/?servicio=ip-publica", ctaLabel: "Consultar" },
  { file: "soporte-empresarial/index.html", prefix: "../", active: "empresas", ctaHref: "../contacto/?servicio=soporte-empresarial", ctaLabel: "Solicitar asesoría" },
  { file: "tv/index.html", prefix: "../", active: "tv", ctaHref: "../contacto/?servicio=tv", ctaLabel: "Consultar TV" },
  { file: "nosotros/index.html", prefix: "../", active: "nosotros", ctaHref: "../contacto/", ctaLabel: "Contactar" },
  { file: "cobertura/index.html", prefix: "../", active: "cobertura", ctaHref: "#consulta", ctaLabel: "Consultar" },
  { file: "contacto/index.html", prefix: "../", active: "contacto", ctaHref: "#rutas", ctaLabel: "Iniciar consulta" }
];

const navItems = [
  ["hogar", "hogar/", "Hogar"],
  ["empresas", "empresas/", "Empresas"],
  ["tv", "tv/", "TV Digital"],
  ["cobertura", "cobertura/", "Cobertura"],
  ["nosotros", "nosotros/", "Netfull"],
  ["contacto", "contacto/", "Contacto"]
];

function navLinks(prefix, active) {
  return navItems.map(([key, route, label]) => `<a href="${prefix}${route}"${active === key ? ' aria-current="page"' : ""}>${label}</a>`).join("");
}

export function renderHeader(page) {
  const { prefix, active, ctaHref, ctaLabel } = page;
  const links = navLinks(prefix, active);
  return `<header class="site-header" aria-label="Navegación principal"><div class="container header-inner"><a class="brand" href="${prefix || "./"}" aria-label="Netfull, inicio"><img class="brand-logo" src="${prefix}assets/logo-netfull.png" width="50" height="50" alt=""><span><span class="brand-name"><span>NET</span>FULL</span><span class="brand-tagline">Conectando lo que importa</span></span></a><nav class="nav-links" aria-label="Secciones principales">${links}</nav><div class="header-actions"><a class="button button-primary button-small header-cta" href="${ctaHref}">${ctaLabel} <span>→</span></a><details class="mobile-menu"><summary aria-label="Abrir menú"><svg class="menu-glyph" aria-hidden="true" focusable="false"><use href="${prefix}assets/icons/netfull-icons.svg#nf-menu"></use></svg></summary><nav aria-label="Menú móvil">${links}</nav></details></div></div></header>`;
}

export function renderFooter(page) {
  const { prefix } = page;
  const home = prefix || "./";
  return `<footer class="site-footer"><div class="container"><div class="footer-grid"><div class="footer-brand"><a class="brand" href="${home}" aria-label="Netfull, inicio"><img class="brand-logo" src="${prefix}assets/logo-netfull.png" width="50" height="50" alt=""><span><span class="brand-name"><span>NET</span>FULL</span><span class="brand-tagline">Conectando lo que importa</span></span></a><p>Conectividad para hogares y operaciones empresariales.</p><a class="footer-domain" href="https://netfullsv.com/">netfullsv.com</a></div><div class="footer-col"><strong>Hogar</strong><a href="${prefix}hogar/">Internet residencial</a><a href="${prefix}tv/">TV Digital</a><a href="${prefix}cobertura/">Cobertura</a></div><div class="footer-col"><strong>Empresas</strong><a href="${prefix}empresas/">Soluciones</a><a href="${prefix}internet-empresarial/">Internet empresarial</a><a href="${prefix}internet-dedicado/">Internet dedicado</a><a href="${prefix}vpn-empresarial/">Secure Connect</a></div><div class="footer-col"><strong>Soporte</strong><a href="${prefix}contacto/">Contacto</a><a href="${prefix}soporte-empresarial/">Soporte empresarial</a><a href="${prefix}cobertura/">Solicitar cobertura</a></div><div class="footer-col"><strong>Empresa</strong><a href="${prefix}nosotros/">Conoce Netfull</a><a href="mailto:corporativo@netfullsv.com">Correo corporativo</a></div><div class="footer-col"><strong>Legal</strong><a href="${prefix}privacidad.html">Privacidad</a></div></div><div class="footer-bottom"><span>© <span data-year>2026</span> Netfull. Todos los derechos reservados.</span><span>Nuevo Lourdes, El Salvador · +503 7903 1293</span></div></div></footer>`;
}
