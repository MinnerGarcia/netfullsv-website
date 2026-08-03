const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".nav-links");

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menú");
  navigation.classList.remove("open");
  document.body.classList.remove("menu-open");
}

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
  navigation.classList.toggle("open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

const tvContent = {
  vivo: {
    label: "Televisión en vivo",
    title: "Todo lo que quieres ver, bien organizado.",
    description: "Recorre señales nacionales e internacionales, guarda tus favoritas y vuelve rápidamente a los canales recientes.",
    items: ["Canales organizados por categorías", "Favoritos y señales recientes", "Información de programación cuando está disponible"]
  },
  deportes: {
    label: "Deportes y eventos",
    title: "La emoción también se vive en casa.",
    description: "Consulta eventos por fecha, país o competencia y encuentra programación de fútbol europeo y transmisiones especiales, sin pagos adicionales por cada liga.",
    items: ["Ligas destacadas de España, Inglaterra, Francia e Italia", "Agenda de eventos por fecha y competencia", "Contenido disponible incluido en tu plan de TV Digital"]
  },
  cine: {
    label: "Películas",
    title: "Una noche de cine empieza con un clic.",
    description: "Descubre estrenos, títulos populares y películas organizadas por género, país, año y valoración.",
    items: ["Estrenos y títulos más vistos", "Filtros por género, país y año", "Fichas con duración, reparto y clasificación"]
  },
  series: {
    label: "Series",
    title: "Tus historias continúan donde las dejaste.",
    description: "Explora temporadas y episodios, consulta detalles y continúa viendo desde tu historial de reproducción.",
    items: ["Temporadas y episodios organizados", "Continuar viendo e historial", "Búsqueda y categorías especializadas"]
  },
  ninos: {
    label: "Contenido infantil",
    title: "Un espacio de entretenimiento para los pequeños.",
    description: "Encuentra animación, aventuras y contenido familiar en una categoría fácil de identificar y recorrer.",
    items: ["Categoría infantil dedicada", "Contenido familiar y de preenseñanza", "Navegación visual y sencilla"]
  },
  anime: {
    label: "Anime y animación",
    title: "Más mundos, más aventuras, más diversión.",
    description: "Accede a una selección dedicada de anime y animación, con nuevos títulos y filtros para descubrir contenido.",
    items: ["Selección especializada", "Títulos recién agregados", "Búsqueda y filtros de contenido"]
  }
};

const tvCatalogData = {
  cine: {
    kicker: "Películas recién llegadas",
    title: "Cine que ya puedes explorar.",
    description: "Títulos observados en la cartelera actual del servicio, con adelantos oficiales reproducibles aquí mismo.",
    items: [
      { title: "Borderline", year: "2025", genre: "Suspenso", videoId: "ORHBgSvX_24", source: "Magnolia Pictures", description: "Una noche impredecible entre comedia negra, obsesión y peligro.", verified: true },
      { title: "Infierno bajo cero", year: "2026", genre: "Supervivencia", videoId: "yOFZdp58qOU", source: "CineTrailer", description: "Frío extremo, aislamiento y una lucha contrarreloj por sobrevivir.", verified: true },
      { title: "The Truthers", year: "2026", genre: "Misterio", videoId: "IvL0oT13djs", source: "Netflix", description: "Una muerte extraña y un hogar lleno de secretos ponen la verdad en duda.", verified: true }
    ]
  },
  series: {
    kicker: "Series y documentales",
    title: "Historias que piden otro episodio.",
    description: "Una selección actual con crimen, drama familiar y documentales que están dando de qué hablar.",
    items: [
      { title: "The Hunting Party", year: "T2", genre: "Crimen", videoId: "rBvIDSrO36c", source: "NBC", description: "Una unidad especial sigue la pista de peligrosos asesinos fugados.", verified: true },
      { title: "El otro padre", year: "2026", genre: "Drama", videoId: "cAHSi8AXbCE", source: "Netflix", description: "Un trasplante urgente revela un secreto capaz de sacudir a dos familias.", verified: true },
      { title: "El minuto heroico", year: "2025", genre: "Documental", videoId: "F2W8nnFqAcU", source: "GRUP MEDIAPRO", description: "Trece mujeres relatan su experiencia y su ruptura con el Opus Dei.", verified: true }
    ]
  },
  ninos: {
    kicker: "Diversión para compartir",
    title: "Aventuras para los más pequeños.",
    description: "Personajes conocidos, historias familiares y adelantos oficiales pensados para ver juntos.",
    items: [
      { title: "Sofia the First: Royal Magic", year: "2026", genre: "Preescolar", videoId: "f-XXjTQk-SM", source: "Disney Jr.", description: "Sofia vuelve con nuevos amigos, escuela y mucha magia real.", verified: true },
      { title: "Bluey's Big Play", year: "2026", genre: "Familiar", videoId: "iwK_4UNPZdk", source: "Disney Jr.", description: "Bluey, Bingo, Bandit y Chilli llevan su energía al escenario.", verified: true },
      { title: "Dora: Reino de las Sirenas", year: "2025", genre: "Aventura", videoId: "kVVmyPSVu9o", source: "UIP Argentina", description: "Dora se sumerge en una nueva aventura mágica bajo el mar.", verified: true }
    ]
  },
  anime: {
    kicker: "Anime verificado en cartelera",
    title: "Cinco mundos que ya puedes explorar.",
    description: "Cinco títulos observados directamente en la sección Anime del servicio, todos con adelanto oficial.",
    items: [
      { title: "New Saga", year: "2025", genre: "Fantasía", videoId: "BaomnapVQ-0", source: "Crunchyroll", description: "Un espadachín vuelve al pasado para impedir una tragedia.", verified: true },
      { title: "Tomb Raider King", year: "2026", genre: "Acción", videoId: "mWpO0oHNYJ4", source: "AnimeSelect", description: "Reliquias, tumbas y una segunda oportunidad para dominar el futuro.", verified: true },
      { title: "Sentenced to Be a Hero", year: "2026", genre: "Fantasía oscura", videoId: "B5qZX2kh-7w", source: "Crunchyroll", description: "Aquí el heroísmo no es un honor: es una condena.", verified: true },
      { title: "Me & Roboco", year: "2023", genre: "Comedia", videoId: "M0X4J1jpApw", source: "Crunchyroll", description: "La robot doméstica más fuerte y extraña rompe todos los planes.", verified: true },
      { title: "Takopi's Original Sin", year: "2025", genre: "Drama", videoId: "j7dxZjwIhu0", source: "Crunchyroll", description: "Un visitante alegre descubre que la felicidad humana es complicada.", verified: true }
    ]
  }
};

const tvTabs = Array.from(document.querySelectorAll("[data-tv-key]"));
const tvPanel = document.getElementById("tv-panel");
const tvLabel = document.querySelector("[data-tv-label]");
const tvTitle = document.querySelector("[data-tv-title]");
const tvDescription = document.querySelector("[data-tv-description]");
const tvList = document.querySelector("[data-tv-list]");
const tvCatalog = document.querySelector("[data-tv-catalog]");
const browserKicker = document.querySelector("[data-browser-kicker]");
const browserTitle = document.querySelector("[data-browser-title]");
const browserDescription = document.querySelector("[data-browser-description]");
const browserRail = document.querySelector("[data-browser-rail]");
const trailerDialog = document.querySelector("[data-trailer-dialog]");
const trailerFrame = document.querySelector("[data-trailer-frame]");
const trailerDialogTitle = document.querySelector("[data-trailer-dialog-title]");

function openTrailer(videoId, title) {
  if (!videoId || !trailerDialog || !trailerFrame) return;
  trailerDialogTitle.textContent = title || "Tráiler oficial";
  trailerFrame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&modestbranding=1`;
  if (typeof trailerDialog.showModal === "function") trailerDialog.showModal();
}

function closeTrailer() {
  if (!trailerDialog || !trailerFrame) return;
  trailerFrame.src = "about:blank";
  if (trailerDialog.open) trailerDialog.close();
}

function createTitleCard(item, index, showRank) {
  const card = document.createElement("article");
  card.className = "tv-title-card";

  const preview = document.createElement("button");
  preview.className = "tv-title-preview";
  preview.type = "button";
  preview.setAttribute("aria-label", `Reproducir el adelanto oficial de ${item.title}`);
  preview.addEventListener("click", () => openTrailer(item.videoId, `${item.title} · Adelanto oficial`));

  const image = document.createElement("img");
  image.src = `https://i.ytimg.com/vi/${item.videoId}/maxresdefault.jpg`;
  image.alt = `Imagen del adelanto oficial de ${item.title}`;
  image.width = 1280;
  image.height = 720;
  image.loading = "lazy";
  image.addEventListener("error", () => {
    image.src = `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`;
  }, { once: true });
  preview.append(image);

  if (showRank) {
    const rank = document.createElement("span");
    rank.className = "tv-title-rank";
    rank.textContent = String(index + 1).padStart(2, "0");
    preview.append(rank);
  }

  const play = document.createElement("span");
  play.className = "tv-title-play";
  play.setAttribute("aria-hidden", "true");
  play.textContent = "▶";
  preview.append(play);

  const body = document.createElement("div");
  body.className = "tv-title-body";
  const meta = document.createElement("div");
  meta.className = "tv-title-meta";
  const status = document.createElement("span");
  status.className = item.verified ? "available" : "";
  status.textContent = item.verified ? "En cartelera" : "Tendencia";
  const genre = document.createElement("span");
  genre.textContent = item.genre;
  const year = document.createElement("span");
  year.textContent = item.year;
  meta.append(status, genre, year);
  const heading = document.createElement("h4");
  heading.textContent = item.title;
  const description = document.createElement("p");
  description.textContent = item.description;
  const source = document.createElement("p");
  source.textContent = `Adelanto oficial · ${item.source}`;
  source.className = "tv-title-source";
  body.append(meta, heading, description, source);
  card.append(preview, body);
  return card;
}

function renderTvCatalog(key, shouldScroll = false) {
  const catalog = tvCatalogData[key];
  if (!tvCatalog || !browserRail) return;
  if (!catalog) {
    tvCatalog.hidden = true;
    browserRail.replaceChildren();
    return;
  }

  tvCatalog.hidden = false;
  browserKicker.textContent = catalog.kicker;
  browserTitle.textContent = catalog.title;
  browserDescription.textContent = catalog.description;
  browserRail.replaceChildren(...catalog.items.map((item, index) => createTitleCard(item, index, key === "anime")));
  browserRail.scrollLeft = 0;
  if (shouldScroll) requestAnimationFrame(() => tvCatalog.scrollIntoView({ behavior: "smooth", block: "nearest" }));
}

function activateTvTab(tab, moveFocus = false, shouldScroll = false) {
  const content = tvContent[tab.dataset.tvKey];
  if (!content || !tvPanel) return;

  tvTabs.forEach((item) => {
    const isActive = item === tab;
    item.setAttribute("aria-selected", String(isActive));
    item.tabIndex = isActive ? 0 : -1;
  });

  tvPanel.setAttribute("aria-labelledby", tab.id);
  tvLabel.textContent = content.label;
  tvTitle.textContent = content.title;
  tvDescription.textContent = content.description;
  tvList.replaceChildren(...content.items.map((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    return listItem;
  }));
  renderTvCatalog(tab.dataset.tvKey, shouldScroll);

  if (moveFocus) tab.focus();
}

tvTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTvTab(tab, false, true));
  tab.addEventListener("keydown", (event) => {
    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tvTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + tvTabs.length) % tvTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tvTabs.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    activateTvTab(tvTabs[nextIndex], true);
  });
});

if (tvTabs.length) activateTvTab(tvTabs[0]);

document.querySelectorAll("[data-trailer-id]").forEach((button) => {
  button.addEventListener("click", () => openTrailer(button.dataset.trailerId, button.dataset.trailerTitle));
});

document.querySelector("[data-trailer-close]")?.addEventListener("click", closeTrailer);
trailerDialog?.addEventListener("click", (event) => {
  if (event.target === trailerDialog) closeTrailer();
});
trailerDialog?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeTrailer();
});

document.querySelectorAll("[data-browser-direction]").forEach((control) => {
  control.addEventListener("click", () => {
    const direction = Number(control.dataset.browserDirection) || 1;
    browserRail?.scrollBy({ left: direction * Math.min(browserRail.clientWidth * .82, 760), behavior: "smooth" });
  });
});

document.querySelectorAll("[data-rail-target]").forEach((control) => {
  control.addEventListener("click", () => {
    const rail = document.getElementById(control.dataset.railTarget);
    if (!rail) return;
    const direction = Number(control.dataset.railDirection) || 1;
    rail.scrollBy({ left: direction * Math.min(rail.clientWidth * .82, 760), behavior: "smooth" });
  });
});

document.querySelector("[data-coverage-form]").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const message = `Hola, soy ${data.get("nombre")}. Quiero verificar cobertura de Netfull en ${data.get("ubicacion")}. Me interesa el plan ${data.get("plan")}.`;
  window.open(`https://wa.me/50379031293?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.setAttribute("aria-current", String(link.getAttribute("href") === `#${entry.target.id}`));
    });
  });
}, { rootMargin: "-30% 0px -60%", threshold: 0 });

document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));
document.getElementById("year").textContent = new Date().getFullYear();
