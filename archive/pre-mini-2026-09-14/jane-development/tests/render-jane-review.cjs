/* Optional code-rendered review media. Requires @napi-rs/canvas and sharp.
 * All figures are drawn on one native scene, then the whole scene zooms 3×.
 * This is a review artifact; gameplay sheets retain their native dimensions.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createCanvas}=require('@napi-rs/canvas'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),box={window:{},document:{createElement:()=>createCanvas(1,1)}};
vm.createContext(box);
for(const hero of ['jane','jessie']){vm.runInContext(fs.readFileSync(path.join(root,hero+'-motion.js'),'utf8'),box);box[hero==='jane'?'CADJaneMotion':'CADJessieMotion']=box.window[hero==='jane'?'CADJaneMotion':'CADJessieMotion'];vm.runInContext(fs.readFileSync(path.join(root,hero+'.js'),'utf8'),box);}
const A=box.window.CADJane,J=box.window.CADJessie,cv=createCanvas(320,152),c=cv.getContext('2d'),zoom=createCanvas(960,456),g=zoom.getContext('2d');g.imageSmoothingEnabled=false;
function environment(){
 c.fillStyle='#202b36';c.fillRect(0,0,320,152);c.fillStyle='#293644';for(let x=0;x<320;x+=16)c.fillRect(x,24,1,104);for(let y=32;y<128;y+=16)c.fillRect(0,y,320,1);
 c.fillStyle='#61717d';c.fillRect(0,128,320,1);c.fillStyle='#18232f';c.fillRect(0,129,320,23);
 c.fillStyle='#b5a8ba';c.font='9px monospace';c.fillText('JANE / BIG + MINI',12,14);c.fillStyle='#76998f';c.fillText('JESSIE / SAME GRID',172,14);
}
function paint(state,frame,time){environment();A.draw(c,'big',67,128,{state,frame,time});A.draw(c,'mini',132,128,{state,frame,time});const s=J.states.includes(state)?state:'idle';J.draw(c,'big',227,128,{state:s,time});J.draw(c,'mini',292,128,{state:s,time});c.fillStyle='#c6afbd';c.font='8px monospace';c.fillText(state.toUpperCase()+' / '+String(frame+1).padStart(2,'0'),12,143);g.drawImage(cv,0,0,960,456);}
(async()=>{
 const frames=[];for(let f=0;f<12;f++){paint('run',f,f*.05);frames.push(Buffer.from(g.getImageData(0,0,960,456).data));}
 const out=path.join(root,'docs/review');fs.mkdirSync(out,{recursive:true});
 await sharp(Buffer.concat(frames),{raw:{width:960,height:456*12,channels:4,pageHeight:456}}).gif({loop:0,delay:Array(12).fill(50),dither:0,colours:64}).toFile(path.join(out,'jane-run-comparison.gif'));
 const sheet=createCanvas(512,304),sc=sheet.getContext('2d');sc.fillStyle='#202b36';sc.fillRect(0,0,512,304);
 const poses=[['stand',0],['run',0],['run-fire',3],['crouch',1],['jab',2],['cross',3],['front-kick',3],['round-kick',3]];
 poses.forEach(([state,frame],i)=>{const x=i%4*128,y=Math.floor(i/4)*152;sc.fillStyle='#c6afbd';sc.font='8px monospace';sc.fillText(state.toUpperCase(),x+8,y+13);A.draw(sc,'big',x+64,y+112,{state,frame});A.draw(sc,'mini',x+64,y+148,{state,frame});sc.fillStyle='#52636e';sc.fillRect(x+8,y+112,112,1);sc.fillRect(x+8,y+148,112,1);});
 const poster=createCanvas(1536,912),pc=poster.getContext('2d');pc.imageSmoothingEnabled=false;pc.drawImage(sheet,0,0,1536,912);fs.writeFileSync(path.join(out,'jane-pose-review.png'),poster.toBuffer('image/png'));
 const info=await sharp(path.join(out,'jane-run-comparison.gif'),{animated:true}).metadata();if(info.pages!==12||info.pageHeight!==456||info.delay.some(ms=>ms!==50))throw new Error('Incorrect review animation export');
 console.log('Review media exported: 12-frame600ms run GIF, whole-scene3×, plus8-pose big/mini contact sheet.');
})().catch(error=>{console.error(error);process.exitCode=1;});
