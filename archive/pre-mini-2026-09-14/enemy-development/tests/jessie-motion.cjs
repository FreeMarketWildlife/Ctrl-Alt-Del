'use strict';
const assert=require('node:assert/strict');
const motion=require('../jessie-motion.js');
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const sides=['near','far'];
let checkedPoses=0,maxBoneError=0;

// These are the renderer's boot extents around each ankle, not animation poses.
const boots={big:[[-5,-7],[12,-7],[12,5],[-5,5]],mini:[[-2,-3],[4,-3],[4,3],[-2,3]]};
for(const size of ['big','mini']){
  const anatomy=motion.dimensions[size],boneTolerance=size==='big'?1:1.5;
  for(const state of ['walk','run','run-fire']){
    assert.equal(motion.timings[state].length,12,`${state} must retain twelve poses`);
  }
  for(const [state,timings] of Object.entries(motion.timings)){
    assert(timings.length>0&&timings.every(ms=>Number.isFinite(ms)&&ms>0),`${state} requires positive frame holds`);
    for(let frame=0;frame<timings.length;frame++){
      const pose=motion.sample(size,state,frame);
      assert(Number.isInteger(pose.bob)&&Number.isFinite(pose.lean));
      assert.equal(pose.near.hip[1],pose.far.hip[1],'legs must share one pelvis');
      for(const side of sides){
        const limb=pose[side],label=`${size} ${state} frame ${frame} ${side}`;
        for(const joint of ['hip','knee','ankle']){
          assert(limb[joint].length===2&&limb[joint].every(Number.isInteger),`${label}: joint must land on native pixels`);
        }
        for(const [actual,expected] of [[distance(limb.hip,limb.knee),anatomy.thigh],[distance(limb.knee,limb.ankle),anatomy.shin]]){
          const error=Math.abs(actual-expected);maxBoneError=Math.max(maxBoneError,error);
          assert(error<=boneTolerance,`${label}: bone changed length by ${error.toFixed(2)}px`);
        }
        assert(Number.isFinite(limb.pitch),`${label}: invalid ankle angle`);
        // Test the final native-grid vertices, as the scanline renderer does.
        // Polygon bottoms at y=0 produce the last filled row at y=-1.
        const floor=Math.max(...boots[size].map(([x,y])=>Math.round(limb.ankle[1]+x*Math.sin(limb.pitch)+y*Math.cos(limb.pitch))));
        assert(floor<=0,`${label}: boot penetrates floor by ${floor}px`);
        if(limb.contact){
          assert.equal(limb.ankle[1],-anatomy.sole,`${label}: planted ankle left the support baseline`);
          assert.equal(floor,0,`${label}: planted sole is floating`);
        }
      }
      if(state==='walk')assert(pose.near.contact||pose.far.contact,'walk must always have a support foot');
      if(motion.contactFrames[state]?.includes(frame))assert(pose.near.contact||pose.far.contact,`${state} contact metadata describes an airborne pose`);
      checkedPoses++;
    }
  }
  for(const state of ['walk','run']){
    const count=motion.timings[state].length,poses=Array.from({length:count},(_,f)=>motion.sample(size,state,f));
    assert.deepEqual(motion.sample(size,state,count),poses[0],'cycle must wrap on exactly the first pose');
    assert.deepEqual(motion.sample(size,state,-1),poses[count-1],'reverse stepping must wrap to the last pose');
    if(state==='run')assert(poses.some(p=>!p.near.contact&&!p.far.contact),'run must include a flight phase');
    for(let frame=0;frame<count;frame++){
      const current=poses[frame],next=poses[(frame+1)%count];
      for(const side of sides){
        const a=current[side],b=next[side];
        // A single 50–80ms frame may not teleport a knee by most of a thigh.
        assert(distance(a.knee,b.knee)<=anatomy.thigh*.5+1,`${size} ${state}: knee jumps between frames ${frame} and ${(frame+1)%count}`);
        if(a.contact&&b.contact)assert(b.ankle[0]<=a.ankle[0],`${size} ${state}: supporting foot skates forward`);
      }
    }
  }
  for(const [moving,firing] of [['run','run-fire'],['jump','jump-fire']]){
    assert.equal(motion.timings[moving].length,motion.timings[firing].length);
    for(let frame=0;frame<motion.timings[moving].length;frame++){
      const a=motion.sample(size,moving,frame),b=motion.sample(size,firing,frame);
      assert.deepEqual(a.near,b.near,`${size}: firing changed the near leg`);
      assert.deepEqual(a.far,b.far,`${size}: firing changed the far leg`);
      assert.equal(a.bob,b.bob,`${size}: firing changed pelvis motion`);
    }
  }
}
console.log(`Jessie motion: ${checkedPoses} poses checked; fixed bones, planted feet, boot clearance, loop continuity, and independent firing pass (max bone error ${maxBoneError.toFixed(3)}px).`);
