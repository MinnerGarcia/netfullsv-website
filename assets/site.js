(() => {
  "use strict";

  const analyticsEvent = (name, detail = {}) => {
    const safeDetail = { event: name, ...detail };
    window.dispatchEvent(new CustomEvent("netfull:interaction", { detail: safeDetail }));
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(safeDetail);
  };

  document.querySelectorAll("[data-event]").forEach((element) => {
    element.addEventListener("click", () => {
      analyticsEvent(element.dataset.event, {
        page: document.body.dataset.page || "unknown",
        placement: element.dataset.placement || "content"
      });
    });
  });

  document.querySelectorAll("details.mobile-menu a").forEach((link) => {
    link.addEventListener("click", () => link.closest("details")?.removeAttribute("open"));
  });

  const serviceFromQuery = new URLSearchParams(window.location.search).get("servicio");
  if (serviceFromQuery) {
    const aliases = new Map([
      ["empresa", "Internet empresarial"],
      ["internet-empresarial", "Internet empresarial"],
      ["internet-dedicado", "Internet dedicado"],
      ["secure-connect", "Netfull Secure Connect"],
      ["interconexion", "Interconexión de sucursales"],
      ["ip-publica", "IP pública empresarial"],
      ["soporte-empresarial", "Soporte empresarial"],
      ["tv", "TV Digital"]
    ]);
    document.querySelectorAll('select[name="service"]').forEach((select) => {
      const expected = aliases.get(serviceFromQuery);
      const option = Array.from(select.options).find((item) => item.textContent.trim() === expected);
      if (option) select.value = option.value;
    });
  }

  document.querySelectorAll("[data-whatsapp-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const service = String(data.get("service") || "Información general").trim();
      const zone = String(data.get("zone") || "").trim();
      const need = String(data.get("need") || "").trim();
      const context = String(form.dataset.context || "consulta").trim();
      const lines = [
        `Hola Netfull. Quiero realizar una ${context}.`,
        `Servicio: ${service}.`,
        zone ? `Zona aproximada: ${zone}.` : "",
        need ? `Necesidad general: ${need}.` : ""
      ].filter(Boolean);
      const url = new URL("https://wa.me/50379031293");
      url.searchParams.set("text", lines.join("\n"));
      analyticsEvent("contacto_whatsapp", {
        page: document.body.dataset.page || "unknown",
        serviceCategory: form.dataset.category || "general"
      });
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    });
  });

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
