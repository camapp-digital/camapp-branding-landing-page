// Update these two values when the verified CamApp Digital contact links are available.
const contactLinks = {
  telegram: "",
  messenger: "",
  facebook: "",
};

const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const navigation = document.querySelector("[data-navigation]");
const filterButtons = document.querySelectorAll("[data-filter]");
const projectCards = document.querySelectorAll("[data-category]");
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
const fileInput = document.querySelector("[data-file-input]");
const fileName = document.querySelector("[data-file-name]");
const useFieldset = document.querySelector("[data-use-error]")?.closest("fieldset");
const contactToast = document.querySelector("[data-contact-toast]");
const storedPackageKey = "camappSelectedLogoPackage";
const isKhmerPage = document.documentElement.lang === "km";
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
  sending: isKhmerPage ? "កំពុងផ្ញើ brief ឡូហ្គោរបស់អ្នក..." : "Sending your logo brief…",
};

document.querySelector("[data-year]").textContent = new Date().getFullYear();

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

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.filter;

    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    projectCards.forEach((card) => {
      const categories = card.dataset.category.split(" ");
      card.hidden = category !== "all" && !categories.includes(category);
    });
  });
});

const packagePrices = {
  "Basic Package": "$49",
  "Standard Package": "$79",
  "Premium Package": "$229",
};
const packageLabels = {
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

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) {
    fileName.textContent = copy.defaultFileName;
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    fileInput.value = "";
    fileName.textContent = copy.largeFile;
    fileInput.closest("label").classList.add("is-invalid");
    return;
  }

  fileInput.closest("label").classList.remove("is-invalid");
  fileName.textContent = file.name;
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

document.querySelector("[data-new-inquiry]").addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  successPanel.hidden = true;
  selectionDisplay.hidden = true;
  packageCards.forEach((card) => card.classList.remove("is-selected"));
  fileName.textContent = copy.defaultFileName;
  formStatus.textContent = "";
  form.querySelector("input").focus();
});

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) closeMenu();
});
setHeaderState();
