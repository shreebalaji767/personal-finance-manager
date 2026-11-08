(() => {
const host=document.getElementById('ledgerTourScene'),tour=document.getElementById('ledgerTour');
if(!host||!tour||!window.THREE)return;
const steps=[
{title:'Your financial overview',label:'01 · START HERE',copy:'Start with a clear picture. The dashboard brings your recorded balances, income, spending and cash flow together.',tip:'Your dashboard starts blank. Add only the records you want to track.',kind:'dashboard'},
{title:'Set up your accounts',label:'02 · ACCOUNTS',copy:'Create cash, bank, savings or credit-card accounts. Enter an opening balance to match the amount you already have.',tip:'Account names and opening balances are saved only in this browser.',kind:'accounts'},
{title:'Record income and expenses',label:'03 · TRANSACTIONS',copy:'Add money received or spent, choose an account and category, and set the date. Transfers move money between your own accounts.',tip:'A transfer is not counted as income or an expense.',kind:'transactions'},
{title:'Plan your monthly budget',label:'04 · BUDGETS',copy:'Set a limit for categories such as groceries, travel or bills. Ledger shows how much you have used and what remains.',tip:'Budget warnings appear as spending approaches or passes your limit.',kind:'budgets'},
{title:'Build savings goals',label:'05 · SAVINGS GOALS',copy:'Give a goal a name, target amount and optional date. Update how much you have saved to follow your progress.',tip:'Goals are trackers; they do not move money automatically.',kind:'goals'},
{title:'Keep bills and EMIs organised',label:'06 · BILLS & LOANS',copy:'Record recurring bills, due dates and loan details. Mark bills paid when you have actually paid them.',tip:'Ledger never initiates payments or silently creates transactions.',kind:'bills'},
{title:'Understand your reports',label:'07 · REPORTS',copy:'Review income, expenses, category trends and net worth. Choose a date range and export a CSV when you need a spreadsheet.',tip:'Reports use the records you entered; no bank connection is involved.',kind:'reports'},
{title:'Protect your records',label:'08 · BACKUP',copy:'Export a JSON backup regularly. You can restore it later, or create a password-protected encrypted backup in Settings.',tip:'Your data stays on this device. Clearing browser data can erase it, so keep backups.',kind:'backup'}];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,80);
camera.position.set(0,0,8.5);let renderer;
try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:!/Mobi|Android/i.test(navigator.userAgent),powerPreference:'low-power',stencil:false});}catch(e){host.classList.add('tour-fallback');return;}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.4));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.domElement.className='tour-three-canvas';renderer.domElement.setAttribute('aria-hidden','true');host.prepend(renderer.domElement);
scene.add(new THREE.AmbientLight(0xffffff,1.65));const light=new THREE.DirectionalLight(0xffffff,2.8);light.position.set(4,5,8);scene.add(light);
const blue=new THREE.MeshStandardMaterial({color:0x4e6fe7,metalness:.35,roughness:.3}),pale=new THREE.MeshStandardMaterial({color:0xc8d5ff,metalness:.42,roughness:.25}),green=new THREE.MeshStandardMaterial({color:0x39b78e,metalness:.3,roughness:.32}),white=new THREE.MeshStandardMaterial({color:0xf8faff,roughness:.5}),gold=new THREE.MeshStandardMaterial({color:0xe8b85c,metalness:.55,roughness:.25});
const root=new THREE.Group();scene.add(root);let active=null,current=0,playing=!reduced,visible=false,raf=0,last=0,started=0,tx=0,ty=0;const duration=6500,clock=new THREE.Clock();
const mesh=(p,geo,mat,x,y,z)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);p.add(o);return o;};
const box=(p,x,y,z,w,h,d,m)=>mesh(p,new THREE.BoxGeometry(w,h,d),m,x,y,z);
const card=(g,x,y,w,h,m=white)=>{const o=box(g,x,y,0,w,h,.13,m);o.rotation.z=-.035;return o;};
const bar=(g,x,h,m,z=.2)=>box(g,x,h/2-.5,z,.23,h,.22,m);
const ring=(g,x,y,z,r,t,m)=>mesh(g,new THREE.TorusGeometry(r,t,12,64),m,x,y,z);
function build(kind){const g=new THREE.Group();root.add(g);
if(kind==='dashboard'){card(g,0,0,3.5,2.15);box(g,-1.15,.63,.12,.7,.09,.05,pale);box(g,-.55,.63,.12,.42,.09,.05,blue);box(g,-.65,.05,.14,.72,.34,.06,pale);box(g,.35,.05,.14,.72,.34,.06,green);[-1.15,-.78,-.41,-.04,.33,.7,1.07].forEach((x,i)=>bar(g,x,[.42,.68,.55,.93,.72,1.18,.88][i],i===5?green:blue));ring(g,1.6,.95,.3,.32,.07,gold);}
else if(kind==='accounts'){[-1,0,1].forEach((x,i)=>{const c=new THREE.Group();c.position.set(x*.92,(i-1)*.15,0);c.rotation.y=(i-1)*-.13;g.add(c);card(c,0,0,1.55,1.72,i===1?blue:white);box(c,-.43,.45,.1,.36,.08,.04,pale);box(c,-.37,-.15,.1,.75,.1,.04,i===1?green:gold);ring(c,.48,-.48,.15,.16,.04,i===1?green:blue);});}
else if(kind==='transactions'){card(g,-.95,0,1.8,2.2);card(g,.95,0,1.8,2.2);ring(g,-.95,.57,.2,.24,.06,green);ring(g,.95,.57,.2,.24,.06,gold);box(g,-.95,.02,.16,.9,.08,.05,green);box(g,.95,.02,.16,.9,.08,.05,blue);[-.5,-.2,.1].forEach(y=>{box(g,-.95,y-.38,.18,1.1,.055,.04,pale);box(g,.95,y-.38,.18,1.1,.055,.04,pale);});const coin=mesh(g,new THREE.CylinderGeometry(.36,.36,.14,48),gold,0,-1.22,.35);coin.rotation.x=Math.PI/2;}
else if(kind==='budgets'){card(g,0,0,3.4,2.25);[-1.1,-.35,.4].forEach((x,i)=>{box(g,x,.45,.15,.58,.09,.05,pale);box(g,x-.18,-.02,.2,[.5,.78,.95][i],.13,.05,[green,blue,gold][i]);box(g,x,-.5,.15,.95,.06,.04,pale);});ring(g,1.18,-.48,.32,.3,.09,green);}
else if(kind==='goals'){ring(g,0,0,0,1.05,.13,pale).rotation.z=-.4;ring(g,0,0,.08,.82,.15,green).rotation.z=.6;const t=mesh(g,new THREE.CylinderGeometry(.55,.55,.18,64),blue,0,0,.15);t.rotation.x=Math.PI/2;ring(g,0,0,.28,.28,.06,gold);[-1.5,1.5].forEach((x,i)=>mesh(g,new THREE.SphereGeometry(.16,24,16),i?green:gold,x,i?.85:-.85,.35));}
else if(kind==='bills'){card(g,0,0,2.8,2.5);box(g,0,.88,.15,2.8,.36,.08,blue);for(let r=0;r<3;r++)for(let c=0;c<5;c++)box(g,-.94+c*.47,.34-r*.55,.17,.23,.23,.06,r===1&&c===3?green:pale);const coin=mesh(g,new THREE.CylinderGeometry(.34,.34,.12,48),gold,1.65,-.95,.55);coin.rotation.x=.5;}
else if(kind==='reports'){card(g,0,0,3.35,2.2);[-1.1,-.7,-.3,.1,.5,.9].forEach((x,i)=>bar(g,x,[.42,.78,.62,1.12,.88,1.35][i],i===3?green:blue));ring(g,1.35,.72,.28,.31,.08,gold);box(g,0,-.92,.2,2.7,.055,.05,pale);}
else if(kind==='backup'){const shield=new THREE.Group();g.add(shield);const body=mesh(shield,new THREE.DodecahedronGeometry(1.05,1),blue,0,0,0);body.scale.set(.9,1.12,.28);ring(shield,0,0,.32,.7,.08,pale);mesh(shield,new THREE.BoxGeometry(.62,.48,.2),gold,0,-.05,.52);const lock=ring(shield,0,.3,.52,.23,.055,gold);lock.scale.y=1.15;[-1,1].forEach(x=>mesh(g,new THREE.SphereGeometry(.11,18,12),green,x*1.45,x*.35,.2));}
return g;}
const el=id=>document.getElementById(id),title=el('tourTitle'),label=el('tourLabel'),copy=el('tourCopy'),tip=el('tourTip'),count=el('tourCount'),progress=el('tourProgress'),play=el('tourPlay'),prev=el('tourPrev'),next=el('tourNext'),dots=[...tour.querySelectorAll('[data-tour-step]')];
function draw(){renderer.render(scene,camera);}
function show(i){current=(i+steps.length)%steps.length;if(active){root.remove(active);active.traverse(o=>{if(o.geometry)o.geometry.dispose();});}active=build(steps[current].kind);active.scale.setScalar(reduced?1:.78);active.rotation.y=-.28;started=performance.now();const s=steps[current];title.textContent=s.title;label.textContent=s.label;copy.textContent=s.copy;tip.textContent=s.tip;count.textContent=String(current+1).padStart(2,'0')+' / 08';progress.style.width=((current+1)/8*100)+'%';dots.forEach((d,n)=>{d.classList.toggle('active',n===current);d.setAttribute('aria-current',n===current?'step':'false');});draw();}
function stop(){if(raf){cancelAnimationFrame(raf);raf=0;}}
function start(){if(!raf&&visible&&!document.hidden&&playing)raf=requestAnimationFrame(animate);}
function setPlaying(v){playing=!!v&&!reduced;play.textContent=playing?'Ⅱ Pause tour':'▶ Play tour';play.setAttribute('aria-pressed',String(playing));if(playing)start();else stop();}
function animate(t){raf=0;if(!visible||document.hidden||!playing)return;if(t-last<32){raf=requestAnimationFrame(animate);return;}last=t;const elapsed=clock.getElapsedTime();if(active){const p=Math.min(1,(performance.now()-started)/700),ease=1-Math.pow(1-p,3);active.scale.setScalar(.78+.22*ease);active.rotation.y+=(tx-active.rotation.y)*.018;active.rotation.x+=(ty-active.rotation.x)*.018;active.position.y=Math.sin(elapsed*.8)*.07;}if(performance.now()-started>=duration)show(current+1);draw();raf=requestAnimationFrame(animate);}
function resize(){const r=host.getBoundingClientRect();if(!r.width||!r.height)return;camera.aspect=r.width/r.height;camera.updateProjectionMatrix();renderer.setSize(r.width,r.height,false);draw();}
document.getElementById('watchTour').addEventListener('click',()=>tour.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'}));
play.addEventListener('click',()=>setPlaying(!playing));next.addEventListener('click',()=>{show(current+1);start();});prev.addEventListener('click',()=>{show(current-1);start();});
dots.forEach(d=>d.addEventListener('click',()=>{show(Number(d.dataset.tourStep));start();}));
host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();tx=((e.clientX-r.left)/Math.max(1,r.width)-.5)*.22;ty=-((e.clientY-r.top)/Math.max(1,r.height)-.5)*.16;},{passive:true});host.addEventListener('pointerleave',()=>{tx=0;ty=0;},{passive:true});
if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){draw();start();}else stop();},{threshold:.08}).observe(tour);else visible=true;
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();});
if('ResizeObserver'in window)new ResizeObserver(resize).observe(host);else addEventListener('resize',resize,{passive:true});
show(0);resize();setPlaying(!reduced);if(reduced)play.textContent='Motion reduced · use Next to explore';
})();