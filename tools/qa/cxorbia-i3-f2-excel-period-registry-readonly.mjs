import fs from 'node:fs';
import {applicationDefault,initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
const projectId='cxorbia-backend-dev',tenantId='tya',clientProject='cinepolis';
const report={schemaVersion:'cxorbia.i3.f2.original-excel-period-registry-readonly.v1',
  tenantId,projectId:clientProject,devProject:projectId,decision:'HOLD',
  writes:0,hrWrites:0,production:false};
const val=x=>String(x??'').trim();
const fail=x=>{throw new Error(x)};
try{
 const app=initializeApp({projectId,credential:applicationDefault()}),db=getFirestore(app);
 const project=await db.doc('tenants/'+tenantId+'/projects/'+clientProject).get();
 if(!project.exists)fail('MAPPING_FAILURE:PROJECT_MISSING');
 const data=project.data()||{},source=data.operationalSource||data.routeSource||{};
 const bindingId=val(source.providerBindingId||source.integrationSettingId||source.providerRef);
 if(!bindingId)fail('MAPPING_FAILURE:SOURCE_BINDING_MISSING');
 const mirror=await db.doc('tenants/'+tenantId+'/integrationSettings/'+bindingId).get();
 const mr=mirror.exists?mirror.data():{};
 if(mr.tenantId!==tenantId||mr.projectId!==clientProject||mr.providerType!=='google_sheets'
   ||!Array.isArray(mr.originalReadbackBindings)||mr.originalReadbackBindings.length!==2)
   fail('MAPPING_FAILURE:ORIGINAL_READBACK_REGISTRY_MISSING');
 const periods=await db.collection('tenants/'+tenantId+'/projects/'+clientProject+'/periods').get();
 const raw=periods.docs.map(x=>({id:x.id,...(x.data()||{})}));
 const periodIds=[...new Set(raw.map(x=>val(x.periodId||x.id)).filter(x=>/^cinepolis-20\\d\\d-(?:0[1-9]|1[0-2])$/.test(x)))].sort();
 report.periods={count:raw.length,typedCount:periodIds.length,periodIds,otherIds:raw.length-periodIds.length};
 report.selectedProviderType=source.providerType;
 report.excel=[];
 for(const country of ['GT','HN']){
   const match=mr.originalReadbackBindings.filter(x=>x.countryCode===country);
   if(match.length!==1)fail('MAPPING_FAILURE:COUNTRY_BINDINGS_AMBIGUOUS_'+country);
   const setting=await db.doc('tenants/'+tenantId+'/integrationSettings/'+match[0].providerBindingId).get();
   const row=setting.exists?setting.data():{};
   if(row.projectId!==clientProject||row.tenantId!==tenantId||row.countryCode!==country
      ||row.providerType!=='excel_online'||row.hrWritesEnabled!==false)
      fail('MAPPING_FAILURE:COUNTRY_PROVIDER_INVALID_'+country);
   report.excel.push({country,provider:'excel_online',enabled:row.enabled===true,
      periodSheets:(row.periodSheets||[]).map(x=>({periodId:x.periodId,hasStableWorksheetId:!!val(x.worksheetId)})).sort((a,b)=>val(a.periodId).localeCompare(val(b.periodId))),
      bindingUpdatesAvailable:!!setting.updateTime,periodsMissingFromCatalog:(row.periodSheets||[]).map(x=>x.periodId).filter(id=>!periodIds.includes(id))});
 }
 report.countries=Array.isArray(data.countries)?data.countries:[];
 report.currentProjectPeriodsValueType=Array.isArray(data.periods)?'array':typeof data.periods;
 report.decision='PASS_READONLY_REGISTRY_INVENTORY_ONLY';
}catch(error){report.error=/^(MAPPING_FAILURE|AUTH_FAILURE|PROVIDER_FAILURE):[A-Z0-9_]+$/.test(val(error.message))?error.message:'ENVIRONMENT_FAILURE:REGISTRY_PREFLIGHT';process.exitCode=1;}
finally{
 fs.mkdirSync('.tmp/i3-f2-period-registry',{recursive:true});
 fs.writeFileSync('.tmp/i3-f2-period-registry/result.json',JSON.stringify(report,null,2)+'\n');
 console.log('F2_PERIOD_REGISTRY_SAFE='+JSON.stringify(report));
}
