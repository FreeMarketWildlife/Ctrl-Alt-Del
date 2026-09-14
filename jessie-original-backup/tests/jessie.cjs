/* Run with Playwright available via NODE_PATH; set CHROME_PATH if needed. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  try {
    const page = await browser.newPage({viewport:{width:1280,height:1000}});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.goto((process.env.BASE_URL || 'http://127.0.0.1:8026')+'/jessie.html');
    const result = await page.evaluate(() => {
      const A=CADJessie, failures=[], bounds={};
      if(A.columns!==12)failures.push('Sprite sheets must have 12 columns.');
      for(const state of ['walk','run','run-fire'])if(A.durations[state].length!==12)failures.push(`${state}: expected 12 motion poses`);
      const colors=new Set(A.palette.map(s=>s.toLowerCase()));
      const cv=document.createElement('canvas');cv.width=cv.height=512;const c=cv.getContext('2d',{willReadFrequently:true});
      const hash=p=>Array.from(p).join(',');
      for(const size of ['big','mini']) {
        const s=A.specs[size]; bounds[size]={};
        for(const state of A.states) {
          const poses=new Set();let ms=0;
          for(let f=0;f<A.durations[state].length;f++) {
            for(const facing of [1,-1]) {
              c.clearRect(0,0,512,512);A.draw(c,size,128+s.anchor[0],128+s.anchor[1],{state,frame:f,time:ms/1000,facing});
              const data=c.getImageData(0,0,512,512).data;let count=0,minX=512,maxX=0,minY=512,maxY=0;
              for(let i=0;i<data.length;i+=4) {if(!data[i+3])continue;count++;const x=(i/4)%512,y=Math.floor(i/4/512);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
                if(data[i+3]!==255) {failures.push(`${size}/${state}/${f}: translucent pixel`);break;}
                const color='#'+[...data.slice(i,i+3)].map(x=>x.toString(16).padStart(2,'0')).join('');if(!colors.has(color)){failures.push(`${size}/${state}/${f}: outside palette ${color}`);break;}
              }
              if(!count||minX<128||minY<128||maxX>=128+s.width||maxY>=128+s.height)failures.push(`${size}/${state}/${f}/${facing}: out of cell ${[minX-128,minY-128,maxX-128,maxY-128]}`);
              if(facing===1){poses.add(hash(c.getImageData(128,128,s.width,s.height).data));if((CADJessieMotion.contactFrames?.[state]||[]).includes(f)){if(maxY!==128+s.anchor[1]-1) failures.push(`${size}/${state}/${f}: supporting foot leaves baseline`);}}
              if(state==='idle'&&f===0&&facing===1)bounds[size]={height:maxY-minY+1,minX:minX-128,maxX:maxX-128};
            }
            if(A.frameAt(state,(ms+.001)/1000)!==f)failures.push(`${state}: timing mismatch ${f}`);
            ms+=A.durations[state][f];
          }
          if(['walk','run','jump','jab','hurt'].includes(state)&&poses.size<3)failures.push(`${size}/${state}: fewer than three distinct poses`);
          if(A.frameAt(state,ms/1000+.000001)!==0)failures.push(`${state}: loop boundary`);
        }
        for(let f=0;f<A.durations.run.length;f++) {c.clearRect(0,0,512,512);A.draw(c,size,s.anchor[0],s.anchor[1],{state:'run',frame:f});const a=hash(c.getImageData(0,s.anchor[1]-(size==='big'?44:12),s.width,size==='big'?44:12).data);c.clearRect(0,0,512,512);A.draw(c,size,s.anchor[0],s.anchor[1],{state:'run-fire',frame:f});const b=hash(c.getImageData(0,s.anchor[1]-(size==='big'?44:12),s.width,size==='big'?44:12).data);if(a!==b)failures.push(`${size}: shooting changes run legs`);}
        const sheet=A.sheet(size);if(sheet.width!==s.width*A.columns||sheet.height!==s.height*A.states.length)failures.push(`${size}: wrong sprite sheet dimensions`);
      }
      return {failures,bounds,specs:A.specs,palette:A.palette,columns:A.columns,rows:A.states,timingMs:A.durations,sheets:Object.fromEntries(['big','mini'].map(s=>[s,A.sheet(s).toDataURL()]))};
    });
    assert.deepEqual(errors,[]);assert.deepEqual(result.failures,[]);
    assert.equal(result.bounds.big.height,96);assert.equal(result.bounds.mini.height,32);
    if(process.env.UPDATE_ASSETS==='1') {
    const out=path.resolve(__dirname,'../assets/jessie');fs.mkdirSync(out,{recursive:true});
    for(const size of ['big','mini'])fs.writeFileSync(path.join(out,`jessie-${size}.png`),Buffer.from(result.sheets[size].split(',')[1],'base64'));
    fs.writeFileSync(path.join(out,'jessie-animation.json'),JSON.stringify({palette:result.palette,sizes:result.specs,columns:result.columns,rows:result.rows,timingMs:result.timingMs},null,2)+'\n');
    }
    await page.locator('#pause').click();await page.locator('[data-motion="run"]').click();await page.locator('#shoot').uncheck();
    for(let f=0;f<result.timingMs.run.length;f++){
      assert.match(await page.locator('#frame-info').textContent(),new RegExp(`RUN / ${f+1} OF ${result.timingMs.run.length}$`));await page.locator('#step').click();
    }
    assert.match(await page.locator('#frame-info').textContent(),/RUN \/ 1 OF 12$/);
    for(const size of ['big','mini'])assert.equal(await page.locator('#'+size+'-strip').evaluate(c=>c.width),result.specs[size].width*result.timingMs.run.length);
    const silhouettePixels=()=>page.locator('#comparison').evaluate(canvas=>{const data=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;let count=0;for(let i=0;i<data.length;i+=4)if(data[i]===233&&data[i+1]===225&&data[i+2]===198&&data[i+3]===255)count++;return count;});
    const before=await silhouettePixels();await page.locator('#silhouette').check();assert.ok(await silhouettePixels()>before+100);await page.locator('#silhouette').uncheck();
    await page.locator('.scene').screenshot({path:'/private/tmp/jessie-v2-comparison.png'});
    await page.locator('#big-strip').screenshot({path:'/private/tmp/jessie-v2-run-strip.png'});
    await page.locator('[data-motion="walk"]').click();await page.locator('#big-strip').screenshot({path:'/private/tmp/jessie-v2-walk-strip.png'});
    await page.locator('[data-motion="idle"]').click();await page.locator('.scene').screenshot({path:'/private/tmp/jessie-v2-ready.png'});
    await page.screenshot({path:'/private/tmp/jessie-v2-workshop.png',fullPage:true});
    for(const [width,height,dpr] of [[1280,900,1],[390,844,3],[844,390,3],[800,600,1.25]]) {
      const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr});const p=await context.newPage();await p.goto((process.env.BASE_URL || 'http://127.0.0.1:8026')+'/jessie.html');
      const v=await p.evaluate(()=>{const el=document.querySelector('#comparison'),b=el.getBoundingClientRect();return {sx:b.width*devicePixelRatio/el.width,sy:b.height*devicePixelRatio/el.height,overflow:document.documentElement.scrollWidth>innerWidth};});assert.ok(Math.abs(v.sx-v.sy)<.001);assert.ok(Math.abs(v.sx-Math.round(v.sx))<.001);assert.equal(v.overflow,false);await context.close();
    }
    console.log('PASS: all poses, both directions, cell bounds, palette, opaque pixels, planted feet, run/fire independence, timing, exports, desktop/mobile pixel grids.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1);});
