const fs=require('node:fs'),vm=require('node:vm');
const {createCanvas}=require('@napi-rs/canvas');
function load(root){const box={window:{},document:{createElement:()=>createCanvas(1,1)}};vm.createContext(box);vm.runInContext(fs.readFileSync(root+'/jessie-motion.js','utf8'),box);box.CADJessieMotion=box.window.CADJessieMotion;vm.runInContext(fs.readFileSync(root+'/jessie.js','utf8'),box);return box.window.CADJessie;}
const sets=[load('/Users/tanoshi/Documents/GitHub/Ctrl-Alt-Del'),load(__dirname+'/jessie-refinement')];
const cv=createCanvas(512,288),c=cv.getContext('2d');c.fillStyle='#24343e';c.fillRect(0,0,512,288);
for(let row=0;row<2;row++){c.fillStyle=row?'#a6cfb8':'#b2bec3';c.font='bold 9px monospace';c.fillText(row?'AFTER / CONNECTED UPPER BODY':'BEFORE / PREVIOUS MASTER',12,row*144+14);[['idle',0],['walk',4],['crouch',1],['jab',2]].forEach(([state,frame],i)=>{sets[row].draw(c,'big',i*128+58,row*144+126,{state,frame});c.fillStyle='#475c66';c.fillRect(i*128+8,row*144+126,110,1);c.fillStyle='#95a7ab';c.font='8px monospace';c.fillText(state.toUpperCase(),i*128+12,row*144+139);});}
const big=createCanvas(1536,864),g=big.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(cv,0,0,1536,864);
fs.writeFileSync(__dirname+'/jessie-refinement/docs/review/jessie-before-after.png',big.toBuffer('image/png'));
