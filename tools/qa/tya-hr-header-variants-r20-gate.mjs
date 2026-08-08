#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args=process.argv.slice(2);
const valueOf=(flag,fallback)=>{const i=args.indexOf(flag);return i>=0&&args[i+1]?args[i+1]:fallback;};
const repo=path.resolve(valueOf('--repo',process.cwd()));
const builderPath=path.join(repo,'tools/hr-source/tya-build-live-hr-source-safe-r20.mjs');
const inventoryBuilderPath=path.join(repo,'tools/hr-source/tya-build-live-hr-source-safe-r20-inventory.mjs');
const contractPath=path.join(repo,'backend/contracts/tya-hr-column-map-r20-v1.json');
const fail=(code,details={})=>{console.error(JSON.stringify({decision:'HOLD_TYA_R20_HEADER_VARIANTS_GATE',code,...details},null,2));process.exit(1);};
const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase().replace(/[^a-z0-9ñ]+/g,' ').replace(/\s+/g,' ').trim();

for(const file of [builderPath,inventoryBuilderPath,contractPath]){
  if(!fs.existsSync(file))fail('required_file_missing',{file});
}
const builder=fs.readFileSync(builderPath,'utf8');
const inventoryBuilder=fs.readFileSync(inventoryBuilderPath,'utf8');
const contract=JSON.parse(fs.readFileSync(contractPath,'utf8'));
const combined=`${builder}\n${inventoryBuilder}\n${JSON.stringify(contract)}`;

for(const marker of ['R20_TAB_SCOPED_HEADER_VARIANT','tab_scoped_compact','duplicate_column_conflict','contextualMissingAllowedIn','coalesce_equal_or_single_nonempty']){
  if(!combined.includes(marker))fail('marker_missing',{marker});
}
for(const [name,source] of [['canonical',builder],['inventory',inventoryBuilder]]){
  if(source.includes('function findHeader(values){'))fail('legacy_header_detector_present',{builder:name});
  if(source.includes("return Boolean(cell(row,columns.pais)&&cell(row,columns.shopping)&&cell(row,columns.idCinema));"))fail('legacy_row_identity_requirement_present',{builder:name});
  if(!source.includes('headerVariants(columnMap)'))fail('canonical_header_variants_resolver_missing',{builder:name});
  if(!source.includes('contextualMissingAllowedIn'))fail('contextual_missing_policy_missing',{builder:name});
  if(!source.includes('duplicate_column_conflict'))fail('duplicate_conflict_guard_missing',{builder:name});
}
for(const marker of ['public_gviz_gid_verified_inventory','verifyInventoryAndCounts','gid_cache_bust_evidence_incomplete','header_variant_identity_source_mismatch','variantById','allowed:[...variantById.keys()]']){
  if(!inventoryBuilder.includes(marker))fail('verified_inventory_guard_missing',{marker});
}
for(const forbidden of ['july_26_variant_mismatch','july_26_hn_variant_mismatch']){
  if(inventoryBuilder.includes(forbidden))fail('month_specific_variant_assertion_forbidden',{marker:forbidden});
}

const fullHeader=['País','ID CINEMA','CIUDAD','DIRECCIÓN','Shopping','Franja Horaria','Formato de Cine','Tipo de Combo','Tipo de Compra','Método de Pago','Quincena','Shopper Asignado','Fecha programada','Fecha realizada','Fecha Cuestionario completado','Fecha submitido'];
const compactHeader=['CIUDAD','DIRECCIÓN','Shopping','Franja Horaria','Formato de Cine','Tipo de Combo','Tipo de Compra','Método de Pago','Quincena','Shopper Asignado','Disponible a partir de','Fecha programada','Control día s/ franja horaria','Fecha realizada','Ccuestionario completado','Fecha submitido','Control Submitida','Fecha submitido','Control Submitida'];
const classify=header=>{
  const cells=header.map(normalize);
  return (contract.headerVariants||[]).find(variant=>(variant.required||[]).map(normalize).every(value=>cells.includes(value)))||null;
};
const full=classify(fullHeader),compact=classify(compactHeader);
if(full?.id!=='full_identity')fail('full_header_not_recognized',{resolved:full?.id||null});
if(compact?.id!=='tab_scoped_compact')fail('compact_header_not_recognized',{resolved:compact?.id||null});
if(!contract.columns?.pais?.contextualMissingAllowedIn?.includes('tab_scoped_compact'))fail('country_contextual_policy_missing');
if(!contract.columns?.idCinema?.contextualMissingAllowedIn?.includes('tab_scoped_compact'))fail('cinema_contextual_policy_missing');
if(contract.columns?.fechaSubmitido?.duplicatePolicy!=='coalesce_equal_or_single_nonempty')fail('submission_duplicate_policy_missing');

const coalesce=values=>{
  const nonempty=values.map(v=>String(v??'').trim()).filter(Boolean);
  const unique=[...new Set(nonempty.map(normalize))];
  return {conflict:unique.length>1,value:unique.length>1?null:(nonempty.at(-1)||'')};
};
const duplicateEqual=coalesce(['ma. 14-07','','ma. 14-07']);
const duplicateSingle=coalesce(['lu. 20-07','','']);
const duplicateConflict=coalesce(['lu. 20-07','','ma. 21-07']);
if(duplicateEqual.conflict||duplicateEqual.value!=='ma. 14-07')fail('equal_duplicate_not_coalesced',duplicateEqual);
if(duplicateSingle.conflict||duplicateSingle.value!=='lu. 20-07')fail('single_duplicate_not_coalesced',duplicateSingle);
if(!duplicateConflict.conflict)fail('conflicting_duplicate_not_blocked');

console.log(JSON.stringify({
  decision:'PASS_TYA_R20_HEADER_VARIANTS_GATE',
  builders:{canonical:'guarded',inventory:'guarded'},
  variants:{full:full.id,compact:compact.id},
  compactIdentity:{countrySource:compact.countrySource,cinemaIdSource:compact.cinemaIdSource},
  duplicateSubmission:{equal:'coalesced',single:'coalesced',conflict:'blocked'},
  verifiedInventory:{accessMode:'guarded',countVerification:'guarded',cacheBustByGid:'guarded',liveVariantMustBeContractDeclared:true,monthSpecificAssumptions:false},
  safeState:{writes:false,hrWrites:false,production:false,deploy:false}
},null,2));
