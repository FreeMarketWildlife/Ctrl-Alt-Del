/* Isolated read-only kit renderer and small traversal harness. No production game imports. */
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.RecykeKit=api;})(typeof globalThis==='object'?globalThis:this,function(){
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function frameAt(a,state,time){let s=a.animation.states[state]||a.animation.states.idle||Object.values(a.animation.states)[0],total=s.timingMs.reduce((x,y)=>x+y,0),t=Math.max(0,time*1000);t=s.loop?t%total:Math.min(t,total-.001);let i=0;while(t>=s.timingMs[i]&&i<s.frames.length-1)t-=s.timingMs[i++];return s.frames[i];}
function actorFrame(meta,state,time){let holds=meta.timingMs[state]||meta.timingMs.idle,total=holds.reduce((a,b)=>a+b,0),t=(Math.max(0,time)*1000)%total,i=0;while(t>=holds[i]&&i<holds.length-1)t-=holds[i++];return i;}
function drawAsset(c,a,img,x,y,{frame=0,variant=0}={}){let w=a.native.width,h=a.native.height,o=a.native.origin;c.drawImage(img,frame*w,0,w,h,Math.round(x)-o[0],Math.round(y)-o[1],w,h);}
function drawActor(c,ref,meta,img,p,time=0){let [w,h]=ref.cell,row=meta.rows.indexOf(p.state||'idle');if(row<0)row=meta.rows.indexOf('idle');let f=actorFrame(meta,meta.rows[row],time),x=Math.round(p.x),y=Math.round(p.y);c.save();c.translate(x,y);if(p.facing===-1)c.scale(-1,1);c.drawImage(img,f*w,row*h,w,h,-ref.anchor[0],-ref.anchor[1],w,h);c.restore();}
function colliders(scene,assets){return scene.entities.flatMap(e=>assets.get(e.assetId).collision.defaults.map(c=>({...c,x:e.x+c.x,y:e.y+c.y,entityId:e.id})));}
function create(scene,assets){let p,paused=false,won=false,time=0,doorState='sealed',doorTime=0,heldJump=false;const cfg=scene.physics,geom=colliders(scene,assets),solids=geom.filter(c=>c.kind==='solid'),platforms=geom.filter(c=>c.kind!=='sensor');
 const body=(height=p.crouching?cfg.crouchHeight:cfg.playerHeight)=>({x:p.x-cfg.playerWidth/2,y:p.y-height,width:cfg.playerWidth,height});const overlap=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
 function reset(at=scene.spawn){p={...at,vx:0,vy:0,facing:1,onGround:true,crouching:false,state:'idle',phase:0};paused=false;won=false;time=0;doorState='sealed';doorTime=0;heldJump=false;return snapshot();}
 function update(dt,input={}){if(paused)return snapshot();dt=clamp(dt,0,.1);let press=!!input.jump&&!heldJump;heldJump=!!input.jump;
  for(let left=dt;left>0;){let step=Math.min(left,1/120);left-=step;time+=step;
   if(doorState==='opening'){doorTime+=step;if(doorTime>=.72){doorState='open';won=true;}}
   let crouch=!!cfg.crouchHeight&&!!input.down&&p.onGround;p.crouching=crouch||(p.crouching&&solids.some(c=>overlap(body(cfg.playerHeight),c)));
   let dir=(input.right?1:0)-(input.left?1:0);if(dir)p.facing=dir;let target=dir*(p.crouching?cfg.crouchSpeed:cfg.speed);p.vx+=clamp(target-p.vx,-cfg.acceleration*step,cfg.acceleration*step);
   if(press&&p.onGround&&!p.crouching){p.vy=-cfg.jumpSpeed;p.onGround=false;}press=false;
   let oldX=p.x;p.x=clamp(p.x+p.vx*step,cfg.playerWidth/2,scene.bounds.width-cfg.playerWidth/2);
   for(const b of solids)if(overlap(body(),b)){if(oldX+cfg.playerWidth/2<=b.x+.01){p.x=b.x-cfg.playerWidth/2;p.vx=0;}else if(oldX-cfg.playerWidth/2>=b.x+b.width-.01){p.x=b.x+b.width+cfg.playerWidth/2;p.vx=0;}}
   let oldY=p.y;p.vy=Math.min(cfg.maxFallSpeed,p.vy+cfg.gravity*step);p.y+=p.vy*step;p.onGround=false;
   for(const b of platforms){let rect=body();if(rect.x+rect.width<=b.x||rect.x>=b.x+b.width)continue;
    if(p.vy>=0&&oldY<=b.y+.02&&p.y>=b.y){p.y=b.y;p.vy=0;p.onGround=true;}
    else if(b.kind==='solid'&&p.vy<0&&oldY-rect.height>=b.y+b.height-.02&&p.y-rect.height<=b.y+b.height){p.y=b.y+b.height+rect.height;p.vy=0;}}
   if(p.y>scene.bounds.height+100)reset();
   p.phase+=step;p.state=p.crouching?(Math.abs(p.vx)>4?'crouch-walk':'crouch-idle'):!p.onGround?'jump':Math.abs(p.vx)>4?'run':'idle';
  }return snapshot();
 }
 function interact(){if(Math.abs(p.x-scene.door.entryX)>scene.door.interactionRadius||Math.abs(p.y-scene.door.entryY)>10)return false;if(doorState==='sealed'){doorState='latched';doorTime=0;}else if(doorState==='latched'){doorState='unlatched';doorTime=0;}else if(doorState==='unlatched'){doorState='opening';doorTime=0;}return true;}
 function snapshot(){return {player:{...p,hitbox:body()},time,paused,won,doorState,doorTime,camera:Math.round(clamp(p.x-scene.viewport[0]*.37,0,scene.bounds.width-scene.viewport[0]))};}
 reset();return {update,reset,snapshot,interact,pause(v){paused=!!v;return snapshot();},setDoor(state){doorState=state;doorTime=0;won=state==='open';return snapshot();},colliders:geom};
}
function drawScene(c,scene,registry,images,metas,snapshot,opts={}){let assets=new Map(registry.assets.map(a=>[a.assetId,a])),cam=Math.round(opts.camera??snapshot.camera??0),width=c.canvas.width,height=c.canvas.height,time=snapshot.time||0;
 c.imageSmoothingEnabled=false;c.fillStyle=scene.background;c.fillRect(0,0,width,height);c.fillStyle='#1a1c30';c.fillRect(0,Math.round(height*.3),width,height);const layers=registry.layers.filter(l=>l.id!=='sky');
 for(const layer of layers){if(opts.hidden?.has(layer.id))continue;
  if(layer.id==='actors'){
   let actorList=opts.staticActors||[{hero:opts.hero||'jane',...snapshot.player},...(opts.showCompanion===false?[]:scene.actors.filter(a=>a.role!=='player'))];
   for(const actor of actorList){let ref=registry.characters.find(a=>a.id===actor.hero&&a.family===scene.family),meta=metas.get(ref.metadata);drawActor(c,ref,meta,images.get(ref.uri),{...actor,x:actor.x-cam},actor.phase??time);}continue;
  }
  for(const e of scene.entities){if(e.layer!==layer.id)continue;const a=assets.get(e.assetId);let x=e.x,y=e.y,localTime=time+(e.animationOffset||0),state=e.state||'idle';
   if(e.motion==='rail'){x=((e.x+Math.floor(time*scene.environment.trainSpeed))%(scene.bounds.width+300))-100;}
   if(e.id===scene.door.entityId){state=snapshot.doorState||state;localTime=snapshot.doorTime||0;}
   if(x-a.native.origin[0]+a.native.width<cam||x-a.native.origin[0]>cam+width)continue;
   const v=e.variant||0,img=images.get(a.render.variants[v].uri);drawAsset(c,a,img,x-cam,y,{frame:frameAt(a,state,localTime),variant:v});
  }
 }
 if(opts.geometry){c.save();for(const b of colliders(scene,assets)){c.strokeStyle=b.kind==='solid'?'#b7df53':b.kind==='oneWay'?'#8fcac0':'#dbb578';c.setLineDash(b.kind==='oneWay'?[3,2]:b.kind==='sensor'?[2,3]:[]);c.strokeRect(Math.round(b.x-cam)+.5,b.y+.5,b.width-1,b.height-1);}c.setLineDash([]);const p=snapshot.player;if(p){let b=p.hitbox;c.strokeStyle='#f0a4b8';if(b)c.strokeRect(Math.round(b.x-cam)+.5,Math.round(b.y)+.5,b.width-1,b.height-1);}c.restore();}
}
return {frameAt,actorFrame,drawAsset,drawActor,colliders,create,drawScene};
});
