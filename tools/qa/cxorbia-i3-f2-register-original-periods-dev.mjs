import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {applicationDefault,initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {resolveCountryHrPeriodBinding,discoverExcelMonthlyWorksheets} from '../../backend/runtime/cxorbia-country-hr-binding-v1.mjs';
const tenantId='tya',projectId='cinepolis',firebaseProject='cxorbia-backend-dev';
const str=x=>String(x??'').trim(),fail=code=>{throw Error(code)};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const isPeriod=x=>/^20\d\d-(0[1-9]|1[0-2])$/.test(str(x));
const months=/^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\s+(2[0-9])$/i;
const monthNames={enero:1,febrero:2,marzo:3,abril:4,mayo:5,junio:6,julio:7,agosto:8,septiembre:9,setiembre:9,octubre:10,noviembre:11,diciembre:12};
const output='.tmp/i3-f2-register-original-periods/result.json';
fs.mkdirSync('.tmp/i3-f2-register-original-periods',{recursive:true});
const report={schemaVersion:'cxorbia.i3.f2.provider-inventory-registered.v1',decision:'HOLD',
  iteration:'I3',scope:{tenantId,projectId,environment:firebaseProject},
  currentSourceOnly:true,firestoreConfigurationWrites:0,operationalHrWrites:0,
  googleWrites:0,prodWrites:0,authWrites:0,sourceWrites:0,providerReadRequests:0,countries:[]};
let client;
try{
 if(process.env.GITHUB_REF!=='refs/heads/recovery/cxorbia-phase-a-20260831'
   ||process.env.GITHUB_REPOSITORY!=='paulaosoriof86/demoCXOrbia'
   ||process.env.CXORBIA_F2_REGISTER_GATE!=='PAULA_DEV_ONLY_ORIGINAL_EXCEL_PERIOD_BINDING_20261122')
   fail('AUTH_FAILURE:EXCEL_REGISTRY_WRITE_GATE');
 const descriptor=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
 const pointer=JSON.parse(fs.readFileSync('CXORBIA_RECOVERY_EXECUTION_CURRENT.json','utf8'));
 if(descriptor.productSourceSha!==pointer.productSourceSha||descriptor.production!=='DO_NOT_TOUCH'||pointer.authorizationI4!==false)
   fail('RELEASE_COMPOSITION_FAILURE:EXCEL_REGISTRY_PRODUCT_SCOPE');
 const app=initializeApp({credential:applicationDefault(),projectId:firebaseProject});
 const db=getFirestore(app),pRef=db.doc('tenants/'+tenantId+'/projects/'+projectId);
 const pSnap=await pRef.get(),project=pSnap.data()||{};
 const source=project.operationalSource||project.routeSource||{};
 if(!pSnap.exists||project.tenantId!==tenantId||(project.projectId&&project.projectId!==projectId)
   ||source.providerType!=='google_sheets'||source.mode!=='external'
   ||source.readPolicy!=='external_live'||source.writePolicy!=='external_read_only')fail('MAPPING_FAILURE:EXCEL_REGISTRY_PROJECT_POLICY');
 const mirrorId=source.providerBindingId||source.integrationSettingId||source.providerRef;
 const mirrorRef=db.doc('tenants/'+tenantId+'/integrationSettings/'+mirrorId);
 const mirrorSnap=await mirrorRef.get(),mirror=mirrorSnap.data()||{};
 if(mirror.providerType!=='google_sheets'||mirror.tenantId!==tenantId||mirror.projectId!==projectId
   ||!Array.isArray(mirror.originalReadbackBindings)||mirror.originalReadbackBindings.length!==2)
    fail('MAPPING_FAILURE:EXCEL_REGISTRY_ORIGINAL_BINDINGS_MISSING');
 const key=execFileSync('gcloud',['secrets','versions','access','1','--secret=cxorbia-dev-b14-make-toolbox','--project',firebaseProject],
   {encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
 if(!key)fail('AUTH_FAILURE:B14_TOOLBOX_CREDENTIAL');
 const url=new URL('https://eu2.make.com/mcp/server/98b29fbe-fbfe-42f2-aeae-e27998eb60c6');
 client=new Client({name:'cxorbia-f2-original-registry',version:'1.0.0'});
 await client.connect(new StreamableHTTPClientTransport(url,{requestInit:{redirect:'error',headers:{Authorization:'Bearer '+key}}}));
 const list=await client.listTools();
 if(list.nextCursor||list.tools.length!==1||list.tools[0].annotations?.readOnlyHint!==true
   ||!list.tools[0].inputSchema?.properties?.operation)fail('MAPPING_FAILURE:B14_INVENTORY_CONTRACT');
 const tool=list.tools[0],targets=[];
 for(const countryCode of ['GT','HN']){
   const refs=mirror.originalReadbackBindings.filter(x=>x.countryCode===countryCode);
   if(refs.length!==1)fail('MAPPING_FAILURE:EXCEL_REGISTRY_COUNTRY_BINDING');
   const settingRef=db.doc('tenants/'+tenantId+'/integrationSettings/'+refs[0].providerBindingId);
   const settingSnap=await settingRef.get(),setting=settingSnap.data()||{};
   if(!settingSnap.exists||setting.tenantId!==tenantId||setting.projectId!==projectId||setting.countryCode!==countryCode
     ||setting.providerType!=='excel_online'||setting.purpose!=='original_readback'||setting.enabled!==true
     ||setting.hrWritesEnabled!==false||setting.writePolicy!=='external_read_only'
     ||setting.mappingRef!==refs[0].mappingRef)fail('MAPPING_FAILURE:EXCEL_REGISTRY_PROVIDER_POLICY');
   const binding=await resolveCountryHrPeriodBinding({db,tenantId,projectId,countryCode,periodId:projectId+'-2026-11',purpose:'original_readback'});
   if(binding.privateProvider.worksheets.length!==1)fail('MAPPING_FAILURE:EXCEL_REGISTRY_CURRENT_WORKSHEET_COUNT');
   const params={...binding.scope,bindingFingerprint:binding.proof.bindingFingerprint,
     driveId:binding.privateProvider.driveId,itemId:binding.privateProvider.itemId,
     worksheetId:binding.privateProvider.worksheets[0].worksheetId,rangeAddress:'A1:AI140',operation:'inventory'};
   const rpc=await client.callTool({name:tool.name,arguments:params},undefined,{timeout:90000});
   if(rpc.isError)fail('PROVIDER_FAILURE:ORIGINAL_INVENTORY');
   let data=rpc.structuredContent||JSON.parse(rpc.content?.[0]?.text||'{}');
   data=data.outputs||data;
   const one=data.inventory1,two=data.inventory2;
   if(data.status1!==200||data.status2!==200||!Array.isArray(one)||!same(one,two))fail('PROVIDER_FAILURE:INVENTORY_REVISION_NOT_STABLE');
   report.providerReadRequests+=2;
   const periodCatalog=one.filter(x=>x.visibility!=='Hidden'&&x.visibility!=='VeryHidden')
     .map(x=>{const m=str(x.name).toLowerCase().match(months);
       if(!m)return null;
       const key='20'+m[2]+'-'+String(monthNames[m[1]]).padStart(2,'0');
       return {periodKey:key,periodId:projectId+'-'+key};
     }).filter(Boolean);
   const unique=new Set(periodCatalog.map(x=>x.periodId));
   if(periodCatalog.length!==unique.size||periodCatalog.length<12)fail('MAPPING_FAILURE:INVENTORY_MONTH_DUPLICATE_OR_SHORT');
   const planned=discoverExcelMonthlyWorksheets({worksheets:one,periodCatalog,existing:setting.periodSheets||[]});
   if(!planned.ok||planned.unbound.length||planned.issues.length||planned.entries.length!==periodCatalog.length)
     fail('MAPPING_FAILURE:EXCEL_REGISTRY_DISCOVERY_'+countryCode);
   const periodSheets=planned.entries.map(x=>({periodId:x.periodId,worksheetId:x.worksheetId,worksheetName:x.worksheetName,...(x.scenarioKey?{scenarioKey:x.scenarioKey}:{})}))
     .sort((a,b)=>a.periodId.localeCompare(b.periodId)||a.worksheetId.localeCompare(b.worksheetId));
   const oldNov=(setting.periodSheets||[]).find(x=>x.periodId===projectId+'-2026-11');
   const newNov=periodSheets.find(x=>x.periodId===projectId+'-2026-11');
   if(!oldNov||!newNov||oldNov.worksheetId!==newNov.worksheetId)fail('MAPPING_FAILURE:EXCEL_REGISTRY_NOV_IDENTITY_DRIFT');
   const keys=periodSheets.map(x=>x.periodId);
   if(!keys.includes(projectId+'-2025-05')||!keys.includes(projectId+'-2026-11'))
     fail('MAPPING_FAILURE:EXCEL_REGISTRY_PERIOD_COVERAGE');
   report.countries.push({countryCode,inventorySheets:one.length,monthlySheets:periodSheets.length,
     firstPeriod:keys[0],lastPeriod:keys.at(-1),novemberIdPreserved:true});
   targets.push({ref:settingRef,baseline:setting,updateTime:settingSnap.updateTime,periodSheets});
 }
 const updates=await db.runTransaction(async tx=>{
   const ps=await tx.get(pRef),ms=await tx.get(mirrorRef);
   const actualSource=(ps.data()||{}).operationalSource||(ps.data()||{}).routeSource||{};
   if(!ps.exists||!ms.exists||ps.updateTime.toMillis()!==pSnap.updateTime.toMillis()
     ||ms.updateTime.toMillis()!==mirrorSnap.updateTime.toMillis()
     ||actualSource.providerType!=='google_sheets')fail('MAPPING_FAILURE:EXCEL_REGISTRY_CONFIG_CHANGED');
   const snapshots=await tx.getAll(...targets.map(x=>x.ref));
   const replacements=[];
   for(let i=0;i<targets.length;i++){
     const t=targets[i],current=snapshots[i];
     if(!current.exists||current.updateTime.toMillis()!==t.updateTime.toMillis()
       ||!same(current.data(),t.baseline))fail('MAPPING_FAILURE:EXCEL_REGISTRY_BINDING_CHANGED');
     const existing=current.data().periodSheets||[];
     const exact=same([...existing].sort((a,b)=>str(a.periodId).localeCompare(str(b.periodId))),t.periodSheets);
     replacements.push(!exact);
   }
   for(let i=0;i<targets.length;i++)if(replacements[i])tx.update(targets[i].ref,{periodSheets:targets[i].periodSheets});
   return replacements.filter(Boolean).length;
 });
 report.firestoreConfigurationWrites=updates;
 for(const t of targets){
   const after=(await t.ref.get()).data()||{};
   if(!same(after.periodSheets,t.periodSheets)||after.hrWritesEnabled!==false||after.providerType!=='excel_online')
     fail('PERSISTENCE_FAILURE:EXCEL_REGISTRY_REMOTE_READBACK');
 }
 for(const code of ['GT','HN'])for(const id of [projectId+'-2025-05',projectId+'-2026-10',projectId+'-2026-11']){
   const b=await resolveCountryHrPeriodBinding({db,tenantId,projectId,countryCode:code,periodId:id,purpose:'original_readback'});
   if(b.proof.providerType!=='excel_online'||b.proof.worksheetCount!==1)fail('PERSISTENCE_FAILURE:EXCEL_REGISTRY_RESOLVER');
 }
 const projectAfter=(await pRef.get()).data()||{};
 const sel=(projectAfter.operationalSource||projectAfter.routeSource||{}).providerType;
 if(sel!=='google_sheets')fail('PERSISTENCE_FAILURE:UNAUTHORIZED_OPERATIONAL_SWITCH');
 report.verifiedReadback=true;report.operationalSelectorUnchanged=true;report.decision='PASS_F2_ORIGINAL_PERIOD_REGISTRY_DEV_ACK_ONLY__HOLD_OPERATIONAL_SWITCH';
}catch(error){report.errorCode=/^(?:SOURCE_FAILURE|RELEASE_COMPOSITION_FAILURE|MAPPING_FAILURE|PROVIDER_FAILURE|AUTH_FAILURE|PERSISTENCE_FAILURE):[A-Z0-9_]+$/.test(str(error.message))?error.message:'ENVIRONMENT_FAILURE:F2_REGISTER';process.exitCode=1;}
finally{
 await client?.close().catch(()=>{});
 fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
 console.log('CXORBIA_I3_F2_PERIOD_REGISTER='+JSON.stringify(report));
}
