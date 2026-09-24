/* -------------------------------------------------------------------------
   Intro statement: pin, then light one sentence at a time.

   The block stays put while the page scrolls a fixed distance past it, and
   each sentence goes from --ink-faint to --ink in turn. Scroll position is
   read inside requestAnimationFrame, so a fast scroll costs one read per
   frame rather than one per event.

   Where it fits, the header is held for the same stretch: the statement pins
   directly under it from the first pixel of scroll, so the opening screen —
   header and statement together — is what stays put, and the two release
   and scroll away together. The header is held by CSS sticky, not by a
   transform driven from the scroll handler: the page scrolls on the
   compositor, so a per-frame transform posted from the main thread always
   lands a frame late and the header visibly chases the scroll. Small crisp
   text shows that lag far more than a photograph does. Sticky cannot be
   bounded to the pin here — the header sits outside the statement's section
   — so the release is done by swapping sticky for one fixed offset, once,
   at the end of the pin. Nothing is written per frame either side of it.

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
  // How much of the artwork shows at the foot of the screen when the pin
  // starts. It rises from there and clears the top as the last line lights,
  // so the frame is still but the image is not.
  var PEEK = 0.22;

  var enabled = false;
  var holdNav = false;
  var pinStart = 0; // scrollY at which the pin engages
  var travel = 0;   // scroll distance the pin lasts
  var frameH = 0;   // height of the pinned frame
  var boxH = 0;     // height of the artwork's box: the whole screen
  var navTop = 0;   // the header's own place in the document
  var navFree = false; // true once the header has been let go
  var lit = -1;
  var ticking = false;

  // Sticky holds the header for the length of the pin; past that it has to
  // travel with the page again. The swap keeps it in the same place on the
  // screen at the boundary: stuck it sits at navTop, and in flow shifted by
  // travel it sits at navTop + travel - scrollY, which is navTop at exactly
  // the scroll position where the pin ends.
  function setNavFree(free) {
    if (free === navFree) return;
    navFree = free;
    nav.style.position = free ? "relative" : "sticky";
    nav.style.transform = free ? "translate3d(0," + travel + "px,0)" : "";
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

    var scrolled = Math.min(Math.max(window.scrollY - pinStart, 0), travel);

    // Hold the header in place for the length of the pin, then let it go.
    // This only writes at the boundary, so the held header is left entirely
    // to the compositor and cannot lag the scroll.
    if (holdNav) setNavFree(scrolled >= travel);

    var progress = travel > 0 ? scrolled / travel : 1;

    // Artwork climbs the whole screen: a slice showing at the bottom when the
    // pin starts, gone past the top when it ends. Its box runs from the top
    // of the screen to the foot of the frame and the image is centred in it,
    // so these are offsets from that centre.
    if (media) {
      var imgH = media.offsetHeight;
      var centred = (boxH - imgH) / 2;
      var from = boxH - PEEK * boxH; // top edge, barely on screen
      var to = -imgH - 8;            // just past the top, edge and all
      media.style.transform =
        "translate3d(0," + (from + (to - from) * progress - centred).toFixed(1) + "px,0)";
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
    if (nav) {
      nav.style.position = "";
      nav.style.top = "";
      nav.style.transform = "";
      navFree = false;
    }
    if (media) {
      media.style.transform = "";
      section.style.removeProperty("--intro-top");
    }
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

    // Hand the artwork the page edges, so it can centre on the screen rather
    // than on the text column. clientWidth, not 100vw, which counts the
    // scrollbar and would push it off-centre. Set before any early return:
    // the image is centred on the screen whether or not the reveal runs.
    if (media) {
      section.style.setProperty("--intro-inset", sticky.getBoundingClientRect().left + "px");
      section.style.setProperty("--intro-vw", document.documentElement.clientWidth + "px");
    }

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
      navTop = nav.getBoundingClientRect().top + window.scrollY;
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
    frameH = frame;
    boxH = vh;
    // Let the artwork's box reach the top of the screen, past the header.
    if (media) section.style.setProperty("--intro-top", top + "px");

    enabled = true;
    // Sticky rather than a transform, and it leaves the header in flow, so
    // nothing below it shifts and no placeholder is needed.
    if (holdNav) {
      nav.style.position = "sticky";
      nav.style.top = navTop + "px";
    }
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
