import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {collectTenantAdjudications,tenantAdjudicationReceiptRefs,currentHrPeriodId,representativeHrExpectation,representativeMatchesHr} from './cxorbia-i3-terminal-human-contract.mjs';
const link=()=>({id:'link-proof',tenantId:'tenant-a',projectScope:'project-a',canonicalShopperId:'canonical-a',
  sourceIdentityKey:'first-alias',exactAliases:['first-alias','second-alias'],sourceAliases:['first-alias','second-alias'],
  status:'active',authorityType:'tenant_adjudication',authorityRef:'durable-receipt',providerAck:true,
  humanConfirmed:true,fuzzyMatching:false,sourceSafe:true});
const scope={tenantId:'tenant-a',projectId:'project-a'};
test('confirmed provider exact aliases reach the existing tenant adjudication check',()=>{
  const result=collectTenantAdjudications([link()],scope);
  assert.equal(result.targets['second-alias'],'canonical-a');
  assert.ok(result.evidence.some(x=>x.sourceId==='second-alias'&&x.matchedTokenField==='exactAliases'&&x.providerAck));
  assert.deepEqual(result.rejected,[]);
});
for(const [field,value] of [['providerAck',false],['humanConfirmed',false],['fuzzyMatching',true],['authorityRef','']])
test('new alias requires its confirmed provider authority: '+field,()=>{
  const result=collectTenantAdjudications([{...link(),[field]:value}],scope);
  assert.equal(result.targets['second-alias'],undefined);
});
for(const change of [{tenantId:'foreign'},{projectScope:'foreign'},{status:'inactive'},{authorityType:'provider_auto_compatible'},{sourceSafe:false}])
test('untrusted or out-of-scope adjudication is rejected '+JSON.stringify(change),()=>{
  assert.equal(Object.keys(collectTenantAdjudications([{...link(),...change}],scope).targets).length,0);
});
test('conflicting links and crosswalks cannot be approved by last-write-wins',()=>{
  let result=collectTenantAdjudications([link(),{...link(),canonicalShopperId:'other'}],scope);
  assert.equal(result.targets['second-alias'],undefined);assert.ok(result.rejected.length);
  result=collectTenantAdjudications([link()],{...scope,crossTargets:new Map([['second-alias',new Set(['other'])]])});
  assert.equal(result.targets['second-alias'],undefined);
  assert.equal(collectTenantAdjudications([link()],{...scope,crossTargets:new Map([['second-alias',new Set(['canonical-a'])]])}).targets['second-alias'],'canonical-a');
});
test('tenant-wide project scope is accepted but foreign and period-limited aliases are not',()=>{
  assert.equal(collectTenantAdjudications([{...link(),projectScope:'*'}],scope).targets['second-alias'],'canonical-a');
  assert.equal(collectTenantAdjudications([{...link(),projectScope:'',projectId:'foreign-project'}],scope).targets['second-alias'],undefined);
  for(const field of ['periodId','periodKey','periodScope'])
    assert.equal(collectTenantAdjudications([{...link(),[field]:'old-period'}],scope).targets['second-alias'],undefined);
});
function historicalFixture(target='canonical-a',ref='a'.repeat(40)){
  const old={...link(),schemaVersion:'cxorbia.shopper-identity-link.v1',canonicalShopperId:target,
    periodIndependent:true,authorityRef:ref,adjudicationId:ref,createdAt:'2026-10-04T15:05:00.000Z'};
  delete old.providerAck;
  old.id='irl_'+crypto.createHash('sha256').update(['tenant-a','project-a',target,...old.exactAliases.slice().sort()].join('\0')).digest('hex').slice(0,32);
  old.identityLinkId=old.id;old._documentPath='tenants/tenant-a/shopperIdentityLinks/'+old.id;
  const receipt={id:ref,path:'tenants/tenant-a/commandReceipts/'+ref,exists:true,data:{status:'committed',
    providerAck:true,commandType:'shopper.identity.adjudicate',shopperId:target,identityLinkId:old.id,
    identityConsolidated:true,commandDigest:'c'.repeat(64),updatedAt:'2026-10-04T15:05:10.000Z'}};
  return {old,receipt,commandReceipts:new Map([[ref,receipt]])};
}
test('historical absent link ACK resolves only through its exact committed receipt and bound alias set',()=>{
  const f=historicalFixture(),result=collectTenantAdjudications([f.old],{...scope,commandReceipts:f.commandReceipts});
  assert.equal(result.targets['second-alias'],'canonical-a');
  const proof=result.evidence.find(x=>x.sourceId==='second-alias');
  assert.equal(proof.providerAck,true);assert.deepEqual(proof.linkProviderAck,{present:false,value:null});
  assert.equal(proof.providerAckEvidence.mode,'REFERENCED_COMMITTED_COMMAND_RECEIPT');
  assert.equal(proof.providerAckEvidence.exactAliasSetBoundToLinkId,true);
  assert.equal(proof.providerAckEvidence.payloadDigestRecomputed,false);
  assert.deepEqual(tenantAdjudicationReceiptRefs([f.old,f.old],scope),[f.old.authorityRef]);
  assert.equal(collectTenantAdjudications([f.old],scope).targets['second-alias'],undefined);
});
for(const value of [false,null,'true',undefined])test('present link ACK never uses historical fallback: '+String(value),()=>{
  const f=historicalFixture();f.old.providerAck=value;
  assert.equal(collectTenantAdjudications([f.old],{...scope,commandReceipts:f.commandReceipts}).targets['second-alias'],undefined);
  assert.deepEqual(tenantAdjudicationReceiptRefs([f.old],scope),[]);
});
for(const delta of [{exists:false},{id:'other'},{path:'tenants/other/commandReceipts/'+'a'.repeat(40)},
  {path:'tenants/tenant-a/other/'+'a'.repeat(40)}])test('receipt transport metadata must be exact '+JSON.stringify(delta),()=>{
  const f=historicalFixture();Object.assign(f.receipt,delta);
  assert.equal(collectTenantAdjudications([f.old],{...scope,commandReceipts:f.commandReceipts}).targets['second-alias'],undefined);
});
for(const delta of [{status:'pending'},{commandType:'shopper.profile.update'},{providerAck:false},{providerAck:'true'},
  {identityConsolidated:false},{identityLinkId:'other'},{shopperId:'other'},{commandDigest:'bad'},
  {tenantId:'other'},{projectId:'other'},{scope:{tenantId:'other'}},{scope:{periodId:'old'}}])
test('unrelated or incomplete receipt cannot authorize an alias '+JSON.stringify(delta),()=>{
  const f=historicalFixture();Object.assign(f.receipt.data,delta);
  assert.equal(collectTenantAdjudications([f.old],{...scope,commandReceipts:f.commandReceipts}).targets['second-alias'],undefined);
});
for(const mutate of [x=>x.exactAliases.push('invented'),x=>x.sourceAliases.push('invented'),
  x=>{x.exactAliases.push('invented');x.sourceAliases.push('invented');},x=>x.id='payload-id',
  x=>delete x._documentPath,x=>x.adjudicationId='b'.repeat(40),x=>x.periodIndependent=false,
  x=>x.scope={projectId:'other'},x=>x.scope={tenantId:'other'},x=>x.scope={periodScope:'old'},
  x=>x.state='inactive',x=>x.sourceSafe=false])test('historical alias authority rejects mutation '+mutate.toString(),()=>{
  const f=historicalFixture();mutate(f.old);
  assert.equal(collectTenantAdjudications([f.old],{...scope,commandReceipts:f.commandReceipts}).targets['second-alias'],undefined);
});
test('historical receipt authority preserves link and exact crosswalk conflict rejection',()=>{
  const a=historicalFixture(),b=historicalFixture('canonical-b','b'.repeat(40));
  const commandReceipts=new Map([...a.commandReceipts,...b.commandReceipts]);
  assert.equal(collectTenantAdjudications([a.old,b.old],{...scope,commandReceipts}).targets['second-alias'],undefined);
  assert.equal(collectTenantAdjudications([a.old],{...scope,commandReceipts,
    crossTargets:new Map([['second-alias',new Set(['canonical-a','canonical-b'])]])}).targets['second-alias'],undefined);
});
const revision='f'.repeat(64),periodId='period-current';
const input={visits:[{shopperId:'first-alias',periodKey:'2026-10'}],periods:[{id:periodId,periodKey:'2026-11'}],
  periodId,canonicalShopperId:'canonical-a',resolve:id=>id==='first-alias'?'canonical-a':id,revision};
const routes=['midia','miperfil','misvisitas','beneficios'].map(id=>({id,ok:true}));
const observed=()=>({identity:true,authority:true,nameRendered:true,country:'GT',key:'canonical-a',revision,periodId,
  confirmedHistory:1,history:1,confirmedCurrentVisits:0,pendingCurrentVisits:0,currentVisits:0});
test('zero current visits passes only when independent pinned HR also has zero',()=>{
  const expected=representativeHrExpectation(input);assert.equal(expected.expectedCurrentVisits,0);
  assert.equal(representativeMatchesHr(observed(),expected,routes),true);
});
test('pinned HR periods use key while frontend periods may use periodKey',()=>{
  const expected=representativeHrExpectation({...input,periods:[{id:periodId,key:'2026-11'}]});
  assert.equal(expected.periodKey,'2026-11');
  assert.equal(representativeMatchesHr(observed(),expected,routes),true);
});
test('the expected current period comes from external HR, never the observed UI period',()=>{
  const hr={source:{currentCalendarPeriodKey:'2026-11'},periods:[{id:periodId,key:'2026-11'},{id:'period-previous',key:'2026-10'}]};
  const expected=representativeHrExpectation({...input,periods:hr.periods,periodId:currentHrPeriodId(hr)});
  assert.equal(expected.periodId,periodId);
  assert.equal(representativeMatchesHr({...observed(),periodId:'period-previous',currentVisits:1,confirmedCurrentVisits:1},expected,routes),false);
  assert.throws(()=>currentHrPeriodId({...hr,source:{currentCalendarPeriodKey:'missing'}}),/CURRENT_PERIOD_NOT_EXACT/);
});
test('missing or invented current visits fail the same HR expectation',()=>{
  const expected=representativeHrExpectation({...input,visits:[{shopperId:'first-alias',periodKey:'2026-11'}]});
  assert.equal(representativeMatchesHr(observed(),expected,routes),false);
  assert.equal(representativeMatchesHr({...observed(),confirmedCurrentVisits:1,currentVisits:1},representativeHrExpectation(input),routes),false);
});
test('pending platform assignment is recorded separately and is not represented as HR confirmed',()=>{
  const expected=representativeHrExpectation(input);
  assert.equal(representativeMatchesHr({...observed(),history:2,currentVisits:1,pendingCurrentVisits:1},expected,routes),true);
  assert.equal(representativeMatchesHr({...observed(),currentVisits:1},expected,routes),false);
});
test('revision, period, identity, history and every required route remain mandatory',()=>{
  const expected=representativeHrExpectation(input);
  for(const delta of [{revision:'e'.repeat(64)},{periodId:'other'},{key:'other'},{identity:false},{authority:false},{confirmedHistory:0}])
    assert.equal(representativeMatchesHr({...observed(),...delta},expected,routes),false);
  assert.equal(representativeMatchesHr(observed(),expected,[]),false);
  assert.equal(representativeMatchesHr(observed(),expected,routes.slice(1)),false);
  assert.throws(()=>representativeHrExpectation({...input,periodId:'unknown'}),/PERIOD_NOT_EXACT/);
});
test('live acceptance uses these predicates and records name-free adjudication evidence',()=>{
  const source=fs.readFileSync('RECOVERY-I3-HUMAN-LIVE-ACCEPTANCE-20260918.mjs','utf8');
  assert.match(source,/collectTenantAdjudications\(links/);
  assert.match(source,/representativeHrExpectation\(/);
  assert.match(source,/periodId:currentHrPeriodId\(hr\)/);
  assert.match(source,/representativeMatchesHr\(st,expected,routeChecks\)/);
  assert.match(source,/tenant-adjudication-authority\.json/);
  assert.doesNotMatch(source,/st\.currentVisits>0/);
});
