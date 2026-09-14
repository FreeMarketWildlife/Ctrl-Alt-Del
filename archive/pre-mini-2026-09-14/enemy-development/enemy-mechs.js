/* Three original native-grid machine enemies. Big and mini silhouettes are
 * separately authored; only joint mechanics and material ramps are shared. */
(() => {
  'use strict';
  const ids=['sentinel','bastion','scrapper'];
  const specs={big:{width:128,height:128,anchor:[64,112],heightPx:96},mini:{width:48,height:48,anchor:[20,40],heightPx:32}};
  const palettes={
    sentinel:['#101620','#1d2634','#29364d','#42536a','#72838e','#273e47','#365966','#53858b','#8cb8b0','#bdcfc0','#413342','#733b50','#b95266','#ef8b87','#f4c9a4','#d4ccad'],
    bastion:['#101620','#1d2634','#29364d','#42536a','#72838e','#3b3d34','#5e604b','#929077','#c4ba94','#e0d6b4','#493a36','#87523f','#c27946','#efb35d','#f9d991','#d4ccad'],
    scrapper:['#101620','#1d2634','#29364d','#42536a','#72838e','#4c3234','#80483c','#b66f49','#dfa76a','#e7c799','#243e45','#356976','#61a8a6','#99d4c5','#d6ece0','#d4ccad']
  };
  const states=['idle','walk','run','charge','fire','run-fire','melee','jump','hurt','death'];
  const durations=CADEnemyMechMotion.timings,columns=12,loop=(f,n)=>((Math.trunc(f)||0)%n+n)%n;
  function frameAt(state,time){const t=durations[state]||durations.idle,total=t.reduce((a,b)=>a+b,0);let ms=((time*1000)%total+total)%total;for(let f=0;f<t.length;f++){if(ms<t[f])return f;ms-=t[f];}return 0;}
  function raster(c,palette){
    const r=(color,x,y,w=1,h=1)=>{if(w<=0||h<=0)return;c.fillStyle=palette[parseInt(color,16)]||color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const p=(color,points)=>{const q=points.map(([x,y])=>[Math.round(x),Math.round(y)]),lo=Math.min(...q.map(a=>a[1])),hi=Math.max(...q.map(a=>a[1]));for(let y=lo;y<hi;y++){const hits=[];for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],scan=y+.5;if((a[1]<=scan&&b[1]>scan)||(b[1]<=scan&&a[1]>scan))hits.push(a[0]+(scan-a[1])*(b[0]-a[0])/(b[1]-a[1]));}hits.sort((a,b)=>a-b);for(let i=0;i+1<hits.length;i+=2){const x=Math.ceil(hits[i]-.5),end=Math.ceil(hits[i+1]-.5);r(color,x,y,end-x,1);}}};
    const disk=(color,x,y,radius)=>{for(let dy=-radius;dy<=radius;dy++){const span=Math.floor(Math.sqrt(radius*radius-dy*dy));r(color,x-span,y+dy,span*2+1,1);}};
    return {r,p,disk};
  }
  const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  const normal=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1;return[-dy/d,dx/d];};
  const offset=(a,n,w)=>[a[0]+n[0]*w,a[1]+n[1]*w];
  function band(p,color,a,b,wa,wb){const n=normal(a,b);p(color,[offset(a,n,wa),offset(b,n,wb),offset(b,n,-wb),offset(a,n,-wa)]);}
  function panel(p,color,a,b,t0,t1,left,right){const n=normal(a,b),u=mix(a,b,t0),v=mix(a,b,t1);p(color,[offset(u,n,left),offset(v,n,left),offset(v,n,right),offset(u,n,right)]);}
  function elbow(s,h,a,b){const dx=h[0]-s[0],dy=h[1]-s[1],distance=Math.hypot(dx,dy)||.001,d=Math.min(a+b-.01,distance),along=(a*a-b*b+d*d)/(2*d),height=Math.sqrt(Math.max(0,a*a-along*along));return [s[0]+dx/distance*along-dy/distance*height,s[1]+dy/distance*along+dx/distance*height];}
  function bodyRaster(raster,pose,size){
    const hip=CADEnemyMechMotion.dimensions[size].hipY,co=Math.cos(pose.angle),si=Math.sin(pose.angle);
    const point=(x,y)=>{const u=x+pose.lean*Math.max(0,Math.min(1,(hip-y)/32)),v=y-hip;return [pose.shift+u*co-v*si,hip+pose.bob+u*si+v*co];};
    const p=(color,pts)=>raster.p(color,pts.map(q=>point(...q)));
    const r=(color,x,y,w=1,h=1)=>p(color,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]);
    const disk=(color,x,y,radius)=>{for(let dy=-radius;dy<=radius;dy++){const span=Math.floor(Math.sqrt(radius*radius-dy*dy));r(color,x-span,y+dy,span*2+1,1);}};
    return {p,r,disk,point};
  }
  function pivotRaster(B,x,y,angle){
    const co=Math.cos(angle),si=Math.sin(angle),p=(color,pts)=>B.p(color,pts.map(([u,v])=>[x+(u-x)*co-(v-y)*si,y+(u-x)*si+(v-y)*co]));
    const r=(color,u,v,w=1,h=1)=>p(color,[[u,v],[u+w,v],[u+w,v+h],[u,v+h]]);return {p,r};
  }
  function mechanicalLegs(R,pose,id,small){
    const {p,disk}=R,wide=id==='bastion',industrial=id==='scrapper';
    function leg(j,back){const h=j.hip,k=j.knee,a=j.ankle,thigh=small?(wide?2.7:2.2):(wide?7:industrial?6:4.5),calf=small?(wide?2:1.7):(wide?5.5:industrial?4.5:3.5);
      band(p,'0',h,k,thigh,thigh-1);band(p,back?'1':'2',h,k,thigh-1,thigh-2);band(p,'0',k,a,calf,calf-1);band(p,back?'2':'3',k,a,calf-1,calf-1.7);
      panel(p,back?'5':'6',h,k,.08,.65,-thigh+1,thigh-1);panel(p,back?'6':'7',h,k,.12,.5,1,thigh-1);panel(p,back?'3':'4',k,a,.23,.76,0,calf-1);
      disk('0',k[0],k[1],small?2:5);disk(back?'2':'3',k[0],k[1],small?1:3);if(!small){disk(back?'3':'4',k[0],k[1],1);panel(p,back?'6':'8',h,k,.15,.21,-thigh+2,thigh-2);}
      if(industrial&&!small){const n=normal(k,a),u=offset(mix(k,a,.08),n,-4),v=offset(mix(k,a,.82),n,-4);band(p,'0',u,v,2,2);band(p,'4',u,v,1,1);panel(p,'1',u,v,.1,.35,-1,1);}
      const co=Math.cos(j.pitch),si=Math.sin(j.pitch),local=pts=>pts.map(([x,y])=>[a[0]+x*co-y*si,a[1]+x*si+y*co]);
      if(small){p('0',local([[-2,-3],[1,-3],[2,0],[4,1],[4,3],[-2,3]]));p(back?'5':'7',local([[-1,-2],[1,-2],[1,1],[3,1],[3,2],[-1,2]]));p(back?'3':'9',local([[-1,1],[3,1],[3,2],[-1,2]]));}
      else{p('0',local([[-4,-8],[3,-8],[4,-2],[10,0],[12,2],[12,5],[-5,5],[-5,-2]]));p(back?'5':'6',local([[-3,-7],[2,-7],[3,-1],[9,1],[10,3],[-3,3]]));p(back?'6':'7',local([[-3,-6],[1,-6],[1,-1],[-3,1]]));p(back?'3':'4',local([[-4,3],[11,3],[11,4],[-4,4]]));p(back?'7':'8',local([[4,0],[8,1],[9,2],[3,2]]));}
    }
    leg(pose.far,true);leg(pose.near,false);
  }
  function arm(B,s,h,back,id,small,knownElbow){const {p,disk}=B,e=knownElbow||elbow(s,h,small?5:17,small?5:19),width=small?(id==='sentinel'?1.5:2):(id==='sentinel'?3.5:5);
    band(p,'0',s,e,width+1,width);band(p,'0',e,h,width,width-.5);band(p,back?'2':'3',s,e,width-1,width-1);band(p,back?'5':'6',e,h,width-1,width-1.5);disk('0',e[0],e[1],small?2:4);disk(back?'3':'4',e[0],e[1],small?1:2);panel(p,back?'6':'7',s,e,.03,.63,-width+1,width-1);panel(p,back?'7':'8',s,e,.1,.23,-width+1,width-1);disk('0',s[0],s[1],small?2:6);disk(back?'5':'6',s[0],s[1],small?1:4);if(!small)disk(back?'6':'8',s[0]-1,s[1]-1,2);
  }
  const strike=f=>[0,-7,12,11,4,0][f];
  const alive=(state,f)=>state!=='death'||f<6;
  function big(c,id,state,f){
    const R=raster(c,palettes[id]),pose=CADEnemyMechMotion.sample('big',state,f),B=bodyRaster(R,pose,'big'),{p,r,disk}=B;
    const moving=['walk','run','run-fire'].includes(state),run=state==='run'||state==='run-fire',shot=state==='fire'?f===1:state==='run-fire'&&f%3===1,lit=alive(state,f),wind=state==='charge'?f:0;
    const swing=[-5,-4,-3,-1,2,4,5,4,3,1,-2,-4][f%12]*(run?1.5:1),attack=state==='melee'?strike(f):0;
    mechanicalLegs(R,pose,id,false);
    // A pelvis bridge is structural, not a stretchy torso.
    p('0',[[-12,-53],[10,-53],[13,-45],[7,-40],[-8,-40],[-13,-45]]);p('2',[[-10,-51],[8,-51],[10,-45],[6,-42],[-7,-42],[-11,-45]]);r('3',-8,-50,8,4);r('4',-7,-50,5,1);
    if(id==='sentinel'){
      // Tall, narrow patrol silhouette: recessed waist, sloping chest, mono-eye.
      arm(B,[7,-75],[13-(moving?swing:0),-49],true,id,false);
      p('0',[[-12,-83],[3,-84],[12,-78],[12,-62],[7,-57],[5,-48],[-6,-47],[-9,-60],[-15,-71]]);
      p('5',[[-11,-81],[2,-82],[10,-77],[10,-63],[5,-58],[3,-49],[-4,-49],[-7,-61],[-13,-71]]);
      p('6',[[-10,-80],[-2,-81],[3,-77],[2,-65],[-5,-60],[-11,-69]]);p('7',[[-9,-79],[-3,-80],[1,-77],[1,-72],[-8,-72]]);p('8',[[-9,-79],[-3,-80],[0,-77],[-8,-76]]);
      p('7',[[4,-80],[10,-77],[10,-71],[5,-73]]);p('9',[[5,-79],[9,-77],[9,-76],[5,-77]]);
      p('1',[[-5,-62],[4,-62],[3,-49],[-4,-49]]);r('3',-4,-60,6,2);r('3',-3,-56,5,2);r('3',-3,-52,5,2);
      p('0',[[-6,-70],[2,-70],[4,-66],[1,-63],[-5,-64]]);r(lit?'b':'a',-4,-68,5,3);r(lit?(wind>2?'e':'c'):'a',-3,-68,3,1);
      r('0',-2,-89,7,9);r('3',-1,-88,5,8);r('4',0,-87,2,6);
      p('0',[[-8,-96],[4,-96],[12,-91],[13,-84],[7,-80],[-4,-81],[-9,-85]]);p('5',[[-7,-95],[3,-95],[11,-90],[11,-84],[6,-82],[-3,-83],[-7,-86]]);
      p('6',[[-6,-94],[2,-94],[7,-91],[5,-87],[-6,-88]]);p('8',[[-5,-94],[1,-94],[4,-92],[-5,-92]]);
      p('0',[[1,-91],[11,-90],[12,-87],[8,-85],[1,-86],[-1,-88]]);p(lit?'b':'1',[[2,-90],[10,-89],[10,-87],[2,-87]]);r(lit?(wind>2?'e':'d'):'3',5,-89,4,2);r(lit?'e':'4',7,-89,1,1);
      r('3',3,-84,5,1);r('4',3,-84,2,1);
      const h=[11+attack-(shot?3:0),-63-(state==='charge'?Math.min(f,3):0)+(state==='melee'&&f===1?-6:0)];
      arm(B,[-10,-76],h,false,id,false);
      { const {p,r}=pivotRaster(B,h[0],h[1],state==='death'&&f>=3?-pose.angle:0);
      const gx=h[0]-3,gy=h[1]-5;
      p('0',[[gx,gy-2],[gx+16,gy-2],[gx+21,gy+1],[gx+26,gy+1],[gx+26,gy+8],[gx+18,gy+8],[gx+13,gy+10],[gx,gy+9]]);
      p('2',[[gx+1,gy],[gx+15,gy],[gx+19,gy+2],[gx+24,gy+2],[gx+24,gy+6],[gx+17,gy+6],[gx+12,gy+8],[gx+1,gy+7]]);r('6',gx+2,gy,12,5);r('7',gx+3,gy,10,2);r('8',gx+3,gy,7,1);r('3',gx+15,gy+3,9,2);r('4',gx+17,gy+3,7,1);r(lit?'c':'a',gx+8,gy+5,5,1);
      if(shot){p('c',[[gx+26,gy+2],[gx+31,gy-1],[gx+30,gy+3],[gx+34,gy+4],[gx+29,gy+5],[gx+31,gy+8],[gx+26,gy+6]]);r('e',gx+26,gy+3,5,2);} }
    }else if(id==='bastion'){
      // Broad shield bearer, with a low recessed head and an offset shoulder rack.
      p('0',[[-22,-91],[-6,-91],[-1,-84],[-2,-71],[-19,-71],[-24,-77]]);p('5',[[-21,-89],[-7,-89],[-3,-83],[-4,-73],[-18,-73],[-22,-78]]);r('7',-20,-88,12,4);r('8',-19,-88,9,1);
      arm(B,[10,-76],[19,-56],true,id,false);
      p('0',[[-17,-82],[6,-83],[18,-75],[17,-59],[10,-52],[8,-47],[-11,-47],[-16,-56],[-20,-70]]);
      p('5',[[-16,-80],[5,-81],[16,-74],[15,-60],[8,-54],[6,-49],[-9,-49],[-14,-57],[-18,-70]]);
      p('6',[[-15,-79],[-2,-80],[4,-75],[2,-63],[-10,-62],[-16,-69]]);p('7',[[-14,-79],[-3,-79],[2,-75],[1,-71],[-14,-71]]);p('8',[[-13,-79],[-4,-79],[-1,-76],[-13,-76]]);
      p('7',[[6,-79],[14,-74],[13,-66],[6,-63],[4,-70]]);p('8',[[7,-77],[12,-74],[12,-71],[7,-73]]);
      r('1',-10,-61,17,9);r('3',-8,-60,13,2);r('3',-8,-56,13,2);r('8',-1,-69,4,5);r('5',0,-68,2,3);
      r('0',-1,-88,9,9);r('3',0,-87,7,7);
      p('0',[[-6,-96],[7,-96],[14,-91],[14,-83],[8,-79],[-2,-80],[-8,-85]]);p('5',[[-5,-95],[6,-95],[12,-90],[12,-84],[7,-81],[-1,-82],[-6,-86]]);
      p('7',[[-4,-94],[6,-94],[10,-91],[8,-88],[-4,-88]]);r('8',-3,-94,8,2);p('0',[[0,-89],[12,-89],[12,-86],[7,-84],[0,-85]]);r(lit?'c':'1',2,-88,9,2);r(lit?(wind>2?'e':'d'):'3',4,-88,6,1);r('3',3,-83,5,1);
      // The launcher is attached to the far shoulder and recoils on discharge.
      { const {p,r}=pivotRaster(B,4,-80,state==='death'&&f>=3?-pose.angle:0);
      const gx=4-(shot?3:0),gy=-80;
      p('0',[[gx,gy-6],[gx+17,gy-6],[gx+22,gy-3],[gx+27,gy-3],[gx+27,gy+6],[gx+6,gy+6],[gx,gy+2]]);p('5',[[gx+2,gy-4],[gx+16,gy-4],[gx+20,gy-1],[gx+25,gy-1],[gx+25,gy+4],[gx+7,gy+4],[gx+2,gy+1]]);r('7',gx+3,gy-4,13,2);r('8',gx+4,gy-4,9,1);r('1',gx+20,gy,6,3);r(lit?'c':'2',gx+21,gy,2,2);r('0',gx+6,gy+5,5,5);r('3',gx+7,gy+5,3,4);
      if(shot){p('c',[[gx+27,gy],[gx+32,gy-3],[gx+31,gy],[gx+36,gy+2],[gx+31,gy+3],[gx+33,gy+6],[gx+27,gy+3]]);r('e',gx+27,gy+1,5,2);} }
      const sx=-3+(state==='melee'?attack:0)+(moving?Math.round(swing/3):0),sy=-58+(run?1:0);
      arm(B,[-15,-74],[sx+2,sy],false,id,false);
      p('0',[[sx-10,sy-18],[sx+6,sy-20],[sx+17,sy-12],[sx+16,sy+16],[sx+6,sy+23],[sx-8,sy+15],[sx-12,sy-7]]);
      p('5',[[sx-8,sy-16],[sx+5,sy-18],[sx+15,sy-11],[sx+14,sy+15],[sx+6,sy+20],[sx-6,sy+14],[sx-10,sy-7]]);
      p('6',[[sx-7,sy-15],[sx+3,sy-17],[sx+9,sy-10],[sx+9,sy+15],[sx+5,sy+18],[sx-5,sy+12],[sx-8,sy-6]]);
      p('7',[[sx-7,sy-15],[sx+3,sy-17],[sx+7,sy-12],[sx-6,sy-10]]);p('8',[[sx-6,sy-15],[sx+2,sy-16],[sx+4,sy-14],[sx-6,sy-12]]);
      p('1',[[sx+9,sy-13],[sx+13,sy-10],[sx+12,sy+13],[sx+9,sy+15]]);p('8',[[sx+1,sy-11],[sx+4,sy-12],[sx+4,sy+12],[sx+1,sy+10]]);
      p('a',[[sx-6,sy+2],[sx,sy+1],[sx,sy+7],[sx-5,sy+6]]);r('c',sx-5,sy+3,4,2);r('4',sx-7,sy-8,2,2);r('4',sx+9,sy+11,2,2);
    }else{
      // Salvage machine: visible pistons, offset boiler, caged sensor and claw.
      p('0',[[-20,-91],[-12,-93],[-7,-86],[-8,-62],[-18,-60],[-23,-66],[-23,-84]]);p('5',[[-19,-90],[-13,-91],[-9,-85],[-10,-64],[-17,-62],[-21,-67],[-21,-84]]);r('3',-20,-89,4,6);r('4',-19,-89,2,5);r('0',-24,-92,6,4);r('3',-23,-92,4,2);
      for(let yy=-81;yy<=-69;yy+=4)r('1',-20,yy,8,2);
      arm(B,[8,-75],[17-(moving?swing:0),-48],true,id,false);
      p('0',[[-13,-83],[3,-84],[14,-76],[15,-65],[10,-57],[6,-51],[6,-47],[-10,-47],[-12,-55],[-17,-65],[-17,-75]]);p('5',[[-12,-81],[2,-82],[12,-75],[13,-66],[8,-58],[4,-52],[4,-49],[-8,-49],[-10,-56],[-15,-66],[-15,-74]]);
      p('6',[[-11,-80],[-2,-81],[5,-76],[5,-67],[-3,-61],[-12,-66],[-14,-73]]);p('7',[[-10,-80],[-2,-80],[3,-76],[3,-72],[-11,-72]]);p('8',[[-10,-79],[-3,-79],[0,-77],[-10,-76]]);
      p('1',[[-5,-61],[5,-61],[5,-48],[-7,-48]]);r('3',-5,-60,8,2);r('4',-5,-60,3,1);r('3',-5,-55,8,2);
      p('0',[[1,-75],[9,-75],[11,-70],[8,-63],[1,-64],[-2,-69]]);p(lit?'b':'a',[[2,-73],[8,-73],[9,-69],[7,-65],[2,-66],[0,-69]]);r(lit?(wind>2?'e':'d'):'3',3,-71,4,4);r(lit?'e':'4',4,-71,2,2);
      r('0',-1,-89,8,10);r('3',0,-88,6,8);r('4',2,-88,2,7);
      p('0',[[-7,-94],[-2,-96],[8,-96],[14,-90],[14,-81],[7,-77],[-3,-79],[-8,-85]]);p('5',[[-6,-93],[-1,-95],[7,-95],[12,-89],[12,-82],[6,-79],[-2,-81],[-6,-86]]);p('7',[[-5,-92],[-1,-94],[6,-94],[11,-90],[10,-87],[-5,-87]]);p('8',[[-3,-93],[6,-93],[8,-91],[-4,-91]]);p('9',[[-1,-94],[5,-94],[7,-92],[-2,-92]]);
      r('0',0,-88,13,6);r(lit?'b':'1',1,-87,10,3);r(lit?'d':'3',4,-87,5,2);r('0',5,-88,1,6);r('0',9,-87,1,5);r('3',2,-81,7,2);r('4',3,-81,1,1);r('4',6,-81,1,1);
      const hx=9+(state==='melee'?attack:0)-(shot?2:0),hy=-57+(state==='melee'?(f===1?-9:(f===2||f===3)?-4:0):0)-(state==='charge'?Math.min(f,3):0);
      arm(B,[-12,-75],[hx,hy],false,id,false);
      { const {p,r}=pivotRaster(B,hx,hy,state==='death'&&f>=3?-pose.angle:0);
      p('0',[[hx-6,hy-6],[hx+6,hy-8],[hx+13,hy-3],[hx+14,hy+7],[hx+7,hy+11],[hx-5,hy+8]]);p('5',[[hx-4,hy-5],[hx+5,hy-6],[hx+11,hy-2],[hx+12,hy+6],[hx+6,hy+9],[hx-3,hy+6]]);p('7',[[hx-3,hy-5],[hx+5,hy-6],[hx+9,hy-3],[hx-3,hy-1]]);r('8',hx-2,hy-5,6,2);r('0',hx-1,hy+1,7,5);r('3',hx,hy+2,5,3);r('4',hx+1,hy+2,2,2);
      const close=state==='melee'&&(f===2||f===3)?4:state==='charge'?Math.min(f,4):0;
      p('0',[[hx+9,hy-5],[hx+19,hy-10+close],[hx+27,hy-8+close],[hx+30,hy-3+close],[hx+26,hy-1+close],[hx+23,hy-5+close],[hx+19,hy-5+close],[hx+14,hy+1]]);
      p('4',[[hx+12,hy-5],[hx+19,hy-8+close],[hx+25,hy-7+close],[hx+27,hy-4+close],[hx+25,hy-3+close],[hx+23,hy-6+close],[hx+19,hy-6+close],[hx+14,hy-1]]);
      p('0',[[hx+11,hy+5],[hx+19,hy+12-close],[hx+27,hy+11-close],[hx+30,hy+6-close],[hx+26,hy+4-close],[hx+23,hy+8-close],[hx+20,hy+8-close],[hx+15,hy+2]]);
      p('3',[[hx+13,hy+5],[hx+20,hy+10-close],[hx+25,hy+9-close],[hx+27,hy+6-close],[hx+25,hy+6-close],[hx+23,hy+9-close],[hx+20,hy+9-close],[hx+15,hy+3]]);
      if(shot){p('b',[[hx+17,hy],[hx+23,hy-2],[hx+26,hy],[hx+31,hy-2],[hx+29,hy+2],[hx+21,hy+4]]);r('e',hx+19,hy+1,9,1);} }
    }
  }
  // Mini plates, sensors, equipment and joints are their own pixel decisions.
  function mini(c,id,state,f){
    const R=raster(c,palettes[id]),pose=CADEnemyMechMotion.sample('mini',state,f),B=bodyRaster(R,pose,'mini'),{p,r,disk}=B;
    const moving=['walk','run','run-fire'].includes(state),swing=[-2,-2,-1,0,1,2,2,2,1,0,-1,-2][f%12],shot=state==='fire'?f===1:state==='run-fire'&&f%3===1,lit=alive(state,f),attack=state==='melee'?[0,-2,3,3,1,0][f]:0;
    mechanicalLegs(R,pose,id,true);r('0',-4,-18,8,5);r('2',-3,-17,6,3);r('3',-2,-17,2,1);
    if(id==='sentinel'){
      arm(B,[2,-25],[4-(moving?swing:0),-17],true,id,true);
      p('0',[[-4,-28],[1,-28],[5,-25],[4,-20],[2,-18],[1,-15],[-2,-15],[-3,-20],[-5,-23]]);p('5',[[-3,-27],[1,-27],[4,-25],[3,-21],[1,-19],[0,-16],[-1,-16],[-2,-21],[-4,-23]]);p('7',[[-3,-26],[0,-27],[2,-24],[-2,-23]]);r('8',-3,-26,2,1);r('3',-1,-20,3,1);r('3',-1,-18,2,1);r(lit?'c':'a',0,-23,2,1);
      r('0',0,-29,2,3);p('0',[[-2,-32],[2,-32],[5,-30],[5,-27],[2,-25],[-2,-27],[-3,-29]]);p('6',[[-1,-31],[2,-31],[4,-29],[3,-27],[0,-27],[-2,-29]]);r('8',-1,-31,3,1);r('0',1,-30,4,2);r(lit?'d':'3',2,-29,2,1);if(state==='idle')r('e',2+(f>3?1:0),-29,1,1);
      const hx=3+attack-(shot?1:0),hy=-21-(state==='charge'&&f>1?1:0);arm(B,[-3,-25],[hx,hy],false,id,true);{ const {p,r}=pivotRaster(B,hx,hy,state==='death'&&f>=3?-pose.angle:0);p('0',[[hx-1,hy-2],[hx+4,hy-2],[hx+5,hy-1],[hx+8,hy-1],[hx+8,hy+2],[hx-1,hy+3]]);r('6',hx,hy-1,4,3);r('8',hx,hy-1,3,1);r('3',hx+4,hy,3,1);r(lit?'c':'a',hx+1,hy+1,2,1);if(shot){r('d',hx+8,hy-1,2,3);r('e',hx+8,hy,3,1);} }
    }else if(id==='bastion'){
      p('0',[[-7,-30],[-2,-30],[0,-27],[-1,-23],[-6,-23],[-8,-26]]);r('5',-6,-29,4,5);r('7',-6,-29,3,1);
      arm(B,[3,-25],[5,-18],true,id,true);p('0',[[-5,-28],[2,-28],[6,-25],[5,-19],[2,-16],[-3,-16],[-6,-21]]);p('6',[[-4,-27],[1,-27],[4,-25],[4,-20],[1,-17],[-2,-17],[-5,-21]]);r('7',-4,-27,5,3);r('8',-3,-27,3,1);r('1',-2,-20,4,3);r('4',-1,-19,2,1);
      p('0',[[-2,-32],[3,-32],[5,-30],[5,-27],[2,-25],[-2,-27],[-3,-29]]);p('7',[[-1,-31],[2,-31],[4,-29],[3,-27],[0,-27],[-2,-29]]);r('8',-1,-31,3,1);r('0',1,-29,4,2);r(lit?'d':'3',2,-28,2,1);if(state==='idle')r('e',2+(f>3?1:0),-28,1,1);
      { const {p,r}=pivotRaster(B,2,-25,state==='death'&&f>=3?-pose.angle:0);const gx=2-(shot?1:0);p('0',[[gx,-27],[gx+5,-27],[gx+7,-26],[gx+9,-26],[gx+9,-23],[gx+2,-23]]);r('7',gx+1,-26,5,1);r('8',gx+1,-26,3,1);r('2',gx+7,-25,2,1);if(shot){r('c',gx+9,-26,2,3);r('e',gx+9,-25,3,1);} }
      const sx=-1+attack+(moving?Math.round(swing/2):0);arm(B,[-4,-25],[sx,-20],false,id,true);p('0',[[sx-4,-26],[sx+2,-27],[sx+6,-24],[sx+5,-14],[sx+2,-12],[sx-3,-15],[sx-4,-21]]);p('5',[[sx-3,-25],[sx+2,-26],[sx+4,-23],[sx+4,-15],[sx+2,-13],[sx-2,-16]]);p('7',[[sx-2,-25],[sx+1,-25],[sx+2,-23],[sx+2,-15],[sx-1,-17]]);r('8',sx-2,-25,3,1);r('8',sx+1,-22,1,6);r('a',sx-2,-19,2,2);r('c',sx-2,-19,1,1);
    }else{
      r('0',-7,-31,3,10);r('3',-6,-30,1,4);r('5',-6,-26,2,5);r('7',-5,-25,1,3);arm(B,[3,-25],[5-(moving?swing:0),-17],true,id,true);
      p('0',[[-4,-28],[1,-28],[5,-25],[5,-21],[2,-18],[1,-15],[-3,-15],[-5,-20],[-6,-24]]);p('6',[[-3,-27],[1,-27],[4,-24],[3,-21],[0,-18],[0,-16],[-2,-16],[-4,-21],[-5,-24]]);r('7',-3,-26,4,3);r('8',-3,-26,3,1);r('1',-2,-20,3,3);r('4',-1,-19,2,1);r('0',1,-24,4,4);r(lit?'c':'a',2,-23,2,2);r(lit?'e':'3',2,-23,1,1);
      p('0',[[-2,-32],[3,-32],[5,-30],[5,-27],[2,-25],[-2,-26],[-3,-29]]);p('7',[[-1,-31],[2,-31],[4,-29],[3,-27],[0,-27],[-2,-29]]);r('9',-1,-31,3,1);r('0',0,-29,5,2);r(lit?'d':'3',1,-28,3,1);if(state==='idle')r('e',f>3?3:1,-28,1,1);r('0',2,-29,1,3);r('4',1,-26,2,1);
      const hx=2+attack-(shot?1:0),hy=-19-(state==='charge'&&f>1?1:0)-(state==='melee'&&(f===2||f===3)?2:0);arm(B,[-4,-25],[hx,hy],false,id,true);{ const {p,r}=pivotRaster(B,hx,hy,state==='death'&&f>=3?-pose.angle:0);p('0',[[hx-2,hy-2],[hx+2,hy-3],[hx+5,hy-1],[hx+5,hy+3],[hx+1,hy+4],[hx-2,hy+2]]);r('6',hx-1,hy-1,4,4);r('8',hx,hy-2,2,1);r('3',hx,hy+1,2,1);
      const close=state==='melee'&&(f===2||f===3)?1:0;p('0',[[hx+3,hy-1],[hx+6,hy-4+close],[hx+9,hy-3+close],[hx+10,hy-1+close],[hx+8,hy+close],[hx+7,hy-2+close],[hx+5,hy+1]]);p('4',[[hx+4,hy-1],[hx+6,hy-3+close],[hx+8,hy-2+close],[hx+7,hy-2+close],[hx+5,hy+1]]);p('0',[[hx+3,hy+2],[hx+6,hy+5-close],[hx+9,hy+4-close],[hx+10,hy+2-close],[hx+8,hy+1-close],[hx+7,hy+3-close],[hx+5,hy+1]]);p('3',[[hx+4,hy+2],[hx+6,hy+4-close],[hx+8,hy+3-close],[hx+7,hy+3-close],[hx+5,hy+1]]);if(shot){r('c',hx+6,hy,3,1);r('e',hx+8,hy,2,1);} }
    }
  }
  function draw(c,id,size,x,y,{state='idle',frame=null,time=0,facing=1}={}){if(!ids.includes(id))id='sentinel';if(!durations[state])state='idle';const f=frame==null?frameAt(state,time):loop(frame,durations[state].length);c.save();c.translate(Math.round(x),Math.round(y));c.scale(facing<0?-1:1,1);(size==='mini'?mini:big)(c,id,state,f);c.restore();}
  function metadata(id){const M=CADEnemyMechMotion;return {name:id[0].toUpperCase()+id.slice(1),id,sourcePixelWorldUnits:1,framePadding:'Repeat final authored pose to fill 12 columns',palette:palettes[id],sizes:specs,columns,rows:states,timingMs:durations,frameCounts:Object.fromEntries(states.map(s=>[s,durations[s].length])),loops:M.loops,contactFrames:M.contactFrames,phases:Object.fromEntries(states.map(s=>[s,durations[s].map((_,f)=>M.sample('big',s,f).phase)])),motion:{dimensions:M.dimensions,poses:Object.fromEntries(['big','mini'].map(size=>[size,Object.fromEntries(states.map(s=>[s,durations[s].map((_,f)=>M.sample(size,s,f))]))]))}};}
  window.CADEnemyMechs={ids,specs,palettes,states,durations,columns,frameAt,draw,metadata};
})();
