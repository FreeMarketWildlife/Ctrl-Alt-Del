/* Visual review/export harness. Start a static server at BASE_URL (default 8026).
 * Run with Playwright available via NODE_PATH; CHROME_PATH optionally selects Chrome.
 * Outputs go to REVIEW_OUTPUT, default /private/tmp/jessie-review.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const out=path.resolve(process.env.REVIEW_OUTPUT||'/private/tmp/jessie-review');
const url=(process.env.BASE_URL||'http://127.0.0.1:8026')+'/docs/review/jessie-review.html';

(async()=>{
  fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    const page=await browser.newPage({viewport:{width:1640,height:1100},deviceScaleFactor:1});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.waitForFunction(()=>window.CADJessieReview);
    const metadata=await page.evaluate(()=>({sizes:CADJessie.specs,rows:CADJessie.states,timingMs:CADJessie.durations,columns:CADJessie.columns,world:CADJessieReview.metrics}));
    assert.equal(metadata.world.doorway.height,112);assert.equal(metadata.world.crate.height,32);assert.equal(metadata.world.barrier.height,48);assert.equal(metadata.world.big.height,96);assert.equal(metadata.world.mini.height,32);
    assert.equal(await page.locator('#sheets canvas').count(),metadata.rows.length);
    for(const size of ['big','mini'])for(const state of metadata.rows){
      const dimensions=await page.locator(`canvas[data-size="${size}"][data-state="${state}"]`).evaluate(c=>({w:c.width,h:c.height}));
      assert.equal(dimensions.w,metadata.sizes[size].width*metadata.timingMs[state].length);assert.equal(dimensions.h,metadata.sizes[size].height);
    }
    const writeCanvas=async(filename,expression)=>{
      const data=await page.evaluate(expression);fs.writeFileSync(path.join(out,filename),Buffer.from(data.split(',')[1],'base64'));
    };
    for(const facing of [1,-1])for(const silhouette of [false,true]){
      await page.selectOption('#facing',String(facing));await page.locator('#silhouette').setChecked(silhouette);
      const suffix=`${facing===1?'right':'left'}${silhouette?'-silhouette':''}`;
      const exports=await page.evaluate(()=>Object.fromEntries(['big','mini'].map(size=>[size,CADJessieReview.atlas(size).toDataURL('image/png')])));
      for(const [size,data] of Object.entries(exports))fs.writeFileSync(path.join(out,`jessie-${size}-${suffix}.png`),Buffer.from(data.split(',')[1],'base64'));
    }
    await page.selectOption('#facing','1');await page.locator('#silhouette').uncheck();
    await writeCanvas('world-scale-native.png',()=>document.getElementById('world-scene').toDataURL('image/png'));
    await page.locator('#world-scene').screenshot({path:path.join(out,'world-scale-4x.png')});
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:path.join(out,'review-overview.png')});
    for(const state of metadata.rows){
      await page.selectOption('#state',state);
      for(let frame=0;frame<metadata.timingMs[state].length;frame++){
        assert.match(await page.locator('#frame-readout').textContent(),new RegExp(`^${String(frame+1).padStart(2,'0')} / ${metadata.timingMs[state].length}`));await page.click('#step');
      }
      assert.match(await page.locator('#frame-readout').textContent(),/^01 \//);
    }
    assert.deepEqual(errors,[]);
    const gridChecks=[];
    for(const [width,height,dpr] of [[1640,1100,1],[390,844,3],[844,390,3],[800,600,1.25]]){
      const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr});const p=await context.newPage();await p.goto(url);
      for(const zoom of ['1','4','fit']){
        await p.selectOption('#scene-zoom',zoom);
        const value=await p.locator('#world-scene').evaluate(c=>{const r=c.getBoundingClientRect();return {sx:r.width*devicePixelRatio/c.width,sy:r.height*devicePixelRatio/c.height,overflow:document.documentElement.scrollWidth>innerWidth};});
        assert.ok(Math.abs(value.sx-value.sy)<.001);assert.ok(Math.abs(value.sx-Math.round(value.sx))<.001);assert.equal(value.overflow,false);
        if(zoom!=='fit')assert.ok(Math.abs(value.sx-Number(zoom))<.001);gridChecks.push({width,height,dpr,zoom,...value});
      }
      await context.close();
    }
    fs.writeFileSync(path.join(out,'review-metadata.json'),JSON.stringify({...metadata,gridChecks,notes:['Sheets use real frame counts; unused cells are transparent.','PNG atlases are native pixels with no UI labels. Rows follow the metadata order.','The world vignette is an authored scale study, not gameplay collision geometry.']},null,2)+'\n');
    console.log(`PASS: complete frame sheets, playback stepping, world measurements, and desktop/mobile integer pixel presentation. Review exports: ${out}`);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
