/* -------------------------------------------------------------------------
   Serif morph.

   On hover, a Helvetica label turns into the serif italic one letter at a
   time, left to right, each letter blinking over as it changes. Moving off
   turns it back, right to left. Used on project titles, the nav links and
   "Let's work together".

   Each label is split into per-letter spans once. Screen readers get the
   label's plain text through aria-label, so they never hear it spelled out.
   With reduced motion the whole label swaps at once.
   ------------------------------------------------------------------------- */
(function () {
  var STEP = 28; // ms between letters
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  // [label selector, element whose hover triggers it]
  var targets = [
    ["#work .work-item h3", ".work-item a"],
    ["#navigation .nav-link", null],
    [".introduction-text h1 a", null],
  ];

  function split(el) {
    if (el.dataset.morph) return el.querySelectorAll(".mc");
    var text = el.textContent;
    if (!text.trim()) return [];
    el.dataset.morph = "1";
    if (!el.getAttribute("aria-label") && el.tagName === "A") el.setAttribute("aria-label", text.trim());
    var frag = document.createDocumentFragment();
    var wrap = document.createElement("span");
    wrap.setAttribute("aria-hidden", "true");
    wrap.className = "morph";
    Array.prototype.forEach.call(text, function (ch) {
      if (ch === " " || ch === "\n") {
        wrap.appendChild(document.createTextNode(ch));
        return;
      }
      var s = document.createElement("span");
      s.className = "mc";
      s.textContent = ch;
      wrap.appendChild(s);
    });
    frag.appendChild(wrap);
    if (el.tagName !== "A") {
      var sr = document.createElement("span");
      sr.className = "visually-hidden";
      sr.textContent = text;
      frag.appendChild(sr);
    }
    el.textContent = "";
    el.appendChild(frag);
    return el.querySelectorAll(".mc");
  }

  function run(el, on) {
    var letters = split(el);
    (el._timers || []).forEach(clearTimeout);
    el._timers = [];
    var list = Array.prototype.slice.call(letters);
    if (!on) list.reverse();
    list.forEach(function (c, i) {
      var t = setTimeout(function () {
        c.classList.toggle("is-serif", on);
        c.classList.remove("is-blink");
        void c.offsetWidth;
        c.classList.add("is-blink");
      }, reduced.matches ? 0 : i * STEP);
      el._timers.push(t);
    });
  }

  targets.forEach(function (pair) {
    document.querySelectorAll(pair[0]).forEach(function (label) {
      if (label.querySelector("img")) return; // never the logo
      var trigger = pair[1] ? label.closest(pair[1]) : label;
      if (!trigger) return;
      split(label);
      trigger.addEventListener("mouseenter", function () { run(label, true); });
      trigger.addEventListener("mouseleave", function () { run(label, false); });
      trigger.addEventListener("focus", function () { run(label, true); });
      trigger.addEventListener("blur", function () { run(label, false); });
    });
  });
})();
