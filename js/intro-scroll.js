/* -------------------------------------------------------------------------
   Intro statement: pin, then light one sentence at a time.

   The block stays put while the page scrolls a fixed distance past it, and
   each sentence goes from --ink-faint to --ink in turn. Scroll position is
   read inside requestAnimationFrame, so a fast scroll costs one read per
   frame rather than one per event.

   It stays off unless it can behave: no reduced-motion preference, and a
   viewport tall enough to hold the statement with room to breathe. Off
   means the markup renders as ordinary text at full strength.
   ------------------------------------------------------------------------- */
(function () {
  var section = document.querySelector("[data-intro-scroll]");
  if (!section) return;

  var sticky = section.querySelector(".intro-sticky");
  var lines = Array.prototype.slice.call(section.querySelectorAll(".stmt-line"));
  if (!sticky || lines.length === 0) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Scroll distance per sentence, as a share of viewport height. Lower feels
  // hurried; higher makes the page feel stuck.
  var STEP = 0.55;
  // The last sentence lights at this point of the pin, leaving a beat at full
  // strength before the block releases.
  var FINISH = 0.88;

  var enabled = false;
  var lit = -1;
  var ticking = false;

  function fits() {
    // The statement has to fit the viewport, or pinning would hide its own
    // last lines. The allowance is small so phones, where the block nearly
    // fills the screen, still get the effect.
    return !reduced.matches && sticky.scrollHeight <= window.innerHeight - 24;
  }

  function lightUpTo(count) {
    if (count === lit) return;
    lit = count;
    for (var i = 0; i < lines.length; i++) {
      lines[i].classList.toggle("is-lit", i < count);
    }
  }

  function update() {
    ticking = false;
    if (!enabled) return;

    var rect = section.getBoundingClientRect();
    var travel = section.offsetHeight - window.innerHeight;
    if (travel <= 0) return lightUpTo(lines.length);

    var progress = Math.min(Math.max(-rect.top / travel, 0), 1);
    var reached = Math.floor((progress / FINISH) * lines.length) + 1;
    lightUpTo(Math.min(Math.max(reached, 0), lines.length));
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  function enable() {
    enabled = true;
    section.classList.add("is-reveal");
    section.style.height =
      window.innerHeight + lines.length * STEP * window.innerHeight + "px";
    update();
  }

  function disable() {
    enabled = false;
    section.classList.remove("is-reveal");
    section.style.height = "";
    lit = -1;
    lines.forEach(function (el) { el.classList.remove("is-lit"); });
  }

  function measure() {
    // Measure unpinned: the height set above would otherwise be measured.
    var was = enabled;
    if (was) {
      section.style.height = "";
      section.classList.remove("is-reveal");
    }
    var ok = fits();
    if (was) section.classList.add("is-reveal");
    if (ok) enable();
    else disable();
  }

  measure();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", measure);
  if (reduced.addEventListener) reduced.addEventListener("change", measure);
})();
