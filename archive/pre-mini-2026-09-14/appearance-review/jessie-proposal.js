/* APPEARANCE PROPOSAL — idle review only. Original masters remain playable.
 * Derived from baseline/jessie.js; native contour edits, no bitmap resizing.
 * Unused original action branches are retained as migration context, not exposed. */
/* Jessie master: native-pixel contour drawings on fixed anatomical motion. */
(() => {
  'use strict';
  const palette = ['#101620','#1d2634','#253c5c','#41658a','#7893b0',
    '#352820','#604032','#926044','#edb985','#ffe0a5',
    '#331d2a','#66313c','#a44b50','#d17a6b','#b0956c','#d4ccad'];
  const P = Object.fromEntries('0123456789abcdef'.split('').map((key,i)=>[key,palette[i]]));
  const specs = {big:{width:128,height:128,anchor:[64,112],heightPx:96},mini:{width:48,height:48,anchor:[20,40],heightPx:32}};
  const columns = 12;
  const states = ['idle','walk','run','fire','run-fire','jump','jump-fire','crouch','jab','hurt'];
  const durations = CADJessieMotion.timings;
  function frameAt(state,time){const times=durations[state]||durations.idle,total=times.reduce((a,b)=>a+b,0);let ms=((time*1000)%total+total)%total;for(let i=0;i<times.length;i++){if(ms<times[i])return i;ms-=times[i];}return 0;}

  function raster(c){
    const rect=(color,x,y,w=1,h=1)=>{if(w<=0||h<=0)return;c.fillStyle=P[color]||color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const poly=(color,points)=>{
      const p=points.map(([x,y])=>[Math.round(x),Math.round(y)]),lo=Math.min(...p.map(q=>q[1])),hi=Math.max(...p.map(q=>q[1]));
      for(let y=lo;y<hi;y++){
        const hits=[],scan=y+.5;
        for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];if((a[1]<=scan&&b[1]>scan)||(b[1]<=scan&&a[1]>scan))hits.push(a[0]+(scan-a[1])*(b[0]-a[0])/(b[1]-a[1]));}
        hits.sort((a,b)=>a-b);for(let i=0;i+1<hits.length;i+=2){const x=Math.ceil(hits[i]-.5),end=Math.ceil(hits[i+1]-.5);rect(color,x,y,end-x,1);}
      }
    };
    const disk=(color,x,y,r)=>{for(let dy=-r;dy<=r;dy++){const span=Math.floor(Math.sqrt(r*r-dy*dy));rect(color,x-span,y+dy,span*2+1,1);}};
    const stamp=(rows,x,y)=>rows.forEach((row,dy)=>[...row].forEach((ch,dx)=>{if(ch!=='.')rect(ch,x+dx,y+dy);}));
    return {rect,poly,disk,stamp};
  }
  const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  const offset=(p,n,w)=>[p[0]+n[0]*w,p[1]+n[1]*w];
  function normal(a,b){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1;return [-dy/d,dx/d];}
  function band(poly,color,a,b,wa,wb){const n=normal(a,b);poly(color,[offset(a,n,wa),offset(b,n,wb),offset(b,n,-wb),offset(a,n,-wa)]);}
  function patch(poly,color,a,b,start,end,left,right){const n=normal(a,b),p=mix(a,b,start),q=mix(a,b,end);poly(color,[offset(p,n,left),offset(q,n,left),offset(q,n,right),offset(p,n,right)]);}
  function elbow(shoulder,hand,upper=16,lower=16){
    const dx=hand[0]-shoulder[0],dy=hand[1]-shoulder[1],distance=Math.hypot(dx,dy),d=Math.min(upper+lower-.05,Math.max(.01,distance));
    const along=(upper*upper-lower*lower+d*d)/(2*d),height=Math.sqrt(Math.max(0,upper*upper-along*along)),ux=dx/(distance||1),uy=dy/(distance||1);
    return [shoulder[0]+ux*along-uy*height,shoulder[1]+uy*along+ux*height];
  }

  // Hand-placed profile: one visible lens, an ear, a short nose and a square jaw.
  // Broken fringe and uneven tufts; one visible brown iris and angular jaw.
  const head = [
    '....55..55........',
    '..5566556555......',
    '.566776667665.....',
    '.5676667766665....',
    '.5666556665885....',
    '.5566556588885....',
    '..565556888885....',
    '..556888800085...',
    '..5687888f65885...',
    '..56878888888880.',
    '...6788888988850.',
    '....678888788850..',
    '....56788765550...',
    '.....678888850....',
    '......7888850.....',
    '......677755......'
  ];

  function big(c,state,f,time){
    const {rect:r,poly:p,disk,stamp}=raster(c),pose=CADJessieMotion.sample('big',state,f);
    const fire=state.includes('fire'),walk=state==='walk',jab=state==='jab';
    const point=(x,y)=>[x+pose.lean*Math.max(0,Math.min(1,(-y-46)/34)),y+pose.bob];
    const body=(color,points)=>p(color,points.map(([x,y])=>point(x,y)));
    function boot(leg,back){
      const a=leg.ankle,angle=leg.pitch||0,co=Math.cos(angle),si=Math.sin(angle);
      const local=pts=>pts.map(([x,y])=>[a[0]+x*co-y*si,a[1]+x*si+y*co]);
      p('0',local([[-5,-7],[3,-7],[4,-2],[10,0],[12,2],[12,5],[-5,5]]));
      p(back?'1':'2',local([[-4,-6],[2,-6],[3,-1],[9,1],[10,3],[-4,3]]));
      p(back?'2':'4',local([[-3,-6],[-1,-6],[-1,0],[-3,2]]));
      p(back?'2':'3',local([[3,0],[8,1],[10,2],[3,2]]));
      p(back?'1':'e',local([[-3,3],[10,3],[10,4],[-3,4]]));
      p('0',local([[-4,0],[2,0],[2,1],[-4,1]]));
    }
    function leg(shape,back){
      const h=shape.hip,k=shape.knee,a=shape.ankle;
      band(p,'0',h,k,7,5);disk('0',k[0],k[1],5);band(p,'0',k,a,5,4);
      band(p,back?'1':'2',h,k,6,4);disk(back?'1':'2',k[0],k[1],4);band(p,back?'1':'2',k,a,4,3);
      patch(p,back?'2':'3',h,k,.08,.64,1,5);
      patch(p,back?'2':'3',k,a,.1,.75,0,3);
      // Short fold groups describe baggy work trousers, not a continuous stripe.
      patch(p,'1',h,k,.60,.73,-4,2);patch(p,'1',k,a,.16,.25,-3,3);
      if(!back){patch(p,'4',h,k,.12,.32,3,4);patch(p,'3',k,a,.76,.91,-2,2);}
      boot(shape,back);
      if(!back)patch(p,'4',h,k,.25,.30,2,4); // Quiet denim seam, no cargo pocket.
    }
    leg(pose.far,true);leg(pose.near,false);
    // Pelvis connects both fixed-length legs to a broad, tapered torso.
    body('0',[[-12,-52],[11,-52],[14,-44],[8,-39],[-9,-41],[-14,-46]]);
    body('2',[[-10,-51],[9,-51],[11,-44],[7,-41],[-8,-43],[-12,-46]]);
    body('3',[[-9,-49],[-1,-48],[-1,-43],[-8,-44]]);
    body('1',[[0,-49],[3,-49],[5,-41],[2,-40]]);

    function arm(shoulder,hand,back=false,walkElbow=null){
      const s=point(...shoulder),h=point(...hand),e=walkElbow?point(...walkElbow):elbow(s,h,17,16);
      // Joined muscle contours, with no black rings around elbows or deltoids.
      const n=normal(s,e),m=normal(e,h),at=(a,b,t,v)=>offset(mix(a,b,t),normal(a,b),v);
      p('0',[offset(s,n,4),at(s,e,.24,6),at(s,e,.66,5),offset(e,n,4),offset(e,m,4),at(e,h,.45,4),offset(h,m,3),offset(h,m,-3),at(e,h,.35,-3),offset(e,m,-3),offset(e,n,-3),at(s,e,.45,-5),offset(s,n,-4),at(s,e,-.2,-1)]);
      p(back?'a':'b',[offset(s,n,3),at(s,e,.22,5),at(s,e,.68,4),offset(e,n,3),offset(e,m,3),at(e,h,.45,3),offset(h,m,2),offset(h,m,-2),at(e,h,.35,-2),offset(e,m,-2),offset(e,n,-2),at(s,e,.45,-4),offset(s,n,-3),at(s,e,-.12,-1)]);
      // Keep the key light above-left when the arm turns through a punch.
      const lit=(a,b,t,v)=>{const q=normal(a,b);return offset(mix(a,b,t),q,(q[0]+q[1]>0?-1:1)*v);};
      p(back?'b':'c',[lit(s,e,-.08,0),lit(s,e,.1,3),lit(s,e,.3,4),lit(s,e,.49,2),lit(s,e,.34,-2),lit(s,e,.08,-2)]);
      p(back?'b':'c',[lit(s,e,.46,1),lit(s,e,.61,3),lit(s,e,.88,2),lit(s,e,.9,-1),lit(s,e,.6,-2)]);
      p(back?'7':'8',[lit(e,h,.1,1),lit(e,h,.36,2),lit(e,h,.8,1),lit(e,h,.83,-1),lit(e,h,.3,-1)]);
      if(!back)p('d',[lit(s,e,.02,0),lit(s,e,.13,2),lit(s,e,.27,2),lit(s,e,.2,0)]);
      // A rolled leather cuff and exposed skin share the existing elbow/wrist path.
      band(p,back?'6':'7',mix(e,h,.22),mix(e,h,.79),2.8,2.2);
      patch(p,back?'7':'8',e,h,.24,.76,-1,1);
      band(p,'a',e,mix(e,h,.27),3.2,3);patch(p,'c',e,h,.09,.18,-2,2);
      if(!back){
        // PROPOSAL: abstract broken-chevron tattoo, outer visible forearm.
        patch(p,'5',e,h,.42,.49,-2,1);patch(p,'5',e,h,.49,.61,0,1);
        patch(p,'5',e,h,.61,.68,-2,1);
      }
      band(p,'0',mix(e,h,.79),h,3,3);band(p,'2',mix(e,h,.81),h,2,2);
      r(back?'7':'8',h[0],h[1]-2,3,3);r('4',h[0]-2,h[1]-1,2,1);
    }
    const swing=[-.46,-.39,-.26,-.08,.15,.37,.46,.39,.26,.08,-.15,-.37][f%12];
    function walkingArm(back){const theta=back?-swing:swing,sx=back?7:-10,sy=-74;const e=[sx+Math.sin(theta)*17,sy+Math.cos(theta)*17],h=[e[0]+Math.sin(theta*.72)*16,e[1]+Math.cos(theta*.72)*16];arm([sx,sy],h,back,e);}
    const shot=fire&&Math.floor(time*16)%3===0,recoil=shot?-1:0;
    if(walk)walkingArm(true);else if(jab)arm([7,-74],[15,-69],true);else arm([7,-74],[26+recoil,-62],true);

    // Ribcage narrows into the waist. Vest panels wrap around that volume;
    // charcoal undershirt, cloth shadows and seams stay in large quiet clusters.
    body('0',[[-6,-83],[2,-83],[5,-80],[10,-78],[13,-73],[14,-67],[11,-58],[9,-50],[5,-47],[-9,-48],[-13,-54],[-15,-65],[-15,-74],[-11,-79]]);
    body('a',[[-6,-82],[1,-82],[4,-79],[9,-77],[11,-72],[12,-66],[9,-57],[8,-50],[4,-49],[-8,-50],[-11,-55],[-13,-66],[-13,-74],[-10,-78]]);
    body('1',[[-1,-79],[5,-77],[9,-73],[10,-67],[7,-55],[5,-50],[-4,-50],[-5,-63]]);
    body('2',[[0,-77],[5,-75],[8,-71],[8,-68],[3,-67],[-3,-70]]);
    body('3',[[1,-76],[4,-75],[6,-72],[1,-72]]);
    body('2',[[-3,-65],[2,-64],[6,-65],[5,-60],[1,-57],[-3,-58]]);
    body('b',[[-8,-79],[-4,-80],[-2,-76],[-4,-70],[-4,-58],[-6,-51],[-10,-54],[-12,-66],[-12,-74]]);
    body('c',[[-8,-78],[-5,-79],[-4,-76],[-6,-70],[-10,-70],[-11,-74]]);
    body('d',[[-8,-78],[-6,-78],[-5,-76],[-7,-74],[-9,-75]]);
    body('b',[[7,-77],[10,-75],[12,-68],[10,-61],[8,-52],[5,-50],[7,-63],[9,-68]]);
    body('c',[[8,-75],[10,-72],[10,-68],[8,-69]]);
    // Proposed red leather finish: long lapel, zip and angled welt pocket.
    body('0',[[-4,-80],[0,-78],[-2,-69],[-5,-65],[-7,-71]]);
    body('c',[[-4,-79],[-1,-77],[-3,-70],[-5,-68],[-6,-72]]);
    body('d',[[-4,-79],[-2,-77],[-4,-72],[-5,-72]]);
    body('c',[[6,-78],[9,-75],[8,-70],[4,-65],[5,-72]]);
    body('4',[[3,-67],[4,-67],[1,-53],[0,-53]]);
    body('f',[[3,-66],[4,-66],[4,-64],[3,-64]]);
    body('0',[[-10,-59],[-5,-61],[-4,-60],[-9,-58]]);
    body('d',[[-10,-60],[-5,-62],[-5,-61],[-10,-59]]);
    body('0',[[-10,-51],[9,-51],[10,-47],[-11,-47]]);
    body('5',[[-9,-50],[8,-50],[8,-48],[-9,-48]]);
    body('e',[[0,-51],[4,-51],[4,-47],[0,-47]]);
    body('1',[[1,-50],[3,-50],[3,-48],[1,-48]]);
    body('0',[[-12,-51],[-9,-51],[-9,-45],[-13,-45]]);
    body('5',[[-12,-50],[-10,-50],[-10,-46],[-12,-46]]);

    // Short neck sits inside the collar. Translate head and neck together;
    // damping only the head used to detach it by six pixels during crouches.
    body('5',[[-1,-84],[6,-84],[6,-80],[8,-77],[4,-74],[-2,-78],[-3,-81]]);
    body('7',[[0,-83],[5,-83],[5,-79],[6,-77],[4,-76],[0,-78],[-1,-80]]);
    body('8',[[1,-82],[3,-82],[3,-79],[5,-77],[3,-77],[1,-79]]);
    body('b',[[-6,-83],[-3,-83],[-2,-80],[2,-76],[0,-75],[-4,-78],[-7,-80]]);
    body('c',[[-6,-82],[-4,-82],[-3,-79],[0,-77],[-1,-77],[-5,-79]]);
    const crown=point(-6,-96);stamp(head,Math.round(crown[0]),Math.round(crown[1]));

    if(walk)walkingArm(false);
    else if(jab){
      const reach=[5,15,21,21,13,5][f];arm([-10,-74],[reach,-73],false);const fist=point(reach,-73);r('0',fist[0]-2,fist[1]-3,7,6);r('2',fist[0]-1,fist[1]-2,4,4);r('3',fist[0]-1,fist[1]-2,3,1);r('7',fist[0]+3,fist[1]-2,3,4);r('8',fist[0]+3,fist[1]-2,2,3);
    } else {
      // Recoil stays entirely above the pelvis and never resets locomotion.
      arm([-10,-74],[10+recoil,-62]);
      const g=point(recoil,-68);c.save();c.translate(Math.round(g[0]),Math.round(g[1]));
      r('0',8,-3,30,8);r('1',9,-2,27,6);r('3',10,-2,24,2);r('4',11,-2,18,1);
      r('0',35,-2,7,5);r('3',36,-2,5,1);r('a',20,0,13,2);r('c',26,0,6,1);
      r('0',17,-5,6,2);r('4',18,-5,4,1);
      p('0',[[10,4],[15,4],[13,11],[9,11]]);p('2',[[11,5],[14,5],[12,9],[10,9]]);
      r('0',23,3,6,3);r('2',24,4,4,1);
      r('8',8,3,4,3);r('7',24,3,4,2);r('9',25,3,2,1);
      if(shot){p('e',[[42,-1],[46,-4],[45,0],[50,1],[45,2],[47,5],[42,3]]);r('f',42,0,5,2);}
      c.restore();
    }
  }

  function mini(c,state,f,time){
    const {rect:r,poly:p,disk,stamp}=raster(c),pose=CADJessieMotion.sample('mini',state,f),walk=state==='walk';
    function leg(shape,back){const h=shape.hip,k=shape.knee,a=shape.ankle;band(p,'0',h,k,2.5,2);band(p,'0',k,a,2,1.5);disk('0',k[0],k[1],2);band(p,back?'1':'2',h,k,1.5,1);band(p,back?'1':'3',k,a,1,1);
      const co=Math.cos(shape.pitch||0),si=Math.sin(shape.pitch||0),local=pts=>pts.map(([x,y])=>[a[0]+x*co-y*si,a[1]+x*si+y*co]);p('0',local([[-2,-3],[1,-3],[2,0],[4,1],[4,3],[-2,3]]));p(back?'2':'4',local([[-1,1],[3,1],[3,2],[-1,2]]));}
    leg(pose.far,true);leg(pose.near,false);
    c.save();c.translate(Math.round(pose.lean),Math.round(pose.bob));
    p('0',[[-5,-25],[1,-26],[6,-23],[5,-17],[3,-13],[-4,-13],[-6,-18]]);
    p('a',[[-4,-24],[1,-25],[5,-22],[3,-14],[-3,-14],[-5,-18]]);
    r('b',-4,-23,4,7);r('c',-4,-23,2,4);r('d',-3,-23,1,2);r('1',1,-23,3,8);r('c',0,-24,2,3);r('4',1,-20,1,4);r('0',-4,-15,8,2);r('e',0,-15,2,1);
    stamp(['..55.65..','.5676665.','556655885','.55680085','..688f680','..6788880','...678650','....686..'],-3,-32);
    if(walk){const swing=[-3,-3,-2,-1,1,2,3,3,2,1,-1,-2][f];p('0',[[-3,-24],[0,-24],[swing+1,-15],[swing-2,-14],[-4,-20]]);r('7',-3,-23,3,4);r('8',-3,-23,2,3);r('7',swing-1,-19,2,4);r('1',swing-2,-15,3,2);}
    else if(state==='jab'){const reach=[3,6,10,10,6,3][f];r('0',-1,-24,reach+3,4);r('8',0,-23,reach+2,2);r('1',reach,-24,3,3);}
    else{
      p('0',[[-4,-25],[0,-25],[2,-21],[7,-21],[8,-18],[-2,-17],[-5,-20]]);
      p('b',[[-3,-24],[-1,-24],[0,-20],[6,-20],[6,-18],[-2,-18],[-4,-21]]);
      r('c',-3,-24,2,3);r('d',-3,-24,1,1);r('a',-2,-21,3,2);r('8',1,-20,4,2);r('5',2,-20,1,1);r('1',5,-21,3,4);
      r('0',5,-24,11,4);r('3',6,-24,8,1);r('a',8,-23,6,1);r('c',12,-23,3,1);r('0',8,-21,2,4);r('8',6,-21,2,2);
      if(state.includes('fire')&&Math.floor(time*16)%3===0){r('e',16,-25,2,5);r('f',16,-23,2,1);}
    }
    c.restore();
  }
  // Review gate: other states are intentionally unavailable until design review.
  function draw(c,size,x,feet,{state='idle',frame=0,facing=1}={}){
    if(state!=='idle')throw new RangeError('Appearance proposal contains idle poses only.');
    if(!specs[size])throw new RangeError('Unknown native size.');
    const f=((Math.trunc(frame)%8)+8)%8;
    c.save();c.translate(Math.round(x),Math.round(feet));c.scale(facing<0?-1:1,1);
    (size==='mini'?mini:big)(c,'idle',f,0);c.restore();
  }
  window.CADJessieProposal={palette,specs,states:['idle'],durations:{idle:CADJessieMotion.timings.idle},draw};
})();
