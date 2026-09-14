/* Original flying enemies. Big and mini geometry is independently authored.
 * All rotation is rasterized into opaque native pixels before scene presentation.
 * x/y is the shared ground anchor; hover motion lives inside each native cell.
 */
(() => {
  'use strict';
  const ids = ['watcher', 'manta', 'collector'];
  const specs = {
    big: {width:128, height:128, anchor:[64,112], spanPx:96},
    mini: {width:48, height:48, anchor:[20,40], spanPx:32}
  };
  const palettes = {
    watcher:['#101620','#1d2634','#29364d','#42536a','#72838e','#b4bfc2','#5d465a','#9a687b','#482c51','#86416c','#cc7197','#f0a4b8','#354f57','#77a5aa','#eba77d','#d4ccad'],
    manta:['#101620','#1d2634','#29364d','#42536a','#72838e','#b4bfc2','#453656','#756184','#303b62','#536a95','#829abd','#acd0d3','#315557','#6ca9a0','#eba77d','#d4ccad'],
    collector:['#101620','#1d2634','#29364d','#42536a','#72838e','#b4bfc2','#614338','#9b654a','#524131','#8c704a','#c29b65','#edbd80','#364d4c','#6c8c7a','#db8766','#d4ccad']
  };
  const states = ['idle','patrol','rush','charge','fire','hurt','death'];
  const durations = {
    idle:Array(8).fill(130), patrol:Array(12).fill(90), rush:Array(12).fill(60),
    charge:[100,100,90,80,70,160], fire:[45,60,65,85,100,150],
    hurt:[65,85,110,150], death:[70,75,85,90,100,120,150,500]
  };
  const loops = Object.fromEntries(states.map(s=>[s,['idle','patrol','rush'].includes(s)]));
  const loop = (f,n)=>((Math.trunc(f)||0)%n+n)%n;
  function frameAt(state,time) {
    const ts=durations[state]||durations.idle, total=ts.reduce((a,b)=>a+b,0);
    let ms=((time*1000)%total+total)%total;
    for(let f=0;f<ts.length;f++){if(ms<ts[f])return f;ms-=ts[f];}return 0;
  }
  function sample(size,state,frame) {
    const small=size==='mini', f=loop(frame,durations[state].length);
    const drift=[0,-1,-2,-2,-1,0,1,2,2,1,0,0];
    const bob=state==='idle'?[0,0,-1,-1,0,0,1,1][f]:state==='patrol'?drift[f]:state==='rush'?[0,0,-1,-1,0,1,1,0,-1,-1,0,1][f]:0;
    const death=state==='death', hurt=state==='hurt';
    const dy=death?(small?[0,0,1,4,7,10,12,12]:[0,0,4,12,22,32,38,38])[f]:0;
    const recoil=state==='fire'?(small?[-1,-1,0,0,0,0]:[-3,-2,-1,0,0,0])[f]:hurt?(small?[-1,-1,0,0]:[-3,-2,-1,0])[f]:0;
    const angle=death?[0,-.08,.12,.26,.36,.22,.20,.20][f]:hurt?[-.14,-.08,.04,0][f]:state==='rush'?.06:state==='patrol'?[0,-.02,-.04,-.04,-.02,0,.02,.04,.04,.02,0,0][f]:0;
    return {f,state,x:recoil,y:(small?-21:-64)+(small?Math.round(bob/2):bob)+dy,angle,
      rotor:death&&f>3?0:f%4, disabled:death&&f>1,
      charge:state==='charge'?f:0, fire:state==='fire'&&f<3,
      fold:death?Math.min(1,f/4):0,
      phase:state==='charge'?['acquire','focus','focus','arm','arm','warning'][f]:state==='fire'?['release','release','recoil','recover','recover','ready'][f]:death?['impact','short','drop','drop','crash','settle','wreck','wreck'][f]:state};
  }
  function raster(c,colors,pose) {
    const co=Math.cos(pose.angle), si=Math.sin(pose.angle);
    const point=([x,y])=>[Math.round(pose.x+x*co-y*si),Math.round(pose.y+x*si+y*co)];
    const ink=(index,x,y,w,h)=>{if(w<1||h<1)return;c.fillStyle=colors[index];c.fillRect(x,y,w,h);};
    function poly(index,vertices) {
      const pts=vertices.map(point), lo=Math.min(...pts.map(p=>p[1])), hi=Math.max(...pts.map(p=>p[1]));
      for(let y=lo;y<hi;y++) {
        const intersections=[], scan=y+.5;
        for(let i=0;i<pts.length;i++) {
          const a=pts[i],b=pts[(i+1)%pts.length];
          if((a[1]<=scan&&b[1]>scan)||(b[1]<=scan&&a[1]>scan))intersections.push(a[0]+(scan-a[1])*(b[0]-a[0])/(b[1]-a[1]));
        }
        intersections.sort((a,b)=>a-b);
        for(let i=0;i+1<intersections.length;i+=2){const x=Math.ceil(intersections[i]-.5),end=Math.ceil(intersections[i+1]-.5);ink(index,x,y,end-x,1);}
      }
    }
    const rect=(index,x,y,w=1,h=1)=>poly(index,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]);
    const band=(index,a,b,width)=>{const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,n=[-dy/d*width,dx/d*width];poly(index,[[a[0]+n[0],a[1]+n[1]],[b[0]+n[0],b[1]+n[1]],[b[0]-n[0],b[1]-n[1]],[a[0]-n[0],a[1]-n[1]]]);};
    return {p:poly,r:rect,band};
  }
  function rotor(R,x,y,pose,small=false) {
    const {p,r}=R;
    if(small) {
      r(0,x-2,y,4,6);r(3,x-1,y+1,2,4);r(4,x-1,y+1,1,3);
      const widths=[6,4,2,5], w=widths[pose.rotor];
      r(0,x-w,y-2,w*2,2);r(5,x-w,y-2,w*2,1);r(0,x-1,y-3,2,2);
      if(!pose.disabled){r(13,x-1,y+6,2,1);r(5,x,y+7,1,1+pose.f%2);}
      return;
    }
    p(0,[[x-6,y],[x+5,y],[x+7,y+5],[x+5,y+14],[x-5,y+14],[x-7,y+5]]);
    r(2,x-4,y+2,8,10);r(4,x-4,y+2,3,9);r(5,x-3,y+2,2,2);r(1,x+2,y+3,2,8);
    r(0,x-2,y-5,4,7);r(4,x-1,y-4,2,5);
    const widths=[16,11,6,13],w=widths[pose.rotor];
    r(0,x-w,y-4,w*2,3);r(5,x-w,y-4,w*2,1);r(3,x-w+1,y-3,w*2-2,1);
    r(0,x-3,y-5,6,4);r(4,x-2,y-5,3,2);
    if(!pose.disabled){r(12,x-3,y+14,6,3);r(13,x-2,y+15,4,2+pose.f%3);r(5,x-1,y+15,2,1+pose.f%2);}
  }
  function lens(R,x,y,pose,small=false) {
    const {p,r}=R, lit=pose.disabled?3:pose.charge>3?15:10;
    if(small){r(0,x-2,y-1,5,3);r(pose.disabled?1:8,x-1,y,3,1);r(lit,x,y,2,1);if(!pose.disabled)r(11,x+1,y,1,1);return;}
    p(0,[[x-9,y-5],[x+6,y-5],[x+10,y-2],[x+10,y+4],[x+5,y+7],[x-9,y+5],[x-12,y]]);
    p(pose.disabled?1:8,[[x-8,y-3],[x+5,y-3],[x+8,y-1],[x+8,y+3],[x+4,y+5],[x-8,y+3],[x-10,y]]);
    r(pose.disabled?2:9,x-6,y-2,11,5);r(lit,x-2,y-2,6,4);r(pose.disabled?4:11,x+1,y-2,3,2);
    if(pose.charge>1){r(10,x-8,y-6,2,2);r(11,x+5,y+5,2,2);}
  }
  function muzzle(R,x,y,pose,small=false) {
    const {p,r}=R;
    if(pose.state==='charge') {
      const radius=small?(pose.f>2?2:1):[1,2,3,3,4,5][pose.f];
      p(8,[[x-1,y-radius],[x+radius,y-radius],[x+radius+1,y],[x+radius,y+radius],[x-1,y+radius]]);
      r(pose.f>3?11:10,x,y-Math.max(0,radius-1),Math.max(1,radius),Math.max(1,radius*2-1));
      r(15,x,y,small?1:2,1);
    }
    if(!pose.fire)return;
    const reach=small?[6,4,2][pose.f]:[17,11,6][pose.f];
    p(10,[[x,y-3],[x+reach*.5,y-2],[x+reach,y],[x+reach*.5,y+2],[x,y+3]]);
    r(15,x,y-1,Math.max(2,reach-2),2);
    if(!small){r(11,x+3,y-6,2,3);r(11,x+5,y+4,2,3);}
  }
  function watcherBig(R,pose) {
    const {p,r,band}=R;
    // Connected open truss: visible negative space separates the rotor booms.
    for(const x of [-32,32]) {
      band(0,[x,-4],[x<0?-12:10,1],4);band(3,[x,-5],[x<0?-12:10,0],2);
      band(4,[x,-6],[x<0?-12:10,-1],1);rotor(R,x,-18,pose);
    }
    p(0,[[-13,-18],[1,-23],[13,-17],[18,-5],[14,12],[7,18],[-9,15],[-17,5],[-18,-9]]);
    p(3,[[-12,-16],[0,-20],[11,-15],[15,-4],[11,10],[5,15],[-7,12],[-14,4],[-15,-8]]);
    p(4,[[-12,-14],[0,-18],[10,-14],[12,-8],[-10,-9],[-14,-3]]);
    p(5,[[-10,-14],[0,-17],[7,-14],[0,-14],[-7,-12]]);
    p(2,[[-13,2],[-4,7],[11,3],[10,10],[4,14],[-6,11],[-12,6]]);
    r(8,-9,8,8,3);r(9,-8,8,5,1);r(0,-2,-22,4,4);r(4,-1,-25,2,4);
    lens(R,6,-3,pose);
    r(0,3,13,7,11);r(3,4,14,5,8);r(4,4,14,2,6);r(0,9,18,15,6);r(4,11,19,12,1);r(2,11,20,13,3);
    muzzle(R,24,21,pose);r(0,-10,12,5,8);r(4,-9,13,2,6);
  }
  function watcherMini(R,pose) {
    const {p,r}=R;
    r(0,-10,-2,21,3);r(3,-10,-2,20,1);rotor(R,-10,-6,pose,true);rotor(R,10,-6,pose,true);
    p(0,[[-5,-5],[-1,-7],[3,-5],[5,-1],[4,4],[0,6],[-4,4],[-6,0]]);
    p(3,[[-4,-4],[-1,-5],[2,-4],[4,0],[3,3],[0,4],[-3,3],[-4,0]]);
    r(4,-3,-4,4,2);r(5,-2,-4,2,1);r(0,0,-8,1,2);lens(R,2,-1,pose,true);
    r(0,0,5,3,3);r(3,1,5,1,2);r(0,2,6,6,2);r(4,3,6,4,1);muzzle(R,8,7,pose,true);
  }
  function mantaBig(R,pose) {
    const {p,r}=R,bank=pose.phase==='patrol'?Math.round(Math.sin(pose.f*Math.PI/6)*2):0;
    // Angular swept wing, heavy dorsal spine, paired recessed induction vents.
    p(0,[[-48,-9],[-35,-22],[-13,-16],[-3,-25],[12,-18],[30,-23],[48,-11],[48,-8],[35,4],[19,8],[8,16],[-13,12],[-31,3],[-48,-6]]);
    p(8,[[-45,-9],[-34,-19],[-13,-13],[-2,-21],[12,-14],[29,-20],[44,-10],[34,1],[16,5],[6,12],[-12,9],[-29,0],[-45,-7]]);
    p(9,[[-44,-9],[-34,-18],[-16,-12],[-10,-8],[-31,-6],[-35,-3],[-43,-7]]);
    p(9,[[13,-12],[29,-19],[43,-10],[32,-7],[20,-4]]);
    p(10,[[-42,-10],[-34,-17],[-28,-15],[-34,-14],[-39,-9]]);
    p(10,[[22,-16],[29,-18],[40,-11],[31,-12]]);
    p(2,[[-34,-4],[-12,-6],[-3,7],[-12,9],[-29,0]]);
    p(2,[[17,-3],[33,-6],[36,-1],[17,5],[7,11]]);
    for(const x of [-27,24]) {
      r(0,x-6,-7+bank,12,10);r(1,x-4,-6+bank,8,7);
      r(pose.disabled?3:12,x-3,-4+bank,6,5);r(pose.disabled?4:13,x-3,-3+bank,6,2);
      if(!pose.disabled)r(5,x-2,2+bank,4,1+pose.f%3);
    }
    p(0,[[-9,-19],[2,-24],[12,-13],[18,-1],[13,11],[3,17],[-7,13],[-13,2]]);
    p(3,[[-7,-17],[1,-20],[9,-12],[14,-1],[10,9],[2,13],[-5,10],[-10,1]]);
    p(4,[[-6,-15],[0,-18],[5,-12],[5,-6],[-5,-5],[-8,1]]);
    r(5,-2,-16,2,7);lens(R,7,0,pose);
    r(0,3,11,10,9);r(3,5,12,6,6);r(4,5,12,2,5);r(0,9,14,22,7);r(4,11,15,19,2);r(8,13,18,16,2);
    muzzle(R,31,17,pose);
  }
  function mantaMini(R,pose) {
    const {p,r}=R;
    p(0,[[-16,-3],[-12,-7],[-4,-4],[-1,-8],[4,-5],[10,-7],[16,-3],[16,-2],[10,1],[5,2],[2,5],[-4,4],[-11,0],[-16,-2]]);
    p(8,[[-15,-3],[-12,-6],[-4,-3],[-1,-6],[4,-3],[10,-6],[14,-3],[10,0],[4,1],[1,4],[-3,3],[-10,-1]]);
    r(9,-12,-4,6,2);r(10,-12,-5,3,1);r(9,7,-4,5,2);r(10,10,-5,2,1);
    r(0,-10,-2,5,3);r(0,8,-2,4,3);r(pose.disabled?3:13,-9,-1,3,1);r(pose.disabled?3:13,9,-1,2,1);
    if(!pose.disabled){const thrust=pose.state==='rush'?1+pose.f%3:1+pose.f%2;r(13,-9,1,2,thrust);r(5,-9,1,1,1);r(13,9,1,2,thrust);r(5,9,1,1,1);}
    p(0,[[-3,-5],[0,-7],[3,-3],[5,1],[2,5],[-2,4],[-4,0]]);
    p(3,[[-2,-4],[0,-5],[2,-2],[3,1],[1,4],[-1,3],[-3,0]]);r(4,-1,-4,1,4);lens(R,2,0,pose,true);
    r(0,1,4,3,3);r(0,3,5,7,2);r(4,4,5,5,1);muzzle(R,10,6,pose,true);
  }
  function claw(R,root,elbow,tip,opening,small=false) {
    const {p,r,band}=R,w=small?1:3;
    band(0,root,elbow,w+1);band(7,root,elbow,w);band(0,elbow,tip,w+1);band(4,elbow,tip,w-0.2);
    if(!small){band(10,[root[0]-1,root[1]],[elbow[0]-1,elbow[1]],1);r(0,elbow[0]-4,elbow[1]-3,8,7);r(7,elbow[0]-2,elbow[1]-2,4,4);r(10,elbow[0]-2,elbow[1]-2,2,1);}
    const [x,y]=tip, spread=small?opening:opening+2, down=small?3:8;
    for(const sign of [-1,1]) {
      const pts=[[x+sign*w,y-1],[x+sign*spread,y+down*.4],[x+sign*(spread-1),y+down],[x+sign*(spread-3),y+down-1],[x+sign*(spread-2),y+down*.4],[x,y+1]];
      p(0,pts);band(10,[x+sign, y+1],[x+sign*(spread-1),y+down*.5],small?.6:1.3);
    }
  }
  function collectorBig(R,pose) {
    const {p,r,band}=R, swing=pose.fold?Math.round(pose.fold*15):Math.round(Math.sin(pose.f*Math.PI/6)*3);
    for(const x of [-32,32]) {
      band(0,[x,-7],[x<0?-12:12,-1],5);band(6,[x,-8],[x<0?-12:12,-2],3);band(7,[x,-9],[x<0?-12:12,-3],1.5);
      rotor(R,x,-18,pose);
      r(0,x-8,-15,16,5);r(7,x-7,-14,14,3);r(10,x-6,-14,4,1);
    }
    const open=pose.phase==='warning'?10:pose.fire?3:5;
    claw(R,[-10,10],[-20-swing,20-swing],[-14-swing,30-swing],open);
    p(0,[[-13,-18],[7,-18],[16,-8],[14,13],[9,21],[-10,20],[-18,9],[-19,-8]]);
    p(6,[[-12,-16],[6,-16],[13,-7],[11,12],[7,18],[-8,17],[-15,8],[-16,-7]]);
    p(7,[[-11,-15],[5,-15],[10,-9],[8,2],[-11,1],[-14,-6]]);
    p(10,[[-10,-15],[4,-15],[8,-10],[2,-10],[-10,-11]]);
    p(9,[[-13,4],[11,4],[9,12],[5,17],[-7,15],[-13,8]]);
    r(0,-9,6,16,7);r(6,-8,7,14,5);
    for(const x of [-7,-1,5]){p(10,[[x,7],[x+3,7],[x,12],[x-3,12]]);}
    r(0,-9,-21,14,4);r(3,-7,-23,10,3);r(4,-6,-23,5,1);
    lens(R,5,-5,pose);
    claw(R,[11,8],[23+swing,17-swing],[19+swing,28-swing],open);
    r(0,-3,17,8,11);r(3,-1,18,4,8);r(4,-1,18,2,6);r(0,4,21,16,6);r(7,5,22,14,4);r(10,6,22,12,1);muzzle(R,20,24,pose);
  }
  function collectorMini(R,pose) {
    const {p,r}=R,fold=Math.round(pose.fold*5),swing=fold||Math.round(Math.sin(pose.f*Math.PI/6));
    r(0,-11,-2,22,3);r(7,-10,-2,20,1);rotor(R,-10,-6,pose,true);rotor(R,10,-6,pose,true);
    claw(R,[-3,4],[-7-swing,7-swing],[-5-swing,10-swing],2,true);
    p(0,[[-5,-6],[2,-6],[5,-2],[4,5],[2,7],[-3,6],[-6,2],[-6,-3]]);
    p(7,[[-4,-5],[1,-5],[4,-1],[3,4],[1,6],[-2,5],[-5,1],[-5,-2]]);
    r(10,-3,-5,3,1);r(0,-3,3,5,2);r(10,-2,3,1,1);r(10,1,3,1,1);lens(R,2,-2,pose,true);
    claw(R,[3,3],[7+swing,6-swing],[6+swing,9-swing],pose.fire?1:2,true);
    r(0,0,6,2,3);r(0,1,7,5,2);r(10,2,7,3,1);muzzle(R,6,8,pose,true);
  }
  const drawers={big:{watcher:watcherBig,manta:mantaBig,collector:collectorBig},mini:{watcher:watcherMini,manta:mantaMini,collector:collectorMini}};
  function draw(c,id,size,x,y,{state='idle',frame=null,time=0,facing=1}={}) {
    if(!ids.includes(id))id='watcher';if(!durations[state])state='idle';if(size!=='mini')size='big';
    const f=frame==null?frameAt(state,time):loop(frame,durations[state].length), pose=sample(size,state,f);
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(facing<0?-1:1,1);
    const R=raster(c,palettes[id],pose);drawers[size][id](R,pose);
    if((state==='hurt'||state==='death')&&f<3) {
      const small=size==='mini', d=small?5:17;
      R.r(14,-d,-d,small?1:3,small?2:4);R.r(15,-d+1,-d-1,1,small?1:2);
      R.r(14,d-2,-d+4,small?1:3,small?1:2);
    }
    c.restore();
  }
  function metadata(id) {
    return {id,kind:'aerial',standingMeasurement:'neutral rotor / wing span',spanPx:{big:96,mini:32},
      groundAnchor:true,hoverCenter:{big:-64,mini:-21},loops,
      phases:Object.fromEntries(states.map(state=>[state,durations[state].map((_,f)=>sample('big',state,f).phase)])),
      poses:Object.fromEntries(['big','mini'].map(size=>[size,Object.fromEntries(states.map(state=>[state,durations[state].map((_,f)=>sample(size,state,f))]))]))};
  }
  window.CADEnemyDrones={ids,specs,palettes,states,durations,columns:12,loops,frameAt,sample,draw,metadata};
})();
