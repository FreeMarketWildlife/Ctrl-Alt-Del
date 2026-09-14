/* Jessie motion: native-grid targets and fixed-length anatomical joints.
 * Coordinates are relative to the stable foot anchor. Positive pitch is clockwise.
 * References: SLYNYRD Pixelblogs 8, 25, 49, 50; Saint11 RunCycleSimple.
 */
(() => {
  'use strict';
  const dimensions={big:{hipY:-48,thigh:23,shin:23,spread:2,sole:5},mini:{hipY:-16,thigh:7,shin:7,spread:1,sole:3}};
  const timings={idle:Array(8).fill(160),walk:Array(12).fill(80),run:Array(12).fill(50),fire:[60,75,130],'run-fire':Array(12).fill(50),jump:[70,100,160,110,75,90],'jump-fire':[70,100,160,110,75,90],crouch:[90,140,140,90],jab:[90,40,75,65,80,160],hurt:[70,100,110]};
  const phases={walk:['contact','down','support','pass','rise','push','contact','down','support','pass','rise','push'],run:['contact','down','support','push','flight','fall','contact','down','support','push','flight','fall'],jump:['takeoff','rise','apex','fall','land','recover']};
  // x, y, boot pitch. Foot targets, not knee guesses, describe the motion.
  // Grounded targets travel backward uniformly, so a moving sprite can plant them.
  const paths={
    big:{
      walk:[[18,-5,0],[12,-5,0],[6,-5,0],[0,-5,0],[-6,-5,0],[-12,-5,0],[-18,-5,0],[-15,-12,.8],[-8,-15,.5],[2,-16,0],[10,-12,-.2],[16,-8,-.25]],
      run:[[18,-5,0],[12,-5,0],[3,-5,0],[-7,-13,1],[-16,-21,1.2],[-14,-32,.85],[-7,-33,.45],[0,-24,.05],[8,-17,-.3],[17,-11,-.35],[20,-8,-.3],[19,-7,-.25]],
      walkBob:[0,1,0,-2,-1,0,0,1,0,-2,-1,0],
      runBob:[0,3,1,-1,-3,-2,0,3,1,-1,-3,-2],
      jumpNear:[[-4,-11,.65],[9,-20,-.1],[12,-25,-.25],[14,-16,-.2],[15,-5,0],[10,-5,0]],
      jumpFar:[[-11,-9,.3],[-14,-12,.8],[-15,-18,1],[-12,-13,.65],[-10,-5,0],[-10,-5,0]],
      jumpBob:[0,-2,-3,0,8,2],crouchBob:[6,16,16,6]
    },
    mini:{
      walk:[[6,-3,0],[4,-3,0],[2,-3,0],[0,-3,0],[-2,-3,0],[-4,-3,0],[-6,-3,0],[-5,-5,.75],[-3,-7,.45],[0,-8,0],[3,-7,-.2],[5,-5,-.25]],
      run:[[6,-3,0],[4,-3,0],[1,-3,0],[-3,-5,.9],[-5,-8,1.1],[-4,-11,.8],[-2,-11,.4],[0,-8,0],[3,-6,-.3],[5,-5,-.35],[6,-4,-.3],[6,-4,-.2]],
      walkBob:[0,1,1,0,-1,0,0,1,1,0,-1,0],
      runBob:[0,1,0,-1,-1,0,0,1,0,-1,-1,0],
      jumpNear:[[-1,-5,.6],[3,-7,-.1],[4,-9,-.2],[5,-6,-.2],[5,-3,0],[3,-3,0]],
      jumpFar:[[-4,-3,0],[-5,-5,.8],[-5,-6,1],[-4,-5,.6],[-3,-3,0],[-3,-3,0]],
      jumpBob:[0,-1,-1,0,3,1],crouchBob:[2,5,5,2]
    }
  };
  const loop=(n,length)=>((Math.trunc(n)||0)%length+length)%length;
  const hyp=(x,y)=>Math.sqrt(x*x+y*y);
  // Both limbs bend forward. The circular intersection preserves thigh/shin
  // lengths even when the heel folds up behind the pelvis on recovery.
  function solve(hip,ankle,a,b,pitch,contact){
    const dx=ankle[0]-hip[0],dy=ankle[1]-hip[1],distance=hyp(dx,dy);
    const d=Math.max(.001,distance),along=(a*a-b*b+d*d)/(2*d),height=Math.sqrt(Math.max(0,a*a-along*along));
    const knee=[Math.round(hip[0]+dx/d*along+dy/d*height),Math.round(hip[1]+dy/d*along-dx/d*height)];
    return {hip:hip.map(Math.round),knee,ankle:ankle.map(Math.round),pitch,contact};
  }
  function sample(size,state='idle',frame=0){
    const family=size==='mini'?'mini':'big',d=dimensions[family],p=paths[family],small=family==='mini';
    const action=state==='run-fire'?'run':state==='jump-fire'?'jump':state;
    const count=timings[action]?.length||8,f=loop(frame,count),moving=action==='walk'||action==='run';
    let bob=0,lean=0,near,far;
    if(moving){
      near=p[action][f];far=p[action][(f+6)%12];bob=p[`${action}Bob`][f];
      lean=action==='run'?(small?2:6):(small?0:1);
    }else if(action==='jump'){
      near=p.jumpNear[f];far=p.jumpFar[f];bob=p.jumpBob[f];lean=small?1:[3,5,5,4,3,1][f];
    }else if(action==='crouch'){
      near=small?[5,-3,0]:[15,-5,0];far=small?[-4,-3,0]:[-14,-5,0];bob=p.crouchBob[f];lean=small?1:5;
    }else{
      // A wider braced stance straightens the support legs without changing the
      // fixed torso height or stretching joints. Narrow targets read knock-kneed.
      near=small?[5,-3,0]:[16,-5,0];far=small?[-5,-3,0]:[-16,-5,0];
      if(action==='idle')bob=small?0:[0,0,0,1,1,1,0,0][f];
      if(action==='jab'){bob=small?0:[0,1,0,0,1,0][f];lean=(small?[-1,0,1,2,1,0]:[-2,0,4,5,2,0])[f];}
      if(action==='hurt'){bob=(small?[0,1,0]:[1,2,0])[f];lean=(small?[-2,-1,0]:[-4,-2,0])[f];}
      if(action==='fire')lean=[0,-1,0][f];
    }
    // Targets are local to their own hip's lateral offset. The narrow hip
    // separation represents a side-on three-quarter view without limb growth.
    const nx=d.spread,fx=-d.spread;
    const nearAnkle=[near[0]+nx,near[1]],farAnkle=[far[0]+fx,far[1]];
    let pelvisY=d.hipY+bob;
    // If a future target exceeds reach, adjust the shared pelvis height. Never
    // move a planted ankle to conceal unreachable geometry (foot sliding).
    const reach=d.thigh+d.shin;
    for(const [ankle,hx] of [[nearAnkle,nx],[farAnkle,fx]]){
      const dx=ankle[0]-hx,limit=Math.sqrt(Math.max(0,reach*reach-dx*dx));
      const low=Math.ceil(ankle[1]-limit),high=Math.floor(ankle[1]+limit);
      pelvisY=Math.max(low,Math.min(high,pelvisY));
    }
    bob=pelvisY-d.hipY;
    const contact=(target)=>target[1]===-d.sole;
    return {
      bob,lean,phase:phases[action]?.[f]||action,
      near:solve([nx,pelvisY],nearAnkle,d.thigh,d.shin,near[2],contact(near)),
      far:solve([fx,pelvisY],farAnkle,d.thigh,d.shin,far[2],contact(far))
    };
  }
  const contactFrames={walk:Array.from({length:12},(_,i)=>i),run:[0,1,2,6,7,8],'run-fire':[0,1,2,6,7,8]};
  const api={sample,dimensions,timings,phases,contactFrames};
  if(typeof window!=='undefined')window.CADJessieMotion=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})();
