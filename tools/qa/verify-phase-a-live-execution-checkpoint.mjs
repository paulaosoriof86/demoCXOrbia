#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const contractPath=path.join(root,'backend/contracts/phase-a-live-execution-checkpoint-v1.json');
const registryPath=path.join(root,'backend/contracts/prototype-baseline-registry-v1.json');
const docPath=path.join(root,'app/docs/PHASE-A-LIVE-EXECUTION-CHECKPOINT-TYA-20260713.md');
const fail=m=>{console.error(`CHECKPOINT_FAIL: ${m}`);process.exit(1);};
for(const p of [contractPath,registryPath,docPath]) if(!fs.existsSync(p)) fail(`missing ${path.relative(root,p)}`);
let c,r;
try{c=JSON.parse(fs.readFileSync(contractPath,'utf8'));r=JSON.parse(fs.readFileSync(registryPath,'utf8'));}catch(e){fail(`invalid JSON: ${e.message}`);}
const doc=fs.readFileSync(docPath,'utf8');
if(c.version!=='2.0.0') fail('checkpoint contract version drift');
if(c.baseline?.status!=='accepted_and_empalmed') fail('active baseline not atomic');
if(c.baseline?.activeVersion!==r.activeBaseline?.version) fail('checkpoint/registry baseline mismatch');
if(c.baseline?.sourceZipSha256!==r.activeBaseline?.sourceZipSha256) fail('checkpoint/registry ZIP mismatch');
if(c.candidate?.version!==r.candidate?.version||c.candidate?.status!==r.candidate?.status) fail('candidate state mismatch');
if(c.atomicPromotionPolicy?.invariant!==r.invariant) fail('atomic invariant mismatch');
if(c.plan?.[0]!==c.activeBlock?.id) fail('active block must be first plan item');
if(c.mandatoryCloseSections?.length!==12) fail('mandatory close sections drift');
for(const marker of ['Última candidata aceptada = candidata empalmada = baseline activa','V113','rejected_requires_correction','R21_R23_ATOMIC_AUDIT_EMPALME_V114']) if(!doc.includes(marker)) fail(`missing marker: ${marker}`);
for(const forbidden of ['baseline auditada de continuidad','continuity baseline','dos baselines activas como estado permitido']) if(doc.toLowerCase().includes(forbidden.toLowerCase())) fail(`ambiguous state found: ${forbidden}`);
console.log(JSON.stringify({ok:true,decision:'PASS_PHASE_A_ATOMIC_BASELINE_CHECKPOINT',baseline:c.baseline.activeVersion,candidate:c.candidate.version,candidateStatus:c.candidate.status,activeBlock:c.activeBlock.id},null,2));
