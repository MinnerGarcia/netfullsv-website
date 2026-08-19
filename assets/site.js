(() => {
  "use strict";

  const allowedPlans = Object.freeze({
    "30": Object.freeze({ speed: "30 Mbps", price: "$28/mes" }),
    "100": Object.freeze({ speed: "100 Mbps", price: "$33/mes" }),
    "200": Object.freeze({ speed: "200 Mbps", price: "$53/mes" })
  });

  const serviceAliases = new Map([
    ["hogar", ["Internet para mi hogar"]],
    ["empresa", ["Conectividad para mi empresa", "Internet empresarial"]],
    ["internet-empresarial", ["Internet empresarial", "Conectividad para mi empresa"]],
    ["internet-dedicado", ["Internet dedicado"]],
    ["secure-connect", ["Netfull Secure Connect"]],
    ["interconexion", ["Interconexión de sucursales"]],
    ["ip-publica", ["IP pública empresarial"]],
    ["soporte-empresarial", ["Soporte empresarial"]],
    ["tv", ["TV Digital"]]
  ]);

  const query = new URLSearchParams(window.location.search);
  const normalized = (value) => String(value || "").trim().toLocaleLowerCase("es");
  const safeText = (value, maxLength) => String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

  const analyticsEvent = (name, detail = {}) => {
    const safeDetail = { event: name, ...detail };
    window.dispatchEvent(new CustomEvent("netfull:interaction", { detail: safeDetail }));
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(safeDetail);
  };

  const findAllowedService = (select, rawValue) => {
    const options = Array.from(select.options).filter((option) => option.value);
    const rawKey = normalized(rawValue);
    const direct = options.find((option) => normalized(option.textContent) === rawKey);
    if (direct) return direct;
    const aliases = serviceAliases.get(rawKey) || [];
    return options.find((option) => aliases.includes(option.textContent.trim())) || null;
  };

  document.querySelectorAll("[data-event]").forEach((element) => {
    element.addEventListener("click", () => {
      const detail = {
        page: document.body.dataset.page || "unknown",
        placement: element.dataset.placement || "content"
      };
      if (allowedPlans[element.dataset.plan]) detail.plan = element.dataset.plan;
      if (element.dataset.source === "hogar") detail.source = "hogar";
      analyticsEvent(element.dataset.event, detail);
    });
  });

  document.querySelectorAll("details.mobile-menu a").forEach((link) => {
    link.addEventListener("click", () => link.closest("details")?.removeAttribute("open"));
  });

  const serviceFromQuery = query.get("servicio");
  if (serviceFromQuery) {
    document.querySelectorAll('select[name="service"]').forEach((select) => {
      const option = findAllowedService(select, serviceFromQuery);
      if (option) select.value = option.value;
    });
  }

  const coverageForm = document.querySelector('[data-whatsapp-form][data-category="cobertura"]');
  let selectedPlan = "";
  let coverageSource = "directo";

  if (coverageForm) {
    const serviceSelect = coverageForm.elements.namedItem("service");
    const planSelect = coverageForm.elements.namedItem("plan");
    const planContext = coverageForm.querySelector("[data-plan-context]");
    const planSummary = coverageForm.querySelector("[data-plan-summary]");
    const planField = coverageForm.querySelector("[data-plan-field]");
    const changePlan = coverageForm.querySelector("[data-change-plan]");

    const isHomeService = () => serviceSelect?.value === "Internet para mi hogar";
    const updatePlan = (planKey, revealSelector = false) => {
      const plan = allowedPlans[planKey];
      selectedPlan = plan ? planKey : "";
      if (planSelect) planSelect.value = selectedPlan;
      if (planSummary) planSummary.textContent = plan ? `${plan.speed} · ${plan.price}` : "";
      if (planContext) planContext.hidden = !plan;
      if (planField) planField.hidden = Boolean(plan && !revealSelector) || !isHomeService();
    };

    const queryPlan = query.get("plan") || "";
    const validQueryPlan = Object.hasOwn(allowedPlans, queryPlan) ? queryPlan : "";
    coverageSource = normalized(serviceFromQuery) === "hogar" ? "hogar" : "directo";
    updatePlan(isHomeService() ? validQueryPlan : "", !validQueryPlan && isHomeService());

    analyticsEvent("iniciar_cobertura", {
      page: "cobertura",
      plan: selectedPlan || "none",
      source: coverageSource
    });

    serviceSelect?.addEventListener("change", () => {
      if (!isHomeService()) {
        updatePlan("");
        return;
      }
      updatePlan(selectedPlan, !selectedPlan);
    });

    planSelect?.addEventListener("change", () => {
      const nextPlan = Object.hasOwn(allowedPlans, planSelect.value) ? planSelect.value : "";
      updatePlan(nextPlan, true);
      if (nextPlan) analyticsEvent("seleccionar_plan", { page: "cobertura", plan: nextPlan, source: coverageSource });
    });

    changePlan?.addEventListener("click", () => {
      updatePlan(selectedPlan, true);
      planSelect?.focus();
    });
  }

  document.querySelectorAll("[data-whatsapp-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const service = safeText(data.get("service") || "Información general", 80);
      const zone = safeText(data.get("zone"), 80);
      const need = safeText(data.get("need"), 300);
      const context = safeText(form.dataset.context || "consulta", 80);
      const isCoverage = form.dataset.category === "cobertura";
      const planKey = isCoverage && service === "Internet para mi hogar" && Object.hasOwn(allowedPlans, String(data.get("plan")))
        ? String(data.get("plan"))
        : "";
      const plan = allowedPlans[planKey];

      const lines = isCoverage
        ? [
            "Hola Netfull.",
            "",
            "Quiero solicitar verificación de cobertura.",
            "",
            `Servicio: ${service === "Internet para mi hogar" ? "Internet para hogar" : service}`,
            plan ? `Plan de interés: ${plan.speed} — ${plan.price}` : "",
            zone ? `Zona aproximada: ${zone}` : "",
            need ? `Necesidad general: ${need}` : ""
          ].filter((line, index, values) => line || (index > 0 && values[index - 1]))
        : [
            `Hola Netfull. Quiero realizar una ${context}.`,
            `Servicio: ${service}.`,
            zone ? `Zona aproximada: ${zone}.` : "",
            need ? `Necesidad general: ${need}.` : ""
          ].filter(Boolean);

      if (isCoverage) {
        analyticsEvent("enviar_cobertura", {
          page: "cobertura",
          plan: planKey || "none",
          source: coverageSource
        });
      }
      analyticsEvent("contacto_whatsapp", {
        page: document.body.dataset.page || "unknown",
        serviceCategory: form.dataset.category || "general"
      });

      const whatsappUrl = `https://wa.me/50379031293?text=${encodeURIComponent(lines.join("\n"))}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    });
  });

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
