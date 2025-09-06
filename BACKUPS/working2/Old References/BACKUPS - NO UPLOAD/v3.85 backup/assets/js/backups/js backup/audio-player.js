class AudioPlayer {
  constructor(options = {}) {
    this.options = {
      container: '#playerBox',
      audioElement: '#audio',
      playButton: '#playBtn',
      muteButton: '#muteBtn',
      seekBar: '#seek',
      currentTime: '#cur',
      duration: '#dur',
      tracksContainer: '#tracks',
      statusElement: '#playerStatus',
      ...options
    };
    
    this.audio = document.querySelector(this.options.audioElement);
    this.playerBox = document.querySelector(this.options.container);
    this.playBtn = document.querySelector(this.options.playButton);
    this.muteBtn = document.querySelector(this.options.muteButton);
    this.seek = document.querySelector(this.options.seekBar);
    this.curTimeEl = document.querySelector(this.options.currentTime);
    this.durTimeEl = document.querySelector(this.options.duration);
    this.tracksBar = document.querySelector(this.options.tracksContainer);
    this.statusEl = document.querySelector(this.options.statusElement);
    
    this.activeBtn = null;
    this.currentTrack = null;
    this.audioCache = new Map();
    
    this.init();
  }
  
  init() {
    if (!this.audio || !this.playerBox) return;
    
    this.formatTime = (t) => {
      if (!isFinite(t)) return '0:00';
      const m = Math.floor(t/60), s = Math.floor(t%60);
      return m + ':' + (s<10?'0':'') + s;
    };
    
    this.setIcon = (btn, type) => {
      const icons = {
        play: '<path d="M8 5v14l11-7z"/>',
        pause: '<path d="M6 5h4v14H6zm8 0h4v14h-4z"/>',
        speaker: '<path d="M4 9v6h4l5 4V5L8 9H4z"/>',
        mute: '<path d="M4 9v6h4l5 4V5L8 9H4z M16 9l5 5m0-5l-5 5" stroke="#fff" stroke-width="2" fill="none"/>'
      };
      
      if (!btn || !btn.querySelector('svg')) return;
      btn.querySelector('svg').innerHTML = icons[type];
      
      const labels = {
        play: 'Play', pause: 'Pause', speaker: 'Mute', mute: 'Unmute'
      };
      
      if (labels[type]) {
        btn.setAttribute('aria-label', labels[type]);
        btn.setAttribute('title', labels[type]);
      }
    };
    
    this.announce = (message) => {
      if (this.statusEl) this.statusEl.textContent = message;
    };
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => {
        if (!this.currentTrack && this.tracksBar && this.tracksBar.children.length) {
          const randomIndex = Math.floor(Math.random() * this.tracksBar.children.length);
          const trackBtn = this.tracksBar.children[randomIndex];
          if (trackBtn && typeof trackBtn.click === 'function') {
            trackBtn.click();
          }
          return;
        }
        
        this.togglePlayback();
      });
    }
    
    if (this.muteBtn) {
      this.muteBtn.addEventListener('click', () => {
        this.audio.muted = !this.audio.muted;
        this.setIcon(this.muteBtn, this.audio.muted ? 'mute' : 'speaker');
        this.announce(this.audio.muted ? "Muted" : "Unmuted");
      });
    }
    
    if (this.audio) {
      this.audio.addEventListener('play', () => {
        this.setIcon(this.playBtn, 'pause');
        if (this.activeBtn) this.activeBtn.classList.add('active');
      });
      
      this.audio.addEventListener('pause', () => {
        this.setIcon(this.playBtn, 'play');
      });
      
      this.audio.addEventListener('waiting', () => {
        if (this.playerBox) this.playerBox.classList.add('is-loading');
      });
      
      this.audio.addEventListener('canplay', () => {
        if (this.playerBox) this.playerBox.classList.remove('is-loading');
      });
      
      this.audio.addEventListener('loadedmetadata', () => {
        if (this.durTimeEl) this.durTimeEl.textContent = this.formatTime(this.audio.duration);
      });
      
      this.audio.addEventListener('timeupdate', () => {
        if (!this.audio.duration) return;
        if (this.curTimeEl) this.curTimeEl.textContent = this.formatTime(this.audio.currentTime);
        if (this.seek) this.seek.value = (this.audio.currentTime / this.audio.duration) * 100;
      });
      
      this.audio.addEventListener('ended', () => {
        if (this.activeBtn && this.activeBtn.nextElementSibling) {
          const nextTrack = this.activeBtn.nextElementSibling;
          if (nextTrack && nextTrack.classList.contains('trk')) {
            nextTrack.click();
          } else if (this.tracksBar && this.tracksBar.firstElementChild) {
            this.tracksBar.firstElementChild.click();
          }
        }
        this.announce("Track ended");
      });
      
      this.audio.addEventListener('error', () => {
        if (this.playerBox) this.playerBox.classList.remove('is-loading');
        this.announce("Audio error occurred");
      });
    }
    
    if (this.seek) {
      this.seek.addEventListener('input', () => {
        if (!this.audio || !this.audio.duration) return;
        this.audio.currentTime = (this.seek.value / 100) * this.audio.duration;
        if (this.curTimeEl) this.curTimeEl.textContent = this.formatTime(this.audio.currentTime);
      });
    }
  }
  
  togglePlayback() {
    if (!this.audio) return;
    
    if (this.audio.paused) {
      if (this.playerBox) this.playerBox.classList.add('is-loading');
      
      this.audio.play().then(() => {
        if (this.playerBox) this.playerBox.classList.remove('is-loading');
        if (this.activeBtn) {
          this.announce(`Playing ${this.activeBtn.textContent}`);
        } else {
          this.announce("Playing audio");
        }
      }).catch(err => {
        if (this.playerBox) this.playerBox.classList.remove('is-loading');
        this.announce("Failed to play audio");
        console.error("Playback error:", err);
      });
    } else {
      this.audio.pause();
      this.announce("Paused");
    }
  }
  
  preloadAudio(url) {
    if (this.audioCache.has(url)) return Promise.resolve();
    
    return fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`Failed to preload ${url}`);
        return response.blob();
      })
      .then(blob => {
        const objectUrl = URL.createObjectURL(blob);
        this.audioCache.set(url, objectUrl);
        return objectUrl;
      });
  }
  
  loadTrack(url, trackName) {
    if (this.currentTrack === url) {
      this.togglePlayback();
      return Promise.resolve();
    }
    
    this.currentTrack = url;
    
    if (this.playerBox) this.playerBox.classList.add('is-loading');
    this.announce(`Loading track ${trackName || 'audio'}`);
    
    if (this.audioCache.has(url)) {
      this.audio.src = this.audioCache.get(url);
      return this.audio.play()
        .then(() => {
          if (this.playerBox) this.playerBox.classList.remove('is-loading');
          this.announce(`Playing ${trackName || 'audio'}`);
        })
        .catch(err => {
          if (this.playerBox) this.playerBox.classList.remove('is-loading');
          this.announce(`Failed to play ${trackName || 'audio'}`);
          console.error("Playback error:", err);
        });
    }
    
    this.audio.src = url;
    return this.audio.play()
      .then(() => {
        if (this.playerBox) this.playerBox.classList.remove('is-loading');
        this.announce(`Playing ${trackName || 'audio'}`);
        
        this.preloadAudio(url).catch(err => console.warn("Preload failed:", err));
      })
      .catch(err => {
        if (this.playerBox) this.playerBox.classList.remove('is-loading');
        this.announce(`Failed to play ${trackName || 'audio'}`);
        console.error("Playback error:", err);
      });
  }
  
  addTracks(tracks, baseUrl = '') {
    if (!this.tracksBar || !tracks || !tracks.length) return;
    
    tracks.forEach(track => {
      const btn = document.createElement('button');
      btn.className = 'trk';
      btn.textContent = track.label || track.name;
      btn.dataset.src = baseUrl + track.file;
      
      btn.addEventListener('click', () => {
        if (this.activeBtn) this.activeBtn.classList.remove('active');
        
        this.activeBtn = btn;
        this.activeBtn.classList.add('active');
        this.loadTrack(btn.dataset.src, btn.textContent);
      });
      
      this.tracksBar.appendChild(btn);
    });
    
    if (tracks.length > 0 && tracks[0].file) {
      this.preloadAudio(baseUrl + tracks[0].file)
        .catch(err => console.warn("Preload failed:", err));
    }
  }
}
