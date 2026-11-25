import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readExcelWorksheetInventoryThroughMake,readExcelPeriodThroughMake,verifyMakeGraphReadOutput,validateGraphColumnMap,withMakeGraphToolboxReader,withMakeGraphToolboxWriter} from '../../backend/runtime/cxorbia-make-graph-provider-v1.mjs';
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
test('source access gate refuses missing delegated token and an unsupported source policy',async()=>{
 await assert.rejects(readExcelPeriodThroughMake({binding,scenarioId:'10200465',columnMap:contract}),/B14_MAKE_API_TOKEN_MISSING/);
 await assert.rejects(readExcelPeriodThroughMake({binding:{...binding,proof:{...binding.proof,writePolicy:'platform_only'}},token:'t',scenarioId:'10200465',columnMap:contract}),/B14_SOURCE_POLICY/);
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
function writerFixture(){
 const f=toolboxFixture();f.tool.name='authorized-writer';f.tool.annotations={readOnlyHint:false};
 f.tool.inputSchema.properties=Object.fromEntries(['protocolVersion','operation','eventId','eventDigest','fieldKey','periodId','bindingFingerprint'].map(k=>[k,{}]));
 return f;
}
for(const mode of ['false','omitted-hint','omitted-annotations'])test('writer accepts MCP hint '+mode+' while invoking the exact advertised tool',async()=>{
 const f=writerFixture();if(mode==='omitted-hint')delete f.tool.annotations.readOnlyHint;if(mode==='omitted-annotations')delete f.tool.annotations;
 await withMakeGraphToolboxWriter({client:f.client,transport:{}},run=>run({eventId:'synthetic-event'}));
 assert.deepEqual(f.seen,[{eventId:'synthetic-event'}]);assert.deepEqual(f.events,['connect','list','close']);
});
for(const hint of [true,null,'false',0])test('writer rejects incompatible hint '+JSON.stringify(hint)+' without remote call',async()=>{
 const f=writerFixture();f.tool.annotations.readOnlyHint=hint;
 await assert.rejects(withMakeGraphToolboxWriter({client:f.client,transport:{}},run=>run({})),/MAPPING_FAILURE:B14_WRITER_TOOLBOX_CONTRACT/);
 assert.equal(f.seen.length,0);assert.deepEqual(f.events,['connect','list','close']);
});
for(const mode of ['missing-key','cursor','two-tools'])test('writer preserves exact schema and inventory gate '+mode,async()=>{
 const f=writerFixture();if(mode==='missing-key')delete f.tool.inputSchema.properties.eventDigest;
 if(mode==='cursor')f.client.listTools=async()=>({tools:[f.tool],nextCursor:'another-page'});
 if(mode==='two-tools')f.client.listTools=async()=>({tools:[f.tool,f.tool]});
 await assert.rejects(withMakeGraphToolboxWriter({client:f.client,transport:{}},run=>run({})),/B14_WRITER_TOOLBOX_CONTRACT/);assert.equal(f.seen.length,0);
});
for(const [method,code]of [['connect','INITIALIZE'],['listTools','LISTTOOLS'],['callTool','REQUEST_UNCERTAIN']])test('writer failure remains bounded at '+method,async()=>{
 const f=writerFixture();f.client[method]=async()=>{throw Error('Bearer PRIVATE_SECRET https://private.example/row');};
 await assert.rejects(withMakeGraphToolboxWriter({client:f.client,transport:{}},run=>run({})),e=>e.message==='PROVIDER_FAILURE:B14_WRITER_TOOLBOX_'+code);
 assert.equal(f.events.at(-1),'close');
});
test('reader still requires an explicit readonly annotation',async()=>{
 const f=toolboxFixture();delete f.tool.annotations.readOnlyHint;
 await assert.rejects(withMakeGraphToolboxReader({client:f.client,transport:{}},run=>run({})),/B14_TOOLBOX_CONTRACT/);assert.equal(f.seen.length,0);
});
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

test('F3 explicitly gated project can use the same read-only delegated reader without writes',async()=>{
 const {result,requests}=await call(output(),{binding:{...binding,proof:{...binding.proof,writePolicy:'bidirectional_gated'}}});
 assert.equal(result.proof.hrWrites,0);assert.equal(result.proof.providerWriteRequests,0);assert.equal(result.proof.externalRevisionIndependentlyVerified,true);
 assert.equal(requests.length,1);assert.equal(JSON.parse(requests[0].input.body).data.operation,undefined);
});

test('metadata inventory uses actual ReturnData names and proves both independent responses complete',async()=>{
 const sheets=[{id:'sheet',name:'NOVIEMBRE 26',visibility:'Visible'}];let input;
 const out={...output(),inventory1:sheets,inventory2:structuredClone(sheets),inventoryComplete1:true,inventoryComplete2:true};
 const read=await readExcelWorksheetInventoryThroughMake({binding,runScenario:async data=>{input=data;return out;}});
 assert.equal(input.operation,'inventory');assert.equal(read.hrRowsRead,0);assert.equal(read.complete,true);assert.equal(read.worksheets.length,1);
 for(const delta of [{inventoryComplete1:false},{inventoryComplete2:undefined},{inventory2:[{id:'other',name:'NOVIEMBRE 26',visibility:'Visible'}]},{projectId:'foreign'},{status2:404}])await assert.rejects(readExcelWorksheetInventoryThroughMake({binding,runScenario:async()=>({...out,...delta})}),/INVENTORY_/);
});
