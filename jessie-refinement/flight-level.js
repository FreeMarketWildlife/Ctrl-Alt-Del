(() => {
  function create({ctx,input,touch,audio,showMessage,hideMessage,controls,gameTitle,gameMeta,releaseInputs}){
    let p,shots,hostile,enemies,sparks,elapsed,nextWave,ended,bossSpawned,score,paused=false,auto=true;
    gameTitle.textContent='NIGHT CHASE';gameMeta.textContent='JESSIE // RECYKE TO SKYVIEW';
    controls.classList.add('flight-controls');controls.querySelector('[data-key="punch"]').textContent='SHIELD';controls.querySelector('.desktop-hint').textContent='WASD / ARROWS FLY · SPACE FIRE · E SHIELD';
    const assist=document.createElement('button');assist.className='flight-assist';assist.textContent='AUTO FIRE ON';controls.appendChild(assist);assist.onclick=()=>{auto=!auto;assist.textContent=`AUTO FIRE ${auto?'ON':'OFF'}`;};
    const pause=document.createElement('button');pause.className='flight-pause';pause.textContent='PAUSE';controls.appendChild(pause);pause.onclick=()=>{paused=!paused;releaseInputs();pause.textContent=paused?'RESUME':'PAUSE';};
    function start(){p={x:90,y:140,hp:100,inv:0,shot:0,shield:0,cooldown:0,bank:0};shots=[];hostile=[];enemies=[];sparks=[];elapsed=0;nextWave=2;ended=false;bossSpawned=false;score=0;paused=false;pause.textContent='PAUSE';hideMessage();releaseInputs();}
    function burst(x,y){for(let i=0;i<12;i++)sparks.push({x,y,vx:Math.cos(i*2.4)*50,vy:Math.sin(i*2.4)*50,life:.4+i%3*.1});}
    function damage(){if(p.inv>0||p.shield>0)return;p.hp=Math.max(0,p.hp-15);p.inv=1.1;burst(p.x,p.y);audio(110,.08);if(!p.hp){ended=true;showMessage('CAR DISABLED','The patrol caught up. Keep moving and use your shield.','RETRY CHASE',start);}}
    function update(dt){
      dt=Math.max(0,Math.min(.05,dt));if(ended||paused)return;elapsed+=dt;
      for(const key of ['inv','shot','shield','cooldown'])p[key]=Math.max(0,p[key]-dt);
      let dx=Math.abs(touch.x)>.12?touch.x:Number(input.has('right')||input.has('strafeRight'))-Number(input.has('left')||input.has('strafeLeft'));
      let dy=Math.abs(touch.y)>.12?touch.y:Number(input.has('down'))-Number(input.has('up'));const mag=Math.max(1,Math.hypot(dx,dy));
      p.x=Math.max(30,Math.min(435,p.x+dx/mag*145*dt));p.y=Math.max(48,Math.min(222,p.y+dy/mag*145*dt));p.bank=dy*2;
      if(input.has('punch')&&!p.cooldown){p.shield=2.2;p.cooldown=7;audio(360,.15,'sine');}
      if((auto||input.has('fire'))&&!p.shot){p.shot=.15;shots.push({x:p.x+26,y:p.y});audio(680,.025,'square',.008);}
      if(elapsed>=nextWave&&elapsed<40){nextWave+=2.8;const n=Math.floor(elapsed/2.8);for(let i=0;i<2;i++)enemies.push({x:495+i*42,y:65+(n*43+i*73)%145,hp:3,kind:n%2?'drone':'interceptor',shot:1.3+i*.4,phase:n+i});}
      if(elapsed>=42&&!bossSpawned){bossSpawned=true;enemies.push({x:510,y:132,hp:65,kind:'boss',shot:1,phase:0});}
      for(const e of enemies){e.x-=dt*(e.kind==='boss'?(e.x>397?48:0):51);e.y+=Math.sin(elapsed*2+e.phase)*dt*(e.kind==='boss'?28:19);e.shot-=dt;if(e.shot<=0&&e.x<475){e.shot=e.kind==='boss'?.9:2.6;const angle=Math.atan2(p.y-e.y,p.x-e.x);for(const offset of e.kind==='boss'?[-.18,0,.18]:[0])hostile.push({x:e.x-16,y:e.y,vx:Math.cos(angle+offset)*103,vy:Math.sin(angle+offset)*103});}
        if(Math.abs(e.x-p.x)<(e.kind==='boss'?35:19)&&Math.abs(e.y-p.y)<(e.kind==='boss'?28:12))damage();}
      for(const s of shots){s.x+=320*dt;const e=enemies.find(e=>e.hp>0&&Math.abs(s.x-e.x)<(e.kind==='boss'?32:19)&&Math.abs(s.y-e.y)<(e.kind==='boss'?28:15));if(e){s.x=999;e.hp--;if(!e.hp){score++;burst(e.x,e.y);if(e.kind==='boss'){ended=true;showMessage('SKYVIEW REACHED','Jessie broke through the aerial blockade. Night chase complete.','FLY AGAIN',start);}}}}
      for(const s of hostile){s.x+=s.vx*dt;s.y+=s.vy*dt;if(Math.abs(s.x-p.x)<8&&Math.abs(s.y-p.y)<6){damage();s.x=-999;}}
      for(const s of sparks){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;}
      shots=shots.filter(s=>s.x<500);hostile=hostile.filter(s=>s.x>-20&&s.x<510&&s.y>-20&&s.y<290);enemies=enemies.filter(e=>e.hp>0&&e.x>-45);sparks=sparks.filter(s=>s.life>0);
    }
    function draw(){CADFlightArt.city(ctx,elapsed);for(const e of enemies)CADFlightArt.enemy(ctx,e.x,e.y,elapsed,e.kind);ctx.fillStyle='#c1ffdc';for(const s of shots)ctx.fillRect(s.x|0,s.y|0,10,2);ctx.fillStyle='#ff9586';for(const s of hostile){ctx.fillRect(s.x|0,s.y|0,5,4);ctx.fillStyle='#ffe3ad';ctx.fillRect((s.x+1)|0,(s.y+1)|0,2,2);ctx.fillStyle='#ff9586';}
      if(!p.inv||Math.floor(elapsed*18)%2)CADFlightArt.car(ctx,p.x,p.y,elapsed,p.bank);if(p.shield){ctx.strokeStyle='#71fff0';ctx.beginPath();ctx.ellipse(p.x,p.y,32,21,0,0,Math.PI*2);ctx.stroke();}for(const s of sparks){ctx.fillStyle=s.life>.25?'#ffc28b':'#ce6989';ctx.fillRect(s.x|0,s.y|0,3,3);}
      ctx.fillStyle='#091526';ctx.fillRect(7,7,466,25);ctx.font='7px monospace';ctx.fillStyle='#b8d2d1';ctx.fillText('JESSIE',13,17);ctx.fillText(p.cooldown?`SHIELD ${Math.ceil(p.cooldown)}s`:'SHIELD READY',144,18);ctx.fillText(elapsed<42?'RECYKE  →  SKYVIEW':'BREAK THE BLOCKADE',280,18);ctx.fillStyle='#273d4b';ctx.fillRect(13,22,100,3);ctx.fillStyle='#66e9d5';ctx.fillRect(13,22,p.hp,3);ctx.fillRect(280,23,180*Math.min(1,elapsed/42),2);const boss=enemies.find(e=>e.kind==='boss');if(boss){ctx.fillStyle='#ed7996';ctx.fillRect(350,36,120*boss.hp/65,3);}if(elapsed<5){ctx.fillStyle='#d1dfd5';ctx.fillText('KEEP MOVING. YOUR CAR FIRES AUTOMATICALLY.',95,253);}if(paused){ctx.fillStyle='#091526cc';ctx.fillRect(0,0,480,270);ctx.fillStyle='#c1ffdc';ctx.font='16px monospace';ctx.fillText('PAUSED',211,135);}}
    return {start,update,draw,stop(){controls.classList.remove('flight-controls');},snapshot:()=>({p:{...p},elapsed,ended,bossSpawned,score,enemies:enemies.map(e=>({...e})),shots:shots.map(s=>({...s}))})};
  }
  window.CADFlightLevel={create};
})();
