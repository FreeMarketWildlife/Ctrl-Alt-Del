/* Jane's native-size workshop. Every sprite is drawn 1:1 before scene zoom. */
(() => {
  const canvas=document.getElementById('comparison'),ctx=canvas.getContext('2d');
  const motion=document.getElementById('motion'),silhouette=document.getElementById('silhouette'),compare=document.getElementById('compare-jessie'),background=document.getElementById('background'),pause=document.getElementById('pause'),speed=document.getElementById('speed');
  const names={stand:'Stand',idle:'Ready',walk:'Walk',run:'Run',fire:'Fire','run-fire':'Run + fire',jump:'Jump','jump-fire':'Jump + fire',crouch:'Crouch',jab:'Jab',cross:'Cross','front-kick':'Front kick','round-kick':'Round kick',hurt:'Hit reaction'};
  let time=0,last=performance.now(),paused=false,facing=1,stripKey='',runKey='';
  const actorLayer=document.createElement('canvas');actorLayer.width=canvas.width;actorLayer.height=canvas.height;const actors=actorLayer.getContext('2d');
  for(const state of CADJane.states){const option=document.createElement('option');option.value=state;option.textContent=names[state]||state;motion.append(option);}motion.value='run';
  const light=()=>background.value==='light';
  function toSilhouette(c){if(!silhouette.checked)return;c.save();c.globalCompositeOperation='source-in';c.fillStyle=light()?'#242131':'#eee2d6';c.fillRect(0,0,c.canvas.width,c.canvas.height);c.restore();}
  function resize(){
    const dpr=devicePixelRatio||1,fit=CADPixelGrid.applyScene(canvas,{availableWidth:canvas.parentElement.clientWidth,maxScale:Math.max(1,Math.round(2*dpr))});
    document.getElementById('grid-info').textContent=`1 art pixel = ${fit.scale} device pixel${fit.scale===1?'':'s'}`;
    for(const id of ['big-strip','mini-strip','run-big-strip','run-mini-strip'])CADPixelGrid.applyScene(document.getElementById(id),{scale:Math.max(1,Math.round(dpr))});
  }
  function drawStrip(id,size,state){
    const cv=document.getElementById(id),c=cv.getContext('2d'),spec=CADJane.specs[size],timing=CADJane.durations[state];
    cv.width=spec.width*timing.length;cv.height=spec.height+18;c.imageSmoothingEnabled=false;
    let ms=0;for(let frame=0;frame<timing.length;frame++){CADJane.draw(c,size,frame*spec.width+spec.anchor[0],spec.anchor[1],{state,frame,time:ms/1000,facing});ms+=timing[frame];}
    toSilhouette(c);c.fillStyle=light()?'#554c61':'#b2a0b9';c.font='8px monospace';
    for(let frame=0;frame<timing.length;frame++)c.fillText(`${String(frame+1).padStart(2,'0')} ${timing[frame]}ms`,frame*spec.width+3,spec.height+12);
    cv.parentElement.dataset.background=background.value;
  }
  function strips(){
    const common=`${facing}/${silhouette.checked}/${background.value}`,next=`${motion.value}/${common}`;
    let changed=false;
    if(stripKey!==next){stripKey=next;for(const size of ['big','mini'])drawStrip(size+'-strip',size,motion.value);document.getElementById('strip-info').textContent=`${CADJane.durations[motion.value].length} POSES / ${names[motion.value].toUpperCase()} / SCROLL TO INSPECT`;changed=true;}
    if(runKey!==common){runKey=common;for(const size of ['big','mini'])drawStrip('run-'+size+'-strip',size,'run');changed=true;}
    if(changed)resize();
  }
  function scenery(){
    const l=light(),r=(color,x,y,w,h)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
    r(l?'#d8d2ca':'#252a36',0,0,480,208);
    for(let x=0;x<480;x+=16)r(l?'#cbc5c2':'#2c3240',x,0,1,170);
    for(let y=10;y<170;y+=16)r(l?'#cbc5c2':'#2c3240',0,y,480,1);
    // Original 112px clear doorway (58..169) and 32px crate on the same grid.
    r(l?'#8e8a90':'#444451',18,54,52,116);r(l?'#aaa3a4':'#60606a',18,54,52,3);r(l?'#bbb3b1':'#303441',22,58,44,112);r(l?'#999295':'#424453',23,58,42,2);r(l?'#a3969f':'#4f435a',44,60,1,110);r(l?'#6a646e':'#85808a',56,115,3,7);r(l?'#978894':'#b98da7',31,46,26,3);
    r(l?'#77717c':'#4d4a59',438,138,32,32);r(l?'#b9a6ae':'#807080',439,139,30,2);r(l?'#9b8897':'#544958',441,143,26,24);r(l?'#c1b1b3':'#927887',441,143,3,24);r(l?'#776b7e':'#362f40',450,143,4,24);r(l?'#a1909d':'#756071',458,151,7,2);
    r(l?'#938b92':'#60606a',0,170,480,1);r(l?'#bbb4b2':'#1c222c',0,171,480,37);
    for(let x=0;x<480;x+=32)r(l?'#b1aaa9':'#29303b',x,172,1,36);
  }
  function jumpLift(model,size,state){if(!state.startsWith('jump'))return 0;const timing=model.durations[state],total=timing.reduce((a,b)=>a+b,0),airtime=timing.slice(0,4).reduce((a,b)=>a+b,0),ms=time*1000%total;return ms<airtime?Math.round(Math.sin(Math.PI*ms/airtime)*(size==='big'?32:12)):0;}
  function paint(){
    const state=motion.value;scenery();actors.clearRect(0,0,480,208);
    const positions=compare.checked?[126,205]:[166,320];
    CADJane.draw(actors,'big',positions[0],170-jumpLift(CADJane,'big',state),{state,time,facing});CADJane.draw(actors,'mini',positions[1],170-jumpLift(CADJane,'mini',state),{state,time,facing});
    if(compare.checked){const jessieState=CADJessie.states.includes(state)?state:'idle';CADJessie.draw(actors,'big',326,170-jumpLift(CADJessie,'big',jessieState),{state:jessieState,time,facing});CADJessie.draw(actors,'mini',402,170-jumpLift(CADJessie,'mini',jessieState),{state:jessieState,time,facing});}
    toSilhouette(actors);ctx.drawImage(actorLayer,0,0);
    const frame=CADJane.frameAt(state,time),timing=CADJane.durations[state];document.getElementById('frame-info').textContent=`${names[state].toUpperCase()} / ${frame+1} OF ${timing.length} / ${timing[frame]} ms`;
    strips();
  }
  function setPaused(value){paused=value;pause.textContent=value?'Resume':'Pause';pause.setAttribute('aria-pressed',String(value));}
  pause.onclick=()=>setPaused(!paused);
  motion.onchange=()=>{time=0;paint();};
  document.getElementById('step').onclick=()=>{setPaused(true);const timing=CADJane.durations[motion.value],next=(CADJane.frameAt(motion.value,time)+1)%timing.length;time=timing.slice(0,next).reduce((a,b)=>a+b,0)/1000+.000001;paint();};
  document.getElementById('face').onclick=()=>{facing*=-1;paint();};
  silhouette.onchange=paint;background.onchange=paint;
  compare.onchange=()=>{const captions=document.getElementById('size-captions');captions.classList.toggle('compare',compare.checked);captions.innerHTML=compare.checked?'<span><strong>JANE / BIG + MINI</strong>96px + 32px standing height</span><span><strong>JESSIE / BIG + MINI</strong>96px + 32px standing height</span>':'<span><strong>BIG JANE</strong>96px tall / 128 × 128 native cell</span><span><strong>MINI JANE</strong>32px tall / 48 × 48 native cell</span>';document.getElementById('comparison-note').textContent=compare.checked?'Jane and approved Jessie share one pixel grid. Jessie holds his ready pose for Jane’s additional attacks and standing study.':'112px clear doorway. 32px square crate. Everything shares one native grid.';canvas.setAttribute('aria-label',compare.checked?'Jane and Jessie, big and mini, animated together at the same pixel size':'Big and mini Jane animated together at the same pixel size');paint();};
  document.getElementById('review-run').onclick=()=>{motion.value='run';time=0;speed.value='.5';setPaused(false);paint();canvas.scrollIntoView({behavior:'smooth',block:'center'});};
  document.querySelectorAll('[data-export]').forEach(button=>button.onclick=()=>{const a=document.createElement('a');a.download=`jane-${button.dataset.export}.png`;a.href=CADJane.sheet(button.dataset.export).toDataURL();a.click();});
  document.getElementById('metadata').onclick=()=>{
    const data=CADJane.metadata();
    const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='jane-animation.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  new ResizeObserver(resize).observe(canvas.parentElement);window.addEventListener('resize',resize);resize();
  function tick(now){if(!paused&&!document.hidden)time+=Math.max(0,Math.min(.05,(now-last)/1000))*Number(speed.value);last=now;paint();requestAnimationFrame(tick);}requestAnimationFrame(tick);
})();
