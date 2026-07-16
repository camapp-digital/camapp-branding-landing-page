const galleryData = window.camappGalleryData || { categories: [], projects: [] };
const contactLinks = {
  telegram: "https://telegram.me/CamAppDigital",
  messenger: "https://m.me/CamAppDigital",
  facebook: "https://m.me/CamAppDigital",
};

const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const navigation = document.querySelector("[data-navigation]");
const featuredGrid = document.querySelector("[data-featured-grid]");
const filterBar = document.querySelector("[data-gallery-filters]");
const galleryGrid = document.querySelector("[data-gallery-grid]");
const pagination = document.querySelector("[data-gallery-pagination]");
const galleryStatus = document.querySelector("[data-gallery-status]");
const modal = document.querySelector("[data-project-modal]");
const modalPanel = modal?.querySelector(".project-modal-panel");
const modalMedia = document.querySelector("[data-modal-media]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalService = document.querySelector("[data-modal-service]");
const modalClient = document.querySelector("[data-modal-client]");
const modalDescription = document.querySelector("[data-modal-description]");
const modalGoal = document.querySelector("[data-modal-goal]");
const modalCreated = document.querySelector("[data-modal-created]");
const modalDeliverables = document.querySelector("[data-modal-deliverables]");
const modalCta = document.querySelector("[data-modal-cta]");
const contactToast = document.querySelector("[data-contact-toast]");
const assetBase = "../assets";
const state = {
  category: "all",
  page: 1,
  pageSize: 9,
};
let lastFocusedElement = null;
let revealObserver = null;

const sortedProjects = () => galleryData.projects.slice().sort((a, b) => a.displayOrder - b.displayOrder);
const projectById = (id) => galleryData.projects.find((project) => project.id === id);

const getPageSize = () => {
  if (window.matchMedia("(max-width: 640px)").matches) return 4;
  if (window.matchMedia("(max-width: 1024px)").matches) return 6;
  return 9;
};

const createImage = (image, altText, className = "") => {
  const img = document.createElement("img");
  img.src = `${assetBase}/${image.src}`;
  img.alt = altText;
  img.width = image.width;
  img.height = image.height;
  img.loading = "lazy";
  img.decoding = "async";
  img.dataset.fit = image.fit || "contain";
  if (className) img.className = className;
  return img;
};

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

  elements.forEach((item) => revealObserver.observe(item));
};

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 8);
};

const closeMenu = () => {
  navigation?.classList.remove("is-open");
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "Open navigation");
  document.body.classList.remove("menu-open");
};

menuButton?.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  document.body.classList.toggle("menu-open", isOpen);
});

navigation?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

const showContactFallback = () => {
  if (!contactToast) return;
  contactToast.hidden = false;
  window.clearTimeout(showContactFallback.timeoutId);
  showContactFallback.timeoutId = window.setTimeout(() => {
    contactToast.hidden = true;
  }, 5000);
};

document.querySelectorAll("[data-open-contact]").forEach((button) => {
  button.addEventListener("click", () => {
    const link = contactLinks[button.dataset.openContact];
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
      return;
    }
    showContactFallback();
  });
});

const renderFeatured = () => {
  if (!featuredGrid) return;
  const featured = sortedProjects().filter((project) => project.featured).slice(0, 4);
  featuredGrid.replaceChildren(
    ...featured.map((project) => {
      const card = document.createElement("article");
      card.className = "featured-project-card reveal";

      const media = document.createElement("div");
      media.className = "featured-project-media";
      media.append(createImage(project.coverImage, project.altText));

      const content = document.createElement("div");
      content.className = "featured-project-content";
      content.innerHTML = `
        <p class="project-category">${project.serviceCategory}</p>
        <h3>${project.title}</h3>
        <p>${project.shortDescription}</p>
      `;
      const button = document.createElement("button");
      button.className = "button button-outline";
      button.type = "button";
      button.dataset.projectId = project.id;
      button.textContent = "View Project";
      content.append(button);

      card.append(media, content);
      return card;
    })
  );
  revealElements(featuredGrid.querySelectorAll(".reveal"));
};

const renderFilters = () => {
  if (!filterBar) return;
  const used = new Set(galleryData.projects.map((project) => project.categoryId));
  const categories = galleryData.categories.filter((category) => used.has(category.id));
  filterBar.replaceChildren();

  [{ id: "all", label: "All Projects" }, ...categories].forEach((category) => {
    const button = document.createElement("button");
    button.className = `filter-button${category.id === state.category ? " is-active" : ""}`;
    button.type = "button";
    button.dataset.category = category.id;
    button.setAttribute("aria-pressed", String(category.id === state.category));
    button.textContent = category.label;
    filterBar.append(button);
  });
};

const getFilteredProjects = () => {
  const projects = sortedProjects();
  if (state.category === "all") return projects;
  return projects.filter((project) => project.categoryId === state.category);
};

const pageRange = (currentPage, totalPages) => {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  const ordered = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  return ordered.reduce((items, page, index) => {
    if (index > 0 && page - ordered[index - 1] > 1) items.push("ellipsis");
    items.push(page);
    return items;
  }, []);
};

const renderPagination = (totalPages) => {
  if (!pagination) return;
  pagination.replaceChildren();
  pagination.hidden = totalPages <= 1;
  if (totalPages <= 1) return;

  const addButton = ({ label, page, disabled = false, active = false, ariaLabel }) => {
    const button = document.createElement("button");
    button.className = `portfolio-page-button${active ? " is-active" : ""}`;
    button.type = "button";
    button.dataset.page = String(page);
    button.textContent = label;
    button.disabled = disabled;
    button.setAttribute("aria-label", ariaLabel);
    if (active) button.setAttribute("aria-current", "page");
    pagination.append(button);
  };

  addButton({
    label: "←",
    page: Math.max(1, state.page - 1),
    disabled: state.page === 1,
    ariaLabel: "Go to previous portfolio page",
  });

  pageRange(state.page, totalPages).forEach((item) => {
    if (item === "ellipsis") {
      const ellipsis = document.createElement("span");
      ellipsis.className = "portfolio-page-ellipsis";
      ellipsis.textContent = "…";
      ellipsis.setAttribute("aria-hidden", "true");
      pagination.append(ellipsis);
      return;
    }

    addButton({
      label: String(item),
      page: item,
      active: item === state.page,
      ariaLabel: `Go to portfolio page ${item}`,
    });
  });

  addButton({
    label: "→",
    page: Math.min(totalPages, state.page + 1),
    disabled: state.page === totalPages,
    ariaLabel: "Go to next portfolio page",
  });
};

const renderGallery = ({ shouldScroll = false } = {}) => {
  if (!galleryGrid) return;
  state.pageSize = getPageSize();
  const filtered = getFilteredProjects();
  const totalPages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
  state.page = Math.min(Math.max(state.page, 1), totalPages);

  const start = (state.page - 1) * state.pageSize;
  const visible = filtered.slice(start, start + state.pageSize);
  galleryGrid.replaceChildren();

  if (!visible.length) {
    const empty = document.createElement("p");
    empty.className = "portfolio-empty-state";
    empty.textContent = "No portfolio projects are available in this category yet.";
    galleryGrid.append(empty);
  } else {
    visible.forEach((project) => {
      const card = document.createElement("article");
      card.className = "portfolio-sample-card reveal";

      const media = document.createElement("div");
      media.className = "portfolio-card-media";
      media.append(createImage(project.coverImage, project.altText));

      const content = document.createElement("div");
      content.className = "portfolio-card-content";
      content.innerHTML = `
        <p class="project-category">${project.serviceCategory}</p>
        <h3>${project.title}</h3>
        <p>${project.shortDescription}</p>
      `;

      const button = document.createElement("button");
      button.type = "button";
      button.dataset.projectId = project.id;
      button.innerHTML = 'View Project <span aria-hidden="true">→</span>';
      content.append(button);

      card.append(media, content);
      galleryGrid.append(card);
    });
  }

  renderPagination(totalPages);
  if (galleryStatus) {
    galleryStatus.textContent = `Portfolio updated: ${visible.length} of ${filtered.length} projects, page ${state.page} of ${totalPages}.`;
  }
  revealElements(galleryGrid.querySelectorAll(".reveal"));
  if (shouldScroll) document.querySelector("#gallery-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

filterBar?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  state.page = 1;
  filterBar.querySelectorAll("[data-category]").forEach((item) => {
    const isActive = item === button;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });
  renderGallery({ shouldScroll: true });
});

pagination?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-page]");
  if (!button || button.disabled) return;
  const page = Number.parseInt(button.dataset.page, 10);
  if (!Number.isFinite(page)) return;
  state.page = page;
  renderGallery({ shouldScroll: true });
});

const fillList = (list, items) => {
  list.replaceChildren();
  items.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    list.append(li);
  });
};

const openProjectModal = (project) => {
  if (!modal || !modalPanel) return;
  lastFocusedElement = document.activeElement;
  modalMedia.replaceChildren(
    ...project.galleryImages.map((image) => {
      const img = createImage({ ...image, fit: "contain" }, image.alt);
      img.loading = "eager";
      return img;
    })
  );
  modalService.textContent = `${project.serviceCategory} · ${project.businessCategory}`;
  modalTitle.textContent = project.title;
  modalClient.textContent = `Client / Brand: ${project.client}`;
  modalDescription.textContent = project.fullDescription;
  modalGoal.textContent = project.designGoal;
  fillList(modalCreated, project.created);
  fillList(modalDeliverables, project.deliverables);
  modal.hidden = false;
  document.body.classList.add("modal-open");
  modalPanel.focus();
};

const closeProjectModal = () => {
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  lastFocusedElement?.focus();
};

document.addEventListener("click", (event) => {
  const projectButton = event.target.closest("[data-project-id]");
  if (projectButton) {
    const project = projectById(projectButton.dataset.projectId);
    if (project) openProjectModal(project);
    return;
  }

  if (event.target.closest("[data-close-modal]")) {
    closeProjectModal();
  }
});

modalCta?.addEventListener("click", closeProjectModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeProjectModal();
});

window.addEventListener("resize", () => {
  const nextSize = getPageSize();
  if (nextSize === state.pageSize) return;
  state.pageSize = nextSize;
  renderGallery();
});

window.addEventListener("scroll", setHeaderState, { passive: true });

document.querySelector("[data-year]").textContent = new Date().getFullYear();
renderFeatured();
renderFilters();
renderGallery();
revealElements(document.querySelectorAll(".reveal"));
setHeaderState();
