/* Directed Skyview run-and-gun. All geometry uses native world pixels. */
(() => {
  const WIDTH=2880, EXIT=2780;
  const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  const lootRoll=(random=Math.random)=>({health:random()<.10,power:random()<.05});
  window.CADLevelOne={lootRoll,create({ctx,input,touch,audio,showMessage,hideMessage,controls,gameTitle,gameMeta,releaseInputs,random=Math.random}){
    gameTitle.textContent='CHAPTER 01 // ESCAPE SKYVIEW';
    controls.classList.add('campaign-controls');
    const assist=document.createElement('button');assist.className='assist-button';assist.textContent='AUTO FIRE: OFF';assist.setAttribute('aria-pressed','false');controls.appendChild(assist);
    let autoFire=false;assist.onclick=()=>{autoFire=!autoFire;assist.textContent=`AUTO FIRE: ${autoFire?'ON':'OFF'}`;assist.setAttribute('aria-pressed',String(autoFire));};
    const pause=document.createElement('button');pause.className='pause-button';pause.textContent='PAUSE';pause.setAttribute('aria-pressed','false');controls.appendChild(pause);
    let paused=false;pause.onclick=()=>{paused=!paused;releaseInputs();pause.textContent=paused?'RESUME':'PAUSE';pause.setAttribute('aria-pressed',String(paused));};
    let p,enemies,shots,hostile,drops,orbs,particles,time,camera,won,dead,kills,checkpoint,notice,noticeTime,jumpHeld,jumpBuffer,coyote,punchHeld;
    const decks=[{x:0,y:234,w:WIDTH,h:36}];
    for(let zone=0;zone<6;zone++){const x=zone*480;decks.push({x:x+150,y:200,w:88,h:8},{x:x+260,y:169,w:96,h:8},{x:x+385,y:200,w:64,h:8});}
    function say(text){notice=text;noticeTime=3;}
    function reset(atCheckpoint=false){
      checkpoint=atCheckpoint?checkpoint:0;time=0;camera=0;won=false;dead=false;paused=false;pause.textContent='PAUSE';pause.setAttribute('aria-pressed','false');kills=0;jumpHeld=false;punchHeld=false;jumpBuffer=0;coyote=0;
      p={x:checkpoint||45,y:199,w:10,h:35,vx:0,vy:0,ground:true,hp:100,character:'jessie',inv:1,fire:0,punch:0,run:0,power:0,powerType:''};
      enemies=[];for(let i=0;i<18;i++){const x=340+i*128;if(x<checkpoint-30)continue;const kind=i%5===4?'mech':i%4===2?'drone':'walker';enemies.push({x,y:kind==='drone'?184:kind==='mech'?195:210,w:kind==='mech'?27:14,h:kind==='drone'?12:kind==='mech'?39:24,kind,hp:kind==='mech'?7:2,fire:1+(i%3)*.4,home:x,phase:i,flash:0});}
      enemies.push({x:2660,y:195,w:27,h:39,kind:'mech',hp:16,fire:1.4,home:2660,phase:0,flash:0,boss:true});
      shots=[];hostile=[];drops=[];particles=[];orbs=[220,1020,1650,2360].map(x=>({x,y:216,w:18,h:18,cooldown:0,inside:false}));
      releaseInputs();hideMessage();say(checkpoint?'CHECKPOINT // BACK IN THE FIGHT':'REACH EXTRACTION // MOVE RIGHT');
    }
    function burst(x,y,color){for(let i=0;i<10;i++)particles.push({x,y,vx:(random()-.5)*70,vy:-random()*60,life:.5,color});}
    function defeat(e){if(e.dead)return;e.dead=true;kills++;burst(e.x,e.y,'#ffb84a');audio(850,.06);const roll=lootRoll(random);if(roll.health)drops.push({x:e.x,y:e.y,w:12,h:12,vy:-55,kind:'health'});if(roll.power)drops.push({x:e.x+14,y:e.y,w:12,h:12,vy:-65,kind:random()<.5?'overdrive':'shield'});}
    function damage(n){if(p.inv>0||dead||won)return;if(p.powerType==='shield'&&p.power>0)n=Math.ceil(n*.3);p.hp=Math.max(0,p.hp-n);p.inv=1;burst(p.x,p.y+15,'#ff5269');audio(110,.1,'sawtooth');if(!p.hp){dead=true;releaseInputs();showMessage('SIGNAL LOST',checkpoint?'Your checkpoint is ready.':'Retry the Skyview escape.','RETRY',()=>reset(true));}}
    function update(dt){
      dt=Math.max(0,Math.min(.035,dt));
      if(won||dead||paused)return;time+=dt;p.inv=Math.max(0,p.inv-dt);p.fire=Math.max(0,p.fire-dt);p.punch=Math.max(0,p.punch-dt);p.power=Math.max(0,p.power-dt);noticeTime-=dt;
      const left=input.has('left')||input.has('strafeLeft'),right=input.has('right')||input.has('strafeRight');const move=Math.abs(touch.x)>.15?Math.sign(touch.x):(right?1:0)-(left?1:0);
      p.vx=move*105;if(move)p.facing=move;p.facing||=1;if(move&&p.ground)p.run+=Math.abs(p.vx)*dt/42*(8/14);
      const jumping=input.has('up');if(jumping&&!jumpHeld)jumpBuffer=.14;else jumpBuffer=Math.max(0,jumpBuffer-dt);jumpHeld=jumping;coyote=p.ground?.12:Math.max(0,coyote-dt);
      if(jumpBuffer>0&&coyote>0){p.vy=-205;p.ground=false;coyote=0;jumpBuffer=0;audio(310,.04);}
      if(!jumping&&p.vy<-95)p.vy=-95;
      const near=enemies.some(e=>!e.dead&&Math.abs(e.x-p.x)<230&&(e.x-p.x)*p.facing>0&&Math.abs(e.y-p.y)<40);
      if((input.has('fire')||(autoFire&&near))&&p.fire<=0){const strong=p.power>0&&p.powerType==='overdrive';p.fire=strong?.10:.20;shots.push({x:p.x+5+p.facing*20,y:p.y+12,w:7,h:3,vx:p.facing*300,damage:strong?3:1});audio(strong?1050:800,.035);}
      if(input.has('punch')&&!punchHeld){p.punch=.2;const box={x:p.x+(p.facing>0?7:-23),y:p.y+8,w:26,h:25};for(const e of enemies)if(!e.dead&&hit(box,e)){e.hp-=3;e.flash=.12;if(e.hp<=0)defeat(e);}audio(180,.04);}punchHeld=input.has('punch');
      const old=p.y+p.h;p.x=Math.max(0,Math.min(WIDTH-p.w,p.x+p.vx*dt));p.vy+=460*dt;p.y+=p.vy*dt;p.ground=false;
      for(const d of decks)if(p.vy>=0&&p.x+p.w>d.x&&p.x<d.x+d.w&&old<=d.y+1&&p.y+p.h>=d.y){p.y=d.y-p.h;p.vy=0;p.ground=true;}
      if(!checkpoint&&p.x>=1400){checkpoint=1410;p.hp=100;say('CHECKPOINT // HEALTH RESTORED');audio(620,.15);}
      for(const e of enemies){if(e.dead||Math.abs(e.x-p.x)>500)continue;e.flash=Math.max(0,e.flash-dt);const direction=Math.sign(p.x-e.x)||-1;
        if(Math.abs(e.x-p.x)>75)e.x+=direction*(e.kind==='mech'?12:20)*dt;
        if(e.kind==='drone')e.y=184+Math.sin(time*2+e.phase)*10;
        e.fire-=dt;if(e.fire<=0&&Math.abs(e.x-p.x)<340){const dx=p.x-e.x,dy=p.y+14-e.y-10,len=Math.hypot(dx,dy)||1;hostile.push({x:e.x,y:e.y+10,w:e.kind==='mech'?7:4,h:4,vx:dx/len*90,vy:dy/len*90,damage:e.kind==='mech'?18:10});e.fire=e.boss?1.4:e.kind==='mech'?2.5:2.2;audio(160,.03);}
        if(hit(p,e))damage(e.kind==='mech'?25:15);
      }
      for(const b of shots){b.x+=b.vx*dt;for(const e of enemies)if(!b.dead&&!e.dead&&hit(b,e)){b.dead=true;e.hp-=b.damage;e.flash=.1;if(e.hp<=0)defeat(e);}}
      for(const b of hostile){b.x+=b.vx*dt;b.y+=b.vy*dt;if(hit(p,b)){b.dead=true;damage(b.damage);}}
      for(const d of drops){d.vy+=180*dt;d.y=Math.min(222,d.y+d.vy*dt);if(hit(p,d)){d.dead=true;if(d.kind==='health'){p.hp=Math.min(100,p.hp+30);say('HEALTH +30');}else{p.power=15;p.powerType=d.kind;say(d.kind==='overdrive'?'OVERDRIVE // TRIPLE DAMAGE + RAPID FIRE':'SHIELD // 70% DAMAGE RESISTANCE');}audio(1100,.1);}}
      for(const o of orbs){o.cooldown=Math.max(0,o.cooldown-dt);const inside=hit(p,o);if(inside&&!o.inside&&o.cooldown===0){p.character=p.character==='jessie'?'jane':'jessie';p.inv=Math.max(p.inv,.6);o.cooldown=1;burst(p.x,p.y+15,'#b0fff1');say(`TRANSFORMED // ${p.character.toUpperCase()}`);audio(1400,.16);}o.inside=inside;}
      for(const q of particles){q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;}
      shots=shots.filter(b=>!b.dead&&Math.abs(b.x-p.x)<600);hostile=hostile.filter(b=>!b.dead&&Math.abs(b.x-p.x)<600);drops=drops.filter(d=>!d.dead);particles=particles.filter(q=>q.life>0);
      camera=Math.round(Math.max(0,Math.min(WIDTH-480,p.x-150)));
      const boss=enemies.find(e=>e.boss);if(!dead&&p.x>EXIT&&boss.dead){won=true;releaseInputs();try{localStorage.setItem('cad-level-one-complete','true');}catch(_){}showMessage('SKYVIEW LIBERATED',`Chapter One complete! ${kills} enemies defeated. Jessie and Jane escaped together.`,'PLAY AGAIN',()=>reset());}
      gameMeta.textContent=`${Math.min(100,Math.floor(p.x/EXIT*100))}% // ${p.character.toUpperCase()}`;
    }
    function draw(){
      ctx.save();const offset=Math.floor(camera*.35)%480;for(let i=-1;i<2;i++){ctx.save();ctx.translate(i*480-offset,0);CADWorld.draw(ctx,time,{decks:false});ctx.restore();}ctx.translate(-camera,0);
      const r=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
      for(const d of decks){r('#0b1626',d.x,d.y,d.w,d.h);r('#97b2bb',d.x,d.y,d.w,2);for(let x=d.x;x<d.x+d.w;x+=16)r('#3c6173',x+2,d.y+4,10,2);}
      r('#345365',1400,177,4,57);r(checkpoint?'#39f2df':'#c3965a',1404,177,20,10);
      for(const o of orbs){const y=o.y-3+Math.round(Math.sin(time*3)*3);ctx.globalAlpha=.25;r('#8e62ff',o.x-4,y-4,26,26);ctx.globalAlpha=1;r('#ff39cb',o.x,y,18,18);r('#39f2df',o.x+3,y-2,12,22);r('#c8fff5',o.x+6,y+3,6,10);ctx.font='6px monospace';ctx.fillStyle='#c8fff5';ctx.fillText('SWAP',o.x+1,y-8);}
      for(const d of drops){r('#0b1626',d.x-2,d.y-2,16,16);const c=d.kind==='health'?'#69f3a2':d.kind==='shield'?'#7dafff':'#ffc968';r(c,d.x,d.y,12,12);r('#132337',d.x+2,d.y+5,8,2);if(d.kind==='health')r('#132337',d.x+5,d.y+2,2,8);else r('#fff2bb',d.x+5,d.y+2,2,8);}
      for(const e of enemies){if(e.dead||Math.abs(e.x-p.x)>600)continue;if(e.kind==='mech')CADWorld.mech(ctx,e.x+13,e.y+39,{time,facing:p.x<e.x?-1:1,flash:e.flash>0,charging:e.fire<.5});else{r(e.flash?'#fff':'#61778a',e.x,e.y,e.w,e.h);r('#111e30',e.x+2,e.y+3,10,7);r('#ff5269',e.x+4,e.y+5,6,2);if(e.kind==='walker'){r('#142335',e.x+5,e.y+17,3,7);}else{r('#9c72cf',e.x-3,e.y+4,3,3);r('#9c72cf',e.x+14,e.y+4,3,3);}}if(e.boss){r('#3b2335',e.x-5,e.y-9,40,3);r('#ff5269',e.x-5,e.y-9,40*Math.max(0,e.hp)/16,3);}}
      for(const b of shots)r('#b0fff1',b.x,b.y,b.w,b.h);for(const b of hostile)r('#ff657d',b.x,b.y,b.w,b.h);
      const boss=enemies.find(e=>e.boss);r('#0c182b',EXIT,164,44,70);r(boss.dead?'#39f2df':'#ff5269',EXIT,164,44,3);for(let y=173;y<229;y+=8)r(boss.dead?'#396d72':'#703a54',EXIT+5,y,34,2);
      CADCharacters.draw(ctx,p.character,p.x+5,p.y+35,{state:p.punch>0?'punch':!p.ground?'jump':p.vx?'run':p.fire>.1?'fire':'idle',time:p.punch>0?(.2-p.punch)*4:p.vx?p.run:time,facing:p.facing||1,firing:p.fire>.14,jumpPhase:!p.ground?Math.max(.15,Math.min(.8,(p.vy+205)/460)):null});
      if(p.power>0){ctx.strokeStyle=p.powerType==='shield'?'#7dafff':'#ffc968';ctx.strokeRect(Math.round(p.x-5),Math.round(p.y-3),20,40);}
      for(const q of particles)r(q.color,q.x,q.y,2,2);ctx.restore();
      r('#0a1323',5,26,228,24);ctx.font='7px monospace';ctx.fillStyle='#e7f4f6';ctx.fillText(`${p.character.toUpperCase()}  HP ${p.hp}   KILLS ${kills}`,10,36);r('#304155',10,40,100,4);r('#39f2df',10,40,p.hp,4);ctx.fillStyle='#ffd18b';ctx.fillText(p.power>0?`${p.powerType.toUpperCase()} ${Math.ceil(p.power)}s`:'REACH THE EXTRACTION GATE',116,44);
      ctx.fillStyle='#d1e6e8';ctx.fillText(noticeTime>0?notice:boss.dead?'GATE OPEN // MOVE RIGHT':'DEFEAT THE GATE MECH TO EXTRACT',10,61);
    }
    return {start:()=>reset(),update,draw,stop:()=>controls.classList.remove('campaign-controls'),snapshot:()=>({p:{...p},won,dead,kills,checkpoint,enemies:enemies.map(e=>({...e})),drops: drops.map(d=>({...d}))})};
  }};
})();
