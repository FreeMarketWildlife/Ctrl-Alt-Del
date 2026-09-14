/* Native-raster, workshop, export, and Jessie regression checks.
 * Run with Playwright via NODE_PATH; CHROME_PATH may select local Chrome.
 * BASE_URL defaults to the Jane development preview. UPDATE_ASSETS=1 writes
 * the validated sprite sheets and complete timing/hair metadata.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { chromium } = require('playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:8032';
const project = path.resolve(__dirname, '..');
const review = process.env.REVIEW_DIR || '/private/tmp/jane-review';
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');

(async () => {
  const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'jane-jessie-baseline.json'), 'utf8'));
  for (const [file, expected] of Object.entries(baseline.files)) {
    assert.equal(sha256(fs.readFileSync(path.join(project, file))), expected, `${file}: Jessie must remain unchanged`);
  }
  fs.mkdirSync(review, { recursive: true });
  const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1000}});
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/jane.html');
    await page.waitForFunction(() => typeof CADJane !== 'undefined' && typeof CADJaneMotion !== 'undefined');

    const result = await page.evaluate(() => {
      const A = CADJane, M = CADJaneMotion, failures = [], bounds = {}, poseCounts = {};
      const expectedStates = ['stand','idle','walk','run','fire','run-fire','jump','jump-fire','crouch','jab','cross','front-kick','round-kick','hurt'];
      const check = (condition, message) => {if (!condition) failures.push(message);};
      check(A.columns === 12, 'sprite sheets require 12 columns');
      check(A.states.length === 14 && expectedStates.every(s => A.states.includes(s)), 'all 14 animation states must be present');
      check(A.palette.length === 16 && new Set(A.palette).size === 16, 'exactly 16 unique palette colors');
      const colors = new Set(A.palette.map(value => parseInt(value.slice(1), 16)));
      const cv = document.createElement('canvas'), margin = 48;
      const hash = data => {let h=2166136261;for(let i=0;i<data.length;i++)h=Math.imul(h^data[i],16777619);return h>>>0;};
      const componentSize = (data,width,height,start) => {
        if(start<0)return 0;
        const seen=new Uint8Array(width*height), queue=new Int32Array(width*height);let head=0,tail=1;queue[0]=start;seen[start]=1;
        while(head<tail){const pixel=queue[head++],x=pixel%width,y=Math.floor(pixel/width);
          for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
            const nx=x+dx,ny=y+dy;if(nx<0||nx>=width||ny<0||ny>=height)continue;
            const next=ny*width+nx;if(!seen[next]&&data[next*4+3]){seen[next]=1;queue[tail++]=next;}
          }
        }
        return tail;
      };
      let rasters=0;
      for(const size of ['big','mini']) {
        const s=A.specs[size], expected=size==='big'?{width:128,height:128,anchor:[64,112],heightPx:96}:{width:48,height:48,anchor:[20,40],heightPx:32};
        check(s.width===expected.width&&s.height===expected.height&&s.heightPx===expected.heightPx&&JSON.stringify(s.anchor)===JSON.stringify(expected.anchor), `${size}: locked cell, feet anchor, and standing height`);
        cv.width=s.width+margin*2;cv.height=s.height+margin*2;
        const c=cv.getContext('2d',{willReadFrequently:true});
        const draw=(state,frame,facing=1,time=0)=>{c.clearRect(0,0,cv.width,cv.height);A.draw(c,size,margin+s.anchor[0],margin+s.anchor[1],{state,frame,facing,time});return c.getImageData(0,0,cv.width,cv.height).data;};
        bounds[size]={};poseCounts[size]={};
        for(const state of A.states) {
          const timing=A.durations[state], poses=new Set();let ms=0;
          check(Array.isArray(timing)&&timing.length>0&&timing.length<=A.columns&&timing.every(t=>Number.isFinite(t)&&t>0),`${state}: valid positive frame timings`);
          if(['walk','run','run-fire'].includes(state))check(timing.length===12,`${state}: 12 locomotion poses`);
          for(let frame=0;frame<timing.length;frame++) {
            for(const facing of [1,-1]) {
              const data=draw(state,frame,facing,ms/1000);rasters++;
              let count=0,minX=cv.width,maxX=-1,minY=cv.height,maxY=-1,first=-1,badAlpha=false,badColor=false;
              for(let i=0;i<data.length;i+=4){if(!data[i+3])continue;const pixel=i/4,x=pixel%cv.width,y=Math.floor(pixel/cv.width);
                if(first<0)first=pixel;count++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
                if(data[i+3]!==255)badAlpha=true;
                if(!colors.has((data[i]<<16)|(data[i+1]<<8)|data[i+2]))badColor=true;
              }
              const label=`${size}/${state}/${frame}/${facing}`;
              check(count>0,`${label}: empty sprite`);
              check(!badAlpha,`${label}: antialiased or translucent pixel`);
              check(!badColor,`${label}: color outside 16-color palette`);
              check(minX>=margin&&minY>=margin&&maxX<margin+s.width&&maxY<margin+s.height,`${label}: outside cell ${[minX-margin,minY-margin,maxX-margin,maxY-margin]}`);
              check(componentSize(data,cv.width,cv.height,first)>count*.5,`${label}: crown/hair disconnected from main body`);
              if(['stand','idle'].includes(state))check(maxY-minY+1<=s.heightPx&&maxY-minY+1>=s.heightPx-(size==='big'?1:0),`${label}: breathing changed standing height by more than one native pixel`);
              if(facing===1){
                poses.add(hash(data));
                if((M.contactFrames?.[state]||[]).includes(frame))check(maxY===margin+s.anchor[1]-1,`${label}: support foot left baseline`);
                if(['stand','idle'].includes(state)&&frame===0)bounds[size][state]={height:maxY-minY+1,minX:minX-margin,maxX:maxX-margin,top:minY-margin,bottom:maxY-margin};
              }
            }
            check(A.frameAt(state,(ms+.001)/1000)===frame,`${state}: timestamp at start of frame ${frame}`);
            check(A.frameAt(state,(ms+timing[frame]/2)/1000)===frame,`${state}: timestamp inside frame ${frame}`);
            ms+=timing[frame];
          }
          poseCounts[size][state]=poses.size;
          if(['walk','run','jump','jab','cross','front-kick','round-kick','hurt'].includes(state))check(poses.size>=3,`${size}/${state}: insufficient distinct poses`);
          check(A.frameAt(state,ms/1000+.000001)===0,`${state}: preview loop boundary`);
          check(A.frameAt(state,-.000001)===timing.length-1,`${state}: reverse preview loop`);
        }
        for(const [moving,firing] of [['run','run-fire'],['jump','jump-fire']]) {
          check(JSON.stringify(A.durations[moving])===JSON.stringify(A.durations[firing]),`${moving}: firing changed timing`);
          let ms=0;
          for(let frame=0;frame<A.durations[moving].length;frame++) {
            const a=M.sample(size,moving,frame),b=M.sample(size,firing,frame);
            check(JSON.stringify(a.hair)===JSON.stringify(b.hair),`${size}/${moving}/${frame}: firing changed hair`);
            const depth=size==='big'?38:10,y=margin+s.anchor[1]-depth;
            draw(moving,frame,1,ms/1000);const legsA=hash(c.getImageData(margin,y,s.width,depth).data);
            draw(firing,frame,1,ms/1000);const legsB=hash(c.getImageData(margin,y,s.width,depth).data);
            check(legsA===legsB,`${size}/${moving}/${frame}: firing changes lower-leg pixels`);
            ms+=A.durations[moving][frame];
          }
        }
        const hairPoses=Array.from({length:A.durations.run.length},(_,f)=>M.sample(size,'run',f));
        const hairShapes=new Set(hairPoses.map(p=>JSON.stringify(p.hair.map(([x,y])=>[x-p.hair[0][0],y-p.hair[0][1]]))));
        check(hairShapes.size>=6,`${size}: ponytail needs at least six run wave shapes independent of body bob`);
        const sheet=A.sheet(size);
        check(sheet.width===s.width*A.columns&&sheet.height===s.height*A.states.length,`${size}: native sheet dimensions`);
        const sheetData=sheet.getContext('2d',{willReadFrequently:true});
        for(let row=0;row<A.states.length;row++){
          const state=A.states[row],timing=A.durations[state];
          for(let col=0;col<A.columns;col++){
            const frame=Math.min(col,timing.length-1),time=timing.slice(0,frame).reduce((a,b)=>a+b,0)/1000;
            draw(state,frame,1,time);
            check(hash(sheetData.getImageData(col*s.width,row*s.height,s.width,s.height).data)===hash(c.getImageData(margin,margin,s.width,s.height).data),`${size}/${state}/${col}: export cell differs from native draw`);
          }
        }
      }
      const metadata=A.metadata();
      for(const state of A.states){
        check(metadata.frameCounts[state]===A.durations[state].length,`${state}: export frame count`);
        check(metadata.phases[state].length===A.durations[state].length,`${state}: per-frame phase metadata`);
        check(typeof metadata.loops[state]==='boolean',`${state}: gameplay looping metadata`);
        for(const size of ['big','mini'])check(JSON.stringify(metadata.hair[size].poses[state])===JSON.stringify(A.durations[state].map((_,f)=>M.sample(size,state,f).hair)),`${size}/${state}: exported ponytail attachment points`);
      }
      return {failures,rasters,bounds,poseCounts,...metadata,metadata,
        sheets:Object.fromEntries(['big','mini'].map(size=>[size,A.sheet(size).toDataURL()]))};
    });
    assert.deepEqual(errors, [], 'workshop JavaScript errors');
    if(result.failures.length)console.error(JSON.stringify({failures:result.failures,bounds:result.bounds,poseCounts:result.poseCounts},null,2));
    assert.deepEqual(result.failures, []);
    for(const size of ['big','mini'])assert.equal(result.bounds[size].stand.height,result.sizes[size].heightPx,`${size}: standing raster height`);

    // Capture whole native sequences, including pixels offscreen in the scroller.
    for(const size of ['big','mini'])fs.writeFileSync(path.join(review,`jane-${size}-all-states.png`),Buffer.from(result.sheets[size].split(',')[1],'base64'));
    if(process.env.UPDATE_ASSETS==='1') {
      const out=path.join(project,'assets/jane');fs.mkdirSync(out,{recursive:true});
      for(const size of ['big','mini'])fs.writeFileSync(path.join(out,`jane-${size}.png`),Buffer.from(result.sheets[size].split(',')[1],'base64'));
      fs.writeFileSync(path.join(out,'jane-animation.json'),JSON.stringify(result.metadata,null,2)+'\n');
    }

    await page.locator('#pause').click();
    assert.deepEqual(await page.locator('#motion option').evaluateAll(options=>options.map(option=>option.value)),result.rows,'all 14 animations appear in the workshop');
    await page.locator('#motion').selectOption('run');
    for(let f=0;f<result.timingMs.run.length;f++){
      assert.match(await page.locator('#frame-info').textContent(),new RegExp(`RUN / ${f+1} OF 12 / ${result.timingMs.run[f]} ms$`));
      await page.locator('#step').click();
    }
    assert.match(await page.locator('#frame-info').textContent(),/RUN \/ 1 OF 12 \/ \d+ ms$/);
    for(const state of result.rows){
      await page.locator('#motion').selectOption(state);
      for(const size of ['big','mini']){
        const canvas=page.locator('#'+size+'-strip');
        assert.equal(await canvas.evaluate(c=>c.width),result.sizes[size].width*result.timingMs[state].length);
        const data=await canvas.evaluate(c=>c.toDataURL());
        fs.writeFileSync(path.join(review,`jane-${size}-${state}-sequence.png`),Buffer.from(data.split(',')[1],'base64'));
      }
    }
    const sceneHash=()=>page.locator('#comparison').evaluate(canvas=>canvas.toDataURL());
    await page.locator('#motion').selectOption('run');
    const facingBefore=await sceneHash();await page.locator('#face').click();assert.notEqual(await sceneHash(),facingBefore,'turn control changes the rendered direction');await page.locator('#face').click();
    const before=await sceneHash();await page.locator('#silhouette').check();assert.notEqual(await sceneHash(),before,'silhouette control changes rendered sprites');await page.locator('#silhouette').uncheck();
    await page.locator('.scene').screenshot({path:path.join(review,'jane-run-shared-grid.png')});
    await page.locator('#motion').selectOption('stand');
    await page.locator('.scene').screenshot({path:path.join(review,'jane-standing-shared-grid.png')});
    const janeOnly=await sceneHash();await page.locator('#compare-jessie').check();assert.notEqual(await sceneHash(),janeOnly,'Jessie comparison adds both approved sizes on the same scene');
    await page.locator('.scene').screenshot({path:path.join(review,'jane-jessie-shared-grid.png')});
    await page.locator('#background').selectOption('light');
    await page.locator('.scene').screenshot({path:path.join(review,'jane-jessie-light-grid.png')});
    await page.locator('#background').selectOption('dark');
    await page.screenshot({path:path.join(review,'jane-workshop.png'),fullPage:true});
    for(const size of ['big','mini']){
      const downloadPromise=page.waitForEvent('download');await page.locator(`[data-export="${size}"]`).click();const download=await downloadPromise;
      assert.equal(download.suggestedFilename(),`jane-${size}.png`);
      const png=fs.readFileSync(await download.path());
      assert.equal(png.readUInt32BE(16),result.sizes[size].width*result.columns,'workshop sheet export width');
      assert.equal(png.readUInt32BE(20),result.sizes[size].height*result.rows.length,'workshop sheet export height');
      assert.equal(sha256(png),sha256(Buffer.from(result.sheets[size].split(',')[1],'base64')),'workshop sheet equals validated renderer');
    }
    const metadataPromise=page.waitForEvent('download');await page.locator('#metadata').click();const metadataDownload=await metadataPromise;
    assert.equal(metadataDownload.suggestedFilename(),'jane-animation.json');
    const downloadedMetadata=JSON.parse(fs.readFileSync(await metadataDownload.path(),'utf8'));
    assert.deepEqual(downloadedMetadata,result.metadata,'workshop download and native export share complete canonical metadata');

    const codex=await browser.newPage({viewport:{width:1440,height:1000}});const codexErrors=[];codex.on('pageerror',error=>codexErrors.push(error.message));
    await codex.goto(base+'/codex.html#jane-big');await codex.locator('#pause').click();
    for(const size of ['big','mini']){
      await codex.locator(`[data-asset="jane-${size}"]`).click();
      assert.equal(await codex.locator('#assetName').textContent(),size==='big'?'Jane / Big':'Jane / Mini');
      assert.deepEqual(await codex.locator('#motion option').evaluateAll(options=>options.map(option=>option.value)),result.rows,'Codex exposes all Jane animations');
      assert.equal(await codex.locator('.palette i').count(),16,'Codex displays Jane palette');
      assert.match(await codex.locator('#character-workshop-link').getAttribute('href'),/jane\.html$/);
      await codex.locator('#motion').selectOption('run');
      for(let f=0;f<12;f++){
        assert.match(await codex.locator('#jessie-frame-label').textContent(),new RegExp(`POSE ${f+1} / 12`));await codex.locator('#step').click();
      }
      assert.match(await codex.locator('#jessie-frame-label').textContent(),/POSE 1 \/ 12/);
      const canvas=codex.locator('#art');assert.deepEqual(await canvas.evaluate(c=>[c.width,c.height]),[128,128],'all Codex character previews share presentation geometry');
      await codex.locator('#motion').selectOption('stand');
      const height=await canvas.evaluate(c=>{const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let lo=c.height,hi=-1;for(let i=3;i<data.length;i+=4)if(data[i]){const y=Math.floor((i-3)/4/c.width);lo=Math.min(lo,y);hi=Math.max(hi,y);}return hi-lo+1;});
      assert.equal(height,result.sizes[size].heightPx,'Codex keeps big and mini native heights');
      const downloadPromise=codex.waitForEvent('download');await codex.locator('#export').click();const download=await downloadPromise;
      const png=fs.readFileSync(await download.path());assert.equal(png.readUInt32BE(16),result.sizes[size].width);assert.equal(png.readUInt32BE(20),result.sizes[size].height);
    }
    for(const [legacy,current] of [['jane-detailed','jane-big'],['jane','jane-mini']]){
      await codex.goto(base+'/codex.html#'+legacy);await codex.waitForURL(url=>url.hash==='#'+current);assert.match(await codex.locator('#character-workshop-link').getAttribute('href'),/jane\.html$/);
    }
    await codex.goto(base+'/codex.html#jane-courier');assert.equal(await codex.locator('[data-asset="jane-courier"]').count(),1,'retain the existing courier outfit');assert.match(await codex.locator('#description').textContent(),/legacy/i,'courier clearly remains a legacy outfit');
    assert.deepEqual(codexErrors,[],'Codex integration errors');await codex.close();

    for(const [width,height,dpr] of [[1440,1000,1],[390,844,3],[844,390,3],[800,600,1.25]]){
      const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr});
      const p=await context.newPage();await p.goto(base+'/jane.html');
      const values=await p.evaluate(()=>Array.from(document.querySelectorAll('#comparison,#big-strip,#mini-strip,#run-big-strip,#run-mini-strip')).map(el=>{const rect=el.getBoundingClientRect();return {id:el.id,sx:rect.width*devicePixelRatio/el.width,sy:rect.height*devicePixelRatio/el.height,smoothing:el.getContext('2d').imageSmoothingEnabled,overflow:document.documentElement.scrollWidth>innerWidth};}));
      for(const v of values){assert.ok(Math.abs(v.sx-v.sy)<.001,`${v.id}: uniform scaling at ${width}/${dpr}`);assert.ok(Math.abs(v.sx-Math.round(v.sx))<.001,`${v.id}: whole device pixels at ${width}/${dpr}`);assert.equal(v.smoothing,false);assert.equal(v.overflow,false);}
      await context.close();
    }

    // Load Jessie in isolation so Jane's integration cannot mask a source change.
    const jessie=await browser.newPage();await jessie.goto(base+'/jessie.html');
    const hashes=await jessie.evaluate(async()=>Object.fromEntries(await Promise.all(['big','mini'].map(async size=>{const cv=CADJessie.sheet(size),pixels=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;const digest=await crypto.subtle.digest('SHA-256',pixels);return [size,Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,'0')).join('')];}))));
    assert.deepEqual(hashes,baseline.renderRGBA,'Jessie rendered sheets must remain pixel-for-pixel identical');
    await jessie.close();
    assert.deepEqual(errors, []);
    console.log(`Jane: ${result.rasters} native rasters pass all 14 animations in both directions; fixed heights/cells, 16 opaque colors, connected crown/body, contact feet, hair waves, firing independence, exact sheet cells/timing, controls, downloads, Codex entries and legacy aliases, desktop/mobile pixel grids. Jessie render and asset SHA256s are unchanged. Review: ${review}`);
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
