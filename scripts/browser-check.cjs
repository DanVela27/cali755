const { chromium } = require(process.env.CALI_PLAYWRIGHT_MODULE || 'playwright');
const {readFileSync,writeFileSync}=require('node:fs');
const assert=require('node:assert/strict');
process.env.PLAYWRIGHT_SCREENSHOT_NO_FONTS_READY='1';
(async()=>{
 const original=readFileSync('public/report.json','utf8');
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}}), page=await context.newPage(), viewer=await context.newPage();
 const errors=[];context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/');await page.getByText('27',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Actividades',exact:true}).click();
 await page.getByRole('checkbox',{name:'Completar CA17',exact:true}).check();
 await page.reload();await page.getByRole('button',{name:'Actividades',exact:true}).click();
 assert.equal(await page.getByRole('checkbox',{name:'Completar CA17',exact:true}).isChecked(),true);
 await viewer.goto('http://127.0.0.1:5173/?vista=consulta');
 await viewer.getByRole('button',{name:'Actividades',exact:true}).click();
 const box=()=>viewer.getByRole('checkbox',{name:'Completar CA17',exact:true});
 assert.equal(await box().isChecked(),false);assert.equal(await box().isDisabled(),true);
 assert.equal(await viewer.getByRole('button',{name:'Publicar avances',exact:true}).count(),0);
 await page.getByRole('button',{name:'Publicar avances',exact:true}).click();
 await page.getByRole('button',{name:'Preparar corte para publicar',exact:true}).click();
 await page.getByText('Corte preparado; pendiente de subir a GitHub.',{exact:true}).waitFor();
 const prepared=JSON.parse(readFileSync('public/report.json','utf8'));
 assert.equal(prepared.tasks.find(t=>t.code==='CA17').status,'done');assert.ok(prepared.prepared_at);assert.equal(prepared.events.length,1);
 await viewer.reload();await viewer.getByRole('button',{name:'Actividades',exact:true}).click();assert.equal(await box().isChecked(),true);
 await page.getByRole('button',{name:'Actividades',exact:true}).click();await page.getByRole('checkbox',{name:'Completar CA17',exact:true}).uncheck();
 await viewer.reload();await viewer.getByRole('button',{name:'Actividades',exact:true}).click();assert.equal(await box().isChecked(),true);
 await page.getByRole('button',{name:'Publicar avances',exact:true}).click();
 await page.getByLabel('Importar respaldo JSON').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"tasks":[]}')});
 await page.getByText('Lista de actividades o historial inválida.',{exact:true}).waitFor();
 await page.getByLabel('Importar respaldo JSON').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(original)});
 await page.getByRole('button',{name:'Respaldar y restaurar borrador',exact:true}).click();
 await page.getByRole('button',{name:'Resumen',exact:true}).click();await page.getByText('27',{exact:true}).waitFor();
 await page.screenshot({path:'preview-editor.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'preview-mobile.png',fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 const hosted=await browser.newPage();await hosted.goto('http://127.0.0.1:4173/?editar=1');
 await hosted.getByText('27',{exact:true}).waitFor();assert.equal(await hosted.getByRole('button',{name:'Publicar avances',exact:true}).count(),0);
 await hosted.getByRole('button',{name:'Actividades',exact:true}).click();assert.equal(await hosted.getByRole('checkbox',{name:'Completar CA17',exact:true}).isDisabled(),true);
 await hosted.getByRole('button',{name:'Resumen',exact:true}).click();await hosted.screenshot({path:'preview-desktop.png',fullPage:true});
 assert.deepEqual(errors,[]);
 const blocked=await context.request.post('http://127.0.0.1:5173/__cali/prepare',{headers:{origin:'https://other.example','content-type':'application/json'},data:prepared});assert.equal(blocked.status(),403);
 console.log('PASS: local edit/reload, draft isolation, prepared snapshot, read-only production, import validation and restore, audit persistence, mobile layout, endpoint origin protection.');
 }finally{writeFileSync('public/report.json',original);await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});


