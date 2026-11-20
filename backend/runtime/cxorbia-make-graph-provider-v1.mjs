/* CXOrbia I3/B14: delegated Microsoft Graph reader through the sole Make provider.
 * Read-only, scoped and fail-closed. No workbook URI, token or raw HR row is logged.
 * The returned values are PRIVATE TO THE BACKEND; only .proof may be sent to UI.
 */
import crypto from 'node:crypto';
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
    const cells=row.map(normalize);
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
export async function readExcelPeriodThroughMake({binding,token,scenarioId,rangeAddress='A1:AI140',columnMap,fetchImpl=fetch}={}){
  const scope=binding?.scope||{},provider=binding?.privateProvider||{},proof=binding?.proof||{};
  if(proof.providerType!=='excel_online'||proof.readPolicy!=='external_live'||proof.writePolicy!=='external_read_only'||proof.hrWrites!==false)fail('MAPPING_FAILURE','SOURCE_POLICY');
  if(![scope.tenantId,scope.projectId,scope.periodId].every(isId)||!/^[A-Z]{2}$/.test(str(scope.countryCode))||
    !/^[a-f0-9]{64}$/.test(str(proof.bindingFingerprint)))fail('MAPPING_FAILURE','BINDING_SCOPE_INVALID');
  if(!isPrivate(provider.driveId)||!isPrivate(provider.itemId)||!Array.isArray(provider.worksheets)||!provider.worksheets.length)fail('MAPPING_FAILURE','WORKBOOK_OR_SHEETS_MISSING');
  if(!/^A1:[A-Z]{1,2}(?:[1-9][0-9]{0,2})$/.test(rangeAddress))fail('MAPPING_FAILURE','RANGE_INVALID');
  const match=rangeAddress.match(/([A-Z]{1,2})(\d+)$/),columns=[...match[1]].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0),rows=Number(match[2]);
  if(columns>45||rows>200)fail('MAPPING_FAILURE','RANGE_LIMIT_EXCEEDED');
  if(!str(token))fail('AUTH_FAILURE','MAKE_API_TOKEN_MISSING');
  if(!/^\d{6,12}$/.test(str(scenarioId)))fail('MAPPING_FAILURE','MAKE_READER_SCENARIO_MISSING');
  if(!columnMap?.contractId||columnMap.contractId!==provider.mappingRef)fail('MAPPING_FAILURE','MAPPING_CONTRACT_NOT_BOUND');
  const taken=new Set(),readings=[];
  for(const sheet of provider.worksheets){
    if(!isPrivate(sheet.worksheetId)||taken.has(sheet.worksheetId))fail('MAPPING_FAILURE','WORKSHEET_INVALID_OR_DUPLICATE');
    taken.add(sheet.worksheetId);
    const inputs={tenantId:scope.tenantId,projectId:scope.projectId,periodId:scope.periodId,countryCode:scope.countryCode,
      bindingFingerprint:proof.bindingFingerprint,driveId:provider.driveId,itemId:provider.itemId,worksheetId:sheet.worksheetId,rangeAddress};
    const response=await fetchImpl('https://eu2.make.com/api/v2/scenarios/'+scenarioId+'/run',{
      method:'POST',headers:{Authorization:'Token '+token,'Content-Type':'application/json','Cache-Control':'no-store'},
      body:JSON.stringify({data:inputs,responsive:true}),signal:AbortSignal.timeout(38000)});
    if(!response?.ok)fail('PROVIDER_FAILURE','MAKE_READ_HTTP_'+Number(response?.status||0));
    const body=await response.json();
    if(!['1',1,'success'].includes(body?.status)||!/^[a-f0-9]{32}$/i.test(str(body.executionId)))fail('PROVIDER_FAILURE','MAKE_READ_NOT_COMPLETED');
    const output=body.outputs||body?.response?.outputs||body?.data?.outputs;
    const received=verifyMakeGraphReadOutput(output,{...scope,bindingFingerprint:proof.bindingFingerprint},sheet,rangeAddress,columnMap);
    readings.push({worksheetId:sheet.worksheetId,scenarioKey:sheet.scenarioKey||null,...received});
  }
  const revision=digest({scope, bindingFingerprint:proof.bindingFingerprint,reads:readings.map(x=>({worksheetId:x.worksheetId,scenarioKey:x.scenarioKey,sha256:x.providerRevision}))});
  return {scope,privateProviderRows:readings.map(x=>({worksheetId:x.worksheetId,scenarioKey:x.scenarioKey,values:x.privateRows})),
    proof:{schemaVersion:'cxorbia.i3.b14.make-graph-read.v1',...scope,bindingFingerprint:proof.bindingFingerprint,sourceRevision:revision,
      worksheetCount:readings.length,worksheetProofs:readings.map(x=>x.proof),externalRevisionIndependentlyVerified:true,
      rawWorkbookExposed:false,rawContactDataExposed:false,providerAck:false,hrWrites:0,providerWriteRequests:0,production:false}};
}
