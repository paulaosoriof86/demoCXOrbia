import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const DESCRIPTOR='CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json';
const LEDGER='CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_2026-09-24.json';
const WORKFLOW='.github/workflows/cxorbia-recovery-i3-dev-certification.yml';

const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const fail=(code,detail)=>{throw new Error(code+(detail?':'+detail:''));};
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));

const d=readJson(DESCRIPTOR);
const l=readJson(LEDGER);

if(d.schemaVersion!=='cxorbia.i3.canonical-candidate-descriptor.v1')fail('MAPPING_FAILURE:CANDIDATE_DESCRIPTOR_SCHEMA');
if(d.branch!=='recovery/cxorbia-phase-a-20260831')fail('SOURCE_FAILURE:CANDIDATE_BRANCH');
if(d.production!=='DO_NOT_TOUCH')fail('RELEASE_COMPOSITION_FAILURE:PRODUCTION_POLICY');
if(d.findingsLedgerPath!==LEDGER)fail('RELEASE_COMPOSITION_FAILURE:LEDGER_POINTER');

git('cat-file','-e',d.productSourceSha+'^{commit}');
git('cat-file','-e',d.predecessorProductSourceSha+'^{commit}');
try{execFileSync('git',['merge-base','--is-ancestor',d.predecessorProductSourceSha,d.productSourceSha]);}
catch{fail('RELEASE_COMPOSITION_FAILURE:NON_MONOTONIC_PRODUCT_SUCCESSOR');}
try{execFileSync('git',['merge-base','--is-ancestor',d.productSourceSha,'HEAD']);}
catch{fail('RELEASE_COMPOSITION_FAILURE:PRODUCT_SOURCE_NOT_ANCESTOR_OF_CONTROL_HEAD');}

const productTree=git('rev-parse',d.productSourceSha+'^{tree}');
const postCandidateDrift=git('diff','--name-only',d.productSourceSha,'HEAD','--','app','backend','firebase.json','.firebaserc','firestore.rules','storage.rules','tools/hr-source');
if(postCandidateDrift)fail('RELEASE_COMPOSITION_FAILURE:UNDECLARED_PRODUCT_DRIFT_AFTER_CANONICAL_CANDIDATE',postCandidateDrift.replace(/\n/g,','));

if(l.schemaVersion!=='cxorbia.i3.canonical-cumulative-findings-ledger.full.v1')fail('MAPPING_FAILURE:FULL_LEDGER_SCHEMA');
const ids=Object.keys(l.findings||{}).sort();
if(ids.length!==41||ids[0]!=='VRM-001'||ids[40]!=='VRM-041')fail('RELEASE_COMPOSITION_FAILURE:FINDING_LEDGER_COVERAGE',JSON.stringify({count:ids.length,first:ids[0],last:ids.at(-1)}));
if(l.governance?.nextFindingId!=='VRM-042')fail('MAPPING_FAILURE:NEXT_FINDING_ID');
if(l.canonicalFunctionalCandidate?.sourceSha!==d.productSourceSha)fail('RELEASE_COMPOSITION_FAILURE:LEDGER_DESCRIPTOR_SOURCE_MISMATCH');

const wf=fs.readFileSync(WORKFLOW,'utf8');
if(/^\s*I3_CERTIFICATION_SOURCE_SHA:\s*[a-f0-9]{40}\s*$/m.test(wf))fail('RELEASE_COMPOSITION_FAILURE:TOP_LEVEL_LEGACY_PRODUCT_SOURCE_AUTHORITY');
if(/^\s*I3_CERTIFICATION_SOURCE_TREE:\s*[a-f0-9]{40}\s*$/m.test(wf))fail('RELEASE_COMPOSITION_FAILURE:TOP_LEVEL_LEGACY_PRODUCT_TREE_AUTHORITY');

const jobs={};
const lines=wf.split(/\r?\n/);
let current=null;
for(const line of lines){
  const m=line.match(/^  ([A-Za-z0-9_-]+):\s*$/);
  if(m){current=m[1];jobs[current]=[];continue;}
  if(current)jobs[current].push(line);
}
const historicalDisabled=[
  'pre-i4-human-entrypoint-dev',
  'pre-i4-finance-p0-hosting-fix',
  'pre-i4-module-truth-closure',
  'pre-i4-postdeploy-readback',
  'pre-i4-human-semantic-remediation',
  'pre-i4-resource-rules-fix',
  'pre-i4-human-semantic-focal-only',
  'pre-i4-vrm040-hosting-fix'
];
for(const id of historicalDisabled){
  const body=(jobs[id]||[]).slice(0,12).join('\n');
  if(!/if:\s*\$\{\{\s*false\s*\}\}/.test(body))fail('RELEASE_COMPOSITION_FAILURE:HISTORICAL_JOB_STILL_EXECUTABLE',id);
}

const active=['canonical-candidate-authority','certify','live-fixtures','gate21','pre-i4-vrm037-diagnostic'];
const sourceAssignment=/\b(?:PRODUCT_SOURCE|SEM_SOURCE|CXORBIA_PREI4_SOURCE_SHA|I3_CERTIFICATION_SOURCE_SHA)\s*[:=]\s*['"]?([a-f0-9]{40})/g;
for(const id of active){
  const body=(jobs[id]||[]).join('\n');
  let m;while((m=sourceAssignment.exec(body)))fail('RELEASE_COMPOSITION_FAILURE:ACTIVE_JOB_LOCAL_PRODUCT_SOURCE',id+':'+m[1]);
  if(/CXORBIA_PREI4_SOURCE_SHA:\s*\$\{\{\s*github\.sha\s*\}\}/.test(body)||/PRODUCT_SOURCE:\s*\$\{\{\s*github\.sha\s*\}\}/.test(body))fail('RELEASE_COMPOSITION_FAILURE:ACTIVE_JOB_GITHUB_SHA_AS_PRODUCT_AUTHORITY',id);
}

const result={
  decision:'PASS_I3_SINGLE_CANONICAL_CANDIDATE_AUTHORITY',
  productSourceSha:d.productSourceSha,
  productSourceTree:productTree,
  predecessorProductSourceSha:d.predecessorProductSourceSha,
  findingCount:ids.length,
  nextFindingId:l.governance.nextFindingId,
  postCandidateProductDrift:false,
  historicalSourceSpecificJobsDisabled:historicalDisabled.length,
  production:false
};
process.stdout.write(JSON.stringify(result,null,2)+'\n');
