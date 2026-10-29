import assert from 'node:assert/strict';
import {test} from 'node:test';
import {adjudicationContactSelection} from '../../backend/runtime/cxorbia-shopper-command-provider-v1.mjs';

const select=(canonical,aliases=[],keeper={shopperId:'keeper'},canonicalId='canonical',aliasIds=[])=>
  adjudicationContactSelection(canonical,aliases,keeper,canonicalId,aliasIds);

test('GT: +502 and eight digits collapse, phone+whatsapp from one profile vote once',()=>{
  const result=select({pais:'GT',phone:'5555 0000',whatsapp:'+502 5555 0000'},
    [{pais:'Guatemala',whatsapp:'00502 5555-0000'}],{shopperId:'canonical'},'canonical',['alias']);
  assert.equal(result.primaryPhone,'+50255550000');
  assert.equal(result.contactPhoneEvidence[0].sourceCount,2);
  assert.deepEqual(result.contactPhoneEvidence[0].sources.map(x=>x.shopperId),['alias','canonical']);
  assert.deepEqual(result.contactPhoneEvidence[0].sources[1].fields,['phone','whatsapp']);
  assert.equal(result.phoneVerificationRequired,false);
  assert.equal(result.contactReviewAtFirstLogin,true,'All shoppers receive a nonblocking first-login profile-review notice');
});

test('the repeated contact from two independent aliases wins over canonical HR and keeps alternatives',()=>{
  const result=select({pais:'GT',sourceType:'hr_external',phone:'5555 1000'},
    [{pais:'GT',phone:'5555 2000'},{pais:'GT',whatsapp:'+502 5555 2000'}],{},'canonical',['a1','a2']);
  assert.equal(result.primaryPhone,'+50255552000');
  assert.deepEqual(result.alternatePhones,['+50255551000']);
  assert.equal(result.contactPhoneEvidence[0].sourceCount,2);
  assert.equal(result.contactPhoneEvidence[1].sources[0].shopperId,'canonical');
  assert.equal(result.contactReviewAtFirstLogin,true);
});

test('tie resolves deterministically toward verified canonical HR contact, independent of alias order',()=>{
  const canonical={pais:'GT',sourceType:'hr_external',phone:'5555 3000'};
  const a={pais:'GT',phone:'5555 4000'},b={pais:'GT',phone:'5555 5000'};
  const one=select(canonical,[a,b],{shopperId:'a'},'canonical',['a','b']);
  const two=select(canonical,[b,a],{shopperId:'a'},'canonical',['b','a']);
  assert.equal(one.primaryPhone,'+50255553000');
  assert.deepEqual(one,two);
});

test('country dial plans GT, HN, NI and SV accept both local and international forms',()=>{
  for(const [country,dial] of [['GT','502'],['HN','504'],['NI','505'],['SV','503']]){
    const result=select({pais:country,phone:'8888-1234'},[{pais:country,whatsapp:`00${dial}88881234`}],{},'c',['a']);
    assert.equal(result.primaryPhone,`+${dial}88881234`,country);
    assert.equal(result.contactPhoneEvidence[0].sourceCount,2,country);
    assert.equal(result.phoneVerificationRequired,false,country);
  }
});

test('empty contact is permitted but flagged for the first login, with no synthetic number',()=>{
  const result=select({pais:'HN'},[{pais:'HN',phone:''}],{},'canonical',['alias']);
  assert.equal(result.primaryPhone,null);
  assert.deepEqual(result.alternatePhones,[]);
  assert.deepEqual(result.contactPhoneEvidence,[]);
  assert.equal(result.phoneVerificationRequired,true);
});

test('a different valid number never blocks adjudication, and both sources remain traceable',()=>{
  const result=select({pais:'GT',whatsapp:'5555 6666'},[{pais:'GT',phone:'7777 8888'}],{},'canonical',['alias']);
  assert.equal(result.primaryPhone,'+50255556666');
  assert.deepEqual(result.alternatePhones,['+50277778888']);
  assert.deepEqual(result.contactPhoneEvidence.map(x=>x.sources[0].shopperId),['canonical','alias']);
  assert.equal(result.phoneVerificationRequired,true);
});

test('unrecognized or foreign number remains unparsed with provenance, without blocking valid contact',()=>{
  const result=select({pais:'GT',whatsapp:'5555 7777'},[{pais:'GT',phone:'+504 9999 9999'}],{},'canonical',['alias']);
  assert.equal(result.primaryPhone,'+50255557777');
  assert.deepEqual(result.contactPhoneUnparsed[0],{
    shopperId:'alias',sourceType:'shopper_profile',fields:['phone'],rawValues:['+504 9999 9999']});
  assert.equal(result.phoneVerificationRequired,true);
});

test('later fusions reuse historical per-source evidence without duplicating canonical elected phone',()=>{
  const first=select({pais:'GT',phone:'5555 1000'},[{pais:'GT',whatsapp:'5555 2000'}],{},'c',['a']);
  const second=select({pais:'GT',phone:first.primaryPhone,whatsapp:first.primaryPhone,
    contactPhoneEvidence:first.contactPhoneEvidence},[{pais:'GT',phone:'5555 2000'}],{},'c',['b']);
  assert.equal(second.primaryPhone,'+50255552000');
  assert.equal(second.contactPhoneEvidence[0].sourceCount,2);
  assert.deepEqual(second.contactPhoneEvidence[0].sources.map(x=>x.shopperId),['a','b']);
  assert.equal(second.contactPhoneEvidence[1].sourceCount,1);
});

test('canonical recovery seeded from the alias does not count the same profile twice',()=>{
  const alias={pais:'GT',sourceType:'hr_external',phone:'5555 1000'};
  const result=adjudicationContactSelection(alias,[alias],{shopperId:'alias'},'canonical',['alias'],'alias');
  assert.equal(result.primaryPhone,'+50255551000');
  assert.equal(result.contactPhoneEvidence[0].sourceCount,1);
  assert.deepEqual(result.contactPhoneEvidence[0].sources.map(x=>x.shopperId),['alias']);
});
