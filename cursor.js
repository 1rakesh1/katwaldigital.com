/* ─────────────────────────────────────────────
   cursor.js  —  Custom ring + dot cursor
   Usage: <script src="cursor.js" defer></script>

   The script auto-injects the two cursor DOM nodes
   so you don't need to add any HTML by hand.

   To mark extra elements as hoverable, add the
   data-cursor-hover attribute to them:
     <div data-cursor-hover>...</div>
   ───────────────────────────────────────────── */

(function () {
  "use strict";

  /* ── 1. Inject cursor elements ── */
  function injectCursorElements() {
    if (document.getElementById("cursor-ring")) return; // already present

    const ring = document.createElement("div");
    ring.id = "cursor-ring";

    const dot = document.createElement("div");
    dot.id = "cursor-dot";

    document.body.prepend(dot);
    document.body.prepend(ring);
  }

  /* ── 2. Core tracking logic ── */
  function initCursor() {
    const ring = document.getElementById("cursor-ring");
    const dot  = document.getElementById("cursor-dot");

    if (!ring || !dot) return;

    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;

    /* Dot follows the pointer instantly */
    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + "px";
      dot.style.top  = mouseY + "px";
    });

    /* Ring trails the pointer with a lerp for a smooth lag effect */
    const LERP = 0.1; // 0 = no movement, 1 = instant — tweak to taste

    function animateRing() {
      ringX += (mouseX - ringX) * LERP;
      ringY += (mouseY - ringY) * LERP;
      ring.style.left = ringX + "px";
      ring.style.top  = ringY + "px";
      requestAnimationFrame(animateRing);
    }
    animateRing();

    /* Hide cursor when it leaves the window */
    document.addEventListener("mouseleave", () => {
      ring.style.opacity = "0";
      dot.style.opacity  = "0";
    });
    document.addEventListener("mouseenter", () => {
      ring.style.opacity = "1";
      dot.style.opacity  = "1";
    });
  }

  /* ── 3. Hover detection ── */
  function initHover() {
    /* Built-in selectors that should trigger the enlarged cursor */
    const HOVER_SELECTORS = [
      "a",
      "button",
      "input",
      "textarea",
      "select",
      "label",
      ".card",
      "[data-cursor-hover]",   // opt-in attribute for any element
    ].join(", ");

    function addListeners(el) {
      el.addEventListener("mouseenter", () =>
        document.body.classList.add("cursor-hovering")
      );
      el.addEventListener("mouseleave", () =>
        document.body.classList.remove("cursor-hovering")
      );
    }

    /* Attach to all matching elements present at load time */
    document.querySelectorAll(HOVER_SELECTORS).forEach(addListeners);

    /* Watch for elements added dynamically */
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return; // elements only
          if (node.matches(HOVER_SELECTORS)) addListeners(node);
          node.querySelectorAll?.(HOVER_SELECTORS).forEach(addListeners);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function isTouchDevice() {
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}
  /* ── Bootstrap ── */
  function init() {
    if (isTouchDevice()) return; // skip on touch devices
    injectCursorElements();
    initCursor();
    initHover();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init(); // already parsed
  }
})();
