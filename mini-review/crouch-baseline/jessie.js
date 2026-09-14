/* ACTIVE MINI MASTER — Proposal A. 48×48 / feet (20,40).
 * Large renderer archived in archive/pre-mini-2026-09-14. */
(() => {
  'use strict';
  const palette = ['#101620','#1d2634','#253c5c','#41658a','#7893b0',
    '#352820','#604032','#926044','#edb985','#ffe0a5',
    '#331d2a','#66313c','#a44b50','#d17a6b','#b0956c','#d4ccad'];
  const P = Object.fromEntries('0123456789abcdef'.split('').map((key,i)=>[key,palette[i]]));
  const specs = {mini:{width:48,height:48,anchor:[20,40],heightPx:32}};
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
    if(walk){const swing=[-3,-3,-2,-1,1,2,3,3,2,1,-1,-2][f];p('0',[[-3,-24],[0,-24],[swing+1,-15],[swing-2,-14],[-4,-20]]);r('b',-3,-23,3,4);r('c',-3,-23,2,3);r('a',swing-2,-20,3,2);r('7',swing-1,-18,2,3);r('8',swing-1,-18,1,2);r('5',swing-1,-17,1,1);r('1',swing-2,-15,3,2);}
    else if(state==='jab'){const reach=[3,6,10,10,6,3][f];r('0',-1,-24,reach+3,4);r('b',0,-23,reach+2,2);r('c',0,-23,Math.max(2,Math.floor(reach*.5)),1);const cuff=Math.max(2,Math.floor(reach*.5));r('a',cuff,-23,1,2);r('8',cuff+1,-23,Math.max(1,reach-cuff),2);r('5',Math.min(reach-1,cuff+2),-23,1,1);r('1',reach,-24,3,3);}
    else{
      p('0',[[-4,-25],[0,-25],[2,-21],[7,-21],[8,-18],[-2,-17],[-5,-20]]);
      p('b',[[-3,-24],[-1,-24],[0,-20],[6,-20],[6,-18],[-2,-18],[-4,-21]]);
      r('c',-3,-24,2,3);r('d',-3,-24,1,1);r('a',-2,-21,3,2);r('8',1,-20,4,2);r('5',2,-20,1,1);r('1',5,-21,3,4);
      r('0',5,-24,11,4);r('3',6,-24,8,1);r('a',8,-23,6,1);r('c',12,-23,3,1);r('0',8,-21,2,4);r('8',6,-21,2,2);
      if(state.includes('fire')&&(state==='fire'?f===0:f%3===0)){r('e',16,-25,2,5);r('f',16,-23,2,1);}
    }
    c.restore();
  }
  function draw(c,size,x,feet,{state='idle',time=0,frame=null,facing=1,silhouette=false}={}){if(size!=='mini')throw new RangeError('Large models are archived; use mini.');
    c.save();c.translate(Math.round(x),Math.round(feet));c.scale(facing<0?-1:1,1);
    mini(c,state,frame??frameAt(state,time),time);c.restore();
  }
  function sheet(size='mini'){const s=specs[size],canvas=document.createElement('canvas');canvas.width=s.width*columns;canvas.height=s.height*states.length;const c=canvas.getContext('2d');states.forEach((state,row)=>{for(let f=0;f<columns;f++){const actual=Math.min(f,durations[state].length-1),time=durations[state].slice(0,actual).reduce((a,b)=>a+b,0)/1000;draw(c,size,f*s.width+s.anchor[0],row*s.height+s.anchor[1],{state,frame:actual,time});}});return canvas;}
  function metadata(){return {name:'Jessie',sourcePixelWorldUnits:1,palette,sizes:specs,columns,rows:states,timingMs:durations,frameCounts:Object.fromEntries(states.map(s=>[s,durations[s].length])),loops:Object.fromEntries(states.map(s=>[s,['idle','walk','run','run-fire'].includes(s)])),contactFrames:CADJessieMotion.contactFrames,framePadding:'Repeat final authored pose to fill 12 columns'};}
  window.CADJessie={palette,specs,columns,states,durations,frameAt,draw,sheet,metadata};
})();
