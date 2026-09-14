/* Jane motion, authored on the two locked native pixel grids.
 * All coordinates are relative to the feet anchor, facing right. Head, neck,
 * and hair root use the same final pelvis bob; no independent head drift.
 * Locomotion uses the proven fixed-length Jessie foot-path approach, with
 * Jane's own authored actions and separate hair chains for each native size.
 * Research and design rationale: docs/references/jane-motion-research.md.
 */
(() => {
  'use strict';
  const dimensions={
    mini:{hipY:-16,thigh:7,shin:7,spread:1,sole:3,hair:{root:[-3,-29],links:[2,3,3,2],widths:[1,2,1.5,1,.35]}}
  };
  const timings={
    stand:Array(8).fill(160),idle:Array(8).fill(160),walk:Array(12).fill(80),run:Array(12).fill(50),
    fire:[60,75,130],'run-fire':Array(12).fill(50),jump:[70,100,160,110,75,90],
    'jump-fire':[70,100,160,110,75,90],crouch:[90,140,140,90],
    jab:[90,40,75,65,80,160],cross:[100,40,65,80,90,160],
    'front-kick':[70,80,40,65,55,70,80,130],'round-kick':[80,90,40,65,60,75,80,140],hurt:[70,100,110]
  };
  Object.assign(timings,{'crouch-idle':Array(4).fill(160),'crouch-walk':Array(12).fill(80),'crouch-fire':[60,75,130],'crouch-walk-fire':Array(12).fill(80)});
  const phases={
    stand:Array(8).fill('stand'),idle:Array(8).fill('idle'),
    walk:['contact','down','support','pass','rise','push','contact','down','support','pass','rise','push'],
    run:['contact','down','support','push','flight','fall','contact','down','support','push','flight','fall'],
    jump:['takeoff','rise','apex','fall','land','recover'],
    jab:['anticipation','drive','strike','follow-through','retract','recover'],
    cross:['anticipation','drive','strike','follow-through','retract','recover'],
    'front-kick':['anticipation','chamber','drive','strike','follow-through','retract','plant','recover'],
    'round-kick':['anticipation','chamber','drive','strike','follow-through','retract','plant','recover'],
    fire:['fire','recoil','recover'],crouch:['lower','hold','hold','rise'],hurt:['impact','recoil','recover']
  };
  phases['run-fire']=[...phases.run];phases['jump-fire']=[...phases.jump];
  const loops=Object.fromEntries(Object.keys(timings).map(state=>[state,['stand','idle','walk','run','run-fire','crouch-idle','crouch-walk','crouch-walk-fire'].includes(state)]));
  // x, y, boot pitch. Contact feet travel backward during locomotion, while
  // the planted far foot in a kick stays on exactly the same world anchor.
  const paths={
    mini:{
      walk:[[6,-3,0],[4,-3,0],[2,-3,0],[0,-3,0],[-2,-3,0],[-4,-3,0],[-6,-3,0],[-5,-5,.75],[-3,-7,.45],[0,-8,0],[3,-7,-.2],[5,-5,-.25]],
      run:[[6,-3,0],[4,-3,0],[1,-3,0],[-3,-5,.9],[-5,-8,1.1],[-4,-11,.8],[-2,-11,.4],[0,-8,0],[3,-6,-.3],[5,-5,-.35],[6,-4,-.3],[6,-4,-.2]],
      walkBob:[0,1,1,0,-1,0,0,1,1,0,-1,0],runBob:[0,1,0,-1,-1,0,0,1,0,-1,-1,0],
      jumpNear:[[-1,-5,.6],[3,-7,-.1],[4,-9,-.2],[5,-6,-.2],[5,-3,0],[3,-3,0]],
      jumpFar:[[-4,-3,0],[-5,-5,.8],[-5,-6,1],[-4,-5,.6],[-3,-3,0],[-3,-3,0]],
      jumpBob:[0,-1,-1,0,3,1],crouchBob:[2,5,5,2],
      'front-kick':[[5,-3,0],[2,-7,.4],[7,-12,-.45],[12,-14,-.65],[12,-13,-.65],[6,-10,.2],[4,-5,0],[5,-3,0]],
      'round-kick':[[5,-3,0],[-2,-7,.75],[6,-14,-.2],[12,-18,.2],[11,-14,.3],[4,-10,.55],[3,-5,0],[5,-3,0]],
      kickBob:[0,1,1,0,0,1,1,0],
      frontLean:[0,-1,-1,-2,-1,-1,0,0],roundLean:[0,-1,-1,-1,0,1,0,0]
    }
  };
  const loop=(n,length)=>((Math.trunc(n)||0)%length+length)%length;
  const actionOf=state=>state==='run-fire'?'run':state==='jump-fire'?'jump':state;

  function solve(hip,ankle,a,b,pitch,contact){
    const dx=ankle[0]-hip[0],dy=ankle[1]-hip[1],d=Math.max(.001,Math.hypot(dx,dy));
    const along=(a*a-b*b+d*d)/(2*d),height=Math.sqrt(Math.max(0,a*a-along*along));
    return {hip:hip.map(Math.round),
      knee:[Math.round(hip[0]+dx/d*along+dy/d*height),Math.round(hip[1]+dy/d*along-dx/d*height)],
      ankle:ankle.map(Math.round),pitch,contact};
  }

  // Each link rotates with a later phase than its parent. Integrating fixed
  // lengths before snapping preserves the ponytail's volume through the wave.
  // Values for the mini chain are separately chosen for its 2/3/3/2-pixel arcs.
  function hair(family,action,f,bob,lean){
    const small=family==='mini',d=dimensions[family].hair,count=timings[action]?.length||8;
    const phase=f/count*Math.PI*2;
    let base=small?[-.8,-.6,-.1,.45]:[-.7,-.5,-.15,.4],amplitude=small?.16:.12,lag=.8;
    if(action==='walk'){
      base=small?[-.8,-.6,-.35,.05]:[-.7,-.65,-.4,.05];amplitude=small?.26:.23;
    }else if(action==='run'){
      base=small?[-.8,-1.15,-1.25,-1.1]:[-.65,-1.05,-1.32,-1.22];amplitude=small?.5:.35;lag=.95;
    }else if(action==='jump'){
      // Rising pulls the tail down; falling lifts the trailing tip. Landing
      // continues the previous motion for a frame before the tail settles.
      const drag=[-.2,-.12,-.38,-.9,-1.05,-.5][f];
      base=[drag,drag-.12,drag-.25,drag-.12];amplitude=small?.21:.18;lag=.9;
    }else if(action==='jab'||action==='cross'){
      const drag=[0,-.12,-.5,-.7,-.3,.12][f];
      base=[drag*.45,drag*.8,drag,drag-.05];amplitude=.12;
    }else if(action==='front-kick'||action==='round-kick'){
      const drag=(action==='round-kick'?[0,.15,.1,-.3,-.75,-.9,-.4,.02]:[0,.1,.2,-.15,-.5,-.6,-.25,.02])[f];
      base=[drag*.4,drag*.75,drag,drag+.12];amplitude=.15;
    }else if(action==='hurt'){
      const drag=[.22,.42,-.05][f];base=[drag*.3,drag*.7,drag,drag];amplitude=.08;
    }else if(action==='crouch'){
      const drag=[-.15,-.3,-.15,.05][f];base=[drag,drag-.05,drag-.08,drag+.05];amplitude=.1;
    }else if(action==='fire'){
      const drag=[0,.12,-.08][f];base=base.map((a,i)=>a+drag*i/3);amplitude=.08;
    }
    let x=d.root[0]+lean,y=d.root[1]+bob;
    const points=[[Math.round(x),Math.round(y)]];
    for(let i=0;i<d.links.length;i++){
      const angle=base[i]+Math.sin(phase-i*lag)*amplitude*(.5+i*.22);
      x+=Math.sin(angle)*d.links[i];y+=Math.cos(angle)*d.links[i];
      points.push([Math.round(x),Math.round(y)]);
    }
    return points;
  }

  // Deep crouch uses the same 7px bones, with the pelvis lowered and torso
  // drawn leaning forward. Never scale a standing sprite to make this pose.
  function crouchPose(state,frame){
    const f=loop(frame,timings[state].length),walking=state.includes('walk'),d=dimensions.mini;
    // Keep the contact stride; lower the swing lift so deeply folded knees
    // pass smoothly beneath the torso instead of snapping around the hip.
    const path=paths.mini.walk.map(([x,y,pitch])=>[x,Math.max(-5,y),pitch]),near=walking?path[f]:[5,-3,0],far=walking?path[(f+6)%12]:[-5,-3,0];
    const pelvis=-10;
    const limb=(target,side)=>{
      const q=solve([side,pelvis],[target[0]+side,target[1]],7,7,target[2],target[1]===-3&&target[2]===0);
      // Use the upper circle intersection when a deep fold would put a knee
      // below the floor. Both branches retain the same thigh/shin lengths.
      if(q.knee[1]>-3)q.knee=[q.hip[0]+q.ankle[0]-q.knee[0],q.hip[1]+q.ankle[1]-q.knee[1]];
      return q;
    };
    return {crouched:true,bob:6,lean:2,headOffset:[2,14],phase:walking?(f%6<3?'support':'recover'):'crouch',near:limb(near,1),far:limb(far,-1),hair:hair('mini',walking?'walk':'crouch',walking?f:1,14,2)};
  }
  function sample(size,state='idle',frame=0){
    if(state.startsWith('crouch-')&&timings[state])return crouchPose(state,frame);
    const family='mini',d=dimensions[family],p=paths[family],small=family==='mini';
    const known=Object.hasOwn(timings,state)?state:'idle',action=actionOf(known);
    const f=loop(frame,timings[known].length),moving=action==='walk'||action==='run';
    let bob=0,lean=0,near,far;
    if(moving){
      near=p[action][f];far=p[action][(f+6)%12];bob=p[`${action}Bob`][f];lean=action==='run'?(small?2:6):(small?0:1);
    }else if(action==='jump'){
      near=p.jumpNear[f];far=p.jumpFar[f];bob=p.jumpBob[f];lean=small?1:[3,5,5,4,3,1][f];
    }else if(action==='crouch'){
      near=small?[5,-3,0]:[15,-5,0];far=small?[-4,-3,0]:[-14,-5,0];bob=p.crouchBob[f];lean=small?1:5;
    }else{
      near=small?[5,-3,0]:[16,-5,0];far=small?[-5,-3,0]:[-16,-5,0];
      if(action==='idle'||action==='stand')bob=small?0:[0,0,0,1,1,1,0,0][f];
      if(action==='jab'){bob=small?0:[0,1,0,0,1,0][f];lean=(small?[-1,0,1,2,1,0]:[-2,0,4,5,2,0])[f];}
      if(action==='cross'){bob=(small?[0,1,0,0,1,0]:[0,2,1,1,1,0])[f];lean=(small?[-1,0,2,2,1,0]:[-3,0,5,6,3,0])[f];}
      if(action==='front-kick'||action==='round-kick'){
        near=p[action][f];bob=p.kickBob[f];lean=(action==='front-kick'?p.frontLean:p.roundLean)[f];
      }
      if(action==='hurt'){bob=(small?[0,1,0]:[1,2,0])[f];lean=(small?[-2,-1,0]:[-4,-2,0])[f];}
      if(action==='fire')lean=[0,-1,0][f];
    }
    const nx=d.spread,fx=-d.spread,nearAnkle=[near[0]+nx,near[1]],farAnkle=[far[0]+fx,far[1]];
    // Find the intersection of both legs' reachable vertical intervals before
    // clamping the pelvis. Never alter a contact target to hide foot sliding.
    const reach=d.thigh+d.shin;
    let minY=-Infinity,maxY=Infinity;
    for(const [ankle,hx] of [[nearAnkle,nx],[farAnkle,fx]]){
      const limit=Math.sqrt(Math.max(0,reach*reach-(ankle[0]-hx)**2));
      minY=Math.max(minY,Math.ceil(ankle[1]-limit));maxY=Math.min(maxY,Math.floor(ankle[1]+limit));
    }
    const pelvisY=Math.max(minY,Math.min(maxY,d.hipY+bob));bob=pelvisY-d.hipY;
    const contact=target=>target[1]===-d.sole&&target[2]===0;
    return {bob,lean,phase:phases[action]?.[f]||action,
      near:solve([nx,pelvisY],nearAnkle,d.thigh,d.shin,near[2],contact(near)),
      far:solve([fx,pelvisY],farAnkle,d.thigh,d.shin,far[2],contact(far)),hair:hair(family,action,f,bob,lean)};
  }
  const contactFrames={walk:Array.from({length:12},(_,i)=>i),run:[0,1,2,6,7,8],'run-fire':[0,1,2,6,7,8],
    jump:[4,5],'jump-fire':[4,5],'front-kick':Array.from({length:8},(_,i)=>i),'round-kick':Array.from({length:8},(_,i)=>i)};
  for(const state of ['crouch-idle','crouch-walk','crouch-fire','crouch-walk-fire'])contactFrames[state]=timings[state].map((_,f)=>f);
  const api={sample,dimensions,timings,phases,loops,contactFrames};
  if(typeof window!=='undefined')window.CADJaneMotion=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})();
