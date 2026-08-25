// logoShuffle.js

// Array of image URLs for the logo collection thumbnails
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
    "/images/logo-shuffle/logo_m-logo.webp",
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

// Get the logo collection image element
const logoCollectionImage = document.getElementById('logoCollectionImage');

let currentLogoIndex = 0;
let logoShuffleInterval;

function shuffleLogoImage() {
    // Update the source of the logo collection image
    logoCollectionImage.src = logoCollectionImages[currentLogoIndex];

    // Move to the next image in the array
    currentLogoIndex = (currentLogoIndex + 1) % logoCollectionImages.length;
}

// Only wire this up on pages that actually carry the shuffling thumbnail —
// without the guard this throws twice a second on every other page.
if (logoCollectionImage) {
    // Start shuffling the logo collection images
    logoShuffleInterval = setInterval(shuffleLogoImage, 500);

    // Pause shuffling on hover
    logoCollectionImage.addEventListener('mouseenter', () => {
        clearInterval(logoShuffleInterval);
    });

    // Resume shuffling on mouseleave
    logoCollectionImage.addEventListener('mouseleave', () => {
        logoShuffleInterval = setInterval(shuffleLogoImage, 500);
    });
}
