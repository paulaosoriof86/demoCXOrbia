#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';

const args=process.argv.slice(2);
const arg=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
const contractFile=arg('--contract','backend/contracts/phase-a-corte1-report-frontend-consumer-v1.json');
const targetFile=arg('--file','app/modules/cliente-extra.js');
const indexFile=arg('--index','app/index.html');
const outDir=arg('--out','.tmp/tya-corte1-report-frontend-consumer');
fs.mkdirSync(outDir,{recursive:true});

const contract=JSON.parse(fs.readFileSync(contractFile,'utf8'));
const source=fs.readFileSync(targetFile,'utf8');
const start=source.indexOf("CX.module('cli_reportes'");
const end=source.indexOf('/* ============== Mi Programa',start);
const block=start>=0?source.slice(start,end>start?end:source.length):'';
const blockers=[];
const warnings=[];
const add=(arr,code,observed,expected)=>arr.push({code,observed,expected});

if(!block)add(blockers,'cli_reportes_module_missing',false,true);
if(block&&!block.includes('CX_TYA_CORTE1_REPORTS'))add(blockers,'approved_projection_not_consumed',false,true);
for(const fragment of contract.honestStates?.forbiddenTextFragments||[]){
  if(block.includes(fragment))add(blockers,'forbidden_demo_copy_present',fragment,'absent');
}
for(const card of contract.reportCards||[]){
  if(block&&!block.includes(card.reportId))add(blockers,'report_id_missing',card.reportId,'present in cli_reportes');
}
if(block&&!block.includes(contract.honestStates?.pendingSourceLabel||'Pendiente de fuente'))add(blockers,'pending_source_copy_missing',false,true);
if(block&&!block.includes(contract.honestStates?.pendingScopeLabel||'Pendiente de alcance autorizado'))add(blockers,'pending_scope_copy_missing',false,true);
if(block&&!/window\.print\s*\(|\.print\s*\(/.test(block))add(blockers,'pdf_print_flow_missing',false,true);
if(block&&!/\bXLSX\b/.test(block))add(blockers,'xlsx_export_missing',false,true);
if(block&&!/PptxGenJS|pptxgen/i.test(block))add(blockers,'pptx_export_missing',false,true);
if(block&&!/periodKey/.test(block))add(blockers,'period_scope_missing',false,true);
if(block&&!/country/.test(block))add(blockers,'country_scope_missing',false,true);
if(block&&!/pending_source/.test(block))add(warnings,'pending_source_code_not_explicit',false,true);

// The approved build projection is schema 1.1.0 and exposes rows/branchRows/catalog plus
// filter()/report(); it does not expose periods[].branches or score/NPS fields.
const incompatibleShapePatterns=[
  ['assumed_period_objects',/src\.periods\s*\.find\s*\(/],
  ['assumed_by_period_map',/src\.byPeriod\b/],
  ['assumed_branches_container',/entry\.branches\b|rawBranches\b/],
  ['period_id_used_instead_of_period_key',/periodId\s*===\s*p\.id|periodKey\s*===\s*p\.id|byPeriod\s*\[\s*p\.id\s*\]/],
  ['unsupported_score_projection',/\bavgScore\b|\bscoreSum\b|\bscoreN\b|\.score\b|Score promedio|Score global/],
  ['unsupported_nps_projection',/\bavgNps\b|\bnpsScored\b|\.nps\b|\bNPS\b/],
  ['unsupported_region_dimension',/\.region\b|<th>Región<\/th>|['"]Región['"]/]
];
for(const [code,re] of incompatibleShapePatterns){
  if(block&&re.test(block))add(blockers,code,true,false);
}
if(block&&!/\.report\s*\(/.test(block))add(blockers,'projection_report_api_not_used',false,true);
if(block&&!/\.filter\s*\(/.test(block))add(blockers,'projection_filter_api_not_used',false,true);
if(block&&block.includes('Fuente: window.CX_TYA_CORTE1_REPORTS'))add(warnings,'technical_global_name_exposed_to_user',true,'human source-safe label');

const pptContract=contract.exportFormats?.PPT;
if(pptContract?.required){
  const vendor='app/vendor/pptxgenjs.min.js';
  if(!fs.existsSync(vendor))add(blockers,'local_pptx_dependency_missing',vendor,'present');
  const html=fs.existsSync(indexFile)?fs.readFileSync(indexFile,'utf8'):'';
  if(!html.includes('vendor/pptxgenjs.min.js'))add(blockers,'pptx_dependency_not_loaded',false,true);
  if(/https?:\/\/[^"']*pptx/i.test(html))add(blockers,'remote_pptx_cdn_forbidden',true,false);
}

function buildProjectionFixture(){
  const rows=[
    {tenantId:'tya',projectId:'cinepolis',periodKey:'2026-06',country:'GT',visits:34,assigned:34,unassigned:0,performed:34,questionnaire:34,submitted:34,paymentConfirmed:0},
    {tenantId:'tya',projectId:'cinepolis',periodKey:'2026-06',country:'HN',visits:10,assigned:10,unassigned:0,performed:10,questionnaire:10,submitted:10,paymentConfirmed:0},
    {tenantId:'tya',projectId:'cinepolis',periodKey:'2026-07',country:'GT',visits:34,assigned:30,unassigned:4,performed:18,questionnaire:17,submitted:12,paymentConfirmed:0},
    {tenantId:'tya',projectId:'cinepolis',periodKey:'2026-07',country:'HN',visits:10,assigned:9,unassigned:1,performed:6,questionnaire:5,submitted:4,paymentConfirmed:0}
  ];
  const branchRows=[
    {tenantId:'tya',projectId:'cinepolis',periodKey:'2026-07',country:'GT',branchName:'C. Miraflores',city:'Ciudad de Guatemala',visits:2,assigned:2,unassigned:0,performed:1,questionnaire:1,submitted:1,paymentConfirmed:0},
    {tenantId:'tya',projectId:'cinepolis',periodKey:'2026-07',country:'GT',branchName:'C. Oakland',city:'Ciudad de Guatemala',visits:2,assigned:1,unassigned:1,performed:1,questionnaire:1,submitted:0,paymentConfirmed:0},
    {tenantId:'tya',projectId:'cinepolis',periodKey:'2026-07',country:'HN',branchName:'C. Mall Multiplaza',city:'Tegucigalpa',visits:2,assigned:2,unassigned:0,performed:1,questionnaire:1,submitted:1,paymentConfirmed:0}
  ];
  const catalog=[
    {id:'executive_operational_summary',label:'Resumen ejecutivo operativo',projectionLevel:'periodCountry',availability:'available'},
    {id:'branch_operational_status',label:'Estado operativo por sucursal',projectionLevel:'branch',availability:'available'},
    {id:'country_coverage',label:'Cobertura por país',projectionLevel:'periodCountry',availability:'available'},
    {id:'period_trend',label:'Tendencia operativa por periodo',projectionLevel:'periodCountry',availability:'available'},
    {id:'action_plans',label:'Planes de acción',projectionLevel:null,availability:'pending_source',requiredSource:'action_plan_records'},
    {id:'training_gaps',label:'Brechas y capacitación',projectionLevel:null,availability:'pending_source',requiredSource:'questionnaire_section_scores'},
    {id:'brand_scorecard',label:'Scorecard validado',projectionLevel:null,availability:'pending_source',requiredSource:'validated_questionnaire_scores'}
  ];
  const projection={
    schemaVersion:'1.1.0',contractId:'phase-a-corte1-context-history-reports-v1',tenantId:'tya',projectId:'cinepolis',projectName:'Cinépolis',
    source:{title:'HR verificada',type:'google_sheets',sourceSafe:true,production:false,imported:false},
    periods:['2026-06','2026-07'],countries:['GT','HN'],latestPeriod:'2026-07',rows,branchRows,catalog,
    totals:{visits:88,assigned:83,unassigned:5,performed:68,questionnaire:66,submitted:60,paymentConfirmed:0},
    frontend:{formatsReady:['json','csv'],formatsPending:['pdf','xlsx','pptx'],pendingSourceBehavior:'disable_export_and_show_pending_source'}
  };
  const rowsFor=(level='periodCountry')=>level==='branch'?projection.branchRows:projection.rows;
  projection.filter=(scope={},level='periodCountry')=>rowsFor(level).filter(r=>(!scope.periodKey||r.periodKey===scope.periodKey)&&(!scope.country||r.country===scope.country)&&(!scope.branchName||r.branchName===scope.branchName)&&(!scope.city||r.city===scope.city));
  projection.report=(reportId,scope={})=>{
    const definition=projection.catalog.find(x=>x.id===reportId)||null;
    if(!definition)return {available:false,reason:'unknown_report',definition:null,rows:[]};
    if(definition.availability!=='available')return {available:false,reason:'pending_source',definition,rows:[]};
    return {available:true,reason:null,definition,rows:projection.filter(scope,definition.projectionLevel||'periodCountry')};
  };
  projection.toCSV=()=>'';
  projection.toJSON=()=>'';
  return projection;
}

if(block){
  try{
    const modules={};
    const store=new Map();
    const projection=buildProjectionFixture();
    const CX={
      module:(id,fn)=>{modules[id]=fn;},
      data:{
        period:()=>({id:'cinepolis-2026-07',periodKey:'2026-07',periodo:'JUL 2026',ronda:'JUL 2026',name:'Cinépolis',programKey:'cinepolis'}),
        programKey:()=> 'cinepolis',
        programBase:()=> 'Cinépolis'
      },
      session:{user:{clienteRole:'director'}},
      cliUI:{personaBarHTML:()=>'<div data-persona></div>',wirePersona:()=>{}},
      clienteData:{},
      ui:{toast:()=>{},statusBdg:()=>'<span>pendiente</span>',bdg:(label,tone)=>`<span data-gate-bdg="${tone}">${label}</span>`},
      marketplace:[]
    };
    const context={
      CX,window:{CX_TYA_CORTE1_REPORTS:projection},
      sessionStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)},
      setTimeout:()=>0,document:{},console,Date,Number,String,Array,Object,Math,JSON,Intl
    };
    vm.createContext(context);
    vm.runInContext(source,context,{filename:targetFile});
    if(typeof modules.cli_reportes!=='function')add(blockers,'cli_reportes_registration_failed',typeof modules.cli_reportes,'function');
    else{
      const ui={
        ph:(title,subtitle)=>`<h1>${title}</h1><p>${subtitle}</p>`,
        aiBox:(text,title)=>`<aside>${title}: ${text}</aside>`,
        bdg:(label,tone)=>`<span data-gate-bdg="${tone}">${label}</span>`,
        kpi:()=>''
      };
      const html=String(modules.cli_reportes({ui})||'');
      const statusLabels=[...html.matchAll(/data-gate-bdg="[^"]*">([^<]+)<\/span>/g)].map(m=>m[1]);
      const available=statusLabels.filter(x=>x==='Disponible').length;
      const pending=statusLabels.filter(x=>x==='Pendiente de fuente').length;
      const buttons=(html.match(/data-rep-act=/g)||[]).length;
      const disabled=(html.match(/\sdisabled(?:\s|>|=)/g)||[]).length;
      const enabled=buttons-disabled;
      if(available!==4)add(blockers,'approved_reports_not_available_with_real_projection',available,4);
      if(pending<3)add(blockers,'pending_source_reports_not_visible',pending,'>= 3');
      if(buttons!==21)add(blockers,'export_button_count_mismatch',buttons,21);
      if(enabled!==12)add(blockers,'available_export_buttons_mismatch',enabled,12);
      if(disabled!==9)add(blockers,'pending_export_buttons_mismatch',disabled,9);
      if(!html.includes('repPaisSel'))add(blockers,'director_country_filter_missing',false,true);
    }
  }catch(error){
    add(blockers,'semantic_fixture_execution_failed',error.message,'render against approved projection schema 1.1.0');
  }
}

const protectedFiles=contract.protectedFiles||[];
const result={
  ok:blockers.length===0,
  decision:blockers.length?'HOLD_CORTE1_REPORT_FRONTEND_CONSUMER':warnings.length?'PASS_WITH_REVIEW_CORTE1_REPORT_FRONTEND_CONSUMER':'PASS_CORTE1_REPORT_FRONTEND_CONSUMER',
  contractId:contract.id,
  targetFile,
  protectedFiles,
  blockers,
  warnings
};
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(result,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'report.md'),`# Corte 1 report frontend consumer acceptance\n\n- Decision: \`${result.decision}\`\n- Target: \`${targetFile}\`\n- Blockers: ${blockers.length}\n- Warnings: ${warnings.length}\n\n## Blockers\n${blockers.length?blockers.map(x=>`- ${x.code}: observed=${JSON.stringify(x.observed)} expected=${JSON.stringify(x.expected)}`).join('\n'):'- None'}\n\n## Warnings\n${warnings.length?warnings.map(x=>`- ${x.code}: observed=${JSON.stringify(x.observed)} expected=${JSON.stringify(x.expected)}`).join('\n'):'- None'}\n`,'utf8');
console.log(JSON.stringify(result,null,2));
if(blockers.length)process.exit(1);
