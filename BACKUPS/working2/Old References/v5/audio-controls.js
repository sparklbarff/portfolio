/*
 * Audio Player Controller System
 * Manages track selection and playback state
 * Features: Play/pause toggling, track switching
 * Implementation: Event-driven UI with synchronized icon state management
 */

/* Core audio elements and track data */
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

/* Audio player interaction handlers */
trackButtons.forEach((button, index) => {
  button.addEventListener('click', function(e) {
    e.preventDefault();
    
    const track = tracks[index];
    const checkbox = document.getElementById(track.id);
    
    // Toggle play/pause for current track or switch to new track
    if (checkbox.checked && audioPlayer.src.includes(track.file)) {
      if (audioPlayer.paused) {
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
    } 
    else {
      // Uncheck all tracks before selecting new one
      trackCheckboxes.forEach(cb => cb.checked = false);
      
      checkbox.checked = true;
      
      audioPlayer.src = track.file;
      audioPlayer.play();
    }
    
    updatePlayPauseIcons();
  });
});

/* Synchronize visual play/pause state with audio player */
function updatePlayPauseIcons() {
  trackButtons.forEach((button, index) => {
    const checkbox = document.getElementById(tracks[index].id);
    const icon = button.querySelector('.play-icon');
    
    // Set icon based on track selection and player state
    if (checkbox.checked && !audioPlayer.paused) {
      icon.textContent = '⏸';
    } else {
      icon.textContent = '▶';
    }
  });
}

/* Audio player event listeners */
audioPlayer.addEventListener('ended', function() {
  trackCheckboxes.forEach(cb => cb.checked = false);
  updatePlayPauseIcons();
});

audioPlayer.addEventListener('play', updatePlayPauseIcons);
audioPlayer.addEventListener('pause', updatePlayPauseIcons);
audioPlayer.addEventListener('error', function(e) {
  console.error('Audio playback error:', e);
  const errorTrack = tracks.find(track => audioPlayer.src.includes(track.file));
  if (errorTrack) {
    const checkbox = document.getElementById(errorTrack.id);
    checkbox.checked = false;
  }
  updatePlayPauseIcons();
});
});
