/* Meaningful simulation checks. All playthroughs use public controls; snapshots
 * are detached observations, never a route to teleport or change health. */
const assert = require('node:assert/strict');
const {create,configs} = require('../recyke-level.js');
const DT=1/120;
const make=(size,hero='jessie')=>create({size,hero,random:()=>.5});
function drive(game,until,{fire=true,maxSeconds=70}={}) {
  let s=game.snapshot(),frames=0;
  while(!until(s)&&!s.dead&&!s.won&&frames<maxSeconds/DT){
    const p=s.player,obstacle=s.platforms.find(b=>!b.oneWay&&b.kind!=='ground'&&b.x>p.x&&b.x-p.x<(s.size==='big'?70:34)&&b.y<p.y-1);
    s=game.update(DT,{right:true,fire,jump:p.onGround&&!!obstacle&&frames%2===0});frames++;
  }
  return s;
}
function frames(game,count,input={}) {let s;for(let i=0;i<count;i++)s=game.update(DT,typeof input==='function'?input(game.snapshot(),i):input);return s;}
let scenarios=0;
for(const size of ['mini']) {
  const c=configs[size];
  assert.equal(c.floor,size==='big'?308:222);assert.equal(c.playerHeight,size==='big'?90:30);
  assert.equal(c.enemies.length,8);assert(c.platforms.some(p=>p.oneWay));
  assert(c.jumpSpeed*c.jumpSpeed/(2*c.gravity)>(size==='big'?110:49));
  for(const hero of ['jessie','jane']){
    const g=make(size,hero);const s=drive(g,s=>s.won);
    assert(s.won,`${size} ${hero} reaches exit through normal controls`);
    assert(s.exit.open);assert(s.enemies.find(e=>e.gate).dead);assert.equal(s.player.hero,hero);
    assert(s.checkpoint.active);assert(s.player.hp>0);assert(s.time<45);assert(s.kills>=7);
    assert(s.enemies.filter(e=>e.dead).every(e=>e.state==='death'&&e.stateTime<=2));
    assert.equal(s.progress>0.98,true);
    const finish=JSON.stringify(g.snapshot());g.update(2,{left:true,jump:true,fire:true});assert.equal(JSON.stringify(g.snapshot()),finish,'completion freezes simulation');
    console.log(`PASS ${size} ${hero}: ${s.time.toFixed(2)}s, ${s.kills}/8 units, ${s.player.hp}/6 health`);scenarios++;
    // Held fire and auto-fire retain the weapon pose across projectile gaps,
    // without changing cadence or restarting the native run cycle.
    const armed=make(size,hero),seen=new Set();let a=armed.snapshot();
    for(let i=0;i<120;i++){a=armed.update(DT,{fire:true});assert.equal(a.player.state,'fire');a.shots.filter(p=>!p.hostile).forEach(p=>seen.add(p.uid));}
    assert.equal(seen.size,5,'one-second held fire retains its five-shot cadence');
    let runTime=a.player.runTime;
    for(let i=0;i<60;i++){a=armed.update(DT,{right:true,autoFire:true});assert.equal(a.player.state,'run-fire');assert(a.player.runTime>runTime);runTime=a.player.runTime;}
    a=armed.update(DT,{jump:true,fire:true});
    for(let i=0;i<24;i++){a=armed.update(DT,{fire:true});assert.equal(a.player.state,'jump-fire');}
    a=frames(armed,160,{});assert.equal(a.player.state,'idle','release finishes recoil and lowers the weapon');
    a=armed.update(DT,{fire:true,melee:true});assert.equal(a.player.state,'jab','melee keeps precedence over held fire');scenarios++;

  }
  // Pausing, isolated snapshots, hero selection and fresh reset have no hidden
  // simulation side effects. Real gameplay events remain observable.
  {
    const g=make(size),s=g.snapshot();s.player.hp=0;s.platforms[0].y=-99;assert.equal(g.snapshot().player.hp,6);assert.equal(g.snapshot().platforms[0].y,c.floor);
    g.setPaused(true);const frozen=JSON.stringify(g.snapshot());g.update(.1,{right:true,fire:true,jump:true});assert.equal(JSON.stringify(g.snapshot()),frozen);
    g.setPaused(false);g.setHero('jane');assert.equal(g.snapshot().player.hero,'jane');g.update(DT,{swap:true});assert.equal(g.snapshot().player.hero,'jessie');g.update(DT,{swap:true});assert.equal(g.snapshot().player.hero,'jessie','held swap changes once');
    g.reset();assert.equal(g.snapshot().time,0);assert.equal(g.snapshot().player.x,c.spawn.x);scenarios++;
  }
  // A jump is a real parabola; holding the button cannot bounce on landing.
  {
    const g=make(size);let minY=c.floor;
    const s=frames(g,240,(s)=>{minY=Math.min(minY,s.player.y);return {jump:true};});
    assert(c.floor-minY>(size==='big'?113:47));assert(c.floor-minY<(size==='big'?120:52));
    assert(s.player.onGround);assert.equal(s.player.y,c.floor);assert.equal(s.player.vy,0);scenarios++;
  }
  // The starting bay is safe for learning the controls. The first patrol may
  // move, but cannot acquire an untouched player while the page is being read.
  {
    const g=make(size),s=frames(g,3600,{});assert.equal(s.player.hp,6);assert(!s.dead);assert(!s.shots.some(b=>b.hostile));scenarios++;
  }
  // Buffered jumps survive the final descent, and a six-frame late press after
  // leaving a crate still jumps. Both checks use the real authored collision.
  {
    const g=make(size);let s=g.snapshot();
    while(s.player.x<(size==='big'?550:294))s=g.update(DT,{right:true,fire:true});
    s=g.update(DT,{right:true,jump:true,fire:true});
    while(s.player.x<(size==='big'?650:346))s=g.update(DT,{right:true,fire:true});
    s=frames(g,180,{fire:true});assert(s.player.onGround);assert.equal(s.player.y,size==='big'?276:206);
    while(s.player.onGround)s=g.update(DT,{left:true});
    s=frames(g,6,{left:true});assert(s.player.vy>0);
    s=g.update(DT,{jump:true});assert(s.player.vy< -c.jumpSpeed*.95,'coyote press starts a full jump');
    const j=make(size);let z=j.update(DT,{jump:true});
    while(!(z.player.vy>0&&z.player.y>c.floor-(size==='big'?10:5)))z=j.update(DT,{});
    z=j.update(DT,{jump:true});z=frames(j,20,{});
    assert(z.player.vy<0&&z.player.y<c.floor-(size==='big'?30:15),'buffered press jumps on landing');scenarios++;
  }
  // Failure is possible if the player stands in the first guard's warned line.
  // Death is terminal until retry; a new run clears all old combat state.
  {
    const g=make(size);let chargeAt=null,firstShotAt=null,s=g.snapshot();
    for(let i=0;i<40/DT&&!s.dead;i++){
      s=g.update(DT,{right:s.player.x<(size==='big'?375:175)});
      if(s.enemies[0].state==='charge'&&chargeAt===null)chargeAt=s.time;
      if(s.shots.some(b=>b.hostile)&&firstShotAt===null)firstShotAt=s.time;
    }
    assert(s.dead&&s.player.hp===0);assert(firstShotAt-chargeAt>=.7,'enemy warning lasts at least 0.7 seconds');
    const frozen=JSON.stringify(s);g.update(.1,{fire:true});assert.equal(JSON.stringify(g.snapshot()),frozen);
    s=g.reset({checkpoint:true});assert(!s.dead);assert.equal(s.player.hp,6);assert.equal(s.player.x,c.spawn.x);assert.equal(s.kills,0);scenarios++;
  }
  // A checkpoint saves defeated units and already recovered salvage. Retrying
  // restores health without respawning collected objects or farming wrecks.
  {
    const g=make(size);let s=drive(g,s=>s.checkpoint.active);
    assert(s.checkpoint.active&&!s.dead);const oldKilled=s.enemies.filter(e=>e.dead).map(e=>e.uid),oldCollected=s.pickups.filter(p=>p.collected).map(p=>p.uid);
    assert(oldKilled.length>=3);
    s=drive(g,s=>s.player.x>(size==='big'?2690:1430),{fire:false,maxSeconds:20});
    for(let i=0;i<45/DT&&!s.dead;i++)s=g.update(DT,{});
    assert(s.dead,'later patrol can defeat a stationary player');
    s=g.reset({checkpoint:true});assert.equal(s.player.hp,6);assert(s.checkpoint.active);assert(s.player.x>=c.checkpoint.x);assert(!s.dead);
    oldKilled.forEach(id=>assert(s.enemies.find(e=>e.uid===id).dead));oldCollected.forEach(id=>assert(s.pickups.find(p=>p.uid===id).collected));
    s=drive(g,s=>s.won);assert(s.won,'checkpoint retry can complete the route');
    s=g.reset();assert(!s.checkpoint.active);assert.equal(s.kills,0);assert(s.pickups.every(p=>!p.collected));scenarios++;
  }
  // Return under the salvage catwalk to the tall crate. The solid side blocks
  // movement and the weapon's barrel cannot seed bullets beyond that wall.
  {
    const g=make(size);let s=drive(g,s=>s.player.x>(size==='big'?1980:1080));
    s=frames(g,180,{});assert.equal(s.player.y,c.floor,'can walk below a one-way catwalk');
    s=frames(g,360,{left:true,fire:true});const wall=size==='big'?{x:1580,w:64}:{x:856,w:24};
    assert(Math.abs(s.player.x-(wall.x+wall.w+c.playerWidth/2))<.01,'crate blocks body at its actual side');
    s=frames(g,180,{left:true,fire:true});assert.equal(s.shots.filter(p=>!p.hostile).length,0,'solid crate blocks long weapon muzzle');assert(s.player.onGround);scenarios++;
  }
  // Both facings have a useful melee volume. Walk through the training guard,
  // then turn back: the left-facing jab must hit the same physical hull.
  for(const facing of [1,-1]){
    const g=make(size);let s=g.snapshot(),hit=false;
    for(let i=0;i<12/DT&&!s.dead;i++){
      const e=s.enemies[0],p=s.player,reach=c.meleeReach;
      let input;
      if(facing>0)input={right:p.x<e.x-reach*.55,melee:p.x>=e.x-reach*.75};
      else if(p.x<e.x+reach*.45)input={right:true};
      else input={left:p.facing!==-1,melee:true};
      const before=e.hp;s=g.update(DT,input);
      if(s.enemies[0].hp<before&&s.player.facing===facing){hit=true;break;}
    }
    assert(hit,`${size} melee hits facing ${facing}`);scenarios++;
  }
}
assert.deepEqual(Object.keys(configs),['mini']);
assert.deepEqual(create().snapshot().size,'mini');
console.log(`PASS ${scenarios} Recyke simulation scenarios: native routes, inputs, combat, cover, telegraphs, jumps, pause, death and checkpoint retry.`);
