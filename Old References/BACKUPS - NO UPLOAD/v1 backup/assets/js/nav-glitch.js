(function(){
  "use strict";

  const root = document.documentElement;
  const links = Array.from(document.querySelectorAll("#nav-list a"));
  if(!links.length) return;

  const states = links.map(()=>({ raf:0, burstUntil:0, destroyed:false }));

  function tick(i){
    const st = states[i];
    if(st.destroyed) return;

    if(root.dataset.motion === "paused"){
      st.raf = requestAnimationFrame(()=>tick(i));
      return;
    }

    const a = links[i];
    const now = performance.now();
    const inBurst = now < st.burstUntil;

    // subtle but more erratic than title
    const nudge = inBurst ? 1.8 : 0.7; // Double intensity
    const dx = (Math.random()*2-1) * nudge;
    const dy = (Math.random()*2-1) * nudge;
    const dx2 = (Math.random()*2-1) * nudge;
    const dy2 = (Math.random()*2-1) * nudge;
    a.style.textShadow =
      `${dx}px ${dy}px rgba(255,0,76,.34), ` +
      `${-dx}px ${-dy}px rgba(0,255,200,.34), ` +
      `${dx2}px ${dy2}px rgba(0,170,255,.30)`;

    if(Math.random() < 0.0035){
      st.burstUntil = now + 180 + Math.random()*140;
    }

    st.raf = requestAnimationFrame(()=>tick(i));
  }

  // start all
  states.forEach((_, i)=> states[i].raf = requestAnimationFrame(()=>tick(i)));

  // cleanup
  function destroy(){
    states.forEach((st, i)=>{
      st.destroyed = true;
      if(st.raf){ cancelAnimationFrame(st.raf); st.raf = 0; }
      links[i].style.textShadow = "";
    });
  }
  window.addEventListener("beforeunload", destroy);
  window.addEventListener("visibilitychange", ()=>{ if(document.visibilityState==="hidden") destroy(); }, {passive:true});
})();