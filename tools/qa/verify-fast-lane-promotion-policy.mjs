#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const registryPath = path.join(root,'backend/contracts/prototype-baseline-registry-v1.json');
const buildLockPath = path.join(root,'app/core/build-lock.js');
const workflowDir = path.join(root,'.github/workflows');
const requiredGateFiles = [
  'tools/qa/verify-prototype-baseline-atomicity.mjs',
  'tools/qa/tya-project-period-kpi-history-gate.mjs',
  'tools/qa/tya-phase-a-source-safe-visual-smoke.mjs',
  'tools/release/tya-phase-a-period-history-integrity-validate.mjs'
];
const fail = message => { console.error(`FAST_LANE_POLICY_FAIL: ${message}`); process.exit(1); };
for(const file of [registryPath,buildLockPath,...requiredGateFiles.map(p=>path.join(root,p))]){
  if(!fs.existsSync(file)) fail(`missing ${path.relative(root,file)}`);
}
const registry = JSON.parse(fs.readFileSync(registryPath,'utf8'));
const build = fs.readFileSync(buildLockPath,'utf8');
const active = registry.activeBaseline || {};
const candidate = registry.candidate || {};
const rule = registry.promotionRule || {};

if(registry.invariant !== 'acceptedCandidateVersion == empalmedVersion == activeBaselineVersion') fail('baseline invariant changed');
if(active.status !== 'accepted_and_empalmed' || active.accepted !== true || active.empalmed !== true) fail('active baseline is not physically accepted and empalmed');
if(!build.includes(active.manifestFile) || !build.includes(active.aggregateSha256) || !build.includes(active.sourceZipSha256)) fail('build lock and active registry differ');
if(rule.forbidSilentRuntimeExclusions !== true) fail('silent runtime exclusions are not forbidden');
if(!Array.isArray(rule.runtimeCandidateOwnedPaths) || rule.runtimeCandidateOwnedPaths.length < 6) fail('runtime ownership paths incomplete');
if(candidate.status === 'accepted_and_empalmed'){
  if(candidate.version !== active.version || candidate.sourceZipSha256 !== active.sourceZipSha256) fail('accepted candidate differs from active baseline');
}else if(candidate.accepted || candidate.empalmed){
  fail('pending/rejected candidate marked accepted or empalmed');
}

const runtimePatterns = [
  /--exclude(?:=|\s+)["']?app\/core(?:\/|\*|["'\s])/i,
  /--exclude(?:=|\s+)["']?app\/modules(?:\/|\*|["'\s])/i,
  /--exclude(?:=|\s+)["']?app\/styles(?:\/|\*|["'\s])/i,
  /--exclude(?:=|\s+)["']?app\/index\.html/i,
  /--exclude(?:=|\s+)["']?app\/app\.js/i,
  /--exclude(?:=|\s+)["']?app\/sw\.js/i
];
const offenders = [];
if(fs.existsSync(workflowDir)){
  for(const name of fs.readdirSync(workflowDir).filter(n=>/\.ya?ml$/i.test(n))){
    const full = path.join(workflowDir,name);
    const text = fs.readFileSync(full,'utf8');
    if(!/git\s+apply/i.test(text)) continue;
    for(const pattern of runtimePatterns){
      if(pattern.test(text)) offenders.push(`${name}:${pattern}`);
    }
  }
}
if(offenders.length) fail(`workflow silently excludes candidate runtime paths: ${offenders.join(', ')}`);

const bridge = fs.readFileSync(path.join(root,'app/core/tya-phase-a-source-safe-preview.js'),'utf8');
for(const token of ['currentProjectId = parentProjectId','currentPeriodId =','stablePeriodId','periodId','parentProjectId']){
  if(!bridge.includes(token)) fail(`TyA project/period overlay missing token: ${token}`);
}
if(/currentProjectId\s*=\s*\(latestPeriod[^\n]*projectId/.test(bridge)) fail('currentProjectId still derives from period row');

console.log(JSON.stringify({
  ok:true,
  decision:'PASS_FAST_LANE_PROMOTION_POLICY',
  activeBaseline:active.version,
  candidate:candidate.version,
  candidateStatus:candidate.status,
  silentRuntimeExclusions:0,
  requiredGates:requiredGateFiles
},null,2));
