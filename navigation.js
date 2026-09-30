/*
==========================================================
LOG HARDWARE - Mobile Navigation
==========================================================
Handles:
- Mobile menu open/close
- Overlay close
- Link close
- Escape key
- Body scroll lock
- Resize cleanup
- Touch-friendly interaction
==========================================================
*/

(function () {
  "use strict";

  function initMobileNavigation() {
    const menuToggle = document.getElementById("menuToggle");
    const mobileNav = document.getElementById("mobileNav");
    const closeButton = document.getElementById("closeMobileNav");
    const overlay = document.getElementById("mobileNavOverlay");

    if (!menuToggle || !mobileNav || !overlay) {
      return;
    }

    const navLinks = mobileNav.querySelectorAll("a");

    function setOpen(open) {
      mobileNav.classList.toggle("open", open);
      overlay.classList.toggle("open", open);

      mobileNav.setAttribute("aria-hidden", open ? "false" : "true");
      overlay.setAttribute("aria-hidden", open ? "false" : "true");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      menuToggle.setAttribute(
        "aria-label",
        open ? "Close navigation menu" : "Open navigation menu"
      );

      document.body.classList.toggle("mobile-menu-open", open);

      if (open) {
        // Keep focus inside a real, clickable control.
        if (closeButton) {
          window.setTimeout(() => closeButton.focus(), 50);
        }
      } else {
        window.setTimeout(() => menuToggle.focus(), 0);
      }
    }

    function openMenu(event) {
      if (event) event.preventDefault();
      setOpen(true);
    }

    function closeMenu(event) {
      if (event) event.preventDefault();
      setOpen(false);
    }

    menuToggle.addEventListener("click", openMenu);
    menuToggle.addEventListener("touchend", function (event) {
      // Click is the primary activation; avoid double firing.
      if (event.cancelable) event.preventDefault();
      openMenu(event);
    }, { passive: false });

    if (closeButton) {
      closeButton.addEventListener("click", closeMenu);
      closeButton.addEventListener("touchend", function (event) {
        if (event.cancelable) event.preventDefault();
        closeMenu(event);
      }, { passive: false });
    }

    overlay.addEventListener("click", closeMenu);
    overlay.addEventListener("touchend", function (event) {
      if (event.cancelable) event.preventDefault();
      closeMenu(event);
    }, { passive: false });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && mobileNav.classList.contains("open")) {
        setOpen(false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 769 && mobileNav.classList.contains("open")) {
        setOpen(false);
      }
    });

    // Ensure a clean initial state.
    setOpen(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileNavigation);
  } else {
    initMobileNavigation();
  }
})();
