const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {createCanvas}=require('@napi-rs/canvas');
const root=__dirname,box={window:{},document:{createElement:()=>createCanvas(1,1)}};
vm.createContext(box);
for(const name of ['jane','jessie']){
 vm.runInContext(fs.readFileSync(path.join(root,'baseline',name+'-motion.js'),'utf8'),box);
 const title=name[0].toUpperCase()+name.slice(1);box['CAD'+title+'Motion']=box.window['CAD'+title+'Motion'];
 vm.runInContext(fs.readFileSync(path.join(root,'baseline',name+'.js'),'utf8'),box);
 vm.runInContext(fs.readFileSync(path.join(root,name+'-proposal.js'),'utf8'),box);
}
const pair=name=>[box.window['CAD'+name],box.window['CAD'+name+'Proposal']];
const save=(cv,file)=>fs.writeFileSync(path.join(root,'assets',file),cv.toBuffer('image/png'));
const results=[];
for(const name of ['Jane','Jessie'])for(const [version,A] of ['current','proposed'].map((v,i)=>[v,pair(name)[i]])){
 for(const size of ['big','mini']){
 const spec=A.specs[size],sheet=createCanvas(spec.width*8,spec.height),sc=sheet.getContext('2d');
 for(let frame=0;frame<8;frame++){
  for(const facing of [1,-1]){
   // Wider inspection surface catches any pixels outside the promised cell.
   const pad=128,cv=createCanvas(spec.width+pad*2,spec.height+pad*2),c=cv.getContext('2d');
   A.draw(c,size,pad+spec.anchor[0],pad+spec.anchor[1],{state:'idle',frame,facing});
   const bytes=c.getImageData(0,0,cv.width,cv.height).data,colors=new Set();let minX=Infinity,minY=Infinity,maxX=-1,maxY=-1;
   for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++){
    const i=(y*cv.width+x)*4,alpha=bytes[i+3];assert(alpha===0||alpha===255,'opaque native pixels');
    if(alpha){minX=Math.min(minX,x-pad);maxX=Math.max(maxX,x-pad);minY=Math.min(minY,y-pad);maxY=Math.max(maxY,y-pad);colors.add('#'+[...bytes.slice(i,i+3)].map(n=>n.toString(16).padStart(2,'0')).join(''));}
   }
   assert(minX>=0&&minY>=0&&maxX<spec.width&&maxY<spec.height,`${name} ${version} ${size} bounds`);
   assert([...colors].every(color=>A.palette.includes(color)));assert(colors.size<=16);
   // Flood-fill checks the head, body and feet form a single connected native silhouette.
   const seen=new Set(),stack=[];for(let i=3;i<bytes.length;i+=4)if(bytes[i]){stack.push((i-3)/4);break;}
   while(stack.length){const p=stack.pop();if(seen.has(p))continue;seen.add(p);const x=p%cv.width,y=Math.floor(p/cv.width);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,q=yy*cv.width+xx;if(xx>=0&&xx<cv.width&&yy>=0&&yy<cv.height&&bytes[q*4+3]&&!seen.has(q))stack.push(q);}}
   const total=bytes.filter((_,i)=>i%4===3&&bytes[i]===255).length;assert.equal(seen.size,total,`${name} ${version} ${size} connected`);
   if(frame===0&&facing===1){const cell=createCanvas(spec.width,spec.height);cell.getContext('2d').drawImage(cv,-pad,-pad);save(cell,`${name.toLowerCase()}-${version}-${size}.png`);results.push({name,version,size,bounds:[minX,minY,maxX,maxY],colors:colors.size});}
  }
  A.draw(sc,size,frame*spec.width+spec.anchor[0],spec.anchor[1],{state:'idle',frame});
 }
 save(sheet,`${name.toLowerCase()}-${version}-${size}-idle.png`);
 }
 if(version==='proposed')assert.throws(()=>A.draw(createCanvas(128,128).getContext('2d'),'big',64,112,{state:'run'}),/idle/);
}
// One scene, one source-pixel grid: mini stays 32px tall next to 96px big.
const board=createCanvas(640,238),c=board.getContext('2d');
c.fillStyle='#202c36';c.fillRect(0,0,640,238);
c.fillStyle='#2a3944';c.fillRect(320,0,320,238);
c.font='bold 12px sans-serif';c.fillStyle='#f2eee4';c.fillText('JANE / JANEY',18,21);c.fillText('JESSIE',338,21);
c.font='10px sans-serif';
for(let n=0;n<2;n++){
 const name=['Jane','Jessie'][n];pair(name).forEach((A,i)=>{
  const x=n*320+i*152+12;c.fillStyle=i?'#c2e692':'#bec7ce';c.fillText(i?'PROPOSED / A':'CURRENT',x+10,42);
  c.fillStyle='#65717a';c.fillRect(x,161,140,1);
  A.draw(c,'big',x+64,161,{state:'idle',frame:0});A.draw(c,'mini',x+111,161,{state:'idle',frame:0});
  c.fillStyle='#94a5b1';c.font='9px sans-serif';c.fillText('BIG',x+53,180);c.fillText('MINI',x+101,180);
 });
}
c.font='10px sans-serif';c.fillStyle='#c2ccd2';c.fillText('Idle 0  /  Native heights 96px + 32px  /  Same grid for every figure',22,207);
c.fillStyle='#a8b8c2';c.fillText('Review proposal only. Playable masters and all motion modules remain unchanged.',22,225);
save(board,'comparison-native.png');const large=createCanvas(1280,476),lc=large.getContext('2d');lc.imageSmoothingEnabled=false;lc.drawImage(board,0,0,1280,476);save(large,'comparison.png');
// Snapshot manifests cover every pre-existing development and backup file.
const hashes=JSON.parse(fs.readFileSync(path.join(root,'source-baseline.json')));for(const [file,hash]of Object.entries(hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'..',file))).digest('hex'),hash,file+' changed');
for(const name of ['jane','jessie'])assert.equal(fs.readFileSync(path.join(root,'baseline',name+'-motion.js'),'utf8'),fs.readFileSync(path.join(root,'..','jane-development',name+'-motion.js'),'utf8'));
const metadata={status:'appearance proposal A; idle review only',nativePixelsPerWorldUnit:1,columns:8,rows:['idle'],frameCounts:{idle:8},timingMs:{idle:[160,160,160,160,160,160,160,160]},loops:{idle:true},source:'frozen copies of jane-development masters; hashes in source-baseline.json',characters:Object.fromEntries(['Jane','Jessie'].map(name=>[name,{sizes:pair(name)[1].specs,palette:pair(name)[1].palette}])),checks:{rasterCases:128,originalFilesUnchanged:Object.keys(hashes).length,opaque:true,withinCells:true,connected:true,maximumPalette:16,otherStatesUnavailable:true},frameZero:results};
fs.writeFileSync(path.join(root,'assets','review-metadata.json'),JSON.stringify(metadata,null,2)+'\n');console.log(JSON.stringify(metadata.checks));console.log(results);
