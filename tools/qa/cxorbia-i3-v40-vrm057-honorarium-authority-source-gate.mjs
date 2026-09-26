import {execFileSync} from 'node:child_process';

const source=process.argv[2];
if(!/^[0-9a-f]{40}$/.test(source||''))throw new Error('SOURCE_SHA_REQUIRED');
const path='app/adapters/tya-c6-unified-human-runtime-v1.js';
const code=execFileSync('git',['show',source+':'+path],{encoding:'utf8'});
function assert(ok,code){if(!ok)throw new Error('SOURCE_FAILURE:'+code);}

assert(code.includes('function honorariumAuthority(v){'),'VRM057_AUTHORITY_HELPER_MISSING');
assert(code.includes("const hrOwned=!!(CX.data?.previewMeta?.hrAuthority===true"),'VRM057_HR_AUTHORITY_SCOPE_MISSING');
assert(code.includes("if(!hrOwned)return 'project_fallback_allowed';"),'VRM057_INTERNAL_FALLBACK_SCOPE_MISSING');
const fnStart=code.indexOf('function applyProjectFinancialConfiguration(reason){');
const visitStart=code.indexOf('for(const v of arr(CX.data._visitas)){',fnStart);
const postStart=code.indexOf('for(const p of arr(CX.data._posts)){',visitStart);
assert(fnStart>=0&&visitStart>fnStart&&postStart>visitStart,'VRM057_VISIT_BLOCK_MISSING');
const visitBlock=code.slice(visitStart,postStart);
const authorityPos=visitBlock.indexOf('const authority=honorariumAuthority(v);');
const unknownPos=visitBlock.indexOf("if(authority==='hr_unknown'){");
const nullPos=visitBlock.indexOf('v.honorario=null;');
const pendingPos=visitBlock.indexOf("v.honorarioSource='pending_source';");
const knownFalsePos=visitBlock.indexOf('v.honorarioSourceKnown=false;');
const fallbackPos=visitBlock.indexOf('v.honorario=configured;');
assert(authorityPos>=0&&unknownPos>authorityPos,'VRM057_AUTHORITY_NOT_APPLIED_BEFORE_FALLBACK');
assert(nullPos>unknownPos&&pendingPos>nullPos&&knownFalsePos>pendingPos,'VRM057_HR_UNKNOWN_NOT_FAIL_CLOSED');
assert(fallbackPos>unknownPos,'VRM057_PROJECT_FALLBACK_PRECEDES_HR_GUARD');
assert(visitBlock.includes("if(authority==='hr_explicit_known'){"),'VRM057_EXPLICIT_HR_PRESERVATION_MISSING');
assert(code.includes("window.addEventListener('cx:protected-auth-hr-authority-ready',()=>refreshCurrentView('protected_auth_hr_authority_ready'));"),'VRM057_POST_HR_EVENT_PATH_MISSING');
process.stdout.write(JSON.stringify({decision:'PASS_VRM057_HONORARIUM_AUTHORITY_SOURCE_GATE',sourceSha:source,owner:path,externalHrUnknown:'null_pending_source',explicitHr:'preserved',internalProjectFallback:'preserved',production:false})+'\n');
