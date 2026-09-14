'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');const {createCanvas}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),active=path.join(root,'recyke-development'),archive=path.join(root,'archive/pre-mini-2026-09-14/recyke-development');
function load(dir){const box={window:{},document:{createElement:()=>createCanvas(1,1)}};vm.createContext(box);for(const name of ['jane-motion','jessie-motion','enemy-mech-motion','jane','jessie','enemy-mechs','enemy-drones','enemies']){vm.runInContext(fs.readFileSync(path.join(dir,name+'.js'),'utf8'),box);Object.assign(box,box.window);}return box;}
const original={window:{},document:{createElement:()=>createCanvas(1,1)}};vm.createContext(original);for(const name of ['jane-motion','jessie-motion','jane','jessie']){vm.runInContext(fs.readFileSync(path.join(__dirname,'crouch-baseline',name+'.js'),'utf8'),original);Object.assign(original,original.window);}
const current=load(active),before=load(archive),failures=[],stats=[],same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function raster(A,state,frame,facing=1){const cv=createCanvas(144,144),c=cv.getContext('2d');A.draw(c,'mini',68,88,{state,frame,time:A.durations[state].slice(0,frame).reduce((a,b)=>a+b,0)/1000,facing});return {cv,c,data:c.getImageData(0,0,144,144).data};}
let cases=0;
for(const name of ['Jane','Jessie']){
 const A=current['CAD'+name],B=before['CAD'+name],M=current['CAD'+name+'Motion'],O=before['CAD'+name+'Motion'];
 assert(B.states.every(s=>A.states.includes(s)));for(const state of B.states)assert(same(A.durations[state],B.durations[state]));assert(same(A.specs.mini,B.specs.mini));assert(same(Object.keys(A.specs),['mini']));assert.equal(A.columns,12);
 assert.equal(A.palette.length,16);assert.throws(()=>A.draw(createCanvas(128,128).getContext('2d'),'big',64,112),/archived/);
 for(const state of A.states){const count=A.durations[state].length;let ms=0;for(let frame=0;frame<count;frame++){
  if(B.states.includes(state))assert(same(M.sample('mini',state,frame),O.sample('mini',state,frame)),`${name} ${state} ${frame}: original motion`);
  assert.equal(A.frameAt(state,ms/1000+1e-7),frame);ms+=A.durations[state][frame];
  for(const facing of [1,-1]){
   const {cv,c,data}=raster(A,state,frame,facing);if(original['CAD'+name].states.includes(state))assert.equal(hash(data),hash(raster(original['CAD'+name],state,frame,facing).data),`${name}/${state}/${frame}/${facing}: original Proposal A pixels changed`);const ink=[],cols=new Set();let minX=144,maxX=-1,minY=144,maxY=-1;
   for(let y=0;y<144;y++)for(let x=0;x<144;x++){const i=(y*144+x)*4,a=data[i+3];if(!a)continue;ink.push(y*144+x);assert.equal(a,255);cols.add('#'+[...data.slice(i,i+3)].map(v=>v.toString(16).padStart(2,'0')).join(''));minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
   const label=`${name}/${state}/${frame}/${facing}`;if(minX<48||maxX>=96||minY<48||maxY>=96)failures.push(label+' clips native cell');
   if([...cols].some(v=>!A.palette.includes(v)))failures.push(label+' off palette');
   // Crown must connect to the principal body; detached muzzle flash is permitted.
   const seen=new Set(),stack=[ink[0]];while(stack.length){const p=stack.pop();if(seen.has(p))continue;seen.add(p);const x=p%144,y=Math.floor(p/144);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,q=yy*144+xx;if(xx>=0&&xx<144&&yy>=0&&yy<144&&data[q*4+3]&&!seen.has(q))stack.push(q);}}
   if(seen.size<ink.length*.8)failures.push(label+` head/body disconnected (${seen.size}/${ink.length})`);
   if(M.contactFrames[state]?.includes(frame)&&maxY!==87)failures.push(label+' contact off floor');
   if(state==='idle'&&frame===0)assert.equal(maxY-minY+1,32);
   if(state.startsWith('crouch-')){assert.equal(maxY,87,label+' low pose floor');assert(maxY-minY+1<=18,label+' low pose headroom');}
   // Skin/cloth ramps must never revert to original outfit colors.
   if(!cols.has(name==='Jane'?'#653a86':'#66313c'))failures.push(label+' missing jacket midtone');
   cases++;
  }
 }
 const strip=createCanvas(count*48,48);for(let f=0;f<count;f++)A.draw(strip.getContext('2d'),'mini',f*48+20,40,{state,frame:f});fs.writeFileSync(path.join(__dirname,'assets',`${name.toLowerCase()}-${state}.png`),strip.toBuffer('image/png'));
 }
 for(const [move,fire]of [['run','run-fire'],['jump','jump-fire'],['crouch-walk','crouch-walk-fire']])for(let f=0;f<A.durations[move].length;f++){const region=move==='crouch-walk'?[48,48,38,48]:[48,78,48,10];assert.equal(hash(raster(A,move,f).c.getImageData(...region).data),hash(raster(A,fire,f).c.getImageData(...region).data),`${name} ${move} legs independent of firing`);}
 const sheet=A.sheet('mini');assert.equal(sheet.width,576);assert.equal(sheet.height,48*A.states.length);const sc=sheet.getContext('2d');
 A.states.forEach((state,row)=>{for(let col=0;col<12;col++){const f=Math.min(col,A.durations[state].length-1);assert.equal(hash(sc.getImageData(col*48,row*48,48,48).data),hash(raster(A,state,f).c.getImageData(48,48,48,48).data),'sheet/draw equality');}});
 for(const d of ['jane-development','enemy-development','recyke-development',...(name==='Jessie'?['jessie-refinement']:[])]){const dest=path.join(root,d,'assets',name.toLowerCase());fs.mkdirSync(dest,{recursive:true});fs.writeFileSync(path.join(dest,name.toLowerCase()+'-mini.png'),sheet.toBuffer('image/png'));fs.writeFileSync(path.join(dest,name.toLowerCase()+'-animation.json'),JSON.stringify(A.metadata(),null,2)+'\n');}
 fs.writeFileSync(path.join(__dirname,'assets',name.toLowerCase()+'-all.png'),sheet.toBuffer('image/png'));stats.push({name,actions:A.states.length,poses:A.states.reduce((a,s)=>a+A.durations[s].length,0)});
}
// All enemy mini frames must be byte-identical to their approved baseline.
let enemyCases=0;for(const entry of current.CADEnemies.entries){const A=current.CADEnemies.adapter(entry.id),B=before.CADEnemies.adapter(entry.id);for(const state of A.states)for(let f=0;f<A.durations[state].length;f++)for(const facing of [1,-1]){assert.equal(hash(raster(A,state,f,facing).data),hash(raster(B,state,f,facing).data),entry.id+' mini changed');enemyCases++;}for(const d of ['enemy-development','recyke-development']){const dir=path.join(root,d,'assets/enemies');fs.writeFileSync(path.join(dir,entry.id+'-animation.json'),JSON.stringify(current.CADEnemies.metadata(entry.id),null,2)+'\n');}}
for(const[file,h]of Object.entries(JSON.parse(fs.readFileSync(path.join(__dirname,'original-backups.json')))))assert.equal(hash(fs.readFileSync(path.join(root,file))),h,file+' original backup changed');
console.log({cases,enemyCases,stats,failures});fs.writeFileSync(path.join(__dirname,'assets/checks.json'),JSON.stringify({cases,enemyCases,stats,failures},null,2)+'\n');assert.deepEqual(failures,[]);
