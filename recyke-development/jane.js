/* ACTIVE MINI MASTER — Proposal A. 48×48 / feet (20,40).
 * Large renderer archived in archive/pre-mini-2026-09-14. */
(() => {
  'use strict';
  const palette=['#101620','#1d2634','#29364d','#42536a','#668ec4',
    '#754b51','#b87569','#edb58d','#321c28','#662d3b','#a6504d',
    '#352449','#653a86','#9564bd','#b7df53','#d4ccad'];
  const P=Object.fromEntries('0123456789abcdef'.split('').map((key,i)=>[key,palette[i]]));
  const specs={mini:{width:48,height:48,anchor:[20,40],heightPx:32}};
  const states=['idle','stand','walk','run','fire','run-fire','jump','jump-fire','crouch','jab','cross','front-kick','round-kick','hurt','crouch-idle','crouch-walk','crouch-fire','crouch-walk-fire'];
  const durations=CADJaneMotion.timings,columns=12;
  const loop=(f,n)=>((Math.trunc(f)||0)%n+n)%n;
  function frameAt(state,time){const times=durations[state]||durations.idle,total=times.reduce((a,b)=>a+b,0);let ms=((time*1000)%total+total)%total;for(let i=0;i<times.length;i++){if(ms<times[i])return i;ms-=times[i];}return 0;}
  function raster(c){
    const rect=(color,x,y,w=1,h=1)=>{if(w<=0||h<=0)return;c.fillStyle=P[color]||color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const poly=(color,points)=>{const pts=points.map(([x,y])=>[Math.round(x),Math.round(y)]),lo=Math.min(...pts.map(p=>p[1])),hi=Math.max(...pts.map(p=>p[1]));for(let y=lo;y<hi;y++){const hits=[],scan=y+.5;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=scan&&b[1]>scan)||(b[1]<=scan&&a[1]>scan))hits.push(a[0]+(scan-a[1])*(b[0]-a[0])/(b[1]-a[1]));}hits.sort((a,b)=>a-b);for(let i=0;i+1<hits.length;i+=2){const x=Math.ceil(hits[i]-.5),end=Math.ceil(hits[i+1]-.5);rect(color,x,y,end-x,1);}}};
    const disk=(color,x,y,r)=>{for(let dy=-r;dy<=r;dy++){const span=Math.floor(Math.sqrt(r*r-dy*dy));rect(color,x-span,y+dy,span*2+1,1);}};
    const stamp=(rows,x,y)=>rows.forEach((row,dy)=>[...row].forEach((color,dx)=>{if(color!=='.')rect(color,x+dx,y+dy);}));
    return {rect,poly,disk,stamp};
  }
  const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  const offset=(p,n,w)=>[p[0]+n[0]*w,p[1]+n[1]*w];
  function normal(a,b){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1;return [-dy/d,dx/d];}
  function band(poly,color,a,b,wa,wb){const n=normal(a,b);poly(color,[offset(a,n,wa),offset(b,n,wb),offset(b,n,-wb),offset(a,n,-wa)]);}
  function patch(poly,color,a,b,start,end,left,right){const n=normal(a,b),u=mix(a,b,start),v=mix(a,b,end);poly(color,[offset(u,n,left),offset(v,n,left),offset(v,n,right),offset(u,n,right)]);}
  function elbow(s,h,a=17,b=16){const dx=h[0]-s[0],dy=h[1]-s[1],distance=Math.hypot(dx,dy)||.001,d=Math.min(a+b-.01,distance),along=(a*a-b*b+d*d)/(2*d),height=Math.sqrt(Math.max(0,a*a-along*along));return [s[0]+dx/distance*along-dy/distance*height,s[1]+dy/distance*along+dx/distance*height];}

  // Sweep one connected taper along the authored hair chain. Interior highlights
  // follow broad locks, not independent strands that flicker from frame to frame.
  function ponytail(p,r,points,small){
    const widths=CADJaneMotion.dimensions[small?'mini':'big'].hair.widths;
    const normals=points.map((q,i)=>normal(points[Math.max(0,i-1)],points[Math.min(points.length-1,i+1)]));
    const ribbon=(color,shrink,shift=0)=>{const left=points.map((q,i)=>offset(q,normals[i],Math.max(.2,widths[i]-shrink)+shift)),right=points.map((q,i)=>offset(q,normals[i],-Math.max(.2,widths[i]-shrink)+shift));p(color,left.concat(right.reverse()));};
    ribbon('0',0);ribbon('8',.7);ribbon('9',small?1:1.5,small?0:.4);
    if(!small){const ridge=points.slice(0,4).map(q=>[q[0],q[1]-1]);for(let i=0;i<2;i++)band(p,'a',ridge[i],mix(ridge[i],ridge[i+1],.8),i?1:.7,1);}
    const root=points[0];r('8',root[0],root[1]-2,small?3:5,small?3:5);
    r('c',root[0]-1,root[1]-1,small?2:3,small?2:4);r('e',root[0]-1,root[1]-1,1,small?1:2);
  }
  const miniHead=['..88888..','.899a998.','899988775','899877775','.98670475','.98677770','..567775.','...5665..'];
  function low(c,state,f){
    const {rect:r,poly:p,disk,stamp}=raster(c),pose=CADJaneMotion.sample('mini',state,f);
    function leg(q,back){
      band(p,'0',q.hip,q.knee,2.4,1.8);disk('0',...q.knee,2);band(p,'0',q.knee,q.ankle,1.8,1.3);
      band(p,back?'1':'2',q.hip,q.knee,1.4,.9);band(p,back?'1':'3',q.knee,q.ankle,.9,.8);
      // Compact boots retain the original ankle and pitched sole geometry.
      const a=q.ankle,co=Math.cos(q.pitch),si=Math.sin(q.pitch),local=pts=>pts.map(([x,y])=>[a[0]+x*co-y*si,a[1]+x*si+y*co]);
      p('0',local([[-2,-3],[1,-3],[2,0],[4,1],[4,3],[-2,3]]));p(back?'2':'4',local([[-1,1],[3,1],[3,2],[-1,2]]));
    }
    ponytail(p,r,pose.hair,true);
    leg(pose.far,true);leg(pose.near,false);
    // Purple jacket leans from the folded hips to the forward shoulder.
    p('0',[[-6,-7],[-3,-11],[2,-13],[6,-11],[5,-6],[0,-3],[-5,-4]]);
    p('b',[[-5,-7],[-2,-10],[2,-12],[5,-10],[4,-7],[0,-4],[-4,-5]]);
    p('c',[[-4,-8],[-1,-10],[2,-11],[3,-8],[-1,-5],[-4,-5]]);
    r('d',-1,-10,3,2);r('e',0,-10,2,1);r('0',-5,-5,6,2);r('f',-1,-5,2,1);
    const tear=mix(pose.near.hip,pose.near.knee,.7);r('7',tear[0],tear[1],1,1);
    r('5',2,-13,3,4);stamp(miniHead,0,-18);r('0',3,-11,3,1);r('e',3,-11,1,1);
    const shot=state.includes('fire')&&(state==='crouch-fire'?f===0:f%3===0),recoil=state==='crouch-fire'&&f===1?-1:0;
    // Both hands stay at the lowered gun. Firing never restarts the foot cycle.
    r('0',4,-11,4,5);r('c',4,-10,3,3);r('d',4,-10,1,2);
    r('0',5,-7,8,3);r('7',6,-7,5,1);r('1',11,-8,3,3);
    r('e',4,-9,2,1);
    r('0',8+recoil,-10,10,4);r('3',9+recoil,-10,8,1);r('d',11+recoil,-9,6,1);
    r('0',10+recoil,-6,2,3);r('7',10+recoil,-7,2,1);
    if(shot){r('d',18,-10,2,3);r('f',18,-9,2,1);}
  }
  function mini(c,state,f){const {rect:r,poly:p,disk,stamp}=raster(c),pose=CADJaneMotion.sample('mini',state,f),armed=['idle','fire','run-fire','jump-fire','crouch'].includes(state);
    ponytail(p,r,pose.hair,true);
    function leg(shape,back){const h=shape.hip,k=shape.knee,a=shape.ankle;band(p,'0',h,k,2.4,1.8);disk('0',k[0],k[1],1);band(p,'0',k,a,1.8,1.3);band(p,back?'1':'2',h,k,1.4,.8);band(p,back?'1':'3',k,a,.8,.7);const co=Math.cos(shape.pitch||0),si=Math.sin(shape.pitch||0),local=pts=>pts.map(([x,y])=>[a[0]+x*co-y*si,a[1]+x*si+y*co]);p('0',local([[-2,-3],[1,-3],[2,0],[4,1],[4,3],[-2,3]]));p(back?'2':'4',local([[-1,1],[3,1],[3,2],[-1,2]]));}
    leg(pose.far,true);leg(pose.near,false);
    const tear=mix(pose.near.hip,pose.near.knee,.78);r('7',tear[0]-1,tear[1],2,1);
    c.save();c.translate(Math.round(pose.lean),Math.round(pose.bob));
    const wave=[-3,-3,-2,-1,1,2,3,3,2,1,-1,-2][f%12];
    function hand(x,y){r('0',x-1,y-1,3,3);r('7',x+1,y,1,1);}
    function arm(s,e,h,back){band(p,'0',s,e,1.7,1.5);band(p,'0',e,h,1.5,1.2);disk('0',e[0],e[1],1);band(p,back?'b':'c',s,e,1,.8);band(p,back?'b':'d',e,h,.8,.7);if(!back)r('e',s[0]-1,s[1]+2,2,1);hand(...h);}
    const travel=state==='walk'||state==='run',stand=state==='stand',cross=state==='cross';
    if(travel){const e=[2-wave,-19],h=state==='run'?[e[0]+3,e[1]-3]:[2-wave,-14];arm([2,-24],e,h,true);}
    else if(stand)arm([2,-24],[3,-19],[3,-14],true);
    else if(cross){const reach=[5,7,11,11,7,5][f];arm([2,-24],[6,-24],[reach,-24],true);}
    else if(armed)arm([2,-24],[4,-18],[8,-21],true);else arm([2,-24],[5,-20],[5,-24],true);
    p('0',[[-3,-26],[1,-26],[5,-23],[4,-19],[2,-17],[4,-14],[0,-12],[-4,-13],[-5,-15],[-4,-18],[-5,-23]]);
    p('b',[[-3,-25],[1,-25],[4,-23],[3,-19],[1,-17],[3,-14],[0,-13],[-3,-14],[-4,-15],[-3,-18],[-4,-23]]);
    p('c',[[-3,-24],[0,-24],[1,-21],[-1,-18],[0,-14],[-3,-14],[-3,-19],[-4,-22]]);
    r('d',-3,-24,2,4);r('e',-3,-24,1,2);r('1',1,-23,2,7);r('3',1,-20,1,4);r('f',1,-19,1,1);r('0',-3,-14,6,2);r('f',0,-14,2,1);
    r('5',0,-27,2,4);r('6',1,-27,1,4);stamp(miniHead,-2,-32);r('0',1,-25,2,1);r('e',1,-25,1,1);
    if(travel){const e=[-2+wave,-19],h=state==='run'?[e[0]+3,e[1]-3]:[-2+wave,-13];arm([-2,-24],e,h,false);}
    else if(stand)arm([-2,-24],[-3,-19],[-2,-13],false);
    else if(state==='jab'){const reach=[2,5,8,8,4,2][f];arm([-2,-24],[2,-22],[reach,-24],false);r('0',reach,-25,3,3);r('7',reach+2,-24,1,2);}
    else if(!armed)arm([-2,-24],[-2,-20],[3,state==='jump'?-26:-24],false);
    else{arm([-2,-24],[-2,-19],[5,-21],false);r('0',5,-24,10,4);r('3',6,-24,7,1);r('b',8,-23,6,1);r('d',11,-23,3,1);r('0',7,-21,2,4);r('0',11,-21,2,1);r('7',5,-21,2,1);if(state.includes('fire')&&(state==='fire'?f===0:f%3===0)){r('d',15,-25,2,5);r('f',15,-23,2,1);}}
    c.restore();
  }
  function draw(c,size,x,feet,{state='idle',time=0,frame=null,facing=1}={}){if(size!=='mini')throw new RangeError('Large models are archived; use mini.');if(!durations[state])state='idle';const f=frame==null?frameAt(state,time):loop(frame,durations[state].length);c.save();c.translate(Math.round(x),Math.round(feet));c.scale(facing<0?-1:1,1);(state.startsWith('crouch-')?low:mini)(c,state,f);c.restore();}
  function sheet(size='mini'){const s=specs[size],canvas=document.createElement('canvas');canvas.width=s.width*columns;canvas.height=s.height*states.length;const c=canvas.getContext('2d');states.forEach((state,row)=>{for(let f=0;f<columns;f++)draw(c,size,f*s.width+s.anchor[0],row*s.height+s.anchor[1],{state,frame:Math.min(f,durations[state].length-1)});});return canvas;}
  function metadata(){
    const M=CADJaneMotion;
    return {name:'Jane',sourcePixelWorldUnits:1,
      framePadding:'Repeat final authored pose to fill 12 columns',palette,sizes:specs,columns,rows:states,timingMs:durations,
      frameCounts:Object.fromEntries(states.map(state=>[state,durations[state].length])),
      loops:M.loops,contactFrames:M.contactFrames,
      phases:Object.fromEntries(states.map(state=>[state,durations[state].map((_,f)=>M.sample('mini',state,f).phase)])),
      hair:Object.fromEntries(['mini'].map(size=>[size,{dimensions:M.dimensions[size].hair,
        poses:Object.fromEntries(states.map(state=>[state,durations[state].map((_,f)=>M.sample(size,state,f).hair)]))}]))};
  }
  window.CADJane={palette,specs,states,durations,columns,frameAt,draw,sheet,metadata};
})();
