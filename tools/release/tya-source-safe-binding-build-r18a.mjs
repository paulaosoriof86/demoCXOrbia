#!/usr/bin/env node
/*
  CXOrbia TyA Phase A — R18A compatibility entrypoint with R21 tenant/login and
  postulation-eligibility binding.

  R21 is applied to the generated build adapter only. The wrapper uses stable
  regular-expression anchors and explicit postconditions so whitespace changes
  in R15G cannot silently disable the binding. No UI source module or core
  source file is modified.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
if (!args.includes('--adapter-src')) {
  process.argv.push('--adapter-src', 'adapters/tya-phase-a-source-safe-dev-adapter-r18a.js');
}

await import('./tya-source-safe-binding-build-r15g.mjs');

const appDirIndex = process.argv.indexOf('--app-dir');
const appDir = path.resolve(appDirIndex >= 0 && process.argv[appDirIndex + 1] ? process.argv[appDirIndex + 1] : 'app');
const adapterIndex = process.argv.indexOf('--adapter-src');
const adapterSrc = adapterIndex >= 0 && process.argv[adapterIndex + 1]
  ? process.argv[adapterIndex + 1]
  : 'adapters/tya-phase-a-source-safe-dev-adapter-r18a.js';
const adapterFile = path.join(appDir, adapterSrc);
if (!fs.existsSync(adapterFile)) throw new Error(`R18A generated adapter missing: ${adapterFile}`);

const profileFile=path.resolve('backend/config/tya-tenant-runtime-profile.source-safe.json');
if(!fs.existsSync(profileFile))throw new Error(`Tenant profile missing: ${profileFile}`);
const profile=JSON.parse(fs.readFileSync(profileFile,'utf8'));
if(profile.tenantId!=='tya'||profile.safeState?.sourceSafe!==true)throw new Error('Tenant profile identity/source-safe mismatch.');
const roleMap={client_portal:'cliente',coordinator:'coordinador',partner:'aliado'};
const visibleRoles=(profile.login?.visibleRoles||[]).map(role=>roleMap[role]||role);
const hiddenRoles=(profile.login?.hiddenRoles||[]).map(role=>roleMap[role]||role);
const fail=message=>{throw new Error(`R18A R21 binding HOLD: ${message}`);};
const replaceRequired=(source,pattern,replacement,label)=>{
  if(!pattern.test(source))fail(`${label} anchor missing`);
  return source.replace(pattern,replacement);
};

let code = fs.readFileSync(adapterFile, 'utf8');
const danglingLegacyWarning = " 3 referencias continúan en revisión.'] : [];";
if (code.includes(danglingLegacyWarning)) code = code.replace(danglingLegacyWarning, '');

if(!code.includes('availabilityState:v.availabilityState')){
  code=replaceRequired(
    code,
    /operationalState:v\.operationalState\s*\|\|\s*null,\s*assignmentState:/,
    "operationalState:v.operationalState || null, availabilityState:v.availabilityState || null, availabilityDependency:v.availabilityDependency || null, availableFromRaw:v.availableFromRaw ?? v.disponibleDesde ?? null, measurementWindowId:v.measurementWindowId || null, measurementWindowLabel:v.measurementWindowLabel || v.quincena || null, measurementWindowStart:v.measurementWindowStart || null, measurementWindowEnd:v.measurementWindowEnd || null, franjaRaw:v.franjaRaw ?? v.franja ?? null, franjaCode:v.franjaCode || null, assignmentState:",
    'visit projection'
  );
}

const profilePattern=/visibleLoginRoles:\[[^\]]*\],\s*hiddenLoginRoles:\[[^\]]*\],\s*showCountryFlags:true,\s*allowShopperRegistration:true,\s*sourceSafe:true,\s*runtimePersisted:false/;
if(!code.includes('roleTestAreaLabel:')){
  code=replaceRequired(
    code,
    profilePattern,
    `visibleLoginRoles:${JSON.stringify(visibleRoles)}, hiddenLoginRoles:${JSON.stringify(hiddenRoles)}, showRoleTestArea:${profile.login?.showRoleTestArea===true}, roleTestAreaLabel:${JSON.stringify(profile.login?.roleTestAreaLabel||'Accesos de validación')}, clientPortalVisible:${profile.login?.clientPortalVisible===true}, showCountryFlags:${profile.countryFlags?.show!==false}, allowShopperRegistration:${profile.login?.allowShopperSelfRegistration!==false}, configurationSurface:${JSON.stringify(profile.configurationSurface||{})}, sourceSafe:true, runtimePersisted:false`,
    'tenant profile'
  );
}

if(!code.includes('const available=c.available===true')){
  code=replaceRequired(
    code,
    /const c=v&&v\.canonicalFacets\|\|\{\};\s*const assigned=c\.assigned===true\s*\|\|\s*\(v&&v\.assignmentState==='assigned'\);/,
    "const c=v&&v.canonicalFacets||{};\n    const available=c.available===true || (v&&v.availabilityState==='eligible_from_date') || (v&&v.estado==='disponible');\n    const eligibilityBlocked=c.eligibilityBlocked===true || (v&&String(v.availabilityState||'').startsWith('blocked_'));\n    const assigned=c.assigned===true || (v&&v.assignmentState==='assigned');",
    'visit facets'
  );
}

if(!code.includes('return {available,eligibilityBlocked,assigned')){
  code=replaceRequired(
    code,
    /return \{assigned,scheduled,realized,questionnaire,submitted,liquidationCandidate,liquidationConfirmed,paymentConfirmed,outOfRange:c\.outOfRange===true\|\|v\?\.outOfRange===true,cancelled:c\.cancelled===true\|\|v\?\.estado==='cancelada'\};/,
    "return {available,eligibilityBlocked,assigned,scheduled,realized,questionnaire,submitted,liquidationCandidate,liquidationConfirmed,paymentConfirmed,outOfRange:c.outOfRange===true||v?.outOfRange===true,cancelled:c.cancelled===true||v?.estado==='cancelada'};",
    'visit facets return'
  );
}

const summaryAnchor='CX.data.periodOperationalSummary=Array.isArray(snapshot.periodOperationalSummary)?snapshot.periodOperationalSummary:[];';
if(!code.includes('R21_POSTULATION_ELIGIBILITY_CONTRACT')){
  code=replaceRequired(
    code,
    new RegExp(summaryAnchor.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),
    `/* R21_POSTULATION_ELIGIBILITY_CONTRACT — reusable for external/internal route sources. */
  CX.data.postulationEligibility=function(v,proposedDate){
    const reasons=[];
    const iso=value=>/^20\\d{2}-[01]\\d-[0-3]\\d$/.test(String(value||''));
    const date=String(proposedDate||'');
    if(!v)return {ok:false,reasons:['visit_missing'],sourceType:null};
    const facets=this.visitFacets(v);
    if(facets.assigned)reasons.push('visit_already_assigned');
    if(facets.eligibilityBlocked)reasons.push(v.availabilityState||'eligibility_blocked');
    if(!iso(v.disponibleDesde))reasons.push('available_from_missing_or_invalid');
    if(!iso(date))reasons.push('proposed_date_invalid');
    if(iso(v.disponibleDesde)&&iso(date)&&date<v.disponibleDesde)reasons.push('before_available_from');
    if(iso(v.measurementWindowStart)&&iso(date)&&date<v.measurementWindowStart)reasons.push('before_measurement_window');
    if(iso(v.measurementWindowEnd)&&iso(date)&&date>v.measurementWindowEnd)reasons.push('after_measurement_window');
    if(iso(date)){
      const day=new Date(date+'T12:00:00Z').getUTCDay();
      const weekend=day===0||day===6;
      if(v.franjaCode==='WKND'&&!weekend)reasons.push('requires_weekend');
      if(v.franjaCode==='WK'&&weekend)reasons.push('requires_weekday');
    }
    return {ok:reasons.length===0,reasons:[...new Set(reasons)],availableFrom:v.disponibleDesde||null,measurementWindowStart:v.measurementWindowStart||null,measurementWindowEnd:v.measurementWindowEnd||null,franjaCode:v.franjaCode||null,sourceType:v.hrSourceType||snapshot.projectConfig?.hrSourceType||snapshot.source?.type||null};
  };
  CX.data.availableVisits=function(pool){return (Array.isArray(pool)?pool:(this._visitas||[])).filter(v=>{const f=this.visitFacets(v);return f.available&&!f.assigned&&!f.cancelled;});};
  ${summaryAnchor}`,
    'period summary'
  );
}

if(!code.includes("testLabel.textContent=CX.tenantProfile.roleTestAreaLabel")){
  code=replaceRequired(
    code,
    /const login=document\.getElementById\('login'\);if\(!login\)return;\s*login\.querySelectorAll\('\[data-role\]'\)\.forEach\(el=>\{el\.style\.display=allowed\.has\(el\.dataset\.role\)\?'':'none';\}\);/,
    "const login=document.getElementById('login');if(!login)return;\n      login.querySelectorAll('[data-role]').forEach(el=>{el.style.display=allowed.has(el.dataset.role)?'':'none';});\n      const testLabel=[...login.querySelectorAll('div')].find(el=>String(el.textContent||'').trim()==='Probar acceso por rol (matriz de permisos)'||String(el.textContent||'').trim()==='Accesos de validación');\n      if(testLabel){testLabel.textContent=CX.tenantProfile.roleTestAreaLabel||'Accesos de validación';const wrap=testLabel.parentElement;if(wrap)wrap.style.display=CX.tenantProfile.showRoleTestArea===false?'none':'';}\n      const reg=login.querySelector('#goReg');if(reg)reg.style.display=CX.tenantProfile.allowShopperRegistration===false?'none':'';",
    'login visibility'
  );
}

const requiredMarkers=[
  'availabilityState:v.availabilityState',
  'measurementWindowStart:v.measurementWindowStart',
  'franjaCode:v.franjaCode',
  'roleTestAreaLabel:',
  'const available=c.available===true',
  'return {available,eligibilityBlocked,assigned',
  'R21_POSTULATION_ELIGIBILITY_CONTRACT',
  'CX.data.postulationEligibility=function',
  'CX.data.availableVisits=function',
  "testLabel.textContent=CX.tenantProfile.roleTestAreaLabel"
];
for(const marker of requiredMarkers)if(!code.includes(marker))fail(`postcondition missing: ${marker}`);

fs.writeFileSync(adapterFile, code, 'utf8');

const check = spawnSync(process.execPath, ['--check', adapterFile], { encoding:'utf8' });
if (check.status !== 0) {
  const outIndex = process.argv.indexOf('--out');
  const outDir = path.resolve(outIndex >= 0 && process.argv[outIndex + 1] ? process.argv[outIndex + 1] : '.tmp/source-safe-binding-r18a');
  fs.mkdirSync(outDir, { recursive:true });
  fs.writeFileSync(path.join(outDir, 'generated-adapter-syntax-error.txt'), String(check.stderr || check.stdout || 'unknown syntax error'), 'utf8');
  fs.copyFileSync(adapterFile, path.join(outDir, 'generated-adapter-failed.source-safe.js'));
  throw new Error(`R18A generated adapter syntax HOLD: ${String(check.stderr || check.stdout).trim()}`);
}

console.log(JSON.stringify({
  decision:'PASS_R18A_R21_TENANT_LOGIN_ELIGIBILITY_BINDING_SYNTAX',
  adapterFile:path.relative(process.cwd(),adapterFile).replaceAll('\\','/'),
  tenantProfile:profileFile.replaceAll('\\','/'),
  visibleRoles,
  hiddenRoles,
  showRoleTestArea:profile.login?.showRoleTestArea===true,
  postulationEligibilityContract:true,
  stableRegexAnchors:true,
  legacyWarningFragmentRemoved:!code.includes(danglingLegacyWarning),
  safeState:{writes:false,imports:false,deploy:false,production:false,providers:false,payments:false,frontendModulesModified:false,coreFilesModified:false}
}, null, 2));
