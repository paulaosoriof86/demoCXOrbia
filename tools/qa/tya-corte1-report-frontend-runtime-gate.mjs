#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const args=process.argv.slice(2);
const arg=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
const sourceFile=arg('--file','app/modules/cliente-extra.js');
const outDir=arg('--out','.tmp/tya-corte1-report-frontend-runtime');
fs.mkdirSync(outDir,{recursive:true});
const source=fs.readFileSync(sourceFile,'utf8');

function fixture(){
  const rows=[
    ['2026-05','GT',30,30,0,30,30,30],['2026-05','HN',8,8,0,8,8,8],
    ['2026-06','GT',34,34,0,34,34,34],['2026-06','HN',10,10,0,10,10,10],
    ['2026-07','GT',34,30,4,18,17,12],['2026-07','HN',10,9,1,6,5,4]
  ].map(([periodKey,country,visits,assigned,unassigned,performed,questionnaire,submitted])=>({tenantId:'tya',projectId:'cinepolis',periodKey,country,visits,assigned,unassigned,performed,questionnaire,submitted,paymentConfirmed:0}));
  const branchRows=[
    ['2026-05','GT','C. Miraflores',2,2,0,2,2,2],['2026-05','GT','C. Oakland',3,3,0,3,3,3],
    ['2026-06','GT','C. Miraflores',2,2,0,2,2,2],['2026-06','GT','C. Oakland',2,2,0,2,2,2],
    ['2026-07','GT','C. Miraflores',2,2,0,1,1,1],['2026-07','GT','C. Oakland',2,1,1,1,1,0],
    ['2026-07','HN','C. Multiplaza',2,2,0,1,1,1]
  ].map(([periodKey,country,branchName,visits,assigned,unassigned,performed,questionnaire,submitted])=>({tenantId:'tya',projectId:'cinepolis',periodKey,country,branchName,city:country==='HN'?'Tegucigalpa':'Guatemala',visits,assigned,unassigned,performed,questionnaire,submitted,paymentConfirmed:0}));
  const catalog=[
    ['executive_operational_summary','Resumen ejecutivo operativo','periodCountry','available'],
    ['branch_operational_status','Estado operativo por sucursal','branch','available'],
    ['country_coverage','Cobertura por país','periodCountry','available'],
    ['period_trend','Tendencia operativa por periodo','periodCountry','available'],
    ['action_plans','Planes de acción',null,'pending_source'],
    ['training_gaps','Brechas y capacitación',null,'pending_source'],
    ['brand_scorecard','Scorecard de marca',null,'pending_source']
  ].map(([id,label,projectionLevel,availability])=>({id,label,projectionLevel,availability}));
  const p={schemaVersion:'1.2.0',contractId:'phase-a-corte1-context-history-reports-v1',tenantId:'tya',projectId:'cinepolis',projectName:'Cinépolis',source:{title:'HR verificada',type:'google_sheets',sourceSafe:true,production:false,imported:false},periods:['2026-05','2026-06','2026-07'],countries:['GT','HN'],latestPeriod:'2026-07',rows,branchRows,catalog};
  p.filter=(scope={},level='periodCountry')=>(level==='branch'?p.branchRows:p.rows).filter(r=>(!scope.periodKey||r.periodKey===scope.periodKey)&&(!scope.country||r.country===scope.country)&&(!scope.branchName||r.branchName===scope.branchName));
  p.report=(id,scope={})=>{const d=p.catalog.find(x=>x.id===id)||null;if(!d||d.availability!=='available')return {available:false,reason:d?'pending_source':'unknown_report',definition:d,rows:[]};return {available:true,reason:null,definition:d,rows:p.filter(scope,d.projectionLevel||'periodCountry')};};
  return p;
}

class El{constructor(){this.id='';this.disabled=false;this.dataset={};this.listeners={};this._html='';this.value='';this.style={};}addEventListener(t,f){this.listeners[t]=f;}click(){this.listeners.click?.({target:this});}appendChild(e){return e;}set innerHTML(v){this._html=String(v);}get innerHTML(){return this._html;}}
const buttonsFrom=html=>[...html.matchAll(/<button[^>]*data-rep-act="([^"]+)"([^>]*)>/g)].map(m=>{const e=new El();e.dataset.repAct=m[1];e.disabled=/\sdisabled(?:\s|>|=)/.test(m[2]);return e;});
const labelsFrom=html=>[...html.matchAll(/data-gate-bdg="[^"]*">([^<]+)<\/span>/g)].map(m=>m[1]);

function run({role='director',period={id:'cinepolis-2026-07',periodKey:'2026-07',periodo:'JUL 2026'},scopeSucursal=null,country=''}){
  const modules={},timers=[],store=new Map(country?[['cx_rep_country',country]]:[]),projection=fixture();
  let html='',buttons=[];const exports={excel:[],ppt:[],prints:0};
  const root=new El();Object.defineProperty(root,'outerHTML',{set(v){html=String(v);buttons=buttonsFrom(html);},get(){return html;}});const printHost=new El();
  const document={head:new El(),body:new El(),createElement:()=>new El(),getElementById:id=>id==='repRoot'?root:(id==='cxReportPrint'?printHost:null),querySelectorAll:s=>s==='[data-rep-act]'?buttons:[]};
  const CX={module:(id,fn)=>modules[id]=fn,data:{period:()=>period,programBase:()=> 'Cinépolis',programKey:()=> 'cinepolis'},session:{user:{clienteRole:role,scopeSucursal},save:()=>{},view:'cli_reportes'},cliUI:{personaBarHTML:()=>'',wirePersona:()=>{}},clienteData:{sucursales:()=>[{id:'suc-miraflores',name:'C. Miraflores'},{id:'suc-oakland',name:'C. Oakland'}]},ui:{toast:()=>{},statusBdg:()=>''},router:{enter:()=>{},nav:()=>{}},CLIENTE_ROLES:[],marketplace:[]};
  const XLSX={utils:{book_new:()=>({sheets:[]}),aoa_to_sheet:data=>({data}),json_to_sheet:data=>({data}),book_append_sheet:(wb,sheet,name)=>wb.sheets.push({name,sheet})},writeFile:(wb,filename)=>exports.excel.push({wb,filename})};
  class PptxGenJS{constructor(){this.slides=[];}defineLayout(){}set layout(v){}addSlide(){const s={addText:()=>{},addTable:()=>{}};this.slides.push(s);return s;}writeFile({fileName}){exports.ppt.push({fileName,slides:this.slides});return Promise.resolve();}}
  const ui={ph:(a,b)=>`<h1>${a}</h1><p>${b}</p>`,aiBox:(a,b)=>`<aside>${b}: ${a}</aside>`,bdg:(label,tone)=>`<span data-gate-bdg="${tone}">${label}</span>`,kpi:()=>''};
  const context={CX,window:{CX_TYA_CORTE1_REPORTS:projection,print:()=>exports.prints++},document,sessionStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},setTimeout:f=>{timers.push(f);return 0;},XLSX,PptxGenJS,console,Date,Number,String,Array,Object,Math,JSON,Intl,Promise};
  vm.createContext(context);vm.runInContext(source,context);html=String(modules.cli_reportes({ui})||'');buttons=buttonsFrom(html);for(const f of timers)f();
  const click=(id,fmt)=>{const b=buttons.find(x=>x.dataset.repAct===`${id}:${fmt}`);assert(b&&!b.disabled,`${id}:${fmt} unavailable`);b.click();};
  const data=()=>exports.excel.at(-1).wb.sheets.find(x=>x.name==='Datos').sheet.data;
  return {exports,get html(){return html;},get buttons(){return buttons;},labels:()=>labelsFrom(html),click,data};
}

const result={};
let c=run({role:'director'});assert.equal(c.labels().filter(x=>x==='Disponible').length,4);assert.equal(c.labels().filter(x=>x==='Pendiente de fuente').length,3);assert.equal(c.buttons.filter(x=>!x.disabled).length,12);c.click('executive_operational_summary','Excel');assert.equal(c.data().reduce((n,r)=>n+r.Visitas,0),44);result.director={available:4,pending:3,enabled:12,allVisits:44};
c=run({role:'director',country:'GT'});c.click('executive_operational_summary','Excel');assert.equal(c.data().reduce((n,r)=>n+r.Visitas,0),34);assert.match(c.exports.excel.at(-1).filename,/_gt_/);result.director.gtVisits=34;
c=run({role:'director'});c.click('period_trend','Excel');let trend=c.data();assert.deepEqual([...new Set(trend.map(r=>r.Periodo))].sort(),['2026-05','2026-06']);result.trendPeriods=['2026-05','2026-06'];
c=run({role:'regional'});assert.equal(c.buttons.filter(x=>!x.disabled).length,0);assert(c.labels().filter(x=>x==='Pendiente de alcance autorizado').length>=4);result.regional={enabled:0};
c=run({role:'sucursal',scopeSucursal:'suc-miraflores'});assert.equal(c.labels().filter(x=>x==='Disponible').length,4);for(const id of ['executive_operational_summary','branch_operational_status','country_coverage']){c.click(id,'Excel');assert.equal(c.data().reduce((n,r)=>n+r.Visitas,0),2);assert(!JSON.stringify(c.data()).includes('Oakland'));}c.click('period_trend','Excel');trend=c.data();assert.equal(trend.reduce((n,r)=>n+r.Visitas,0),4);assert.deepEqual([...new Set(trend.map(r=>r.Periodo))].sort(),['2026-05','2026-06']);result.sucursal={available:4,currentVisits:2,trendVisits:4};
c=run({role:'director',period:{id:'cinepolis-2026-06',periodo:'JUN 2026'}});assert.equal(c.labels().filter(x=>x==='Disponible').length,0);assert.equal(c.buttons.filter(x=>!x.disabled).length,0);assert(!c.html.includes('2026-07'));result.missingPeriod={available:0,enabled:0};
c=run({role:'director',country:'GT'});c.click('executive_operational_summary','PDF');assert.equal(c.exports.prints,1);c.click('executive_operational_summary','PPT');assert.equal(c.exports.ppt.at(-1).slides.length,4);result.exports={pdfPrints:1,pptSlides:4};

const report={ok:true,decision:'PASS_CORTE1_REPORT_FRONTEND_RUNTIME',sourceFile,blockers:[],warnings:[],result};
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'report.md'),`# Corte 1 report frontend runtime gate\n\n- Decision: \`${report.decision}\`\n- Director available: 4\n- Director pending source: 3\n- Regional exports: 0\n- Branch current visits: 2\n- Trend periods: 2026-05, 2026-06\n- Missing period exports: 0\n`,'utf8');
console.log(JSON.stringify(report,null,2));
