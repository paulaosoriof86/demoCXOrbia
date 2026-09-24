import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

const OUT=String(process.env.C3_SEM_OUT||'').trim();
const HR_FILE=String(process.env.C3_HR_FILE||'').trim();
const PROJECT=String(process.env.C3_FIREBASE_PROJECT||'cxorbia-backend-dev').trim();
const TENANT=String(process.env.C3_TENANT_ID||'tya').trim();
const PROJECT_ID=String(process.env.C3_PROJECT_ID||'cinepolis').trim();
const EXPECTED_REV=String(process.env.C3_HR_REVISION||'').trim();
if(!OUT||!HR_FILE||!EXPECTED_REV)throw new Error('ENVIRONMENT_FAILURE:C3_SEMANTIC_ORACLE_ENV');
const raw=JSON.parse(fs.readFileSync(HR_FILE,'utf8'));
const hr=raw?.snapshot||raw?.data||raw;
const revision=String(raw?._runtime?.revision||hr?._runtime?.revision||hr?.sourceRevision||'');
if(revision!==EXPECTED_REV||!/^[a-f0-9]{64}$/.test(revision))throw new Error('RELEASE_COMPOSITION_FAILURE:C3_HR_REVISION_MISMATCH');
const periods=Array.isArray(hr?.periods)?hr.periods:[],visits=Array.isArray(hr?.visits)?hr.visits:[],shoppers=Array.isArray(hr?.shoppers)?hr.shoppers:[];
const currentKey=String(hr?.source?.currentCalendarPeriodKey||hr?.currentCalendarPeriodKey||'');
const period=periods.find(x=>String(x?.key||x?.periodKey||'')===currentKey);
if(!period||!currentKey)throw new Error('SOURCE_FAILURE:C3_CURRENT_PERIOD_MISSING');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const db=getFirestore(),projectRef=db.collection('tenants').doc(TENANT).collection('projects').doc(PROJECT_ID);
const [projectSnap,periodSnap]=await Promise.all([projectRef.get(),projectRef.collection('periods').get()]);
const projectCfg=projectSnap.exists?(projectSnap.data()||{}):{};
const periodCfgDoc=periodSnap.docs.find(d=>String(d.id)===String(period.id||'')||String(d.data()?.key||d.data()?.periodKey||'')===currentKey);
const periodCfg=periodCfgDoc?.data?.()||{};
const known=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const facet=(v,k)=>v?.canonicalFacets?.[k]===true;
const countryCode=v=>String(v?.country||v?.pais||'').toUpperCase();
const amountConfig=(code,key)=>{
  const p=periodCfg?.[key]||periodCfg?.[key==='currency'?'currencies':key]||{};
  const root=projectCfg?.[key]||projectCfg?.[key==='currency'?'currencies':key]||{};
  return known(p?.[code])?Number(p[code]):(known(root?.[code])?Number(root[code]):null);
};
const current=visits.filter(v=>String(v?.periodKey||'')===currentKey);
const realized=v=>facet(v,'realized')||String(v?.executionState||'')==='realized'||['realizada','cuestionario','submitida','liquidada','pagada'].includes(String(v?.estado||'').toLowerCase());
const assigned=v=>facet(v,'assigned')||String(v?.assignmentState||'')==='assigned';
const country=code=>{
  const a=current.filter(v=>countryCode(v)===code), r=a.filter(realized);
  const configuredHonorarium=amountConfig(code,'honorario');
  const honoraria=r.map(v=>known(v?.honorario)?Number(v.honorario):configuredHonorarium);
  const honorariumComplete=honoraria.every(Number.isFinite);
  const knownReimbursements=r.reduce((n,v)=>n+(known(v?.boleto)?Number(v.boleto):0)+(known(v?.comboAmt)?Number(v.comboAmt):0),0);
  const reimbursementPartial=r.some(v=>!known(v?.boleto)||!known(v?.comboAmt));
  return {
    total:a.length,
    availableUnassigned:a.filter(v=>facet(v,'available')&&!assigned(v)).length,
    assigned:a.filter(assigned).length,
    scheduled:a.filter(v=>facet(v,'scheduled')||String(v?.schedulingState||'')==='scheduled').length,
    realized:r.length,
    questionnaire:a.filter(v=>facet(v,'questionnaire')).length,
    submitted:a.filter(v=>facet(v,'submitted')||String(v?.submissionState||'')==='confirmed_hr').length,
    liquidationCandidate:a.filter(v=>facet(v,'liquidationCandidate')).length,
    liquidationConfirmed:a.filter(v=>facet(v,'liquidationConfirmed')).length,
    paymentConfirmed:a.filter(v=>facet(v,'paymentConfirmed')).length,
    outOfRange:a.filter(v=>facet(v,'outOfRange')||v?.outOfRange===true).length,
    reviewRequired:a.filter(v=>v?.reviewRequired===true).length,
    uniqueAssignedShoppers:new Set(a.filter(assigned).map(v=>String(v?.shopperId||'')).filter(Boolean)).size,
    finance:{
      realizedCount:r.length,
      honorarioDevengado:honorariumComplete?honoraria.reduce((n,x)=>n+x,0):null,
      knownReimbursements,
      reimbursementPartial,
      configuredHonorarium
    }
  };
};
const GT=country('GT'),HN=country('HN');
const technical=x=>/^shopper_(?:gt|hn|sv|ni)_[a-z0-9]+$/i.test(String(x||''))||/^shp[-_][a-z0-9]+$/i.test(String(x||''));
const sourceShoppers=shoppers.map(s=>({sourceShopperId:String(s?.shopperId||s?.id||''),name:String(s?.nombre||s?.name||'')})).filter(x=>x.sourceShopperId);
const badNames=sourceShoppers.filter(x=>!x.name||technical(x.name));
if(badNames.length)throw new Error('SOURCE_FAILURE:C3_HR_HUMAN_NAMES_UNAVAILABLE:'+JSON.stringify(badNames.slice(0,10)));
const identityCases=sourceShoppers.map(x=>{
  const linked=visits.filter(v=>String(v?.shopperId||'')===x.sourceShopperId);
  return {...x,total:linked.length,realized:linked.filter(realized).length};
});
const reference={
  countries:{GT,HN},
  finance:{GT:GT.finance,HN:HN.finance},
  liquidations:{
    total:GT.realized+HN.realized,GT:GT.realized,HN:HN.realized,
    paymentsConfirmed:GT.paymentConfirmed+HN.paymentConfirmed,
    liquidationsConfirmed:GT.liquidationConfirmed+HN.liquidationConfirmed
  },
  identityCases,shopperPopulation:sourceShoppers.length
};
const configEvidence={
  projectExists:projectSnap.exists,
  projectHonorario:projectCfg?.honorario||{},
  periodHonorario:periodCfg?.honorario||{},
  projectCurrency:projectCfg?.currency||projectCfg?.currencies||{},
  periodCurrency:periodCfg?.currency||periodCfg?.currencies||{}
};
const out={
  decision:'PASS_C3_TERMINAL_HR_SEMANTIC_ORACLE',
  generatedAt:new Date().toISOString(),sourceRevision:revision,currentPeriodKey:currentKey,currentPeriodId:String(period?.id||periodCfgDoc?.id||''),
  projectId:PROJECT_ID,GT,HN,reference,configEvidence,
  authority:{hr:'same_fresh_runtime_revision',finance:'explicit_hr_then_live_project_period_config_else_null',identity:'exact_hr_id_only',fuzzyMatching:false},
  production:false,hrWrites:0,firestoreWrites:0
};
fs.mkdirSync(OUT,{recursive:true});
fs.writeFileSync(OUT+'/hr-contrast.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({decision:out.decision,revision,period:currentKey,GT:GT.total,HN:HN.total,finance:{GT:GT.finance,HN:HN.finance}},null,2));
