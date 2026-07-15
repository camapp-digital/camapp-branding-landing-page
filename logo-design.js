const landingConfig = window.camappLandingConfig || {};

// Update these values when the verified CamApp Digital contact links are available.
const contactLinks = {
  telegram: "https://telegram.me/CamAppDigital",
  messenger: "https://m.me/CamAppDigital",
  facebook: "https://m.me/CamAppDigital",
  ...landingConfig.contactLinks,
};

const trustStats = {
  projects: "100+",
  // Replace 85+ with the real number of unique clients served before publishing.
  businesses: "85+",
  // Confirm the 99% satisfaction rate before publishing.
  satisfaction: "99%",
  // Confirm that this response time matches the actual CamApp Digital response process.
  response: "Within 1 Hour",
};

const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const navigation = document.querySelector("[data-navigation]");
const filterBar = document.querySelector("[data-filters]");
const portfolioGrid = document.querySelector("[data-portfolio-grid]");
let filterButtons = [];
let projectCards = [];
const packageButtons = document.querySelectorAll("[data-package]");
const packageCards = document.querySelectorAll("[data-package-card]");
const packageSelect = document.querySelector("[data-package-select]");
const selectionDisplay = document.querySelector("[data-selection-display]");
const selectionName = document.querySelector("[data-selection-name]");
const selectionPrice = document.querySelector("[data-selection-price]");
const clearSelectionButton = document.querySelector("[data-clear-selection]");
const form = document.querySelector("[data-logo-form]");
const formPanel = document.querySelector(".form-panel");
const successPanel = document.querySelector("[data-success-panel]");
const formStatus = document.querySelector("[data-form-status]");
const submitButton = document.querySelector(".submit-button");
const proposalTitle = document.querySelector("[data-proposal-title]");
const proposalSummary = document.querySelector("[data-proposal-summary]");
const proposalId = document.querySelector("[data-proposal-id]");
const proposalDate = document.querySelector("[data-proposal-date]");
const proposalFields = document.querySelector("[data-proposal-fields]");
const proposalStatus = document.querySelector("[data-proposal-status]");
const sendTelegramButton = document.querySelector("[data-send-telegram]");
const copyProposalButton = document.querySelector("[data-copy-proposal]");
const fileInput = document.querySelector("[data-file-input]");
const fileName = document.querySelector("[data-file-name]");
const useFieldset = document.querySelector("[data-use-error]")?.closest("fieldset");
const contactToast = document.querySelector("[data-contact-toast]");
const storedPackageKey = landingConfig.storedPackageKey || "camappSelectedLogoPackage";
let latestProposalText = "";
const isKhmerPage = document.documentElement.lang === "km";
const portfolioData = window.camappPortfolioData || { categories: [], projects: [] };
const portfolioState = {
  category: "all",
  page: 1,
  pageSize: 9,
};
const copy = {
  openNavigation: isKhmerPage ? "បើកម៉ឺនុយ" : "Open navigation",
  closeNavigation: isKhmerPage ? "បិទម៉ឺនុយ" : "Close navigation",
  defaultFileName: isKhmerPage ? "PNG, JPEG, WebP ឬ PDF · អតិបរមា 10 MB" : "PNG, JPEG, WebP, or PDF · Maximum 10 MB",
  largeFile: isKhmerPage
    ? "ឯកសារនេះធំជាង 10 MB។ សូមជ្រើសឯកសារតូចជាងនេះ។"
    : "This file is larger than 10 MB. Please choose a smaller file.",
  requiredFields: isKhmerPage
    ? "សូមបំពេញប្រអប់ចាំបាច់ដែលបានសម្គាល់។"
    : "Please complete the highlighted required fields.",
  sending: landingConfig.sendingText || (isKhmerPage ? "កំពុងបង្កើតសំណើររបស់អ្នក..." : "Generating your proposal…"),
  noPortfolioProjects: "No portfolio projects are available in this category yet.",
  previousPortfolioPage: isKhmerPage ? "ទៅទំព័រស្នាដៃមុន" : "Go to previous portfolio page",
  nextPortfolioPage: isKhmerPage ? "ទៅទំព័រស្នាដៃបន្ទាប់" : "Go to next portfolio page",
  portfolioPage: isKhmerPage ? "ទៅទំព័រស្នាដៃ" : "Go to portfolio page",
  portfolioUpdated: isKhmerPage ? "ស្នាដៃត្រូវបានធ្វើបច្ចុប្បន្នភាព" : "Portfolio projects updated",
  proposalCopied: isKhmerPage ? "បានចម្លងសំណើរ។" : "Proposal copied.",
  proposalTelegram: isKhmerPage
    ? "បានចម្លងសំណើរ។ សូមបិទភ្ជាប់ក្នុង Telegram របស់ CamApp Digital ដើម្បីផ្ញើ។"
    : "Proposal copied. Paste it in the CamApp Digital Telegram chat to send it.",
  proposalCopyFallback: isKhmerPage
    ? "មិនអាចចម្លងដោយស្វ័យប្រវត្តិបានទេ។ សូមជ្រើសអត្ថបទសំណើរ និងចម្លងដោយដៃ។"
    : "Could not copy automatically. Please select the proposal text and copy it manually.",
};

const portfolioAssetBase = (() => {
  const path = window.location.pathname;
  if (path.includes("/logo-design/en/")) return "../../assets";
  if (path.includes("/branding-packages/")) return "../assets";
  if (path.includes("/logo-design/")) return "../assets";
  return "assets";
})();

let revealObserver;

const revealElements = (items) => {
  const elements = Array.from(items).filter((item) => item && !item.classList.contains("is-visible"));
  if (!elements.length) return;

  const shouldAnimate =
    "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!shouldAnimate) {
    elements.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
  }

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  elements.forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.top < viewportHeight && rect.bottom > 0) {
      item.classList.add("is-visible");
      return;
    }

    revealObserver.observe(item);
  });
};

const localText = (item, key) => item[`${key}${isKhmerPage ? "Km" : "En"}`] || item[`${key}En`] || "";

const getPortfolioPageSize = () => {
  if (window.matchMedia("(max-width: 640px)").matches) return 4;
  if (window.matchMedia("(max-width: 1024px)").matches) return 6;
  return 9;
};

const getPortfolioQueryState = () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("portfolio-category") || "all";
  const page = Number.parseInt(params.get("portfolio-page") || "1", 10);
  return {
    category,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
};

const updatePortfolioUrl = () => {
  const params = new URLSearchParams(window.location.search);

  if (portfolioState.page > 1) {
    params.set("portfolio-page", String(portfolioState.page));
  } else {
    params.delete("portfolio-page");
  }

  if (portfolioState.category !== "all") {
    params.set("portfolio-category", portfolioState.category);
  } else {
    params.delete("portfolio-category");
  }

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  try {
    window.history.replaceState(null, "", nextUrl);
  } catch (error) {
    // Keep the portfolio usable even if a browser blocks history updates.
  }
};

const portfolioTop = () => document.querySelector("#portfolio-title") || portfolioGrid;

const scrollToPortfolioTop = () => {
  portfolioTop()?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const portfolioPageRange = (currentPage, totalPages) => {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
  }
  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
  }

  const ordered = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  return ordered.reduce((items, page, index) => {
    if (index > 0 && page - ordered[index - 1] > 1) items.push("ellipsis");
    items.push(page);
    return items;
  }, []);
};

const createPortfolioCard = (project) => {
  const imagePath = `${portfolioAssetBase}/${project.imagePath}`;
  const categoryLabel = isKhmerPage ? project.categoryLabelKm : project.categoryLabelEn;
  const description = isKhmerPage ? project.descriptionKm : project.descriptionEn;
  const altText = isKhmerPage ? project.altTextKm : project.altTextEn;
  const ctaLabel =
    landingConfig.portfolioCtaLabel ||
    (isKhmerPage ? "បង្កើតឡូហ្គោសម្រាប់អាជីវកម្មរបស់ខ្ញុំ" : "Create a Logo for My Business");

  return `
    <article class="project-card" data-portfolio-card data-category="${project.businessCategory}">
      <div class="project-image">
        <img src="${imagePath}" alt="${altText}" width="${project.imageWidth}" height="${project.imageHeight}" loading="lazy" decoding="async" />
      </div>
      <div class="project-content">
        <p class="project-category">${categoryLabel}</p>
        <h3>${project.brandName}</h3>
        <p>${description}</p>
        <a href="#inquiry">${ctaLabel} <span>→</span></a>
      </div>
    </article>
  `;
};

const renderPortfolioPagination = (totalPages) => {
  const pagination = document.querySelector("[data-portfolio-pagination]");
  if (!pagination) return;

  pagination.innerHTML = "";
  pagination.hidden = totalPages <= 1;
  if (totalPages <= 1) return;

  const createButton = ({ label, page, isActive = false, isDisabled = false, ariaLabel }) => {
    const button = document.createElement("button");
    button.className = `portfolio-page-button${isActive ? " is-active" : ""}`;
    button.type = "button";
    button.textContent = label;
    button.dataset.page = String(page);
    button.disabled = isDisabled;
    button.setAttribute("aria-label", ariaLabel);
    if (isActive) button.setAttribute("aria-current", "page");
    pagination.append(button);
  };

  createButton({
    label: "←",
    page: Math.max(1, portfolioState.page - 1),
    isDisabled: portfolioState.page === 1,
    ariaLabel: copy.previousPortfolioPage,
  });

  portfolioPageRange(portfolioState.page, totalPages).forEach((item) => {
    if (item === "ellipsis") {
      const ellipsis = document.createElement("span");
      ellipsis.className = "portfolio-page-ellipsis";
      ellipsis.textContent = "…";
      ellipsis.setAttribute("aria-hidden", "true");
      pagination.append(ellipsis);
      return;
    }

    createButton({
      label: String(item),
      page: item,
      isActive: item === portfolioState.page,
      ariaLabel: `${copy.portfolioPage} ${item}`,
    });
  });

  createButton({
    label: "→",
    page: Math.min(totalPages, portfolioState.page + 1),
    isDisabled: portfolioState.page === totalPages,
    ariaLabel: copy.nextPortfolioPage,
  });
};

const updatePortfolioLiveRegion = (visibleCount, totalCount, totalPages) => {
  const liveRegion = document.querySelector("[data-portfolio-status]");
  if (!liveRegion) return;

  if (totalCount === 0) {
    liveRegion.textContent = copy.noPortfolioProjects;
    return;
  }

  liveRegion.textContent = `${copy.portfolioUpdated}: ${visibleCount} of ${totalCount}, page ${portfolioState.page} of ${totalPages}.`;
};

const renderVisiblePortfolioProjects = ({ shouldScroll = false, shouldUpdateUrl = true } = {}) => {
  if (!portfolioGrid || !portfolioData.projects.length) return;

  portfolioState.pageSize = getPortfolioPageSize();
  const orderedProjects = portfolioData.projects.slice().sort((a, b) => a.displayOrder - b.displayOrder);
  const filteredProjects =
    portfolioState.category === "all"
      ? orderedProjects
      : orderedProjects.filter((project) => project.businessCategory === portfolioState.category);
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / portfolioState.pageSize));

  if (portfolioState.page > totalPages) portfolioState.page = totalPages;
  if (portfolioState.page < 1) portfolioState.page = 1;

  const start = (portfolioState.page - 1) * portfolioState.pageSize;
  const visibleProjects = filteredProjects.slice(start, start + portfolioState.pageSize);

  portfolioGrid.innerHTML = visibleProjects.length
    ? visibleProjects.map(createPortfolioCard).join("")
    : `<p class="portfolio-empty-state">${copy.noPortfolioProjects}</p>`;

  projectCards = Array.from(portfolioGrid.querySelectorAll("[data-portfolio-card]"));
  renderPortfolioPagination(totalPages);
  updatePortfolioLiveRegion(visibleProjects.length, filteredProjects.length, totalPages);

  if (shouldUpdateUrl) updatePortfolioUrl();
  if (shouldScroll) window.requestAnimationFrame(scrollToPortfolioTop);
};

const renderPortfolio = () => {
  if (!filterBar || !portfolioGrid || !portfolioData.projects.length) return;

  const usedCategories = new Set(portfolioData.projects.map((project) => project.businessCategory));
  const activeCategories = portfolioData.categories.filter((category) => usedCategories.has(category.id));
  const allLabel = isKhmerPage ? "ទាំងអស់" : "All";
  const queryState = getPortfolioQueryState();
  const validCategories = new Set(["all", ...activeCategories.map((category) => category.id)]);
  portfolioState.category = validCategories.has(queryState.category) ? queryState.category : "all";
  portfolioState.page = queryState.page;
  portfolioState.pageSize = getPortfolioPageSize();

  if (!document.querySelector("[data-portfolio-pagination]")) {
    const pagination = document.createElement("nav");
    pagination.className = "portfolio-pagination";
    pagination.dataset.portfolioPagination = "";
    pagination.setAttribute("aria-label", isKhmerPage ? "ទំព័រស្នាដៃ" : "Portfolio pagination");
    portfolioGrid.after(pagination);
  }

  if (!document.querySelector("[data-portfolio-status]")) {
    const status = document.createElement("p");
    status.className = "sr-only";
    status.dataset.portfolioStatus = "";
    status.setAttribute("aria-live", "polite");
    portfolioGrid.after(status);
  }

  filterBar.innerHTML = "";
  [{ id: "all", labelEn: "All", labelKm: "ទាំងអស់" }, ...activeCategories].forEach((category, index) => {
    const button = document.createElement("button");
    const isActive = category.id === portfolioState.category;
    button.className = `filter-button${isActive ? " is-active" : ""}`;
    button.type = "button";
    button.dataset.filter = category.id;
    button.setAttribute("aria-pressed", String(isActive));
    button.textContent = category.id === "all" ? allLabel : localText(category, "label");
    filterBar.append(button);
  });

  filterButtons = Array.from(filterBar.querySelectorAll("[data-filter]"));
  renderVisiblePortfolioProjects();
};

const setupPortfolioFilters = () => {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.filter;
      portfolioState.category = category;
      portfolioState.page = 1;

      filterButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      renderVisiblePortfolioProjects({ shouldScroll: true });
    });
  });
};

portfolioGrid?.parentElement?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-page]");
  if (!button || button.disabled) return;

  const nextPage = Number.parseInt(button.dataset.page, 10);
  if (!Number.isFinite(nextPage) || nextPage < 1) return;

  portfolioState.page = nextPage;
  renderVisiblePortfolioProjects({ shouldScroll: true });
});

window.addEventListener("resize", () => {
  const nextPageSize = getPortfolioPageSize();
  if (nextPageSize === portfolioState.pageSize) return;

  portfolioState.pageSize = nextPageSize;
  renderVisiblePortfolioProjects();
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();

Object.entries(trustStats).forEach(([key, value]) => {
  const stat = document.querySelector(`[data-stat="${key}"]`);
  if (stat) {
    stat.textContent = value;
  }
});

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

const closeMenu = () => {
  navigation.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", copy.openNavigation);
  document.body.classList.remove("menu-open");
};

menuButton.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? copy.closeNavigation : copy.openNavigation);
  document.body.classList.toggle("menu-open", isOpen);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    closeMenu();
  }
});

renderPortfolio();
setupPortfolioFilters();

const packagePrices = landingConfig.packagePrices || {
  "Basic Package": "$49",
  "Standard Package": "$79",
  "Premium Package": "$229",
};
const packageLabels = landingConfig.packageLabels || {
  "Basic Package": isKhmerPage ? "កញ្ចប់ Basic" : "Basic Package",
  "Standard Package": isKhmerPage ? "កញ្ចប់ Standard" : "Standard Package",
  "Premium Package": isKhmerPage ? "កញ្ចប់ Premium" : "Premium Package",
};

const packageOptionValue = (name) => `${name} — ${packagePrices[name]}`;

const setPackage = (name, shouldScroll = true) => {
  const price = packagePrices[name];
  if (!price) return;

  sessionStorage.setItem(storedPackageKey, name);
  selectionName.textContent = packageLabels[name] || name;
  selectionPrice.textContent = price;
  selectionDisplay.hidden = false;
  packageSelect.value = packageOptionValue(name);

  packageCards.forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.packageCard === name);
  });

  if (shouldScroll) {
    document.querySelector("#inquiry").scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const clearPackage = () => {
  sessionStorage.removeItem(storedPackageKey);
  selectionDisplay.hidden = true;
  selectionName.textContent = "";
  selectionPrice.textContent = "";
  packageSelect.value = "";
  packageCards.forEach((card) => card.classList.remove("is-selected"));
  packageSelect.focus();
};

packageButtons.forEach((button) => {
  button.addEventListener("click", () => setPackage(button.dataset.package));
});

packageSelect.addEventListener("change", () => {
  const selectedName = Object.keys(packagePrices).find((name) => packageSelect.value.startsWith(name));
  if (selectedName) {
    setPackage(selectedName, false);
  } else {
    sessionStorage.removeItem(storedPackageKey);
    selectionDisplay.hidden = true;
    packageCards.forEach((card) => card.classList.remove("is-selected"));
  }
});

clearSelectionButton.addEventListener("click", clearPackage);

const storedPackage = sessionStorage.getItem(storedPackageKey);
if (storedPackage) {
  setPackage(storedPackage, false);
}

const showContactFallback = () => {
  contactToast.hidden = false;
  window.clearTimeout(showContactFallback.timeoutId);
  showContactFallback.timeoutId = window.setTimeout(() => {
    contactToast.hidden = true;
  }, 5000);
};

document.querySelectorAll("[data-open-contact]").forEach((button) => {
  button.addEventListener("click", () => {
    const channel = button.dataset.openContact;
    const link = contactLinks[channel];
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      showContactFallback();
    }
  });
});

fileInput?.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) {
    if (fileName) fileName.textContent = copy.defaultFileName;
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    fileInput.value = "";
    if (fileName) fileName.textContent = copy.largeFile;
    fileInput.closest("label").classList.add("is-invalid");
    return;
  }

  fileInput.closest("label").classList.remove("is-invalid");
  if (fileName) fileName.textContent = file.name;
});

const clearInvalidState = (field) => {
  field.classList.remove("is-invalid");
  field.closest("label")?.classList.remove("is-invalid");
  field.closest("fieldset")?.classList.remove("is-invalid");
};

form.addEventListener("input", (event) => {
  clearInvalidState(event.target);
  formStatus.textContent = "";
});

form.addEventListener("change", (event) => {
  clearInvalidState(event.target);
  if (event.target.name === "logoUse") {
    useFieldset.classList.remove("is-invalid");
  }
});

const getFieldValue = (name) => {
  const field = form.elements[name];
  if (!field) return "";
  return field.value?.trim() || "";
};

const getSelectedOptionText = (name) => {
  const field = form.elements[name];
  return field?.selectedOptions?.[0]?.textContent.trim() || getFieldValue(name);
};

const getCheckedValue = (name) => {
  const field = form.querySelector(`input[name="${name}"]:checked`);
  return field?.value || "";
};

const getLogoUses = () =>
  Array.from(form.querySelectorAll('input[name="logoUse"]:checked')).map((field) => field.value);

const makeProposalId = () => {
  const now = new Date();
  const date =
    String(now.getFullYear()) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const time = String(now.getHours()).padStart(2, "0") + String(now.getMinutes()).padStart(2, "0");
  return `CAM-${date}-${time}`;
};

const proposalLabels = () => {
  const defaults = isKhmerPage
    ? {
        id: "លេខសំណើរ",
        date: "កាលបរិច្ឆេទ",
        client: "ឈ្មោះអតិថិជន",
        logo: "ឈ្មោះឡូហ្គោ",
        phone: "លេខទូរស័ព្ទ / Telegram",
        email: "អ៊ីមែល",
        category: "ប្រភេទអាជីវកម្ម",
        package: "កញ្ចប់ដែលបានជ្រើស",
        type: "ប្រភេទគម្រោង",
        description: "ការពិពណ៌នាអាជីវកម្ម",
        services: "ផលិតផល ឬសេវាកម្ម",
        customers: "អតិថិជនគោលដៅ",
        style: "រចនាប័ទ្មឡូហ្គោ",
        colors: "ពណ៌ដែលចូលចិត្ត",
        avoid: "ពណ៌ដែលត្រូវជៀសវាង",
        text: "អត្ថបទក្នុងឡូហ្គោ",
        use: "កន្លែងប្រើប្រាស់",
        empty: "មិនបានបញ្ជាក់",
        title: "សំណើររចនាឡូហ្គោ",
        next: "ជំហានបន្ទាប់៖ CamApp Digital នឹងពិនិត្យសំណើរ ហើយបញ្ជាក់វិសាលភាព ពេលវេលា និងការទូទាត់ មុនពេលចាប់ផ្តើមរចនា។",
      }
    : {
        id: "Proposal ID",
        date: "Date",
        client: "Client name",
        logo: "Logo name",
        phone: "Phone / Telegram",
        email: "Email",
        category: "Business category",
        package: "Selected package",
        type: "Project type",
        description: "Business description",
        services: "Products or services",
        customers: "Target customers",
        style: "Preferred logo style",
        colors: "Preferred colors",
        avoid: "Colors to avoid",
        text: "Text to include",
        use: "Logo usage",
        empty: "Not provided",
        title: "Logo Design Proposal",
        next: "Next step: CamApp Digital will review this request and confirm scope, timeline, and payment details before design begins.",
      };

  return { ...defaults, ...(landingConfig.proposalLabels || {}) };
};

const buildProposal = () => {
  const labels = proposalLabels();
  const id = makeProposalId();
  const date = new Date().toLocaleDateString(isKhmerPage ? "km-KH" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const values = {
    [labels.client]: getFieldValue("fullName"),
    [labels.logo]: getFieldValue("businessName"),
    [labels.phone]: getFieldValue("phone"),
    [labels.email]: getFieldValue("email") || labels.empty,
    [labels.category]: getSelectedOptionText("businessCategory"),
    [labels.package]: getSelectedOptionText("selectedPackage"),
    [labels.type]: getCheckedValue("projectType"),
    [labels.description]: getFieldValue("businessDescription"),
    [labels.services]: getFieldValue("productsServices"),
    [labels.customers]: getFieldValue("targetCustomers"),
    [labels.style]: getSelectedOptionText("logoStyle"),
    [labels.colors]: getFieldValue("preferredColors") || labels.empty,
    [labels.avoid]: getFieldValue("colorsAvoid") || labels.empty,
    [labels.text]: getFieldValue("logoText") || labels.empty,
    [labels.use]: getLogoUses().join(", "),
  };

  const title = `${labels.title}: ${values[labels.logo]}`;
  const text = [
    `CamApp Digital - ${labels.title}`,
    `${labels.id}: ${id}`,
    `${labels.date}: ${date}`,
    "",
    ...Object.entries(values).map(([label, value]) => `${label}: ${value || labels.empty}`),
    "",
    labels.next,
  ].join("\n");

  return { id, date, title, values, text };
};

const renderProposal = (proposal) => {
  latestProposalText = proposal.text;
  if (proposalTitle) proposalTitle.textContent = proposal.title;
  if (proposalSummary) {
    proposalSummary.textContent =
      landingConfig.proposalSummary ||
      (isKhmerPage
        ? "នេះគឺជាសំណើររចនាឡូហ្គោដែលបានបង្កើតពីព័ត៌មានរបស់អ្នក។"
        : "This proposal preview was generated from the client’s submitted information.");
  }
  if (proposalId) proposalId.textContent = `${proposalLabels().id}: ${proposal.id}`;
  if (proposalDate) proposalDate.textContent = `${proposalLabels().date}: ${proposal.date}`;
  if (proposalFields) {
    const labels = proposalLabels();
    proposalFields.replaceChildren();
    Object.entries(proposal.values).forEach(([label, value]) => {
      const item = document.createElement("div");
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = label;
      detail.textContent = value || labels.empty;
      item.append(term, detail);
      proposalFields.append(item);
    });
  }
  if (proposalStatus) proposalStatus.textContent = "";
};

const copyProposalText = async () => {
  if (!latestProposalText) return false;
  const fallbackCopy = () => {
    const textarea = document.createElement("textarea");
    textarea.value = latestProposalText;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.inset = "0 auto auto -9999px";
    document.body.append(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");
    } finally {
      textarea.remove();
    }
  };

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(latestProposalText);
    } else if (!fallbackCopy()) {
      throw new Error("Clipboard copy failed");
    }
    if (proposalStatus) proposalStatus.textContent = copy.proposalCopied;
    return true;
  } catch (error) {
    if (proposalStatus) proposalStatus.textContent = copy.proposalCopyFallback;
    return false;
  }
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent = "";

  const requiredFields = [...form.querySelectorAll("[required]")];
  requiredFields.forEach((field) => {
    if (!field.checkValidity()) {
      field.classList.add("is-invalid");
      field.closest("label")?.classList.add("is-invalid");
      field.closest("fieldset")?.classList.add("is-invalid");
    }
  });

  const hasLogoUse = form.querySelectorAll('input[name="logoUse"]:checked').length > 0;
  useFieldset.classList.toggle("is-invalid", !hasLogoUse);

  if (!form.checkValidity() || !hasLogoUse) {
    formStatus.textContent = copy.requiredFields;
    const firstInvalid = form.querySelector(".is-invalid, :invalid");
    firstInvalid?.focus();
    firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  submitButton.classList.add("is-loading");
  submitButton.disabled = true;
  formStatus.textContent = copy.sending;

  window.setTimeout(() => {
    const proposal = buildProposal();
    renderProposal(proposal);
    submitButton.classList.remove("is-loading");
    submitButton.disabled = false;
    form.hidden = true;
    successPanel.hidden = false;
    sessionStorage.removeItem(storedPackageKey);
    selectionDisplay.hidden = true;
    packageCards.forEach((card) => card.classList.remove("is-selected"));
    successPanel.focus();
  }, 700);
});

copyProposalButton?.addEventListener("click", copyProposalText);

sendTelegramButton?.addEventListener("click", async () => {
  const telegramWindow = window.open(contactLinks.telegram, "_blank", "noopener,noreferrer");
  const copied = await copyProposalText();
  if (proposalStatus && copied && telegramWindow) proposalStatus.textContent = copy.proposalTelegram;
});

document.querySelector("[data-new-inquiry]").addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  successPanel.hidden = true;
  selectionDisplay.hidden = true;
  packageCards.forEach((card) => card.classList.remove("is-selected"));
  if (fileName) fileName.textContent = copy.defaultFileName;
  if (proposalFields) proposalFields.replaceChildren();
  if (proposalStatus) proposalStatus.textContent = "";
  latestProposalText = "";
  formStatus.textContent = "";
  form.querySelector("input").focus();
});

revealElements(document.querySelectorAll(".reveal"));

window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) closeMenu();
});
setHeaderState();
