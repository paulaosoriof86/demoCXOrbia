// Independent expected values: raw external HR + separately read Firestore config.
// Never import the application's finance/read model to calculate its own oracle.
export const knownAmount=v=>(typeof v==='number'||typeof v==='string')&&String(v).trim()!==''&&Number.isFinite(Number(v));
const list=v=>Array.isArray(v)?v:[];
const facet=v=>v?.canonicalFacets||{};
const codeOf=v=>String(v?.pais||v?.country||'').toUpperCase();

export function buildFocalDashboardStageReference({snapshot,runtime=snapshot?._runtime,tenantId,projectId,periodId,periodKey,sourceRevision,countryCodes}){
  const fail=code=>{throw new Error('SOURCE_FAILURE:B11_STAGE_'+code);};
  if(snapshot?.sourceSafe!==true||snapshot.imported!==false||snapshot.production!==false||snapshot.tenantId!==tenantId||snapshot.projectId!==projectId||
    !/^[a-f0-9]{64}$/.test(String(sourceRevision))||runtime?.revision!==sourceRevision||runtime.revisionStable!==true||runtime.hrWrites!==false||runtime.imports!==false||
    (snapshot._runtime&&snapshot._runtime.revision!==runtime.revision))fail('AUTHORITY');
  const periods=list(snapshot.periods).filter(p=>String(p.id||p.periodId||'')===periodId&&String(p.key||p.periodKey||'')===periodKey);
  if(periods.length!==1||periods[0].projectId!==projectId)fail('PERIOD');
  const rows=list(snapshot.visits).filter(v=>String(v.periodKey||'')===periodKey&&!v._archived);
  const countries=[...new Set(countryCodes||[])];
  const keys=['assigned','scheduled','realized','questionnaire','submitted','liquidationConfirmed','cancelled'];
  if(!countries.length||rows.some(v=>v.tenantId!==tenantId||v.projectId!==projectId||!countries.includes(codeOf(v))||
    ![v.id,v.hrRowId].every(id=>typeof id==='string'&&id.trim()===id&&id.length>0)||keys.some(k=>typeof v.canonicalFacets?.[k]!=='boolean')))fail('ROW_SCOPE');
  for(const field of ['id','hrRowId'])if(new Set(rows.map(v=>String(v[field]))).size!==rows.length)fail('DUPLICATE_'+field.toUpperCase());
  const active=v=>facet(v).cancelled!==true;
  const predicates={total:()=>true,asign:v=>active(v)&&facet(v).assigned===true,agend:v=>active(v)&&facet(v).scheduled===true,
    real:v=>active(v)&&facet(v).realized===true,cuest:v=>active(v)&&facet(v).questionnaire===true,submit:v=>active(v)&&facet(v).submitted===true,
    liq:v=>active(v)&&facet(v).liquidationConfirmed===true,sinasign:v=>active(v)&&!facet(v).assigned&&!facet(v).realized,
    sinagend:v=>active(v)&&facet(v).assigned===true&&!facet(v).scheduled&&!facet(v).realized};
  return {tenantId,projectId,periodId,periodKey,sourceRevision,authority:'independent_external_hr_revision',
    countries:Object.fromEntries(countries.map(c=>[c,Object.fromEntries(Object.entries(predicates).map(([key,pred])=>[key,rows.filter(v=>codeOf(v)===c&&pred(v)).map(v=>String(v.id)).sort()]))]))};
}

export function assertFocalDashboardStageReadback({expectedIds,visibleCount,modalIds,revision,expectedRevision}){
  const fail=code=>{throw new Error('FUNCTIONAL_DEFECT:B11_STAGE_'+code);};
  const validIds=ids=>Array.isArray(ids)&&ids.every(id=>typeof id==='string'&&id.trim()===id&&id.length>0)&&new Set(ids).size===ids.length;
  if(!/^[a-f0-9]{64}$/.test(String(expectedRevision))||!validIds(expectedIds))throw Error('SOURCE_FAILURE:B11_STAGE_REFERENCE');
  if(revision!==expectedRevision)fail('REVISION_DRIFT');
  if(!validIds(modalIds))fail('DUPLICATE_OR_INVALID_MODAL_IDS');
  if(!Number.isSafeInteger(visibleCount)||visibleCount<0||visibleCount!==expectedIds.length||JSON.stringify([...modalIds].sort())!==JSON.stringify([...expectedIds].sort()))fail('COUNTER_DETAIL_KEYSET_MISMATCH');
  return {pass:true,count:expectedIds.length,ids:[...modalIds].sort(),sourceRevision:revision};
}

export function assertFocalConfigAuthority({snapshot,projectId,projectConfig,projectExists}){
  if(String(snapshot?.projectId||'')!==projectId)throw new Error('SOURCE_FAILURE:FOCAL_PROJECT_SCOPE');
  if(!projectExists||snapshot.projectConfigAuthority!=='firestore_project_config')throw new Error('SOURCE_FAILURE:FOCAL_CONFIG_AUTHORITY');
  if(!Number.isSafeInteger(snapshot.projectConfigVersion)||snapshot.projectConfigVersion<1||String(snapshot.projectConfigVersion)!==String(projectConfig?.version))throw new Error('MAPPING_FAILURE:FOCAL_CONFIG_VERSION_DESYNC');
  for(const field of ['honorario','currency']){
    const external=snapshot?.projectConfig?.[field]||{},durable=projectConfig?.[field]||{};
    const keys=[...new Set([...Object.keys(external),...Object.keys(durable)])];
    if(keys.some(k=>String(external[k]??'')!==String(durable[k]??'')))throw new Error('MAPPING_FAILURE:FOCAL_CONFIG_'+field.toUpperCase()+'_DESYNC');
  }
  return true;
}

export function buildFocalHrReference({snapshot,periodKey,countryCodes,projectConfig={},periodConfig={},configAuthority}){
  const current=list(snapshot?.visits).filter(v=>String(v.periodKey||'')===periodKey);
  const realized=v=>facet(v).realized===true&&facet(v).cancelled!==true;
  const trusted=configAuthority==='firestore_project_config';
  const configuredHonorarium=code=>{
    if(!trusted)return null;
    const period=periodConfig?.honorario?.[code],project=projectConfig?.honorario?.[code];
    return knownAmount(period)?Number(period):knownAmount(project)?Number(project):null;
  };
  const countries=Object.fromEntries(countryCodes.map(code=>{
    const rows=current.filter(v=>codeOf(v)===code),realizedRows=rows.filter(realized);
    const active=key=>rows.filter(v=>facet(v)[key]===true&&facet(v).cancelled!==true).length;
    const honoraria=realizedRows.map(v=>knownAmount(v.honorario)?Number(v.honorario):configuredHonorarium(code));
    const reimbursements=realizedRows.map(v=>[v.boleto,v.comboAmt]);
    return [code,{total:rows.length,assigned:active('assigned'),scheduled:active('scheduled'),realized:active('realized'),
      questionnaire:active('questionnaire'),submitted:active('submitted'),liquidationConfirmed:active('liquidationConfirmed'),outOfRange:active('outOfRange'),
      finance:{realizedCount:realizedRows.length,honorarioDevengado:honoraria.length>0&&honoraria.every(Number.isFinite)?honoraria.reduce((n,v)=>n+v,0):null,
        knownReimbursements:reimbursements.flat().reduce((n,v)=>n+(knownAmount(v)?Number(v):0),0),
        reimbursementPartial:reimbursements.some(parts=>parts.some(v=>!knownAmount(v)))}}];
  }));
  // Liquidaciones displays all realized work; payable candidates are a different facet.
  const liquidations=current.filter(realized),shoppers=list(snapshot?.shoppers);
  return {countries,finance:Object.fromEntries(countryCodes.map(c=>[c,countries[c].finance])),
    liquidations:{total:liquidations.length,...Object.fromEntries(countryCodes.map(c=>[c,liquidations.filter(v=>codeOf(v)===c).length])),
      paymentsConfirmed:liquidations.filter(v=>facet(v).paymentConfirmed===true).length,
      liquidationsConfirmed:liquidations.filter(v=>facet(v).liquidationConfirmed===true).length},
    shopperPopulation:shoppers.length,sourceHrShopperIds:shoppers.map(v=>String(v.id||v.shopperId||'')).filter(Boolean),identityCases:[],unresolvedIdentityCases:[]};
}
