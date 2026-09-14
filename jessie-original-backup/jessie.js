/* Jessie master: native-pixel contour drawings on fixed anatomical motion. */
(() => {
  'use strict';
  const palette = ['#101620','#1d2634','#29364d','#42536a','#72838e',
    '#53352f','#915b3d','#c58b5c','#edb985','#ffe0a5',
    '#0d303a','#17505b','#287581','#4c9da0','#b0956c','#d4ccad'];
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

  // Side-view profile. Hair, ear, lenses, cheek and jaw are coherent clusters.
  const head = [
    '......566665......',
    '....5667777655....',
    '...566788777665...',
    '..5667777666655...',
    '..56677655555865..',
    '..566655688888865.',
    '...55556888898865.',
    '...556600000000000',
    '...568650033003300',
    '...578688888888890',
    '....67888888888990',
    '.....6788888878850',
    '......67788865550.',
    '.......678888650..',
    '.......5678865....',
    '.......568865.....'
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
      if(!back){
        const n=normal(h,k),origin=mix(h,k,.31),tip=mix(h,k,.66);
        p('0',[offset(origin,n,2),offset(tip,n,2),offset(tip,n,7),offset(origin,n,7)]);
        p('2',[offset(origin,n,3),offset(tip,n,3),offset(tip,n,6),offset(origin,n,6)]);
        patch(p,'4',h,k,.31,.37,3,6);
      }
    }
    leg(pose.far,true);leg(pose.near,false);
    // Pelvis connects both fixed-length legs to a broad, tapered torso.
    body('0',[[-12,-52],[11,-52],[14,-44],[8,-39],[-9,-41],[-14,-46]]);
    body('2',[[-10,-51],[9,-51],[11,-44],[7,-41],[-8,-43],[-12,-46]]);
    body('3',[[-9,-49],[-1,-48],[-1,-43],[-8,-44]]);
    body('1',[[0,-49],[3,-49],[5,-41],[2,-40]]);

    function arm(shoulder,hand,back=false,walkElbow=null){
      const s=point(...shoulder),h=point(...hand),e=walkElbow?point(...walkElbow):elbow(s,h,16,16);
      band(p,'0',s,e,6,5);disk('0',s[0],s[1],6);disk('0',e[0],e[1],5);band(p,'0',e,h,5,3);
      band(p,back?'6':'7',s,e,5,4);disk(back?'6':'7',s[0],s[1],5);disk(back?'6':'7',e[0],e[1],4);band(p,back?'6':'7',e,h,4,2);
      // Deltoid cap, separated biceps and forearm light planes.
      disk(back?'7':'8',s[0]-1,s[1]-1,3);
      patch(p,back?'7':'8',s,e,.33,.77,0,4);
      patch(p,back?'7':'8',e,h,.18,.82,0,3);
      patch(p,'6',s,e,.77,.86,-3,2);
      if(!back)patch(p,'9',s,e,.08,.22,1,3);
      disk('0',h[0],h[1],3);r('2',h[0]-2,h[1]-2,4,4);r(back?'7':'8',h[0]+1,h[1]-2,3,2);r('4',h[0]-2,h[1]-2,2,1);
    }
    const swing=[-.46,-.39,-.26,-.08,.15,.37,.46,.39,.26,.08,-.15,-.37][f%12];
    function walkingArm(back){const theta=back?-swing:swing,sx=back?7:-11,sy=-75;const e=[sx+Math.sin(theta)*17,sy+Math.cos(theta)*17],h=[e[0]+Math.sin(theta*.72)*15,e[1]+Math.cos(theta*.72)*15];arm([sx,sy],h,back,e);}
    if(walk)walkingArm(true);else arm([8,-75],[26,-65],true);

    // Broad shoulders, ribcage, inward waist, then the belt: no tubular trunk.
    body('0',[[-10,-83],[-3,-83],[3,-80],[10,-79],[16,-74],[17,-67],[13,-57],[12,-49],[7,-46],[-10,-47],[-15,-52],[-17,-65],[-16,-76]]);
    body('a',[[-9,-82],[-3,-82],[2,-79],[9,-78],[14,-73],[15,-67],[11,-56],[10,-49],[6,-48],[-9,-49],[-13,-53],[-15,-65],[-14,-75]]);
    body('b',[[-11,-78],[-5,-78],[-2,-72],[-3,-58],[-5,-50],[-10,-51],[-13,-64]]);
    body('c',[[-11,-77],[-7,-77],[-5,-72],[-6,-65],[-12,-66]]);
    body('d',[[-11,-77],[-8,-77],[-6,-73],[-8,-72],[-11,-73]]);
    body('1',[[-1,-77],[5,-77],[10,-73],[9,-57],[7,-50],[-2,-50]]);
    body('2',[[0,-75],[6,-74],[7,-69],[5,-66],[7,-61],[5,-55],[-1,-55]]);
    body('3',[[1,-73],[5,-73],[6,-70],[0,-70]]);
    body('b',[[7,-77],[12,-75],[14,-69],[11,-58],[9,-50],[6,-50],[9,-62],[10,-69]]);
    body('c',[[8,-77],[12,-74],[12,-70],[10,-70]]);
    body('0',[[-13,-65],[-5,-65],[-4,-59],[-12,-59]]);
    body('b',[[-12,-64],[-6,-64],[-5,-60],[-11,-60]]);
    body('c',[[-12,-64],[-6,-64],[-6,-62],[-12,-62]]);
    body('d',[[-11,-64],[-8,-64],[-8,-63],[-11,-63]]);
    body('0',[[-10,-51],[10,-51],[11,-47],[-11,-47]]);
    body('5',[[-9,-50],[9,-50],[9,-48],[-9,-48]]);
    body('e',[[-2,-51],[3,-51],[3,-47],[-2,-47]]);
    body('1',[[-1,-50],[2,-50],[2,-48],[-1,-48]]);

    body('5',[[-2,-84],[7,-84],[8,-78],[11,-76],[6,-72],[0,-75],[-4,-80]]);
    body('7',[[-1,-84],[6,-84],[6,-79],[8,-77],[5,-75],[0,-77],[-2,-80]]);
    body('8',[[0,-83],[3,-83],[3,-79],[6,-77],[4,-76],[0,-79]]);
    const crown=point(-6,-96);crown[1]=-96+Math.round(pose.bob*.65);stamp(head,Math.round(crown[0]),Math.round(crown[1]));

    if(walk)walkingArm(false);
    else if(jab){
      const reach=[6,17,29,30,18,6][f];arm([0,-75],[reach,-73],false);const fist=point(reach,-73);r('8',fist[0]+1,fist[1]-2,3,4);
    } else {
      // Recoil stays entirely above the pelvis and never resets locomotion.
      const shot=fire&&Math.floor(time*16)%3===0,recoil=shot?-1:0;
      arm([-11,-75],[10+recoil,-63]);
      const g=point(recoil,-68);c.save();c.translate(Math.round(g[0]),Math.round(g[1]));
      r('0',3,-3,35,8);r('1',5,-2,31,6);r('3',7,-2,27,2);r('4',9,-2,20,1);
      r('0',35,-2,7,5);r('3',36,-2,5,1);r('a',20,0,13,2);r('c',26,0,6,1);
      r('0',15,-6,10,4);r('3',16,-5,8,2);r('4',17,-5,5,1);
      p('0',[[10,4],[15,4],[13,11],[9,11]]);p('2',[[11,5],[14,5],[12,9],[10,9]]);
      p('0',[[23,3],[29,3],[28,11],[23,11]]);r('2',24,4,4,6);
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
    r('b',-4,-23,4,7);r('c',-4,-23,2,4);r('d',-3,-23,1,2);r('1',1,-23,3,8);r('2',1,-22,2,4);r('0',-4,-15,8,2);r('e',0,-15,2,1);
    stamp(['..56665..','.5677765.','556655885','.55600000','..6880380','..6788880','...678650','....686..'],-3,-32);
    if(walk){const swing=[-3,-3,-2,-1,1,2,3,3,2,1,-1,-2][f];p('0',[[-3,-24],[0,-24],[swing+1,-15],[swing-2,-14],[-4,-20]]);r('7',-3,-23,3,4);r('8',-3,-23,2,3);r('7',swing-1,-19,2,4);r('1',swing-2,-15,3,2);}
    else if(state==='jab'){const reach=[3,6,10,10,6,3][f];r('0',-1,-24,reach+3,4);r('8',0,-23,reach+2,2);r('1',reach,-24,3,3);}
    else{
      p('0',[[-4,-25],[0,-25],[2,-21],[7,-21],[8,-18],[-2,-17],[-5,-20]]);
      p('7',[[-3,-24],[-1,-24],[0,-20],[6,-20],[6,-18],[-2,-18],[-4,-21]]);
      r('8',-3,-24,2,3);r('8',-1,-20,6,1);r('1',5,-21,3,4);
      r('0',5,-24,11,4);r('3',6,-24,8,1);r('a',8,-23,6,1);r('c',12,-23,3,1);r('0',8,-21,2,4);r('8',6,-21,2,2);
      if(state.includes('fire')&&Math.floor(time*16)%3===0){r('e',16,-25,2,5);r('f',16,-23,2,1);}
    }
    c.restore();
  }
  function draw(c,size,x,feet,{state='idle',time=0,frame=null,facing=1,silhouette=false}={}){
    c.save();c.translate(Math.round(x),Math.round(feet));c.scale(facing<0?-1:1,1);
    (size==='mini'?mini:big)(c,state,frame??frameAt(state,time),time);c.restore();
  }
  function sheet(size){const s=specs[size],canvas=document.createElement('canvas');canvas.width=s.width*columns;canvas.height=s.height*states.length;const c=canvas.getContext('2d');states.forEach((state,row)=>{for(let f=0;f<columns;f++){const actual=Math.min(f,durations[state].length-1),time=durations[state].slice(0,actual).reduce((a,b)=>a+b,0)/1000;draw(c,size,f*s.width+s.anchor[0],row*s.height+s.anchor[1],{state,frame:actual,time});}});return canvas;}
  window.CADJessie={palette,specs,columns,states,durations,frameAt,draw,sheet};
})();
