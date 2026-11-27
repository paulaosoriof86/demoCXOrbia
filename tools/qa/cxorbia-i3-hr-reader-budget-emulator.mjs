import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {withReaderIdentity,runAdmittedSnapshot,readerTicketKey,admitReaderCall,readReaderOutcome} from '../../backend/runtime/hr-live-service/hr-read-admission.mjs';

// Refuse every network destination except the loopback Firestore emulator.
assert.match(process.env.FIRESTORE_EMULATOR_HOST||'',/^127\.0\.0\.1:[1-9]\d{3,4}$/);
const require=createRequire(new URL('../../backend/runtime/hr-live-service/package.json',import.meta.url));
const {initializeApp,deleteApp}=require('firebase-admin/app'),{getFirestore}=require('firebase-admin/firestore');
const app=initializeApp({projectId:'demo-cxorbia-hr-budget'}),db=getFirestore(app);
const scope={tenantId:'qa',projectId:'synthetic'},bindingKey='a'.repeat(64),revision='b'.repeat(64);
const policy=db.doc('cxorbiaProviderBudgets/dev_make_hr_reader');
const actor='google:synthetic',processName='seal-meta',runId='synthetic-emulator';
const input={...scope,countryCode:'GT',bindingFingerprint:bindingKey,periodId:'synthetic-month',rangeAddress:'A1:B2',
  driveId:'synthetic-drive',itemId:'synthetic-book',worksheetId:'synthetic-sheet'};
const tickets=[readerTicketKey(input)];
const submit=(id,work,who=actor)=>withReaderIdentity({...scope,actor:who,runId,process:processName,requestId:id},
  ()=>runAdmittedSnapshot({db,scope,bindingKey,work}));
let calls=0;
try{
  await policy.create({...scope,enabled:true,windowId:'emulator',bindingKey,expiresAt:Date.now()+300000,
    maxCreditsPerCall:3,protectedAllocation:160,spendingLimit:60,recoveryReserve:100,reserved:0,
    allocationReceiptSha256:'f'.repeat(64),grants:[{actor,process:processName,runId,maxCalls:4,tickets}]});
  const physical=async()=>{await admitReaderCall(input,async()=>++calls);return {revision};};
  await assert.rejects(submit('ordinary',physical,'firebase:ordinary'),/WINDOW_CLOSED/);
  const trials=await Promise.allSettled(Array.from({length:8},(_,i)=>submit('i'+i,physical)));
  const accepted=trials.map((v,i)=>v.status==='fulfilled'?i:null).filter(v=>v!==null);
  assert.equal(accepted.length,5);
  assert.equal((await policy.get()).get('reserved'),60);
  const id='i'+accepted[0],outcome=await readReaderOutcome(db,scope,actor,processName,runId,id);
  assert.equal(outcome.revision,revision);assert.equal(outcome.returned,1);
  await assert.rejects(submit(id,physical),/ATTEMPT_COMPLETE/);
  assert.equal(calls,5);
  console.log(JSON.stringify({schemaVersion:'cxorbia.i3.hr-read-emulator.v1',project:'demo-cxorbia-hr-budget',
    attempted:8,accepted:5,ordinaryDenied:true,maxReserved:60,reserve:100,outcomeReadback:true,
    replayNewInvocations:0,transport:'synthetic',makeCredits:0,production:false}));
}finally{await deleteApp(app);}
