(() => {
  "use strict";

  const header = document.querySelector("[data-site-header]");
  const toggle = document.querySelector(".nav-toggle");
  const toggleLabel = document.querySelector(".nav-toggle-label");
  const navigation = document.querySelector("#primary-navigation");
  const main = document.querySelector("main");
  const footer = document.querySelector("footer");
  const mobileQuery = window.matchMedia("(max-width: 60rem)");

  if (!header || !toggle || !toggleLabel || !navigation || !main || !footer) {
    return;
  }

  let isOpen = false;

  const setPageInert = (value) => {
    main.inert = value;
    footer.inert = value;
    main.toggleAttribute("aria-hidden", value);
    footer.toggleAttribute("aria-hidden", value);
  };

  const syncNavigationMode = () => {
    if (mobileQuery.matches) {
      toggle.hidden = false;
      navigation.toggleAttribute("inert", !isOpen);
      navigation.setAttribute("aria-hidden", String(!isOpen));
      return;
    }

    isOpen = false;
    toggle.hidden = true;
    document.documentElement.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggleLabel.textContent = "Menu";
    navigation.removeAttribute("aria-hidden");
    navigation.removeAttribute("inert");
    setPageInert(false);
  };

  const closeNavigation = ({ restoreFocus = false } = {}) => {
    if (!isOpen) {
      return;
    }

    isOpen = false;
    document.documentElement.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggleLabel.textContent = "Menu";
    navigation.setAttribute("aria-hidden", "true");
    navigation.setAttribute("inert", "");
    setPageInert(false);

    if (restoreFocus) {
      toggle.focus();
    }
  };

  const openNavigation = () => {
    isOpen = true;
    document.documentElement.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    toggleLabel.textContent = "Close";
    navigation.setAttribute("aria-hidden", "false");
    navigation.removeAttribute("inert");
    setPageInert(true);
    navigation.querySelector("a")?.focus();
  };

  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 80);
  };

  toggle.addEventListener("click", () => {
    if (isOpen) {
      closeNavigation({ restoreFocus: true });
    } else {
      openNavigation();
    }
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeNavigation();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) {
      closeNavigation({ restoreFocus: true });
    }

    if (event.key !== "Tab" || !isOpen) {
      return;
    }

    const focusable = [toggle, ...navigation.querySelectorAll("a")];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("scroll", updateHeader, { passive: true });
  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", syncNavigationMode);
  } else {
    mobileQuery.addListener(syncNavigationMode);
  }

  document.documentElement.classList.add("js");
  updateHeader();
  syncNavigationMode();
})();
