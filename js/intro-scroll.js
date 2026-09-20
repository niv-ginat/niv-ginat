/* -------------------------------------------------------------------------
   Intro statement: pin, then light one sentence at a time.

   The block stays put while the page scrolls a fixed distance past it, and
   each sentence goes from --ink-faint to --ink in turn. Scroll position is
   read inside requestAnimationFrame, so a fast scroll costs one read per
   frame rather than one per event.

   Where it fits, the header is held for the same stretch: the statement pins
   directly under it from the first pixel of scroll, so the opening screen —
   header and statement together — is what stays put, and the two release
   and scroll away together. The header is outside the statement's section,
   so CSS sticky can't bound it to the pin; it is moved with a transform
   instead, by exactly the distance scrolled, until the pin ends.

   Where the statement is too tall to sit under the header (small phones), it
   falls back to pinning at the top of the viewport on its own. It stays off
   entirely unless it can behave: no reduced-motion preference, and a
   viewport tall enough to hold the statement. Off means the markup renders
   as ordinary text at full strength.
   ------------------------------------------------------------------------- */
(function () {
  var section = document.querySelector("[data-intro-scroll]");
  if (!section) return;

  var sticky = section.querySelector(".intro-sticky");
  var lines = Array.prototype.slice.call(section.querySelectorAll(".stmt-line"));
  if (!sticky || lines.length === 0) return;

  var nav = document.getElementById("navigation");
  var media = section.querySelector(".intro-media img");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Scroll distance per sentence, as a share of viewport height. Lower feels
  // hurried; higher makes the page feel stuck.
  var STEP = 0.55;
  // The last sentence lights at this point of the pin, leaving a beat at full
  // strength before the block releases.
  var FINISH = 0.88;
  // Breathing room the statement needs inside whatever space it pins into.
  var SLACK = 24;
  // How far the artwork drifts over the whole pin, as a share of viewport
  // height. It travels against the scroll, so the frame is still but the
  // image is not — parallax without a moving background.
  var DRIFT = 0.16;

  var enabled = false;
  var holdNav = false;
  var pinStart = 0; // scrollY at which the pin engages
  var travel = 0;   // scroll distance the pin lasts
  var lit = -1;
  var ticking = false;

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

    var scrolled = Math.min(Math.max(window.scrollY - pinStart, 0), travel);

    // Hold the header in place for the length of the pin, then let it go.
    if (holdNav) nav.style.transform = "translate3d(0," + scrolled + "px,0)";

    var progress = travel > 0 ? scrolled / travel : 1;

    // Artwork drifts upward across the pin, from half its range below centre
    // to half above.
    if (media) {
      var range = DRIFT * window.innerHeight;
      media.style.transform =
        "translate3d(0," + ((0.5 - progress) * range).toFixed(1) + "px,0)";
    }

    var reached = Math.floor((progress / FINISH) * lines.length) + 1;
    lightUpTo(Math.min(Math.max(reached, 0), lines.length));
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  function reset() {
    enabled = false;
    holdNav = false;
    section.classList.remove("is-reveal");
    section.style.height = "";
    sticky.style.top = "";
    sticky.style.minHeight = "";
    if (nav) nav.style.transform = "";
    if (media) media.style.transform = "";
  }

  function disable() {
    reset();
    lit = -1;
    lines.forEach(function (el) { el.classList.remove("is-lit"); });
  }

  function measure() {
    // Measure unpinned and unshifted, or the values set below would be
    // measured instead of the natural layout.
    reset();
    if (reduced.matches) return disable();

    var vh = window.innerHeight;
    var blockH = sticky.scrollHeight;
    // The statement's own position in the document with nothing pinned —
    // i.e. just under the header.
    var stickyTop = sticky.getBoundingClientRect().top + window.scrollY;

    var top;
    if (nav && blockH <= vh - stickyTop - SLACK) {
      top = stickyTop; // pin under the header, from scroll 0
      holdNav = true;
    } else if (blockH <= vh - SLACK) {
      top = 0;         // pin alone at the top of the viewport
    } else {
      return disable();
    }

    var cs = window.getComputedStyle(section);
    var pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    var frame = vh - top;

    travel = lines.length * STEP * vh;
    pinStart = stickyTop - top;

    enabled = true;
    section.classList.add("is-reveal");
    sticky.style.top = top + "px";
    sticky.style.minHeight = frame + "px";
    // Border-box: the section holds its padding, one pinned frame, and the
    // scroll distance the pin lasts.
    section.style.height = pad + frame + travel + "px";
    update();
  }

  measure();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", measure);
  if (reduced.addEventListener) reduced.addEventListener("change", measure);
  // Opening the mobile menu changes the header's height, and with it where
  // the statement sits.
  document.addEventListener("shown.bs.collapse", measure);
  document.addEventListener("hidden.bs.collapse", measure);
})();
