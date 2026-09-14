/* Jane master: separately authored big/mini pixels on the shared world grid.
 * Motion owns fixed-length joints and delayed hair; this file owns silhouettes,
 * material clusters and native rasterization. No sprite/body-part rescaling.
 */
(() => {
  'use strict';
  const palette=['#101620','#1d2634','#29364d','#42536a','#72838e',
    '#754b51','#b87569','#edb58d','#242137','#453656','#756184',
    '#482c51','#86416c','#bf6695','#f0a4b8','#d4ccad'];
  const P=Object.fromEntries('0123456789abcdef'.split('').map((key,i)=>[key,palette[i]]));
  const specs={big:{width:128,height:128,anchor:[64,112],heightPx:96},mini:{width:48,height:48,anchor:[20,40],heightPx:32}};
  const states=['idle','stand','walk','run','fire','run-fire','jump','jump-fire','crouch','jab','cross','front-kick','round-kick','hurt'];
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
  const bigHead=[
    '.....888888.......',
    '...889999998......',
    '..899aaaa9998.....',
    '.899aaa999998.....',
    '.899a998887775....',
    '.89999887777775...',
    '.89998877777775...',
    '..8998677000775...',
    '..89876777f07775..',
    '..898767777777750.',
    '...8856777777750..',
    '....85677767750...',
    '.....567775550....',
    '.....56777750.....',
    '......567750......',
    '......56655.......'
  ];
  function big(c,state,f){
    const {rect:r,poly:p,disk,stamp}=raster(c),pose=CADJaneMotion.sample('big',state,f);
    const point=(x,y)=>[x+pose.lean*Math.max(0,Math.min(1,(-y-46)/34)),y+pose.bob];
    const body=(color,pts)=>p(color,pts.map(q=>point(...q)));
    const armed=['idle','fire','run-fire','jump-fire','crouch'].includes(state),fire=state.includes('fire');
    const shot=fire&&(state==='fire'?f===0:f%3===0),recoil=shot?-1:0;
    ponytail(p,r,pose.hair,false);
    function boot(shape,back){const a=shape.ankle,angle=shape.pitch||0,co=Math.cos(angle),si=Math.sin(angle),local=pts=>pts.map(([x,y])=>[a[0]+x*co-y*si,a[1]+x*si+y*co]);
      p('0',local([[-4,-8],[3,-8],[4,-2],[9,0],[11,2],[11,5],[-4,5]]));
      p(back?'1':'2',local([[-3,-7],[2,-7],[3,-1],[8,1],[9,3],[-3,3]]));
      p(back?'2':'3',local([[-3,-6],[0,-6],[0,0],[-2,2],[-3,2]]));
      p(back?'3':'4',local([[-2,-7],[1,-7],[1,-5],[-2,-5]]));
      p(back?'2':'f',local([[-3,3],[9,3],[9,4],[-3,4]]));
      p('0',local([[-3,-2],[2,-2],[2,-1],[-3,-1]]));
    }
    function leg(shape,back){const h=shape.hip,k=shape.knee,a=shape.ankle;
      band(p,'0',h,k,6,4);disk('0',k[0],k[1],4);band(p,'0',k,a,4,3);
      band(p,back?'1':'2',h,k,5,3);disk(back?'1':'2',k[0],k[1],3);band(p,back?'1':'2',k,a,3,2);
      patch(p,back?'2':'3',h,k,.13,.62,1,4);patch(p,back?'2':'3',k,a,.17,.7,0,2);
      patch(p,'1',h,k,.57,.68,-3,2);patch(p,'1',k,a,.12,.21,-2,2);
      if(!back){patch(p,'4',h,k,.18,.32,3,4);const n=normal(k,a),t=mix(k,a,.17);p('0',[offset(k,n,4),offset(t,n,4),offset(t,n,-3),offset(k,n,-3)]);patch(p,'3',k,a,0,.14,-2,3);patch(p,'4',k,a,.01,.04,-1,2);}
      boot(shape,back);
    }
    leg(pose.far,true);leg(pose.near,false);
    body('0',[[-10,-52],[9,-52],[12,-45],[7,-39],[-8,-40],[-12,-45]]);
    body('2',[[-9,-51],[8,-51],[10,-45],[6,-41],[-7,-42],[-10,-45]]);
    body('3',[[-8,-49],[-1,-49],[-1,-44],[-7,-44]]);
    body('1',[[0,-49],[3,-49],[4,-41],[1,-41]]);
    function glove(h,back,punch=false){r('0',h[0]-3,h[1]-3,punch?8:6,6);r(back?'1':'2',h[0]-2,h[1]-2,4,4);r('4',h[0]-2,h[1]-2,2,1);r(back?'6':'7',h[0]+2,h[1]-2,punch?3:2,4);}
    function arm(shoulder,hand,back=false,knownElbow=null,punch=false){const s=point(...shoulder),h=point(...hand),e=knownElbow?point(...knownElbow):elbow(s,h),n=normal(s,e),m=normal(e,h),at=(a,b,t,w)=>offset(mix(a,b,t),normal(a,b),w);
      const contour=(color,inset)=>p(color,[offset(s,n,3.5-inset),at(s,e,.25,4.5-inset),at(s,e,.75,3.5-inset),offset(e,n,3-inset),offset(e,m,3-inset),at(e,h,.4,3.5-inset),offset(h,m,2.5-inset),offset(h,m,-2.5+inset),at(e,h,.35,-2.5+inset),offset(e,m,-2.5+inset),offset(e,n,-2.5+inset),at(s,e,.3,-3.5+inset),offset(s,n,-3+inset),at(s,e,-.13,-1)]);
      contour('0',0);contour(back?'b':'c',.8);
      const lit=(a,b,t,w)=>{const q=normal(a,b);return offset(mix(a,b,t),q,(q[0]+q[1]>0?-1:1)*w);};
      p(back?'c':'d',[lit(s,e,0,0),lit(s,e,.18,3),lit(s,e,.43,2),lit(s,e,.72,1),lit(s,e,.62,-1),lit(s,e,.15,-2)]);
      p(back?'c':'d',[lit(e,h,.16,1),lit(e,h,.32,2),lit(e,h,.75,1),lit(e,h,.75,-1),lit(e,h,.3,-1)]);
      if(!back){p('e',[lit(s,e,.05,0),lit(s,e,.13,2),lit(s,e,.26,2),lit(s,e,.19,0)]);patch(p,'b',s,e,.75,.83,-2,2);}
      band(p,'1',mix(e,h,.79),h,3,2.5);patch(p,back?'2':'3',e,h,.81,.87,-2,2);glove(h,back,punch);
    }
    const swing=[-.52,-.44,-.3,-.1,.16,.4,.52,.44,.3,.1,-.16,-.4][f%12];
    function travelArm(back,running){const sx=back?6:-9,sy=-75,theta=(back?-swing:swing)*(running?1.35:1),e=[sx+Math.sin(theta)*17,sy+Math.cos(theta)*17];const h=running?[e[0]+Math.cos(-.8+theta*.6)*16,e[1]+Math.sin(-.8+theta*.6)*16]:[e[0]+Math.sin(theta*.6)*16,e[1]+Math.cos(theta*.6)*16];arm([sx,sy],h,back,e);}
    const guard=()=>arm([6,-75],[15,-70],true);
    if(state==='walk'||state==='run')travelArm(true,state==='run');
    else if(state==='stand')arm([6,-75],[9,-44],true);
    else if(state==='cross'){const reach=[15,22,36,37,23,15][f];arm([6,-75],[reach,-72],true,null,true);}
    else if(armed)arm([6,-75],[25+recoil,-63],true);else guard();

    // Magenta jacket: short stand collar, sloping shoulder, ribcage, waist,
    // then a small practical hem. Skin and chest are not a reskinned Jessie.
    body('0',[[-5,-83],[3,-83],[5,-80],[10,-78],[12,-73],[12,-66],[8,-57],[8,-52],[11,-47],[5,-45],[-8,-46],[-12,-49],[-10,-57],[-13,-68],[-12,-76],[-8,-79]]);
    body('b',[[-5,-82],[2,-82],[4,-79],[9,-77],[10,-72],[10,-66],[6,-57],[6,-52],[9,-48],[4,-47],[-7,-48],[-10,-50],[-8,-57],[-11,-68],[-10,-76],[-7,-78]]);
    body('c',[[-6,-79],[-1,-79],[3,-76],[4,-69],[1,-59],[1,-51],[-6,-49],[-9,-51],[-7,-58],[-10,-68],[-9,-75]]);
    body('d',[[-6,-78],[-2,-78],[0,-75],[0,-71],[-4,-70],[-8,-72],[-8,-75]]);
    body('e',[[-6,-78],[-3,-78],[-1,-75],[-4,-75]]);
    body('d',[[-7,-66],[-3,-66],[-1,-62],[-2,-59],[-6,-60]]);
    body('1',[[1,-79],[6,-77],[8,-73],[7,-68],[4,-61],[4,-53],[1,-52],[2,-65],[-1,-74]]);
    body('2',[[2,-77],[5,-75],[6,-71],[3,-69],[1,-73]]);
    body('d',[[5,-78],[8,-75],[9,-72],[6,-68],[4,-65],[5,-71]]);
    body('e',[[5,-77],[7,-75],[7,-73],[5,-74]]);
    body('3',[[3,-65],[4,-65],[3,-54],[2,-54]]);
    body('f',[[3,-63],[4,-63],[4,-61],[3,-61]]);
    body('b',[[-8,-62],[-4,-61],[-3,-59],[-7,-59]]);
    body('b',[[-7,-54],[-2,-55],[-2,-53],[-7,-52]]);
    body('d',[[-7,-53],[-3,-54],[-3,-53],[-7,-51]]);
    body('0',[[-9,-49],[8,-49],[9,-46],[-10,-46]]);
    body('1',[[-8,-48],[7,-48],[7,-46],[-9,-46]]);
    body('f',[[1,-49],[5,-49],[5,-46],[1,-46]]);
    body('3',[[2,-48],[4,-48],[4,-46],[2,-46]]);
    body('0',[[-11,-49],[-8,-49],[-8,-43],[-12,-43]]);
    body('b',[[-11,-48],[-9,-48],[-9,-44],[-11,-44]]);
    // Neck and head share the body's exact vertical displacement.
    body('5',[[-1,-84],[5,-84],[5,-79],[7,-77],[3,-74],[-2,-78]]);
    body('6',[[0,-83],[4,-83],[4,-79],[5,-77],[3,-76],[0,-78]]);
    body('7',[[2,-82],[4,-82],[4,-79],[3,-77],[2,-78]]);
    body('c',[[-5,-82],[-2,-82],[-1,-79],[2,-76],[0,-75],[-4,-78]]);
    body('d',[[-5,-81],[-3,-81],[-2,-78],[0,-76],[-2,-77]]);
    const crown=point(-5,-96);stamp(bigHead,Math.round(crown[0]),Math.round(crown[1]));
    if(state==='walk'||state==='run')travelArm(false,state==='run');
    else if(state==='stand')arm([-9,-75],[-8,-44]);
    else if(state==='jab'){const reach=[4,14,21,21,12,4][f];arm([-9,-75],[reach,-73],false,null,true);}
    else if(state==='cross')arm([-9,-75],[9,-65]);
    else if(!armed)arm([-9,-75],[state==='jump'?8:4,state==='jump'?-78:-73]);
    else {
      arm([-9,-75],[10+recoil,-63]);
      const g=point(recoil,-68);c.save();c.translate(Math.round(g[0]),Math.round(g[1]));
      r('0',3,-3,33,8);r('1',4,-2,31,6);r('3',7,-2,27,2);r('4',9,-2,20,1);
      r('0',35,-2,6,5);r('3',36,-2,4,1);r('b',21,0,12,2);r('d',26,0,6,1);
      r('0',15,-6,9,4);r('3',16,-5,7,2);r('4',17,-5,4,1);
      p('0',[[10,4],[15,4],[13,10],[9,10]]);p('2',[[11,5],[14,5],[12,9],[10,9]]);
      r('0',23,3,6,8);r('2',24,4,4,6);r('7',8,3,4,3);r('6',24,3,4,2);r('7',25,3,2,1);
      if(shot){p('d',[[41,-1],[45,-4],[44,0],[49,1],[44,2],[46,5],[41,3]]);r('f',41,0,5,2);}c.restore();
    }
  }

  // Mini is drawn with different silhouettes, face pixels, sleeves and weapon.
  // Only shared anatomical units/timing relate it to the big family.
  const miniHead=['..88888..','.899a998.','899988775','899877775','.98670075','.98677770','..567775.','...5665..'];
  function mini(c,state,f){const {rect:r,poly:p,disk,stamp}=raster(c),pose=CADJaneMotion.sample('mini',state,f),armed=['idle','fire','run-fire','jump-fire','crouch'].includes(state);
    ponytail(p,r,pose.hair,true);
    function leg(shape,back){const h=shape.hip,k=shape.knee,a=shape.ankle;band(p,'0',h,k,2.4,1.8);disk('0',k[0],k[1],1);band(p,'0',k,a,1.8,1.3);band(p,back?'1':'2',h,k,1.4,.8);band(p,back?'1':'3',k,a,.8,.7);const co=Math.cos(shape.pitch||0),si=Math.sin(shape.pitch||0),local=pts=>pts.map(([x,y])=>[a[0]+x*co-y*si,a[1]+x*si+y*co]);p('0',local([[-2,-3],[1,-3],[2,0],[4,1],[4,3],[-2,3]]));p(back?'2':'4',local([[-1,1],[3,1],[3,2],[-1,2]]));}
    leg(pose.far,true);leg(pose.near,false);
    c.save();c.translate(Math.round(pose.lean),Math.round(pose.bob));
    const wave=[-3,-3,-2,-1,1,2,3,3,2,1,-1,-2][f%12];
    function hand(x,y){r('0',x-1,y-1,3,3);r('7',x+1,y,1,1);}
    function arm(s,e,h,back){band(p,'0',s,e,1.7,1.5);band(p,'0',e,h,1.5,1.2);disk('0',e[0],e[1],1);band(p,back?'b':'c',s,e,1,.8);band(p,back?'b':'d',e,h,.8,.7);if(!back)r('e',s[0]-1,s[1],1,2);hand(...h);}
    const travel=state==='walk'||state==='run',stand=state==='stand',cross=state==='cross';
    if(travel){const e=[2-wave,-19],h=state==='run'?[e[0]+3,e[1]-3]:[2-wave,-14];arm([2,-24],e,h,true);}
    else if(stand)arm([2,-24],[3,-19],[3,-14],true);
    else if(cross){const reach=[5,7,11,11,7,5][f];arm([2,-24],[6,-24],[reach,-24],true);}
    else if(armed)arm([2,-24],[4,-18],[8,-21],true);else arm([2,-24],[5,-20],[5,-24],true);
    p('0',[[-3,-26],[1,-26],[5,-23],[4,-19],[2,-17],[4,-14],[0,-12],[-4,-13],[-5,-15],[-4,-18],[-5,-23]]);
    p('b',[[-3,-25],[1,-25],[4,-23],[3,-19],[1,-17],[3,-14],[0,-13],[-3,-14],[-4,-15],[-3,-18],[-4,-23]]);
    p('c',[[-3,-24],[0,-24],[1,-21],[-1,-18],[0,-14],[-3,-14],[-3,-19],[-4,-22]]);
    r('d',-3,-24,2,4);r('e',-3,-24,1,2);r('1',1,-23,2,7);r('3',1,-20,1,4);r('f',1,-19,1,1);r('0',-3,-14,6,2);r('f',0,-14,2,1);
    r('5',0,-27,2,4);r('6',1,-27,1,4);stamp(miniHead,-2,-32);
    if(travel){const e=[-2+wave,-19],h=state==='run'?[e[0]+3,e[1]-3]:[-2+wave,-13];arm([-2,-24],e,h,false);}
    else if(stand)arm([-2,-24],[-3,-19],[-2,-13],false);
    else if(state==='jab'){const reach=[2,5,8,8,4,2][f];arm([-2,-24],[2,-22],[reach,-24],false);r('0',reach,-25,3,3);r('7',reach+2,-24,1,2);}
    else if(!armed)arm([-2,-24],[-2,-20],[3,state==='jump'?-26:-24],false);
    else{arm([-2,-24],[-2,-19],[5,-21],false);r('0',5,-24,10,4);r('3',6,-24,7,1);r('b',8,-23,6,1);r('d',11,-23,3,1);r('0',7,-21,2,4);r('0',11,-21,2,3);r('7',5,-21,2,1);if(state.includes('fire')&&(state==='fire'?f===0:f%3===0)){r('d',15,-25,2,5);r('f',15,-23,2,1);}}
    c.restore();
  }
  function draw(c,size,x,feet,{state='idle',time=0,frame=null,facing=1}={}){if(!durations[state])state='idle';const f=frame==null?frameAt(state,time):loop(frame,durations[state].length);c.save();c.translate(Math.round(x),Math.round(feet));c.scale(facing<0?-1:1,1);(size==='mini'?mini:big)(c,state,f);c.restore();}
  function sheet(size){const s=specs[size],canvas=document.createElement('canvas');canvas.width=s.width*columns;canvas.height=s.height*states.length;const c=canvas.getContext('2d');states.forEach((state,row)=>{for(let f=0;f<columns;f++)draw(c,size,f*s.width+s.anchor[0],row*s.height+s.anchor[1],{state,frame:Math.min(f,durations[state].length-1)});});return canvas;}
  function metadata(){
    const M=CADJaneMotion;
    return {name:'Jane',sourcePixelWorldUnits:1,
      framePadding:'Repeat final authored pose to fill 12 columns',palette,sizes:specs,columns,rows:states,timingMs:durations,
      frameCounts:Object.fromEntries(states.map(state=>[state,durations[state].length])),
      loops:M.loops,contactFrames:M.contactFrames,
      phases:Object.fromEntries(states.map(state=>[state,durations[state].map((_,f)=>M.sample('big',state,f).phase)])),
      hair:Object.fromEntries(['big','mini'].map(size=>[size,{dimensions:M.dimensions[size].hair,
        poses:Object.fromEntries(states.map(state=>[state,durations[state].map((_,f)=>M.sample(size,state,f).hair)]))}]))};
  }
  window.CADJane={palette,specs,states,durations,columns,frameAt,draw,sheet,metadata};
})();
