const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");
const revealItems = document.querySelectorAll(".reveal");
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const submitButton = document.querySelector("[data-submit-button]");
const telegramFallback = document.querySelector("[data-telegram-fallback]");
const telegramLink = document.querySelector("[data-telegram-link]");
const copyRequestButton = document.querySelector("[data-copy-request]");
const telegramUsername = "CamAppDigital";
let latestTelegramMessage = "";

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

const closeMenu = () => {
  nav.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
};

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) closeMenu();
});

const getFormField = (name) => contactForm?.elements[name];

const getTrimmedValue = (name) => {
  const field = getFormField(name);
  return field ? field.value.trim() : "";
};

const setFieldError = (name, message = "") => {
  const field = getFormField(name);
  const error = contactForm?.querySelector(`[data-error-for="${name}"]`);
  field?.classList.toggle("is-invalid", Boolean(message));
  field?.setAttribute("aria-invalid", message ? "true" : "false");
  if (error) {
    error.textContent = message;
    if (message) {
      error.id = `${name}-error`;
      field?.setAttribute("aria-describedby", error.id);
    } else {
      field?.removeAttribute("aria-describedby");
    }
  }
};

const validateContactForm = () => {
  const requiredFields = [
    ["name", "Please enter your name."],
    ["business", "Please enter your business name."],
    ["contact", "Please enter your phone number or Telegram contact."],
    ["service", "Please choose a service."],
    ["notes", "Please enter your project notes."],
  ];
  let firstInvalidField = null;

  requiredFields.forEach(([name, message]) => {
    const field = getFormField(name);
    const isInvalid = !getTrimmedValue(name);
    setFieldError(name, isInvalid ? message : "");
    if (isInvalid && !firstInvalidField) firstInvalidField = field;
  });

  if (firstInvalidField) {
    firstInvalidField.focus();
    firstInvalidField.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  }

  return true;
};

const buildTelegramMessage = () => {
  const values = {
    name: getTrimmedValue("name"),
    business: getTrimmedValue("business"),
    contact: getTrimmedValue("contact"),
    service: getTrimmedValue("service"),
    notes: getTrimmedValue("notes"),
  };

  return [
    "New Project Request — CamApp Digital",
    "",
    `Name: ${values.name}`,
    `Business: ${values.business}`,
    `Phone or Telegram: ${values.contact}`,
    `Service Needed: ${values.service}`,
    "",
    "Project Notes:",
    values.notes,
    "",
    "Submitted from the CamApp Digital website.",
  ].join("\n");
};

const buildTelegramUrl = (message) =>
  `https://t.me/${telegramUsername}?text=${encodeURIComponent(message)}`;

const copyText = async (text) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (error) {
    // Fall through to the textarea fallback.
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
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

contactForm?.addEventListener("input", (event) => {
  const field = event.target;
  if (field.name) setFieldError(field.name, "");
  if (formStatus) formStatus.textContent = "";
});

contactForm?.addEventListener("change", (event) => {
  const field = event.target;
  if (field.name) setFieldError(field.name, "");
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (formStatus) formStatus.textContent = "";
  if (telegramFallback) telegramFallback.hidden = true;

  if (!validateContactForm()) return;

  latestTelegramMessage = buildTelegramMessage();
  const telegramUrl = buildTelegramUrl(latestTelegramMessage);
  if (telegramLink) telegramLink.href = telegramUrl;

  submitButton.disabled = true;
  submitButton.textContent = "Preparing Telegram…";
  const telegramWindow = window.open(telegramUrl, "_blank");
  if (telegramWindow) telegramWindow.opener = null;
  submitButton.textContent = "Submit Request";
  submitButton.disabled = false;

  if (telegramWindow) {
    if (formStatus) {
      formStatus.textContent = "Telegram opened with your project request. Please review the message and press Send.";
    }
    return;
  }

  if (formStatus) {
    formStatus.textContent =
      "We could not open Telegram automatically. Please use the Telegram button to contact CamApp Digital.";
  }
  if (telegramFallback) telegramFallback.hidden = false;
});

copyRequestButton?.addEventListener("click", async () => {
  if (!latestTelegramMessage) latestTelegramMessage = buildTelegramMessage();
  const copied = await copyText(latestTelegramMessage);
  if (formStatus) {
    formStatus.textContent = copied
      ? "Request copied. Paste it in Telegram to send it to CamApp Digital."
      : "Could not copy automatically. Please select and copy your request manually.";
  }
});

const revealElements = (items) => {
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((item) => revealObserver.observe(item));
};

window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) closeMenu();
});

updateHeader();
revealElements(revealItems);
