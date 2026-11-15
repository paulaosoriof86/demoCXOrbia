import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {collectTenantAdjudications,currentHrPeriodId,representativeHrExpectation,representativeMatchesHr} from './cxorbia-i3-terminal-human-contract.mjs';
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
