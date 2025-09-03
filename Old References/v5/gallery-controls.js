/*
 * Gallery Navigation System
 * Handles image gallery interaction and accessibility
 * Features: Keyboard navigation, touch swipe detection, ARIA attributes
 * Implementation: Event-driven navigation with proper focus management
 * Mobile: Touch gestures for swipe navigation with threshold detection
 */

/* Touch navigation system for image gallery */
const imageGallery = document.querySelector('.image-gallery');
let touchStartX = 0;
let touchEndX = 0;

imageGallery.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

imageGallery.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, { passive: true });

/* Find visible navigation arrows based on current image selection */
function getVisibleArrows() {
  // Find which image is currently selected
  const checkedInput = document.querySelector('.image-gallery input:checked');
  const imgNumber = checkedInput ? parseInt(checkedInput.id.replace('img', '')) : 1;
  
  // Calculate prev/next image numbers with wraparound
  const prevImgNum = imgNumber === 1 ? 31 : imgNumber - 1;
  const nextImgNum = imgNumber === 31 ? 1 : imgNumber + 1;
  
  // Find the corresponding arrows
  return {
    prev: document.querySelector(`.prev-arrow[for="img${prevImgNum}"]`),
    next: document.querySelector(`.next-arrow[for="img${nextImgNum}"]`)
  };
}

/* Touch gesture processing with threshold detection */
function handleSwipe() {
  // Get currently visible navigation arrows
  const arrows = getVisibleArrows();
  
  // Threshold of 50px prevents accidental swipes
  if (touchEndX < touchStartX - 50) {
    // Right-to-left swipe: next image
    if (arrows.next) arrows.next.click();
  }
  
  if (touchEndX > touchStartX + 50) {
    // Left-to-right swipe: previous image
    if (arrows.prev) arrows.prev.click();
  }
}

/* Keyboard navigation for gallery accessibility */
document.addEventListener('keydown', e => {
  // Only process if portfolio section is visible and we're not in an input/textarea
  const portfolioVisible = document.getElementById('portfolio').offsetParent !== null;
  if (!portfolioVisible || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    return;
  }
  
  // Get currently visible navigation arrows
  const arrows = getVisibleArrows();
  
  // Left arrow key - previous image
  if (e.key === 'ArrowLeft') {
    if (arrows.prev) {
      arrows.prev.click();
      e.preventDefault(); // Prevent page scrolling
    }
  }
  
  // Right arrow key - next image
  if (e.key === 'ArrowRight') {
    if (arrows.next) {
      arrows.next.click();
      e.preventDefault(); // Prevent page scrolling
    }
  }
});

/* Initialize accessibility attributes */
document.addEventListener('DOMContentLoaded', () => {
  // Set initial ARIA attributes
  const gallery = document.querySelector('.image-gallery');
  if (gallery) {
    gallery.setAttribute('role', 'region');
    gallery.setAttribute('aria-roledescription', 'image gallery');
    
    // Find first checked image and set initial state
    const checkedInput = document.querySelector('.image-gallery input:checked');
    if (checkedInput) {
      const imgNumber = checkedInput.id.replace('img', '');
      gallery.setAttribute('aria-label', `Image gallery showing image ${imgNumber} of 31`);
    }
    
    // Update ARIA label when image changes
    const inputs = document.querySelectorAll('.image-gallery input[type="radio"]');
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        if (input.checked) {
          const imgNumber = input.id.replace('img', '');
          gallery.setAttribute('aria-label', `Image gallery showing image ${imgNumber} of 31`);
        }
      });
    });
  }
});
