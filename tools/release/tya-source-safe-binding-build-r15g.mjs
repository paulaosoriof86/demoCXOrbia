#!/usr/bin/env node
/* CXOrbia TyA Phase A — canonical R15G overlay over the R15F build copy. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

await import('./tya-source-safe-binding-build-r15f.mjs');

const args=process.argv.slice(2);
const valueOf=(flag,fallback)=>{const i=args.indexOf(flag);return i>=0&&args[i+1]?args[i+1]:fallback;};
const appDir=path.resolve(valueOf('--app-dir','app'));
const adapterSrc=valueOf('--adapter-src','adapters/tya-phase-a-source-safe-dev-adapter.js');
const adapterFile=path.join(appDir,adapterSrc);
const outDir=path.resolve(valueOf('--out','.tmp/source-safe-binding-r15g'));
const fail=m=>{console.error(`R15G_BINDING_FAIL: ${m}`);process.exit(1);};
if(!fs.existsSync(adapterFile)) fail(`Generated adapter missing: ${adapterFile}`);
let code=fs.readFileSync(adapterFile,'utf8');

code=code.replace(/id:'tya',\s*clientName:'TyA'/,"id:'tya', tenantId:'tya', clientName:'TyA'");
code=code.replace(/CX\.data\.currentProjectId\s*=\s*latest\s*&&\s*latest\.id;/,"CX.data.currentProjectId = 'cinepolis';\n  CX.data.currentPeriodId = latest && latest.id;");
code=code.replace(/currentPeriodId:CX\.data\.currentProjectId,/,'currentPeriodId:CX.data.currentPeriodId,');
code=code.replace(/CX\.dataSource\.warnings\s*=\s*shoppers\.length\s*===\s*210\s*\?[^;]+;/,"CX.dataSource.warnings = shoppers.length === 216 ? [] : ['Conteo shopper source-safe distinto al snapshot aprobado: ' + shoppers.length + '/216.'];");
code=code.replace(/tenantId:'tya',\s*projectId:'cinepolis',\s*projectName:'Cinépolis',\s*sourceTitle:/,"tenantId:'tya', projectId:'cinepolis', projectName:'Cinépolis', activePeriodId:latest && latest.id, sourceTitle:");

if(!code.includes('canonicalState:v.canonicalState')){
  code=code.replace(/estado:v\.estado\s*\|\|\s*'disponible',/,"estado:v.estado || 'disponible', canonicalState:v.canonicalState || null, operationalState:v.operationalState || null, questionnaireState:v.questionnaireState || null, submissionState:v.submissionState || null, liquidationState:v.liquidationState || null, paymentState:v.paymentState || null, paymentControlOnly:v.paymentControlOnly === true, paymentConfirmed:v.paymentConfirmed === true, paymentSourceRef:v.paymentSourceRef || null, financialControl:v.financialControl || null, liquidationEvidence:v.liquidationEvidence || null, paymentEvidence:v.paymentEvidence || null,");
}
if(!code.includes("v.submissionState === 'submitted_by_tya'")){
  code=code.replace(/submit:!!v\.submit,\s*submittedAt:v\.submittedAt\s*\|\|\s*null,\s*assignmentSource:v\.hasShopper\s*\?\s*'hr'\s*:\s*null,\s*assignmentSyncStatus:'hr_live_source_safe_preview',\s*reviewRequired:false,/,"submit:Boolean(v.submit || v.submittedAt || v.submissionState === 'submitted_by_tya'), submittedAt:v.submittedAt || null, assignmentSource:v.assignmentSource || (v.hasShopper ? 'hr' : null), assignmentSyncStatus:v.assignmentSyncStatus || 'hr_live_source_safe_preview', lastSyncedAt:v.lastSyncedAt || null, reviewRequired:v.reviewRequired === true, reviewReasons:Array.isArray(v.reviewReasons) ? v.reviewReasons : [],");
}

const shopperAnchor="CX.data.currentProgramKey = function(){ return 'cinepolis'; };";
if(code.includes(shopperAnchor)&&!code.includes('CX.data.shopperDataLevel = function(shopper)')){
  code=code.replace(shopperAnchor,`${shopperAnchor}\n  const baseShopperDataLevel=typeof CX.data_shopperDataLevel==='function'?CX.data_shopperDataLevel:null;\n  CX.data_shopperDataLevel=function(shopper){const declared=shopper&&shopper.dataLevel;if(['protected_reference','operational_profile','full_authorized_profile'].includes(declared))return declared;return baseShopperDataLevel?baseShopperDataLevel(shopper):'protected_reference';};\n  CX.data.shopperDataLevel=function(shopper){return CX.data_shopperDataLevel(shopper);};\n  const baseShopperActivo=typeof CX.data.shopperActivo==='function'?CX.data.shopperActivo.bind(CX.data):null;\n  CX.data.shopperActivo=function(shopper){if(CX.data_shopperDataLevel(shopper)==='protected_reference')return false;return baseShopperActivo?baseShopperActivo(shopper):false;};`);
}

const invariants={
  tenant:code.includes("tenantId:'tya'"),
  project:code.includes("CX.data.currentProjectId = 'cinepolis';"),
  period:code.includes('CX.data.currentPeriodId = latest && latest.id;'),
  visiblePeriod:code.includes('currentPeriodId:CX.data.currentPeriodId,'),
  shopperReference:code.includes("dataLevel:'protected_reference'")&&code.includes('perfilCompleto:false')&&code.includes('visitas:undefined'),
  sourceSafe:code.includes('runtimeSyncActive:false')
};
const failures=Object.entries(invariants).filter(([,v])=>!v).map(([k])=>k);
if(failures.length) fail(`Canonical invariants missing: ${failures.join(', ')}`);
if(/CX\.data\.currentProjectId\s*=\s*latest\s*&&\s*latest\.id/.test(code)) fail('Period identity still overwrites project identity.');

fs.writeFileSync(adapterFile,code,'utf8');
fs.mkdirSync(outDir,{recursive:true});
const report={schemaVersion:'1.3.1',decision:'PASS_R15G_CANONICAL_CONTEXT_WORKFLOW_AND_SHOPPER_LEVEL_BINDING',adapterFile:path.relative(process.cwd(),adapterFile).replaceAll('\\','/'),invariants,shopperDataLevelPolicy:{explicitDeclarationPrecedence:true,protectedReferenceActive:false,historicalVisitCountVisibleAsOperationalFact:false,adapterRunsAfterShopperStore:true},safeState:{writes:false,imports:false,deploy:false,production:false,providers:false,payments:false,frontendModulesModified:false,coreFilesModified:false}};
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify(report,null,2));
