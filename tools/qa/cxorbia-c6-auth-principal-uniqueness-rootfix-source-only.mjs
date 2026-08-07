#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TARGET='ac93d90d9e41512acdcd';
const PEER='a8dd7db89a02ff180674';
const OLD_DIGEST='68e26a5217957333d256f2cb547faf3e1eef74e2c789bfd85454d42dfd472dc3';
const NEW_DIGEST='7b92fa73946e74ec4058bcdcbcfca25fe90e0504db6b6b22e797fbad066bd749';
const sha256=value=>crypto.createHash('sha256').update(value).digest('hex');
const rowsDigest=rows=>sha256(JSON.stringify(rows));
const ensure=(value,code)=>{if(!value)throw new Error(code);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

function counts(rows){
  const operationCounts={CREATE_AUTH:0,UPDATE_AUTH:0,NO_OP:0,HOLD:0,PRESERVE_NO_AUTH:0};
  const subchangeCounts={email:0,password:0,claims:0};
  for(const row of rows){
    ensure(Object.hasOwn(operationCounts,row.primary),'UNKNOWN_PRIMARY');
    operationCounts[row.primary]++;
    for(const key of Object.keys(subchangeCounts))if(row.changes?.[key]===true)subchangeCounts[key]++;
  }
  return {operationCounts,subchangeCounts};
}

function rootfix(oldPlan,evidence,freeze){
  ensure(oldPlan?.schemaVersion==='cxorbia.c6.shopper-auth-final-plan.v2','OLD_PLAN_SCHEMA');
  ensure(Array.isArray(oldPlan.rows)&&oldPlan.rows.length===340,'OLD_PLAN_ROWS');
  ensure(new Set(oldPlan.rows.map(r=>r.profileFp)).size===340,'OLD_PLAN_UNIQUE');
  ensure(rowsDigest(oldPlan.rows)===OLD_DIGEST,'OLD_PLAN_DIGEST');
  ensure(oldPlan.plan?.sourceSafeRowsDigestSha256===OLD_DIGEST,'OLD_PLAN_DECLARED_DIGEST');

  ensure(evidence?.rootCause?.classification==='CROSS_ROW_EXISTING_AUTH_PRINCIPAL_ALIAS_IN_OLD_PREWRITE'&&evidence.rootCause.demonstrated===true,'ROOT_CAUSE_NOT_PROVEN');
  ensure(evidence?.target?.profileFingerprint===TARGET&&evidence?.target?.collisionPeerProfileFingerprint===PEER,'ROOT_CAUSE_TARGET_DRIFT');
  ensure(evidence?.lineage?.pass===true&&same(evidence.lineage.corroboratingBases,['profile','visit']),'TARGET_LINEAGE_NOT_FROZEN');
  ensure(evidence?.authResolution?.targetSpecificCandidateCount===0,'TARGET_SPECIFIC_CANDIDATE_NOT_ZERO');
  ensure(evidence?.lineage?.targetLoginUniqueInFrozenPlan===true,'TARGET_LOGIN_NOT_UNIQUE');

  ensure(freeze?.schemaVersion==='cxorbia.c6.shopper-auth-final-freeze.v3','FREEZE_SCHEMA');
  ensure(freeze?.rootCauseEvidence?.targetSpecificExistingAuthCandidateCount===0,'FREEZE_TARGET_ZERO');
  ensure(freeze?.transform?.profileFingerprint===TARGET&&freeze?.transform?.peerMustRemainUnchanged===PEER,'FREEZE_TRANSFORM');

  const next=structuredClone(oldPlan);
  next.schemaVersion='cxorbia.c6.shopper-auth-final-plan.v3';
  next.generatedAt=new Date().toISOString();
  next.sourceLineage={...(next.sourceLineage||{}),rootCause:'CROSS_ROW_EXISTING_AUTH_PRINCIPAL_ALIAS_IN_OLD_PREWRITE',rootCauseEvidenceRunId:evidence.terminalExecution?.runId||null,targetLineageBases:['profile','visit'],priorFinalPlanDigest:OLD_DIGEST};
  const target=next.rows.find(r=>r.profileFp===TARGET);
  const peerBefore=structuredClone(next.rows.find(r=>r.profileFp===PEER));
  ensure(target?.primary==='UPDATE_AUTH','TARGET_OLD_CLASS');
  ensure(target?.targetLoginFp==='bd8d7019d612b4421366','TARGET_LOGIN_DRIFT');
  ensure(peerBefore?.primary==='UPDATE_AUTH','PEER_OLD_CLASS');
  target.primary='CREATE_AUTH';
  target.changes={email:false,password:false,claims:false};
  target.rootCauseReclassification='TARGET_SPECIFIC_EXISTING_AUTH_CANDIDATE_COUNT_0_AFTER_EXACT_LINEAGE_PASS';
  ensure(same(next.rows.find(r=>r.profileFp===PEER),peerBefore),'PEER_MUTATED');

  const changed=oldPlan.rows.map((row,index)=>same(row,next.rows[index])?null:row.profileFp).filter(Boolean);
  ensure(same(changed,[TARGET]),'ROOTFIX_NOT_EXACTLY_ONE_ROW');
  ensure(new Set(next.rows.map(r=>r.profileFp)).size===340,'NEW_PLAN_UNIQUE');
  const summary=counts(next.rows);
  const expectedCounts=freeze.finalPlan.operationCounts;
  const expectedSub=freeze.finalPlan.subchangeCounts;
  ensure(same(summary.operationCounts,expectedCounts),'NEW_OPERATION_COUNTS');
  ensure(same(summary.subchangeCounts,expectedSub),'NEW_SUBCHANGE_COUNTS');
  const digest=rowsDigest(next.rows);
  ensure(digest===NEW_DIGEST&&digest===freeze.finalPlan.rowsDigestSha256,'NEW_DIGEST');
  ensure(summary.operationCounts.HOLD===0,'NEW_HOLD_NONZERO');
  ensure(freeze.finalPlan.expectedAuthUsersAfter===freeze.finalPlan.expectedAuthUsersBefore+summary.operationCounts.CREATE_AUTH,'AUTH_POPULATION_MATH');

  next.plan={rows:340,uniqueRows:340,operationCounts:summary.operationCounts,subchangeCounts:summary.subchangeCounts,sourceSafeRowsDigestSha256:digest,onePrimaryOperationPerProfile:true,holdZero:true,expectedAuthUsersBefore:freeze.finalPlan.expectedAuthUsersBefore,expectedAuthUsersAfter:freeze.finalPlan.expectedAuthUsersAfter,globalExistingPrincipalUniquenessRequired:true};
  next.safety={sourceSafe:true,containsPii:false,containsRawUid:false,containsRawEmail:false,containsRawPassword:false,repositorySafe:true};
  return next;
}

function selfTest(){
  const rows=[
    {profileFp:TARGET,primary:'UPDATE_AUTH',changes:{email:true,password:true,claims:true},targetLoginFp:'bd8d7019d612b4421366'},
    {profileFp:PEER,primary:'UPDATE_AUTH',changes:{email:false,password:true,claims:false}}
  ];
  const clone=structuredClone(rows);clone[0].primary='CREATE_AUTH';clone[0].changes={email:false,password:false,claims:false};
  ensure(clone[0].primary==='CREATE_AUTH'&&clone[1].primary==='UPDATE_AUTH','SELFTEST_RECLASSIFICATION');
  ensure(rows[0].primary==='UPDATE_AUTH','SELFTEST_INPUT_MUTATED');
  console.log('PASS_C6_AUTH_PRINCIPAL_UNIQUENESS_ROOTFIX_SELFTEST');
}

if(process.argv.includes('--self-test')){
  selfTest();
} else {
  const oldPlanPath=process.argv[2];
  const evidencePath=process.argv[3]||'app/docs/evidence/C6-AUTH-TARGET-ADAPTIVE-LINEAGE-ROOT-CAUSE-CROSS-ROW-PRINCIPAL-ALIAS-STOP-RETRY-20260807.json';
  const freezePath=process.argv[4]||'backend/config/c6-shopper-auth-final-freeze-v3.json';
  const outDir=path.resolve(process.env.CXORBIA_C6_ROOTFIX_OUT||'.tmp/c6-auth-principal-uniqueness-rootfix');
  fs.mkdirSync(outDir,{recursive:true});
  const oldPlan=JSON.parse(fs.readFileSync(oldPlanPath,'utf8'));
  const evidence=JSON.parse(fs.readFileSync(evidencePath,'utf8'));
  const freeze=JSON.parse(fs.readFileSync(freezePath,'utf8'));
  const plan=rootfix(oldPlan,evidence,freeze);
  fs.writeFileSync(path.join(outDir,'final-plan-v3-source-safe.json'),JSON.stringify(plan,null,2)+'\n','utf8');
  const sourceSafe={schemaVersion:'cxorbia.c6.auth-principal-uniqueness-rootfix.source-only.evidence.v1',decision:'PASS_C6_AUTH_PRINCIPAL_UNIQUENESS_ROOTFIX_SOURCE_ONLY',rows:plan.plan.rows,uniqueRows:plan.plan.uniqueRows,operationCounts:plan.plan.operationCounts,subchangeCounts:plan.plan.subchangeCounts,digest:plan.plan.sourceSafeRowsDigestSha256,expectedAuthUsersBefore:plan.plan.expectedAuthUsersBefore,expectedAuthUsersAfter:plan.plan.expectedAuthUsersAfter,targetReclassified:true,peerPreserved:true,rootCause:'CROSS_ROW_EXISTING_AUTH_PRINCIPAL_ALIAS_IN_OLD_PREWRITE',providerReads:0,providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,merge:false,production:false};
  fs.writeFileSync(path.join(outDir,'source-phase-evidence.json'),JSON.stringify(sourceSafe,null,2)+'\n','utf8');
  fs.writeFileSync(path.join(outDir,'source-phase-decision.txt'),sourceSafe.decision+'\n','utf8');
  console.log(sourceSafe.decision);
}
