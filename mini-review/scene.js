/* Native mini comparison scene, shared by browser and artifact renderer. */
(() => {
 const actions=['walk','run','fire','jump'];
 function rootTravel(A,state,time){const timing=A.durations[state],total=timing.reduce((a,b)=>a+b,0)/1000,f=A.frameAt(state,time),cycle=Math.floor(time/total);return state.includes('walk')?cycle*24+f*2:cycle*32+[0,2,5,8,11,14,16,18,21,24,27,30][f];}
 function draw(c,{time=0,facing=1,light=false,silhouette=false,travel=true,crouch=false,hitboxes=false}={}){
  const bg=light?'#d8dedb':'#202c36',line=light?'#9aa6a1':'#5b737c',text=light?'#263942':'#d3ddd9';c.fillStyle=bg;c.fillRect(0,0,480,184);c.imageSmoothingEnabled=false;
  const actors=document.createElement('canvas');actors.width=480;actors.height=184;const a=actors.getContext('2d');
  (crouch?['crouch-idle','crouch-walk','crouch-fire','crouch-walk-fire']:actions).forEach((state,i)=>{
   const left=i*120;c.fillStyle=text;c.font='bold 10px sans-serif';c.fillText(state.replace('crouch-','').toUpperCase(),left+12,18);
   for(const [row,A]of [CADJane,CADJessie].entries()){
    const floor=84+row*76,f=A.frameAt(state,time),moving=state.includes('walk')||state==='run',offset=travel&&moving?rootTravel(A,state,time)%56:24;
    const x=left+30+(facing===1?offset:56-offset),lift=state==='jump'?[0,10,18,9,0,0][f]:0;
    c.fillStyle=line;c.fillRect(left+7,floor,106,1);for(let mark=left+8;mark<left+114;mark+=8)c.fillRect(mark,floor+2,1,2);
    A.draw(a,'mini',x,floor-lift,{state,time,facing});
    c.fillStyle=text;c.font='8px sans-serif';c.fillText((row?'JESSIE':'JANE')+'  '+(f+1)+'/'+A.durations[state].length,left+10,floor+15);
   }
   c.fillStyle=line;c.fillRect(left+119,8,1,170);
  });
  if(silhouette){a.globalCompositeOperation='source-in';a.fillStyle=light?'#192a36':'#e2e8de';a.fillRect(0,0,480,184);}
  c.drawImage(actors,0,0);
  if(hitboxes){c.fillStyle=light?'#8a4337':'#e5b973';const h=crouch?16:30;const list=crouch?['crouch-idle','crouch-walk','crouch-fire','crouch-walk-fire']:actions;list.forEach((state,i)=>{for(const[row,A]of [CADJane,CADJessie].entries()){const f=A.frameAt(state,time),moving=state.includes('walk')||state==='run',offset=travel&&moving?rootTravel(A,state,time)%56:24,x=Math.round(i*120+30+(facing===1?offset:56-offset)),floor=84+row*76-(state==='jump'?[0,10,18,9,0,0][f]:0);c.fillRect(x-5,floor-h,10,1);c.fillRect(x-5,floor-1,10,1);c.fillRect(x-5,floor-h,1,h);c.fillRect(x+4,floor-h,1,h);}});}

 }
 window.CADMiniScene={draw,rootTravel};
})();
