import test from 'node:test';
import assert from 'node:assert/strict';
import {readExcelPeriodThroughMake,verifyMakeGraphReadOutput,validateGraphColumnMap} from '../../backend/runtime/cxorbia-make-graph-provider-v1.mjs';
const contract={contractId:'test-mapping',headerVariants:[{id:'full',required:['País','ID CINEMA','Shopping'],countrySource:'column'}],
 columns:{pais:{aliases:['País'],critical:true},idCinema:{aliases:['ID CINEMA'],critical:true},shopping:{aliases:['Shopping'],critical:true}}};
const values=[['País','ID CINEMA','Shopping'],['GT','001','Cine Test']];
const binding={scope:{tenantId:'t',projectId:'project',countryCode:'GT',periodId:'period'},
 proof:{providerType:'excel_online',readPolicy:'external_live',writePolicy:'external_read_only',hrWrites:false,bindingFingerprint:'a'.repeat(64)},
 privateProvider:{driveId:'drive',itemId:'item',mappingRef:'test-mapping',worksheets:[{worksheetId:'sheet',scenarioKey:'s1'}]}};
const output=()=>({tenantId:'t',projectId:'project',countryCode:'GT',periodId:'period',bindingFingerprint:'a'.repeat(64),
 worksheetId:'sheet',rangeAddress:'A1:AI140',status1:200,status2:200,rowCount1:2,rowCount2:2,hash1:'b'.repeat(64),hash2:'b'.repeat(64),values1:values,values2:structuredClone(values)});
const call=async(out=output(),opts={})=>{
 const requests=[];const fetchImpl=async (url,input)=>{requests.push({url,input});return {ok:true,status:200,json:async()=>({status:'1',executionId:'c'.repeat(32),outputs:out})};};
 const result=await readExcelPeriodThroughMake({binding,token:'test-secret',scenarioId:'10200465',columnMap:contract,fetchImpl,...opts});
 return {result,requests};
};
test('Make delegated provider GET scope verified twice, no PII in public proof',async()=>{
 const {result,requests}=await call();assert.equal(result.proof.worksheetCount,1);assert.equal(result.proof.externalRevisionIndependentlyVerified,true);
 assert.equal(result.privateProviderRows[0].values.length,2);assert.equal(result.proof.worksheetProofs[0].matchedFields,3);
 assert.equal(JSON.stringify(result.proof).includes('Cine Test'),false);assert.equal(JSON.stringify(result.proof).includes('drive'),false);
 assert.equal(requests.length,1);const p=JSON.parse(requests[0].input.body);assert.equal(p.responsive,true);
 assert.equal(p.data.tenantId,'t');assert.equal(p.data.worksheetId,'sheet');assert.equal(requests[0].input.method,'POST');
});
test('foreign source and worksheet identity are rejected',()=>{
 for(const changed of [{countryCode:'HN'},{projectId:'foreign'},{bindingFingerprint:'x'.repeat(64)},{worksheetId:'foreign'}]){
 const r={...output(),...changed};assert.throws(()=>verifyMakeGraphReadOutput(r,{...binding.scope,bindingFingerprint:binding.proof.bindingFingerprint},binding.privateProvider.worksheets[0],'A1:AI140',contract),/B14_RESPONSE_SCOPE_MISMATCH/);
 }
});
test('remote content drift, empty ACK and missing critical headers fail closed',()=>{
 assert.throws(()=>verifyMakeGraphReadOutput({...output(),rowCount2:3,values2:[...values,['GT','002','Other']]},{...binding.scope,bindingFingerprint:binding.proof.bindingFingerprint},binding.privateProvider.worksheets[0],'A1:AI140',contract),/B14_INDEPENDENT_SOURCE_REVISION_CONFLICT/);
 assert.throws(()=>verifyMakeGraphReadOutput({...output(),status1:403},{...binding.scope,bindingFingerprint:binding.proof.bindingFingerprint},binding.privateProvider.worksheets[0],'A1:AI140',contract),/B14_GRAPH_ACK_MISSING/);
 assert.throws(()=>validateGraphColumnMap([['No','Map'],['x','y']],contract,'GT'),/B14_HEADER_AMBIGUOUS_OR_MISSING/);
});
test('source access gate refuses missing delegated token and forbidden write policy',async()=>{
 await assert.rejects(readExcelPeriodThroughMake({binding,scenarioId:'10200465',columnMap:contract}),/B14_MAKE_API_TOKEN_MISSING/);
 await assert.rejects(readExcelPeriodThroughMake({binding:{...binding,proof:{...binding.proof,writePolicy:'bidirectional_gated'}},token:'t',scenarioId:'10200465',columnMap:contract}),/B14_SOURCE_POLICY/);
});
