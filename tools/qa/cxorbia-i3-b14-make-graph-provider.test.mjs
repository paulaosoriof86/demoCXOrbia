import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readExcelPeriodThroughMake,verifyMakeGraphReadOutput,validateGraphColumnMap,withMakeGraphToolboxReader} from '../../backend/runtime/cxorbia-make-graph-provider-v1.mjs';
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

const hrContract = JSON.parse(readFileSync(new URL(
  '../../backend/contracts/tya-hr-column-map-r20-v1.json', import.meta.url
), 'utf8'));

// Only contract labels from the two Graph readbacks; no workbook rows or identifiers.
const sharedColumns = [
  'ID CINEMA', 'CIUDAD', 'DIRECCIÓN ', 'Shopping ', 'Franja Horaria', 'Formato de Cine',
  'Tipo de Combo', 'Tipo de Compra', 'Método de Pago', 'Quincena', 'Shopper Asignado',
  'Teléfono', 'Mail', 'Disponible a partir de', 'Fecha  programada', 'Control día s/ franja horaria',
  'Fecha  realizada', 'Fecha Cuestionario \ncompletado', 'Precio de boleto', 'Precio de combo',
  'Honorarios', 'Fecha  submitido'
];

test('Honduras uses the explicit country column when the same header also matches the compact layout', () => {
  const header = ['País', ...sharedColumns];
  const proof = validateGraphColumnMap([header], hrContract, 'HN');
  assert.equal(proof.headerVariant, 'full_identity');
  assert.equal(proof.countryAuthority, 'provider_column');
});

test('Guatemala retains the compact layout when the country column is absent', () => {
  const proof = validateGraphColumnMap([[], [], [], sharedColumns], hrContract, 'GT');
  assert.equal(proof.headerRow, 4);
  assert.equal(proof.headerVariant, 'tab_scoped_compact');
  assert.equal(proof.countryAuthority, 'verified_country_binding');
});

test('two distinct header rows remain ambiguous even when both match the same contract', () => {
  const header = ['País', ...sharedColumns];
  assert.throws(() => validateGraphColumnMap([header, [], header], hrContract, 'HN'),
    /B14_HEADER_AMBIGUOUS_OR_MISSING/);
});

test('toolbox transport retains independent Graph read and binding verification',async()=>{
  const seen=[];
  const result=await readExcelPeriodThroughMake({binding,columnMap:contract,runScenario:async inputs=>{seen.push(inputs);return output();}});
  assert.equal(seen.length,1);
  assert.equal(result.proof.externalRevisionIndependentlyVerified,true);
  await assert.rejects(readExcelPeriodThroughMake({binding,columnMap:contract,runScenario:async()=>({...output(),countryCode:'HN'})}),/B14_RESPONSE_SCOPE_MISMATCH/);
});

import { resolveCountryHrPeriodBinding } from '../../backend/runtime/cxorbia-country-hr-binding-v1.mjs';
test('the original verification registry is project bound and cannot select the operational source',async()=>{
 const scope={tenantId:'tenant',projectId:'project',countryCode:'GT',periodId:'period'};
 const active={mode:'external',providerType:'google_sheets',providerBindingId:'mirror',mappingRef:'map',readPolicy:'external_live',writePolicy:'external_read_only'};
 const docs={
  'tenants/tenant/projects/project':{tenantId:'tenant',projectId:'project',countries:['GT'],operationalSource:active},
  'tenants/tenant/integrationSettings/mirror':{tenantId:'tenant',projectId:'project',...active,enabled:true,hrWritesEnabled:false,originalReadbackBindings:[{countryCode:'GT',providerBindingId:'original-gt',mappingRef:'map'}]},
  'tenants/tenant/integrationSettings/original-gt':{tenantId:'tenant',projectId:'project',countryCode:'GT',providerType:'excel_online',purpose:'original_readback',enabled:true,hrWritesEnabled:false,readPolicy:'external_live',writePolicy:'external_read_only',mappingRef:'map',providerBindingId:'original-gt',itemId:'item',driveId:'drive',periodSheets:[{periodId:'period',worksheetId:'sheet',worksheetName:'Noviembre'}]}
 };
 const db={doc:key=>({get:async()=>({exists:Boolean(docs[key]),data:()=>docs[key],updateTime:{seconds:1,nanoseconds:0}})})};
 await assert.rejects(resolveCountryHrPeriodBinding({db,...scope}),/SOURCE_POLICY/);
 const proof=await resolveCountryHrPeriodBinding({db,...scope,purpose:'original_readback'});
 assert.equal(proof.privateProvider.itemId,'item');assert.equal(proof.proof.hrWrites,false);
 await assert.rejects(resolveCountryHrPeriodBinding({db,...scope,countryCode:'HN',purpose:'original_readback'}),/COUNTRY_NOT_ASSIGNED/);
 docs['tenants/tenant/integrationSettings/original-gt'].projectId='foreign';
 await assert.rejects(resolveCountryHrPeriodBinding({db,...scope,purpose:'original_readback'}),/INTEGRATION_SCOPE/);
});


function toolboxFixture(){
 const events=[],seen=[],tool={name:'authorized-reader',annotations:{readOnlyHint:true},inputSchema:{properties:Object.fromEntries(['bindingFingerprint','worksheetId','driveId','itemId','periodId'].map(k=>[k,{}]))}};
 const client={connect:async()=>{events.push('connect');},listTools:async()=>{events.push('list');return {tools:[tool]};},
  callTool:async request=>{seen.push(request.arguments);return {structuredContent:{outputs:{...output(),...request.arguments}}};},close:async()=>{events.push('close');}};
 return {events,seen,tool,client};
}
test('38 live country-period reads share one authenticated toolbox session and keep all independent read proofs',async()=>{
 const f=toolboxFixture(),scopes=Array.from({length:38},(_,i)=>({...binding,scope:{...binding.scope,countryCode:i%2?'HN':'GT',periodId:'period-'+i}}));
 const result=await withMakeGraphToolboxReader({client:f.client,transport:{}},async runScenario=>{
  const out=[];for(let i=0;i<scopes.length;i+=4)out.push(...await Promise.all(scopes.slice(i,i+4).map(b=>readExcelPeriodThroughMake({binding:b,columnMap:contract,runScenario}))));return out;
 });
 assert.deepEqual(f.events,['connect','list','close']);assert.equal(f.seen.length,38);assert.equal(new Set(f.seen.map(x=>x.periodId+'|'+x.countryCode)).size,38);
 assert.equal(result.every(r=>r.proof.externalRevisionIndependentlyVerified===true&&r.proof.hrWrites===0),true);
});
test('a second refresh performs new remote reads and a new authenticated session',async()=>{
 const f=toolboxFixture();for(let i=0;i<2;i++)await withMakeGraphToolboxReader({client:f.client,transport:{}},runScenario=>readExcelPeriodThroughMake({binding,columnMap:contract,runScenario}));
 assert.deepEqual(f.events,['connect','list','close','connect','list','close']);assert.equal(f.seen.length,2);
});
test('shared reader refuses a write-capable tool and closes without calls',async()=>{
 const f=toolboxFixture();f.tool.annotations.readOnlyHint=false;
 await assert.rejects(withMakeGraphToolboxReader({client:f.client,transport:{}},run=>run({})),/B14_TOOLBOX_CONTRACT/);assert.equal(f.seen.length,0);assert.deepEqual(f.events,['connect','list','close']);
});
test('shared reader drains in-flight requests before closing after a failure',async()=>{
 const f=toolboxFixture();let finish,started,closed=false;const slow=new Promise(r=>{finish=r;}),ready=new Promise(r=>{started=r;});
 f.client.callTool=async({arguments:a})=>{if(a.slow){started();await slow;return {structuredContent:{ok:true}};}await ready;throw new Error('fixture transport failure');};
 f.client.close=async()=>{closed=true;f.events.push('close');};
 const run=withMakeGraphToolboxReader({client:f.client,transport:{}},call=>Promise.all([call({slow:true}),call({slow:false})]));
 await ready;await Promise.resolve();assert.equal(closed,false);finish();await assert.rejects(run,/fixture transport failure/);assert.equal(closed,true);
});
test('runtime shares the toolbox at full snapshot scope without weakening freshness checks',()=>{
 const src=readFileSync(new URL('../../backend/runtime/hr-live-service/server.mjs',import.meta.url),'utf8');
 assert.match(src,/withOriginalToolboxReader\(runScenario=>readExcelOriginalProjectSnapshot/);
 assert.match(src,/readBinding:countryPeriod=>readExcelPeriodThroughMake\(\{binding:countryPeriod,columnMap,runScenario\}\)/);
 assert.match(src,/EXCEL_BINDING_CHANGED_DURING_READ/);assert.match(src,/EXCEL_OPERATIONAL_SCOPE_DRIFT/);
});
