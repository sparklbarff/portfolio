const audioPlayer = document.getElementById('audio-player');
const trackButtons = document.querySelectorAll('.track-item label');
const trackCheckboxes = document.querySelectorAll('.audio-player input[type="checkbox"]');

const tracks = [
  { id: 'track1', file: 'assets/audio/frark1999.mp3', name: 'frark' },
  { id: 'track2', file: 'assets/audio/fulcrum.mp3', name: 'fulcrum' },
  { id: 'track3', file: 'assets/audio/sttd.mp3', name: 'sttd' },
  { id: 'track4', file: 'assets/audio/trance.mp3', name: 'trance' },
  { id: 'track5', file: 'assets/audio/whatwhat.mp3', name: 'whatwhat' }
];

trackButtons.forEach((button, index) => {
  button.addEventListener('click', function(e) {
    e.preventDefault();
    
    const track = tracks[index];
    const checkbox = document.getElementById(track.id);
    
    if (checkbox.checked && audioPlayer.src.includes(track.file)) {
      if (audioPlayer.paused) {
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
    } 
    else {
      trackCheckboxes.forEach(cb => cb.checked = false);
      
      checkbox.checked = true;
      
      audioPlayer.src = track.file;
      audioPlayer.play();
    }
    
    updatePlayPauseIcons();
  });
});

function updatePlayPauseIcons() {
  trackButtons.forEach((button, index) => {
    const checkbox = document.getElementById(tracks[index].id);
    const icon = button.querySelector('.play-icon');
    
    if (checkbox.checked && !audioPlayer.paused) {
      icon.textContent = '⏸';
    } else {
      icon.textContent = '▶';
    }
  });
}

audioPlayer.addEventListener('ended', function() {
  trackCheckboxes.forEach(cb => cb.checked = false);
  updatePlayPauseIcons();
});

audioPlayer.addEventListener('play', updatePlayPauseIcons);
audioPlayer.addEventListener('pause', updatePlayPauseIcons);

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
