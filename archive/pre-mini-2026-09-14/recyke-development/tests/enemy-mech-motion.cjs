'use strict';
const assert=require('node:assert/strict'),M=require('../enemy-mech-motion.js');
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const states=['idle','walk','run','charge','fire','run-fire','melee','jump','hurt','death'];
assert.deepEqual(Object.keys(M.timings),states);
const boot={big:[[-5,-8],[12,-8],[12,5],[-5,5]],mini:[[-2,-3],[4,-3],[4,3],[-2,3]]};
let poses=0,maxError=0;
for(const size of ['big','mini']){
  const d=M.dimensions[size];
  for(const state of states){
    assert(M.timings[state].every(t=>Number.isFinite(t)&&t>0));
    for(let f=0;f<M.timings[state].length;f++){
      const pose=M.sample(size,state,f),label=`${size} ${state} ${f}`;
      assert([pose.bob,pose.lean,pose.shift].every(Number.isInteger),`${label}: native body placement`);
      assert(Number.isFinite(pose.angle));
      assert.equal(pose.near.hip[1],pose.far.hip[1],`${label}: one connected pelvis`);
      assert.equal(pose.near.hip[0]-pose.far.hip[0],2*d.spread);
      for(const side of ['near','far']){
        const leg=pose[side];
        for(const joint of ['hip','knee','ankle'])assert(leg[joint].every(Number.isInteger),`${label}: integer joint`);
        for(const [a,b,length] of [[leg.hip,leg.knee,d.thigh],[leg.knee,leg.ankle,d.shin]]){const error=Math.abs(distance(a,b)-length);maxError=Math.max(maxError,error);assert(error<=1,`${label} ${side}: bone drift ${error}`);}
        assert(leg.knee[1]<=-2,`${label}: knee below floor`);
        if(leg.contact){assert.equal(leg.ankle[1],-d.sole);assert.equal(leg.pitch,0);}
        const corners=boot[size].map(([x,y])=>[Math.round(leg.ankle[0]+x*Math.cos(leg.pitch)-y*Math.sin(leg.pitch)),Math.round(leg.ankle[1]+x*Math.sin(leg.pitch)+y*Math.cos(leg.pitch))]);
        assert(corners.every(p=>p[1]<=0),`${label} ${side}: sole crosses floor`);
        assert(corners.every(p=>Math.abs(p[0])<=(size==='big'?62:19)),`${label}: foot clips mirrored cell`);
      }
      if(state==='walk'||M.contactFrames[state]?.includes(f))assert(pose.near.contact||pose.far.contact,`${label}: contact metadata`);
      if(state==='run-fire'){const run=M.sample(size,'run',f);assert.deepEqual(pose,run,`${label}: firing must not change legs`);}
      poses++;
    }
    assert.deepEqual(M.sample(size,state,-1),M.sample(size,state,M.timings[state].length-1));
    assert.deepEqual(M.sample(size,state,0),M.sample(size,state,M.timings[state].length));
  }
  for(const state of ['walk','run']){
    assert.equal(M.timings[state].length,12);
    for(let f=0;f<12;f++){
      const a=M.sample(size,state,f),b=M.sample(size,state,(f+1)%12);
      for(const side of ['near','far']){
        assert(distance(a[side].knee,b[side].knee)<=d.thigh*.5+1,`${size} ${state} ${f}: knee discontinuity`);
        if(a[side].contact&&b[side].contact)assert(b[side].ankle[0]<=a[side].ankle[0],`${size}: planted foot skates forward`);
      }
    }
  }
  assert(Array.from({length:12},(_,f)=>M.sample(size,'run',f)).some(p=>!p.near.contact&&!p.far.contact));
  const collapse=M.sample(size,'death',7);assert(collapse.bob>=(size==='big'?25:8));assert(collapse.angle>1.4);assert.equal(collapse.phase,'wreck');
  assert.deepEqual({...M.sample(size,'death',6),phase:'wreck'},collapse,'settled wreck must stop moving');
}
assert.equal(M.loops.death,false);assert.equal(M.loops.melee,false);assert.equal(M.phases.melee[1],'windup');assert.equal(M.phases.melee[2],'strike');assert(M.timings.melee[1]>M.timings.melee[2]*3);
console.log(`Enemy mech motion: ${poses} native poses across two sizes; fixed bones, planted contacts, 12-pose locomotion, firing parity and articulated wreck pass. Max bone error ${maxError.toFixed(3)}px.`);
