// Get references to HTML elements
const audioPlayer = document.getElementById('audio-player');
const trackButtons = document.querySelectorAll('.track-item label');
const trackCheckboxes = document.querySelectorAll('.audio-player input[type="checkbox"]');

// Track data - associate each track with its file
const tracks = [
  { id: 'track1', file: 'assets/audio/frark1999.mp3', name: 'frark' },
  { id: 'track2', file: 'assets/audio/fulcrum.mp3', name: 'fulcrum' },
  { id: 'track3', file: 'assets/audio/sttd.mp3', name: 'sttd' },
  { id: 'track4', file: 'assets/audio/trance.mp3', name: 'trance' },
  { id: 'track5', file: 'assets/audio/whatwhat.mp3', name: 'whatwhat' }
];

// Add click event listeners to each track button
trackButtons.forEach((button, index) => {
  button.addEventListener('click', function(e) {
    e.preventDefault(); // Prevent default label behavior
    
    const track = tracks[index];
    const checkbox = document.getElementById(track.id);
    
    // If this track is already playing, pause it
    if (checkbox.checked && audioPlayer.src.includes(track.file)) {
      if (audioPlayer.paused) {
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
    } 
    // If it's a different track, load and play it
    else {
      // Uncheck all checkboxes
      trackCheckboxes.forEach(cb => cb.checked = false);
      
      // Check this track's checkbox
      checkbox.checked = true;
      
      // Change audio source and play
      audioPlayer.src = track.file;
      audioPlayer.play();
    }
    
    // Update play/pause icons for all tracks
    updatePlayPauseIcons();
  });
});

// Function to update all play/pause icons
function updatePlayPauseIcons() {
  trackButtons.forEach((button, index) => {
    const checkbox = document.getElementById(tracks[index].id);
    const icon = button.querySelector('.play-icon');
    
    // If this track is checked and playing
    if (checkbox.checked && !audioPlayer.paused) {
      icon.textContent = '⏸'; // Pause icon
    } else {
      icon.textContent = '▶'; // Play icon
    }
  });
}

// Listen for audio ended event to reset icons
audioPlayer.addEventListener('ended', function() {
  trackCheckboxes.forEach(cb => cb.checked = false);
  updatePlayPauseIcons();
});

// Listen for play/pause events to update icons
audioPlayer.addEventListener('play', updatePlayPauseIcons);
audioPlayer.addEventListener('pause', updatePlayPauseIcons);

// Add touch swipe support for image gallery
const imageGallery = document.querySelector('.image-gallery');
let touchStartX = 0;
let touchEndX = 0;

imageGallery.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
});

imageGallery.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  // Determine swipe direction
  if (touchEndX < touchStartX - 50) {
    // Swipe left - next image
    const nextArrow = document.querySelector('.image-controls .next-arrow[style*="display: flex"]');
    if (nextArrow) nextArrow.click();
  }
  
  if (touchEndX > touchStartX + 50) {
    // Swipe right - previous image
    const prevArrow = document.querySelector('.image-controls .prev-arrow[style*="display: flex"]');
    if (prevArrow) prevArrow.click();
  }
}
