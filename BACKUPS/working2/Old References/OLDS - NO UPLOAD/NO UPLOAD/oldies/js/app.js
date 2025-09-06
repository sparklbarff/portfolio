/* ====== CONFIG ====== */
const CFG = {
  imgCount: 65,
  base: location.protocol === 'file:' ? 'mybg' : '/mybg',
  periodMs: 19000, // 5% faster
  fadeMs: 14250,
  folders: { avif: 'avif', webp: 'webp', png: 'png' }
};

/* ====== STATE ====== */
const Motion = { paused: false };
window.__MOTION_PAUSED__ = false;

/* ====== UTILS ====== */
const $ = sel => document.querySelector(sel);
const pad2 = n => (n < 10 ? '0' + n : '' + n);
function fy(arr){ for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }

/* ====== FORMAT PICKER ====== */
const urlCache = new Map();
function tryLoad(urls){
  return new Promise((resolve,reject)=>{
    let i=0; const img=new Image();
    function next(){ if(i>=urls.length) return reject(new Error('No candidate')); const u=urls[i++]; img.onload=()=>resolve(u); img.onerror=next; img.src=u; }
    next();
  });
}
async function chooseUrl(index){
  if(urlCache.has(index)) return urlCache.get(index);
  const c = [
    `${CFG.base}/${CFG.folders.avif}/bg${pad2(index)}.avif`,
    `${CFG.base}/${CFG.folders.avif}/bg${index}.avif`,
    `${CFG.base}/${CFG.folders.webp}/bg${pad2(index)}.webp`,
    `${CFG.base}/${CFG.folders.webp}/bg${index}.webp`,
    `${CFG.base}/${CFG.folders.png}/bg${index}.png`
  ];
  let chosen; try{ chosen = await tryLoad(c); } catch{ chosen = `${CFG.base}/${CFG.folders.png}/bg${index}.png`; }
  urlCache.set(index, chosen);
  return chosen;
}

/* ====== BACKGROUND ENGINE ====== */
const bgContainer = $("#bg-container");
if(bgContainer){
  const layers=[document.createElement('div'), document.createElement('div')];
  layers.forEach(l=>{ l.className="bg-image"; bgContainer.appendChild(l); });
  let active=0;
  let order = fy(Array.from({length:CFG.imgCount},(_,i)=>i+1));
  let p=0, last=-1;

  function nextIndex(){
    p++; if(p>=order.length){ order = fy(order); p=0; }
    const v=order[p]; if(v===last && order.length>1){ const s=(p+1)%order.length; [order[p],order[s]]=[order[s],order[p]]; }
    last=order[p]; return last;
  }
  async function crossfadeTo(idx){
    const prevEl = document.querySelector(".bg-image.active");
    const nextEl = layers[active ^ 1]; active ^= 1;
    const url = await chooseUrl(idx);
    nextEl.style.backgroundImage = `url("${url}")`;
    void nextEl.offsetWidth;
    nextEl.classList.add("active");
    if(prevEl) prevEl.classList.remove("active");
  }
  (async ()=>{
    const first=order[0];
    layers[active].style.backgroundImage = `url("${await chooseUrl(first)}")`;
    layers[active].classList.add("active");
    setInterval(()=>{ if(!Motion.paused){ crossfadeTo(nextIndex()); } }, CFG.periodMs);
  })();

  bgContainer.style.cursor="pointer";
  bgContainer.addEventListener("click", ()=>{
    Motion.paused = !Motion.paused;
    window.__MOTION_PAUSED__ = Motion.paused;
    document.documentElement.dataset.motion = Motion.paused ? "paused" : "on";
  });
}