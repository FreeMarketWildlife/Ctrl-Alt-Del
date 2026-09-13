/* Skyview exterior kit: 8px architectural modules, native world pixels.
   Original art inspired by SLYNYRD's Tiny Sci-Fi Pixels city study. */
(() => {
  const platforms=[{x:0,y:234,w:480,h:36},{x:102,y:190,w:76,h:7},{x:255,y:172,w:78,h:7},{x:372,y:205,w:63,h:7}];
  function draw(ctx,time=0,{decks=true}={}){
    const r=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
    const text=(s,x,y,c='#9ca9bd')=>{ctx.fillStyle=c;ctx.font='6px monospace';ctx.fillText(s,x,y);};
    r('#10172d',0,0,480,270);r('#252442',0,48,480,60);r('#39304e',0,108,480,74);
    // Stepped moon and sparse, stable sky pixels.
    r('#795274',330,27,28,32);r('#795274',326,31,36,24);r('#af7586',331,28,24,1);
    for(let i=0;i<40;i++)r(i%4?'#575574':'#a19ab0',(i*71+17)%480,(i*23+11)%98,1,1);
    // Distant skyline: lower contrast than the traversable plane.
    for(let i=0;i<15;i++){
      const x=i*34-8,y=72+(i*19)%56,w=24+(i%3)*8;
      r('#22263f',x,y,w,114);r('#343451',x,y,w,2);r('#22263f',x+8,y-8,8,8);
      for(let wy=y+8;wy<165;wy+=8)for(let wx=x+4;wx<x+w-3;wx+=8)r((wx+wy)%3?'#3e405b':'#675069',wx,wy,3,3);
      if(i%3===0){r('#414059',x+13,y-19,1,12);r(Math.floor(time*2)%2?'#ba6680':'#64425f',x+13,y-20,1,1);}
    }
    // Elevated transit line, train and pylons behind the near buildings.
    r('#111d31',0,118,480,12);r('#687086',0,118,480,1);r('#304159',0,127,480,2);
    for(let x=18;x<480;x+=64){r('#182338',x,130,5,77);r('#3d475d',x,130,1,77);}
    const train=Math.floor(time*27)%680-170;
    for(let i=0;i<3;i++){const x=train+i*49;r('#10182c',x,103,47,14);r('#516277',x+2,103,43,2);r('#29465a',x+3,106,40,7);for(let k=0;k<5;k++)r('#74b4b7',x+5+k*8,107,5,3);r('#9c6684',x+2,115,43,1);}
    const building=(x,y,w,h,variant)=>{
      r('#0a1222',x-2,y-3,w+4,h+3);r(variant?'#293348':'#323247',x,y,w,h);
      r('#586078',x,y,w,2);r('#161f32',x+w-7,y+2,7,h-2);
      // Reusable 8px facade panels with vertical ribs.
      for(let by=y+8;by<y+h;by+=8){r('#222b3e',x,by,w-7,1);for(let bx=x+8;bx<x+w-8;bx+=16)r('#3c4158',bx,by-6,1,6);}
      for(let bx=x+7;bx<x+w-13;bx+=16){r('#10192b',bx,y+9,10,17);r('#536078',bx,y+9,10,1);r(variant?'#466578':'#60546b',bx+1,y+11,7,12);r('#171e31',bx+1,y+17,7,2);r(variant?'#7fa0a5':'#a38191',bx+1,y+11,2,5);}
      // Rooftop ducts and cooling fins.
      r('#111a2b',x+8,y-12,24,10);r('#697085',x+9,y-12,22,2);r('#374457',x+10,y-9,20,6);
      for(let vx=x+12;vx<x+29;vx+=4)r('#111a2b',vx,y-8,2,4);
      r('#121c2d',x+w-20,y-18,7,16);r('#63657a',x+w-20,y-18,2,16);r('#87909c',x+w-22,y-19,11,2);
    };
    building(-8,143,96,91,0);building(109,117,80,117,1);building(226,100,112,134,0);building(371,144,120,90,1);
    // Garage shutters, inset doors, lintels, status terminals.
    const door=(x,y,w,h)=>{r('#0a1220',x-3,y-3,w+6,h+3);r('#576176',x-2,y-3,w+4,2);r('#222e40',x,y,w,h);for(let yy=y+3;yy<y+h;yy+=4)r('#435066',x,yy,w,1);r('#101929',x+w/2,y,1,h);};
    door(15,188,40,46);door(130,196,22,38);door(278,189,32,45);door(400,174,48,60);
    r('#102330',158,203,10,16);r('#72cbbf',160,205,6,5);r('#b38a5f',160,213,2,2);
    r('#152239',316,201,9,20);r('#a76387',318,204,5,8);
    // Industrial pipe runs and valves; a shared 8px rhythm.
    for(const [x,y,w] of [[4,179,80],[232,157,96],[379,163,88]]){r('#10192b',x,y,w,5);r('#687181',x,y+1,w,1);r('#3a475b',x,y+2,w,2);for(let px=x+5;px<x+w;px+=16)r('#87909a',px,y,2,5);}
    r('#192535',237,159,5,75);r('#72808a',238,160,1,74);r('#a97b57',234,199,10,8);r('#171e2b',237,201,4,4);
    // Restrained neon blocks stay behind the action plane.
    r('#081320',30,155,43,16);r('#3d666e',30,155,43,1);text('SKYVIEW',33,165,'#79c9c0');
    r('#0a1222',243,132,77,17);r('#784664',243,132,77,1);text('NEXUS // 07',247,142,Math.floor(time*5)%23===0?'#70435e':'#db81b4');
    r('#101a2a',449,154,16,40);text('R',455,165,'#d89e71');text('A',455,173,'#d89e71');text('I',455,181,'#d89e71');text('L',455,189,'#d89e71');
    // Thin power pulses and drifting steam on a stepped pixel grid.
    for(let i=0;i<3;i++){const x=112+i*80+Math.floor(time*18)%42;r('#496778',x,184-i*9,5,1);}
    for(const [sx,sy] of [[67,140],[169,114],[318,97]])for(let i=0;i<4;i++){
      const phase=(time*.55+i*.24)%1;ctx.globalAlpha=(1-phase)*.28;
      r('#91a4b3',sx+Math.round(Math.sin(phase*5+i)*3),sy-Math.floor(phase*24),4+Math.floor(phase*6),3);ctx.globalAlpha=1;
    }
    // Landing surfaces: bright edge, dark face, repeatable metal deck tiles.
    for(const p of decks?platforms:[]){
      r('#080f1c',p.x,p.y,p.w,p.h);r('#92a8b2',p.x,p.y,p.w,1);r('#4c6877',p.x,p.y+1,p.w,2);
      for(let x=p.x+2;x<p.x+p.w-2;x+=8){r('#28384b',x,p.y+4,5,2);r('#82919c',x,p.y+4,1,1);}
      if(p.y<230){r('#1b3043',p.x+3,p.y+7,p.w-6,3);r('#54b8b2',p.x+5,p.y+2,8,1);r('#cba273',p.x+p.w-12,p.y+2,8,1);for(const x of [p.x+8,p.x+p.w-12]){r('#172338',x,p.y+10,3,234-p.y-10);r('#35485b',x,p.y+10,1,234-p.y-10);}}
    }
    // Under-street utility trench and inset paneling.
    for(let x=0;x<480;x+=32){r('#19293b',x+1,244,30,24);r('#33475a',x+2,244,28,1);r('#0b1525',x+5,250,19,9);r('#4c6573',x+7,252,1,5);}
    r('#546778',0,240,480,1);r('#1e3648',0,263,480,3);
  }
  function mech(ctx,x,feet,{time=0,facing=-1,flash=false,charging=false}={}){
    ctx.save();ctx.translate(Math.round(x),Math.round(feet));ctx.scale(facing,1);
    const r=(c,x,y,w,h)=>{ctx.fillStyle=flash?'#f6dfc4':c;ctx.fillRect(x,y,w,h);};
    const phase=Math.floor(time*8)%8,step=[-3,-2,0,2,3,2,0,-2][phase],bob=phase%4===1?1:0;
    const leg=(rear)=>{const off=rear?-step:step,hip=rear?-7:3,lift=(rear?step:-step)>0?2:0;
      r('#0a1020',hip,-18,7,10);r(rear?'#344256':'#64768a',hip+1,-17,5,7);
      r('#0a1020',hip+off,-10-lift,7,9);r(rear?'#344256':'#526679',hip+off+1,-9-lift,5,7);
      r('#bf915e',hip+off+1,-10-lift,5,2);r('#0a1020',hip+off-2,-3-lift,12,3);r('#8194a2',hip+off-1,-2-lift,10,1);};
    leg(true);ctx.translate(0,bob);
    r('#0a1020',-15,-35,12,15);r('#3c4e64',-14,-34,10,12);r('#82929e',-13,-34,8,2);
    r('#182738',-13,-29,7,5);r('#e09462',-14,-31,2,7);
    r('#0a1020',-10,-39,23,24);r('#536579',-9,-38,21,19);r('#8d9caa',-8,-38,18,2);
    r('#293d53',-7,-34,16,11);r('#101a2b',-5,-33,14,8);r(charging?'#fff1af':'#f17483',-3,-31,10,3);
    r('#3e5368',-8,-23,18,5);r('#9aabb1',-7,-23,7,2);r('#bc905e',4,-21,4,2);
    r('#0a1020',10,-32,11,12);r('#718598',11,-31,9,9);r('#a3b3bd',12,-31,7,2);
    r('#0a1020',16,-28,14,7);r('#40566a',17,-27,12,5);r('#839caa',18,-27,10,1);r(charging?'#ffcb76':'#e57489',25,-25,5,2);
    r('#0a1020',-9,-18,20,4);r('#8b6d58',-6,-18,12,2);ctx.translate(0,-bob);leg(false);ctx.restore();
  }
  window.CADWorld={draw,platforms,mech};
})();
