/* -------------------------------------------------------------------------
   Logo Collection card: cycle the marks.

   Each swap rises out of a blur rather than cutting, which at this cadence
   is the difference between a slideshow and a flicker. The animation itself
   lives in CSS (see --logo-swap-* in style.css); this file only decides
   when to change the image.
   ------------------------------------------------------------------------- */
const logoCollectionImages = [
  "/images/logo-shuffle/logo_apm.webp",
  "/images/logo-shuffle/logo_astral.webp",
  "/images/logo-shuffle/logo_CHFP.webp",
  "/images/logo-shuffle/logo_dreamsociety.webp",
  "/images/logo-shuffle/logo_funbox.webp",
  "/images/logo-shuffle/logo_m-logo.webp",
  "/images/logo-shuffle/logo_rosel.webp",
  "/images/logo-shuffle/logo_the-lab.webp",
  "/images/logo-shuffle/logo_tradie.webp",
  "/images/logo-shuffle/logo_bouklas.webp",
  "/images/logo-shuffle/logo_cherry.webp",
  "/images/logo-shuffle/logo_dafne.webp",
  "/images/logo-shuffle/logo_fiona.webp",
  "/images/logo-shuffle/logo_ii.webp",
  "/images/logo-shuffle/logo_intrunk.webp",
  "/images/logo-shuffle/logo_lazoo.webp",
  "/images/logo-shuffle/logo_master.webp",
  "/images/logo-shuffle/logo_OC2019.webp",
  "/images/logo-shuffle/logo_open.webp",
  "/images/logo-shuffle/logo_solace.webp",
  "/images/logo-shuffle/logo_squareone.webp",
  "/images/logo-shuffle/logo_sv.webp",
  "/images/logo-shuffle/logo_nite-records.webp",
  "/images/logo-shuffle/logo_carla.webp",
  "/images/logo-shuffle/logo_ucla.webp",
];

const logoCollectionImage = document.getElementById("logoCollectionImage");

// Long enough that each mark is read rather than glimpsed, and that the
// animation finishes well before the next one starts.
const SHUFFLE_MS = 560;

if (logoCollectionImage) {
  let currentLogoIndex = 0;
  let logoShuffleInterval;

  // Decode ahead of the swap: a mark arriving late would otherwise animate
  // an empty frame and land as a hard cut anyway.
  logoCollectionImages.forEach(function (src) {
    var pre = new Image();
    pre.src = src;
  });

  function shuffleLogoImage() {
    logoCollectionImage.classList.remove("is-swapping");
    // Force a reflow so re-adding the class restarts the animation; without
    // it the class never actually leaves the element between frames.
    void logoCollectionImage.offsetWidth;

    logoCollectionImage.src = logoCollectionImages[currentLogoIndex];
    logoCollectionImage.classList.add("is-swapping");

    currentLogoIndex = (currentLogoIndex + 1) % logoCollectionImages.length;
  }

  function start() {
    stop();
    logoShuffleInterval = setInterval(shuffleLogoImage, SHUFFLE_MS);
  }

  function stop() {
    clearInterval(logoShuffleInterval);
  }

  start();

  // Hold the current mark while it is being looked at.
  logoCollectionImage.addEventListener("mouseenter", stop);
  logoCollectionImage.addEventListener("mouseleave", start);

  // A background tab fires no frames; without this the interval queues up
  // swaps that all land at once on return.
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else start();
  });
}
