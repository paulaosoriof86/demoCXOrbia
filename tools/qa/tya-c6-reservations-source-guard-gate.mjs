import fs from 'node:fs';import vm from 'node:vm';
const file=process.argv[2]||'app/adapters/tya-canonical-reservations-guard-v2.js';const src=fs.readFileSync(file,'utf8');const assertions=[];const assert=(name,ok)=>{assertions.push({name,ok});if(!ok)process.exitCode=1;};
try{new vm.Script(src,{filename:file});assert('syntax',true);}catch(e){assert('syntax',false);}
assert('canonical_period_model',src.includes('CX.data?.period?.()?.periodKey')&&src.includes('CX.data?.currentPeriodId'));
assert('browser_localstorage_not_source',src.includes('browserLocalStorageAsSource:false')&&!src.includes('localStorage.getItem'));
assert('fixtures_disabled',src.includes('CX.reservas._seed=()=>[]'));
assert('mutations_fail_closed',src.includes("blocked('reserve')")&&src.includes("blocked('cross_assignment')")&&src.includes('mutationsEnabled:false'));
assert('protected_or_empty_source',src.includes('CX.data?.__protectedReservations')&&src.includes("source:'protected_canonical_or_empty'"));
assert('no_provider_calls',!src.includes('fetch(')&&!src.includes('firebase.')&&!src.includes('writeBack('));
assert('human_copy_honest',src.includes('fuente canónica pendiente')&&src.includes('read-only'));
const report={schemaVersion:'cxorbia.c6.reservations-source-guard-gate.v1',decision:assertions.every(a=>a.ok)?'PASS_C6_CANONICAL_RESERVATIONS_SOURCE_GUARD':'FAIL_C6_CANONICAL_RESERVATIONS_SOURCE_GUARD',assertions,safety:{providerWrites:0,firestoreWrites:0,authWrites:0,hrWrites:0,deploys:0,production:false,merge:false}};console.log(JSON.stringify(report,null,2));if(process.exitCode)throw new Error(report.decision);
