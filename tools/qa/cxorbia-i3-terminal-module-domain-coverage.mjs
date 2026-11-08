import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

// The historical module registry has 20 domains; November's independently
// accepted tenant configuration/branding domain is the twenty-first.
export const HISTORICAL_REGISTRY_PATH='CXORBIA_CANONICAL_MODULE_REGISTRY_2026-09-18.json';
export const ADDITIONAL_APPROVED_DOMAIN='tenant-admin-config-branding';

export function assertCanonicalModuleCoverage(modules,{registryPath=HISTORICAL_REGISTRY_PATH}={}){
  const registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));
  const baseline=(registry.modules||[]).map(x=>String(x.domain||''));
  if(baseline.length!==20||new Set(baseline).size!==20||baseline.includes(ADDITIONAL_APPROVED_DOMAIN))
    throw new Error('RELEASE_COMPOSITION_FAILURE:C3_HISTORICAL_REGISTRY_UNEXPECTED');
  const required=[...baseline,ADDITIONAL_APPROVED_DOMAIN];
  const actual=(Array.isArray(modules)?modules:[]).map(x=>String(x.domain||''));
  const uniq=new Set(actual),need=new Set(required);
  if(actual.length!==21||uniq.size!==21||actual.some(domain=>!need.has(domain))||required.some(domain=>!uniq.has(domain)))
    throw new Error('RELEASE_COMPOSITION_FAILURE:C3_CANONICAL_21_DOMAIN_SET:'+JSON.stringify({expected:required,actual}));
  return {moduleCount:21,domains:required,matchModules:modules.filter(x=>x.classification==='MATCH').length};
}
export function assertAllModulesAccepted(modules){
  const pending=modules.filter(x=>x.classification!=='MATCH').map(x=>({domain:x.domain,classification:x.classification}));
  if(pending.length)throw new Error('FUNCTIONAL_DEFECT:C3_UNCERTIFIED_MODULES:'+JSON.stringify(pending));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const [, ,file,mode]=process.argv;
  if(!file)throw new Error('ENVIRONMENT_FAILURE:C3_MODULE_MATRIX_PATH_MISSING');
  const matrix=JSON.parse(fs.readFileSync(file,'utf8'));
  const coverage=assertCanonicalModuleCoverage(matrix.modules);
  if(mode==='--require-match')assertAllModulesAccepted(matrix.modules);
  console.log(JSON.stringify({decision:coverage.matchModules===21?'PASS_C3_21_MODULE_COVERAGE':'HOLD_C3_MODULE_ACCEPTANCE',...coverage,nonMatchModules:21-coverage.matchModules,production:false},null,2));
}
