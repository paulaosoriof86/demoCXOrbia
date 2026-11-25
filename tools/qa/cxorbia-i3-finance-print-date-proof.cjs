const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const {chromium}=require('playwright');
const pdfjs=require('pdfjs-dist/legacy/build/pdf.js');
const [source,destination,expectLong]=process.argv.slice(2);
if(!/^[a-f0-9]{40}$/.test(source||'')||!destination||!['pass','wrapped'].includes(expectLong))throw Error('Use: node <script> <source-sha> <output.json> <pass|wrapped>');
const blob=p=>execFileSync('git',['show',source+':'+p],{encoding:'utf8'});
(async()=>{
 const {pdfContentDiagnostic}=await import('./cxorbia-i3-finance-ui-export-readonly.mjs');
 const browser=await chromium.launch({headless:true});
 const keys=['fecha','concepto','categoria','tipo','pais','moneda','monto','estado'];
 const headers=['Fecha','Concepto','Categoría','Tipo','País','Moneda','Monto','Estado'];
 const title='Movimientos & Tesorería',periodLabel='Noviembre 2026';
 const cases=[
 ['short',['2026-11-09','Anticipo de prueba','Proyecto','Ingreso','GT','GTQ',7300,'Registrado']],
 ['long',['2026-11-09','Anticipo de ejemplo para el proyecto del mes de noviembre','Categoría de prueba','Financiamiento del proyecto','GT','GTQ',7300,'Pendiente de conciliación']]];
 const results=[];
 try{
  for(const [name,row] of cases){
   const page=await browser.newPage({viewport:{width:1440,height:1000},locale:'en-US'});
   await page.setContent('<!doctype html><html lang="es"><meta charset="utf-8"><body></body></html>');
   for(const css of ['theme','layout'])await page.addStyleTag({content:blob('app/styles/'+css+'.css')});
   await page.evaluate(()=>{window.CX={module(){}};window.print=()=>{};});
   await page.addScriptTag({content:blob('app/modules/cliente-extra.js')});
   const rows=[row,['2026-11-18',...row.slice(1)]];
   const spec={meta:{title,period:periodLabel,project:'Proyecto de prueba',scope:'Proyecto de prueba',sourceLabel:'Finanzas',generatedAt:'25 de noviembre'},columns:keys.map((key,i)=>({key,label:headers[i]})),rows:rows.map(values=>Object.fromEntries(keys.map((key,i)=>[key,values[i]])))};
   await page.evaluate(s=>CX.reportKit.exportPDF(s),spec);
   const actual=await page.locator('#cxRKPrint tbody tr').evaluateAll(trs=>trs.map(tr=>Array.from(tr.cells,c=>c.textContent.trim())));
   const pdf=await page.pdf({format:'A4',printBackground:true});
   const doc=await pdfjs.getDocument({data:new Uint8Array(pdf),disableFontFace:true,useSystemFonts:true,isEvalSupported:false}).promise;
   const pages=[];for(let i=1;i<=doc.numPages;i++){const p=await doc.getPage(i);pages.push((await p.getTextContent()).items.map(x=>x.str).join(' '))}
   results.push({name,printDomMatches:JSON.stringify(actual)===JSON.stringify(rows.map(r=>r.map(String))),pdfSha256:createHash('sha256').update(pdf).digest('hex'),...pdfContentDiagnostic({pages:doc.numPages,text:pages.join(' '),title,periodLabel,rows})});
   await doc.destroy();await page.close();
  }
  const report={source,chromium:browser.version(),pdfjs:pdfjs.version,scope:'SYNTHETIC_RENDER_ONLY',operationalWrites:0,results};
  fs.writeFileSync(destination,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(results.map(x=>({name:x.name,dom:x.printDomMatches,pdf:x.matches,missing:x.missingCells.map(c=>[c.row,c.column,c.matchesIgnoringWhitespace])}))));
  const [short,long]=results;
  if(!short.printDomMatches||!long.printDomMatches||!short.matches)throw Error('FUNCTIONAL_DEFECT:PRINT_DATE_CONTROL');
  if(expectLong==='pass'&&!long.matches)throw Error('FUNCTIONAL_DEFECT:PRINT_DATE_REGRESSION');
  if(expectLong==='wrapped'&&(long.matches||long.missingCellCount!==2||long.missingCells.some((cell,i)=>cell.column!==0||cell.row!==i||!cell.matchesIgnoringWhitespace)))throw Error('MAPPING_FAILURE:PRINT_DATE_BASELINE');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1});
