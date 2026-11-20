/* CXOrbia I3/B14 — private Excel Online binding per project, country and period.
   Resolves a single original workbook and an exact monthly worksheet. This
   module NEVER reads or writes Graph, Firestore mutations, Make or HR rows.
   The operational adapter must independently read the provider and verify
   the binding fingerprint again before publishing its snapshot or an ACK. */
import crypto from 'node:crypto';
import {validateProjectPayload,validateExcelCountryBindings} from './cxorbia-project-command-provider-v1.mjs';

const str=v=>String(v==null?'':v).trim();
const sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
const id=v=>/^[A-Za-z0-9][A-Za-z0-9._:-]{0,179}$/.test(str(v));
const privateId=v=>/^[A-Za-z0-9{][A-Za-z0-9{}!._:-]{0,239}$/.test(str(v));
const fail=code=>{throw Error('MAPPING_FAILURE:EXCEL_HR_'+code);};
const stamp=snapshot=>{
  const t=snapshot?.updateTime;
  if(!Number.isSafeInteger(t?.seconds)||!Number.isInteger(t?.nanoseconds)||t.nanoseconds<0||t.nanoseconds>=1e9)fail('VERSION_UNVERIFIABLE');
  return `${t.seconds}.${String(t.nanoseconds).padStart(9,'0')}`;
};

const MONTHS={enero:1,ene:1,january:1,jan:1,febrero:2,feb:2,february:2,marzo:3,mar:3,march:3,
  abril:4,abr:4,april:4,apr:4,mayo:5,may:5,june:6,junio:6,jun:6,julio:7,jul:7,july:7,
  agosto:8,ago:8,august:8,aug:8,septiembre:9,setiembre:9,sep:9,sept:9,september:9,
  octubre:10,oct:10,october:10,noviembre:11,nov:11,november:11,diciembre:12,dic:12,december:12,dec:12};
const normalized=s=>str(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function parseWorksheetTitle(title){
  const value=normalized(title),tokens=[...value.matchAll(/\b(enero|ene|january|jan|febrero|feb|february|marzo|mar|march|abril|abr|april|apr|mayo|may|june|junio|jun|julio|jul|july|agosto|ago|august|aug|septiembre|setiembre|sep|sept|september|octubre|oct|october|noviembre|nov|november|diciembre|dic|december|dec)\s*[-_/ ]*\s*(20\d{2}|\d{2})\b/g)];
  if(tokens.length!==1)return null;
  const match=tokens[0],year=Number(match[2].length===2?'20'+match[2]:match[2]);
  if(year<2020||year>2099)return null;
  const periodKey=`${year}-${String(MONTHS[match[1]]).padStart(2,'0')}`;
  const suffix=(value.slice(0,match.index)+' '+value.slice(match.index+match[0].length))
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  return {periodKey,scenarioKey:suffix||null};
}

// Turn the live Graph inventory into a proposed private registry. New tabs are
// matched by date semantics, never identical names or list positions. A known
// worksheet's stable ID preserves its scenario/period association after rename.
// This is a PURE proposal: a provider-owned registry writer must validate and
// commit the proposal separately with expectedVersion/readback.
export function discoverExcelMonthlyWorksheets({worksheets=[],periodCatalog=[],existing=[]}={}){
  const catalog=new Map(periodCatalog.map(p=>[str(p.periodKey),str(p.periodId)]).filter(([k,v])=>/^20\d{2}-(0[1-9]|1[0-2])$/.test(k)&&id(v)));
  const prior=new Map(existing.filter(x=>privateId(x.worksheetId)).map(x=>[x.worksheetId,x]));
  const entries=[],unbound=[],issues=[],ids=new Set();
  for(const sheet of worksheets){
    if(sheet?.visibility==='Hidden'||sheet?.visibility==='VeryHidden')continue;
    const worksheetId=str(sheet?.id),worksheetName=str(sheet?.name);
    if(!privateId(worksheetId)||!worksheetName){issues.push('WORKSHEET_REFERENCE_INVALID');continue;}
    if(ids.has(worksheetId)){issues.push('WORKSHEET_DUPLICATE');continue;}ids.add(worksheetId);
    const parsed=parseWorksheetTitle(worksheetName),old=prior.get(worksheetId);
    if(!parsed&&!old)continue; // Non-monthly guide/instruction sheets are not HR rows.
    const periodKey=parsed?.periodKey||str(old?.periodKey);
    if(old?.periodKey&&parsed?.periodKey&&old.periodKey!==parsed.periodKey){issues.push('PERIOD_REASSIGNMENT_CONFLICT');continue;}
    const periodId=catalog.get(periodKey);
    const entry={periodKey,periodId:periodId||null,worksheetId,worksheetName,scenarioKey:str(old?.scenarioKey||parsed?.scenarioKey)||null};
    if(!periodId)unbound.push(entry);else entries.push(entry);
  }
  const groups=new Map();for(const entry of entries){
    if(!groups.has(entry.periodId))groups.set(entry.periodId,[]);groups.get(entry.periodId).push(entry);
  }
  for(const items of groups.values())if(items.length>1){
    const keys=items.map(x=>x.scenarioKey);
    if(keys.some(x=>!x)||new Set(keys).size!==keys.length)issues.push('PERIOD_SCENARIO_AMBIGUOUS');
  }
  return {ok:issues.length===0&&unbound.length===0,entries:issues.length?[]:entries,unbound,issues:[...new Set(issues)],
    providerWrites:0,firestoreWrites:0,hrWrites:0};
}

export async function resolveCountryHrPeriodBinding({db,tenantId,projectId,countryCode,periodId,purpose='operational'}={}){
  if(!db?.doc||!id(tenantId)||!id(projectId)||!/^[A-Z]{2}$/.test(str(countryCode))||!id(periodId))fail('SCOPE_INVALID');
  const scope={tenantId:str(tenantId),projectId:str(projectId),countryCode:str(countryCode),periodId:str(periodId)};
  const project=await db.doc(`tenants/${scope.tenantId}/projects/${scope.projectId}`).get();
  if(!project.exists)fail('PROJECT_MISSING');
  const raw=project.data()||{},active=raw.operationalSource||raw.routeSource||{};
  let source=active, mirrorStamp=null;
  if(!['operational','original_readback'].includes(purpose))fail('PURPOSE');
  if(raw.tenantId!==scope.tenantId||(raw.projectId&&raw.projectId!==scope.projectId))fail('PROJECT_SCOPE');
  if(!Array.isArray(raw.countries)||!raw.countries.includes(scope.countryCode))fail('COUNTRY_NOT_ASSIGNED');
  if(purpose==='original_readback' && active.providerType==='google_sheets'){
    const reference=active.providerBindingId||active.integrationSettingId||active.providerRef;
    if(active.mode!=='external'||active.readPolicy!=='external_live'||active.writePolicy!=='external_read_only'||!id(reference))fail('MIRROR_SCOPE');
    const mirror=await db.doc(`tenants/${scope.tenantId}/integrationSettings/${reference}`).get();
    const row=mirror.exists?mirror.data():null;
    if(!row||row.enabled!==true||row.tenantId!==scope.tenantId||row.projectId!==scope.projectId||
       row.providerType!=='google_sheets'||row.readPolicy!==active.readPolicy||row.writePolicy!==active.writePolicy||
       row.hrWritesEnabled!==false||row.mappingRef!==active.mappingRef||(row.providerBindingId&&row.providerBindingId!==reference))fail('MIRROR_INTEGRATION');
    source={mode:'external',providerType:'excel_online',readPolicy:'external_live',writePolicy:'external_read_only',periodDiscovery:'provider_auto',countryBindings:row.originalReadbackBindings};
    if(validateExcelCountryBindings(raw.countries,source).length)fail('ORIGINAL_READBACK_REGISTRY');
    mirrorStamp=stamp(mirror);
  }
  if(source.mode!=='external'||source.providerType!=='excel_online'||source.readPolicy!=='external_live')fail('SOURCE_POLICY');
  const valid=mirrorStamp ? {ok:true} : validateProjectPayload({...raw,operationalSource:source});
  if(!valid.ok)fail('PROJECT_CONFIG_INVALID');
  const candidates=source.countryBindings.filter(x=>x.countryCode===scope.countryCode);
  if(candidates.length!==1)fail('COUNTRY_BINDING_AMBIGUOUS');
  const country=candidates[0],bindingId=country.providerBindingId;
  const binding=await db.doc(`tenants/${scope.tenantId}/integrationSettings/${bindingId}`).get();
  if(!binding.exists)fail('INTEGRATION_MISSING');
  const setting=binding.data()||{};
  if(setting.tenantId!==scope.tenantId||setting.projectId!==scope.projectId||setting.countryCode!==scope.countryCode)fail('INTEGRATION_SCOPE');
  if(mirrorStamp && setting.purpose!=='original_readback')fail('ORIGINAL_READBACK_PURPOSE');
  if(setting.enabled!==true||setting.providerType!=='excel_online'||setting.readPolicy!=='external_live'||
    setting.writePolicy!==source.writePolicy||setting.mappingRef!==country.mappingRef||
    (setting.providerBindingId&&setting.providerBindingId!==bindingId))fail('INTEGRATION_POLICY');
  if(source.writePolicy==='external_read_only'&&setting.hrWritesEnabled!==false)fail('WRITES_NOT_DISABLED');
  if(source.writePolicy==='bidirectional_gated'&&setting.hrWritesEnabled!==true)fail('WRITE_GATE_NOT_ENABLED');
  if(!privateId(setting.driveId)||!privateId(setting.itemId))fail('WORKBOOK_REFERENCE_INVALID');
  const sheets=setting.periodSheets;
  if(!Array.isArray(sheets))fail('PERIOD_REGISTRY_MISSING');
  const matches=sheets.filter(x=>str(x?.periodId)===scope.periodId);
  if(!matches.length)fail('PERIOD_UNREGISTERED');
  const scenarioKeys=new Set(),worksheetIds=new Set();
  for(const sheet of matches){
    if(!privateId(sheet.worksheetId)||!str(sheet.worksheetName)||str(sheet.worksheetName).length>128)fail('WORKSHEET_REFERENCE_INVALID');
    if(worksheetIds.has(sheet.worksheetId))fail('WORKSHEET_DUPLICATE');
    worksheetIds.add(sheet.worksheetId);
  }
  for(const sheet of matches){
    if(matches.length>1&&(!id(sheet.scenarioKey)||scenarioKeys.has(sheet.scenarioKey)))fail('PERIOD_SCENARIO_AMBIGUOUS');
    if(sheet.scenarioKey)scenarioKeys.add(sheet.scenarioKey);
  }
  // One period can have several scenario-specific tabs in the SAME country
  // workbook. A missing or duplicate scenario key is ambiguous; never choose
  // the first tab based on workbook order or a hardcoded month title.
  const selected=matches.map(x=>({worksheetId:x.worksheetId,worksheetName:x.worksheetName,scenarioKey:str(x.scenarioKey)||null}))
    .sort((a,b)=>str(a.scenarioKey).localeCompare(str(b.scenarioKey))||a.worksheetId.localeCompare(b.worksheetId));
  const projectStamp=stamp(project),settingStamp=stamp(binding);
  const fingerprint=sha(JSON.stringify({scope,projectStamp,settingStamp,...(mirrorStamp?{mirrorStamp,purpose}:{}),bindingId,driveId:setting.driveId,itemId:setting.itemId,
    worksheets:selected,mappingRef:country.mappingRef,writePolicy:source.writePolicy}));
  return {
    scope,
    proof:{schemaVersion:'cxorbia.country-hr-period-binding.v1',...scope,
      providerType:'excel_online',readPolicy:'external_live',writePolicy:source.writePolicy,
      bindingSha256:sha(bindingId),workbookSha256:sha(`${setting.driveId}\0${setting.itemId}`),
      worksheetSetSha256:sha(JSON.stringify(selected)),worksheetCount:selected.length,mappingSha256:sha(country.mappingRef),
      projectVersion:raw.version??null,projectStamp,settingStamp,bindingFingerprint:fingerprint,
      providerAck:false,remoteRevisionVerified:false,hrWrites:false,production:false},
    // Server-only. Never serialize this field into a Shopper/Admin HR response.
    privateProvider:{driveId:setting.driveId,itemId:setting.itemId,worksheets:selected,
      providerBindingId:bindingId,mappingRef:country.mappingRef}
  };
}
