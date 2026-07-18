(() => {
  const STORAGE_KEY = "camappLeadTrackerLeads";
  const MONTHLY_REVENUE_GOAL = 2000;

  const statuses = [
    "New",
    "Contacted",
    "Interested",
    "Proposal Sent",
    "Waiting Payment",
    "Won",
    "Lost"
  ];

  const services = [
    "Logo Design",
    "Branding Package",
    "Website",
    "Landing Page",
    "Poster",
    "Social Media Design"
  ];

  const form = document.querySelector("#lead-form");
  const leadList = document.querySelector("[data-lead-list]");
  const listStatus = document.querySelector("[data-list-status]");
  const statusCounts = document.querySelector("[data-status-counts]");
  const searchInput = document.querySelector("[data-search]");
  const statusFilter = document.querySelector("[data-status-filter]");
  const serviceFilter = document.querySelector("[data-service-filter]");
  const formError = document.querySelector("[data-form-error]");
  const saveButton = document.querySelector("[data-save-button]");
  const resetButton = document.querySelector("[data-reset-form]");
  const exportButton = document.querySelector("[data-export-csv]");

  const fields = {
    id: document.querySelector("#lead-id"),
    clientName: document.querySelector("#client-name"),
    businessName: document.querySelector("#business-name"),
    contactMethod: document.querySelector("#contact-method"),
    contactDetail: document.querySelector("#contact-detail"),
    service: document.querySelector("#service"),
    leadSource: document.querySelector("#lead-source"),
    estimatedValue: document.querySelector("#estimated-value"),
    status: document.querySelector("#status"),
    lastContactDate: document.querySelector("#last-contact-date"),
    nextFollowUpDate: document.querySelector("#next-follow-up-date"),
    notes: document.querySelector("#notes")
  };

  let leads = loadLeads();

  function loadLeads() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  function saveLeads() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }

  function getToday() {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  function normalize(text) {
    return String(text || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function populateFilters() {
    statuses.forEach((status) => {
      statusFilter.append(new Option(status, status));
    });

    services.forEach((service) => {
      serviceFilter.append(new Option(service, service));
    });
  }

  function getFilteredLeads() {
    const query = normalize(searchInput.value);
    const selectedStatus = statusFilter.value;
    const selectedService = serviceFilter.value;

    return leads.filter((lead) => {
      const matchesQuery = !query || [
        lead.clientName,
        lead.businessName,
        lead.contactDetail,
        lead.contactMethod,
        lead.service,
        lead.leadSource,
        lead.status,
        lead.notes
      ].some((value) => normalize(value).includes(query));

      const matchesStatus = selectedStatus === "all" || lead.status === selectedStatus;
      const matchesService = selectedService === "all" || lead.service === selectedService;

      return matchesQuery && matchesStatus && matchesService;
    });
  }

  function isFollowUpDue(lead) {
    if (!lead.nextFollowUpDate || ["Won", "Lost"].includes(lead.status)) {
      return false;
    }

    return lead.nextFollowUpDate <= getToday();
  }

  function renderMetrics() {
    const totalEstimated = leads.reduce((sum, lead) => sum + (Number(lead.estimatedValue) || 0), 0);
    const totalWon = leads
      .filter((lead) => lead.status === "Won")
      .reduce((sum, lead) => sum + (Number(lead.estimatedValue) || 0), 0);
    const followupsDue = leads.filter(isFollowUpDue).length;
    const progress = Math.min(Math.round((totalWon / MONTHLY_REVENUE_GOAL) * 100), 100);

    document.querySelector("[data-total-estimated]").textContent = formatCurrency(totalEstimated);
    document.querySelector("[data-total-won]").textContent = formatCurrency(totalWon);
    document.querySelector("[data-followups-due]").textContent = String(followupsDue);
    document.querySelector("[data-goal-progress]").textContent = `${progress}%`;
    document.querySelector("[data-goal-meter]").style.width = `${progress}%`;
  }

  function renderStatusCounts() {
    const counts = statuses.map((status) => ({
      status,
      count: leads.filter((lead) => lead.status === status).length
    }));

    statusCounts.innerHTML = counts.map(({ status, count }) => `
      <article class="status-card">
        <span>${escapeHtml(status)}</span>
        <strong>${count}</strong>
      </article>
    `).join("");
  }

  function renderLeadList() {
    const filteredLeads = getFilteredLeads();
    const totalText = filteredLeads.length === 1 ? "1 lead shown" : `${filteredLeads.length} leads shown`;
    listStatus.textContent = totalText;

    if (!filteredLeads.length) {
      leadList.innerHTML = `
        <div class="empty-state">
          No leads match your current search or filters.
        </div>
      `;
      return;
    }

    leadList.innerHTML = filteredLeads.map((lead) => {
      const due = isFollowUpDue(lead);
      const business = lead.businessName ? escapeHtml(lead.businessName) : "No business name added";
      const nextFollowUp = lead.nextFollowUpDate || "Not scheduled";
      const lastContact = lead.lastContactDate || "Not added";
      const value = lead.estimatedValue ? formatCurrency(lead.estimatedValue) : "Not estimated";

      return `
        <article class="lead-card${due ? " is-due" : ""}">
          <div class="lead-card__body">
            <div class="lead-card__top">
              <div>
                <h3>${escapeHtml(lead.clientName)}</h3>
                <span class="lead-card__business">${business}</span>
              </div>
              <span class="lead-pill">${escapeHtml(lead.status)}</span>
            </div>

            <div class="lead-card__meta">
              <div class="lead-field">
                <strong>Service</strong>
                ${escapeHtml(lead.service)}
              </div>
              <div class="lead-field">
                <strong>Value</strong>
                ${escapeHtml(value)}
              </div>
              <div class="lead-field">
                <strong>Contact</strong>
                ${escapeHtml(lead.contactMethod)}: ${escapeHtml(lead.contactDetail)}
              </div>
              <div class="lead-field">
                <strong>Source</strong>
                ${escapeHtml(lead.leadSource || "Not added")}
              </div>
              <div class="lead-field">
                <strong>Last contact</strong>
                ${escapeHtml(lastContact)}
              </div>
              <div class="lead-field">
                <strong>Next follow-up</strong>
                ${escapeHtml(nextFollowUp)}${due ? " · Due now" : ""}
              </div>
            </div>

            ${lead.notes ? `<div class="lead-notes">${escapeHtml(lead.notes)}</div>` : ""}
          </div>
          <div class="lead-card__actions">
            <button class="secondary-action" type="button" data-edit-lead="${escapeHtml(lead.id)}">Edit</button>
            <button class="danger-action" type="button" data-delete-lead="${escapeHtml(lead.id)}">Delete</button>
          </div>
        </article>
      `;
    }).join("");
  }

  function render() {
    renderMetrics();
    renderStatusCounts();
    renderLeadList();
  }

  function getFormLead() {
    return {
      id: fields.id.value || `lead-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      clientName: fields.clientName.value.trim(),
      businessName: fields.businessName.value.trim(),
      contactMethod: fields.contactMethod.value,
      contactDetail: fields.contactDetail.value.trim(),
      service: fields.service.value,
      leadSource: fields.leadSource.value,
      estimatedValue: fields.estimatedValue.value ? Number(fields.estimatedValue.value) : "",
      status: fields.status.value,
      lastContactDate: fields.lastContactDate.value,
      nextFollowUpDate: fields.nextFollowUpDate.value,
      notes: fields.notes.value.trim(),
      updatedAt: new Date().toISOString()
    };
  }

  function validateLead(lead) {
    const required = [
      ["clientName", fields.clientName, "Client name is required."],
      ["contactMethod", fields.contactMethod, "Contact method is required."],
      ["contactDetail", fields.contactDetail, "Contact detail is required."],
      ["service", fields.service, "Service interested in is required."],
      ["status", fields.status, "Status is required."]
    ];

    const missing = required.find(([key]) => !lead[key]);
    if (missing) {
      const [, input, message] = missing;
      formError.textContent = message;
      input.focus();
      return false;
    }

    formError.textContent = "";
    return true;
  }

  function resetForm() {
    form.reset();
    fields.id.value = "";
    fields.status.value = "New";
    saveButton.textContent = "Save Lead";
    formError.textContent = "";
  }

  function handleSubmit(event) {
    event.preventDefault();
    const lead = getFormLead();

    if (!validateLead(lead)) {
      return;
    }

    const existingIndex = leads.findIndex((item) => item.id === lead.id);
    if (existingIndex >= 0) {
      leads[existingIndex] = {
        ...leads[existingIndex],
        ...lead
      };
    } else {
      leads.unshift({
        ...lead,
        createdAt: new Date().toISOString()
      });
    }

    saveLeads();
    resetForm();
    render();
    listStatus.textContent = "Lead saved successfully.";
  }

  function editLead(id) {
    const lead = leads.find((item) => item.id === id);
    if (!lead) {
      return;
    }

    fields.id.value = lead.id;
    fields.clientName.value = lead.clientName || "";
    fields.businessName.value = lead.businessName || "";
    fields.contactMethod.value = lead.contactMethod || "";
    fields.contactDetail.value = lead.contactDetail || "";
    fields.service.value = lead.service || "";
    fields.leadSource.value = lead.leadSource || "";
    fields.estimatedValue.value = lead.estimatedValue || "";
    fields.status.value = lead.status || "New";
    fields.lastContactDate.value = lead.lastContactDate || "";
    fields.nextFollowUpDate.value = lead.nextFollowUpDate || "";
    fields.notes.value = lead.notes || "";
    saveButton.textContent = "Update Lead";
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    fields.clientName.focus();
  }

  function deleteLead(id) {
    const lead = leads.find((item) => item.id === id);
    if (!lead) {
      return;
    }

    const confirmed = window.confirm(`Delete ${lead.clientName}'s lead?`);
    if (!confirmed) {
      return;
    }

    leads = leads.filter((item) => item.id !== id);
    saveLeads();
    render();
  }

  function createCsvValue(value) {
    const cleaned = String(value ?? "").replaceAll('"', '""');
    return `"${cleaned}"`;
  }

  function exportCsv() {
    const rows = [
      [
        "Client name",
        "Business name",
        "Contact method",
        "Contact detail",
        "Service interested in",
        "Lead source",
        "Estimated project value",
        "Status",
        "Last contact date",
        "Next follow-up date",
        "Notes"
      ],
      ...getFilteredLeads().map((lead) => [
        lead.clientName,
        lead.businessName,
        lead.contactMethod,
        lead.contactDetail,
        lead.service,
        lead.leadSource,
        lead.estimatedValue,
        lead.status,
        lead.lastContactDate,
        lead.nextFollowUpDate,
        lead.notes
      ])
    ];

    const csv = rows.map((row) => row.map(createCsvValue).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `camapp-leads-${getToday()}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function bindEvents() {
    form.addEventListener("submit", handleSubmit);
    resetButton.addEventListener("click", resetForm);
    exportButton.addEventListener("click", exportCsv);

    [searchInput, statusFilter, serviceFilter].forEach((control) => {
      control.addEventListener("input", renderLeadList);
      control.addEventListener("change", renderLeadList);
    });

    leadList.addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-edit-lead]");
      const deleteButton = event.target.closest("[data-delete-lead]");

      if (editButton) {
        editLead(editButton.dataset.editLead);
      }

      if (deleteButton) {
        deleteLead(deleteButton.dataset.deleteLead);
      }
    });
  }

  populateFilters();
  bindEvents();
  render();
})();
