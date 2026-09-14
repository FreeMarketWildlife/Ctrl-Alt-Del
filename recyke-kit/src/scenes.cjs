const fs=require('fs'),path=require('path');const ROOT=path.resolve(__dirname,'..');const reg=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/registry.json')));const map=new Map(reg.assets.map(a=>[a.assetId,a]));reg.assemblies=[];
function create(family,spec){const F=require(`./${family}.cjs`),s={schemaVersion:1,id:`recyke-street-alley-${family}`,name:'Street to the concealed entrance',family,status:'environment-direction-review',canon:'Destination follows Intro; layout and interaction are a review staging proposal, not finished campaign.',viewport:F.viewport,bounds:{width:F.worldWidth,height:F.floor+F.terrain.h*2},background:'#101221',physics:F.physics,entities:[],actors:[],sections:spec.sections,door:null,environment:{wind:'none',trainSpeed:family==='mini'?22:34}};let n=0;
 const place=(key,x,y,options={})=>{let id=`cad.${family}.recyke.${key}`,a=map.get(id);if(!a)throw Error(id);const e={id:`${key}-${++n}`,assetId:id,assetRevision:1,x,y,variant:options.variant||0,layer:options.layer||a.render.layer,...options};s.entities.push(e);return e;};
 // Two separate layouts. Repetition adds unscaled native modules; it never stretches them.
 for(let x=0;x<s.bounds.width;x+=F.skyline.w)place('skyline',x,spec.skylineY,{variant:Math.floor(x/F.skyline.w)%2});
 for(let x=0;x<s.bounds.width;x+=family==='mini'?48:96)place('rail-beam',x,spec.railY);
 for(const x of spec.train)place('train-car',x,spec.railY,{motion:'rail',phase:x});
 for(const [start,count,y,type,variants] of spec.buildings){for(let i=0;i<count;i++){let x=start+i*F.facade.w;place(type,x,y,{variant:variants[i%variants.length]});place('roof',x,y-F.facade.h,{variant:i%3});}if(start+count*F.facade.w+F.corner.w<=F.worldWidth)place('corner',start+count*F.facade.w,y,{variant:1});}
 for(const [x,y] of spec.cables){place('cable',x,y);place('lamp',x+Math.floor(F.cable.w*.55),y+F.cable.sag);}
 // Fill variable-height ground by native cell adjacency; full tiles continue below viewport.
 let occupied=new Set(),T=F.terrain;
 for(let x=0;x<F.worldWidth;x+=T.w){let top=spec.rise&&x>=spec.rise[0]&&x<spec.rise[1]?F.floor-T.h:F.floor;for(let y=top;y<s.bounds.height;y+=T.h)occupied.add(`${x},${y}`);}
 for(const k of occupied){let [x,y]=k.split(',').map(Number),mask=0;for(const [dx,dy,bit] of [[0,-T.h,1],[T.w,0,2],[0,T.h,4],[-T.w,0,8]])if(occupied.has(`${x+dx},${y+dy}`))mask|=bit;place('street-'+mask.toString(16),x,y,{variant:(Math.floor(x/T.w)*7+Math.floor(y/T.h))%3});}
 for(const [x,y,key] of spec.crates)place(key,x,y);
 for(const [x,y,count] of spec.catwalks){for(let i=0;i<count;i++)place('catwalk-'+(i===0?'left':i===count-1?'right':'middle'),x+i*F.platform.w,y);for(const xx of [x+6,x+count*F.platform.w-F.support.w-6])place('support',xx,y+F.platform.h);}
 for(const [key,x,y,v=0] of spec.props)place(key,x,y,{variant:v});
 for(const [x,y,count] of spec.pipes){for(let i=0;i<count;i++)place('pipe-horizontal',x+i*F.pipeH.w,y,{variant:i%2});let ex=x+count*F.pipeH.w,ey=y+Math.floor(F.pipeH.h/2)-(F.elbow.y+Math.floor(F.elbow.bore/2));place('pipe-elbow',ex,ey);let vx=ex+F.elbow.x+Math.floor(F.elbow.bore/2)-Math.floor(F.pipeV.w/2);place('pipe-vertical',vx,ey+F.elbow.h);}
 const doorX=spec.doorX;place('recess',doorX,F.floor);let d=place('concealed-door',doorX+Math.floor((F.recess.w-F.door.w)/2),F.floor,{state:'sealed'});s.door={entityId:d.id,entryX:d.x+F.door.x+Math.floor(F.door.opening[0]/2),entryY:F.floor,interactionRadius:family==='mini'?30:68,behavior:'preview-inspect-entrance',note:'E cycles latch/open for review only; password and locks choreography remain unresolved.'};
 place('vent-fan',doorX-F.vent.w-5,F.floor-(family==='mini'?50:128));place('poster',doorX-24,F.floor-(family==='mini'?10:24),{variant:1});
 s.spawn={x:spec.spawn,y:F.floor};s.actors=[{hero:'jane',x:spec.spawn,y:F.floor,role:'player'},{hero:'jessie',x:spec.companion,y:F.floor,role:'scale-reference',state:'idle'}];s.approachSpawn={x:spec.approach,y:F.floor};
 fs.writeFileSync(path.join(ROOT,'scenes',`${family}.json`),JSON.stringify(s,null,2)+'\n');
 reg.assemblies.push({id:`cad.${family}.recyke.alley-entrance`,revision:1,family,origin:[0,0],children:[{localId:'reveal',assetId:`cad.${family}.recyke.recess`,position:[0,0]},{localId:'door',assetId:`cad.${family}.recyke.concealed-door`,position:[Math.floor((F.recess.w-F.door.w)/2),0]}],exposedProperties:{doorState:{target:'door',property:'state',values:['sealed','latched','unlatched','opening','open']}},repeat:false,behavior:'none; consumer binds the door entry socket'});
 return s;
}
create('mini',{spawn:55,companion:98,approach:1230,skylineY:170,railY:78,train:[80,148,216],doorX:1320,rise:[696,792],
 sections:[{id:'street',name:'01 / Main street',x:55},{id:'yard',name:'02 / Service frontage',x:480},{id:'alley',name:'03 / Concealed entrance',x:1230}],
 buildings:[[0,5,222,'facade',[0,1,2,0,2]],[384,3,222,'shutter',[0,1,0]],[648,3,222,'facade',[2,1,0]],[912,4,222,'facade',[1,2,1,0]],[1184,4,222,'alley-wall',[0,1]]],cables:[[4,107],[209,110],[940,103],[1140,108]],
 crates:[[280,222,'crate-low'],[324,222,'crate-tall'],[875,222,'crate-low']],catwalks:[[348,178,6]],
 props:[['bins',170,222],['fix-sign',270,148],['poster',235,204],['vent-fan',94,175],['press',500,222],['boiler',609,222],['scrap',565,222,1],['scrap',832,222,2],['bins',1025,222],['poster',1130,209,1],['fix-sign',785,142],['drain',119,244],['puddle',390,249],['puddle',946,247],['drain',1166,244],['scrap',1400,222]],pipes:[[21,163,3],[1050,170,3]]});
create('big',{spawn:112,companion:218,approach:2210,skylineY:222,railY:81,train:[34,163,292],doorX:2330,rise:[1392,1584],
 sections:[{id:'street',name:'01 / Main street',x:112},{id:'yard',name:'02 / Service frontage',x:1060},{id:'alley',name:'03 / Concealed entrance',x:2210}],
 buildings:[[0,4,308,'facade',[0,2,1,0]],[752,3,308,'shutter',[0,1,0]],[1328,3,308,'facade',[2,1,0]],[1888,2,308,'facade',[1,2]],[2240,2,308,'alley-wall',[0,1]]],cables:[[20,95],[420,102],[1900,105],[2140,105]],
 crates:[[553,308,'crate-low'],[670,308,'crate-tall'],[1632,308,'crate-low']],catwalks:[[728,217,7]],
 props:[['bins',312,308],['fix-sign',555,148],['poster',470,247],['vent-fan',129,178],['press',1090,308],['boiler',1273,308],['scrap',940,308,1],['scrap',1740,308,2],['bins',1990,308],['poster',2225,277,1],['fix-sign',1720,143],['drain',265,339],['puddle',785,350],['puddle',1810,351],['drain',2170,341],['scrap',2465,308]],pipes:[[28,210,4],[2034,222,3]]});
fs.writeFileSync(path.join(ROOT,'assets/registry.json'),JSON.stringify(reg,null,2)+'\n');fs.writeFileSync(path.join(ROOT,'assets/assemblies.json'),JSON.stringify(reg.assemblies,null,2)+'\n');console.log('Authored independent mini and big layouts.');
