(() => {
  const side=document.getElementById('side').getContext('2d'),rear=document.getElementById('rear').getContext('2d'),steer=document.getElementById('steer');let time=0,last=performance.now(),paused=false;
  document.getElementById('pause').onclick=e=>{paused=!paused;e.target.textContent=paused?'Resume previews':'Pause previews';};
  function frame(now){if(!paused)time+=Math.max(0,Math.min(.05,(now-last)/1000));last=now;CADFlightArt.city(side,time);CADFlightArt.car(side,115,140+Math.sin(time*1.8)*22,time,Math.cos(time*1.8)*2);
    for(let i=0;i<3;i++){const x=480-((time*35+i*98)%340),y=74+i*54+Math.sin(time+i)*8;CADFlightArt.enemy(side,x,y,time,i%2?'interceptor':'drone');}
    side.fillStyle='#beffe2';for(let i=0;i<3;i++)side.fillRect(145+(time*270+i*100)%330,140+Math.sin(time*1.8)*22,10,2);
    CADFlightArt.rear(rear,time,Number(steer.value));document.querySelectorAll('[data-asset]').forEach(canvas=>{const c=canvas.getContext('2d');c.clearRect(0,0,128,80);if(canvas.dataset.asset==='car')CADFlightArt.car(c,67,40,time,Math.sin(time*2)*2);else CADFlightArt.enemy(c,64,40,time,canvas.dataset.asset);});requestAnimationFrame(frame);
  }requestAnimationFrame(frame);
})();
