const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");
const revealItems = document.querySelectorAll(".reveal");
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");

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

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const service = data.get("service") || "your design request";
  formStatus.textContent = `Thank you. CamApp Digital received your ${service} request and will contact you shortly.`;
  contactForm.reset();
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
