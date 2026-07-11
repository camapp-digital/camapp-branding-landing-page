const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");
const faqItems = document.querySelectorAll(".faq-item");
const revealItems = document.querySelectorAll(".reveal");
const inquiryForms = document.querySelectorAll("[data-inquiry-form]");

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  }
});

faqItems.forEach((item) => {
  const button = item.querySelector("button");
  const answer = item.querySelector(".faq-answer");

  button.addEventListener("click", () => {
    const isOpen = item.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
    answer.style.maxHeight = isOpen ? `${answer.scrollHeight}px` : "0";
  });
});

const inquiryFieldLabels = {
  en: [
    ["clientName", "Client name"],
    ["businessName", "Business name"],
    ["contactHandle", "Phone or Telegram"],
    ["email", "Email"],
    ["serviceNeeded", "Service needed"],
    ["industry", "Business industry"],
    ["targetCustomers", "Target customers"],
    ["preferredColors", "Preferred colors"],
    ["stylePreference", "Style preference"],
    ["budgetRange", "Budget range"],
    ["deadline", "Deadline"],
    ["notes", "Additional notes"],
  ],
  km: [
    ["clientName", "ឈ្មោះអតិថិជន"],
    ["businessName", "ឈ្មោះអាជីវកម្ម"],
    ["contactHandle", "លេខទូរស័ព្ទ ឬ Telegram"],
    ["email", "អ៊ីមែល"],
    ["serviceNeeded", "សេវាដែលត្រូវការ"],
    ["industry", "ប្រភេទអាជីវកម្ម"],
    ["targetCustomers", "អតិថិជនគោលដៅ"],
    ["preferredColors", "ពណ៌ដែលចូលចិត្ត"],
    ["stylePreference", "រចនាប័ទ្មដែលចូលចិត្ត"],
    ["budgetRange", "ជួរថវិកា"],
    ["deadline", "ថ្ងៃផុតកំណត់"],
    ["notes", "កំណត់ចំណាំបន្ថែម"],
  ],
};

const emptyValueText = document.documentElement.lang === "km" ? "មិនបានបញ្ជាក់" : "Not provided";
const activeInquiryLabels =
  document.documentElement.lang === "km" ? inquiryFieldLabels.km : inquiryFieldLabels.en;

inquiryForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const panel = form.closest(".inquiry-panel");
    const summary = panel.querySelector("[data-inquiry-summary]");
    const summaryList = panel.querySelector("[data-summary-list]");
    const formData = new FormData(form);

    summaryList.replaceChildren();

    activeInquiryLabels.forEach(([name, label]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      const value = String(formData.get(name) || "").trim();

      term.textContent = label;
      description.textContent = value || emptyValueText;
      row.append(term, description);
      summaryList.append(row);
    });

    summary.hidden = false;
    summary.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();
