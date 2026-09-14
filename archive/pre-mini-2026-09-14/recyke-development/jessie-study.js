(() => {
  const canvas=document.getElementById('comparison'),ctx=canvas.getContext('2d'),shoot=document.getElementById('shoot'),silhouette=document.getElementById('silhouette');let base='idle',time=0,last=performance.now(),paused=false,facing=1,key='';
  const actorLayer=document.createElement('canvas');actorLayer.width=canvas.width;actorLayer.height=canvas.height;const actors=actorLayer.getContext('2d');
  function showSilhouette(c){if(!silhouette.checked)return;c.save();c.globalCompositeOperation='source-in';c.fillStyle='#e9e1c6';c.fillRect(0,0,c.canvas.width,c.canvas.height);c.restore();}
  const effective=()=>shoot.checked&&['idle','run','jump'].includes(base)?({idle:'fire',run:'run-fire',jump:'jump-fire'}[base]):base;
  function resize(){const fit=CADPixelGrid.applyScene(canvas,{availableWidth:canvas.parentElement.clientWidth,maxScale:Math.max(1,Math.round(2*(devicePixelRatio||1)))});document.getElementById('grid-info').textContent=`1 art pixel = ${fit.scale} device pixels`;for(const id of ['big-strip','mini-strip'])CADPixelGrid.applyScene(document.getElementById(id),{scale:Math.max(1,Math.round(devicePixelRatio||1))});}
  function strips(state){
    const next=state+facing+silhouette.checked;if(next===key)return;key=next;
    const timing=CADJessie.durations[state];
    for(const size of ['big','mini']){
      const cv=document.getElementById(size+'-strip'),c=cv.getContext('2d'),s=CADJessie.specs[size];
      cv.width=s.width*timing.length;cv.height=s.height+16;c.imageSmoothingEnabled=false;
      let ms=0;for(let f=0;f<timing.length;f++){CADJessie.draw(c,size,f*s.width+s.anchor[0],s.anchor[1],{state,frame:f,time:ms/1000,facing});ms+=timing[f];}
      showSilhouette(c);c.fillStyle='#8ca6a3';c.font='8px monospace';
      for(let f=0;f<timing.length;f++)c.fillText(String(f+1).padStart(2,'0')+(size==='big'?` · ${timing[f]} ms`:''),f*s.width+6,s.height+11);
    }
    resize();
  }
  function jumpLift(size,state){if(!state.startsWith('jump'))return 0;const timing=CADJessie.durations[state],total=timing.reduce((a,b)=>a+b,0),airtime=timing.slice(0,4).reduce((a,b)=>a+b,0),ms=(time*1000)%total;return ms<airtime?Math.round(Math.sin(Math.PI*ms/airtime)*(size==='big'?32:12)):0;}
  function paint(){const state=effective();ctx.fillStyle='#222e36';ctx.fillRect(0,0,480,192);ctx.fillStyle='#293a43';for(let x=0;x<480;x+=16)ctx.fillRect(x,0,1,160);for(let y=0;y<160;y+=16)ctx.fillRect(0,y,480,1);ctx.fillStyle='#41545c';ctx.fillRect(0,160,480,1);ctx.fillStyle='#17232b';ctx.fillRect(0,161,480,31);actors.clearRect(0,0,actorLayer.width,actorLayer.height);CADJessie.draw(actors,'big',175,160-jumpLift('big',state),{state,time,facing});CADJessie.draw(actors,'mini',335,160-jumpLift('mini',state),{state,time,facing});showSilhouette(actors);ctx.drawImage(actorLayer,0,0);const frame=CADJessie.frameAt(state,time);document.getElementById('frame-info').textContent=`${state.toUpperCase()} / ${frame+1} OF ${CADJessie.durations[state].length}`;strips(state);}
  const pause=document.getElementById('pause');pause.onclick=()=>{paused=!paused;pause.textContent=paused?'Resume':'Pause';pause.setAttribute('aria-pressed',String(paused));};document.querySelectorAll('[data-motion]').forEach(b=>b.onclick=()=>{base=b.dataset.motion;time=0;document.querySelectorAll('[data-motion]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));shoot.disabled=!['idle','run','jump'].includes(base);paint();});shoot.onchange=()=>{time=0;paint();};document.getElementById('step').onclick=()=>{paused=true;pause.textContent='Resume';pause.setAttribute('aria-pressed','true');const s=effective(),a=CADJessie.durations[s],f=CADJessie.frameAt(s,time);time=a.slice(0,(f+1)%a.length).reduce((x,y)=>x+y,0)/1000+.000001;paint();};document.getElementById('face').onclick=()=>{facing*=-1;paint();};
  silhouette.onchange=paint;
  document.querySelectorAll('[data-export]').forEach(b=>b.onclick=()=>{const a=document.createElement('a');a.download=`jessie-${b.dataset.export}.png`;a.href=CADJessie.sheet(b.dataset.export).toDataURL();a.click();});document.getElementById('metadata').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({palette:CADJessie.palette,sizes:CADJessie.specs,columns:CADJessie.columns,rows:CADJessie.states,timingMs:CADJessie.durations},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='jessie-animation.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  new ResizeObserver(resize).observe(canvas.parentElement);window.addEventListener('resize',resize);resize();function tick(now){if(!paused&&!document.hidden)time+=Math.max(0,Math.min(.05,(now-last)/1000))*Number(document.getElementById('speed').value);last=now;paint();requestAnimationFrame(tick);}requestAnimationFrame(tick);
})();
