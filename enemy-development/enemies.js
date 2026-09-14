/* Shared enemy catalogue and canonical native sprite exports. */
(() => {
  'use strict';
  const entries=[
    {id:'sentinel',name:'Sentinel',group:'Mechs',role:'Patrol unit',description:'A narrow NEXUS patrol chassis with a single optic, articulated pistons and a forward cannon.',spanLabel:'32px standing height'},
    {id:'bastion',name:'Bastion',group:'Mechs',role:'Armored enforcer',description:'Broad plated armor, a riot shield and a shoulder rack. A heavy silhouette with deliberate attack preparation.',spanLabel:'32px standing height'},
    {id:'scrapper',name:'Scrapper',group:'Mechs',role:'Industrial hunter',description:'Reclaimed rusted armor, exposed machinery and a powered salvage claw from the lower city.',spanLabel:'32px standing height'},
    {id:'watcher',name:'Watcher',group:'Drones',role:'Surveillance drone',description:'An open twin-rotor truss, a magenta tracking optic and an underslung pulse cannon.',spanLabel:'32px neutral rotor span'},
    {id:'manta',name:'Manta',group:'Drones',role:'Aerial interceptor',description:'A swept armored wing, paired induction vents and a suspended forward emitter.',spanLabel:'32px neutral wing span'},
    {id:'collector',name:'Collector',group:'Drones',role:'Recovery drone',description:'A copper industrial hull, amber sensor and two articulated retrieval claws.',spanLabel:'32px neutral rotor span'}
  ];
  const specs={mini:{width:48,height:48,anchor:[20,40]}};
  const columns=12;
  const entry=id=>entries.find(e=>e.id===id)||entries[0];
  const model=id=>entry(id).group==='Drones'?CADEnemyDrones:CADEnemyMechs;
  const states=id=>model(id).states;
  const durations=id=>model(id).durations;
  const palette=id=>model(id).palettes[entry(id).id];
  const frameAt=(id,state,time)=>model(id).frameAt(state,time);
  const draw=(c,id,size,x,y,options)=>model(id).draw(c,entry(id).id,size,x,y,options);
  function sheet(id,size='mini') {
    const s=specs[size],rows=states(id),canvas=document.createElement('canvas');
    canvas.width=s.width*columns;canvas.height=s.height*rows.length;
    const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
    rows.forEach((state,row)=>{for(let f=0;f<columns;f++)draw(c,id,size,f*s.width+s.anchor[0],row*s.height+s.anchor[1],{state,frame:Math.min(f,durations(id)[state].length-1)});});
    return canvas;
  }
  function metadata(id) {
    const e=entry(id),m=model(id),timingMs=durations(id),rows=states(id),motion=m.metadata(e.id);
    return {id:e.id,name:e.name,group:e.group,sourcePixelWorldUnits:1,sizes:specs,
      palette:palette(id),columns,rows,timingMs,frameCounts:Object.fromEntries(rows.map(s=>[s,timingMs[s].length])),
      loops:motion.loops||Object.fromEntries(rows.map(s=>[s,['idle','walk','run','run-fire','patrol','rush'].includes(s)])),
      framePadding:'Repeat final authored pose to fill 12 columns',motion};
  }
  const cache={};
  function adapter(id) {
    id=entry(id).id;
    return cache[id]||(cache[id]={specs,states:states(id),durations:durations(id),palette:palette(id),columns,
      frameAt:(state,time)=>frameAt(id,state,time),draw:(c,size,x,y,o)=>draw(c,id,size,x,y,o),sheet:size=>sheet(id,size),metadata:()=>metadata(id)});
  }
  window.CADEnemies={entries,specs,columns,states,durations,palette,frameAt,draw,sheet,metadata,adapter};
})();
