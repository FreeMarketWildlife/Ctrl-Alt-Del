/* Recyke / First Shift. Original native world artwork and gameplay presentation.
 * Two authored environmental families; never resize an actor or scenery sprite.
 * Every light, glyph, polygon and final actor anchor lands on the source grid.
 */
(() => {
  'use strict';
  const palette={
    sky:'#101221',far:'#1a1c30',farEdge:'#28283e',night:'#202338',
    wall:'#292d40',wallDark:'#202637',wallFace:'#343548',plum:'#403346',
    seam:'#151c2a',ink:'#101620',steelDark:'#29364d',steel:'#42536a',steelLight:'#72838e',
    edge:'#91aaa9',cream:'#d4ccad',window:'#3d656e',windowLight:'#6b8d93',
    violet:'#6b4f72',pink:'#bf6695',pinkLight:'#f0a4b8',teal:'#589f9c',cyan:'#8fcac0',
    rustDark:'#50393e',rust:'#81554b',copper:'#b58061',amber:'#dbb578',
    danger:'#ce766f',health:'#8fc995',floor:'#25303c',pit:'#18222f',muted:'#596172'
  };
  const P=palette;
  const glyphs={
    A:['01110','10001','10001','11111','10001','10001','10001'],B:['11110','10001','10001','11110','10001','10001','11110'],
    C:['01111','10000','10000','10000','10000','10000','01111'],D:['11110','10001','10001','10001','10001','10001','11110'],
    E:['11111','10000','10000','11110','10000','10000','11111'],F:['11111','10000','10000','11110','10000','10000','10000'],
    G:['01111','10000','10000','10111','10001','10001','01110'],H:['10001','10001','10001','11111','10001','10001','10001'],
    I:['111','010','010','010','010','010','111'],J:['00111','00010','00010','00010','10010','10010','01100'],
    K:['10001','10010','10100','11000','10100','10010','10001'],L:['10000','10000','10000','10000','10000','10000','11111'],
    M:['10001','11011','10101','10101','10001','10001','10001'],N:['10001','11001','10101','10011','10001','10001','10001'],
    O:['01110','10001','10001','10001','10001','10001','01110'],P:['11110','10001','10001','11110','10000','10000','10000'],
    Q:['01110','10001','10001','10001','10101','10010','01101'],R:['11110','10001','10001','11110','10100','10010','10001'],
    S:['01111','10000','10000','01110','00001','00001','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],
    U:['10001','10001','10001','10001','10001','10001','01110'],V:['10001','10001','10001','10001','10001','01010','00100'],
    W:['10001','10001','10001','10101','10101','11011','10001'],X:['10001','10001','01010','00100','01010','10001','10001'],
    Y:['10001','10001','01010','00100','00100','00100','00100'],Z:['11111','00001','00010','00100','01000','10000','11111'],
    '0':['01110','10001','10011','10101','11001','10001','01110'],'1':['010','110','010','010','010','010','111'],
    '2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11110','00001','00001','01110','00001','00001','11110'],
    '4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','10000','11110','00001','00001','11110'],
    '6':['01110','10000','10000','11110','10001','10001','01110'],'7':['11111','00001','00010','00100','01000','01000','01000'],
    '8':['01110','10001','10001','01110','10001','10001','01110'],'9':['01110','10001','10001','01111','00001','00001','01110'],
    '-':['000','000','000','111','000','000','000'],'/':['00001','00001','00010','00100','01000','10000','10000'],
    '+':['000','010','010','111','010','010','000'],':':['0','1','0','0','1','0','0'],'.':['0','0','0','0','0','1','0'],
    '>':['100','010','001','001','001','010','100'],'!':['1','1','1','1','0','1','0']
  };
  const r=(c,color,x,y,w=1,h=1)=>{w=Math.round(w);h=Math.round(h);if(w<=0||h<=0)return;c.fillStyle=P[color]||color;c.fillRect(Math.round(x),Math.round(y),w,h);};
  function poly(c,color,points) {
    const pts=points.map(([x,y])=>[Math.round(x),Math.round(y)]),lo=Math.min(...pts.map(p=>p[1])),hi=Math.max(...pts.map(p=>p[1]));
    for(let y=lo;y<hi;y++){
      const hits=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=y+.5&&b[1]>y+.5)||(b[1]<=y+.5&&a[1]>y+.5))hits.push(a[0]+(y+.5-a[1])*(b[0]-a[0])/(b[1]-a[1]));}
      hits.sort((a,b)=>a-b);for(let i=0;i+1<hits.length;i+=2){const x=Math.ceil(hits[i]-.5);r(c,color,x,y,Math.ceil(hits[i+1]-.5)-x,1);}
    }
  }
  function word(c,text,x,y,color='cream') {
    for(const char of String(text).toUpperCase()){
      const rows=glyphs[char];if(!rows){x+=char===' '?4:5;continue;}
      rows.forEach((row,j)=>[...row].forEach((bit,i)=>{if(bit==='1')r(c,color,x+i,y+j);}));x+=rows[0].length+1;
    }
    return x;
  }
  function pipe(c,x,y,w,h,vertical=false) {
    r(c,'seam',x-1,y-1,w+2,h+2);r(c,'steelDark',x,y,w,h);
    r(c,'steel',x,y,vertical?2:w,vertical?h:2);
    const length=vertical?h:w;
    for(let d=9;d<length-2;d+=28){r(c,'seam',x+(vertical?-1:d),y+(vertical?d:-1),vertical?w+2:3,vertical?3:h+2);r(c,'steelLight',x+(vertical?0:d),y+(vertical?d:0),vertical?2:1,vertical?1:2);}
  }
  function neonSign(c,text,x,y,color,vertical=false) {
    const width=vertical?15:text.length*6+10,height=vertical?text.length*10+8:19;
    r(c,'seam',x-2,y-2,width+4,height+4);r(c,'plum',x,y,width,height);r(c,color,x,y,width,1);r(c,'violet',x,y,1,height);
    if(vertical)[...text].forEach((letter,i)=>word(c,letter,x+5,y+5+i*10,color));else word(c,text,x+5,y+6,color);
  }
  function skyline(c,s) {
    const small=s.size==='mini',w=s.view.width,h=s.view.height,cam=Math.round(s.camera||0),t=s.time||0;
    r(c,'sky',0,0,w,h);r(c,'far',0,small?65:83,w,h);
    // Distant towers are deliberately drawn with fewer features; their pixels
    // remain the same size as the foreground throughout the parallax motion.
    const step=small?53:79,offset=Math.floor(cam*.16),baseline=small?169:239;
    for(let i=Math.floor(offset/step)-1;i<Math.ceil((offset+w)/step)+1;i++){
      const seed=((i*37)%7+7)%7,x=i*step-offset,height=(small?72:111)+seed*(small?8:11),bw=step-8;
      r(c,'farEdge',x,baseline-height,bw,height);r(c,'night',x+3,baseline-height+3,bw-6,height-3);
      r(c,'farEdge',x+8,baseline-height-8,8+seed*3,8);r(c,'night',x+bw-12,baseline-height-15,2,15);
      for(let yy=baseline-height+12;yy<baseline-5;yy+=small?13:19)for(let xx=x+8;xx<x+bw-8;xx+=small?11:16){if((xx+yy+i)%4)r(c,(xx+yy)%7===0?'violet':'wallFace',xx,yy,small?2:3,small?3:5);}
    }
    // Elevated public rail: the moving train sits behind the walkable district.
    const railY=small?76:101,trainY=small?49:57,carW=small?64:125,carH=small?24:39;
    const trainX=((Math.floor(t*(small?22:34))+Math.floor(w*.6)-Math.floor(cam*.38))%(w+carW*3)+w+carW*3)%(w+carW*3)-carW*2;
    for(let j=0;j<3;j++){
      const x=trainX+j*(carW+4);r(c,'seam',x,trainY,carW,carH);r(c,'wallFace',x+2,trainY+2,carW-4,carH-4);r(c,'rust',x+2,trainY+2,carW-4,3);r(c,'violet',x+2,trainY+5,carW-4,1);
      const winStep=small?16:25;
      for(let xx=x+6;xx<x+carW-9;xx+=winStep){r(c,'seam',xx,trainY+9,winStep-5,small?8:14);r(c,'window',xx+1,trainY+10,winStep-7,small?5:10);r(c,'windowLight',xx+2,trainY+10,small?3:5,2);}
      r(c,'teal',x+3,trainY+carH-5,carW-6,1);r(c,'steelDark',x+5,trainY+carH-1,8,3);r(c,'steelDark',x+carW-14,trainY+carH-1,8,3);
      if(!small)word(c,j===1?'PUBLIC / 07':'RCY',x+8,trainY+carH-13,'steelLight');
    }
    r(c,'seam',0,railY,w,7);r(c,'steel',0,railY,w,1);r(c,'wallFace',0,railY+3,w,1);
    for(let x=-Math.floor(cam*.38)%93;x<w;x+=93){r(c,'seam',x,railY+7,5,h-railY);r(c,'wallFace',x,railY+7,1,h-railY);}
  }
  function facades(c,s) {
    const small=s.size==='mini',ground=small?222:308,w=s.view.width,cam=Math.round(s.camera||0),stride=small?193:337;
    const first=Math.floor(cam/stride)-1,last=Math.ceil((cam+w)/stride)+1;
    for(let i=first;i<last;i++){
      const n=((i%5)+5)%5,x=i*stride-cam,y=small?103+n*7:125+n*9,bw=stride-22;
      r(c,'seam',x,y,bw,ground-y);r(c,n%2?'wall':'plum',x+3,y+3,bw-6,ground-y-3);r(c,'wallFace',x+3,y+3,bw-6,3);
      r(c,'wallDark',x+11,y+12,bw-24,ground-y-12);r(c,'plum',x+bw-11,y+11,6,ground-y-11);
      const spacing=small?28:48,winW=small?12:24,winH=small?17:30;
      for(let xx=x+18;xx<x+bw-25;xx+=spacing){
        r(c,'seam',xx,y+19,winW+3,winH+3);r(c,'window',xx+1,y+20,winW,winH);
        r(c,'windowLight',xx+2,y+20,winW-2,2);r(c,'wallDark',xx+Math.floor(winW/2),y+20,2,winH);
        r(c,'wallDark',xx+1,y+Math.floor(winH/2)+20,winW,2);r(c,'wallFace',xx-1,y+winH+23,winW+5,2);
      }
      pipe(c,x+bw-18,y+7,small?5:9,ground-y-7,true);
      if(i%2===0)pipe(c,x+10,y+(small?55:81),bw-40,small?5:8);
      const signX=x+bw-(small?44:61),signY=y+(small?25:38);
      if(n===0)neonSign(c,'FIX',signX,signY,'teal',true);
      else if(n===1)neonSign(c,'SORT',x+18,y+(small?53:92),'copper');
      else if(n===2)neonSign(c,'BED',signX,signY,'violet',true);
      else if(n===3)neonSign(c,'LINE 7',x+17,y+(small?60:96),'teal');
      else neonSign(c,'REC',signX,signY,'pink',true);
      // Hanging cables and lamps are one-pixel paths, not smooth canvas strokes.
      const wireY=y+5;
      for(let dx=0;dx<stride;dx++){const yy=wireY+Math.round(Math.sin(dx/stride*Math.PI)*(small?8:17));r(c,'seam',x+dx,yy);if(dx%(small?47:71)===20){r(c,'steelDark',x+dx,yy,2,6);r(c,'copper',x+dx-1,yy+6,4,2);}}
      if(n%2===0){r(c,'wall',x+28,ground-15,small?26:53,14);r(c,'rustDark',x+32,ground-18,small?13:25,5);r(c,'steelDark',x+39,ground-22,small?12:22,7);}
      // Broad stains, inset service panels and patched masonry add wear while
      // leaving the actor-height background quiet enough to read combat.
      for(let yy=y+(small?53:78);yy<ground-18;yy+=small?34:56){
        r(c,'wall',x+13,yy,bw-34,1);r(c,'plum',x+17,yy+1,small?12:23,2);
        r(c,'wallFace',x+bw-(small?37:66),yy+9,small?13:25,2);r(c,'wall',x+bw-(small?49:83),yy+15,small?10:22,2);
      }
      const panelX=x+bw-(small?86:129),panelY=ground-(small?59:97),panelW=small?23:48,panelH=small?25:46;
      if(n===1||n===3){
        r(c,'seam',panelX,panelY,panelW,panelH);r(c,'wall',panelX+2,panelY+2,panelW-4,panelH-4);r(c,'steelDark',panelX+2,panelY+2,2,panelH-4);
        for(let yy=panelY+5;yy<panelY+panelH-5;yy+=small?4:7)r(c,'seam',panelX+5,yy,panelW-10,1);
        r(c,'rustDark',panelX+panelW-5,panelY+panelH-8,3,small?14:27);r(c,'plum',panelX+panelW-4,panelY+panelH+5,2,small?10:15);
      }
      if(n===0||n===4){
        const bx=x+(small?95:184),by=ground-(small?53:98);
        r(c,'seam',bx,by,small?21:42,small?27:51);r(c,'rustDark',bx+1,by+1,small?19:40,small?25:49);
        r(c,'muted',bx+3,by+4,small?14:30,small?17:32);r(c,'plum',bx+5,by+6,small?10:25,small?3:6);
        r(c,'wallFace',bx+5,by+(small?12:20),small?7:19,1);r(c,'wallFace',bx+5,by+(small?15:25),small?11:25,1);
        r(c,'wallDark',bx+3,by+(small?19:34),small?5:10,small?4:10);r(c,'copper',bx+2,by+1,small?4:8,1);
      }
    }
  }
  function entrance(c,s,small) {
    const x=small?25:34,y=small?222:308;
    const door=small?{w:25,h:40,pad:3}:{w:65,h:112,pad:5};
    r(c,'seam',x-door.pad,y-door.h-door.pad,door.w+door.pad*2,door.h+door.pad);
    r(c,'steel',x-door.pad,y-door.h-door.pad,door.w+door.pad*2,3);r(c,'steelDark',x,y-door.h,door.w,door.h);
    r(c,'wall',x+2,y-door.h+2,door.w-4,door.h-2);r(c,'steel',x+Math.floor(door.w/2),y-door.h+2,1,door.h-2);
    r(c,'teal',x+3,y-door.h+5,door.w-6,2);r(c,'cream',x+door.w-7,y-Math.round(door.h*.4),2,5);
    neonSign(c,'RECYKE',x-4,y-door.h-(small?29:31),'pink');
    r(c,'seam',x+door.w+(small?8:12),y-(small?24:64),small?13:21,small?19:35);
    r(c,'steelDark',x+door.w+(small?9:14),y-(small?23:62),small?11:17,small?17:31);
    r(c,'teal',x+door.w+(small?11:16),y-(small?21:59),small?7:12,small?6:11);
  }
  function machinery(c,s,small) {
    const floor=small?222:308,world=s.config?.worldWidth||s.config?.width||(small?1920:3840);
    const sceneProps=small?[[160,'bins'],[442,'press'],[670,'boiler'],[922,'bins'],[1230,'press'],[1460,'boiler'],[1690,'bins']]:[[245,'bins'],[780,'press'],[1200,'boiler'],[1710,'bins'],[2350,'press'],[2790,'boiler'],[3280,'bins']];
    for(const [x,kind] of sceneProps){
      if(x<(s.camera||0)-200||x>(s.camera||0)+s.view.width+100)continue;
      if(kind==='bins'){
        if(small){r(c,'seam',x,floor-25,39,25);r(c,'rustDark',x+2,floor-23,35,22);r(c,'rust',x+1,floor-25,37,3);r(c,'wall',x+5,floor-19,29,15);r(c,'steel',x+5,floor-19,2,15);r(c,'muted',x+11,floor-15,4,2);r(c,'muted',x+17,floor-10,9,2);}
        else{r(c,'seam',x,floor-66,102,66);r(c,'rustDark',x+3,floor-63,96,60);r(c,'rust',x+1,floor-67,100,5);r(c,'wall',x+8,floor-57,84,47);r(c,'steel',x+9,floor-57,3,47);r(c,'plum',x+87,floor-56,4,47);word(c,'RECLAIM',x+24,floor-43,'muted');r(c,'rust',x+17,floor-25,11,3);r(c,'steelDark',x+37,floor-21,28,5);}
        const end=x+(small?39:102),bag=small?12:25;
        poly(c,'seam',[[end+2,floor],[end,floor-bag*.6],[end+5,floor-bag],[end+bag-5,floor-bag],[end+bag,floor-bag*.6],[end+bag-2,floor]]);
        poly(c,'wallFace',[[end+3,floor-1],[end+2,floor-bag*.6],[end+6,floor-bag+2],[end+bag-6,floor-bag+2],[end+bag-3,floor-2]]);
        r(c,'muted',end+5,floor-bag+3,2,small?4:9);r(c,'seam',end+bag/2-2,floor-bag-3,4,4);r(c,'rustDark',end+bag+4,floor-4,small?12:23,4);
      }else if(kind==='press'){
        const a=small?{w:63,h:78,col:5,beam:8,pressW:26,pressH:11}:{w:160,h:160,col:10,beam:13,pressW:64,pressH:20};
        r(c,'seam',x,floor-a.h,a.w,a.beam);r(c,'steelDark',x+2,floor-a.h+2,a.w-4,a.beam-3);r(c,'steel',x+2,floor-a.h+2,a.w-4,2);
        for(const xx of [x+4,x+a.w-a.col-4]){r(c,'seam',xx,floor-a.h,a.col,a.h);r(c,'steelDark',xx+1,floor-a.h+2,a.col-2,a.h-2);r(c,'steel',xx+1,floor-a.h+2,1,a.h-2);}
        const down=Math.round((Math.sin(s.time*.9+x)+1)*(small?5:10)),pressX=x+Math.round((a.w-a.pressW)/2),pressY=floor-a.h+a.beam+(small?14:29)+down;
        r(c,'steel',x+Math.round(a.w/2)-2,floor-a.h+a.beam,small?3:6,pressY-(floor-a.h+a.beam));
        r(c,'rustDark',pressX,pressY,a.pressW,a.pressH);r(c,'rust',pressX+1,pressY+1,a.pressW-2,2);r(c,'seam',pressX,pressY+a.pressH,a.pressW,3);
        for(let xx=pressX+3;xx<pressX+a.pressW-2;xx+=small?6:11)r(c,'copper',xx,pressY+4,small?3:5,small?3:7);
        word(c,'SORT',x+Math.round(a.w/2)-(small?11:12),floor-a.h-11,'muted');
      }else{
        const a=small?{w:36,h:58}:{w:83,h:135};
        poly(c,'seam',[[x,floor-6],[x,floor-a.h+8],[x+6,floor-a.h],[x+a.w-7,floor-a.h],[x+a.w,floor-a.h+8],[x+a.w,floor-6]]);
        r(c,'rustDark',x+2,floor-a.h+9,a.w-4,a.h-16);r(c,'plum',x+5,floor-a.h+9,Math.round(a.w/3),a.h-16);r(c,'rust',x+4,floor-a.h+9,2,a.h-18);
        pipe(c,x+a.w-(small?7:14),floor-a.h-(small?16:31),small?5:10,a.h+(small?10:23),true);
        r(c,'seam',x+8,floor-a.h+(small?18:39),a.w-20,small?12:28);r(c,'wallDark',x+9,floor-a.h+(small?19:40),a.w-22,small?10:26);
        for(let yy=floor-a.h+(small?21:44);yy<floor-a.h+(small?30:64);yy+=small?3:6)r(c,'rust',x+11,yy,a.w-26,1);
        // Discrete opaque steam clusters, kept behind the action silhouettes.
        for(let j=0;j<4;j++){
          const phase=(s.time*.2+j*.25)%1,yy=floor-a.h-(small?12:26)-phase*(small?25:56),xx=x+a.w-5+Math.round(Math.sin(phase*6+j)*(small?3:6)),puff=small?4:8;
          poly(c,'wallFace',[[xx-puff,yy],[xx-puff+2,yy-puff],[xx+2,yy-puff-2],[xx+puff,yy-puff+1],[xx+puff+2,yy+2],[xx+1,yy+puff],[xx-puff,yy+puff-2]]);
        }
      }
    }
    // An overhead carrier and dangling cable hint at the working recovery line.
    const craneX=world-(small?350:690),top=small?105:132,arm=small?97:200;
    r(c,'seam',craneX,top,small?7:12,floor-top);r(c,'steelDark',craneX+2,top+2,small?3:7,floor-top-2);
    r(c,'seam',craneX,top,arm,small?8:12);r(c,'steel',craneX+1,top+1,arm-2,2);
    const hookX=craneX+arm-10,hookY=top+(small?32:72)+Math.round(Math.sin(s.time*.6)*(small?3:7));
    r(c,'steelDark',hookX,top+4,2,hookY-top);r(c,'rust',hookX-6,hookY,14,3);r(c,'copper',hookX-7,hookY+3,3,7);r(c,'copper',hookX+6,hookY+3,3,7);
  }
  function surfaces(c,s) {
    const small=s.size==='mini',floor=small?222:308;
    for(const d of s.platforms||[]) {
      if(d.x+d.w<s.camera-4||d.x>s.camera+s.view.width+4)continue;
      const kind=d.kind||'platform';
      if(kind==='ground'){
        r(c,'pit',d.x,d.y,d.w,s.view.height-d.y);r(c,'edge',d.x,d.y,d.w,2);r(c,'steelDark',d.x,d.y+2,d.w,small?7:11);r(c,'seam',d.x,d.y+(small?9:13),d.w,2);
        const tile=small?24:48;
        for(let x=Math.floor(Math.max(d.x,s.camera)/tile)*tile;x<Math.min(d.x+d.w,s.camera+s.view.width)+tile;x+=tile){r(c,'floor',x+1,d.y+(small?12:17),tile-2,s.view.height-d.y-13);r(c,'steel',x+3,d.y+4,small?13:32,1);r(c,'muted',x+3,d.y+5,2,1);r(c,'wall',x+4,d.y+(small?17:27),tile-9,2);}
      }else if(kind==='crate'){
        r(c,'ink',d.x,d.y,d.w,d.h);r(c,'steel',d.x+1,d.y+1,d.w-2,d.h-2);r(c,'steelLight',d.x+1,d.y+1,d.w-2,small?1:2);
        r(c,'steelDark',d.x+3,d.y+4,d.w-6,d.h-7);r(c,'edge',d.x+3,d.y+4,small?1:2,d.h-7);r(c,'steel',d.x+d.w-6,d.y+4,2,d.h-7);
        poly(c,'steel',[[d.x+5,d.y+5],[d.x+8,d.y+5],[d.x+d.w-6,d.y+d.h-6],[d.x+d.w-9,d.y+d.h-6]]);
        r(c,'amber',d.x+d.w/2-2,d.y+d.h/2-1,4,2);
      }else{
        r(c,'ink',d.x-1,d.y,d.w+2,d.h);r(c,kind==='belt'?'copper':'edge',d.x,d.y,d.w,2);r(c,'steelDark',d.x,d.y+2,d.w,d.h-2);
        for(let x=d.x+3;x<d.x+d.w-4;x+=small?9:17){r(c,'steel',x,d.y+4,small?5:10,2);r(c,'seam',x+2,d.y+d.h-3,2,2);}
        if(kind==='belt')for(let x=d.x+Math.floor(s.time*15)%(small?9:17);x<d.x+d.w-2;x+=small?9:17)r(c,'amber',x,d.y+2,3,1);
        const legW=small?3:5;
        for(const x of [d.x+6,d.x+d.w-9]){r(c,'wallDark',x,d.y+d.h,legW,Math.max(0,floor-d.y-d.h));r(c,'steelDark',x,d.y+d.h,1,Math.max(0,floor-d.y-d.h));}
      }
    }
  }
  function stations(c,s) {
    const small=s.size==='mini',floor=small?222:308,cp=s.checkpoint;
    if(cp){
      const x=cp.x+(small?8:22),y=cp.y??floor,w=small?12:28,h=small?27:70,color=cp.active?'cyan':'amber';
      r(c,'ink',x-w/2-2,y-h-2,w+4,h+2);r(c,'steel',x-w/2,y-h,w,h);r(c,'steelLight',x-w/2,y-h,2,h);r(c,'steelDark',x-w/2+3,y-h+3,w-6,h-7);
      r(c,color,x-w/2+4,y-h+5,w-8,small?9:22);r(c,'seam',x-w/2+5,y-h+6,w-10,small?6:17);r(c,color,x-w/2+6,y-h+9,small?2:9,1);
      r(c,color,x-w/2+4,y-8,w-8,2);word(c,cp.active?'SAVED':'CHECKPOINT',x-(small?18:28),y-h-14,color);
    }
    const exit=s.exit;
    if(exit){
      const x=exit.x,y=exit.y??floor,w=small?45:115,h=small?46:125,color=exit.open?'cyan':'danger';
      r(c,'ink',x-4,y-h-4,w+8,h+4);r(c,'steel',x-3,y-h-3,w+6,3);r(c,'steelLight',x-3,y-h-3,w+6,1);r(c,'steelDark',x,y-h,w,h);
      r(c,'wallDark',x+4,y-h+4,w-8,h-4);r(c,color,x+4,y-h+4,w-8,2);
      if(!exit.open){for(let yy=y-h+11;yy<y-3;yy+=small?5:10){r(c,'steel',x+5,yy,w-10,2);r(c,'wall',x+5,yy+2,w-10,small?2:6);}r(c,color,x+w/2-3,y-h/2-4,6,8);}
      else{r(c,'pit',x+6,y-h+9,w-12,h-9);for(let yy=y-h+10;yy<y;yy+=small?8:16)r(c,'teal',x+7,yy,2,3);word(c,'>',x+w/2-2,y-h/2,'cyan');}
      neonSign(c,'LINE 7',x+(small?0:35),y-h-24,'teal');word(c,exit.open?'BOARD >':'LOCKED',x+(small?1:34),y-h+(small?8:14),color);
    }
  }
  function pickups(c,s) {
    const small=s.size==='mini';
    for(const d of s.pickups||[]){if(d.collected||d.dead)continue;const x=Math.round(d.x),y=Math.round(d.y)-Math.round(Math.sin(s.time*3+x)*2),n=small?8:14;
      r(c,'ink',x-n/2-1,y-n-1,n+2,n+2);r(c,d.kind==='health'?'health':'amber',x-n/2,y-n,n,n);r(c,'steelDark',x-n/2+1,y-n+1,n-2,n-2);
      if(d.kind==='health'){r(c,'cream',x-1,y-n+2,2,n-4);r(c,'cream',x-n/2+2,y-n/2-1,n-4,2);}
      else{poly(c,'amber',[[x-2,y-n+2],[x+2,y-n+2],[x+n/2-2,y-n/2],[x+2,y-2],[x-2,y-2],[x-n/2+2,y-n/2]]);r(c,'steelDark',x-1,y-n/2-1,2,2);}
    }
  }
  function frameFor(model,state,time,oneShot=false) {
    const timing=model.durations[state]||model.durations.idle;
    const total=timing.reduce((a,b)=>a+b,0)/1000;
    return model.frameAt(state,oneShot?Math.min(Math.max(0,time||0),total-.000001):(time||0));
  }
  function actors(c,s) {
    const small=s.size==='mini';
    for(const e of s.enemies||[]){
      if(e.x<s.camera-130||e.x>s.camera+s.view.width+130)continue;
      const M=CADEnemies.adapter(e.id),state=M.states.includes(e.state)?e.state:'idle',looped=['idle','run','walk','run-fire','patrol','rush'].includes(state);
      const frame=frameFor(M,state,e.stateTime,!looped);
      CADEnemies.draw(c,e.id,s.size,Math.round(e.x),Math.round(e.y),{state,frame,facing:e.facing||-1,time:e.stateTime||0});
      if(!e.dead&&e.hp<e.maxHp){const w=small?18:36,y=Math.round(e.y)-(small?36:101);r(c,'ink',e.x-w/2-1,y-1,w+2,4);r(c,'danger',e.x-w/2,y,Math.ceil(w*e.hp/e.maxHp),2);}
      if(!e.dead&&state==='charge'){const y=Math.round(e.y)-(small?43:110);word(c,'!',Math.round(e.x)-1,y,'amber');}
    }
    const p=s.player;if(!p)return;
    const M=p.hero==='jane'?CADJane:CADJessie,state=M.states.includes(p.state)?p.state:'idle';
    let frame;
    if(state==='jump'||state==='jump-fire')frame=p.vy<-(small?45:70)?1:Math.abs(p.vy)<(small?45:70)?2:3;
    else if(state==='crouch-walk'||state==='crouch-walk-fire')frame=frameFor(M,state,p.crouchTime??p.stateTime);
    else if(state==='run'||state==='run-fire')frame=frameFor(M,state,p.runTime??p.stateTime);
    else frame=frameFor(M,state,p.stateTime,['fire','crouch-fire','jab','hurt'].includes(state));
    M.draw(c,s.size,Math.round(p.x),Math.round(p.y),{state,frame,time:p.stateTime||0,facing:p.facing||1});
    if((p.invulnerable||p.inv||0)>0&&Math.floor(s.time*8)%2===0){const spread=small?8:20,top=p.y-(p.crouching?19:small?33:98);r(c,'cream',p.x-spread,top,3,1);r(c,'cream',p.x+spread-3,top,3,1);}
  }
  function shots(c,s) {
    const small=s.size==='mini';
    for(const b of s.shots||[]){if(b.dead)continue;const color=b.hostile?'danger':'cyan',w=b.w||(small?4:7),h=b.h||(small?2:3),x=Math.round(b.x-w/2),y=Math.round(b.y-h/2);
      r(c,'ink',x-1,y-1,w+2,h+2);r(c,color,x,y,w,h);r(c,'cream',x+(b.vx<0?0:w-2),y,2,1);
    }
    for(const q of s.particles||[]){if(q.life<=0)continue;r(c,q.color||'amber',q.x,q.y,small?1:2,small?1:2);}
    for(const q of s.effects||[]){if(q.life<=0)continue;const d=Math.round((1-q.life/q.maxLife)*(small?5:12)),color=q.kind==='hit'?'pinkLight':'amber';for(const [dx,dy] of [[-1,-1],[1,-1],[-1,1],[1,1]])r(c,color,q.x+dx*d,q.y+dy*d,small?1:2,small?1:2);r(c,'cream',q.x-1,q.y-1,2,2);}
  }
  function foreground(c,s) {
    const small=s.size==='mini',floor=small?222:308,w=s.view.width,cam=Math.round(s.camera||0),stride=small?157:253;
    // Small puddle reflections and drains stay below the collision edge.
    for(let i=Math.floor(cam/stride)-1;i<Math.ceil((cam+w)/stride)+1;i++){
      const x=i*stride-cam,y=floor+(small?19:27),length=small?36:62;
      r(c,'pit',x+9,y,length,small?7:10);r(c,'window',x+12,y+1,length-8,1);r(c,'violet',x+17,y+3,length-19,1);r(c,'teal',x+11+(Math.floor(s.time*2)%3),y+5,small?8:17,1);
      for(let j=0;j<5;j++){r(c,'seam',x+length+20+j*3,y-5,1,small?5:8);}
    }
  }
  function draw(c,s) {
    if(!s||!s.player)return;
    c.save();c.imageSmoothingEnabled=false;c.globalAlpha=1;c.globalCompositeOperation='source-over';
    const cam=Math.round(s.camera||0),small=s.size==='mini';
    skyline(c,s);facades(c,s);
    c.save();c.translate(-cam,0);
    entrance(c,s,small);machinery(c,s,small);stations(c,s);surfaces(c,s);pickups(c,s);actors(c,s);shots(c,s);
    c.restore();foreground(c,s);
    // A restrained route marker is drawn as native bitmap text above the action.
    const zone=(s.zones||[]).filter(z=>s.player.x>=z.x).at(-1);
    const label=zone?.name||'SORTING ROW';
    r(c,'ink',10,10,Math.min(s.view.width-20,label.length*6+27),19);r(c,'teal',10,10,2,19);word(c,label,18,16,'cream');
    c.restore();
  }
  window.CADRecykeArt={draw,palette,word};
})();
