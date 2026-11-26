/* CXOrbia I3/B14: delegated Microsoft Graph reader through the sole Make provider.
 * Read-only, scoped and fail-closed. No workbook URI, token or raw HR row is logged.
 * The returned values are PRIVATE TO THE BACKEND; only .proof may be sent to UI.
 */
import crypto from 'node:crypto';
import {resolveCountryHrPeriodBinding} from './cxorbia-country-hr-binding-v1.mjs';
import {parseTab,projectReadHeader} from '../../tools/hr-source/tya-build-live-hr-source-safe-r20.mjs';
const str=v=>String(v??'').trim();
const digest=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const fail=(category,code)=>{throw new Error(category+':B14_'+code);};
const isId=v=>/^[A-Za-z0-9][A-Za-z0-9._:-]{0,179}$/.test(str(v));
const isPrivate=v=>/^[A-Za-z0-9{][A-Za-z0-9{}!._:-]{0,239}$/.test(str(v));
const normalize=v=>str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
export function validateGraphColumnMap(values,contract,countryCode){
  if(!Array.isArray(values)||!values.length||!contract?.columns||!Array.isArray(contract.headerVariants))fail('MAPPING_FAILURE','VALUES_OR_MAPPING_MISSING');
  const selected=[];
  for(let i=0;i<Math.min(14,values.length);i++){
    const row=values[i];
    if(!Array.isArray(row))continue;
    const cells=projectReadHeader(row,contract,countryCode).map(normalize);
    for(const variant of contract.headerVariants){
      const countries=Array.isArray(variant.allowedCountries)?variant.allowedCountries:[];
      if(countries.length&&!countries.includes(countryCode))continue;
      if((variant.requiresAbsent||[]).some(v=>cells.includes(normalize(v))))continue;
      const required = (variant.required || []).map(normalize).filter(Boolean);
      if (required.length && required.every(label => cells.includes(label))) {
        // The contract orders layouts by priority. Count matching rows, not variants of one row.
        selected.push({index: i, variant, cells});
        break;
      }
    }
  }
  if(selected.length!==1)fail('MAPPING_FAILURE','HEADER_AMBIGUOUS_OR_MISSING');
  const {index,variant,cells}=selected[0],columnIndexes={};
  for(const [key,field] of Object.entries(contract.columns)){
    const exact=fields=>cells.map((v,i)=>fields.includes(v)?i:-1).filter(i=>i>=0);
    const hits=exact((field.aliases||[]).map(normalize));
    if(hits.length>1&&!field.duplicatePolicy)fail('MAPPING_FAILURE','COLUMN_AMBIGUOUS');
    const contextual=hits.length===0&&(field.contextualMissingAllowedIn||[]).includes(variant.id);
    if(hits.length===0&&field.critical&&!contextual)fail('MAPPING_FAILURE','CRITICAL_COLUMN_MISSING');
    columnIndexes[key]=hits.length?hits[hits.length-1]:null;
  }
  if(variant.countrySource==='tab_name'&&!/^[A-Z]{2}$/.test(countryCode))fail('MAPPING_FAILURE','COUNTRY_SCOPE_REQUIRED');
  if(variant.countrySource!=='tab_name'&&columnIndexes.pais===null)fail('MAPPING_FAILURE','COUNTRY_COLUMN_REQUIRED');
  const rows=values.slice(index+1).filter(row=>Array.isArray(row)&&row.some(v=>str(v)));
  return {headerRow:index+1,headerVariant:variant.id,countryAuthority:variant.countrySource==='tab_name'?'verified_country_binding':'provider_column',
    matchedFields:Object.values(columnIndexes).filter(x=>x!==null).length,configuredFields:Object.keys(columnIndexes).length,nonemptyRows:rows.length};
}
export function verifyMakeGraphReadOutput(out,scope,worksheet,rangeAddress,contract){
  const expected={tenantId:scope.tenantId,projectId:scope.projectId,countryCode:scope.countryCode,periodId:scope.periodId,
    bindingFingerprint:scope.bindingFingerprint,worksheetId:worksheet.worksheetId,rangeAddress};
  if(!out||Object.entries(expected).some(([key,value])=>str(out[key])!==str(value)))fail('MAPPING_FAILURE','RESPONSE_SCOPE_MISMATCH');
  if(Number(out.status1)!==200||Number(out.status2)!==200)fail('PROVIDER_FAILURE','GRAPH_ACK_MISSING');
  const first=out.values1,second=out.values2;
  if(!Array.isArray(first)||!Array.isArray(second)||Number(out.rowCount1)!==first.length||Number(out.rowCount2)!==second.length)fail('PROVIDER_FAILURE','ROW_SHAPE_MISMATCH');
  const firstHash=digest(first),secondHash=digest(second);
  if(firstHash!==secondHash||!/^[a-f0-9]{64}$/i.test(str(out.hash1))||out.hash1!==out.hash2)fail('PROVIDER_FAILURE','INDEPENDENT_SOURCE_REVISION_CONFLICT');
  const mapping=validateGraphColumnMap(first,contract,scope.countryCode);
  return {privateRows:first,providerRevision:firstHash,proof:{worksheetFingerprint:digest([scope.bindingFingerprint,worksheet.worksheetId]),
    sourceContentSha256:firstHash,rowsReturned:first.length,...mapping,independentReadback:true,remoteRevisionVerified:true,
    method:'GET_GRAPH_WORKBOOK_RANGE_VIA_MAKE',hrWrites:0,providerWriteRequests:0,production:false}};
}
export async function readExcelPeriodThroughMake({binding,token,scenarioId,rangeAddress,columnMap,fetchImpl=fetch,runScenario}={}){
  const scope=binding?.scope||{},provider=binding?.privateProvider||{},proof=binding?.proof||{};
  const configuredRange=provider.readRangeAddress;
  if(configuredRange!==undefined&&rangeAddress!==undefined&&rangeAddress!==configuredRange)fail('MAPPING_FAILURE','RANGE_BINDING_CONFLICT');
  rangeAddress=rangeAddress??configuredRange??'A1:AI140';
  if(proof.providerType!=='excel_online'||proof.readPolicy!=='external_live'||!['external_read_only','bidirectional_gated'].includes(proof.writePolicy)||proof.hrWrites!==false)fail('MAPPING_FAILURE','SOURCE_POLICY');
  if(![scope.tenantId,scope.projectId,scope.periodId].every(isId)||!/^[A-Z]{2}$/.test(str(scope.countryCode))||
    !/^[a-f0-9]{64}$/.test(str(proof.bindingFingerprint)))fail('MAPPING_FAILURE','BINDING_SCOPE_INVALID');
  if(!isPrivate(provider.driveId)||!isPrivate(provider.itemId)||!Array.isArray(provider.worksheets)||!provider.worksheets.length)fail('MAPPING_FAILURE','WORKBOOK_OR_SHEETS_MISSING');
  if(!/^A1:[A-Z]{1,2}(?:[1-9][0-9]{0,2})$/.test(rangeAddress))fail('MAPPING_FAILURE','RANGE_INVALID');
  const match=rangeAddress.match(/([A-Z]{1,2})(\d+)$/),columns=[...match[1]].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0),rows=Number(match[2]);
  if(columns>45||rows>200)fail('MAPPING_FAILURE','RANGE_LIMIT_EXCEEDED');
  if(!runScenario&&!str(token))fail('AUTH_FAILURE','MAKE_API_TOKEN_MISSING');
  if(!runScenario&&!/^\d{6,12}$/.test(str(scenarioId)))fail('MAPPING_FAILURE','MAKE_READER_SCENARIO_MISSING');
  if(!columnMap?.contractId||columnMap.contractId!==provider.mappingRef)fail('MAPPING_FAILURE','MAPPING_CONTRACT_NOT_BOUND');
  async function runRestScenario(inputs){
    const response=await fetchImpl('https://eu2.make.com/api/v2/scenarios/'+scenarioId+'/run',{
      method:'POST',headers:{Authorization:'Token '+token,'Content-Type':'application/json','Cache-Control':'no-store'},
      body:JSON.stringify({data:inputs,responsive:true}),signal:AbortSignal.timeout(38000)});
    if(!response?.ok)fail('PROVIDER_FAILURE','MAKE_READ_HTTP_'+Number(response?.status||0));
    const body=await response.json();
    if(!['1',1,'success'].includes(body?.status)||!/^[a-f0-9]{32}$/i.test(str(body.executionId)))fail('PROVIDER_FAILURE','MAKE_READ_NOT_COMPLETED');
    return body.outputs||body?.response?.outputs||body?.data?.outputs;
  }
  const taken=new Set(),readings=[];
  for(const sheet of provider.worksheets){
    if(!isPrivate(sheet.worksheetId)||taken.has(sheet.worksheetId))fail('MAPPING_FAILURE','WORKSHEET_INVALID_OR_DUPLICATE');
    taken.add(sheet.worksheetId);
    const inputs={tenantId:scope.tenantId,projectId:scope.projectId,periodId:scope.periodId,countryCode:scope.countryCode,
      bindingFingerprint:proof.bindingFingerprint,driveId:provider.driveId,itemId:provider.itemId,worksheetId:sheet.worksheetId,rangeAddress};
    const output=await (runScenario || runRestScenario)(inputs);
    const received=verifyMakeGraphReadOutput(output,{...scope,bindingFingerprint:proof.bindingFingerprint},sheet,rangeAddress,columnMap);
    readings.push({worksheetId:sheet.worksheetId,scenarioKey:sheet.scenarioKey||null,...received});
  }
  const revision=digest({scope, bindingFingerprint:proof.bindingFingerprint,reads:readings.map(x=>({worksheetId:x.worksheetId,scenarioKey:x.scenarioKey,sha256:x.providerRevision}))});
  return {scope,privateProviderRows:readings.map(x=>({worksheetId:x.worksheetId,scenarioKey:x.scenarioKey,values:x.privateRows})),
    proof:{schemaVersion:'cxorbia.i3.b14.make-graph-read.v1',...scope,bindingFingerprint:proof.bindingFingerprint,sourceRevision:revision,
      worksheetCount:readings.length,worksheetProofs:readings.map(x=>x.proof),externalRevisionIndependentlyVerified:true,
      rawWorkbookExposed:false,rawContactDataExposed:false,providerAck:false,hrWrites:0,providerWriteRequests:0,production:false}};
}

// Inventory reads worksheet metadata only. Both independent responses must be
// complete and identical before absence can mean that a next month is not ready.
export async function readExcelWorksheetInventoryThroughMake({binding,runScenario}={}){
  const scope=binding?.scope||{},p=binding?.privateProvider||{},proof=binding?.proof||{},sheet=p.worksheets?.[0];
  if(typeof runScenario!=='function'||proof.providerType!=='excel_online'||!sheet||
    !/^[a-f0-9]{64}$/.test(proof.bindingFingerprint||''))fail('MAPPING_FAILURE','INVENTORY_BINDING');
  const inputs={...scope,bindingFingerprint:proof.bindingFingerprint,driveId:p.driveId,itemId:p.itemId,
    worksheetId:sheet.worksheetId,rangeAddress:p.readRangeAddress||'A1:AI140',operation:'inventory'};
  const out=await runScenario(inputs);
  if(!out||Object.keys(scope).some(k=>str(out[k])!==str(scope[k]))||out.bindingFingerprint!==proof.bindingFingerprint||
    str(out.worksheetId)!==str(sheet.worksheetId)||Number(out.status1)!==200||Number(out.status2)!==200)
    fail('PROVIDER_FAILURE','INVENTORY_ACK');
  if(out.inventoryComplete1!==true||out.inventoryComplete2!==true||!Array.isArray(out.inventory1)||!Array.isArray(out.inventory2))
    fail('PROVIDER_FAILURE','INVENTORY_INCOMPLETE');
  const clean=items=>items.map(s=>({id:str(s.id),name:str(s.name),visibility:str(s.visibility)})).sort((a,b)=>a.id.localeCompare(b.id));
  const first=clean(out.inventory1),second=clean(out.inventory2);
  if(first.some(s=>!isPrivate(s.id)||!s.name||!['Visible','Hidden','VeryHidden'].includes(s.visibility))||
    new Set(first.map(s=>s.id)).size!==first.length||digest(first)!==digest(second))fail('PROVIDER_FAILURE','INVENTORY_CONFLICT');
  return {worksheets:first,inventoryHash:digest(first),complete:true,hrRowsRead:0,hrWrites:0,providerWriteRequests:0};
}


// A refresh owns one authenticated connection; each scope still performs its
// own two independently checked Graph reads. No HR response is cached here.
export async function withMakeGraphToolboxReader({client,transport},consume){
  const pending=new Set();let closing=false;
  try{
    await client.connect(transport);
    const list=await client.listTools(),tool=list?.tools?.[0];
    if(list?.nextCursor||list?.tools?.length!==1||tool?.annotations?.readOnlyHint!==true||
       !['bindingFingerprint','worksheetId','driveId','itemId','periodId'].every(key=>Object.hasOwn(tool.inputSchema?.properties||{},key)))
      fail('MAPPING_FAILURE','TOOLBOX_CONTRACT');
    const runScenario=inputs=>{
      if(closing)return Promise.reject(new Error('PROVIDER_FAILURE:B14_TOOLBOX_CLOSED'));
      const task=(async()=>{
        const reply=await client.callTool({name:tool.name,arguments:inputs},undefined,{timeout:65000});
        if(reply.isError)fail('PROVIDER_FAILURE','TOOLBOX_EXECUTION');
        if(reply.structuredContent)return reply.structuredContent.outputs??reply.structuredContent;
        if(reply.content?.length!==1||reply.content[0].type!=='text')fail('PROVIDER_FAILURE','TOOLBOX_RESPONSE');
        try{return JSON.parse(reply.content[0].text);}catch{fail('PROVIDER_FAILURE','TOOLBOX_RESPONSE');}
      })();
      pending.add(task);task.then(()=>pending.delete(task),()=>pending.delete(task));return task;
    };
    return await consume(runScenario);
  }finally{
    closing=true;await Promise.allSettled([...pending]);await client.close().catch(()=>{});
  }
}

// F3 uses the existing Make provider module. The read-only toolbox and source
// policies remain unchanged. This explicit write capability must be separately
// provisioned for the existing scenario; an old fixture protocol fails closed.
const fieldCanonical=v=>Array.isArray(v)?v.map(fieldCanonical):v&&typeof v==='object'
  ?Object.fromEntries(Object.keys(v).sort().map(k=>[k,fieldCanonical(v[k])])):v;
const fieldDigest=v=>crypto.createHash('sha256').update(JSON.stringify(fieldCanonical(v))).digest('hex');
const fieldSame=(a,b)=>fieldDigest(a??null)===fieldDigest(b??null);
const FIELD_PROTOCOL='cxorbia.hr-field-transport.v1';
const fieldScope=e=>({tenantId:e.tenantId,projectId:e.projectId,periodId:e.periodId,
  countryCode:e.countryCode,visitId:e.visitId,hrRowId:e.hrRowId,fieldKey:e.fieldKey});
export async function executeExcelFieldEventThroughMake({event,target,runScenario,recoveryOnly=false,prior={},maxReadbacks=3}={}){
  if(event?.schemaVersion!=='cxorbia.hr-field-event.v1'||typeof runScenario!=='function'||
    !/^[a-f0-9]{64}$/.test(str(event.eventDigest)))fail('MAPPING_FAILURE','FIELD_EVENT_REQUIRED');
  const scope=fieldScope(event),cap=target?.writeCapability||{};
  if(target?.schemaVersion!=='cxorbia.hr-field-target.v1'||target.resolvedFromPrivateBinding!==true||
    cap.enabled!==true||cap.protocolVersion!==FIELD_PROTOCOL||cap.remoteEventReceipt!==true||
    cap.observedBaseGuard!==true||!Array.isArray(cap.allowedFields)||!cap.allowedFields.includes(event.fieldKey))
      fail('MAPPING_FAILURE','FIELD_WRITE_CAPABILITY_REQUIRED');
  if(Object.entries(scope).some(([k,v])=>str(target[k])!==str(v))||
    target.worksheetFingerprint!==event.worksheetFingerprint||
    !/^[a-f0-9]{64}$/.test(str(target.bindingFingerprint))||!/^[a-f0-9]{64}$/.test(str(target.rowIdentityFingerprint))||
    !/^[a-f0-9]{64}$/.test(str(target.headerFingerprint))||
    ![target.driveId,target.itemId,target.worksheetId].every(isPrivate)||
    !/^[A-Z]{1,2}[1-9][0-9]{0,5}$/.test(str(target.rangeAddress)))fail('MAPPING_FAILURE','FIELD_TARGET_SCOPE');
  const decode=typeof target.decodeCell==='function'?target.decodeCell:v=>v===''?null:v;
  if((!recoveryOnly&&!fieldSame(decode(target.expectedBeforeValue),event.before))||!fieldSame(decode(target.fieldValue),event.after))
    fail('MAPPING_FAILURE','FIELD_TARGET_VALUE_MAPPING');
  const request={protocolVersion:FIELD_PROTOCOL,...scope,eventId:event.eventId,eventDigest:event.eventDigest,
    baseEventId:event.baseEventId??null,baseEventOrigin:event.baseEventOrigin??null,baseRevision:event.baseRevision,bindingFingerprint:target.bindingFingerprint,
    worksheetFingerprint:event.worksheetFingerprint,rowIdentityFingerprint:target.rowIdentityFingerprint,
    headerFingerprint:target.headerFingerprint,driveId:target.driveId,itemId:target.itemId,
    worksheetId:target.worksheetId,rangeAddress:target.rangeAddress,
    expectedBeforeValue:target.expectedBeforeValue,fieldValue:target.fieldValue,
    headerRangeAddress:target.headerRangeAddress,rowRangeAddress:target.rowRangeAddress,
    rowIdentityColumnIndexes:target.rowIdentityColumnIndexes,expectedHeaderValues:target.expectedHeaderValues,expectedRowIdentityValues:target.expectedRowIdentityValues};
  let requests=0,writeAckVerified=prior.writeAckVerified===true;
  const base=()=>({...scope,eventId:event.eventId,eventDigest:event.eventDigest,providerAck:false,
    writeAckVerified,readbackVerified:false,providerWriteRequests:requests});
  const verify=out=>{
    if(!out||out.protocolVersion!==FIELD_PROTOCOL||Object.entries(scope).some(([k,v])=>str(out[k])!==str(v))||
      out.eventId!==event.eventId||out.eventDigest!==event.eventDigest||
      out.bindingFingerprint!==target.bindingFingerprint||out.rowIdentityFingerprint!==target.rowIdentityFingerprint||
      out.worksheetFingerprint!==event.worksheetFingerprint||out.headerFingerprint!==target.headerFingerprint||
      !fieldSame(out.observedHeaderValues,target.expectedHeaderValues)||!fieldSame(out.observedRowIdentityValues,target.expectedRowIdentityValues))
        fail('PROVIDER_FAILURE','FIELD_RESPONSE_SCOPE');
    return out;
  };
  const inspect=async()=>verify(await runScenario({...request,operation:'inspect_event'}));
  const confirmed=out=>Number(out.readStatus)===200&&out.remoteReceiptVerified===true&&
    Number(out.remoteWriteStatus)===200&&out.remoteEventId===event.eventId&&out.remoteEventDigest===event.eventDigest&&
    out.currentEventId===event.eventId&&/^[a-f0-9]{32}$/i.test(str(out.providerExecutionId))&&fieldSame(decode(out.observedValue),event.after);
  const ack=out=>({...base(),status:'committed',providerAck:true,writeAckVerified:true,readbackVerified:true,
    observedValue:event.after,readbackDigest:fieldDigest({...scope,eventId:event.eventId,eventDigest:event.eventDigest,observedValue:event.after}),
    providerExecutionId:str(out.providerExecutionId)});
  let observed=await inspect();
  if(confirmed(observed))return ack(observed);
  if(observed.remoteEventDigest&&observed.remoteEventId===event.eventId&&observed.remoteEventDigest!==event.eventDigest)
    return {...base(),status:'conflict',code:'HR_FIELD_EVENT_PAYLOAD_CONFLICT'};
  // A prior HTTP request may have succeeded despite a lost response. Never retry
  // its PATCH. Only an exact durable remote receipt plus independent read can ACK.
  if(recoveryOnly){
    if(Number(observed.readStatus)===200&&observed.remoteReceiptVerified===true&&observed.remoteEventId===event.eventId&&
      ((observed.currentEventId&&observed.currentEventId!==event.eventId)||
       (!fieldSame(decode(observed.observedValue),event.before)&&!fieldSame(decode(observed.observedValue),event.after))))
      return {...base(),status:'conflict',code:'HR_FIELD_OLD_EVENT_NOT_CURRENT'};
    return {...base(),status:'pending_hr',code:'HR_FIELD_REMOTE_RECEIPT_REQUIRED'};
  }
  if(Number(observed.readStatus)!==200)return {...base(),status:'pending_hr',code:'HR_FIELD_PREREAD_NOT_CONFIRMED'};
  if(!fieldSame(decode(observed.observedValue),event.before)||observed.preconditionAllowed!==true)
    return {...base(),status:'conflict',code:'HR_FIELD_REMOTE_BASE_CONFLICT'};
  requests++;
  const written=verify(await runScenario({...request,operation:'write_field'}));
  writeAckVerified=Number(written.writeStatus)===200&&written.writeAttempted===true;
  if(written.status==='CONFLICT_NOOP'&&written.writeAttempted===false)
    return {...base(),status:'conflict',providerWriteRequests:0,code:'HR_FIELD_REMOTE_BASE_CONFLICT'};
  if(!writeAckVerified)return {...base(),status:'pending_hr',code:'HR_FIELD_WRITE_ACK_UNCERTAIN'};
  // Same-execution readback has proved stale in the real fixture. Always use a
  // separately invoked inspection, bounded, without a second write request.
  for(let i=0;i<Math.max(1,Math.min(3,maxReadbacks));i++){
    observed=await inspect();if(confirmed(observed))return ack(observed);
    if(observed.currentEventId&&observed.currentEventId!==event.eventId&&
      !fieldSame(decode(observed.observedValue),event.before))
        return {...base(),status:'pending_hr',code:'HR_FIELD_NEWER_OR_CONCURRENT_REMOTE_EVENT'};
  }
  return {...base(),status:'pending_hr',code:'HR_FIELD_INDEPENDENT_READBACK_PENDING'};
}

// MCP ToolAnnotations.readOnlyHint is optional and defaults to false. The
// hint is compatibility metadata; scoped capabilities and ACKs authorize work.
export function isMakeGraphWriterHintCompatible(tool){
  const hint=tool?.annotations?.readOnlyHint;return hint===undefined||hint===false;
}
export async function withMakeGraphToolboxWriter({client,transport},consume){
  const pending=new Set();let closing=false;
  try{
    try{await client.connect(transport);}catch{fail('PROVIDER_FAILURE','WRITER_TOOLBOX_INITIALIZE');}
    let list;try{list=await client.listTools();}catch{fail('PROVIDER_FAILURE','WRITER_TOOLBOX_LISTTOOLS');}
    const tool=list?.tools?.[0];
    if(list?.nextCursor||list?.tools?.length!==1||!isMakeGraphWriterHintCompatible(tool)||
      !['protocolVersion','operation','eventId','eventDigest','fieldKey','periodId','bindingFingerprint'].every(k=>
        Object.hasOwn(tool.inputSchema?.properties||{},k)))fail('MAPPING_FAILURE','WRITER_TOOLBOX_CONTRACT');
    const runScenario=inputs=>{
      if(closing)return Promise.reject(new Error('PROVIDER_FAILURE:B14_WRITER_TOOLBOX_CLOSED'));
      const task=(async()=>{
        let reply;try{reply=await client.callTool({name:tool.name,arguments:inputs},undefined,{timeout:65000});}
        catch{fail('PROVIDER_FAILURE','WRITER_TOOLBOX_REQUEST_UNCERTAIN');}
        if(reply.isError)fail('PROVIDER_FAILURE','WRITER_TOOLBOX_EXECUTION');
        if(reply.structuredContent)return reply.structuredContent.outputs??reply.structuredContent;
        const blocks=arrText(reply?.content);if(blocks.length!==1)fail('PROVIDER_FAILURE','WRITER_TOOLBOX_RESPONSE');
        let value;try{value=JSON.parse(blocks[0]);}catch{fail('PROVIDER_FAILURE','WRITER_TOOLBOX_JSON');}
        return value.outputs??value;
      })();pending.add(task);task.finally(()=>pending.delete(task)).catch(()=>{});return task;
    };
    return await consume(runScenario);
  }finally{closing=true;await Promise.allSettled([...pending]);await client.close().catch(()=>{});}
}
const arrText=content=>Array.isArray(content)?content.filter(x=>x.type==='text').map(x=>x.text):[];

const targetSha=value=>crypto.createHash('sha256').update(String(value)).digest('hex');
const columnLetter=index=>{let n=index+1,value='';while(n>0){const r=(n-1)%26;value=String.fromCharCode(65+r)+value;n=Math.floor((n-1)/26);}return value;};
export function encodeExcelHrFieldValue(value,kind){
  // Graph PATCH null means "ignore". An intentional clear is an empty string.
  if(value===null||value===undefined||value==='')return '';
  if(kind==='money'){
    if(typeof value!=='number'||!Number.isFinite(value)||value<0)fail('MAPPING_FAILURE','FIELD_AMOUNT_INVALID');return value;
  }
  const text=str(value);if(text.length>500||/^[=+@]/.test(text))fail('MAPPING_FAILURE','FIELD_TEXT_INVALID');
  if(kind==='date'&&(!/^20\d{2}-\d{2}-\d{2}$/.test(text)||new Date(text+'T00:00:00Z').toISOString().slice(0,10)!==text))fail('MAPPING_FAILURE','FIELD_DATE_INVALID');
  if(!['text','date','shopper'].includes(kind))fail('MAPPING_FAILURE','FIELD_KIND_UNSUPPORTED');return text;
}
export function decodeExcelHrFieldValue(value,kind,{periodId}={}){
  if(value===null||value===undefined||str(value)==='')return null;
  if(kind==='text'||kind==='shopper')return str(value);
  if(kind==='money'){
    if(typeof value==='number')return value;
    const n=Number(str(value).replace(/[QL\s]/gi,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(/,/g,'.').replace(/[^0-9.-]/g,''));
    if(!Number.isFinite(n))fail('MAPPING_FAILURE','FIELD_REMOTE_AMOUNT_INVALID');return n;
  }
  if(kind==='date'){
    const raw=str(value);let iso;
    if(typeof value==='number'||/^\d{3,6}(?:\.\d+)?$/.test(raw)){
      const serial=Number(value);if(!Number.isFinite(serial)||serial<1||serial>100000)fail('MAPPING_FAILURE','FIELD_REMOTE_DATE_INVALID');
      iso=new Date(Date.UTC(1899,11,30)+Math.floor(serial)*86400000).toISOString().slice(0,10);
    }else if(/^20\d{2}-\d{2}-\d{2}$/.test(raw))iso=raw;
    else{
      const match=raw.match(/^([0-3]?\d)[/.-]([01]?\d)(?:[/.-](20\d{2}))?$/),year=match?.[3]||str(periodId).slice(-7,-3);
      if(!match||!/^20\d{2}$/.test(year))fail('MAPPING_FAILURE','FIELD_REMOTE_DATE_INVALID');
      iso=year+'-'+match[2].padStart(2,'0')+'-'+match[1].padStart(2,'0');
    }
    if(new Date(iso+'T00:00:00Z').toISOString().slice(0,10)!==iso)fail('MAPPING_FAILURE','FIELD_REMOTE_DATE_INVALID');return iso;
  }
  fail('MAPPING_FAILURE','FIELD_KIND_UNSUPPORTED');
}
export async function resolveExcelFieldWriteTarget({db,event,columnMap,cinemaRegistry,readBinding,resolveBinding=resolveCountryHrPeriodBinding}={}){
  if(!db?.doc||event?.schemaVersion!=='cxorbia.hr-field-event.v1'||typeof readBinding!=='function')fail('MAPPING_FAILURE','FIELD_TARGET_DEPENDENCIES');
  const scope=fieldScope(event),request={db,tenantId:scope.tenantId,projectId:scope.projectId,countryCode:scope.countryCode,periodId:scope.periodId,purpose:'operational'};
  const binding=await resolveBinding(request),privateBinding=binding.privateProvider||{};
  const settingSnap=await db.doc('tenants/'+scope.tenantId+'/integrationSettings/'+privateBinding.providerBindingId).get();
  const setting=settingSnap.exists?settingSnap.data():{},cap=setting.fieldWriter||{},rule=cap.fieldMap?.[event.fieldKey];
  if(binding.proof?.writePolicy!=='bidirectional_gated'||setting.hrWritesEnabled!==true||
    cap.schemaVersion!=='cxorbia.hr-field-writer-binding.v1'||cap.enabled!==true||cap.protocolVersion!==FIELD_PROTOCOL||
    cap.remoteEventReceipt!==true||cap.observedBaseGuard!==true||!Array.isArray(cap.allowedFields)||!cap.allowedFields.includes(event.fieldKey)||
    !rule||!columnMap.columns?.[rule.columnKey]||!['text','date','money','shopper'].includes(rule.valueKind))fail('MAPPING_FAILURE','FIELD_WRITER_NOT_ENABLED');
  const sheets=(privateBinding.worksheets||[]).filter(s=>targetSha(s.worksheetId)===event.worksheetFingerprint);
  if(sheets.length!==1)fail('MAPPING_FAILURE','FIELD_WORKSHEET_OWNER');
  const sheet=sheets[0],split=str(event.hrRowId).lastIndexOf('!'),row=Number(str(event.hrRowId).slice(split+1));
  if(split<1||str(event.hrRowId).slice(0,split)!==sheet.worksheetName||!Number.isSafeInteger(row)||row<1)fail('MAPPING_FAILURE','FIELD_ROW_REFERENCE');
  const read=await readBinding(binding);
  if(read.proof?.bindingFingerprint!==binding.proof.bindingFingerprint||read.proof?.externalRevisionIndependentlyVerified!==true)fail('MAPPING_FAILURE','FIELD_SOURCE_READ_UNPROVEN');
  const tabs=(read.privateProviderRows||[]).filter(x=>x.worksheetId===sheet.worksheetId);
  if(tabs.length!==1||!Array.isArray(tabs[0].values))fail('MAPPING_FAILURE','FIELD_SOURCE_WORKSHEET_MISSING');
  const values=tabs[0].values,mapping=validateGraphColumnMap(values,columnMap,scope.countryCode),header=values[mapping.headerRow-1];
  if(row<=mapping.headerRow||row>values.length||!Array.isArray(values[row-1]))fail('MAPPING_FAILURE','FIELD_ROW_OUTSIDE_SOURCE');
  const indexes={};
  for(const [key,field] of Object.entries(columnMap.columns)){
    const aliases=(field.aliases||[]).map(normalize),hits=header.map((cell,index)=>aliases.includes(normalize(cell))?index:-1).filter(x=>x>=0);
    if(hits.length>1&&!field.duplicatePolicy)fail('MAPPING_FAILURE','FIELD_COLUMN_AMBIGUOUS');
    indexes[key]=hits.length?hits.at(-1):null;
  }
  const column=indexes[rule.columnKey],identityKeys=cap.rowIdentityColumns;
  if(column===null||!Array.isArray(identityKeys)||identityKeys.length<2||identityKeys.length>3||new Set(identityKeys).size!==identityKeys.length||
    identityKeys.some(k=>indexes[k]===null||indexes[k]===undefined||k===rule.columnKey))fail('MAPPING_FAILURE','FIELD_IDENTITY_COLUMNS');
  const raw=values[row-1],identityIndexes=identityKeys.map(k=>indexes[k]),identityValues=identityIndexes.map(i=>raw[i]??'');
  if(identityValues.some(v=>!str(v)))fail('MAPPING_FAILURE','FIELD_BUSINESS_IDENTITY_EMPTY');
  if(!cinemaRegistry?.cinemas)fail('MAPPING_FAILURE','FIELD_CINEMA_REGISTRY_REQUIRED');
  const key=scope.periodId.slice(-7),parsed=parseTab({country:scope.countryCode,key,year:Number(key.slice(0,4)),
    month:Number(key.slice(5)),tabTitle:sheet.worksheetName,label:key,fullLabel:key},values,columnMap,cinemaRegistry);
  const sameRows=parsed.visits.filter(v=>Number(v.sourceRow)===row);
  if(parsed.issues.some(x=>x.severity==='critical')||sameRows.length!==1||!event.sourceRowIdentity||
    event.sourceRowIdentity.cinemaId!==str(sameRows[0].cinemaId)||event.sourceRowIdentity.sucursal!==str(sameRows[0].sucursal))
      fail('MAPPING_FAILURE','FIELD_BUSINESS_IDENTITY_CHANGED');
  // Sparse historical layouts use exactly the same approved cinema registry
  // projection as the live reader. Raw guard columns are configured per binding.
  let encode=value=>encodeExcelHrFieldValue(value,rule.valueKind),decode=value=>decodeExcelHrFieldValue(value,rule.valueKind,scope);
  if(rule.valueKind==='shopper'){
    const beforeRaw=raw[column]??'',afterBinding=event.providerValueBinding;
    const currentSourceId=str(sameRows[0].shopperId);let currentShopper=currentSourceId||null;
    if(currentSourceId){
      const currentCross=await db.doc('tenants/'+scope.tenantId+'/shopperIdentityCrosswalk/'+currentSourceId).get();
      if(currentCross.exists){
        const mapped=currentCross.data();
        if(mapped.tenantId!==scope.tenantId||mapped.sourceType!=='hr_external'||mapped.projectId&&mapped.projectId!==scope.projectId||!str(mapped.shopperId))
          fail('MAPPING_FAILURE','FIELD_CURRENT_SHOPPER_CROSSWALK_INVALID');
        currentShopper=str(mapped.shopperId);
      }
    }
    if(!fieldSame(currentShopper,event.before)&&!fieldSame(currentShopper,event.after))fail('MAPPING_FAILURE','FIELD_SOURCE_BASE_CHANGED');
    if(event.after!==null){
      if(afterBinding?.kind!=='shopper'||afterBinding.canonicalShopperId!==event.after||!str(afterBinding.remoteLabel)||
        afterBinding.sourceShopperId!=='shopper_'+scope.countryCode.toLowerCase()+'_'+targetSha(str(afterBinding.remoteLabel).toLowerCase()).slice(0,10))
          fail('MAPPING_FAILURE','FIELD_SHOPPER_BINDING_REQUIRED');
      const cross=await db.doc('tenants/'+scope.tenantId+'/shopperIdentityCrosswalk/'+afterBinding.sourceShopperId).get();
      if(!cross.exists||cross.data().tenantId!==scope.tenantId||cross.data().sourceType!=='hr_external'||cross.data().projectId&&cross.data().projectId!==scope.projectId||cross.data().shopperId!==event.after)fail('MAPPING_FAILURE','FIELD_SHOPPER_CROSSWALK_CHANGED');
    }
    const afterRaw=event.after===null?'':afterBinding.remoteLabel;
    encode=value=>value===null?'':value===event.after?afterRaw:fail('MAPPING_FAILURE','FIELD_SHOPPER_ENCODING');
    decode=value=>{
      if(str(value)==='')return null;
      if(str(value)===str(afterRaw)&&event.after!==null)return event.after;
      if(str(value)===str(beforeRaw))return currentShopper;
      return 'unresolved_remote_shopper_label';
    };
  }
  const beforeRaw=raw[column]??'',afterRaw=encode(event.after);
  if(!fieldSame(decode(beforeRaw),event.before)&&!fieldSame(decode(beforeRaw),event.after))fail('MAPPING_FAILURE','FIELD_SOURCE_BASE_CHANGED');
  const after=await resolveBinding(request);if(after.proof.bindingFingerprint!==binding.proof.bindingFingerprint)fail('MAPPING_FAILURE','FIELD_BINDING_CHANGED_DURING_READ');
  const end=columnLetter(Math.min(44,header.length-1)),expectedHeaderValues=header.map(v=>v??'');
  return {schemaVersion:'cxorbia.hr-field-target.v1',...scope,resolvedFromPrivateBinding:true,
    bindingFingerprint:binding.proof.bindingFingerprint,worksheetFingerprint:event.worksheetFingerprint,
    headerFingerprint:fieldDigest(expectedHeaderValues),rowIdentityFingerprint:fieldDigest({tenantId:scope.tenantId,projectId:scope.projectId,
      periodId:scope.periodId,countryCode:scope.countryCode,worksheetFingerprint:event.worksheetFingerprint,sourceRow:row,values:identityValues}),
    driveId:privateBinding.driveId,itemId:privateBinding.itemId,worksheetId:sheet.worksheetId,rangeAddress:columnLetter(column)+row,
    headerRangeAddress:'A'+mapping.headerRow+':'+end+mapping.headerRow,rowRangeAddress:'A'+row+':'+end+row,
    rowIdentityColumnIndexes:identityIndexes,expectedHeaderValues,expectedRowIdentityValues:identityValues,
    // Keep the event base when inspecting a lost response after the value changed.
    expectedBeforeValue:fieldSame(decode(beforeRaw),event.before)?beforeRaw:encodeExcelHrFieldValue(event.before,rule.valueKind),
    fieldValue:afterRaw,decodeCell:decode,writeCapability:cap};
}
