const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const errors=[];const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8042/appearance-review/');await page.locator('#scale-note').filter({hasText:'device pixel'}).waitFor();
 const initial=await page.locator('#comparison').evaluate(c=>c.toDataURL());
 await page.locator('#next').click();assert.equal(await page.locator('#frame').inputValue(),'1');
 await page.selectOption('#facing','-1');assert.notEqual(await page.locator('#comparison').evaluate(c=>c.toDataURL()),initial);
 await page.selectOption('#background','light');await page.locator('#guides').check();await page.locator('#silhouette').check();
 await page.screenshot({path:__dirname+'/assets/browser-light-silhouette.png',fullPage:true});
 await page.selectOption('#facing','1');await page.selectOption('#background','dark');await page.locator('#guides').uncheck();await page.locator('#silhouette').uncheck();await page.locator('#frame').fill('0');
 await page.screenshot({path:__dirname+'/assets/browser-desktop.png',fullPage:true});
 const desktop=await page.locator('#comparison').evaluate(c=>({width:c.width,scale:c.getBoundingClientRect().width*devicePixelRatio/c.width}));assert(Number.isInteger(desktop.scale));
 const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3});mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto('http://127.0.0.1:8042/appearance-review/');
 const dimensions=await mobile.evaluate(()=>{const c=document.querySelector('canvas');return {scale:c.getBoundingClientRect().width*devicePixelRatio/c.width,body:document.body.scrollWidth,viewport:innerWidth};});assert(Math.abs(dimensions.scale-Math.round(dimensions.scale))<0.001);assert(dimensions.body<=dimensions.viewport);
 await mobile.screenshot({path:__dirname+'/assets/browser-mobile.png',fullPage:true});assert.deepEqual(errors,[]);console.log({desktop,mobile:dimensions,errors,controls:'pass'});await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
