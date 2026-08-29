import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { JSDOM } from "jsdom";

const root = path.resolve(import.meta.dirname, "..");
const html = await readFile(path.join(root, "index.html"), "utf8");
const scripts = {
  forms: await readFile(path.join(root, "js/forms.js"), "utf8"),
  nav: await readFile(path.join(root, "js/nav.js"), "utf8")
};
const enabledFormScript = scripts.forms.replace(
  'const FORM_ENDPOINT = "";',
  'const FORM_ENDPOINT = "https://forms.example.test/submit";'
);

const createDom = ({ url = "https://local.test/", mobile = true, reduced = false } = {}) => {
  const dom = new JSDOM(html, { runScripts: "outside-only", url });
  const { window } = dom;
  const mediaQueries = new Map();

  window.matchMedia = (query) => {
    if (!mediaQueries.has(query)) {
      const listeners = new Set();
      const queryState = {
        matches: query.includes("max-width: 60rem") ? mobile : (query.includes("prefers-reduced-motion") && reduced),
        media: query,
        addEventListener(type, listener) {
          if (type === "change") listeners.add(listener);
        },
        removeEventListener(type, listener) {
          if (type === "change") listeners.delete(listener);
        },
        setMatches(value) {
          this.matches = value;
          listeners.forEach((listener) => listener({ matches: value, media: query }));
        }
      };
      mediaQueries.set(query, queryState);
    }
    return mediaQueries.get(query);
  };

  Object.defineProperty(window, "scrollY", { configurable: true, value: 0, writable: true });
  window.HTMLMediaElement.prototype.pause = () => {};
  window.HTMLMediaElement.prototype.load = () => {};
  window.HTMLMediaElement.prototype.play = () => Promise.resolve();

  return { dom, mediaQueries, window };
};

const fillRequiredFormFields = (window) => {
  window.document.querySelector("#enquiry-name").value = "Test Broker";
  window.document.querySelector("#enquiry-email").value = "broker@example.test";
  window.document.querySelector("#enquiry-type").value = "charter";
  window.document.querySelector("#enquiry-message").value = "Test message";
};

const submitForm = async (window) => {
  const form = window.document.querySelector("[data-enquiry-form]");
  form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  await new Promise((resolve) => window.setTimeout(resolve, 0));
};

{
  const noEnhancementDom = new JSDOM(html, { runScripts: "outside-only", url: "https://local.test/" });
  const noEnhancementDocument = noEnhancementDom.window.document;
  const noEnhancementMain = noEnhancementDocument.querySelector("main");
  assert.equal(noEnhancementDocument.querySelectorAll("main > section").length, 16, "all sections must exist without CSS or JavaScript");
  assert.equal(noEnhancementMain.hasAttribute("hidden"), false, "main content must not be hidden without enhancement");
  assert.equal(noEnhancementMain.hasAttribute("inert"), false, "main content must not be inert without enhancement");
  assert.match(noEnhancementMain.textContent, /Sea trials successfully completed/, "refit status must be readable without enhancement");
  assert.match(noEnhancementMain.textContent, /Departure requires a minimum of six hours’ notice/, "boiler notice must be readable without enhancement");
  assert.match(noEnhancementMain.textContent, /Begin a broker enquiry/, "enquiry path must be readable without enhancement");
  noEnhancementDom.window.close();
}

{
  const { dom, mediaQueries, window } = createDom();
  window.eval(scripts.nav);

  const rootElement = window.document.documentElement;
  const header = window.document.querySelector("[data-site-header]");
  const toggle = window.document.querySelector(".nav-toggle");
  const toggleLabel = window.document.querySelector(".nav-toggle-label");
  const navigation = window.document.querySelector("#primary-navigation");
  const main = window.document.querySelector("main");
  const footer = window.document.querySelector("footer");

  assert.ok(rootElement.classList.contains("js"), "navigation must enable the JS enhancement class");
  assert.equal(toggle.hidden, false, "mobile menu button must be exposed only after enhancement");
  assert.equal(navigation.getAttribute("aria-hidden"), "true", "mobile menu must initialize closed");
  assert.ok(navigation.hasAttribute("inert"), "closed mobile menu must be inert");

  toggle.click();
  assert.equal(toggle.getAttribute("aria-expanded"), "true", "menu button must report the open state");
  assert.equal(toggleLabel.textContent, "Close", "menu button label must describe its action");
  assert.ok(rootElement.classList.contains("nav-open"), "open menu must lock page scrolling");
  assert.equal(main.inert, true, "main content must be inert behind the menu");
  assert.equal(footer.inert, true, "footer must be inert behind the menu");
  assert.equal(main.getAttribute("aria-hidden"), "", "main content must be hidden from assistive technology behind the menu");

  window.document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert.equal(toggle.getAttribute("aria-expanded"), "false", "Escape must close the menu");
  assert.equal(window.document.activeElement, toggle, "Escape must restore focus to the menu button");
  assert.equal(main.inert, false, "closing the menu must restore main content");
  assert.equal(main.hasAttribute("aria-hidden"), false, "closing the menu must restore the accessibility tree");

  mediaQueries.get("(max-width: 60rem)").setMatches(false);
  assert.equal(toggle.hidden, true, "desktop layout must hide the mobile menu button");
  assert.equal(navigation.hasAttribute("aria-hidden"), false, "desktop navigation must be exposed");
  assert.equal(navigation.hasAttribute("inert"), false, "desktop navigation must not remain inert");

  window.scrollY = 81;
  window.dispatchEvent(new window.Event("scroll"));
  assert.ok(header.classList.contains("is-scrolled"), "header must gain its solid state after 80 pixels");

  window.eval(scripts.forms);
  const eventLink = window.document.querySelector("[data-enquiry-type='event']");
  const enquiryType = window.document.querySelector("#enquiry-type");
  const startedAt = window.document.querySelector("[name='form_started_at']");
  const submitButton = window.document.querySelector("[data-enquiry-form] button[type='submit']");

  eventLink.click();
  assert.equal(enquiryType.value, "event", "event path must preselect the event enquiry type");
  assert.ok(Number(startedAt.value) > 0, "form timing protection must initialize");
  assert.equal(submitButton.disabled, true, "form must remain disabled without an approved endpoint");


  dom.window.close();
}


{
  const { dom, window } = createDom();
  let requestCount = 0;
  window.fetch = async () => {
    requestCount += 1;
    return { ok: true };
  };
  window.eval(enabledFormScript);
  fillRequiredFormFields(window);
  window.document.querySelector("[name='form_started_at']").value = String(Date.now() - 3000);
  await submitForm(window);
  const status = window.document.querySelector("[data-form-status]");
  assert.equal(requestCount, 1, "valid enquiry must make one request");
  assert.equal(status.dataset.state, "success", "successful response must show a success state");
  assert.doesNotMatch(status.textContent, /Test Broker/, "success state must never echo user input");
  dom.window.close();
}

{
  const { dom, window } = createDom();
  window.fetch = async () => ({ ok: false });
  window.eval(enabledFormScript);
  fillRequiredFormFields(window);
  window.document.querySelector("[name='form_started_at']").value = String(Date.now() - 3000);
  await submitForm(window);
  assert.equal(window.document.querySelector("[data-form-status]").dataset.state, "error", "failed response must show an error state");
  dom.window.close();
}

{
  const { dom, window } = createDom();
  let requestCount = 0;
  window.fetch = async () => {
    requestCount += 1;
    return { ok: true };
  };
  window.eval(enabledFormScript);
  fillRequiredFormFields(window);
  window.document.querySelector("#enquiry-website").value = "automated";
  await submitForm(window);
  assert.equal(requestCount, 0, "honeypot submission must be silently discarded");
  assert.equal(window.document.querySelector("[data-form-status]").dataset.state, "success", "discarded bot must receive a static terminal state");
  dom.window.close();
}

console.log("Behaviour checks passed: navigation modes, focus, header, event routing and form states/guards.");
