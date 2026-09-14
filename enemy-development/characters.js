/* Shared native-resolution pixel rigs. Coordinates are integer art pixels.
   Sheet rows: idle, run, jump, fire, punch, hurt; eight 40x40 frames per row. */
(() => {
  const states = ['idle', 'run', 'jump', 'fire', 'punch', 'hurt'];
  const palettes = {
    jessie: {accent:'#39f2df',light:'#b0fff1',coat:'#294552',shade:'#172936',skin:'#d69b78',skinLight:'#f4c09a',hair:'#503341',hairLight:'#93604e'},
    jane: {accent:'#ff39cb',light:'#ffb1e6',coat:'#653451',shade:'#34243c',skin:'#bb795d',skinLight:'#e7a180',hair:'#201d36',hairLight:'#5c477b'}
  };
  function draw(ctx, name, x, feet, {state='idle',time=0,facing=1,jumpPhase=null,firing=false}={}) {
    const p=palettes[name]||palettes.jessie, jane=name==='jane';
    const frame=state==='jump'&&jumpPhase!==null?Math.max(0,Math.min(7,Math.floor(jumpPhase*8))):Math.floor(time*(state==='run'?14:8))%8;
    const bob=state==='run'?[0,1,0,-1,0,1,0,-1][frame]:state==='jump'?[2,0,-1,-1,0,0,1,2][frame]:state==='idle'?(frame>=4?1:0):0;
    const lean=state==='run'?3:state==='jump'?[1,2,2,1,0,0,1,1][frame]:0;
    const recoil=state==='fire'&&frame<3?-2:0;
    const airborne=state==='jump', punching=state==='punch';
    ctx.save();ctx.translate(Math.round(x),Math.round(feet));ctx.scale(facing<0?-1:1,1);
    let upperBody=false;
    const r=(color,a,b,w,h)=>{ctx.fillStyle=color;
      if(upperBody&&state==='run'){for(let row=0;row<h;row++)ctx.fillRect(a+Math.max(0,Math.round((-b-row-18)*.13)),b+row,w,1);}
      else ctx.fillRect(a,b,w,h);};
    const line=(color,ax,ay,bx,by,width=2)=>{
      const steps=Math.max(Math.abs(bx-ax),Math.abs(by-ay));
      for(let i=0;i<=steps;i++)r(color,Math.round(ax+(bx-ax)*i/(steps||1)),Math.round(ay+(by-ay)*i/(steps||1)),width,width);
    };
    // Boots, articulated knees and asymmetric trouser highlights.
    const leg=(back)=>{
      const hip=state==='run'?0:back?-3:1;
      // Contact, compression, passing and flight: the rear foot lifts clear.
      const runKnees=[[5,-8],[3,-7],[-1,-8],[-4,-10],[-3,-12],[2,-12],[6,-11],[7,-9]];
      const runFeet=[[7,-2],[1,-2],[-5,-2],[-9,-5],[-8,-10],[-4,-13],[2,-10],[7,-6]];
      const jumpKnees=back?[[-4,-8],[-5,-9],[-6,-11],[-5,-12],[-4,-11],[-4,-9],[-3,-7],[-4,-7]]:[[3,-8],[5,-10],[6,-13],[6,-14],[5,-12],[4,-10],[3,-8],[4,-7]];
      const jumpFeet=back?[[-5,-2],[-7,-4],[-8,-7],[-7,-9],[-7,-8],[-6,-5],[-4,-2],[-4,-2]]:[[4,-2],[3,-6],[2,-9],[2,-11],[3,-9],[5,-5],[5,-2],[5,-2]];
      const phase=(frame+(back?4:0))%8;
      const [knee,ky]=state==='run'?runKnees[phase]:airborne?jumpKnees[frame]:[hip,-7];
      const [foot,fy]=state==='run'?runFeet[phase]:airborne?jumpFeet[frame]:[hip,-2];
      line('#090d1b',hip,-15+bob,knee,ky,jane?4:5);line('#090d1b',knee,ky,foot,fy,3);
      line(back?'#253044':'#3b4358',hip,-14+bob,knee,ky,jane?2:3);
      line(back?'#253044':'#3b4358',knee,ky,foot,fy,2);
      if(state==='run'&&phase>=3&&phase<=5){
        r('#121522',foot,fy-1,3,4);r('#87929b',foot+2,fy,1,3);
      }else{r('#121522',foot-1,fy,5,2);r('#87929b',foot,fy+1,4,1);}
      r(back?p.shade:p.accent,knee,ky,2,1);
    };
    leg(true);
    ctx.translate(recoil+lean,bob);upperBody=true;
    // Bent arms counter-swing against the legs; Jessie has exposed biceps.
    const armSwing=0;
    const arm=(back)=>{
      if(state==='run'){
        // Run-and-gun upper-body layer: brace the blaster while legs cycle.
        const sx=back?-3:3, ex=back?0:5, hx=back?10:8;
        line('#090d1b',sx,-24,ex,-20,jane?3:4);
        line(back?(jane?p.shade:'#96684f'):(jane?p.coat:p.skin),sx,-23,ex,-20,jane?2:3);
        line('#090d1b',ex,-20,hx,-22,3);line(back?'#96684f':p.skinLight,ex,-20,hx,-22,2);
        if(!back){
          r('#090d1b',8,-25,12,4);r('#647b8a',9,-25,9,1);
          r(p.accent,12,-24,8,1);r('#c4d3d8',18,-25,2,1);
          r('#090d1b',9,-22,3,4);r(p.skinLight,8,-22,2,2);
          if(firing){r(p.light,20,-25,2,3);r('#fff7d6',22,-24,1,1);}
        }
        return;

      }
      const shoulder=back?-5:4, swing=back?-armSwing:armSwing;
      const elbow=shoulder+(airborne?(back?-3:2):Math.round(swing/2));
      const ey=airborne?[-20,-22,-24,-24,-23,-21,-20,-20][frame]:-20;
      const hand=shoulder+(airborne?(back?-1:4):swing+1);
      const hy=state==='run'?-22:airborne?ey-3:-16;
      line('#0b1020',shoulder,-24,elbow,ey,jane?3:5);
      line(jane?p.coat:p.skin,shoulder,-23,elbow,ey,jane?2:3);
      if(!jane)r(p.skinLight,shoulder+1,-22,2,3);
      line('#0b1020',elbow,ey,hand,hy,jane?3:4);
      line(back?p.skin:p.skinLight,elbow,ey,hand,hy,2);
      r(p.shade,hand,hy,3,2);r(p.accent,hand,hy,1,1);
      if(!back){r('#111827',hand+1,hy+2,3,4);r(p.accent,hand+3,hy+2,1,3);}
    };
    arm(true);
    r('#0b1020',jane?-5:-6,-26,jane?10:13,13);r(p.shade,jane?-4:-5,-25,jane?8:11,12);
    r(p.coat,jane?-3:-4,-25,jane?7:9,9);r(p.coat,-4,-17,3,4+(frame%2));
    if(!jane){r('#466371',-3,-24,4,3);r('#466371',2,-24,3,3);r(p.shade,-1,-20,5,1);r(p.shade,5,-19,1,4);}
    r(p.accent,jane?-4:-5,-25,2,5);r(p.light,jane?-4:-5,-25,1,3);
    r('#a1a9a9',0,-25,1,9);r('#111624',-4,-15,9,2);r('#e8b369',0,-15,2,2);
    r('#182330',2,-20,2,3);r(p.accent,2,-20,2,1);

    // Neck, six-pixel head, nose and sculpted hair.
    r('#0b1020',-2,-33,7,8);r(p.skin,-1,-32,5,6);r(p.skinLight,2,-31,2,4);
    r(p.skin,4,-29,2,2);r(p.skin,-1,-26,3,2);
    r(p.hair,-3,-34,7,3);r(p.hair,-3,-32,3,jane?6:4);
    r(p.hairLight,-2,-34,4,1);r(p.hairLight,-3,-32,1,2);
    if(jane){r('#101426',3,-30,1,1);r(p.light,3,-29,1,1);}
    else {r('#060810',-1,-31,6,2);r('#060810',4,-30,2,1);r('#344351',2,-31,2,1);}
    if(jane){
      const sway=state==='run'?[2,3,3,2,1,2,3,3][frame]:airborne?[0,1,3,4,3,1,0,-1][frame]:[0,0,1,2,2,1,0,-1][frame];
      r(p.accent,-4,-31,2,2);line(p.hair,-5,-30,-7-sway,-24,3);
      line(p.hairLight,-5,-29,-7-sway,-25,1);
    } else {r(p.hair,0,-35,3,1);r('#93604e',0,-27,3,1);}
    // Forward hand / weapon and distinct attack silhouettes.
    if(punching){
      const reach=[3,7,11,12,10,6,3,1][frame];
      line('#0b1020',3,-24,5+reach,-24,4);line(p.coat,3,-24,4+reach,-24,2);
      r(p.skinLight,6+reach,-24,3,3);r(p.accent,5+reach,-24,1,3);
    } else if(state==='fire') {
      line('#0b1020',3,-24,7,-22,3);line(p.coat,3,-24,7,-23,2);
      r(p.skinLight,7,-23,3,2);r('#0a101d',9,-25,9,4);r('#647b8a',10,-25,7,1);
      r(p.accent,12,-24,6,1);r('#253044',10,-22,2,3);
      if(frame<2){r(p.light,18,-25,3,3);r('#fff7d6',21,-24,3,1);r(p.accent,19,-27,1,7);}
    } else {
      arm(false);
    }
    upperBody=false;ctx.translate(-recoil-lean,-bob);leg(false);
    if(state==='hurt'){r('#ff5269',-6,-27,1,8);r('#fff0df',6,-31,2,2);}
    ctx.restore();
  }
  function sheet(name){const c=document.createElement('canvas');c.width=320;c.height=240;const g=c.getContext('2d');states.forEach((state,row)=>{for(let frame=0;frame<8;frame++)draw(g,name,frame*40+14,row*40+37,{state,time:frame/(state==='run'?14:8)});});return c;}
  window.CADCharacters={draw,sheet,states,palettes};
})();
