(function() {
  'use strict';
  
  let initialized = false;
  
  function setupVisualizer() {
    if (initialized) return;
    initialized = true;

    if (!window.AudioContext && !window.webkitAudioContext) {
      console.warn('AudioContext not supported - visualizer disabled');
      return;
    }

    const audio = document.getElementById('audio');
    const playerBox = document.getElementById('playerBox');

    if (!audio || !playerBox) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'visualizer-canvas';

    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      border-radius: 13px;
      opacity: 0.7;
      background: #000;
    `;
    
    playerBox.insertBefore(canvas, playerBox.firstChild);

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    let source = null;

    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function resizeCanvas() {
      canvas.width = playerBox.offsetWidth;
      canvas.height = playerBox.offsetHeight;
    }
    
    audio.addEventListener('play', function() {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      if (!source) {
        source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
      }
      
      resizeCanvas();
      
      requestAnimationFrame(drawVisualizer);
    });
    
    window.addEventListener('resize', resizeCanvas);
    
    function drawVisualizer() {
      if (!audio.paused) {
        requestAnimationFrame(drawVisualizer);
      }
      
      if (!playerBox.offsetParent) return;
      
      analyser.getByteFrequencyData(dataArray);
      
      const canvasCtx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      
      canvasCtx.clearRect(0, 0, width, height);
      
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      
      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.7;
        
        const hue = i / bufferLength * 180 + 160; // cyan to purple range
        canvasCtx.fillStyle = `hsla(${hue}, 100%, 50%, 0.7)`;
        
        canvasCtx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        
        x += barWidth;
      }
      
      if (average > 50) {
        canvasCtx.fillStyle = `rgba(0, 255, 200, ${average/255 * 0.2})`;
        canvasCtx.fillRect(0, 0, width, height);
      }
    }
    
    resizeCanvas();
  }
  
  function initOnWindowLoad() {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          const playerBox = document.getElementById('playerBox');
          if (playerBox) {
            setupVisualizer();
            observer.disconnect();
          }
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnWindowLoad);
  } else {
    initOnWindowLoad();
  }
})();
