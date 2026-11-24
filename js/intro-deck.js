/* -------------------------------------------------------------------------
   Intro card deck.

   A stack of project cards beside the statement. Every few seconds the top
   card turns over from its left edge like a page, showing the next project
   underneath, then slides to the back of the stack. The caption under the
   deck follows the card on top.

   Hovering or focusing the deck pauses it, and so does the tab being hidden.
   With reduced motion it never starts: the stack sits still and its top card
   links to its project.
   ------------------------------------------------------------------------- */
(function () {
  var deck = document.querySelector("[data-intro-deck]");
  if (!deck) return;

  var cards = Array.prototype.slice.call(deck.querySelectorAll(".deck-card"));
  var title = deck.querySelector(".deck-title");
  var caps = deck.querySelector(".deck-caps");
  if (cards.length < 2) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var HOLD = 2600; // time each card stays on top, ms
  var TURN = 900;  // length of the page turn, ms (matches the CSS)

  var order = cards.slice(); // order[0] is the top card
  var timer = null;
  var paused = false;
  var turning = false;

  // Stack position drives the look: 0 on top, 1 and 2 peeking behind it,
  // the rest tucked away under the third.
  function place() {
    order.forEach(function (card, i) {
      card.style.setProperty("--pos", Math.min(i, 3));
      card.style.zIndex = String(order.length - i);
      card.classList.toggle("is-top", i === 0);
      card.classList.toggle("is-tucked", i > 2);
      if (i === 0) {
        card.removeAttribute("tabindex");
        card.removeAttribute("aria-hidden");
      } else {
        card.setAttribute("tabindex", "-1");
        card.setAttribute("aria-hidden", "true");
      }
    });
    var top = order[0];
    if (title) title.textContent = top.getAttribute("data-title") || "";
    if (caps) caps.textContent = top.getAttribute("data-caps") || "";
  }

  function turn() {
    if (paused || turning || document.hidden) return schedule();
    turning = true;
    var top = order[0];
    top.classList.add("is-turning");
    // Promote the next card as the page passes the halfway point, so the
    // caption changes when the new artwork comes into view.
    window.setTimeout(function () {
      order.push(order.shift());
      top.classList.remove("is-turning");
      top.classList.add("is-returning");
      place();
      window.setTimeout(function () {
        top.classList.remove("is-returning");
        turning = false;
        schedule();
      }, 60);
    }, TURN);
  }

  function schedule() {
    window.clearTimeout(timer);
    timer = window.setTimeout(turn, HOLD);
  }

  function start() {
    window.clearTimeout(timer);
    deck.classList.toggle("is-animated", !reduced.matches);
    if (reduced.matches) return;
    schedule();
  }

  deck.addEventListener("mouseenter", function () { paused = true; });
  deck.addEventListener("mouseleave", function () { paused = false; });
  deck.addEventListener("focusin", function () { paused = true; });
  deck.addEventListener("focusout", function () { paused = false; });
  if (reduced.addEventListener) reduced.addEventListener("change", start);

  place();
  start();
})();
