const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const button=()=>({textContent:'',classList:{add(){},remove(){}}});
const input=new Set(),touch={x:0,y:0};let message='',retry,buttons=[];
const context={window:{},document:{createElement:button},Math,CADFlightArt:{city(){},car(){},enemy(){}}};vm.createContext(context);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../flight-level.js'),'utf8'),context);
const game=context.window.CADFlightLevel.create({ctx:new Proxy({},{get:()=>()=>{},set:()=>true}),input,touch,audio(){},showMessage(title,text,label,fn){message=title;retry=fn;},hideMessage(){message='';},controls:{classList:{add(){},remove(){}},querySelector:button,appendChild(b){buttons.push(b);}},gameTitle:{},gameMeta:{},releaseInputs(){input.clear();touch.x=touch.y=0;}});
game.start();game.update(-1);assert.equal(game.snapshot().elapsed,0);
input.add('up');for(let i=0;i<100;i++)game.update(1/60);assert.equal(game.snapshot().p.y,48);input.clear();
touch.y=1;for(let i=0;i<100;i++)game.update(1/60);assert.equal(game.snapshot().p.y,222);touch.y=0;
input.add('punch');game.update(1/60);assert(game.snapshot().p.shield>2);assert(game.snapshot().p.cooldown>6);input.clear();
buttons[1].onclick();const pausedTime=game.snapshot().elapsed;game.update(.03);assert.equal(game.snapshot().elapsed,pausedTime);buttons[1].onclick();
game.start();
// A simple pilot follows targets and uses the rechargeable shield. No state mutation.
for(let i=0;i<10000&&!game.snapshot().ended;i++){
  const s=game.snapshot(),target=s.enemies.find(e=>e.kind==='boss')||s.enemies.find(e=>e.x>150);
  input.clear();if(target){if(target.y>s.p.y+2)input.add('down');if(target.y<s.p.y-2)input.add('up');}if(!s.p.cooldown)input.add('punch');game.update(1/60);game.draw();
}
assert.equal(message,'SKYVIEW REACHED');assert(game.snapshot().bossSpawned);assert(game.snapshot().p.hp>0);retry();assert.equal(game.snapshot().elapsed,0);assert.equal(game.snapshot().p.hp,100);assert.equal(game.snapshot().ended,false);
// Remaining stationary must eventually lose; retry must recover from defeat too.
for(let i=0;i<18000&&!game.snapshot().ended;i++)game.update(1/60);
assert.equal(message,'CAR DISABLED');retry();assert.equal(game.snapshot().p.hp,100);
console.log('Flight: keyboard/touch movement, bounds, shield, pause, complete win, defeat and retry passed.');
