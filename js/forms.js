(() => {
  "use strict";

  const FORM_ENDPOINT = "";
  const MINIMUM_COMPLETION_TIME_MS = 2000;
  const REQUEST_TIMEOUT_MS = 12000;
  const form = document.querySelector("[data-enquiry-form]");
  const status = document.querySelector("[data-form-status]");
  const submitButton = form?.querySelector("button[type='submit']");
  const honeypot = form?.elements.namedItem("website");
  const startedAt = form?.elements.namedItem("form_started_at");
  const enquiryType = form?.elements.namedItem("enquiry_type");
  const eventLinks = document.querySelectorAll("[data-enquiry-type]");

  if (!form || !status || !submitButton || !honeypot || !startedAt || !enquiryType) {
    return;
  }

  const resetStartTime = () => {
    startedAt.value = String(Date.now());
  };

  const setStatus = (message, state = "idle") => {
    status.textContent = message;
    status.dataset.state = state;
  };

  eventLinks.forEach((link) => {
    link.addEventListener("click", () => {
      enquiryType.value = link.dataset.enquiryType || "";
    });
  });

  resetStartTime();

  if (!FORM_ENDPOINT) {
    return;
  }

  form.action = FORM_ENDPOINT;
  form.method = "post";
  submitButton.disabled = false;
  submitButton.textContent = "Send enquiry";
  setStatus("Required fields are marked by their labels.");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      setStatus("Check the required fields and try again.", "error");
      return;
    }

    const completionTime = Date.now() - Number(startedAt.value);
    const looksAutomated = Boolean(honeypot.value) || completionTime < MINIMUM_COMPLETION_TIME_MS;

    if (looksAutomated) {
      form.reset();
      resetStartTime();
      setStatus("Your enquiry has been received.", "success");
      return;
    }

    const controller = new AbortController();
    const requestTimer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    submitButton.disabled = true;
    setStatus("Sending enquiry…", "pending");

    try {
      const response = await window.fetch(FORM_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error("Form endpoint returned a non-success response.");
      }

      form.reset();
      resetStartTime();
      setStatus("Your enquiry has been received.", "success");
    } catch {
      setStatus("Submission failed. Check your connection and try again.", "error");
    } finally {
      window.clearTimeout(requestTimer);
      submitButton.disabled = false;
    }
  });
})();
