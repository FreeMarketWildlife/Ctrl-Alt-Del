/* Original 88px anatomy studies. Explicit key poses, integer scanline rasterization. */
(() => {
  const states=['idle','walk','run','jab','cross','front-kick','round-kick','stand'];
  const common=['#0d1324','#242b43','#41435d','#687287','#aab5b6','#dfd8bc','#754b51','#b87569','#edb58d','#513a48','#936044','#c99361'];
  const palettes={jessie:[...common,'#153e4e','#236b75','#43a69c','#90d5bd'],jane:[...common,'#482c51','#86416c','#bf6695','#f0a4b8']};
  const colorCache={jessie:new Map(),jane:new Map()};
  function colorFor(name,color){const cache=colorCache[name];if(cache.has(color))return cache.get(color);const rgb=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)),target=rgb(color);const result=palettes[name].reduce((best,p)=>{const d=rgb(p).reduce((s,v,i)=>s+(v-target[i])**2,0);return d<best.d?{p,d}:best;},{p:common[0],d:Infinity}).p;cache.set(color,result);return result;}
  const timing={idle:[.12,.12,.12,.12,.08,.08,.08,.08],walk:Array(8).fill(.11),run:Array(8).fill(.075),jab:[.16,.045,.10,.055,.08,.09,.10,.22],cross:[.12,.10,.045,.12,.06,.08,.10,.22],'front-kick':[.16,.09,.055,.12,.06,.08,.10,.22],'round-kick':[.16,.11,.065,.12,.07,.10,.10,.22]};
  timing.stand=Array(8).fill(.15);
  function frameAt(state,t){const times=timing[state]||timing.idle;let phase=((t%times.reduce((a,b)=>a+b,0))+times.reduce((a,b)=>a+b,0))%times.reduce((a,b)=>a+b,0);for(let i=0;i<8;i++){if(phase<times[i])return i;phase-=times[i];}return 7;}
  function draw(c,name,x,feet,{state='idle',time=0,facing=1,frame=null}={}){
    const jane=name==='jane',f=frame??frameAt(state,time),walk=state==='walk',run=state==='run',travel=walk||run,neutral=state==='stand',profile=travel||neutral,kick=state.includes('kick'),attack=!profile&&state!=='idle';
    const ink='#0b1525',skin=jane?'#ce977d':'#c58969',light=jane?'#f1c1a0':'#efb88b',shade='#8d5653',cloth=jane?'#a94480':'#268c91',shine=jane?'#e888b7':'#73d5c5',dark=jane?'#602d58':'#1b515d';
    c.save();c.translate(Math.round(x),Math.round(feet));c.scale(facing,1);
    const r=(color,x,y,w,h)=>{c.fillStyle=colorFor(name,color);c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    // Fill on integer scanlines so sloped limbs never create blurred edge pixels.
    const poly=(color,points)=>{const pts=points.map(p=>p.map(Math.round)),lo=Math.min(...pts.map(p=>p[1])),hi=Math.max(...pts.map(p=>p[1]));for(let y=lo;y<hi;y++){const hits=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))hits.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}hits.sort((a,b)=>a-b);for(let i=0;i<hits.length;i+=2)r(color,Math.ceil(hits[i]),y,Math.ceil(hits[i+1])-Math.ceil(hits[i]),1);}};
    const bone=(a,b,w1,w2,color)=>{const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;poly(color,[[a[0]+nx*w1/2,a[1]+ny*w1/2],[b[0]+nx*w2/2,b[1]+ny*w2/2],[b[0]-nx*w2/2,b[1]-ny*w2/2],[a[0]-nx*w1/2,a[1]-ny*w1/2]]);};
    const limb=(a,b,d,width,color,highlight)=>{bone(a,b,width+2,width,ink);bone(b,d,width,width-2,ink);bone(a,b,width,width-2,color);bone(b,d,width-2,width-4,color);bone([a[0]-1,a[1]+1],[b[0]-1,b[1]],2,2,highlight);};
    let bob=[0,-1,-2,-1,0,1,2,1][f],lean=0,hip=[0,-43],k1=[-12,-23],foot1=[-17,-4],k2=[11,-24],foot2=[15,-4],e1=[-10,-54],hand1=[0,-68],e2=[16,-54],hand2=[21,-70];
    if(travel){
      bob=[0,1,-2,-1,0,1,-2,-1][f];
      const legs=run?[[14,-26,25,-4], [10,-24,13,-4],[-2,-25,-9,-9],[-16,-29,-24,-22],[-15,-27,-22,-6],[-8,-24,-15,-4],[6,-31,-8,-23],[17,-30,11,-16]]:[[9,-24,17,-4],[4,-23,9,-4],[-3,-23,-1,-4],[-10,-24,-12,-5],[-10,-25,-18,-5],[-7,-28,-11,-13],[3,-27,-3,-15],[11,-25,12,-9]];
      const a=legs[f],b=legs[(f+4)%8];k2=a.slice(0,2);foot2=a.slice(2);k1=b.slice(0,2);foot1=b.slice(2);lean=run?5:0;
      const swing=[-15,-8,0,9,15,8,0,-9][f]*(jane?1:.8);e2=[swing*.6,-54];hand2=[2+swing,-(run?64:38)];e1=[-2-swing*.6,-55];hand1=[-1-swing,-(run?62:39)];
    }
    if(neutral){bob=0;k1=[-3,-24];foot1=[-3,-4];k2=[3,-24];foot2=[3,-4];e1=[-4,-53];hand1=[-2,-38];e2=[3,-53];hand2=[5,-38];}
    if(attack){const force=[0,-2,5,7,6,3,-1,0][f];lean=kick?-Math.max(0,force):force;bob=[0,-1,0,1,1,0,1,0][f];
      if(kick&&f>0&&f<6){const raised=f===1||f===5,round=state==='round-kick';k2=raised?[15,-50]:[22,-48];foot2=raised?[10,-33]:[44,round?-67:-46];k1=[-5,-24];foot1=[-8,-4];bob=-3;e2=[13,-65];hand2=[17,-79];e1=[-13,-54];hand1=[-3,-66];}
      else if(!kick){const extension=[0,-4,25,28,29,12,-2,0][f];if(state==='cross'){e1=[-8+extension*.7,-66];hand1=[3+extension,-69];e2=[12,-55];hand2=[9,-68];}else{e2=[14+extension*.6,-66];hand2=[21+extension,-69];}k2=[12+Math.max(0,force)/2,-23];}
    }
    hip=[lean*.3,-43+bob];const shoulder=[lean,-72+bob],head=[lean+2,-86+bob];
    const joint=p=>[p[0]+lean*.4,p[1]+bob];e1=joint(e1);hand1=joint(hand1);e2=joint(e2);hand2=joint(hand2);
    const boot=(p,far)=>{poly(ink,[[p[0]-4,p[1]-6],[p[0]+3,p[1]-5],[p[0]+5,p[1]-1],[p[0]+9,p[1]],[p[0]+9,p[1]+4],[p[0]-5,p[1]+4]]);r(far?'#344253':'#526376',p[0]-3,p[1]-5,6,5);r('#91a6af',p[0]-3,p[1]+2,11,1);};
    limb([hip[0]-4,hip[1]],k1,foot1,10,'#273448','#43526a');boot(foot1,true);
    limb([shoulder[0]-(profile?4:8),shoulder[1]+4],e1,hand1,jane?7:10,jane?dark:shade,jane?cloth:skin);r('#192536',hand1[0]-3,hand1[1]-3,7,6);r('#668391',hand1[0]-2,hand1[1]-3,4,1);
    limb([hip[0]+4,hip[1]],k2,foot2,jane?10:12,'#405267','#748497');
    r('#263b4e',k2[0]-4,k2[1]-4,8,7);r('#9cabb0',k2[0]-3,k2[1]-4,6,1);boot(foot2,false);
    const sw=profile?(jane?7:9):(jane?9:12);
    poly(ink,[[shoulder[0]-sw-1,shoulder[1]],[shoulder[0]+sw,shoulder[1]-1],[shoulder[0]+sw+2,shoulder[1]+10],[hip[0]+9,hip[1]+5],[hip[0]-9,hip[1]+5],[shoulder[0]-sw,shoulder[1]+14]]);
    // Rounded rib cage, shaped waist and overlapping fabric clusters; light is upper-left.
    poly(cloth,[[shoulder[0]-sw+3,shoulder[1]],[shoulder[0]+sw-3,shoulder[1]],[shoulder[0]+sw,shoulder[1]+5],[shoulder[0]+sw-1,shoulder[1]+12],[hip[0]+6,hip[1]-3],[hip[0]+8,hip[1]+3],[hip[0]-7,hip[1]+3],[hip[0]-7,hip[1]-4],[shoulder[0]-sw,shoulder[1]+8]]);
    poly(dark,[[shoulder[0]+5,shoulder[1]+3],[shoulder[0]+sw,shoulder[1]+7],[hip[0]+6,hip[1]-3],[hip[0]+8,hip[1]+3],[hip[0]-1,hip[1]+3],[shoulder[0]+2,shoulder[1]+17]]);
    poly(shine,[[shoulder[0]-sw+3,shoulder[1]+3],[shoulder[0]-2,shoulder[1]+2],[shoulder[0]+2,shoulder[1]+6],[shoulder[0],shoulder[1]+9],[shoulder[0]-sw+3,shoulder[1]+8]]);
    r(dark,shoulder[0]-sw+3,shoulder[1]+10,10,2);r(cloth,shoulder[0]-sw+3,shoulder[1]+12,7,5);
    // Dark undershirt, raised lapels, a short shoulder seam and anchored waist folds.
    poly(ink,[[shoulder[0],shoulder[1]],[shoulder[0]+6,shoulder[1]],[shoulder[0]+4,shoulder[1]+12],[shoulder[0]+1,shoulder[1]+7]]);
    bone([shoulder[0]-1,shoulder[1]+1],[shoulder[0]+1,shoulder[1]+8],3,2,shine);
    r(shine,hip[0]-5,hip[1]-4,5,1);r(dark,hip[0]-4,hip[1]-7,6,2);
    if(jane){r('#dfd8bc',shoulder[0]-6,shoulder[1]+11,2,3);r('#dfd8bc',hip[0]+4,hip[1]-2,1,4);}else{r('#242b43',shoulder[0]-8,shoulder[1]+15,6,6);r('#687287',shoulder[0]-8,shoulder[1]+15,6,1);r('#c99361',shoulder[0]-6,shoulder[1]+17,2,2);}
    r('#17273b',hip[0]-9,hip[1],18,5);r('#c0af8c',hip[0]+1,hip[1]+1,5,3);r('#84766a',hip[0]-8,hip[1]+4,5,7);r('#b5a28a',hip[0]-8,hip[1]+4,5,1);
    r(shade,head[0]-2,head[1]+9,5,9);r(skin,head[0],head[1]+10,3,7);
    if(jane){const lag=[0,1,2,1,0,-1,-2,-1][f];poly(ink,[[head[0]-6,head[1]+2],[head[0]-12,head[1]+3],[head[0]-15-lean,head[1]+18+lag],[head[0]-11-lean,head[1]+25+lag],[head[0]-7-lean,head[1]+17],[head[0]-7,head[1]+7]]);bone([head[0]-10,head[1]+6],[head[0]-12-lean,head[1]+18+lag],3,2,'#634a7c');r('#e680b4',head[0]-10,head[1]+3,4,2);}
    poly(ink,[[head[0]-4,head[1]],[head[0]+4,head[1]],[head[0]+5,head[1]+3],[head[0]+5,head[1]+5],[head[0]+7,head[1]+6],[head[0]+5,head[1]+7],[head[0]+4,head[1]+11],[head[0]-1,head[1]+11],[head[0]-4,head[1]+7]]);
    poly(skin,[[head[0]-3,head[1]+2],[head[0]+3,head[1]+2],[head[0]+4,head[1]+5],[head[0]+6,head[1]+6],[head[0]+4,head[1]+7],[head[0]+3,head[1]+10],[head[0],head[1]+10],[head[0]-3,head[1]+7]]);
    r(light,head[0]+1,head[1]+2,3,3);r(light,head[0]+2,head[1]+7,2,2);r(shade,head[0]-3,head[1]+6,2,3);r('#623f4b',head[0]+3,head[1]+9,2,1);
    poly(jane?'#29233e':'#573c36',[[head[0]-4,head[1]+5],[head[0]-5,head[1]+1],[head[0]-2,head[1]-1],[head[0]+4,head[1]-1],[head[0]+5,head[1]+2],[head[0],head[1]+2],[head[0]-2,head[1]+5]]);r(jane?'#66517f':'#a96c4c',head[0]-2,head[1]-1,5,1);
    r(ink,head[0],head[1]+4,jane?5:6,jane?1:2);if(!jane)r('#647c85',head[0]+3,head[1]+4,2,1);else r('#b8deda',head[0]+3,head[1]+4,1,1);
    const nearShoulder=[shoulder[0]+(profile?1:sw-1),shoulder[1]+5];
    limb(nearShoulder,e2,hand2,jane?7:10,jane?cloth:skin,jane?shine:light);
    if(!jane){bone([nearShoulder[0]+1,nearShoulder[1]+3],[e2[0]+1,e2[1]-2],3,2,shade);r(light,nearShoulder[0]-2,nearShoulder[1]-1,4,3);}else{bone(nearShoulder,[nearShoulder[0]+1,nearShoulder[1]+7],8,7,dark);r(shine,nearShoulder[0]-2,nearShoulder[1],3,2);}
    const fist=profile?2:4;r(ink,hand2[0]-fist,hand2[1]-3,fist*2+1,7);r('#40586b',hand2[0]-fist+1,hand2[1]-2,fist*2-1,5);r(skin,hand2[0]-1,hand2[1]+2,3,2);r(jane?shine:'#6baaaa',hand2[0]-fist+1,hand2[1]-2,fist*2-1,1);
    if(attack&&f===2){const point=kick?foot2:state==='cross'?hand1:hand2;for(let i=0;i<3;i++)r(jane?'#e48fbd':'#8adbcf',point[0]-13-i*3,point[1]-4+i*3,9,1);}
    c.restore();
  }
  function sheet(name){const c=document.createElement('canvas');c.width=128*8;c.height=112*states.length;const ctx=c.getContext('2d');states.forEach((state,row)=>{for(let frame=0;frame<8;frame++)draw(ctx,name,frame*128+64,row*112+102,{state,frame});});return c;}
  window.CADDetailedCharacters={draw,states,timing,frameAt,sheet,palettes};
})();
