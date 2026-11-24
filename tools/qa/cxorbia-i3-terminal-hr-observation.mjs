// G05 GETs observe source HR; command reconciliation has a separate ACK receipt.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function validateTerminalHrObservation(meta){
  if(meta?.ok!==true||!/^[a-f0-9]{64}$/.test(String(meta.revision||''))||meta.sourceSafe!==true||
    meta.refreshError!==null||meta.writes!==false||meta.hrWrites!==false||meta.production!==false)
    throw new Error('SOURCE_FAILURE:TERMINAL_HR_READ_ONLY_OBSERVATION_INVALID');
  return {decision:'PASS_TERMINAL_HR_READ_ONLY_OBSERVATION',revision:meta.revision,
    sourceSafe:true,writes:false,hrWrites:false,production:false,
    scope:'HR_OBSERVATION_ONLY_NOT_COMMAND_RECONCILIATION',reconciliationCertified:false};
}
export function validateExcelCanonicalHrObservation({before,response,after,tenantId,projectId}){
  const prior=validateTerminalHrObservation(before),next=validateTerminalHrObservation(after),hr=response?.snapshot||response?.data||response;
  const fail=code=>{throw new Error('MAPPING_FAILURE:EXCEL_CANONICAL_'+code);},str=v=>String(v??'').trim();
  if(prior.revision!==next.revision||response?._runtime?.revision!==prior.revision)fail('REVISION_CHANGED');
  if(hr?.tenantId!==tenantId||hr?.projectId!==projectId||hr.sourceSafe!==true||hr.imported!==false||hr.production!==false||Number(hr.firestoreWrites||0)!==0||hr.source?.providerType!=='excel_online')fail('SOURCE_SCOPE');
  const visits=hr.visits,periods=hr.periods,countries=hr.projectConfig?.countries;
  if(!Array.isArray(visits)||!visits.length||!Array.isArray(periods)||!periods.length||!Array.isArray(countries)||!countries.length)fail('NONEMPTY_SCOPE');
  const ids=new Set(),coordinates=new Map(),byCountry={},byPeriod={};
  for(const v of visits){
    const id=str(v.id),country=str(v.countryCode||v.country||v.pais),period=str(v.periodId),row=str(v.hrRowId);
    if(!id||id!==str(v.visitId)||ids.has(id)||!/^[a-f0-9]{64}$/.test(str(v.excelWorksheetFingerprint)))fail('IDENTITY');ids.add(id);
    if(!countries.includes(country)||!period||!row||(v.tenantId&&v.tenantId!==tenantId)||(v.projectId&&v.projectId!==projectId)||(v.rootProjectId&&v.rootProjectId!==projectId))fail('VISIT_SCOPE');
    const matching=periods.filter(p=>str(p.id||p.periodId)===period&&str(p.key||p.periodKey)===str(v.periodKey));
    if(matching.length!==1||matching[0].projectId&&matching[0].projectId!==projectId)fail('PERIOD');
    const coord=period+'|'+row;if(!coordinates.has(coord))coordinates.set(coord,[]);coordinates.get(coord).push({id,country});
    byCountry[country]=(byCountry[country]||0)+1;byPeriod[period]=(byPeriod[period]||0)+1;
  }
  for(const rows of coordinates.values())if(new Set(rows.map(x=>x.country)).size!==rows.length)fail('DUPLICATE_COUNTRY_COORDINATE');
  return {decision:'PASS_EXCEL_CANONICAL_ID_READONLY',revision:prior.revision,visits:visits.length,uniqueCanonicalIds:ids.size,byCountry,byPeriod,
    sharedCountryCoordinates:[...coordinates.values()].filter(x=>x.length>1).length,sourceSafe:true,revisionStableAcrossReadbacks:true,firestoreWrites:0,authWrites:0,hrWrites:0,commandPosts:0,production:false,fullDomain:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  console.log(JSON.stringify(validateTerminalHrObservation(JSON.parse(fs.readFileSync(process.argv[2],'utf8')))));
}
