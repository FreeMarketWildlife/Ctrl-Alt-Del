/* All machines, heroes and scenery share this one native world-pixel canvas. */
(() => {
  const canvas=document.getElementById('comparison'),ctx=canvas.getContext('2d');
  const enemy=document.getElementById('enemy'),motion=document.getElementById('motion'),compare=document.getElementById('compare-hero'),silhouette=document.getElementById('silhouette'),background=document.getElementById('background'),pause=document.getElementById('pause'),speed=document.getElementById('speed');
  const names={idle:'Ready',walk:'Walk',run:'Run',charge:'Charge',fire:'Fire','run-fire':'Run + fire',melee:'Melee',jump:'Jump',hurt:'Hit reaction',death:'Destruction',patrol:'Patrol',rush:'Rush'};
  let current=CADEnemies.entries[0],time=0,last=performance.now(),paused=false,facing=1,stripKey='';
  const layer=document.createElement('canvas');layer.width=canvas.width;layer.height=canvas.height;const actors=layer.getContext('2d');
  const light=()=>background.value==='light';
  const movement=()=>CADEnemies.states(current.id).includes('run')?'run':'patrol';
  for(const entry of CADEnemies.entries){const option=document.createElement('option');option.value=entry.id;option.textContent=entry.name;enemy.append(option);}
  function toSilhouette(c){if(!silhouette.checked)return;c.save();c.globalCompositeOperation='source-in';c.fillStyle=light()?'#242c31':'#e9e6d2';c.fillRect(0,0,c.canvas.width,c.canvas.height);c.restore();}
  function resize(){
    const dpr=devicePixelRatio||1,fit=CADPixelGrid.applyScene(canvas,{availableWidth:canvas.parentElement.clientWidth,maxScale:Math.max(1,Math.round(2*dpr))});
    document.getElementById('grid-info').textContent=`1 art pixel = ${fit.scale} device pixel${fit.scale===1?'':'s'}`;
    for(const id of ['big-strip','mini-strip','move-big-strip','move-mini-strip'])CADPixelGrid.applyScene(document.getElementById(id),{scale:Math.max(1,Math.round(dpr))});
  }
  function drawStrip(id,size,state){
    const cv=document.getElementById(id),c=cv.getContext('2d'),spec=CADEnemies.specs[size],timing=CADEnemies.durations(current.id)[state];
    cv.width=spec.width*timing.length;cv.height=spec.height+18;c.imageSmoothingEnabled=false;
    let ms=0;for(let frame=0;frame<timing.length;frame++){CADEnemies.draw(c,current.id,size,frame*spec.width+spec.anchor[0],spec.anchor[1],{state,frame,time:ms/1000,facing});ms+=timing[frame];}
    toSilhouette(c);c.fillStyle=light()?'#4e5d57':'#a8b6aa';c.font='8px monospace';
    for(let frame=0;frame<timing.length;frame++)c.fillText(`${String(frame+1).padStart(2,'0')} ${timing[frame]}ms`,frame*spec.width+3,spec.height+12);
    cv.parentElement.dataset.background=background.value;
  }
  function strips(){
    const key=`${current.id}/${motion.value}/${facing}/${silhouette.checked}/${background.value}`;if(stripKey===key)return;stripKey=key;
    for(const size of ['big','mini']){drawStrip(size+'-strip',size,motion.value);drawStrip('move-'+size+'-strip',size,movement());}
    const durations=CADEnemies.durations(current.id);
    document.getElementById('strip-info').textContent=`${durations[motion.value].length} POSES / ${names[motion.value].toUpperCase()} / SCROLL TO INSPECT`;
    document.getElementById('locomotion-info').textContent=`FULL ${durations[movement()].length}-POSE ${names[movement()].toUpperCase()} / BOTH NATIVE SIZES`;
    resize();
  }
  function scenery(){
    const l=light(),r=(color,x,y,w,h)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
    r(l?'#d8d8cc':'#252e38',0,0,480,208);
    for(let x=0;x<480;x+=16)r(l?'#cacdc2':'#2c3742',x,0,1,170);
    for(let y=10;y<170;y+=16)r(l?'#cacdc2':'#2c3742',0,y,480,1);
    // The doorway has 112 clear world pixels; the crate occupies 32 × 32.
    r(l?'#8b9590':'#46525b',18,54,52,116);r(l?'#a3ada2':'#6a716e',18,54,52,3);r(l?'#b6c0b4':'#303d47',22,58,44,112);r(l?'#9aa69a':'#46514f',23,58,42,2);r(l?'#a0aa97':'#4d5b4c',44,60,1,110);r(l?'#626e64':'#92987e',56,115,3,7);r(l?'#a69875':'#c0a478',31,46,26,3);
    r(l?'#777d6e':'#54594f',438,138,32,32);r(l?'#b5b59d':'#858874',439,139,30,2);r(l?'#949980':'#5b6354',441,143,26,24);r(l?'#c0c0a1':'#949876',441,143,3,24);r(l?'#777f65':'#363f37',450,143,4,24);r(l?'#a3a386':'#78826b',458,151,7,2);
    r(l?'#8e998b':'#63716a',0,170,480,1);r(l?'#b3bbae':'#1c252d',0,171,480,37);for(let x=0;x<480;x+=32)r(l?'#a9b3a5':'#29373d',x,172,1,36);
  }
  function captions(){
    const group=current.group==='Drones'?'neutral span':'standing height',hero=compare.value,comparing=hero!=='none',captions=document.getElementById('size-captions');
    captions.classList.toggle('compare',comparing);captions.replaceChildren();
    const lines=comparing?[[`${current.name.toUpperCase()} / BIG + MINI`,`96px + 32px ${group}`],[`${hero.toUpperCase()} / BIG + MINI`,'96px + 32px standing height']]:[[`BIG ${current.name.toUpperCase()}`,`96px ${group} / 128 × 128 cell`],[`MINI ${current.name.toUpperCase()}`,`32px ${group} / 48 × 48 cell`]];
    for(const [title,detail] of lines){const span=document.createElement('span'),strong=document.createElement('strong');strong.textContent=title;span.append(strong,document.createTextNode(detail));captions.append(span);}
    canvas.setAttribute('aria-label',`${current.name}, big and mini${comparing?' beside '+hero:''}, animated on the same pixel grid`);
  }
  function jumpLift(durations,size,state){
    if(state!=='jump')return 0;
    const times=durations[state],total=times.reduce((a,b)=>a+b,0),airtime=times.slice(0,4).reduce((a,b)=>a+b,0),ms=time*1000%total;
    return ms<airtime?Math.round(Math.sin(Math.PI*ms/airtime)*(size==='big'?32:12)):0;
  }
  function paint(){
    const state=motion.value;scenery();actors.clearRect(0,0,480,208);
    const comparing=compare.value!=='none',positions=comparing?[126,210]:[166,326];
    CADEnemies.draw(actors,current.id,'big',positions[0],170-jumpLift(CADEnemies.durations(current.id),'big',state),{state,time,facing});CADEnemies.draw(actors,current.id,'mini',positions[1],170-jumpLift(CADEnemies.durations(current.id),'mini',state),{state,time,facing});
    if(comparing){const hero=compare.value==='jane'?CADJane:CADJessie,heroState=hero.states.includes(state)?state:state==='rush'?'run':state==='patrol'?'walk':'idle';hero.draw(actors,'big',330,170-jumpLift(hero.durations,'big',heroState),{state:heroState,time,facing});hero.draw(actors,'mini',410,170-jumpLift(hero.durations,'mini',heroState),{state:heroState,time,facing});}
    toSilhouette(actors);ctx.drawImage(layer,0,0);
    const frame=CADEnemies.frameAt(current.id,state,time),timing=CADEnemies.durations(current.id)[state];document.getElementById('frame-info').textContent=`${names[state].toUpperCase()} / ${frame+1} OF ${timing.length} / ${timing[frame]} ms`;strips();
  }
  function choose(id){
    current=CADEnemies.entries.find(entry=>entry.id===id)||CADEnemies.entries[0];enemy.value=current.id;time=0;
    const states=CADEnemies.states(current.id);motion.replaceChildren(...states.map(state=>{const option=document.createElement('option');option.value=state;option.textContent=names[state]||state;return option;}));motion.value=movement();
    document.getElementById('enemy-name').textContent=current.name;document.getElementById('enemy-group').textContent=current.group==='Drones'?'AERIAL MACHINE':'GROUND CHASSIS';document.getElementById('enemy-description').textContent=current.description;
    document.getElementById('enemy-measure').textContent=current.group==='Drones'?'96px / 32px neutral span':'96px / 32px standing height';
    const durations=CADEnemies.durations(current.id),poses=Object.values(durations).reduce((sum,frames)=>sum+frames.length,0);document.getElementById('enemy-actions').textContent=`${states.length} actions · ${poses} poses per size`;
    document.getElementById('enemy-palette').replaceChildren(...CADEnemies.palette(current.id).map(color=>{const chip=document.createElement('i');chip.style.setProperty('--swatch',color);chip.title=color;return chip;}));
    captions();paint();history.replaceState(null,'','#'+current.id);
  }
  function setPaused(value){paused=value;pause.textContent=value?'Resume':'Pause';pause.setAttribute('aria-pressed',String(value));}
  pause.onclick=()=>setPaused(!paused);enemy.onchange=()=>choose(enemy.value);motion.onchange=()=>{time=0;paint();};
  document.getElementById('step').onclick=()=>{setPaused(true);const timing=CADEnemies.durations(current.id)[motion.value],next=(CADEnemies.frameAt(current.id,motion.value,time)+1)%timing.length;time=timing.slice(0,next).reduce((a,b)=>a+b,0)/1000+.000001;paint();};
  document.getElementById('face').onclick=()=>{facing*=-1;paint();};silhouette.onchange=paint;background.onchange=paint;compare.onchange=()=>{captions();paint();};
  function review(state){motion.value=state;time=0;speed.value='.5';setPaused(false);paint();canvas.scrollIntoView({behavior:'smooth',block:'center'});}
  document.getElementById('review-slow').onclick=()=>review(movement());document.querySelectorAll('[data-review]').forEach(button=>button.onclick=()=>review(button.dataset.review));
  document.querySelectorAll('[data-export]').forEach(button=>button.onclick=()=>{const a=document.createElement('a');a.download=`${current.id}-${button.dataset.export}.png`;a.href=CADEnemies.sheet(current.id,button.dataset.export).toDataURL();a.click();});
  document.getElementById('metadata').onclick=()=>{const data=CADEnemies.metadata(current.id),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=current.id+'-animation.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  new ResizeObserver(resize).observe(canvas.parentElement);window.addEventListener('resize',resize);window.addEventListener('hashchange',()=>choose(location.hash.slice(1)));choose(location.hash.slice(1));
  function tick(now){if(!paused&&!document.hidden)time+=Math.max(0,Math.min(.05,(now-last)/1000))*Number(speed.value);last=now;paint();requestAnimationFrame(tick);}requestAnimationFrame(tick);
})();
