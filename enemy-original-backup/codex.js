(() => {
  const entries=CADArt.entries,canvas=document.getElementById('art'),ctx=canvas.getContext('2d');
  const motion=document.getElementById('motion'),pause=document.getElementById('pause');
  const aliases={'jessie-detailed':'jessie-big',jessie:'jessie-mini','jessie-siege':'jessie-big','jane-detailed':'jane-big',jane:'jane-mini'};
  const motionNames={stand:'Stand',idle:'Ready',walk:'Walk',run:'Run',fire:'Fire', 'run-fire':'Run + fire',jump:'Jump','jump-fire':'Jump + fire',crouch:'Crouch',jab:'Jab',cross:'Cross','front-kick':'Front kick','round-kick':'Round kick',hurt:'Hit reaction'};
  const characterModel=item=>item.jane?CADJane:item.jessie?CADJessie:null;
  const characterSize=item=>item.jane||item.jessie;
  let current=entries[0],time=0,last=performance.now(),paused=false,facing=1,stripKey='';
  const groups=[...new Set(entries.map(e=>e.group))];

  function icon(canvas,group){const c=canvas.getContext('2d');c.fillStyle='#152435';c.fillRect(0,0,32,32);c.fillStyle=group==='Worlds'?'#8da9b7':group==='Characters'?'#d29b82':'#758fa5';if(group==='Worlds'){c.fillRect(5,12,8,16);c.fillRect(16,5,11,23);c.fillStyle='#b5c6c3';for(let y=8;y<25;y+=5)c.fillRect(18,y,6,2);}else if(group==='Tools'){c.fillRect(3,16,26,4);c.fillStyle='#78dfd1';c.fillRect(6,21,6,2);c.fillRect(21,21,5,2);}else if(group==='Weapons'){c.fillRect(5,12,23,6);c.fillRect(10,18,4,8);c.fillStyle='#78dfd1';c.fillRect(19,13,8,1);}else{c.fillRect(10,6,12,9);c.fillRect(7,16,18,10);c.fillStyle='#79d7d1';c.fillRect(12,9,8,2);c.fillRect(9,18,14,2);}}

  function select(item){
    current=item;time=0;facing=1;
    document.querySelectorAll('[data-asset]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.asset===item.id)));
    document.getElementById('assetName').textContent=item.name;
    document.getElementById('description').textContent=item.description;
    document.getElementById('groupLabel').textContent=item.group.toUpperCase();
    document.getElementById('studyNumber').textContent=`STUDY ${String(entries.indexOf(item)+1).padStart(2,'0')} / ${entries.length}`;
    const model=characterModel(item);
    const states=model?model.states:item.detailed?CADDetailedCharacters.states:item.group==='Characters'?['idle','run','jump','fire','punch','hurt']:item.group==='Worlds'?['ambient']:item.group==='Weapons'?['idle','fire']:item.group==='Tools'?['idle','run']:['idle','run','fire'];
    motion.replaceChildren(...states.map(state=>{
      const option=document.createElement('option');option.value=state;
      option.textContent=model?motionNames[state]:state==='idle'&&item.detailed?'Fighting stance':state==='run'&&item.group==='Tools'?'Boost':state.charAt(0).toUpperCase()+state.slice(1);
      return option;
    }));
    if(model)motion.value='run';else if(item.detailed)motion.value='walk';
    document.getElementById('walk-review').hidden=!item.detailed;
    document.getElementById('jessie-review').hidden=!model;
    if(model){const link=document.getElementById('character-workshop-link'),name=item.jane?'Jane':'Jessie';link.href=item.jane?'jane.html':'jessie.html';link.textContent=`Compare big + mini ${name} on one grid →`;}
    const colors=model?model.palette:item.detailed?CADDetailedCharacters.palettes[item.hero]:[];
    document.querySelector('.palette').replaceChildren(...colors.map(color=>{const chip=document.createElement('i');chip.style.setProperty('--swatch',color);chip.title=color;return chip;}));
    // Both character families share this presentation cell and zoom. The mini
    // keeps its native 48px source geometry inside the larger review canvas.
    canvas.width=item.group==='Worlds'?480:128;
    canvas.height=model?128:item.detailed?112:item.group==='Worlds'?270:80;
    canvas.setAttribute('aria-label',item.name+' animated pixel art');
    document.getElementById('turn').disabled=item.group==='Worlds';
    document.getElementById('sheet').hidden=!(model||item.detailed);
    resize();paint();history.replaceState(null,'','#'+item.id);
  }

  function category(group,preferred){
    document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===group)));
    const list=entries.filter(e=>e.group===group);
    document.getElementById('categoryName').textContent=group;
    document.getElementById('count').textContent=String(list.length).padStart(2,'0');
    const root=document.getElementById('entries');root.replaceChildren();
    for(const entry of list){
      const button=document.createElement('button');button.dataset.asset=entry.id;button.setAttribute('aria-pressed','false');
      const thumb=document.createElement('canvas');thumb.width=thumb.height=32;thumb.setAttribute('aria-hidden','true');icon(thumb,group);
      button.append(thumb,document.createTextNode(entry.name));button.onclick=()=>select(entry);root.append(button);
    }
    select(preferred||list[0]);
  }
  for(const group of groups){const button=document.createElement('button');button.dataset.category=group;button.textContent=group;button.setAttribute('aria-pressed','false');button.onclick=()=>category(group);document.getElementById('categories').append(button);}

  function resize(){
    const stage=document.getElementById('stage'),dpr=window.devicePixelRatio||1;
    const grid=CADPixelGrid.applyScene(canvas,{availableWidth:stage.clientWidth,maxScale:Math.max(1,Math.floor(3*dpr))});
    stage.style.overflowX=grid.overflowX?'auto':'hidden';
    stage.style.placeItems=grid.overflowX?'center start':'center';
    CADPixelGrid.alignScene(canvas);
    document.getElementById('pixel-metric').textContent=`1 ART PIXEL = ${grid.scale} DEVICE PIXEL${grid.scale===1?'':'S'}`;
    const nativeScale=Math.max(1,Math.round(dpr));
    for(const thumb of document.querySelectorAll('#entries canvas'))CADPixelGrid.applyScene(thumb,{scale:nativeScale});
    if(current.detailed){
      CADPixelGrid.applyScene(document.getElementById('native-art'),{scale:nativeScale});
      CADPixelGrid.applyScene(document.getElementById('pose-strip'),{scale:nativeScale});
    }
  }

  function paint(){
    ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=false;
    CADArt.draw(ctx,current,time,motion.value,facing);
    const model=characterModel(current);
    if(model){
      const frame=model.frameAt(motion.value,time),times=model.durations[motion.value];
      document.getElementById('jessie-frame-label').textContent=`POSE ${frame+1} / ${times.length} · ${times[frame]} ms`;
    }
    if(current.detailed){
      const native=document.getElementById('native-art').getContext('2d');native.clearRect(0,0,128,112);native.drawImage(canvas,0,0);
      const frame=CADDetailedCharacters.frameAt(motion.value,time);
      document.getElementById('frame-label').textContent=`FRAME ${frame+1} / 8 · ${Math.round(CADDetailedCharacters.timing[motion.value][frame]*1000)} ms`;
      const key=current.id+motion.value+facing;
      if(key!==stripKey){
        stripKey=key;
        const strip=document.getElementById('pose-strip').getContext('2d');strip.clearRect(0,0,1024,128);
        for(let f=0;f<8;f++){
          CADDetailedCharacters.draw(strip,current.hero,f*128+64,102,{state:motion.value,frame:f,facing});
          strip.fillStyle='#899498';strip.font='8px monospace';strip.fillText(motion.value==='walk'?['01 CONTACT','02 DOWN','03 PASS','04 SWING','05 CONTACT','06 DOWN','07 PASS','08 SWING'][f]:String(f+1).padStart(2,'0'),f*128+22,122);
        }
      }
    }
  }

  pause.onclick=()=>{paused=!paused;pause.textContent=paused?'Resume':'Pause';pause.setAttribute('aria-pressed',String(paused));};
  motion.onchange=()=>{time=0;paint();};
  document.getElementById('turn').onclick=()=>{facing*=-1;paint();};
  document.getElementById('step').onclick=()=>{
    paused=true;pause.textContent='Resume';pause.setAttribute('aria-pressed','true');
    const model=characterModel(current);
    if(model){
      const times=model.durations[motion.value],next=(model.frameAt(motion.value,time)+1)%times.length;
      time=times.slice(0,next).reduce((a,b)=>a+b,0)/1000+.00001;
    }else if(current.detailed){
      const times=CADDetailedCharacters.timing[motion.value],frame=CADDetailedCharacters.frameAt(motion.value,time);
      time=times.slice(0,(frame+1)%8).reduce((a,b)=>a+b,0)+.00001;
    }else time+=1/(motion.value==='run'&&current.group==='Characters'?14:8);
    paint();
  };
  document.getElementById('export').onclick=()=>{
    let source=canvas;
    const model=characterModel(current),size=characterSize(current);
    if(model){
      const spec=model.specs[size];source=document.createElement('canvas');source.width=spec.width;source.height=spec.height;
      model.draw(source.getContext('2d'),size,spec.anchor[0],spec.anchor[1],{state:motion.value,time,facing});
    }
    const a=document.createElement('a');a.download=current.id+'-'+motion.value+'.png';a.href=source.toDataURL();a.click();
  };
  document.getElementById('sheet').onclick=()=>{
    const model=characterModel(current);
    if(!(model||current.detailed))return;
    const a=document.createElement('a');a.download=current.id+'-sheet.png';
    a.href=(model?model.sheet(characterSize(current)):CADDetailedCharacters.sheet(current.hero)).toDataURL();a.click();
  };
  new ResizeObserver(resize).observe(document.getElementById('stage'));
  window.addEventListener('resize',resize);
  const fromHash=()=>{const hash=location.hash.slice(1);return entries.find(e=>e.id===(aliases[hash]||hash));};
  const initial=fromHash()||entries[0];category(initial.group,initial);
  window.addEventListener('hashchange',()=>{const item=fromHash();if(item)category(item.group,item);});
  function tick(now){if(!paused&&!document.hidden)time+=Math.min(.05,(now-last)/1000)*Number(document.getElementById('speed').value);last=now;paint();requestAnimationFrame(tick);}requestAnimationFrame(tick);
})();
