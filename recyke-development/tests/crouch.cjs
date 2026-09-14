'use strict';
const assert=require('node:assert/strict'),{create,configs}=require('../recyke-level.js');const DT=1/120;
const tick=(g,n,input)=>{let s=g.snapshot();for(let i=0;i<n;i++)s=g.update(DT,input);return s;};
function fixture(extra={}){return {...structuredClone(configs.mini),safeUntilX:1000,worldWidth:1000,exit:{x:980,y:222},checkpoint:{x:800,y:222},spawn:{x:44,y:222},platforms:[{x:0,y:222,w:1000,h:48,kind:'ground'}],enemies:[{id:'bastion',x:950,y:222,left:950,right:950,hp:8,gate:true}],pickups:[],...extra};}
let scenarios=0;
for(const hero of ['jane','jessie']){
 const make=level=>create({hero,level:level||fixture(),random:()=>.5});
 // Held input: stable low collider, anchored feet, all four requested combinations.
 const g=make(),before=g.snapshot();let s=tick(g,1,{down:true});assert(s.player.crouching);assert.equal(s.player.state,'crouch-idle');assert.equal(s.player.hitbox.h,16);assert.equal(s.player.y,before.player.y);assert.equal(s.player.hitbox.y+s.player.hitbox.h,before.player.y);
 s=tick(g,90,{down:true,right:true});assert.equal(s.player.state,'crouch-walk');assert.equal(s.player.vx,25);const gait=s.player.crouchTime;
 s=tick(g,1,{down:true,right:true,fire:true});assert.equal(s.player.state,'crouch-walk-fire');assert(s.player.crouchTime>gait);assert.equal(s.shots[0].previousY,213);assert.equal(s.shots[0].previousX,s.player.x+18);
 s=tick(g,60,{down:true,fire:true});assert.equal(s.player.state,'crouch-fire');assert.equal(s.player.hitbox.h,16);s=tick(g,1,{});assert(!s.player.crouching);assert.equal(s.player.hitbox.h,30);scenarios++;
 // Crouch has priority over jump and melee while held on the ground.
 s=tick(g,10,{down:true,jump:true,melee:true});assert(s.player.onGround&&s.player.crouching);assert(!s.player.attackTime);const swapped=g.setHero(hero==='jane'?'jessie':'jane');assert(swapped.player.crouching);assert.equal(swapped.player.hitbox.h,16);scenarios++;
 // Down in the air does not shrink the collider; landing applies the low hitbox immediately.
 const jump=make();s=tick(jump,1,{jump:true});assert(!s.player.onGround);s=tick(jump,5,{down:true});assert(!s.player.crouching);assert.equal(s.player.hitbox.h,30);let landed=false;for(let i=0;i<150;i++){s=tick(jump,1,{down:true});if(s.player.onGround){landed=true;assert(s.player.crouching);assert.equal(s.player.hitbox.h,16);break;}}assert(landed);scenarios++;
 // A twenty-pixel clearance blocks standing and admits crouch-walking.
 const roof={x:80,y:176,w:50,h:26,kind:'crate'},tunnel=make(fixture({platforms:[...fixture().platforms,roof]}));
 s=tick(tunnel,80,{right:true});assert.equal(s.player.x,75);s=tick(tunnel,130,{right:true,down:true});assert(s.player.x>95&&s.player.x<130);assert.equal(s.player.hitbox.h,16);
 s=tick(tunnel,1,{});assert(s.player.crouching,'release cannot stand through roof');assert(s.player.hitbox.y>=roof.y+roof.h);
 s=tick(tunnel,30,{jump:true,right:true});assert(s.player.crouching&&s.player.onGround,'jump cannot force a standing body into roof');
 s=tick(tunnel,160,{right:true});assert(s.player.x>135);assert(!s.player.crouching);assert.equal(s.player.hitbox.h,30);scenarios++;
 // Tighter passages remain solid even when crouched; one-way platforms do not trap standing.
 const tight=make(fixture({platforms:[...fixture().platforms,{...roof,h:34}]}));s=tick(tight,240,{right:true,down:true});assert.equal(s.player.x,75);
 const oneWay=make(fixture({platforms:[...fixture().platforms,{...roof,x:30,oneWay:true}]}));tick(oneWay,1,{down:true});s=tick(oneWay,1,{});assert(!s.player.crouching);scenarios++;
 // Identical authored projectile trajectories: high shots miss low bodies; low shots still hit.
 function shotLevel(y){return fixture({shots:[{uid:100,x:80,y,previousX:80,previousY:y,vx:-120,vy:0,hostile:true,damage:1,life:2,age:0,radius:1}]});}
 const standing=make(shotLevel(204)),duck=make(shotLevel(204)),low=make(shotLevel(214));assert.equal(tick(standing,50,{}).player.hp,5);s=tick(duck,50,{down:true});assert.equal(s.player.hp,6);s=tick(low,50,{down:true});assert.equal(s.player.hp,5);assert(s.player.crouching&&s.player.state.startsWith('crouch-'),'damage cannot pop the visible body upright');scenarios++;
 // The lowered muzzle cannot put bullets through a wall, and is identical in both facings.
 for(const facing of [-1,1]){const fire=make();if(facing<0)tick(fire,1,{left:true,down:true});s=tick(fire,1,{fire:true,down:true});assert.equal(s.shots[0].previousY,s.player.y-9);assert.equal(s.shots[0].previousX,s.player.x+facing*18);}
 const wall=make(fixture({platforms:[...fixture().platforms,{x:55,y:200,w:7,h:22,kind:'crate'}]}));s=tick(wall,1,{down:true,fire:true});assert.equal(s.shots.length,0);scenarios++;
 // No key latch across reset or pause; request level snapshots cannot mutate actual collision.
 tick(g,1,{down:true});g.setPaused(true);const saved=JSON.stringify(g.snapshot());tick(g,20,{});assert.equal(JSON.stringify(g.snapshot()),saved);g.setPaused(false);s=tick(g,1,{});assert(!s.player.crouching);s=g.reset();assert(!s.player.crouching&&s.player.hitbox.h===30);scenarios++;
}
console.log(`PASS ${scenarios} crouch simulation scenarios: both heroes, all combinations, projectiles, ceilings, landing, swaps, muzzles, reset/pause.`);
