// logoShuffle.js

// Array of image URLs for the logo collection thumbnails
const logoCollectionImages = [
    "images/logo-shuffle/logo_apm.jpg",
    "images/logo-shuffle/logo_astral.jpg",
    "images/logo-shuffle/logo_CHFP.jpg",
    "images/logo-shuffle/logo_dreamsociety.jpg",
    "images/logo-shuffle/logo_funbox.jpg",
    "images/logo-shuffle/logo_m-logo.jpg",
    "images/logo-shuffle/logo_rosel.jpg",
    "images/logo-shuffle/logo_the-lab.jpg",
    "images/logo-shuffle/logo_tradie.jpg",
    
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
