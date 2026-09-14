'use strict';
const assert=require('node:assert/strict');
const motion=require('../jane-motion.js');
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const sides=['near','far'];
const states=['stand','idle','walk','run','fire','run-fire','jump','jump-fire','crouch','jab','cross','front-kick','round-kick','hurt'];
// Conservative boot corner bounds include the renderer's complete outline.
const boots={big:[[-4,-8],[11,-8],[11,5],[-4,5]],mini:[[-2,-3],[4,-3],[4,3],[-2,3]]};
let checkedPoses=0,maxBoneError=0,maxHairError=0;
assert.deepEqual(Object.keys(motion.timings),states,'all fourteen legacy and expanded actions must be authored');

for(const size of ['big','mini']){
  const anatomy=motion.dimensions[size],boneTolerance=size==='big'?1:1.5;
  for(const [state,holds] of Object.entries(motion.timings)){
    assert(holds.length>0&&holds.every(ms=>Number.isFinite(ms)&&ms>0),`${state}: missing positive frame holds`);
    for(let frame=0;frame<holds.length;frame++){
      const pose=motion.sample(size,state,frame),label=`${size} ${state} frame ${frame}`;
      assert(Number.isInteger(pose.bob)&&Number.isInteger(pose.lean),`${label}: body must snap to the native grid`);
      assert.equal(pose.near.hip[1],pose.far.hip[1],`${label}: shared pelvis separated`);
      for(const side of sides){
        const limb=pose[side];
        for(const joint of ['hip','knee','ankle'])assert(limb[joint].length===2&&limb[joint].every(Number.isInteger),`${label} ${side}: non-integer joint`);
        for(const [actual,expected] of [[distance(limb.hip,limb.knee),anatomy.thigh],[distance(limb.knee,limb.ankle),anatomy.shin]]){
          const error=Math.abs(actual-expected);maxBoneError=Math.max(maxBoneError,error);
          assert(error<=boneTolerance,`${label} ${side}: bone length drifted ${error.toFixed(2)}px`);
        }
        const corners=boots[size].map(([x,y])=>[Math.round(limb.ankle[0]+x*Math.cos(limb.pitch)-y*Math.sin(limb.pitch)),Math.round(limb.ankle[1]+x*Math.sin(limb.pitch)+y*Math.cos(limb.pitch))]);
        assert(corners.every(([x,y])=>Number.isFinite(x)&&y<=0),`${label} ${side}: boot crosses ground`);
        const safeX=size==='big'?62:19;
        assert(corners.every(([x])=>Math.abs(x)<=safeX),`${label} ${side}: boot clips in one facing`);
        if(limb.contact){assert.equal(limb.ankle[1],-anatomy.sole);assert.equal(Math.max(...corners.map(p=>p[1])),0,`${label} ${side}: planted sole floats`);}
      }
      if(state==='walk')assert(pose.near.contact||pose.far.contact,`${label}: walk lost support`);
      if(motion.contactFrames[state]?.includes(frame))assert(pose.near.contact||pose.far.contact,`${label}: incorrect contact metadata`);
      assert.equal(pose.hair.length,5,`${label}: hair chain lost a joint`);
      assert.deepEqual(pose.hair[0],[anatomy.hair.root[0]+pose.lean,anatomy.hair.root[1]+pose.bob],`${label}: hair detached from head`);
      pose.hair.forEach((point,i)=>{
        assert(point.length===2&&point.every(Number.isInteger),`${label}: hair must use native integer pixels`);
        const width=anatomy.hair.widths[i],minX=size==='big'?-45:-18,minY=size==='big'?-96:-32;
        assert(point[0]-width>=minX&&point[0]+width<=-minX,`${label}: hair clips in one facing`);
        assert(point[1]>=minY&&point[1]<0,`${label}: hair outside vertical cell`);
        if(i){const error=Math.abs(distance(point,pose.hair[i-1])-anatomy.hair.links[i-1]);maxHairError=Math.max(maxHairError,error);assert(error<=1,`${label}: hair segment changed length ${error.toFixed(2)}px`);}
      });
      checkedPoses++;
    }
    assert.deepEqual(motion.sample(size,state,holds.length),motion.sample(size,state,0),`${size} ${state}: frame wrapping changed`);
    assert.deepEqual(motion.sample(size,state,-1),motion.sample(size,state,holds.length-1));
  }
  for(const state of ['walk','run']){
    assert.equal(motion.timings[state].length,12,`${state}: expected twelve authored poses`);
    assert(motion.timings[state].every(ms=>ms===(state==='walk'?80:50)),`${state}: cadence diverges from shared character standard`);
    const poses=Array.from({length:12},(_,f)=>motion.sample(size,state,f));
    if(state==='run')assert(poses.some(p=>!p.near.contact&&!p.far.contact),'running requires a flight phase');
    for(let frame=0;frame<12;frame++){
      const current=poses[frame],next=poses[(frame+1)%12];
      for(const side of sides){
        const a=current[side],b=next[side];
        assert(distance(a.knee,b.knee)<=anatomy.thigh*.5+1,`${size} ${state}: knee teleports at ${frame}`);
        if(a.contact&&b.contact)assert(b.ankle[0]<=a.ankle[0],`${size} ${state}: support foot skates forward`);
      }
      const tailJump=distance(current.hair[4],next.hair[4]);
      assert(tailJump<=(size==='big'?15:6),`${size} ${state}: hair pops between ${frame} and ${(frame+1)%12}`);
    }
  }
  const run=Array.from({length:12},(_,f)=>motion.sample(size,'run',f));
  const relativeTips=run.map(p=>[p.hair[4][0]-p.hair[0][0],p.hair[4][1]-p.hair[0][1]]);
  assert(relativeTips.every(([x])=>x<-(size==='big'?15:5)),`${size}: running hair must trail behind her`);
  assert(new Set(relativeTips.map(String)).size>=6,`${size}: hair is rigid instead of waving`);
  const relativeLinks=run.map(p=>p.hair.slice(1).map((a,i)=>[a[0]-p.hair[i][0],a[1]-p.hair[i][1]]));
  assert(relativeLinks.some(links=>links[1][1]!==links[3][1]),`${size}: all hair joints move as one straight rigid piece`);
  const wavePeaks=Array.from({length:4},(_,i)=>{
    const angles=relativeLinks.map(links=>Math.atan2(links[i][0],links[i][1]));
    return angles.indexOf(Math.max(...angles));
  });
  assert(wavePeaks.every((peak,i)=>i===0||peak>=wavePeaks[i-1]),`${size}: hair tip leads its driving root`);
  assert(wavePeaks[3]>=wavePeaks[0]+3,`${size}: wave must travel down the hair with a visible delay`);

  for(const state of ['front-kick','round-kick']){
    const poses=motion.timings[state].map((_,f)=>motion.sample(size,state,f)),planted=poses[0].far.ankle;
    assert(poses.every(p=>p.far.contact),`${size} ${state}: kick lost its support`);
    poses.forEach(p=>assert.deepEqual(p.far.ankle,planted,`${size} ${state}: supporting foot moved`));
    assert(poses[3].near.ankle[0]>(size==='big'?40:11),`${size} ${state}: strike has no readable extension`);
    assert(poses[3].near.ankle[1]<(size==='big'?-35:-11),`${size} ${state}: kick is only a ground step`);
    assert(poses[7].near.contact,`${size} ${state}: kicking leg did not return to the floor`);
    assert(poses[5].hair[4][0]<poses[2].hair[4][0],`${size} ${state}: tail has no delayed recovery`);
    assert(motion.timings[state][2]<motion.timings[state][1]&&motion.timings[state][2]<motion.timings[state][7],`${state}: strike timing lacks anticipation and recovery`);
  }
  const front=motion.sample(size,'front-kick',3),round=motion.sample(size,'round-kick',3);
  assert(round.near.ankle[1]<front.near.ankle[1]-(size==='big'?10:3),`${size}: round kick lost its higher swing arc`);
  assert(front.near.pitch<-.5&&round.near.pitch>0,`${size}: front sole strike and round instep strike must have different boot silhouettes`);
  for(const [moving,firing] of [['run','run-fire'],['jump','jump-fire']]){
    assert.deepEqual(motion.timings[moving],motion.timings[firing]);
    motion.timings[moving].forEach((_,frame)=>assert.deepEqual(motion.sample(size,moving,frame),motion.sample(size,firing,frame),`${size}: firing changed legs or hair`));
  }
}
console.log(`Jane motion: ${checkedPoses} poses; 14 actions, fixed bones, planted kicks, native hair links, waving run hair, and shared firing cadence pass. Max bone error ${maxBoneError.toFixed(3)}px; max hair link error ${maxHairError.toFixed(3)}px.`);
