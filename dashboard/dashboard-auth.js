(() => {
  const AUTH_SESSION_KEY = "camappDashboardUnlocked";
  const AUTH_PASSCODE_KEY = "camappDashboardPasscodeHash";

  const authForm = document.querySelector("[data-auth-form]");
  const authInput = document.querySelector("[data-auth-passcode]");
  const authError = document.querySelector("[data-auth-error]");
  const authSubmit = document.querySelector("[data-auth-submit]");
  const logoutButtons = document.querySelectorAll("[data-auth-logout]");

  function unlockDashboard() {
    sessionStorage.setItem(AUTH_SESSION_KEY, "true");
    document.body.classList.remove("auth-pending", "auth-locked");
    document.body.classList.add("auth-unlocked");
  }

  function lockDashboard() {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    document.body.classList.remove("auth-pending", "auth-unlocked");
    document.body.classList.add("auth-locked");
    authInput?.focus();
  }

  async function sha256(value) {
    if (!window.crypto?.subtle) {
      throw new Error("Secure hashing is not available in this browser.");
    }

    const bytes = new TextEncoder().encode(value);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function updateAuthModeText() {
    const storedHash = localStorage.getItem(AUTH_PASSCODE_KEY);
    if (authSubmit && !storedHash) {
      authSubmit.textContent = "Create Passcode";
    }
  }

  async function handlePasscode(passcode) {
    const trimmedPasscode = passcode.trim();
    const storedHash = localStorage.getItem(AUTH_PASSCODE_KEY);

    if (trimmedPasscode.length < 8) {
      authError.textContent = "Use at least 8 characters for the dashboard passcode.";
      authInput.select();
      return;
    }

    const passcodeHash = await sha256(trimmedPasscode);

    if (!storedHash) {
      localStorage.setItem(AUTH_PASSCODE_KEY, passcodeHash);
      authInput.value = "";
      unlockDashboard();
      return;
    }

    if (passcodeHash !== storedHash) {
      authError.textContent = "Incorrect passcode. Please try again.";
      authInput.select();
      return;
    }

    authInput.value = "";
    unlockDashboard();
  }

  if (sessionStorage.getItem(AUTH_SESSION_KEY) === "true") {
    unlockDashboard();
  } else {
    lockDashboard();
  }
  updateAuthModeText();

  authForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    authError.textContent = "";

    try {
      await handlePasscode(authInput.value);
    } catch (error) {
      authError.textContent = error.message || "Could not unlock the dashboard in this browser.";
    }
  });

  logoutButtons.forEach((button) => {
    button.addEventListener("click", lockDashboard);
  });
})();
