#!/usr/bin/env node
/*
  CXOrbia TyA Phase A — R15G source-safe binding.

  Runs the existing R15F binding and then enforces the canonical context contract:
  tenant tya, project cinepolis, independent period identity, preserved operational
  states and protected shopper references. The transformations deliberately use
  stable semantic tokens instead of formatting-sensitive multiline anchors.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

await import('./tya-source-safe-binding-build-r15f.mjs');

const args = process.argv.slice(2);
const valueOf = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const appDir = path.resolve(valueOf('--app-dir', 'app'));
const adapterSrc = valueOf('--adapter-src', 'adapters/tya-phase-a-source-safe-dev-adapter.js');
const adapterFile = path.join(appDir, adapterSrc);
const outDir = path.resolve(valueOf('--out', '.tmp/source-safe-binding-r15g'));
const fail = message => { console.error(`R15G_BINDING_FAIL: ${message}`); process.exit(1); };
if (!fs.existsSync(adapterFile)) fail(`Generated adapter missing: ${adapterFile}`);

let code = fs.readFileSync(adapterFile, 'utf8');
const replaceOnce = (pattern, replacement, label) => {
  if (!pattern.test(code)) fail(`${label} anchor missing.`);
  code = code.replace(pattern, replacement);
};

replaceOnce(
  /id:'tya',\s*clientName:'TyA',\s*name:'TyA',\s*tagline:'Tenant TyA · Phase A controlada'/,
  "id:'tya', tenantId:'tya', clientName:'TyA', name:'TyA', tagline:'Tenant TyA · Phase A controlada'",
  'tenant identity'
);
replaceOnce(
  /CX\.data\.currentProjectId\s*=\s*latest\s*&&\s*latest\.id;\s*CX\.data\.sourceMode\s*=\s*'tya_hr_live_multitab_source_safe_dev';/,
  "CX.data.currentProjectId = 'cinepolis';\n  CX.data.currentPeriodId = latest && latest.id;\n  CX.data.sourceMode = 'tya_hr_live_multitab_source_safe_dev';",
  'project-period identity'
);
replaceOnce(
  /currentPeriodId:CX\.data\.currentProjectId,/,
  'currentPeriodId:CX.data.currentPeriodId,',
  'visible contract period'
);
replaceOnce(
  /CX\.dataSource\.warnings\s*=\s*shoppers\.length\s*===\s*210\s*\?\s*\[[^;]+?\]\s*:\s*\[\];/,
  "CX.dataSource.warnings = shoppers.length === 216 ? [] : ['Conteo shopper source-safe distinto al snapshot aprobado: ' + shoppers.length + '/216.'];",
  'shopper warning'
);
replaceOnce(
  /tenantId:'tya',\s*projectId:'cinepolis',\s*projectName:'Cinépolis',\s*sourceTitle:/,
  "tenantId:'tya', projectId:'cinepolis', projectName:'Cinépolis', activePeriodId:latest && latest.id, sourceTitle:",
  'preview active period'
);

if (!code.includes('canonicalState:v.canonicalState')) {
  replaceOnce(
    /estado:v\.estado\s*\|\|\s*'disponible',/,
    "estado:v.estado || 'disponible', canonicalState:v.canonicalState || null, operationalState:v.operationalState || null, questionnaireState:v.questionnaireState || null, submissionState:v.submissionState || null, liquidationState:v.liquidationState || null, paymentState:v.paymentState || null, paymentControlOnly:v.paymentControlOnly === true, paymentConfirmed:v.paymentConfirmed === true, paymentSourceRef:v.paymentSourceRef || null, financialControl:v.financialControl || null, liquidationEvidence:v.liquidationEvidence || null, paymentEvidence:v.paymentEvidence || null,",
    'visit state mapping'
  );
}
if (!code.includes("v.submissionState === 'submitted_by_tya'")) {
  replaceOnce(
    /submit:!!v\.submit,\s*submittedAt:v\.submittedAt\s*\|\|\s*null,\s*assignmentSource:v\.hasShopper\s*\?\s*'hr'\s*:\s*null,\s*assignmentSyncStatus:'hr_live_source_safe_preview',\s*reviewRequired:false,/,
    "submit:Boolean(v.submit || v.submittedAt || v.submissionState === 'submitted_by_tya'), submittedAt:v.submittedAt || null, assignmentSource:v.assignmentSource || (v.hasShopper ? 'hr' : null), assignmentSyncStatus:v.assignmentSyncStatus || 'hr_live_source_safe_preview', lastSyncedAt:v.lastSyncedAt || null, reviewRequired:v.reviewRequired === true, reviewReasons:Array.isArray(v.reviewReasons) ? v.reviewReasons : [],",
    'workflow state mapping'
  );
}

const shopperAnchor = "CX.data.currentProgramKey = function(){ return 'cinepolis'; };";
if (!code.includes(shopperAnchor)) fail('currentProgramKey anchor missing.');
if (!code.includes('CX.data.shopperDataLevel = function(shopper)')) {
  const overlay = `${shopperAnchor}\n\n  const baseShopperDataLevel = typeof CX.data_shopperDataLevel === 'function' ? CX.data_shopperDataLevel : null;\n  CX.data_shopperDataLevel = function(shopper){\n    const declared = shopper && shopper.dataLevel;\n    if (declared === 'protected_reference' || declared === 'operational_profile' || declared === 'full_authorized_profile') return declared;\n    return baseShopperDataLevel ? baseShopperDataLevel(shopper) : 'protected_reference';\n  };\n  CX.data.shopperDataLevel = function(shopper){ return CX.data_shopperDataLevel(shopper); };\n  const baseShopperActivo = typeof CX.data.shopperActivo === 'function' ? CX.data.shopperActivo.bind(CX.data) : null;\n  CX.data.shopperActivo = function(shopper){\n    if (CX.data_shopperDataLevel(shopper) === 'protected_reference') return false;\n    return baseShopperActivo ? baseShopperActivo(shopper) : false;\n  };`;
  code = code.replace(shopperAnchor, overlay);
}

const required = [
  "tenantId:'tya', clientName:'TyA'",
  "CX.data.currentProjectId = 'cinepolis';",
  'CX.data.currentPeriodId = latest && latest.id;',
  'currentPeriodId:CX.data.currentPeriodId,',
  'shoppers.length === 216',
  'activePeriodId:latest && latest.id',
  'submissionState:v.submissionState || null',
  'liquidationState:v.liquidationState || null',
  'paymentState:v.paymentState || null',
  "v.submissionState === 'submitted_by_tya'",
  'financialControl:v.financialControl || null',
  "declared === 'protected_reference'",
  "CX.data_shopperDataLevel(shopper) === 'protected_reference'",
  'CX.data.shopperDataLevel = function(shopper)',
  "dataLevel:'protected_reference'",
  'perfilCompleto:false',
  'visitas:undefined'
];
const missing = required.filter(token => !code.includes(token));
if (missing.length) fail(`Canonical invariants missing: ${missing.join(', ')}`);
if (/CX\.data\.currentProjectId\s*=\s*latest\s*&&\s*latest\.id/.test(code)) fail('Period identity still overwrites project identity.');

fs.writeFileSync(adapterFile, code, 'utf8');
fs.mkdirSync(outDir, { recursive:true });
const report = {
  schemaVersion:'1.3.0',
  decision:'PASS_R15G_CANONICAL_CONTEXT_WORKFLOW_AND_SHOPPER_LEVEL_BINDING',
  adapterFile:path.relative(process.cwd(), adapterFile).replaceAll('\\','/'),
  tenantId:'tya', projectId:'cinepolis', periodIdentity:'cinepolis-YYYY-MM', expectedShoppers:216,
  shopperDataLevelPolicy:{explicitDeclarationPrecedence:true,protectedReferenceActive:false,nullPlaceholdersCreateOperationalProfile:false,historicalVisitCountCreatesOperationalProfile:false,adapterRunsAfterShopperStore:true},
  preservedStates:['canonicalState','operationalState','questionnaireState','submissionState','liquidationState','paymentState','financialControl'],
  safeState:{writes:false,imports:false,deploy:false,production:false,providers:false,payments:false,paymentsInferred:false,frontendModulesModified:false,coreFilesModified:false}
};
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify(report,null,2));
