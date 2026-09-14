/* Original native-pixel chase assets; shared by the game and animation archive. */
(() => {
  const rect=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  function car(c,x,y,t=0,bank=0,rear=false){
    c.save();c.translate(Math.round(x),Math.round(y));const r=(col,a,b,w,h)=>rect(c,col,a,b,w,h),b=Math.max(-2,Math.min(2,Math.round(bank)));
    if(rear){
      r('#080e23',-26,-7,52,19);r('#254660',-20,-15,40,24);r('#8faeba',-16,-18,32,4);r('#102334',-14,-14,28,10);r('#49bec9',-12,-13,24,2);r('#447e94',-24,-3,48,10);r('#94bac1',-25,-3,50,2);r('#fa678d',-22,2,9,3);r('#fa678d',13,2,9,3);r('#10192c',-9,2,18,7);
      for(const a of [-20,12]){r('#0e223a',a,8,8,4);r('#268ba9',a-1,12,10,5+Math.floor(t*15)%3);r('#6af9ed',a+1,12,6,7);r('#d8ffec',a+3,12,2,3);}c.restore();return;
    }
    r('#142c49',-36,4+b,20,6);r('#24577e',-33,5+b,16,4);r('#56eadb',-25-(Math.floor(t*18)%3)*3,6+b,12,2);
    r('#071122',-24,-5,47,15);r('#172c43',-16,-12+b,26,10);r('#abc6c8',-13,-13+b,21,2);r('#2f8296',-14,-10+b,23,7);r('#72c7cd',-10,-10+b,14,2);
    // Jessie: broad shoulders, dark hair and black shades visible through the canopy.
    r('#cc977d',-4,-9+b,5,5);r('#15192b',-5,-10+b,6,2);r('#040913',-3,-7+b,5,2);r('#3eb4b4',-7,-4+b,11,4);
    r('#476c82',-22,-3,42,9);r('#96b8bd',-19,-3,36,2);r('#284559',-19,4,36,6);r('#d0ded1',16,-1,8,3);r('#c3fff2',23,0,3,2);r('#f56392',-23,0,4,3);r('#102136',-17,8,12,4);r('#102136',10,8,10,4);r('#49c6c8',-16,9,9,2);r('#49c6c8',11,9,7,2);r('#102b41',0,1,7,1);r('#edc684',14,5,6,2);
    r('#12273d',-23,7+b,10,5);r('#8bfced',-25,8+b,4,3);c.restore();
  }
  function enemy(c,x,y,t=0,kind='drone',projection=1){
    // Perspective changes projected geometry, then rasterizes to the same
    // native scene grid. Never apply a fractional transform to sprite pixels.
    c.save();c.translate(Math.round(x),Math.round(y));const r=(col,a,b,w,h)=>rect(c,col,a*projection,b*projection,Math.max(1,Math.round(w*projection)),Math.max(1,Math.round(h*projection)));
    if(kind==='boss'){r('#091120',-30,-28,64,57);r('#334359',-26,-24,55,48);r('#789099',-26,-24,55,3);r('#182c40',-33,-17,23,34);r('#b3b2a2',-34,-15,20,4);r('#fbb979',-35,-7,8,14);r('#b65368',-26,-5,19,10);r('#f67385',-23,-3,12,6);for(const y of [-28,20]){r('#203449',-13,y,48,10);r('#80a4ac',-10,y,39,2);r('#63e6dd',30,y+4,12,3);}r('#132538',4,-15,20,28);for(let i=0;i<4;i++)r('#6e8893',7,-11+i*6,14,2);
    }else{const wing=kind==='interceptor'?20:12;r('#0a1527',-wing,-5,wing*2,11);r('#758490',-wing,-6,wing*2,3);r('#334c63',-12,-9,23,17);r('#aec0be',-8,-9,15,2);r('#fc7593',-13,-3,10,5);r('#ffd5ad',-14,-2,3,2);r('#132439',3,-5,8,10);r('#49e3d5',12,-1,6+Math.floor(t*12)%4,2);if(kind==='drone'){r('#172a40',-16,-12,2,8);r('#172a40',12,-12,2,8);r('#7299a6',-23+(Math.floor(t*20)%2)*3,-13,17,1);r('#7299a6',6,-13,17,1);}else{r('#36516a',-4,-15,18,6);r('#36516a',-4,9,18,6);r('#9b566f',-2,-15,13,2);}}
    c.restore();
  }
  function city(c,t=0){
    const r=(col,x,y,w,h)=>rect(c,col,x,y,w,h);r('#090f25',0,0,480,270);r('#171f3a',0,65,480,150);r('#30314a',0,148,480,90);
    r('#afbbc0',356,25,20,20);r('#d8d7c1',359,24,14,22);r('#28304a',354,26,15,16);
    for(let i=0;i<35;i++)r('#59627e',(i*97)%480,8+(i*17)%71,1,1);
    for(let layer=0;layer<3;layer++){
      const span=layer===0?54:86,speed=[7,19,42][layer],base=[195,228,258][layer];
      for(let i=-1;i<Math.ceil(480/span)+2;i++){
        const n=i+Math.floor(t*speed/span),x=i*span-(t*speed%span),h=55+((n*31%89)+89)%89,w=span-9;
        r(['#202942','#1b2b42','#122033'][layer],x,base-h,w,h);r(['#36415a','#334359','#35465b'][layer],x,base-h,w,2);
        if(layer>0){r('#0d1b2e',x+w-10,base-h+3,8,h-3);for(let wy=base-h+9;wy<base-8;wy+=12)for(let wx=5;wx<w-13;wx+=9)if((Math.floor(wy)+wx+n)%5)r(layer===1?'#536079':'#497782',x+wx,wy,3,4);}
        if(layer===2){r('#203249',x-4,base-43,w+9,4);r('#0c172a',x+5,base-h-10,13,10);r('#796378',x+9,base-h-12,2,4);if(n%2===0){r('#522f57',x+5,base-h+19,17,34);r('#d56a97',x+6,base-h+20,1,32);for(let k=0;k<4;k++)r('#ec91ba',x+10,base-h+24+k*7,8,2);}}
      }
    }
    r('#101b30',0,233,480,8);r('#467384',0,234,480,1);for(let i=0;i<12;i++)r('#9ca491',((i*49-t*90)%588+588)%588-40,237,19,1);
    r('#081324',0,261,480,9);r('#4ab5bf',0,262,480,1);
    for(let i=0;i<8;i++){const x=((i*81-t*140)%650+650)%650;r('#547481',x,250,27,1);}
  }
  function rear(c,t=0,steer=0){
    const r=(col,x,y,w,h)=>rect(c,col,x,y,w,h),vx=240+steer*22,hy=88;
    r('#0b132b',0,0,480,270);r('#222d48',0,65,480,65);r('#bcc3bf',344,24,19,19);
    for(let i=0;i<24;i++){const h=15+i*17%41;r('#25364e',i*22,105-h,16,h);}
    const poly=(col,points)=>{const pts=points.map(([x,y])=>[Math.round(x),Math.round(y)]),lo=Math.min(...pts.map(p=>p[1])),hi=Math.max(...pts.map(p=>p[1]));for(let y=lo;y<hi;y++){const hits=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],scan=y+.5;if((a[1]<=scan&&b[1]>scan)||(b[1]<=scan&&a[1]>scan))hits.push(a[0]+(scan-a[1])*(b[0]-a[0])/(b[1]-a[1]));}hits.sort((a,b)=>a-b);for(let i=0;i+1<hits.length;i+=2){const left=Math.ceil(hits[i]-.5),right=Math.ceil(hits[i+1]-.5);if(right>left)r(col,left,y,right-left,1);}}};
    poly('#192d40',[[vx-18,hy],[vx+18,hy],[510,270],[-30,270]]);
    const depths=Array.from({length:12},(_,i)=>({z:(i/12+t*.13)%1,i})).sort((a,b)=>a.z-b.z);
    for(const {z,i} of depths){const s=z*z,y=hy+s*210,w=15+s*270;
      r('#315263',vx-w,y,w*2,Math.max(1,s));for(const side of [-1,1])r('#b2b888',vx+side*w*.52,y,2+s*3,2+s*7);
      for(const side of [-1,1]){const x=vx+side*w,bw=8+s*115,bh=12+s*(210+(i%3)*45),top=y-bh;
        // Front facade plus an inward wall, painted from the horizon outwards.
        const outer=x+side*bw,inner=x-side*(3+s*15);
        poly(side<0?'#17293e':'#203348',[[x,y],[outer,y+15*s],[outer,top],[x,top+12*s]]);
        poly('#101f33',[[x,y],[inner,y-11*s],[inner,top+25*s],[x,top+12*s]]);
        poly('#496272',[[x,top+12*s],[outer,top],[outer,top+2*s+1],[x,top+14*s+1]]);
        for(let row=1;row<9;row++)for(let col=1;col<4;col++){
          const wx=x+side*bw*col/4,wy=top+bh*row/10;
          r((row+col+i)%4===0?'#977582':'#497181',wx,wy,Math.max(1,s*7),Math.max(1,s*6));
        }
        if(i%3===0){r('#663b62',inner,top+bh*.42,Math.max(2,s*12),bh*.26);for(let k=0;k<4;k++)r('#e68bb8',inner+1,top+bh*.44+k*bh*.05,Math.max(1,s*7),Math.max(1,s*2));}
      }
    }
    for(let i=0;i<3;i++){const z=(i/3+t*.09)%1;enemy(c,vx+Math.sin(i*3+t*.5)*z*120,hy+z*62,t,'interceptor',.25+z*.8);}
    r('#79eee0',vx-12,117,24,1);r('#79eee0',vx-12,134,24,1);r('#79eee0',vx-12,117,1,18);r('#79eee0',vx+11,117,1,18);r('#79eee0',vx-2,125,5,1);
    car(c,240+steer*70,211+Math.sin(t*3)*2,t,0,true);
    for(let i=0;i<2;i++){const p=(t*3+i*.5)%1;r('#b6ffdb',240+steer*70+(i?17:-17)*(1-p),198-p*69,2,7);}
  }
  window.CADFlightArt={car,enemy,city,rear};
})();
