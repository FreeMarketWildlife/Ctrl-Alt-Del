const fs=require('node:fs'),vm=require('node:vm');
const {createCanvas}=require('@napi-rs/canvas');
const root=__dirname+'/jane-development',box={window:{},document:{createElement:()=>createCanvas(1,1)}};
vm.createContext(box);vm.runInContext(fs.readFileSync(root+'/jane-motion.js','utf8'),box);box.CADJaneMotion=box.window.CADJaneMotion;vm.runInContext(fs.readFileSync(root+'/jane.js','utf8'),box);const A=box.window.CADJane;
const cv=createCanvas(128*6,160*2),c=cv.getContext('2d');c.fillStyle='#34434b';c.fillRect(0,0,cv.width,cv.height);
const items=[['idle',0],['stand',0],['walk',3],['run',0],['run',3],['run',8],['crouch',1],['jab',2],['cross',3],['front-kick',3],['round-kick',3],['jump',2]];
items.forEach(([state,frame],i)=>{const x=(i%6)*128,y=Math.floor(i/6)*160;c.fillStyle='#a9babb';c.font='8px monospace';c.fillText(state+' '+frame,x+6,y+9);A.draw(c,'big',x+64,y+112,{state,frame});A.draw(c,'mini',x+64,y+154,{state,frame});c.fillStyle='#53656b';c.fillRect(x,y+112,128,1);c.fillRect(x,y+154,128,1);});
const large=createCanvas(cv.width*2,cv.height*2),g=large.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(cv,0,0,large.width,large.height);fs.writeFileSync('/private/tmp/jane-detail.png',large.toBuffer('image/png'));
