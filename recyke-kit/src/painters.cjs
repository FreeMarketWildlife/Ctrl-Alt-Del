/* Native raster primitives. No canvas scaling, interpolation, or image resampling. */
const palette={sky:'#101221',far:'#1a1c30',farEdge:'#28283e',night:'#202338',wall:'#292d40',wallDark:'#202637',wallFace:'#343548',plum:'#403346',seam:'#151c2a',ink:'#101620',steelDark:'#29364d',steel:'#42536a',steelLight:'#72838e',edge:'#91aaa9',cream:'#d4ccad',window:'#3d656e',windowLight:'#6b8d93',violet:'#6b4f72',pink:'#bf6695',pinkLight:'#f0a4b8',teal:'#589f9c',cyan:'#8fcac0',rustDark:'#50393e',rust:'#81554b',copper:'#b58061',amber:'#dbb578',danger:'#ce766f',health:'#8fc995',floor:'#25303c',pit:'#18222f',muted:'#596172'};
function pen(c){
 const r=(col,x,y,w=1,h=1)=>{if(w<=0||h<=0)return;c.fillStyle=palette[col]||col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
 const poly=(col,pts)=>{pts=pts.map(p=>p.map(Math.round));for(let y=Math.min(...pts.map(p=>p[1]));y<Math.max(...pts.map(p=>p[1]));y++){let a=[];for(let i=0;i<pts.length;i++){let p=pts[i],q=pts[(i+1)%pts.length],sy=y+.5;if((p[1]<=sy&&q[1]>sy)||(q[1]<=sy&&p[1]>sy))a.push(p[0]+(sy-p[1])*(q[0]-p[0])/(q[1]-p[1]));}a.sort((a,b)=>a-b);for(let i=0;i+1<a.length;i+=2){let x=Math.ceil(a[i]-.5);r(col,x,y,Math.ceil(a[i+1]-.5)-x,1);}}};
 return {r,poly};
}
function terrain(c,d,mask,v){const {r}=pen(c),{w,h,lip,band,seamY,grout,mark}=d;
 r('floor',0,0,w,h);r('steelDark',0,0,w,band);r('pit',0,seamY,w,2);
 // U=1,R=2,D=4,L=8: repeat-adjacency, not a scaled nine-slice.
 if(!(mask&1)){r('edge',0,0,w,lip);r('steel',0,lip,w,1);}else r('floor',0,0,w,band);
 if(!(mask&8))r('steel',0,0,grout,h);
 if(!(mask&2))r('seam',w-grout,0,grout,h);
 if(!(mask&4)){r('seam',0,h-3,w,3);r('steelDark',0,h-4,w,1);}
 r('wall',grout+2,band+4,w-2*grout-5,2);
 if(v===0){r('steel',mark[0],mark[1],mark[2],1);r('muted',mark[0],mark[1]+1,2,1);}
 if(v===1){r('rustDark',grout+5,band+7,6,2);r('wallFace',w-9,h-6,5,1);}
 if(v===2){r('seam',w-7,band+4,1,h-band-8);r('wall',w-6,band+4,1,h-band-8);}
}
function facade(c,d,v){const {r}=pen(c),{w,h,windows,course,panel,blind}=d;
 r(v===1?'plum':'wall',0,0,w,h);r('wallFace',0,0,w,2);r('wallDark',0,h-course,w,course);r('seam',0,h-course,w,1);
 // Outer columns have no outline: adjoining bays share material without black seams.
 r('wallFace',2,4,2,h-course-4);
 for(const [x,y,ww,hh] of windows){r('seam',x-2,y-2,ww+4,hh+5);r('window',x,y,ww,hh);r('windowLight',x+1,y,ww-2,2);r('wallDark',x+Math.floor(ww/2),y,1,hh);r('wallDark',x,y+Math.floor(hh*.55),ww,2);r('steel',x-3,y+hh+2,ww+6,2);
  if(v===2){for(let yy=y+3;yy<y+hh-2;yy+=blind)r('steelDark',x+1,yy,ww-2,2);}else if(v===1){r('violet',x+1,y+3,Math.max(3,Math.floor(ww*.3)),hh-5);} }
 const [x,y,ww,hh]=panel;r('wallDark',x,y,ww,hh);r('rustDark',x,y,ww,2);r('wallFace',x+2,y+4,ww-5,1);r('wall',x+3,y+6,ww-7,hh-9);
 for(const [xx,yy,ww] of d.patches){r(v===2?'rustDark':'plum',xx,yy,ww,2);r('wallFace',xx+2,yy+3,Math.max(2,ww-5),1);}
}
function shutter(c,d,v){const {r}=pen(c);r('wall',0,0,d.w,d.h);r('wallFace',0,0,d.w,2);r('seam',d.x-2,d.y-2,d.sw+4,d.sh+2);r('steelDark',d.x,d.y,d.sw,d.sh);
 for(let y=d.y+2;y<d.y+d.sh;y+=d.step){r(v===1?'rustDark':'steel',d.x+1,y,d.sw-2,2);r('seam',d.x+1,y+2,d.sw-2,1);}r('steelLight',d.x-2,d.y,1,d.sh);r('wallFace',0,d.h-5,d.w,5);
 for(let x=d.x+5;x<d.x+d.sw-5;x+=d.rivet)r('copper',x,d.y-4,2,2);
}
function roof(c,d,v){const {r,poly}=pen(c);r('seam',0,d.top,d.w,d.h-d.top);r('steel',0,d.top,d.w,2);r('edge',0,d.top,d.w,1);r('wallFace',0,d.top+3,d.w,3);r('wallDark',0,d.h-2,d.w,2);
 if(v===1){r('rustDark',d.w-18,1,11,d.top-1);r('steel',d.w-19,0,13,2);}if(v===2){poly('plum',[[5,d.top],[7,d.top-4],[16,d.top-4],[21,d.top],[5,d.top]]);r('steelDark',30,d.top-3,12,3);}}
function corner(c,d,v){const {r}=pen(c);r('wallDark',0,0,d.w,d.h);r('plum',0,0,d.edge,d.h);r('wallFace',d.edge,0,2,d.h);for(let y=8;y<d.h;y+=d.step){r('seam',0,y,d.w,1);r('wallFace',0,y+1,d.edge,1);}if(v)r('rustDark',d.w-3,d.h-d.stain,2,d.stain);}
function recess(c,d){const {r,poly}=pen(c);r('wallDark',0,0,d.w,d.h);poly('seam',[[0,0],[d.inset,d.slope],[d.inset,d.h],[0,d.h]]);poly('plum',[[d.w,0],[d.w-d.inset,d.slope],[d.w-d.inset,d.h],[d.w,d.h]]);r('pit',d.inset,d.slope,d.w-2*d.inset,d.h-d.slope);r('wallFace',0,0,d.w,2);r('steel',0,d.h-2,d.w,2);}
function door(c,d,frame){const {r}=pen(c),{w,h,x,y,opening,rail,bolts,handle,panels}=d;const [ow,oh]=opening;
 r('seam',x-rail,y-rail,ow+rail*2,oh+rail);r('steelDark',x-rail+1,y-rail+1,ow+rail*2-2,oh+rail-1);r('steelLight',x-rail,y-rail,ow+rail*2,1);r('pit',x,y,ow,oh);
 // Frames 0..2 sealed/latched/unlatched; frames 3..6 retract native panels.
 const retract=[0,0,0,Math.floor(ow*.2),Math.floor(ow*.5),Math.floor(ow*.78),ow][frame];
 if(retract<ow){let leaf=ow-retract;r('wall',x+retract,y,leaf,oh);r('wallFace',x+retract,y,leaf,2);r('steelDark',x+retract,y+oh-4,leaf,4);
 for(let j=0;j<panels;j++){let yy=y+8+j*d.panelStep;if(yy<y+oh-5){r('wallDark',x+retract+2,yy,Math.max(0,leaf-4),1);}}
 if(retract===0){r('seam',handle[0],handle[1],3,d.handleH);r('muted',handle[0]+1,handle[1]+1,1,d.handleH-2);}}
 bolts.forEach(([bx,by],i)=>{r('seam',bx,by,d.boltW+2,4);r(frame===0?'muted':frame===1?'amber':'teal',bx+1,by+1,d.boltW,2);if(frame>=2)r('steelDark',bx+1,by+1,Math.floor(d.boltW/2),2);});
 if(frame>=3){r('steel',x+1,y+oh-2,ow-2,1);r('teal',x+ow-2,y+4,1,oh-8);} // Interior rim, no invented emblem or password.
}
function pipe(c,d,v){const {r}=pen(c);const {w,h,bore,vertical}=d;const x=vertical?Math.floor((w-bore)/2):0,y=vertical?0:Math.floor((h-bore)/2);
 r('seam',x-(vertical?1:0),y-(vertical?0:1),vertical?bore+2:w,vertical?h:bore+2);r('steelDark',x,y,vertical?bore:w,vertical?h:bore);r(v===1?'rust':'steel',x,y,vertical?1:w,vertical?h:1);
 for(let n=6;n<(vertical?h:w)-3;n+=d.spacing){r('seam',x+(vertical?-1:n),y+(vertical?n:-1),vertical?bore+2:3,vertical?3:bore+2);r('steelLight',x+(vertical?0:n),y+(vertical?n:0),1,1);}}
function elbow(c,d,v){const {r}=pen(c),b=d.bore,x=d.x,y=d.y;r('seam',0,y-1,x+b+1,b+2);r('seam',x-1,y,d.w-x+1,d.h-y);r('steelDark',0,y,x+b,b);r('steelDark',x,y,b,d.h-y);r(v?'rust':'steel',0,y,x+b,1);r('steel',x,y,1,d.h-y);r('seam',3,y-1,3,b+2);r('steelLight',3,y,1,1);}
function vent(c,d,f){const {r}=pen(c);r('seam',0,0,d.w,d.h);r('steel',1,1,d.w-2,d.h-2);r('wallDark',3,3,d.w-6,d.h-6);const cx=d.cx,cy=d.cy;
 for(let yy=4;yy<d.h-4;yy+=d.slats)r('steelDark',4,yy,d.w-8,1);
 // Four discrete fan poses; no smooth rotation.
 const blades=[[[1,-1,d.rad,2],[-d.rad,0,d.rad,2],[-1,-d.rad,2,d.rad],[-1,1,2,d.rad]],[[1,-d.rad,2,d.rad],[-d.rad,1,d.rad,2],[-1,1,2,d.rad],[1,-1,d.rad,2]],[[2,-2,d.rad-1,2],[-d.rad,1,d.rad-1,2],[-2,-d.rad,2,d.rad-1],[1,2,2,d.rad-1]],[[1,1,d.rad,2],[-d.rad,-2,d.rad,2],[-2,1,2,d.rad],[1,-d.rad,2,d.rad]]];
 for(const [x,y,w,h] of blades[f%4])r('muted',cx+x,cy+y,w,h);r('steelLight',cx-1,cy-1,3,3);r('ink',2,2,1,1);r('ink',d.w-3,d.h-3,1,1);
}
function lamp(c,d,f){const {r}=pen(c);r('seam',d.stem,0,2,d.drop);r('steel',d.stem+1,0,1,d.drop);r('seam',0,d.drop,d.w,d.cap);r('steel',1,d.drop,d.w-2,2);r(f===3?'rustDark':'amber',3,d.drop+d.cap,d.w-6,2);r('cream',5,d.drop+d.cap,d.w-10,1);}
function scrap(c,d,v){const {r,poly}=pen(c);for(const [x,y,w,h,col] of d.parts[v]){r('seam',x,y,w,h);r(col,x+1,y+1,w-2,Math.max(1,h-2));r('steel',x+2,y+1,Math.max(1,w-5),1);}for(const [x,y] of d.bits)r('copper',x,y,2,1);}
function skyline(c,d,v){const {r}=pen(c);for(const [x,y,w,h] of d.towers){r(v?'night':'farEdge',x,y,w,h);r('farEdge',x,y,w,1);for(let yy=y+8;yy<y+h-5;yy+=d.rows)for(let xx=x+5;xx<x+w-4;xx+=d.cols)if((xx+yy)%3)r('wallFace',xx,yy,2,2);} }
function cable(c,d){const {r}=pen(c);for(let x=0;x<d.w;x++){let y=d.base+Math.round(Math.sin(x/(d.w-1)*Math.PI)*d.sag);r('seam',x,y);}for(const x of d.knots){let y=d.base+Math.round(Math.sin(x/(d.w-1)*Math.PI)*d.sag);r('steel',x,y,2,3);} }
function puddle(c,d,f){const {r,poly}=pen(c);poly('pit',d.outline);for(const [x,y,w,col] of d.lines){r(col,x+(f%3===1?1:0),y,w,1);} }
module.exports={palette,pen,terrain,facade,shutter,roof,corner,recess,door,pipe,elbow,vent,lamp,scrap,skyline,cable,puddle};
