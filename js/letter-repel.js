/* Letter repel on the intro statement.
   Letters near the cursor are pushed away and spring back. Mouse/trackpad
   only: skipped on touch screens and with reduced motion. The text stays
   real text, so copy, search and screen readers are unaffected. */
(function () {
  var root = document.querySelector(".introduction-text .statement");
  if (!root) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var R = 110, PUSH = 2.2, SPRING = 0.075, DAMP = 0.78;

  // Split text into per-letter spans; words stay unbreakable so wrapping
  // is identical to before.
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  var nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  var els = [];
  nodes.forEach(function (t) {
    if (!/\S/.test(t.textContent)) return;
    var frag = document.createDocumentFragment();
    t.textContent.split(/(\s+)/).forEach(function (word) {
      if (!word) return;
      if (/^\s+$/.test(word)) { frag.appendChild(document.createTextNode(word)); return; }
      var w = document.createElement("span");
      w.className = "rp-word";
      Array.from(word).forEach(function (c) {
        var s = document.createElement("span");
        s.className = "rp";
        s.textContent = c;
        w.appendChild(s);
        els.push(s);
      });
      frag.appendChild(w);
    });
    t.parentNode.replaceChild(frag, t);
  });

  var L = els.map(function (el) { return { el: el, ox: 0, oy: 0, x: 0, y: 0, vx: 0, vy: 0 }; });

  // Letter centres relative to the statement box; the box itself moves
  // (sticky intro), so it is read once per frame.
  function measure() {
    var b = root.getBoundingClientRect();
    L.forEach(function (l) {
      var r = l.el.getBoundingClientRect();
      l.ox = r.left + r.width / 2 - l.x - b.left;
      l.oy = r.top + r.height / 2 - l.y - b.top;
    });
  }

  var mx = -1e4, my = -1e4, running = false;
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    mx = e.clientX; my = e.clientY; wake();
  }, { passive: true });
  document.addEventListener("mouseleave", function () { mx = my = -1e4; wake(); });

  function wake() { if (!running) { running = true; requestAnimationFrame(tick); } }

  function tick() {
    var b = root.getBoundingClientRect();
    var near = mx > b.left - R && mx < b.right + R && my > b.top - R && my < b.bottom + R;
    var moving = false;
    for (var i = 0; i < L.length; i++) {
      var l = L[i];
      if (near) {
        var dx = b.left + l.ox + l.x - mx, dy = b.top + l.oy + l.y - my;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < R && d > 0.01) { var f = (1 - d / R) * PUSH; l.vx += dx / d * f; l.vy += dy / d * f; }
      }
      l.vx = (l.vx - l.x * SPRING) * DAMP;
      l.vy = (l.vy - l.y * SPRING) * DAMP;
      l.x += l.vx; l.y += l.vy;
      if (Math.abs(l.x) > 0.05 || Math.abs(l.y) > 0.05 || Math.abs(l.vx) > 0.05 || Math.abs(l.vy) > 0.05) {
        l.el.style.transform = "translate(" + l.x.toFixed(2) + "px," + l.y.toFixed(2) + "px)";
        moving = true;
      } else if (l.el.style.transform) {
        l.el.style.transform = ""; l.x = l.y = l.vx = l.vy = 0;
      }
    }
    if (moving || near) requestAnimationFrame(tick); else running = false;
  }

  function init() { measure(); }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(init);
  var t;
  window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(measure, 150); });
})();
