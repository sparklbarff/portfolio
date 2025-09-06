(function(){
  "use strict";

  const root = document.documentElement;
  const container = document.getElementById("glitch-title");
  if(!container) return;

  const text = container.dataset.text || (container.textContent || "").trim() || "TRAVIS INSKEEP";
  container.textContent = "";
  const frag = document.createDocumentFragment();
  const letters = [];

  for(const ch of text){
    const s = document.createElement("span");
    s.className = "tg-letter";
    s.textContent = ch;
    frag.appendChild(s);
    letters.push(s);
  }
  container.appendChild(frag);

  let rafId = 0, destroyed = false;

  function jitterLetter(el, nudge){
    // subtle RGB text-shadow offsets
    const dx = (Math.random()*2-1) * nudge;
    const dy = (Math.random()*2-1) * nudge;
    const dx2 = (Math.random()*2-1) * nudge;
    const dy2 = (Math.random()*2-1) * nudge;
    el.style.textShadow =
      `${dx}px ${dy}px rgba(255,0,76,.36), ` +
      `${-dx}px ${-dy}px rgba(0,255,200,.36), ` +
      `${dx2}px ${dy2}px rgba(0,170,255,.32)`;
    el.style.transform = `translate(${(Math.random()*0.4-0.2)}px, ${(Math.random()*0.4-0.2)}px)`;
  }

  let burstUntil = 0;
  function loop(){
    if(destroyed) return;
    if(root.dataset.motion === "paused"){ rafId = requestAnimationFrame(loop); return; }

    const now = performance.now();
    const inBurst = now < burstUntil;

    const nudge = inBurst ? 1.2 : 0.45; // more aggressive during bursts
    for(const el of letters) jitterLetter(el, nudge);

    // trigger very fast, sporadic bursts
    if(Math.random() < 0.004){
      burstUntil = now + 240 + Math.random()*160;
    }

    rafId = requestAnimationFrame(loop);
  }

  rafId = requestAnimationFrame(loop);

  // Cleanup
  function destroy(){
    destroyed = true;
    if(rafId){ cancelAnimationFrame(rafId); rafId = 0; }
    for(const el of letters){
      el.style.textShadow = "";
      el.style.transform  = "";
    }
  }
  window.addEventListener("beforeunload", destroy);
  window.addEventListener("visibilitychange", ()=>{ if(document.visibilityState==="hidden") destroy(); }, {passive:true});
})();