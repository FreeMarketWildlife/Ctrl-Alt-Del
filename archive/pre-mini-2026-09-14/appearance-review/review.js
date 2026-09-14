(() => {
'use strict';
const $=id=>document.getElementById(id),canvas=$('comparison'),c=canvas.getContext('2d');
const buffer=document.createElement('canvas');buffer.width=640;buffer.height=230;const b=buffer.getContext('2d');
function render(){
 const light=$('background').value==='light',bg=light?'#d8dedb':'#202c36',text=light?'#21313e':'#e5ebe9',muted=light?'#47586a':'#adbec9',frame=Number($('frame').value),facing=Number($('facing').value);
 c.fillStyle=bg;c.fillRect(0,0,640,230);b.clearRect(0,0,640,230);
 for(const [n,pair]of [[CADJane,CADJaneProposal],[CADJessie,CADJessieProposal]].entries()){
  c.fillStyle=text;c.font='bold 12px sans-serif';c.fillText(n?'JESSIE':'JANE / JANEY',n*320+18,20);
  pair.forEach((A,i)=>{
   const x=n*320+i*152+12,feet=166;c.fillStyle=i?(light?'#426029':'#c3e797'):muted;c.font='10px sans-serif';c.fillText(i?'PROPOSED / A':'CURRENT',x+10,41);
   if($('guides').checked){
    c.fillStyle=light?'#c4cdc7':'#2c3c47';c.fillRect(x,feet-112,128,128);
    c.fillStyle=light?'#bec9c4':'#324752';c.fillRect(x+91,feet-40,48,48);
   }
   A.draw(b,'big',x+64,feet,{state:'idle',frame,facing});A.draw(b,'mini',x+111,feet,{state:'idle',frame,facing});
   c.fillStyle=light?'#93a09f':'#647680';c.fillRect(x,feet,140,1);
   c.fillStyle=muted;c.font='9px sans-serif';c.fillText('BIG',x+53,193);c.fillText('MINI',x+101,193);
  });
 }
 if($('silhouette').checked){b.globalCompositeOperation='source-in';b.fillStyle=light?'#192a36':'#e0e6dc';b.fillRect(0,0,640,230);b.globalCompositeOperation='source-over';}
 c.drawImage(buffer,0,0);
 if($('guides').checked){c.fillStyle=light?'#785822':'#e6c47e';for(let n=0;n<2;n++)for(let i=0;i<2;i++){const x=n*320+i*152+12;for(const anchor of [x+64,x+111]){c.fillRect(anchor-2,166,5,1);c.fillRect(anchor,164,1,5);}}}
 c.fillStyle=muted;c.font='10px sans-serif';c.fillText('IDLE '+frame+'  /  96px + 32px standing heights  /  One shared pixel grid',22,220);
 const z=$('zoom').value,stage=$('stage'),available=stage.clientWidth-32;
 const info=CADPixelGrid.applyScene(canvas,{availableWidth:available,maxScale:4,...(z==='fit'?{}:{scale:Number(z)})});
 $('frame-number').value=frame+' / 7';$('scale-note').textContent=`${info.scale} device pixel${info.scale===1?'':'s'} per native art pixel · Both sizes share the same zoom · Idle frame ${frame} of 7, 160ms per frame · Scroll the scene if needed.`;
}
for(const id of ['facing','zoom','background','guides','silhouette','frame'])$(id).addEventListener('input',render);
$('next').addEventListener('click',()=>{$('frame').value=(Number($('frame').value)+1)%8;render();});
window.addEventListener('resize',render);render();
})();
